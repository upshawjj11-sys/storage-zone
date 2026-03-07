import React, { useState } from "react";
import { UNIT_SIZES } from "./itemData";
import { ChevronDown, ChevronUp } from "lucide-react";

const UNIT_DETAILS = [
  {
    label: "5' × 5'",
    ideal: [
      "Boxes of offseason clothing and old toys",
      "Small furniture or appliances",
      "Seasonal decor or equipment such as garden tools and camping gear",
      "Office supplies and business records",
    ],
  },
  {
    label: "5' × 10'",
    ideal: [
      "Mattress sets, dressers, and coffee tables",
      "Artwork, musical instruments, and mid-size electronics",
      "Seasonal decor or equipment such as garden tools, skis, and camping gear",
      "Business supplies, records, or inventory",
    ],
  },
  {
    label: "10' × 10'",
    ideal: [
      "Household furniture such as sofas, tables, dressers, and mattress sets",
      "Electronics and musical instruments",
      "Seasonal decor or equipment such as garden tools, bicycles, and skis",
      "Office equipment such as desks, chairs, and shelves",
    ],
  },
  {
    label: "10' × 15'",
    ideal: [
      "Bulky household furniture such as sofas, dining tables, and bedroom sets",
      "Major appliances such as washers, dryers, and refrigerators",
      "Outdoor equipment such as grills, bicycles, skis, and camping gear",
      "Commercial inventory and office equipment",
    ],
  },
  {
    label: "10' × 20'",
    ideal: [
      "Sectional sofas, dining tables, mattress sets, and entertainment centers",
      "Major appliances such as washers, dryers, and refrigerators",
      "Large musical instruments or equipment such as pianos and large TVs",
      "Outdoor equipment such as lawnmowers, grills, and bicycles",
    ],
  },
  {
    label: "10' × 30'",
    ideal: [
      "Items that aren't easily boxed up",
      "Large household furniture such as sectional sofas and entertainment centers",
      "Major appliances such as washers, dryers, and refrigerators",
      "Outdoor equipment such as lawnmowers, grills, bicycles, and small boats",
    ],
  },
];

export default function UnitSizeCards() {
  const [expanded, setExpanded] = useState("10' × 10'");

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <p className="text-gray-600 text-center mb-8 text-base">
        Browse our available unit sizes and find the right fit for your belongings.
      </p>
      <div className="space-y-3">
        {UNIT_SIZES.map((unit) => {
          const detail = UNIT_DETAILS.find((d) => d.label === unit.label);
          const isOpen = expanded === unit.label;
          return (
            <div key={unit.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition"
                onClick={() => setExpanded(isOpen ? null : unit.label)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1B365D] rounded-xl flex items-center justify-center text-white font-bold text-xs text-center leading-tight">
                    {unit.label.replace("' ×", "x").replace("'", "").replace("'", "")}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{unit.label}</p>
                    <p className="text-sm text-gray-500">{unit.sqft} sq ft · {unit.desc.split(".")[0]}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {isOpen && detail && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  <p className="text-gray-600 mb-3">{unit.desc}</p>
                  <p className="font-semibold text-gray-800 mb-2">Ideal for storing:</p>
                  <ul className="space-y-1">
                    {detail.ideal.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#E8792F] mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}