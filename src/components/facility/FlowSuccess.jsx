import React from "react";
import { Check } from "lucide-react";

export default function FlowSuccess({ title, message, onClose, accentColor = "#16a34a" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: accentColor + "20" }}>
        <Check className="w-10 h-10" style={{ color: accentColor }} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title || "Success!"}</h2>
      <p className="text-gray-600 mb-8 max-w-sm">{message || "Thank you! We'll be in touch shortly."}</p>
      <button
        onClick={onClose}
        className="px-8 py-3 rounded-full font-semibold text-white transition hover:opacity-90"
        style={{ background: accentColor }}
      >
        Close
      </button>
    </div>
  );
}