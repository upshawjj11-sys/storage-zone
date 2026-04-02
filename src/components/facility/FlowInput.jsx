import React from "react";

// Renders an input with the flow's configured input_style
export default function FlowInput({ label, required, inputStyle = "rounded", type = "text", value, onChange, placeholder, children }) {
  const baseClass = "w-full border bg-white text-gray-900 text-sm px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-blue-300";
  const styleMap = {
    rounded: "rounded-lg border-gray-300",
    pill: "rounded-full border-gray-300 px-4",
    underline: "border-0 border-b-2 border-gray-300 rounded-none bg-transparent px-0 focus:ring-0 focus:border-blue-500",
    box: "rounded-none border-gray-400",
  };
  const cls = `${baseClass} ${styleMap[inputStyle] || styleMap.rounded}`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children ? (
        children
      ) : type === "select" ? null : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

export function FlowSelect({ label, required, inputStyle = "rounded", value, onChange, options = [], placeholder }) {
  const baseClass = "w-full border bg-white text-gray-900 text-sm px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-blue-300";
  const styleMap = {
    rounded: "rounded-lg border-gray-300",
    pill: "rounded-full border-gray-300 px-4",
    underline: "border-0 border-b-2 border-gray-300 rounded-none bg-transparent px-0 focus:ring-0 focus:border-blue-500",
    box: "rounded-none border-gray-400",
  };
  const cls = `${baseClass} ${styleMap[inputStyle] || styleMap.rounded}`;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select value={value} onChange={onChange} className={cls}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function FlowTextarea({ label, required, inputStyle = "rounded", value, onChange, placeholder, rows = 3 }) {
  const baseClass = "w-full border bg-white text-gray-900 text-sm px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-blue-300 resize-none";
  const styleMap = {
    rounded: "rounded-lg border-gray-300",
    pill: "rounded-2xl border-gray-300 px-4",
    underline: "border-0 border-b-2 border-gray-300 rounded-none bg-transparent px-0 focus:ring-0 focus:border-blue-500",
    box: "rounded-none border-gray-400",
  };
  const cls = `${baseClass} ${styleMap[inputStyle] || styleMap.rounded}`;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={cls} />
    </div>
  );
}