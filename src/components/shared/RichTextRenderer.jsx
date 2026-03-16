import React, { useMemo } from "react";
import "react-quill/dist/quill.snow.css";

/**
 * Converts Quill v1 flat list HTML into properly nested <ul>/<ol> structures.
 *
 * Quill v1 emits flat <li data-list="bullet|ordered" class="ql-indent-N"> items
 * with NO <ul>/<ol> wrappers. This function rebuilds proper nested list DOM.
 */
function fixQuillLists(html) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root");

  function getIndent(el) {
    for (let i = 1; i <= 8; i++) {
      if (el.classList.contains(`ql-indent-${i}`)) return i;
    }
    return 0;
  }

  function getListType(el) {
    return el.getAttribute("data-list") === "ordered" ? "ol" : "ul";
  }

  function processListItems(items, doc) {
    // items is an array of li elements (flat, in order)
    // Returns a document fragment with properly nested ul/ol
    const fragment = doc.createDocumentFragment();

    let i = 0;
    while (i < items.length) {
      const item = items[i];
      const indent = getIndent(item);
      const tag = getListType(item);

      // Only process items at the current indent level (0)
      if (indent === 0) {
        // Find or create the list for this item
        let list = fragment.lastChild;
        if (!list || list.tagName.toLowerCase() !== tag) {
          list = doc.createElement(tag);
          fragment.appendChild(list);
        }

        // Clone the li, remove data-list attribute
        const li = doc.createElement("li");
        // Move children from original li to new li
        while (item.firstChild) {
          li.appendChild(item.firstChild);
        }

        list.appendChild(li);

        // Collect any following items that are indented (children of this item)
        const children = [];
        let j = i + 1;
        while (j < items.length && getIndent(items[j]) > 0) {
          // Decrease indent by 1 for recursive processing
          const child = items[j];
          const childIndent = getIndent(child);
          // Remove one level of indent
          child.classList.remove(`ql-indent-${childIndent}`);
          if (childIndent - 1 > 0) {
            child.classList.add(`ql-indent-${childIndent - 1}`);
          }
          children.push(child);
          j++;
        }

        if (children.length > 0) {
          const nested = processListItems(children, doc);
          li.appendChild(nested);
          i = j;
        } else {
          i++;
        }
      } else {
        // Shouldn't happen at top level, skip
        i++;
      }
    }

    return fragment;
  }

  // Find all groups of consecutive bare list items and replace them
  let bare = root.querySelector("li[data-list]");
  while (bare) {
    // Collect the entire consecutive sequence
    const sequence = [];
    let node = bare;
    while (node && node.nodeType === Node.ELEMENT_NODE && node.tagName === "LI" && node.hasAttribute("data-list")) {
      sequence.push(node);
      node = node.nextSibling;
    }

    // Build nested list structure
    const nested = processListItems(sequence, doc);

    // Replace the sequence with the nested structure
    bare.parentNode.insertBefore(nested, bare);
    sequence.forEach(el => el.parentNode && el.parentNode.removeChild(el));

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