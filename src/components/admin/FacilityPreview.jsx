import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Star, ChevronDown, ChevronUp, Check, Building2, Facebook, Instagram, Youtube, Twitter, Music } from "lucide-react";
import DynamicIcon from "../home/DynamicIcon";
import ImageSlider from "../shared/ImageSlider";

export default function FacilityPreview({ facility }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [hoursTab, setHoursTab] = useState("office");
  const [aboutExpanded, setAboutExpanded] = useState(false);

  if (!facility) return <div className="flex items-center justify-center h-full text-gray-400">No facility data</div>;

  const ps = facility.page_styles || {};
  const S = {
    page_bg: ps.page_bg || "#ffffff",
    heading_color: ps.heading_color || "#1B365D",
    body_text_color: ps.body_text_color || "#4B5563",
    accent_color: ps.accent_color || "#2A9D8F",
    section_card_bg: ps.section_card_bg || "#F9FAFB",
    section_card_text: ps.section_card_text || "#374151",
    sidebar_bg: ps.sidebar_bg || "#F9FAFB",
    sidebar_heading_color: ps.sidebar_heading_color || "#1B365D",
    sidebar_text_color: ps.sidebar_text_color || "#374151",
    cta_bg: ps.cta_bg || "#1B365D",
    cta_text_color: ps.cta_text_color || "#ffffff",
    cta_button_bg: ps.cta_button_bg || "#E8792F",
    cta_button_text: ps.cta_button_text || "#ffffff",
    hours_active_tab_bg: ps.hours_active_tab_bg || "#1B365D",
    hours_active_tab_text: ps.hours_active_tab_text || "#ffffff",
    faq_border_color: ps.faq_border_color || "#E5E7EB",
    faq_text_color: ps.faq_text_color || "#111827",
    review_card_bg: ps.review_card_bg || "#F9FAFB",
  };

  const isBC = facility.facility_type === "business_center";
  const bannerImages = facility.banner_image
    ? [facility.banner_image]
    : (facility.photos?.length > 0 ? facility.photos : ["https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80"]);

  const DEFAULT_ORDER = ["contact", "about", "features", "units", "photos", "videos", "reviews", "faq", "socials"];
  const rawOrder = facility.sections_order?.length > 0 ? facility.sections_order : DEFAULT_ORDER;
  const parseOrderItem = (item) => typeof item === "string" ? { key: item, visible: true } : { key: item.key, visible: item.visible !== false };
  const sectionsOrder = [
    ...rawOrder.map(parseOrderItem).filter((item) => DEFAULT_ORDER.includes(item.key)),
    ...DEFAULT_ORDER.map((key) => ({ key, visible: true })).filter((item) => !rawOrder.map(parseOrderItem).find((p) => p.key === item.key)),
  ];

  const sectionMap = {
    contact: (facility.address || facility.phone || facility.email) ? (
      <div key="contact" className="grid sm:grid-cols-3 gap-4">
        {facility.address && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: S.section_card_bg }}>
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: S.accent_color }} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: S.body_text_color, opacity: 0.7 }}>Address</p>
              <p className="text-sm font-medium mt-1" style={{ color: S.section_card_text }}>{facility.address}, {facility.city}, {facility.state} {facility.zip}</p>
            </div>
          </div>
        )}
        {facility.phone && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: S.section_card_bg }}>
            <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: S.accent_color }} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: S.body_text_color, opacity: 0.7 }}>Phone</p>
              <p className="text-sm font-medium mt-1" style={{ color: S.section_card_text }}>{facility.phone}</p>
            </div>
          </div>
        )}
        {facility.email && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: S.section_card_bg }}>
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: S.accent_color }} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: S.body_text_color, opacity: 0.7 }}>Email</p>
              <p className="text-sm font-medium mt-1" style={{ color: S.section_card_text }}>{facility.email}</p>
            </div>
          </div>
        )}
      </div>
    ) : null,

    about: facility.about ? (
      <div key="about">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>About This Location</h2>
        {facility.about_collapsible ? (
          <div>
            <p className={`leading-relaxed whitespace-pre-wrap ${!aboutExpanded ? "line-clamp-4" : ""}`} style={{ color: S.body_text_color }}>{facility.about}</p>
            <button onClick={() => setAboutExpanded(!aboutExpanded)} className="mt-2 text-sm font-semibold flex items-center gap-1" style={{ color: S.accent_color }}>
              {aboutExpanded ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Read More</>}
            </button>
          </div>
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap" style={{ color: S.body_text_color }}>{facility.about}</p>
        )}
      </div>
    ) : null,

    features: facility.features?.length > 0 ? (
      <div key="features">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Features & Amenities</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {facility.features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: S.section_card_bg }}>
              <Check className="w-5 h-5 flex-shrink-0" style={{ color: S.accent_color }} />
              <span className="text-sm font-medium" style={{ color: S.section_card_text }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    units: facility.units?.length > 0 ? (
      <div key="units">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>{isBC ? "Available Spaces" : "Available Units"}</h2>
        <div className="space-y-3">
          {facility.units.map((unit, i) => (
            <div key={i} className="p-4 border rounded-xl flex items-center justify-between" style={{ background: S.section_card_bg }}>
              <div>
                <p className="font-semibold" style={{ color: S.heading_color }}>{unit.name || "Unit"}</p>
                <p className="text-sm" style={{ color: S.body_text_color }}>{unit.size} · {unit.unit_type}</p>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: S.accent_color }}>${unit.price}/mo</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${unit.available !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {unit.available !== false ? "Available" : "Occupied"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    photos: facility.photos?.length > 0 ? (
      <div key="photos">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {facility.photos.map((url, i) => (
            <img key={i} src={url} alt="" className="w-full h-48 object-cover rounded-xl" />
          ))}
        </div>
      </div>
    ) : null,

    videos: facility.videos?.length > 0 ? (
      <div key="videos">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Videos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {facility.videos.map((url, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-video">
              <iframe src={url} className="w-full h-full" allowFullScreen />
            </div>
          ))}
        </div>
      </div>
    ) : null,

    reviews: facility.reviews?.length > 0 ? (
      <div key="reviews">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Customer Reviews</h2>
        <div className="space-y-4">
          {facility.reviews.map((r, i) => (
            <div key={i} className="p-5 rounded-xl" style={{ background: S.review_card_bg }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium" style={{ color: S.section_card_text }}>{r.name}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: S.body_text_color }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    faq: facility.faqs?.length > 0 ? (
      <div key="faq">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Frequently Asked Questions</h2>
        <div className="space-y-2">
          {facility.faqs.map((faq, i) => (
            <div key={i} className="border rounded-xl overflow-hidden" style={{ borderColor: S.faq_border_color }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left font-medium" style={{ color: S.faq_text_color }}>
                {faq.question}
                {openFaq === i ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm" style={{ color: S.body_text_color }}>{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    ) : null,

    socials: (facility.google_my_business_url || facility.facebook_url || facility.instagram_url || facility.x_url || facility.tiktok_url || facility.youtube_url) ? (
      <div key="socials">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Follow Us</h2>
        <div className="flex gap-4 flex-wrap">
          {facility.facebook_url && <span className="p-3 rounded-xl" style={{ background: S.section_card_bg }}><Facebook className="w-5 h-5" style={{ color: "#1877F2" }} /></span>}
          {facility.instagram_url && <span className="p-3 rounded-xl" style={{ background: S.section_card_bg }}><Instagram className="w-5 h-5" style={{ color: "#E1306C" }} /></span>}
          {facility.youtube_url && <span className="p-3 rounded-xl" style={{ background: S.section_card_bg }}><Youtube className="w-5 h-5" style={{ color: "#FF0000" }} /></span>}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ background: S.page_bg }}>
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {facility.banner_image
          ? <img src={facility.banner_image} alt="" className="w-full h-full object-cover" />
          : bannerImages[0] && <img src={bannerImages[0]} alt="" className="w-full h-full object-cover" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {isBC && (
            <span className="inline-flex items-center gap-1 bg-[#E8792F] text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">
              <Building2 className="w-3 h-3" /> Business Center
            </span>
          )}
          <h1 className="text-xl md:text-2xl font-black text-white">{facility.banner_title || facility.name || "Facility Name"}</h1>
          <p className="text-white/80 text-sm">{facility.banner_subtitle || [facility.city, facility.state].filter(Boolean).join(", ")}</p>
        </div>
      </div>

      {/* Pillars bar */}
      {facility.show_pillars && facility.pillars?.length > 0 && (
        <div style={{ background: facility.pillars_bg_color || "#1B365D" }}>
          <div className="px-4 overflow-x-auto" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(facility.pillars.length, 5)}, 1fr)` }}>
            {facility.pillars.slice(0, 5).map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-center">
                <DynamicIcon name={item.icon} className="w-4 h-4 flex-shrink-0" style={{ color: item.icon_color || "#E8792F" }} />
                <span className="text-xs font-semibold leading-tight" style={{ color: item.text_color || "#ffffff" }}>{item.text}</span>
                {item.label && <span className="text-[10px] opacity-60 leading-tight" style={{ color: item.text_color || "#ffffff" }}>{item.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {sectionsOrder.map((item) => item.visible !== false && (sectionMap[item.key] || null))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {(facility.hours?.length > 0 || facility.access_hours?.length > 0) && (
              <div className="rounded-2xl p-5" style={{ background: S.sidebar_bg }}>
                <h3 className="font-bold mb-3 flex items-center gap-2 text-sm" style={{ color: S.sidebar_heading_color }}>
                  <Clock className="w-4 h-4" /> Hours
                </h3>
                {facility.hours?.length > 0 && facility.access_hours?.length > 0 && (
                  <div className="flex bg-white border rounded-lg p-0.5 mb-3 text-xs font-semibold">
                    <button onClick={() => setHoursTab("office")} className="flex-1 rounded-md py-1 transition"
                      style={hoursTab === "office" ? { background: S.hours_active_tab_bg, color: S.hours_active_tab_text } : { color: "#6B7280" }}>
                      Office
                    </button>
                    <button onClick={() => setHoursTab("access")} className="flex-1 rounded-md py-1 transition"
                      style={hoursTab === "access" ? { background: S.hours_active_tab_bg, color: S.hours_active_tab_text } : { color: "#6B7280" }}>
                      Access
                    </button>
                  </div>
                )}
                {(() => {
                  const activeHours = hoursTab === "access" && facility.access_hours?.length > 0 ? facility.access_hours : facility.hours || [];
                  const holidayHours = facility.holiday_hours || [];
                  const today = new Date();
                  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                  const next7Dates = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today); d.setDate(today.getDate() + i);
                    return d.toISOString().split("T")[0];
                  });
                  const dayToDate = {};
                  next7Dates.forEach((dateStr) => {
                    const dow = dayNames[new Date(dateStr + "T12:00:00").getDay()];
                    dayToDate[dow] = dateStr;
                  });
                  const holidayByDate = {};
                  holidayHours.forEach((h) => {
                    if (h.applies_to === "both" || h.applies_to === hoursTab) holidayByDate[h.date] = h;
                  });
                  const formatH = (h) => h.closed ? "Closed" : h.is_24_hours ? "24 Hours" : `${h.open} – ${h.close}`;
                  return (
                    <div className="space-y-1.5">
                      {activeHours.map((h, i) => {
                        const date = dayToDate[h.day];
                        const holiday = date ? holidayByDate[date] : null;
                        return (
                          <div key={i} className={`rounded px-1.5 py-1 ${holiday ? "bg-amber-50" : ""}`}>
                            <div className="flex justify-between text-xs">
                              <span className="font-medium" style={{ color: S.sidebar_text_color }}>{h.day}</span>
                              {holiday ? (
                                <span className="font-semibold text-amber-600">📅 {formatH(holiday)}</span>
                              ) : (
                                <span style={{ color: S.sidebar_text_color }}>{formatH(h)}</span>
                              )}
                            </div>
                            {holiday && (
                              <div className="flex justify-between mt-0.5">
                                <span className="text-[10px] text-amber-500">{holiday.label}</span>
                                <span className="text-[10px]" style={{ color: S.sidebar_text_color, opacity: 0.5 }}>Normal: {formatH(h)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="rounded-2xl p-5 text-center" style={{ background: S.cta_bg }}>
              <h3 className="text-lg font-bold mb-1" style={{ color: S.cta_text_color }}>{isBC ? "Interested in a Space?" : "Reserve Your Unit"}</h3>
              <p className="text-xs mb-3" style={{ color: S.cta_text_color, opacity: 0.75 }}>
                {isBC ? "Contact us to schedule a tour." : "No commitment. Cancel anytime."}
              </p>
              <div className="w-full rounded-full font-semibold py-2 text-sm cursor-default" style={{ background: S.cta_button_bg, color: S.cta_button_text }}>
                {isBC ? "Inquire Now" : "Reserve Now"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}