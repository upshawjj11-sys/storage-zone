import React, { useRef } from "react";
import ReactQuill from "react-quill";

// react-quill CSS is already globally imported per platform setup
const FONTS = ["", "Arial", "Georgia", "Tahoma", "Trebuchet MS", "Verdana", "Courier New", "Times New Roman"];

// Register fonts with Quill
if (typeof window !== "undefined") {
  const Quill = ReactQuill.Quill;
  const Font = Quill.import("formats/font");
  Font.whitelist = FONTS.filter(Boolean);
  Quill.register(Font, true);
}

const modules = {
  toolbar: [
    [{ font: FONTS.filter(Boolean) }],
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

export default function RichTextEditor({ value, onChange, placeholder = "Start typing...", minHeight = 200 }) {
  return (
    <div className="rich-text-editor-wrap">
      <style>{`
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