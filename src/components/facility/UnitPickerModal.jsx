import React from "react";
import { X, Check } from "lucide-react";

/**
 * Modal that lets the user pick a unit before entering a flow.
 * Shows available units with name, size, features, price.
 */
export default function UnitPickerModal({ open, onClose, facility, flowType, onSelectUnit }) {
  if (!open || !facility) return null;

  const availableUnits = (facility.units || []).filter((u) => u.available !== false);
  const isBC = facility.facility_type === "business_center";

  const actionLabel = flowType === "rental" ? "Rent Now" : flowType === "reservation" ? "Reserve" : "Inquire";
  const title = flowType === "rental" ? "Select a Unit to Rent" : flowType === "reservation" ? "Select a Unit to Reserve" : "Select a Space to Inquire About";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#1B365D]">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{facility.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Unit list */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {availableUnits.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No available units at this time.</p>
          ) : (
            availableUnits.map((unit, i) => (
              <button
                key={i}
                onClick={() => onSelectUnit(unit)}
                className="w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-200 hover:border-[#E8792F] hover:bg-orange-50/40 transition group"
              >
                {/* Unit info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1B365D] text-sm leading-tight">
                    {unit.name}{unit.size && unit.size !== unit.name ? ` — ${unit.size}` : ""}
                  </p>
                  {unit.unit_type && (
                    <p className="text-xs text-gray-500 mt-0.5">{unit.unit_type}</p>
                  )}
                  {unit.features?.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 mt-1.5">
                      {unit.features.slice(0, 3).map((f, fi) => (
                        <span key={fi} className="flex items-center gap-1 text-xs text-gray-500">
                          <Check className="w-3 h-3 text-[#2A9D8F]" />{f}
                        </span>
                      ))}
                      {unit.features.length > 3 && (
                        <span className="text-xs text-gray-400">+{unit.features.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Price + action */}
                <div className="flex-shrink-0 text-right">
                  {unit.price > 0 && (
                    <p className="font-black text-[#1B365D] text-lg leading-none">
                      ${unit.price.toLocaleString()}
                      <span className="text-xs font-semibold text-gray-400">/mo</span>
                    </p>
                  )}
                  <span
                    className="inline-block mt-2 px-3 py-1.5 rounded-full text-xs font-bold transition"
                    style={{ background: "#E8792F", color: "#fff" }}
                  >
                    {actionLabel} →
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}