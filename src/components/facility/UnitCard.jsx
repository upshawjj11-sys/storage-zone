import React from "react";
import { Check, Info } from "lucide-react";

/**
 * Clean row-style unit card inspired by leading storage sites.
 * Layout: [Name + features] | [Price] | [Action buttons]
 * Works for both self_storage and business_center.
 */
export default function UnitCard({ unit, facilityType, facilityId, unitIndex, onAction, accentColor, buttonBg, buttonText }) {
  const isBC = facilityType === "business_center";
  const moreInfoUrl = `/UnitDetailPage?facility=${facilityId}&unit=${unitIndex}`;

  const primary = "#1B365D";
  const orange = buttonBg || "#E8792F";
  const orangeText = buttonText || "#ffffff";
  const accent = accentColor || "#2A9D8F";

  const unavailable = unit.available === false;

  return (
    <div className={`border-b last:border-b-0 py-5 ${unavailable ? "opacity-50" : ""}`}
      style={{ borderColor: "#E5E7EB" }}>
      <div className="flex items-center gap-4">

        {/* Left: Name, size, features */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-lg leading-tight" style={{ color: primary }}>
              {unit.name}
              {unit.size && unit.size !== unit.name ? ` ${unit.size}` : ""}
            </p>
            {/* Open/Closed badge for BC */}
            {isBC && unit.show_is_open && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${unit.is_open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                ● {unit.is_open ? "Open" : "Closed"}
              </span>
            )}
          </div>

          {/* Unit type */}
          {unit.unit_type && (
            <p className="text-sm text-gray-500 mb-1.5">{unit.unit_type}</p>
          )}

          {/* Features as checkmarks */}
          {unit.features?.length > 0 && (
            <ul className="space-y-0.5">
              {unit.features.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accent }} />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Center: Price */}
        {unit.price > 0 && (
          <div className="text-right flex-shrink-0 hidden sm:block" style={{ minWidth: "110px" }}>
            <p className="text-2xl font-black" style={{ color: primary }}>
              ${unit.price.toLocaleString()}
              <span className="text-sm font-semibold text-gray-500">/mo</span>
            </p>
            {!isBC && !unavailable && (
              <p className="text-xs text-gray-400 mt-0.5">Starting price</p>
            )}
          </div>
        )}

        {/* Right: Action buttons */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          {/* Price (mobile only) */}
          {unit.price > 0 && (
            <p className="text-lg font-black sm:hidden" style={{ color: primary }}>
              ${unit.price.toLocaleString()}<span className="text-xs font-semibold text-gray-500">/mo</span>
            </p>
          )}

          {unavailable ? (
            <span className="text-xs text-gray-400 font-medium px-3 py-1.5 rounded-full bg-gray-100">Occupied</span>
          ) : isBC ? (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => onAction(unit, "inquiry")}
                className="px-5 py-2.5 rounded-full font-bold text-sm transition hover:opacity-90 whitespace-nowrap"
                style={{ background: orange, color: orangeText }}
              >
                Inquire Now
              </button>
              {unit.show_more_info && facilityId != null && (
                <a
                  href={moreInfoUrl}
                  className="flex items-center gap-1 text-xs font-medium hover:underline mt-0.5"
                  style={{ color: primary }}
                >
                  <Info className="w-3 h-3" /> More Info
                </a>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => onAction(unit, "rental")}
                className="px-5 py-2.5 rounded-full font-bold text-sm transition hover:opacity-90 whitespace-nowrap"
                style={{ background: orange, color: orangeText }}
              >
                Rent Now
              </button>
              <button
                onClick={() => onAction(unit, "reservation")}
                className="text-xs font-semibold hover:underline transition"
                style={{ color: primary }}
              >
                Reserve · No Obligation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}