import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

// Renders a weekly hours editor with Open/Closed and 24-hour toggles
export default function HoursEditor({ hours, onChange }) {
  const update = (i, patch) => {
    const next = [...hours];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const copyFromPrev = (i) => {
    if (i === 0) return;
    const prev = hours[i - 1];
    const next = [...hours];
    next[i] = { ...next[i], closed: prev.closed, is_24_hours: prev.is_24_hours, open: prev.open, close: prev.close };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {hours.map((h, i) => (
        <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="w-24 font-medium text-sm text-gray-700 flex-shrink-0">{h.day}</span>

          {/* Open/Closed toggle */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Switch
              checked={!h.closed}
              onCheckedChange={(v) => update(i, { closed: !v, is_24_hours: v ? h.is_24_hours : false })}
            />
            <span className="text-xs text-gray-500">{h.closed ? "Closed" : "Open"}</span>
          </div>

          {!h.closed && (
            <>
              {/* 24-hour toggle */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Switch
                  checked={!!h.is_24_hours}
                  onCheckedChange={(v) => update(i, { is_24_hours: v, open: v ? "" : h.open, close: v ? "" : h.close })}
                />
                <span className="text-xs text-gray-500">24 hrs</span>
              </div>

              {!h.is_24_hours && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Input
                    className="w-28 h-8 text-sm"
                    value={h.open}
                    placeholder="9:00 AM"
                    onChange={(e) => update(i, { open: e.target.value })}
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <Input
                    className="w-28 h-8 text-sm"
                    value={h.close}
                    placeholder="6:00 PM"
                    onChange={(e) => update(i, { close: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          {/* Copy from previous day */}
          {i > 0 && (
            <button
              type="button"
              onClick={() => copyFromPrev(i)}
              title="Copy from previous day"
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-[#1B365D] transition flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" /> Copy prev
            </button>
          )}
        </div>
      ))}
    </div>
  );
}