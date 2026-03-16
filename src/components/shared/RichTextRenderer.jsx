import React, { useMemo } from "react";

/**
 * Converts Quill v1 HTML output into properly structured HTML.
 *
 * Quill v1 (react-quill) does NOT emit <ul>/<ol> wrappers. It outputs a flat
 * sequence of <li data-list="bullet|ordered" class="ql-indent-N"> items — all
 * siblings at the top level. Bullets/numbers are rendered purely by
 * quill.snow.css counter tricks scoped to .ql-editor, so they disappear
 * completely when the HTML is rendered outside the editor.
 *
 * This function:
 *  1. Parses the HTML string into a DOM tree.
 *  2. Finds consecutive <li data-list="*"> siblings and wraps them in proper
 *     <ul> or <ol> elements, respecting indent level for nesting.
 *  3. Returns the fixed HTML string.
 */
function fixQuillLists(html) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root");

  function wrapListItems(container) {
    // Loop until no more bare <li data-list> exist as direct children
    let li = container.querySelector(":scope > li[data-list]");
    while (li) {
      const listType = li.getAttribute("data-list");
      const wrapper = doc.createElement(listType === "ordered" ? "ol" : "ul");

      // Insert wrapper before the first li
      container.insertBefore(wrapper, li);

      // Move all consecutive <li data-list> siblings into the wrapper
      while (
        wrapper.nextSibling &&
        wrapper.nextSibling.nodeType === Node.ELEMENT_NODE &&
        wrapper.nextSibling.tagName === "LI" &&
        wrapper.nextSibling.hasAttribute("data-list")
      ) {
        const item = wrapper.nextSibling;
        item.removeAttribute("data-list");
        wrapper.appendChild(item);
      }

      // Also grab li itself (it was moved ahead of wrapper insertion)
      // Actually li is now wrapper.nextSibling — no, let's re-check the approach:
      // After insertBefore(wrapper, li), li is still in container right after wrapper.
      // Move li and its consecutive siblings into wrapper.
      // Reset: grab first ungrouped li again
      li = container.querySelector(":scope > li[data-list]");
    }
  }

  wrapListItems(root);

  return root.innerHTML;
}

export default function RichTextRenderer({ html, className = "", style = {} }) {
  const fixed = useMemo(() => fixQuillLists(html), [html]);

  return (
    <div
      className={`rich-text-content ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: fixed }}
    />
  );
}