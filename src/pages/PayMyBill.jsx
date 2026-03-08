import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, CreditCard, ChevronRight, ArrowLeft, Search } from "lucide-react";

const DEFAULTS = {
  hero_bg_color: "#1B365D",
  hero_bg_image: "",
  hero_title: "Pay My Bill",
  hero_subtitle: "Select your storage location below to securely access your account and make a payment.",
  hero_title_color: "#ffffff",
  hero_subtitle_color: "#bfdbfe",
  hero_padding_y: "64px",
  hero_show_icon: true,
  hero_icon_bg_color: "rgba(255,255,255,0.1)",
  page_bg_color: "#f9fafb",
  card_bg_color: "#ffffff",
  card_border_color: "#e5e7eb",
  card_border_radius: "1rem",
  card_shadow: "sm",
  card_hover_border_color: "#1B365D",
  card_title_color: "#111827",
  card_subtitle_color: "#6b7280",
  accent_color: "#E8792F",
  portal_header_bg: "#ffffff",
  portal_header_text_color: "#1f2937",
  portal_back_btn_color: "#1B365D",
  pmb_show_search_bar: true,
  pmb_search_bar_placeholder: "Search by name, city, or address...",
  pmb_search_bar_bg: "#ffffff",
  pmb_search_bar_text_color: "#111827",
};

const shadowMap = { none: "none", sm: "0 1px 3px rgba(0,0,0,.1)", md: "0 4px 6px rgba(0,0,0,.1)", lg: "0 10px 15px rgba(0,0,0,.1)", xl: "0 20px 25px rgba(0,0,0,.15)" };

export default function PayMyBill() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const { data: facilities = [], isLoading: facLoading } = useQuery({
    queryKey: ["facilities-payment"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["page-configs-pmb"],
    queryFn: () => base44.entities.PageConfig.filter({ page_key: "pay_my_bill" }),
  });

  const cfg = { ...DEFAULTS, ...(configs[0] || {}) };
  const payableFacilities = facilities
    .filter((f) => f.payment_center_url)
    .filter((f) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        f.name?.toLowerCase().includes(q) ||
        f.city?.toLowerCase().includes(q) ||
        f.state?.toLowerCase().includes(q) ||
        f.address?.toLowerCase().includes(q) ||
        f.zip?.toLowerCase().includes(q)
      );
    });

  const heroStyle = {
    backgroundColor: cfg.hero_bg_color,
    paddingTop: cfg.hero_padding_y,
    paddingBottom: cfg.hero_padding_y,
    ...(cfg.hero_bg_image ? {
      backgroundImage: `url(${cfg.hero_bg_image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    } : {}),
  };

  if (selected) {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
        <div
          className="flex items-center gap-3 px-4 py-3 border-b shadow-sm flex-shrink-0"
          style={{ backgroundColor: cfg.portal_header_bg, color: cfg.portal_header_text_color }}
        >
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm font-medium transition hover:opacity-70"
            style={{ color: cfg.portal_back_btn_color }}
          >
            <ArrowLeft className="w-4 h-4" />
            Change Location
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: cfg.accent_color }} />
            <span className="font-semibold text-sm" style={{ color: cfg.portal_header_text_color }}>{selected.name}</span>
            {selected.city && (
              <span className="text-xs text-gray-400">— {selected.city}, {selected.state}</span>
            )}
          </div>
        </div>
        <iframe
          src={selected.payment_center_url}
          title={`Payment Portal – ${selected.name}`}
          className="flex-1 w-full border-0"
          allow="payment"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cfg.page_bg_color }}>
      {/* Hero */}
      <div style={heroStyle} className="px-6 text-center">
        {cfg.hero_bg_image && (
          <div className="absolute inset-0" style={{ backgroundColor: cfg.hero_bg_image_overlay || "rgba(0,0,0,0.4)" }} />
        )}
        <div className="max-w-2xl mx-auto relative">
          {cfg.hero_show_icon && (
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{ backgroundColor: cfg.hero_icon_bg_color }}
            >
              <CreditCard className="w-7 h-7" style={{ color: cfg.hero_title_color }} />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: cfg.hero_title_color }}>
            {cfg.hero_title}
          </h1>
          <p className="text-lg" style={{ color: cfg.hero_subtitle_color }}>
            {cfg.hero_subtitle}
          </p>
        </div>
      </div>

      {/* Search bar */}
      {cfg.pmb_show_search_bar !== false && (
        <div className="max-w-2xl mx-auto px-6 -mt-6 relative z-10">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-md border border-gray-100"
            style={{ backgroundColor: cfg.pmb_search_bar_bg }}
          >
            <Search className="w-5 h-5 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={cfg.pmb_search_bar_placeholder}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: cfg.pmb_search_bar_text_color }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            )}
          </div>
        </div>
      )}

      {/* Facility list */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {facLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : payableFacilities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-40" />
            {search.trim() ? (
              <>
                <p className="text-lg font-medium">No locations match "{search}"</p>
                <p className="text-sm mt-1">Try a different name, city, or address.</p>
                <button onClick={() => setSearch("")} className="mt-4 text-sm font-semibold underline" style={{ color: cfg.accent_color }}>Clear search</button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No payment portals configured yet.</p>
                <p className="text-sm mt-1">Please contact us directly for payment assistance.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium mb-5 text-center" style={{ color: cfg.card_subtitle_color }}>
              {payableFacilities.length} location{payableFacilities.length !== 1 ? "s" : ""} available
            </p>
            {payableFacilities.map((facility) => (
              <button
                key={facility.id}
                onClick={() => setSelected(facility)}
                style={{
                  backgroundColor: cfg.card_bg_color,
                  borderRadius: cfg.card_border_radius,
                  border: `1px solid ${cfg.card_border_color}`,
                  boxShadow: shadowMap[cfg.card_shadow] || shadowMap.sm,
                }}
                className="w-full flex items-center gap-4 px-5 py-4 text-left group transition-all hover:shadow-md"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = cfg.card_hover_border_color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = cfg.card_border_color}
              >
                {facility.photos?.[0] ? (
                  <img src={facility.photos[0]} alt={facility.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cfg.card_hover_border_color}15` }}>
                    <MapPin className="w-6 h-6" style={{ color: cfg.card_hover_border_color }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: cfg.card_title_color }}>{facility.name}</p>
                  {(facility.address || facility.city) && (
                    <p className="text-sm mt-0.5 truncate" style={{ color: cfg.card_subtitle_color }}>
                      {[facility.address, facility.city, facility.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: cfg.card_subtitle_color }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}