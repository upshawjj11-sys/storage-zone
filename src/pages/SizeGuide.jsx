import React, { useState } from "react";
import UnitCalculator from "../components/sizeguide/UnitCalculator";
import UnitSizeCards from "../components/sizeguide/UnitSizeCards";

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1B365D] text-white py-14 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3">Storage Size Guide</h1>
        <p className="text-blue-200 max-w-2xl mx-auto text-lg">
          Not sure how much space you need? Use our interactive calculator to drag in your items and get a personalized unit size recommendation.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex gap-2 bg-white border rounded-xl p-1 w-fit mx-auto shadow-sm mb-8">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "calculator"
                ? "bg-[#1B365D] text-white shadow"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            🧮 Size Calculator
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "guide"
                ? "bg-[#1B365D] text-white shadow"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            📐 Unit Size Guide
          </button>
        </div>

        {activeTab === "calculator" && <UnitCalculator />}
        {activeTab === "guide" && <UnitSizeCards />}
      </div>
    </div>
  );
}