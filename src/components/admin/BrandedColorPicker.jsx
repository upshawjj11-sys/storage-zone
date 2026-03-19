import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Pipette } from "lucide-react";

/**
 * BrandedColorPicker
 * Props:
 *   value      - current hex color string
 *   onChange   - (hex) => void
 *   label      - optional label text (shown above)
 *   className  - optional wrapper class
 */
export default function BrandedColorPicker({ value, onChange, label, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: branding } = useQuery({
    queryKey: ["branding-kit-swatches"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
      return items[0] || null;
    },
    staleTime: 60000,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = value || "#000000";

  // Build swatch list from branding kit
  const brandSwatches = branding ? [
    { label: "Primary", color: branding.primary_color },
    { label: "Secondary", color: branding.secondary_color },
    { label: "Accent", color: branding.accent_color },
    { label: "Text", color: branding.text_color },
    { label: "Background", color: branding.background_color },
  ].filter((s) => s.color) : [];

  const commonColors = [
    "#ffffff", "#000000", "#F9FAFB", "#F3F4F6", "#E5E7EB",
    "#374151", "#111827", "#1B365D", "#E8792F", "#2A9D8F",
    "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
  ];

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <p className="text-xs text-gray-500 mb-1">{label}</p>}
      <div className="flex items-center gap-2">
        {/* Color preview swatch — click to open */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0 shadow-sm hover:border-gray-400 transition"
          style={{ background: current }}
          title="Pick color"
        />
        {/* Hex input */}
        <Input
          className="w-28 h-8 text-xs font-mono"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
        />
        {/* Native color picker trigger */}
        <label className="cursor-pointer text-gray-400 hover:text-gray-600 transition" title="Open system color picker">
          <Pipette className="w-4 h-4" />
          <input
            type="color"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64">
          {/* Branding Kit swatches */}
          {brandSwatches.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Branding Kit</p>
              <div className="flex gap-2 flex-wrap">
                {brandSwatches.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    title={`${s.label}: ${s.color}`}
                    onClick={() => { onChange(s.color); setOpen(false); }}
                    className="group relative flex flex-col items-center gap-1"
                  >
                    <span
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition block shadow-sm"
                      style={{ background: s.color }}
                    />
                    <span className="text-[9px] text-gray-400 leading-none">{s.label}</span>
                    {current === s.color && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Common colors */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Common Colors</p>
            <div className="flex gap-1.5 flex-wrap">
              {commonColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => { onChange(c); setOpen(false); }}
                  className="w-7 h-7 rounded-md border border-gray-200 hover:border-gray-400 transition shadow-sm flex-shrink-0"
                  style={{
                    background: c,
                    outline: current === c ? "2px solid #3B82F6" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Custom hex entry */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Custom Hex</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={current}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
              />
              <Input
                className="flex-1 h-8 text-xs font-mono"
                value={current}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}