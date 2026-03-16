import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { MapPin, Phone, Mail, Clock, Star, ChevronDown, ChevronUp, Check, ChevronLeft, ChevronRight, Building2, Warehouse, Facebook, Instagram, Youtube, Twitter, Music } from "lucide-react";
import DynamicIcon from "../components/home/DynamicIcon";
import { Badge } from "@/components/ui/badge";
import ImageSlider from "../components/shared/ImageSlider";
import UnitCard from "../components/facility/UnitCard";
import InquiryDialog from "../components/facility/InquiryDialog";

// Helper to build the canonical URL for a facility
export function facilityUrl(facility) {
  if (!facility) return "#";
  const slug = facility.slug;
  // If slug is already a full path (starts with "locations/"), use it directly
  if (slug && slug.startsWith("locations/")) {
    return `/${slug.replace(/\/$/, "")}/`;
  }
  // Otherwise build path from state/city/slug
  const state = (facility.state || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const city = (facility.city || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const idOrSlug = slug || facility.id;
  return `/locations/${state}/${city}/${idOrSlug}/`;
}

export default function FacilityPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const facilityIdParam = urlParams.get("id");

  // Parse slug from path: /locations/[state]/[city]/[slug]/
  // The slug stored in DB may be the full path like "locations/florida/city/slug/" OR just the last segment
  const rawPath = window.location.pathname.replace(/^\//, ""); // strip leading slash
  const pathParts = rawPath.replace(/\/$/, "").split("/").filter(Boolean);
  const slugFromPath = pathParts.length >= 4 ? pathParts[pathParts.length - 1] : null;
  // Full path for matching against facilities that store the full URL as slug
  const fullPathSlug = rawPath; // e.g. "locations/fl/jacksonville/my-slug/"

  const [openFaq, setOpenFaq] = useState(null);
  const [hoursTab, setHoursTab] = useState("office");
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    move_in_date: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: facility, isLoading } = useQuery({
    queryKey: ["facility", facilityIdParam, fullPathSlug],
    queryFn: async () => {
      // Prefer ?id= param (admin preview), then slug from path
      if (facilityIdParam) {
        const items = await base44.entities.Facility.filter({ id: facilityIdParam });
        return items[0];
      }
      if (slugFromPath) {
        // Load all and match: slug may be full path or just last segment or the facility id
        const all = await base44.entities.Facility.list();
        return (
          all.find((f) => f.slug === fullPathSlug) ||          // full path match e.g. "locations/fl/city/slug/"
          all.find((f) => f.slug === fullPathSlug + "/") ||    // with trailing slash
          all.find((f) => f.slug === slugFromPath) ||          // last segment match
          all.find((f) => f.id === slugFromPath) ||            // id match
          null
        );
      }
      return null;
    },
    enabled: !!(facilityIdParam || slugFromPath),
  });

  const { data: nearbyFacilities = [] } = useQuery({
    queryKey: ["nearby-facilities", facility?.id, facility?.latitude, facility?.longitude],
    queryFn: async () => {
      if (!facility?.latitude || !facility?.longitude) return [];
      const allFacilities = await base44.entities.Facility.list();
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      return allFacilities
        .filter((f) => f.id !== facility.id && f.latitude && f.longitude && f.status === "active")
        .map((f) => ({
          ...f,
          distance: calculateDistance(facility.latitude, facility.longitude, f.latitude, f.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
    },
    enabled: !!facility?.latitude && !!facility?.longitude,
  });

  const isBC = facility?.facility_type === "business_center";

  const handleAction = (unit = null) => {
    setSelectedUnit(unit);
    setSubmitted(false);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Reservation.create({
      ...form,
      facility_id: facility.id,
      facility_name: facility.name,
      facility_type: facility.facility_type || "self_storage",
      unit_name: selectedUnit?.name || "",
      unit_size: selectedUnit?.size || "",
      unit_price: selectedUnit?.price || 0,
      unit_type: selectedUnit?.unit_type || selectedUnit?.type || "",
      unit_features: selectedUnit?.features || [],
      reservation_type: isBC ? "inquiry" : "reservation",
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" /></div>;
  if (!facility) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Facility not found.</p></div>;

  // Resolve page styles with defaults
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

  const DEFAULT_ORDER = ["contact", "about", "features", "units", "photos", "videos", "reviews", "faq", "socials"];
  const rawOrder = facility.sections_order?.length > 0 ? facility.sections_order : DEFAULT_ORDER;
  
  // Parse sections order: supports plain strings, "key:hidden" strings, and legacy objects
  const parseOrderItem = (item) => {
    if (typeof item === "string") {
      if (item.endsWith(":hidden")) return { key: item.replace(":hidden", ""), visible: false };
      return { key: item, visible: true };
    }
    return { key: item.key, visible: item.visible !== false };
  };

  const sectionsOrder = [
    ...rawOrder
      .map(parseOrderItem)
      .filter((item) => DEFAULT_ORDER.includes(item.key)),
    ...DEFAULT_ORDER.map((key) => ({ key, visible: true })).filter(
      (item) => !rawOrder.map(parseOrderItem).find((p) => p.key === item.key)
    ),
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
              <a href={`tel:${facility.phone}`} className="text-sm font-medium mt-1 block" style={{ color: S.section_card_text }}>{facility.phone}</a>
            </div>
          </div>
        )}
        {facility.email && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: S.section_card_bg }}>
            <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: S.accent_color }} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: S.body_text_color, opacity: 0.7 }}>Email</p>
              <a href={`mailto:${facility.email}`} className="text-sm font-medium mt-1 block" style={{ color: S.section_card_text }}>{facility.email}</a>
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
            <div
              className={`rich-text-content overflow-hidden transition-all ${!aboutExpanded ? "max-h-24" : ""}`}
              style={{ color: S.body_text_color }}
              dangerouslySetInnerHTML={{ __html: facility.about }}
            />
            <button
              onClick={() => setAboutExpanded(!aboutExpanded)}
              className="mt-2 text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: S.accent_color }}
            >
              {aboutExpanded ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Read More</>}
            </button>
          </div>
        ) : (
          <div
            className="rich-text-content"
            style={{ color: S.body_text_color }}
            dangerouslySetInnerHTML={{ __html: facility.about }}
          />
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

    units: facility.unit_grid_widget_code ? (
      <div key="units">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Available Units</h2>
        <div dangerouslySetInnerHTML={{ __html: facility.unit_grid_widget_code }} />
      </div>
    ) : facility.units?.length > 0 ? (
      <div key="units">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>
          {isBC ? "Available Spaces" : "Available Units"}
        </h2>
        {isBC && (
          <p className="text-sm mb-4" style={{ color: S.body_text_color }}>Select a space below to inquire for more information.</p>
        )}
        <div className="space-y-3">
          {facility.units.map((unit, i) => (
            <UnitCard key={i} unit={unit} facilityType={facility.facility_type} onAction={handleAction} />
          ))}
        </div>
      </div>
    ) : null,

    photos: facility.photos?.length > 0 ? (
      <div key="photos">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Photos</h2>
        {(facility.photos_display_mode || "slider") === "slider" ? (
          <div className="rounded-xl overflow-hidden" style={{ height: "380px", position: "relative" }}>
            <ImageSlider images={facility.photos} />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(facility.photos_collapsible && !photosExpanded
                ? facility.photos.slice(0, 6)
                : facility.photos
              ).map((url, i) => (
                <button key={i} onClick={() => setLightboxIdx(i)} className="overflow-hidden rounded-xl group">
                  <img src={url} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                </button>
              ))}
            </div>
            {facility.photos_collapsible && facility.photos.length > 6 && (
              <button
                onClick={() => setPhotosExpanded(!photosExpanded)}
                className="mt-4 text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition"
                style={{ color: S.accent_color }}
              >
                {photosExpanded
                  ? <><ChevronUp className="w-4 h-4" /> Show Less</>
                  : <><ChevronDown className="w-4 h-4" /> View More ({facility.photos.length - 6} more)</>}
              </button>
            )}
          </div>
        )}
      </div>
    ) : null,

    videos: facility.videos?.length > 0 ? (
      <div key="videos">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Videos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {facility.videos.map((vid, i) => {
            const vidObj = typeof vid === "string" ? { url: vid, title: "" } : vid;
            if (!vidObj.url) return null;
            return (
              <div key={i}>
                {vidObj.title && (
                  <p className="font-semibold mb-2 text-sm" style={{ color: S.heading_color }}>{vidObj.title}</p>
                )}
                <div className="rounded-xl overflow-hidden aspect-video">
                  <iframe
                    src={vidObj.url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            );
          })}
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
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left font-medium hover:opacity-80 transition" style={{ color: S.faq_text_color }}>
                {faq.question}
                {openFaq === i ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: S.body_text_color }}>{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    ) : null,

    socials: facility.google_my_business_url || facility.facebook_url || facility.instagram_url || facility.x_url || facility.tiktok_url || facility.youtube_url ? (
      <div key="socials">
        <h2 className="text-2xl font-bold mb-4" style={{ color: S.heading_color }}>Follow Us</h2>
        <div className="flex gap-4 flex-wrap">
          {facility.google_my_business_url && (
            <a href={facility.google_my_business_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl hover:opacity-75 transition" style={{ background: S.section_card_bg }}>
              <MapPin className="w-5 h-5" style={{ color: S.accent_color }} />
            </a>
          )}
          {facility.facebook_url && (
            <a href={facility.facebook_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl hover:opacity-75 transition" style={{ background: S.section_card_bg }}>
              <Facebook className="w-5 h-5" style={{ color: "#1877F2" }} />
            </a>
          )}
          {facility.instagram_url && (
            <a href={facility.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl hover:opacity-75 transition" style={{ background: S.section_card_bg }}>
              <Instagram className="w-5 h-5" style={{ color: "#E1306C" }} />
            </a>
          )}
          {facility.x_url && (
            <a href={facility.x_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl hover:opacity-75 transition" style={{ background: S.section_card_bg }}>
              <Twitter className="w-5 h-5" style={{ color: "#000000" }} />
            </a>
          )}
          {facility.tiktok_url && (
            <a href={facility.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl hover:opacity-75 transition" style={{ background: S.section_card_bg }}>
              <Music className="w-5 h-5" style={{ color: "#000000" }} />
            </a>
          )}
          {facility.youtube_url && (
            <a href={facility.youtube_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl hover:opacity-75 transition" style={{ background: S.section_card_bg }}>
              <Youtube className="w-5 h-5" style={{ color: "#FF0000" }} />
            </a>
          )}
        </div>
      </div>
    ) : null,
  };

  // Banner: use dedicated banner_image first, then photos, then fallback
  const bannerImages = facility.banner_image
    ? [facility.banner_image]
    : (facility.photos?.length > 0 ? facility.photos : ["https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80"]);

  const nb = facility.notice_bar;

  return (
    <div style={{ background: S.page_bg }}>
      {/* Notice Bar */}
      {nb?.enabled && nb?.text && (
        <div className="w-full px-4 py-2.5 text-sm text-center" style={{ background: nb.bg_color || "#E8792F", color: nb.text_color || "#ffffff" }}>
          <span style={{ fontWeight: nb.bold ? "bold" : "normal", fontStyle: nb.italic ? "italic" : "normal", textDecoration: nb.underline ? "underline" : "none" }}>
            {nb.text}
          </span>
        </div>
      )}
      {/* Banner Slider */}
      <div className="relative h-[40vh] md:h-[55vh]" style={facility.banner_image ? { backgroundImage: `url(${facility.banner_image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
        {!facility.banner_image && <ImageSlider images={bannerImages} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            {isBC && (
              <span className="inline-flex items-center gap-1.5 bg-[#E8792F] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Building2 className="w-3.5 h-3.5" /> Business Center
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{facility.banner_title || facility.name}</h1>
            <p className="text-white/80 text-lg">{facility.banner_subtitle || `${facility.city}, ${facility.state}`}</p>
          </div>
        </div>
      </div>

      {/* Pillars bar */}
      {facility.show_pillars && facility.pillars?.length > 0 && (
        <div style={{ background: facility.pillars_bg_color || "#1B365D" }}>
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 divide-x divide-white/10 overflow-x-auto"
            style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(facility.pillars.length, 5)}, 1fr)` }}
          >
            {facility.pillars.slice(0, 5).map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-center min-w-0">
                <DynamicIcon name={item.icon} className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: item.icon_color || "#E8792F" }} />
                <span className="text-[10px] sm:text-xs font-semibold leading-tight break-words w-full" style={{ color: item.text_color || "#ffffff" }}>{item.text}</span>
                {item.label && <span className="text-[9px] sm:text-xs opacity-60 leading-tight break-words w-full" style={{ color: item.text_color || "#ffffff" }}>{item.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
           <div className="lg:col-span-2 space-y-12">
             {sectionsOrder.map((item) => item.visible !== false && (sectionMap[item.key] || null))}
           </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {(facility.hours?.length > 0 || facility.access_hours?.length > 0) && (
                <div className="rounded-2xl p-6" style={{ background: S.sidebar_bg }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: S.sidebar_heading_color }}>
                    <Clock className="w-5 h-5" style={{ color: S.sidebar_heading_color }} /> Hours
                  </h3>
                  {facility.hours?.length > 0 && facility.access_hours?.length > 0 && (
                    <div className="flex bg-white border rounded-lg p-0.5 mb-4 text-xs font-semibold">
                      <button
                        onClick={() => setHoursTab("office")}
                        className="flex-1 rounded-md py-1.5 transition"
                        style={hoursTab === "office" ? { background: S.hours_active_tab_bg, color: S.hours_active_tab_text } : { color: "#6B7280" }}
                      >Office Hours</button>
                      <button
                        onClick={() => setHoursTab("access")}
                        className="flex-1 rounded-md py-1.5 transition"
                        style={hoursTab === "access" ? { background: S.hours_active_tab_bg, color: S.hours_active_tab_text } : { color: "#6B7280" }}
                      >Access Hours</button>
                    </div>
                  )}
                  {(() => {
                    const activeHours = hoursTab === "access" && facility.access_hours?.length > 0 ? facility.access_hours : facility.hours || [];
                    const holidayHours = facility.holiday_hours || [];
                    // Build a map of date -> holiday for the next 7 days
                    const today = new Date();
                    const next7Dates = Array.from({ length: 7 }, (_, i) => {
                      const d = new Date(today); d.setDate(today.getDate() + i);
                      return d.toISOString().split("T")[0];
                    });
                    // Map day-of-week name to upcoming date
                    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                    const dayToDate = {};
                    next7Dates.forEach((dateStr) => {
                      const dow = dayNames[new Date(dateStr + "T12:00:00").getDay()];
                      dayToDate[dow] = dateStr;
                    });
                    // Build holiday lookup by date
                    const holidayByDate = {};
                    holidayHours.forEach((h) => {
                      if (h.applies_to === "both" || h.applies_to === hoursTab) {
                        holidayByDate[h.date] = h;
                      }
                    });
                    const formatH = (h) => h.closed ? "Closed" : h.is_24_hours ? "24 Hours" : `${h.open} – ${h.close}`;
                    return (
                      <div className="space-y-2">
                        {activeHours.map((h, i) => {
                          const date = dayToDate[h.day];
                          const holiday = date ? holidayByDate[date] : null;
                          const isToday = date === today.toISOString().split("T")[0];
                          return (
                            <div key={i} className={`rounded-lg px-2 py-1.5 ${isToday ? "bg-white/60 ring-1 ring-inset ring-amber-200" : ""}`}>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium" style={{ color: S.sidebar_text_color }}>
                                  {h.day}{isToday && <span className="ml-1.5 text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Today</span>}
                                </span>
                                {holiday ? (
                                  <span className="font-semibold text-amber-600">
                                    📅 {formatH(holiday)}
                                  </span>
                                ) : (
                                  <span className="font-medium" style={{ color: S.sidebar_text_color }}>{formatH(h)}</span>
                                )}
                              </div>
                              {holiday && (
                                <div className="flex justify-between mt-0.5">
                                  <span className="text-[11px] text-amber-500 font-medium">{holiday.label}</span>
                                  <span className="text-[11px]" style={{ color: S.sidebar_text_color, opacity: 0.5 }}>
                                    Normal: {formatH(h)}
                                  </span>
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
               {nearbyFacilities.length > 0 && (
                 <div className="rounded-2xl p-6" style={{ background: S.sidebar_bg }}>
                   <h3 className="font-bold mb-4" style={{ color: S.sidebar_heading_color }}>Other Locations Nearby</h3>
                   <div className="space-y-3">
                     {nearbyFacilities.map((nf) => (
                       <a
                         key={nf.id}
                         href={facilityUrl(nf)}
                         className="block p-3 rounded-xl border transition hover:border-orange-300 hover:bg-white/50"
                         style={{ borderColor: S.faq_border_color }}
                       >
                         <p className="font-semibold text-sm" style={{ color: S.sidebar_heading_color }}>{nf.name}</p>
                         <p className="text-xs mt-1" style={{ color: S.sidebar_text_color }}>{nf.city}, {nf.state}</p>
                         <p className="text-xs font-medium mt-1" style={{ color: S.accent_color }}>{nf.distance.toFixed(1)} miles away</p>
                       </a>
                     ))}
                   </div>
                 </div>
               )}
               <div className="rounded-2xl p-6 text-center" style={{ background: S.cta_bg }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: S.cta_text_color }}>
                  {isBC ? "Interested in a Space?" : "Reserve Your Unit"}
                </h3>
                <p className="text-sm mb-4" style={{ color: S.cta_text_color, opacity: 0.75 }}>
                  {isBC ? "Contact us to schedule a tour or get more info." : "No commitment. Cancel anytime."}
                </p>
                <button
                  className="w-full rounded-full font-semibold py-3 transition hover:opacity-90"
                  style={{ background: S.cta_button_bg, color: S.cta_button_text }}
                  onClick={() => handleAction(null)}
                >
                  {isBC ? "Inquire Now" : "Reserve Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20">✕</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-2 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + facility.photos.length) % facility.photos.length); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={facility.photos[lightboxIdx]} alt="" className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-2 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % facility.photos.length); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <InquiryDialog
        open={showDialog}
        onOpenChange={(v) => { setShowDialog(v); if (!v) setSubmitted(false); }}
        facility={facility}
        selectedUnit={selectedUnit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        submitted={submitted}
        onSubmit={handleSubmit}
      />
    </div>
  );
}