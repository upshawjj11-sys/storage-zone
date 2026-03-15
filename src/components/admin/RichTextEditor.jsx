import React, { useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const FONTS = [
  "Arial", "Georgia", "Tahoma", "Trebuchet MS", "Verdana",
  "Courier New", "Times New Roman", "Impact", "Comic Sans MS",
  "Palatino Linotype", "Book Antiqua", "Garamond", "Gill Sans",
  "Helvetica", "Lucida Sans", "Optima", "Futura", "Baskerville",
  "Cambria", "Candara", "Century Gothic", "Consolas", "Constantia",
  "Corbel", "Franklin Gothic Medium", "Gill Sans MT", "Lucida Console",
  "Microsoft Sans Serif", "Rockwell", "Segoe UI"
];

// Register fonts with Quill once
if (typeof window !== "undefined") {
  try {
    const Quill = ReactQuill.Quill;
    const Font = Quill.import("formats/font");
    Font.whitelist = FONTS;
    Quill.register(Font, true);
  } catch (_) {}
}

const modules = {
  toolbar: [
    [{ font: FONTS }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "font", "size",
  "bold", "italic", "underline", "strike",
  "color", "background",
  "align",
  "list", "bullet", "indent",
  "blockquote", "code-block",
  "link",
];

// Build CSS for all fonts (applied via ql-font-* classes)
const fontCss = FONTS.map(f => {
  const cls = f.toLowerCase().replace(/\s+/g, "-");
  return `.ql-font-${cls} { font-family: '${f}', sans-serif; }`;
}).join("\n");

export default function RichTextEditor({ value, onChange, placeholder = "Start typing...", minHeight = 200 }) {
  return (
    <div className="rich-text-editor-wrap">
      <style>{`
        ${fontCss}
        .rich-text-editor-wrap .ql-container {
          min-height: ${minHeight}px;
          font-size: 14px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor-wrap .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
          border-color: #e5e7eb;
          flex-wrap: wrap;
        }
        .rich-text-editor-wrap .ql-editor {
          min-height: ${minHeight}px;
        }
        .rich-text-editor-wrap .ql-container {
          border-color: #e5e7eb;
        }
        .rich-text-editor-wrap .ql-toolbar .ql-stroke {
          stroke: #4b5563;
        }
        .rich-text-editor-wrap .ql-toolbar .ql-fill {
          fill: #4b5563;
        }
        .rich-text-editor-wrap .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrap .ql-toolbar button.ql-active .ql-stroke {
          stroke: #1B365D;
        }
        .rich-text-editor-wrap .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrap .ql-toolbar button.ql-active .ql-fill {
          fill: #1B365D;
        }
        .rich-text-editor-wrap .ql-toolbar button.ql-active,
        .rich-text-editor-wrap .ql-toolbar .ql-picker-label.ql-active {
          color: #1B365D;
        }
        .rich-text-editor-wrap .ql-picker.ql-font .ql-picker-label::before,
        .rich-text-editor-wrap .ql-picker.ql-font .ql-picker-item::before {
          content: attr(data-value) !important;
        }
        ${FONTS.map(f => {
          const cls = f.toLowerCase().replace(/\s+/g, "-");
          return `.rich-text-editor-wrap .ql-picker.ql-font .ql-picker-item[data-value="${f}"]::before { font-family: '${f}', sans-serif; }`;
        }).join("\n")}
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}