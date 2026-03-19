import React from "react";
import { Button } from "@/components/ui/button";
import BrandedColorPicker from "./BrandedColorPicker";

const DEFAULTS = {
  page_bg: "#ffffff",
  heading_color: "#1B365D",
  body_text_color: "#4B5563",
  accent_color: "#2A9D8F",
  section_card_bg: "#F9FAFB",
  section_card_text: "#374151",
  sidebar_bg: "#F9FAFB",
  sidebar_heading_color: "#1B365D",
  sidebar_text_color: "#374151",
  cta_bg: "#1B365D",
  cta_text_color: "#ffffff",
  cta_button_bg: "#E8792F",
  cta_button_text: "#ffffff",
  hours_active_tab_bg: "#1B365D",
  hours_active_tab_text: "#ffffff",
  faq_border_color: "#E5E7EB",
  faq_text_color: "#111827",
  review_card_bg: "#F9FAFB",
};

const GROUPS = [
  {
    label: "Page",
    items: [
      { key: "page_bg", label: "Page Background" },
      { key: "heading_color", label: "Section Headings" },
      { key: "body_text_color", label: "Body Text" },
      { key: "accent_color", label: "Icons & Checkmarks" },
    ],
  },
  {
    label: "Info Cards / Boxes",
    items: [
      { key: "section_card_bg", label: "Card Background" },
      { key: "section_card_text", label: "Card Text" },
    ],
  },
  {
    label: "Hours Sidebar",
    items: [
      { key: "sidebar_bg", label: "Sidebar Background" },
      { key: "sidebar_heading_color", label: "Sidebar Heading" },
      { key: "sidebar_text_color", label: "Sidebar Text" },
      { key: "hours_active_tab_bg", label: "Active Tab Background" },
      { key: "hours_active_tab_text", label: "Active Tab Text" },
    ],
  },
  {
    label: "CTA / Reserve Box",
    items: [
      { key: "cta_bg", label: "Box Background" },
      { key: "cta_text_color", label: "Box Text" },
      { key: "cta_button_bg", label: "Button Background" },
      { key: "cta_button_text", label: "Button Text" },
    ],
  },
  {
    label: "FAQ",
    items: [
      { key: "faq_border_color", label: "Item Border" },
      { key: "faq_text_color", label: "Question Text" },
    ],
  },
  {
    label: "Reviews",
    items: [
      { key: "review_card_bg", label: "Review Card Background" },
    ],
  },
];

function ColorRow({ label, colorKey, value, onChange }) {
  const val = value || DEFAULTS[colorKey];
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-700">{label}</span>
      <BrandedColorPicker value={val} onChange={(v) => onChange(colorKey, v)} />
    </div>
  );
}

export default function FacilityStyleEditor({ styles, onChange }) {
  const s = styles || {};
  const update = (key, val) => onChange({ ...s, [key]: val });
  const resetAll = () => onChange({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Customize every color on the facility page. Leave unchanged to use the default theme.</p>
        <Button variant="outline" size="sm" className="text-xs" onClick={resetAll}>Reset All to Defaults</Button>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} className="bg-gray-50 rounded-xl p-4 border">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{group.label}</h4>
          <div className="divide-y divide-gray-100">
            {group.items.map((item) => (
              <ColorRow
                key={item.key}
                label={item.label}
                colorKey={item.key}
                value={s[item.key]}
                onChange={update}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { DEFAULTS as STYLE_DEFAULTS };