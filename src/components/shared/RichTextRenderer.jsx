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

  // Keep processing until there are no more bare Quill list items
  let bare = root.querySelector("li[data-list]");
  while (bare) {
    const listType = bare.getAttribute("data-list"); // "bullet" or "ordered"
    const tag = listType === "ordered" ? "ol" : "ul";
    const wrapper = doc.createElement(tag);

    // Place wrapper before the first bare li
    bare.parentNode.insertBefore(wrapper, bare);

    // Move bare and all consecutive bare siblings into the wrapper
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

    bare = root.querySelector("li[data-list]");
  }

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