import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Star, ChevronRight, ArrowRight } from "lucide-react";
import DynamicIcon from "../home/DynamicIcon";
import ReactMarkdown from "react-markdown";
import ImageSlider from "../shared/ImageSlider";

export default function HomePagePreview({ config }) {
  const { data: facilities = [] } = useQuery({
    queryKey: ["home-facilities-preview"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
  });

  const { data: branding = {} } = useQuery({
    queryKey: ["branding-preview"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
      return items[0] || {};
    },
  });

  const primaryColor = branding?.primary_color || "#1B365D";
  const secondaryColor = branding?.secondary_color || "#E8792F";

  const visibleSections = (config?.sections || [])
    .filter((s) => s.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const heroPillarsSection = visibleSections.find((s) => s.type === "pillars");
  const sectionsWithoutHeroPillars = visibleSections.filter((s) => s !== heroPillarsSection);

  const renderDisclaimer = (section) => {
    const d = section.data?.disclaimer;
    if (!d?.enabled || !d?.text) return null;
    const sizeMap = { xs: "0.7rem", sm: "0.8rem", base: "1rem", lg: "1.125rem" };
    const styleMap = {
      normal: {},
      italic: { fontStyle: "italic" },
      bold: { fontWeight: "700" },
      "bold-italic": { fontWeight: "700", fontStyle: "italic" },
    };
    return (
      <div style={{ textAlign: d.align || "center", paddingBottom: "1rem" }}>
        <p style={{
          fontSize: sizeMap[d.size || "xs"],
          color: d.color || "#6b7280",
          fontFamily: d.font === "inherit" || !d.font ? undefined : d.font,
          ...(styleMap[d.style || "normal"]),
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "0 1rem",
        }}>{d.text}</p>
      </div>
    );
  };

  const renderSection = (section) => {
    const data = section.data || {};
    const cols = data.columns || 4;
    const colClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-3 lg:grid-cols-5" }[cols] || "sm:grid-cols-2 lg:grid-cols-4";

    switch (section.type) {
      case "pillars": {
        const style = data.style || "banner";
        const items = data.items || [];
        if (!items.length) return null;
        if (style === "cards") return (
          <section key={section.id} style={{ background: section.bg_color || "#f8fafc" }} className="py-10">
            <div className="max-w-5xl mx-auto px-4">
              {section.title && <h2 className="text-2xl font-bold text-center mb-6" style={{ color: primaryColor }}>{section.title}</h2>}
              <div className={`grid ${colClass} gap-4`}>
                {items.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${item.icon_color || secondaryColor}15` }}>
                      <DynamicIcon name={item.icon} className="w-5 h-5" style={{ color: item.icon_color || secondaryColor }} />
                    </div>
                    <p className="font-semibold text-sm" style={{ color: item.text_color || "#1f2937" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
        if (style === "minimal") return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-6 border-y border-gray-100">
            <div className="max-w-5xl mx-auto px-4">
              <div className={`grid ${colClass} gap-4`}>
                {items.map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center px-2 gap-1">
                    <DynamicIcon name={item.icon} className="w-5 h-5" style={{ color: item.icon_color || secondaryColor }} />
                    <span className="text-sm font-semibold" style={{ color: item.text_color || "#374151" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
        // banner (default)
        return (
          <section key={section.id} style={{ background: section.bg_color || primaryColor }} className="py-5">
            <div className="max-w-5xl mx-auto px-4">
              <div className={`grid ${colClass} gap-4`}>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.icon_color || secondaryColor}30` }}>
                      <DynamicIcon name={item.icon} className="w-4 h-4" style={{ color: item.icon_color || secondaryColor }} />
                    </div>
                    <span className="font-semibold text-sm leading-tight" style={{ color: item.text_color || "#ffffff" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "features": {
        const items = data.items || [];
        return (
          <section key={section.id} style={{ background: section.bg_color || "#f8fafc" }} className="py-14">
            <div className="max-w-5xl mx-auto px-4">
              {section.title && <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primaryColor }}>{section.title}</h2>}
              {section.subtitle && <p className="text-center text-gray-500 mb-8">{section.subtitle}</p>}
              <div className="grid md:grid-cols-3 gap-6">
                {(items.length ? items : [
                  { icon: "Shield", title: "24/7 Security", desc: "State-of-the-art surveillance." },
                  { icon: "Clock", title: "Flexible Access", desc: "Access on your schedule." },
                  { icon: "MapPin", title: "Multiple Locations", desc: "Convenient locations near you." },
                ]).map((f, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${secondaryColor}15`, color: secondaryColor }}>
                      <DynamicIcon name={f.icon || "Shield"} className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold mb-1 text-sm" style={{ color: primaryColor }}>{f.title}</h3>
                    <p className="text-gray-500 text-xs">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "locations": {
        if (!facilities.length) return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-10">
            <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 text-sm">No active facilities yet</div>
          </section>
        );
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-14">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8" style={{ color: primaryColor }}>{section.title || "Our Locations"}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.slice(0, 6).map((f) => (
                  <div key={f.id} className="bg-white rounded-xl overflow-hidden border border-gray-100">
                    <div className="h-32 bg-gray-100 overflow-hidden">
                      <img src={f.banner_image || f.photos?.[0] || "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80"} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1" style={{ color: primaryColor }}>{f.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{f.city}, {f.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "testimonials": {
        const items = data.items || [];
        if (!items.length) return null;
        const tCols = data.columns || 3;
        const tColClass = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3" }[tCols] || "md:grid-cols-3";
        const starColor = data.star_color || "#facc15";
        const cardBg = data.card_bg || "#ffffff";
        const textColor = data.text_color || "#374151";
        const sectionBg = section.bg_color || "#f8fafc";
        return (
          <section key={section.id} style={{ background: sectionBg }} className="py-14">
            <div className="max-w-5xl mx-auto px-4">
              {section.title && <h2 className="text-2xl font-bold text-center mb-8" style={{ color: primaryColor }}>{section.title}</h2>}
              <div className={`grid ${tColClass} gap-4`}>
                {items.map((t, i) => (
                  <div key={i} className="p-5 rounded-xl shadow-sm" style={{ background: cardBg }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: t.avatar_color || primaryColor }}>{(t.name || "?")[0]}</div>
                      <div>
                        <p className="font-semibold text-xs" style={{ color: textColor }}>{t.name}</p>
                        {t.location && <p className="text-xs opacity-60" style={{ color: textColor }}>{t.location}</p>}
                      </div>
                    </div>
                    <div className="flex mb-2">{[...Array(Math.max(1, Math.min(5, t.rating || 5)))].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" style={{ color: starColor }} />)}</div>
                    <p className="text-xs leading-relaxed" style={{ color: textColor }}>"{t.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "cta_banner":
        return (
          <section key={section.id} className="py-14" style={{ background: data.bg_color || primaryColor }}>
            <div className="max-w-3xl mx-auto px-4 text-center">
              {section.title && <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>}
              {data.body && <p className="text-white/70 mb-6 text-sm">{data.body}</p>}
              {data.cta_text && (
                <button className="px-8 py-3 rounded-full font-semibold text-sm" style={{ background: secondaryColor, color: "#fff" }}>
                  {data.cta_text} <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </section>
        );

      case "text_block":
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-10">
            <div className={`max-w-3xl mx-auto px-4 text-${data.align || "left"}`}>
              {section.title && <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>{section.title}</h2>}
              {data.content && <div className="prose prose-sm max-w-none"><ReactMarkdown>{data.content}</ReactMarkdown></div>}
            </div>
          </section>
        );

      case "stats": {
        const items = data.items || [];
        if (!items.length) return null;
        return (
          <section key={section.id} style={{ background: section.bg_color || primaryColor }} className="py-12">
            <div className="max-w-5xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {items.map((s, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black text-white">{s.value}</p>
                    <p className="text-white/60 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "faq": {
        const items = data.items || [];
        if (!items.length) return null;
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-10">
            <div className="max-w-3xl mx-auto px-4">
              {section.title && <h2 className="text-2xl font-bold text-center mb-6" style={{ color: primaryColor }}>{section.title}</h2>}
              <div className="space-y-2">
                {items.map((faq, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
                    {faq.answer && <p className="text-xs text-gray-500 mt-1">{faq.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "two_column": {
        const renderCol = (col) => {
          if (!col) return null;
          switch (col.type) {
            case "image":
              return col.image_url
                ? <img src={col.image_url} alt={col.alt || ""} className="w-full object-cover rounded-xl" />
                : <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">[Image]</div>;
            case "image_slider":
              return (col.images || []).length > 0
                ? <div className="h-52"><ImageSlider images={col.images} /></div>
                : <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">[Slider]</div>;
            case "features":
              return (
                <div className="space-y-3">
                  {(col.items || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${secondaryColor}15`, color: secondaryColor }}>
                        <DynamicIcon name={f.icon || "Check"} className="w-4 h-4" />
                      </div>
                      <div>
                        {f.title && <p className="font-semibold text-sm text-gray-900">{f.title}</p>}
                        {f.desc && <p className="text-xs text-gray-500">{f.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            case "testimonials": {
              const starColor = col.star_color || "#facc15";
              return (
                <div className="space-y-3">
                  {(col.items || []).map((t, i) => (
                    <div key={i} className="p-4 rounded-xl shadow-sm" style={{ background: col.card_bg || "#ffffff" }}>
                      <div className="flex mb-1">{[...Array(Math.max(1, Math.min(5, t.rating || 5)))].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" style={{ color: starColor }} />)}</div>
                      <p className="text-xs" style={{ color: col.text_color || "#374151" }}>"{t.text}"</p>
                      <p className="font-semibold text-xs mt-1" style={{ color: col.text_color || "#374151" }}>{t.name}</p>
                    </div>
                  ))}
                </div>
              );
            }
            default:
              return (
                <div className={`text-${col.align || "left"}`}>
                  {col.heading && <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>{col.heading}</h2>}
                  {col.content && <div className="prose prose-sm max-w-none text-gray-600"><ReactMarkdown>{col.content}</ReactMarkdown></div>}
                </div>
              );
          }
        };
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-14">
            <div className="max-w-5xl mx-auto px-4">
              {section.title && <h2 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>{section.title}</h2>}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>{renderCol(data.left)}</div>
                <div>{renderCol(data.right)}</div>
              </div>
            </div>
          </section>
        );
      }

      default: return null;
    }
  };

  const heroImages = config?.hero_images?.length > 0 ? config.hero_images : (config?.hero_image ? [config.hero_image] : []);
  const heroImage = heroImages[0];
  const opacity = config?.hero_overlay_opacity ?? 0.6;

  return (
    <div className="bg-white text-sm overflow-y-auto h-full">
      {/* Simplified Hero */}
      <div className="relative h-52 overflow-hidden" style={{ background: primaryColor }}>
        {heroImage && <img src={heroImage} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${opacity})` }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {config?.hero_badge_text && (
            <span className="text-xs font-bold px-3 py-1 rounded-full mb-3" style={{ background: secondaryColor, color: "#fff" }}>{config.hero_badge_text}</span>
          )}
          {config?.hero_title && <h1 className="text-2xl font-black text-white mb-2">{config.hero_title}</h1>}
          {config?.hero_subtitle && <p className="text-white/80 text-sm max-w-lg">{config.hero_subtitle}</p>}
        </div>
      </div>

      {/* Hero pillars bar */}
      {heroPillarsSection && (() => {
        const items = heroPillarsSection.data?.items || [];
        if (!items.length) return null;
        return (
          <div style={{ background: heroPillarsSection.bg_color || primaryColor }} className="py-4 px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <DynamicIcon name={item.icon} className="w-4 h-4" style={{ color: item.icon_color || secondaryColor }} />
                  <span className="text-xs font-semibold" style={{ color: item.text_color || "#fff" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Sections */}
      {sectionsWithoutHeroPillars.map((section) => {
        const inner = renderSection(section);
        if (!inner) return null;
        const disclaimer = renderDisclaimer(section);
        if (!disclaimer) return inner;
        return (
          <div key={section.id} style={{ background: section.bg_color || undefined }}>
            {React.cloneElement(inner, { style: { ...inner.props?.style, paddingBottom: "0.25rem" }, key: undefined })}
            {disclaimer}
          </div>
        );
      })}

      {sectionsWithoutHeroPillars.length === 0 && !heroPillarsSection && (
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          Add sections on the left to see a preview here
        </div>
      )}
    </div>
  );
}