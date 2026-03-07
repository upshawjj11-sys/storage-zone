import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import UnitCalculator from "../components/sizeguide/UnitCalculator";
import UnitSizeCards from "../components/sizeguide/UnitSizeCards";
import { ITEM_CATEGORIES } from "../components/sizeguide/itemData";

const DEFAULT_CONFIG = {
  hero_title: "Storage Size Guide",
  hero_subtitle: "Not sure how much space you need? Use our interactive calculator to drag in your items and get a personalized unit size recommendation.",
  hero_bg_color: "#1B365D",
  hero_title_color: "#ffffff",
  hero_subtitle_color: "#bfdbfe",
  tab_calculator_label: "🧮 Size Calculator",
  tab_guide_label: "📐 Unit Size Guide",
  active_tab_bg: "#1B365D",
  active_tab_text: "#ffffff",
  recommendation_bg: "#1B365D",
  recommendation_text: "#ffffff",
  cta_text: "Find a Location →",
  cta_link: "/locations",
  cta_bg: "#E8792F",
  cta_text_color: "#ffffff",
  categories: null,
};

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState("calculator");

  const { data: configs } = useQuery({
    queryKey: ["size-guide-config"],
    queryFn: () => base44.entities.SizeGuideConfig.list(),
    initialData: [],
  });

  const saved = configs?.find((c) => c.page_key === "size_guide");
  const cfg = { ...DEFAULT_CONFIG, ...(saved || {}) };
  const categories = cfg.categories?.length ? cfg.categories : ITEM_CATEGORIES.map((cat, ci) => ({
    id: `cat-${ci}`, label: cat.label, icon: cat.icon, items: cat.items,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="py-14 px-6 text-center" style={{ background: cfg.hero_bg_color }}>
        <h1 className="text-4xl font-bold mb-3" style={{ color: cfg.hero_title_color }}>
          {cfg.hero_title}
        </h1>
        <p className="max-w-2xl mx-auto text-lg" style={{ color: cfg.hero_subtitle_color }}>
          {cfg.hero_subtitle}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex gap-2 bg-white border rounded-xl p-1 w-fit mx-auto shadow-sm mb-8">
          <button
            onClick={() => setActiveTab("calculator")}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === "calculator"
              ? { background: cfg.active_tab_bg, color: cfg.active_tab_text }
              : { color: "#6b7280" }}
          >
            {cfg.tab_calculator_label}
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === "guide"
              ? { background: cfg.active_tab_bg, color: cfg.active_tab_text }
              : { color: "#6b7280" }}
          >
            {cfg.tab_guide_label}
          </button>
        </div>

        {activeTab === "calculator" && <UnitCalculator categories={categories} cfg={cfg} />}
        {activeTab === "guide" && <UnitSizeCards />}
      </div>
    </div>
  );
}