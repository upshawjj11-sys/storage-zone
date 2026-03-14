import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Shield, Clock, ArrowRight, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DynamicIcon from "../components/home/DynamicIcon";
import ReactMarkdown from "react-markdown";
import HeroCarousel from "../components/home/HeroCarousel";
import ImageSlider from "../components/shared/ImageSlider";

export default function Home() {
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["home-config"],
    queryFn: async () => {
      const items = await base44.entities.HomePageConfig.list();
      return items[0] || {};
    },
  });

  const { data: facilities } = useQuery({
    queryKey: ["home-facilities"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  const { data: branding } = useQuery({
    queryKey: ["branding"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
      return items[0] || {};
    },
  });

  const primaryColor = branding?.primary_color || "#1B365D";
  const secondaryColor = branding?.secondary_color || "#E8792F";

  const hasSections = config?.sections?.length > 0;
  const visibleSections = (config?.sections || [])
    .filter((s) => s.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // The first pillars section is embedded inside the hero carousel
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
      <div style={{ textAlign: d.align || "center", paddingBottom: "1.25rem" }}>
        <p style={{
          fontSize: sizeMap[d.size || "xs"],
          color: d.color || "#6b7280",
          fontFamily: d.font === "inherit" || !d.font ? undefined : d.font,
          ...(styleMap[d.style || "normal"]),
          maxWidth: "56rem",
          margin: "0 auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}>
          {d.text}
        </p>
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
        if (style === "banner") return (
          <section key={section.id} style={{ background: section.bg_color || primaryColor }} className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {(section.title || section.subtitle) && (
                <div className="text-center mb-6">
                  {section.title && <h2 className="text-2xl font-bold text-white">{section.title}</h2>}
                  {section.subtitle && <p className="text-white/70 mt-1">{section.subtitle}</p>}
                </div>
              )}
              <div className={`grid ${colClass} gap-4`}>
               {items.map((item, i) => (
                 <div key={i} className="flex items-center gap-3 text-white">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.icon_color || secondaryColor}30` }}>
                     <DynamicIcon name={item.icon} className="w-5 h-5" style={{ color: item.icon_color || secondaryColor }} />
                   </div>
                   <span className="font-semibold text-sm leading-tight" style={{ color: item.text_color || undefined }}>{item.text}</span>
                 </div>
               ))}
              </div>
            </div>
          </section>
        );
        if (style === "cards") return (
          <section key={section.id} style={{ background: section.bg_color || "#f8fafc" }} className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {(section.title || section.subtitle) && (
                <div className="text-center mb-10">
                  {section.title && <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>{section.title}</h2>}
                  {section.subtitle && <p className="text-gray-500 mt-2">{section.subtitle}</p>}
                </div>
              )}
              <div className={`grid ${colClass} gap-6`}>
               {items.map((item, i) => (
                 <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition">
                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${item.icon_color || secondaryColor}15` }}>
                     <DynamicIcon name={item.icon} className="w-7 h-7" style={{ color: item.icon_color || secondaryColor }} />
                   </div>
                   <p className="font-semibold" style={{ color: item.text_color || "#1f2937" }}>{item.text}</p>
                 </div>
               ))}
              </div>
            </div>
          </section>
        );
        // minimal
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-10 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className={`grid ${colClass} gap-4 divide-x divide-gray-100`}>
               {items.map((item, i) => (
                 <div key={i} className="flex flex-col items-center text-center px-4 gap-2">
                   <DynamicIcon name={item.icon} className="w-6 h-6" style={{ color: item.icon_color || secondaryColor }} />
                   <span className="text-sm font-semibold" style={{ color: item.text_color || "#374151" }}>{item.text}</span>
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
          <section key={section.id} style={{ background: section.bg_color || "#f8fafc" }} className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {(section.title || section.subtitle) && (
                <div className="text-center mb-14">
                  {section.title && <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>{section.title}</h2>}
                  {section.subtitle && <p className="text-gray-500 mt-2">{section.subtitle}</p>}
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-8">
                {(items.length ? items : [
                  { icon: "Shield", title: "24/7 Security", desc: "State-of-the-art surveillance and gated access." },
                  { icon: "Clock", title: "Flexible Access", desc: "Access your unit on your schedule." },
                  { icon: "MapPin", title: "Multiple Locations", desc: "Convenient locations near you." },
                ]).map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all border border-gray-100 group">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ background: `${secondaryColor}15`, color: secondaryColor }}>
                      <DynamicIcon name={f.icon || "Shield"} className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "locations": {
        if (!facilities.length) return null;
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>{section.title || "Our Locations"}</h2>
                  {section.subtitle && <p className="text-gray-500 mt-2">{section.subtitle}</p>}
                </div>
                <Link to={createPageUrl("Locations")} className="hidden md:flex items-center gap-1 font-semibold text-sm" style={{ color: secondaryColor }}>View All <ChevronRight className="w-4 h-4" /></Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.slice(0, 6).map((f) => (
                  <Link key={f.id} to={createPageUrl("FacilityPage") + `?id=${f.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img src={f.banner_image || f.photos?.[0] || "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80"} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-1" style={{ color: primaryColor }}>{f.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" />{f.city}, {f.state}</p>
                      {f.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {f.features.slice(0, 3).map((feat, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{feat}</span>)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }
      case "testimonials": {
        const items = data.items || [];
        if (!items.length) return null;
        const tStyle = data.style || "cards";
        const tCols = data.columns || 3;
        const tColClass = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3" }[tCols] || "md:grid-cols-3";
        const starColor = data.star_color || "#facc15";
        const cardBg = data.card_bg || (tStyle === "dark" ? "#1e293b" : "#ffffff");
        const textColor = data.text_color || (tStyle === "dark" ? "#e2e8f0" : "#374151");
        const sectionBg = section.bg_color || (tStyle === "dark" ? primaryColor : "#f8fafc");

        const renderTestimonialCard = (t, i) => {
          if (tStyle === "quote") return (
            <div key={i} className="p-8 rounded-2xl" style={{ background: cardBg }}>
              <div className="text-5xl font-serif mb-4" style={{ color: starColor }}>"</div>
              <p className="text-lg leading-relaxed mb-6 italic" style={{ color: textColor }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: t.avatar_color || primaryColor }}>{(t.name||"?")[0]}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p>
                  {t.location && <p className="text-xs opacity-60" style={{ color: textColor }}>{t.location}</p>}
                </div>
              </div>
            </div>
          );
          if (tStyle === "minimal") return (
            <div key={i} className="p-6 border-l-4 rounded-r-xl" style={{ borderColor: starColor, background: cardBg }}>
              <div className="flex mb-2">{[...Array(Math.max(1, Math.min(5, t.rating||5)))].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: starColor }} />)}</div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: textColor }}>"{t.text}"</p>
              <p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p>
              {t.location && <p className="text-xs opacity-60" style={{ color: textColor }}>{t.location}</p>}
            </div>
          );
          // cards (default) and dark
          return (
            <div key={i} className="p-6 rounded-2xl shadow-sm" style={{ background: cardBg }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: t.avatar_color || primaryColor }}>{(t.name||"?")[0]}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: textColor }}>{t.name}</p>
                  {t.location && <p className="text-xs opacity-60" style={{ color: textColor }}>{t.location}</p>}
                </div>
              </div>
              <div className="flex mb-3">{[...Array(Math.max(1, Math.min(5, t.rating||5)))].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" style={{ color: starColor }} />)}</div>
              <p className="text-sm leading-relaxed" style={{ color: textColor }}>"{t.text}"</p>
            </div>
          );
        };

        return (
          <section key={section.id} style={{ background: sectionBg }} className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {section.title && <h2 className="text-3xl font-bold text-center mb-12" style={{ color: tStyle === "dark" ? "#fff" : primaryColor }}>{section.title}</h2>}
              {section.subtitle && <p className="text-center mb-10 opacity-70" style={{ color: tStyle === "dark" ? "#fff" : "#6b7280" }}>{section.subtitle}</p>}
              <div className={`grid ${tColClass} gap-6`}>
                {items.map(renderTestimonialCard)}
              </div>
            </div>
          </section>
        );
      }
      case "cta_banner": {
        return (
          <section key={section.id} className="py-20" style={{ background: data.bg_color || primaryColor }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              {section.title && <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{section.title}</h2>}
              {data.body && <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">{data.body}</p>}
              {data.cta_text && (
                <Link to={data.cta_url || createPageUrl("Locations")}>
                  <Button size="lg" className="rounded-full text-base px-10 py-6 font-semibold shadow-xl" style={{ background: secondaryColor }}>
                    {data.cta_text} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </section>
        );
      }
      case "text_block": {
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-16">
            <div className={`max-w-4xl mx-auto px-4 sm:px-6 text-${data.align || "left"}`}>
              {section.title && <h2 className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>{section.title}</h2>}
              {data.content && <div className="prose prose-gray max-w-none"><ReactMarkdown>{data.content}</ReactMarkdown></div>}
            </div>
          </section>
        );
      }
      case "stats": {
        const items = data.items || [];
        if (!items.length) return null;
        return (
          <section key={section.id} style={{ background: section.bg_color || primaryColor }} className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {items.map((s, i) => (
                  <div key={i}>
                    <p className="text-4xl font-black text-white">{s.value}</p>
                    <p className="text-white/60 text-sm mt-1">{s.label}</p>
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
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              {section.title && <h2 className="text-3xl font-bold text-center mb-10" style={{ color: primaryColor }}>{section.title}</h2>}
              <div className="space-y-3">
                {items.map((faq, i) => (
                  <details key={i} className="group border rounded-xl">
                    <summary className="cursor-pointer p-4 font-medium text-gray-900 list-none flex items-center justify-between">
                      {faq.question}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-gray-600">{faq.answer}</div>
                  </details>
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
              return col.image_url ? (
                <img src={col.image_url} alt={col.alt || ""} className="w-full h-full object-cover rounded-2xl" />
              ) : null;
            case "image_slider": {
              if (!(col.images || []).length) return null;
              const perSlide = col.per_slide || 1;
              if (perSlide === 2) {
                const [slideIdx, setSlideIdx] = React.useState(0);
                const imgs = col.images;
                const total = Math.ceil(imgs.length / 2);
                const pair = imgs.slice(slideIdx * 2, slideIdx * 2 + 2);
                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      {pair.map((img, i) => <img key={i} src={img} alt="" className="w-full h-52 object-cover rounded-xl" />)}
                    </div>
                    {total > 1 && (
                      <div className="flex justify-center gap-2 mt-2">
                        {Array.from({ length: total }).map((_, i) => (
                          <button key={i} onClick={() => setSlideIdx(i)} className={`w-2 h-2 rounded-full transition ${i === slideIdx ? "bg-gray-700" : "bg-gray-300"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return <div className="h-72 md:h-full min-h-[280px]"><ImageSlider images={col.images} /></div>;
            }
            case "features":
              return (
                <div className="space-y-5">
                  {(col.items || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${secondaryColor}15`, color: secondaryColor }}>
                        <DynamicIcon name={f.icon || "Check"} className="w-5 h-5" />
                      </div>
                      <div>
                        {f.title && <p className="font-semibold text-gray-900">{f.title}</p>}
                        {f.desc && <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            case "testimonials": {
              const tItems = col.items || [];
              const cStarColor = col.star_color || "#facc15";
              const cCardBg = col.card_bg || "#ffffff";
              const cTextColor = col.text_color || "#374151";
              return (
                <div className="space-y-4">
                  {tItems.map((t, i) => (
                    <div key={i} className="p-5 rounded-2xl shadow-sm" style={{ background: cCardBg }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: t.avatar_color || primaryColor }}>{(t.name||"?")[0]}</div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: cTextColor }}>{t.name}</p>
                          {t.location && <p className="text-xs opacity-60" style={{ color: cTextColor }}>{t.location}</p>}
                        </div>
                      </div>
                      <div className="flex mb-2">{[...Array(Math.max(1, Math.min(5, t.rating||5)))].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: cStarColor }} />)}</div>
                      <p className="text-sm leading-relaxed" style={{ color: cTextColor }}>"{t.text}"</p>
                    </div>
                  ))}
                </div>
              );
            }
            case "text_block":
            default:
              return (
                <div className={`text-${col.align || "left"}`}>
                  {col.heading && <h2 className="text-3xl font-bold mb-4" style={{ color: primaryColor }}>{col.heading}</h2>}
                  {col.content && <div className="prose prose-gray max-w-none text-gray-600"><ReactMarkdown>{col.content}</ReactMarkdown></div>}
                </div>
              );
          }
        };
        return (
          <section key={section.id} style={{ background: section.bg_color || "#fff" }} className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {(section.title || section.subtitle) && (
                <div className="text-center mb-12">
                  {section.title && <h2 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>{section.title}</h2>}
                  {section.subtitle && <p className="text-gray-500">{section.subtitle}</p>}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-10 items-center">
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

  const renderSectionWithDisclaimer = (section) => {
    const inner = renderSection(section);
    if (!inner) return null;
    const disclaimer = renderDisclaimer(section);
    if (!disclaimer) return inner;
    return (
      <div key={section.id} style={{ background: section.bg_color || undefined }}>
        {React.cloneElement(inner, { style: { ...inner.props?.style, paddingBottom: "0.5rem" }, key: undefined })}
        {disclaimer}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Hero with carousel + pillars */}
      <HeroCarousel
        config={config}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        pillarsSection={heroPillarsSection}
      />

      {/* Dynamic sections (pillars already rendered in hero, skip it) */}
      {hasSections ? (
        sectionsWithoutHeroPillars.map(renderSectionWithDisclaimer)
      ) : (
        <>
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>Why Choose {branding?.site_name || "Storage Zone"}?</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[{ icon: "Shield", title: "24/7 Security", desc: "State-of-the-art surveillance, gated access, and individually alarmed units." }, { icon: "Clock", title: "Flexible Access", desc: "Access your storage unit on your schedule with convenient hours and keypad entry." }, { icon: "MapPin", title: "Multiple Locations", desc: "Convenient locations near you with drive-up access and loading docks." }].map((f, i) => (
                  <div key={i} className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all border border-gray-100 group">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ background: `${secondaryColor}15`, color: secondaryColor }}>
                      <DynamicIcon name={f.icon} className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {facilities.length > 0 && (
            <section className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-12">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>Our Locations</h2>
                    <p className="text-gray-500 mt-2">Find a convenient location near you</p>
                  </div>
                  <Link to={createPageUrl("Locations")} className="hidden md:flex items-center gap-1 font-semibold text-sm" style={{ color: secondaryColor }}>View All <ChevronRight className="w-4 h-4" /></Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {facilities.slice(0, 6).map((f) => (
                    <Link key={f.id} to={createPageUrl("FacilityPage") + `?id=${f.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        <img src={f.banner_image || f.photos?.[0] || "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80"} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-1" style={{ color: primaryColor }}>{f.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" />{f.city}, {f.state}</p>
                        {f.features?.length > 0 && <div className="flex flex-wrap gap-1.5">{f.features.slice(0, 3).map((feat, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{feat}</span>)}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
          <section className="py-20" style={{ background: primaryColor }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">Reserve your storage unit online today. No commitment required.</p>
              <Link to={createPageUrl("Locations")}>
                <Button size="lg" className="rounded-full text-base px-10 py-6 font-semibold shadow-xl" style={{ background: secondaryColor }}>Find Storage Near You <ArrowRight className="w-5 h-5 ml-2" /></Button>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}