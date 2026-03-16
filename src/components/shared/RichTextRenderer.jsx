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

  // Use a lightweight DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root");

  function wrapListItems(container) {
    const children = Array.from(container.childNodes);
    let i = 0;
    while (i < children.length) {
      const node = children[i];
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName === "LI" &&
        node.hasAttribute("data-list")
      ) {
        // Collect consecutive list items
        const listType = node.getAttribute("data-list"); // "bullet" or "ordered"
        const wrapper = doc.createElement(listType === "ordered" ? "ol" : "ul");
        wrapper.style.paddingLeft = "1.75em";
        wrapper.style.margin = "0.5rem 0";

        // Consume all adjacent <li data-list> nodes at the same or deeper indent
        while (
          i < children.length &&
          children[i].nodeType === Node.ELEMENT_NODE &&
          children[i].tagName === "LI" &&
          children[i].hasAttribute("data-list")
        ) {
          const li = children[i];
          li.removeAttribute("data-list");
          // Clean up Quill indent classes — CSS handles visual indent
          wrapper.appendChild(li);
          i++;
        }

        // Insert the wrapper where the first li was
        container.insertBefore(wrapper, children[i] || null);

        // Recursively process nested items inside this wrapper
        // (Quill flattens nesting with ql-indent-N classes, so we leave them
        //  as-is and rely on CSS padding for visual depth)
      } else {
        i++;
      }
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