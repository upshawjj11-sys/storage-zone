import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone } from "lucide-react";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

function getVideoEmbed(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function HeroBlock({ data }) {
  const style = {
    backgroundColor: data.bg_color || "#1B365D",
    backgroundImage: data.image ? `url(${data.image})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return (
    <div className={`relative ${data.padding_y || "py-20"} text-center`} style={style}>
      {data.image && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {data.title && <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: data.title_color || "#ffffff" }}>{data.title}</h1>}
        {data.subtitle && <p className="text-base md:text-lg" style={{ color: data.subtitle_color || "#e2e8f0" }}>{data.subtitle}</p>}
      </div>
    </div>
  );
}

function HeadingBlock({ data }) {
  const Tag = data.level || "h2";
  const sizeMap = { h1: "text-3xl md:text-4xl font-black", h2: "text-2xl font-bold", h3: "text-xl font-semibold", h4: "text-lg font-semibold" };
  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-1" style={{ textAlign: data.align || "left" }}>
      <Tag className={sizeMap[Tag] || "text-2xl font-bold"} style={{ color: data.color || "#111827" }}>
        {data.text}
      </Tag>
    </div>
  );
}

function DividerBlock({ data }) {
  const borderStyle = { line: "solid", thick: "solid", dashed: "dashed", dots: "dotted" }[data.style || "line"] || "solid";
  const borderWidth = data.style === "thick" ? "2px" : "1px";
  return (
    <div className={`max-w-4xl mx-auto px-6 ${data.margin || "my-8"}`}>
      <hr style={{ borderTopStyle: borderStyle, borderTopWidth: borderWidth, borderColor: data.color || "#E5E7EB" }} />
    </div>
  );
}

function TextBlock({ data }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <RichTextRenderer html={data.content} style={{ textAlign: data.align || "left" }} />
    </div>
  );
}

function ImageBlock({ data }) {
  if (!data.url) return <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-300 text-sm">[Image block — no URL set]</div>;
  const widthClass = { full: "w-full", large: "max-w-3xl", medium: "max-w-xl", small: "max-w-sm" }[data.width || "full"] || "w-full";
  return (
    <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col items-center">
      <img src={data.url} alt={data.alt || ""} className={`${widthClass} rounded-xl shadow-md`} />
      {data.caption && <p className="text-sm text-gray-500 mt-2 text-center">{data.caption}</p>}
    </div>
  );
}

function ColumnContent({ type, data }) {
  switch (type) {
    case "text":
      return <RichTextRenderer html={data.content} />;
    case "image":
      return data.url
        ? <img src={data.url} alt={data.alt || ""} className="w-full rounded-xl shadow-md" />
        : <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">[Image]</div>;
    case "video": {
      const embedUrl = getVideoEmbed(data.url);
      return embedUrl
        ? <div className="aspect-video rounded-xl overflow-hidden"><iframe src={embedUrl} className="w-full h-full" allowFullScreen title="video" /></div>
        : <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">[Video]</div>;
    }
    case "embed":
      return <div style={{ height: data.height || "300px" }} dangerouslySetInnerHTML={{ __html: data.code || "" }} />;
    default:
      return null;
  }
}

function TwoColumnBlock({ data }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className={`grid grid-cols-1 md:grid-cols-2 ${data.gap || "gap-8"} ${data.valign || "items-start"}`}>
        <div><ColumnContent type={data.left_type || "text"} data={data.left_data || {}} /></div>
        <div><ColumnContent type={data.right_type || "image"} data={data.right_data || {}} /></div>
      </div>
    </div>
  );
}

function FeaturesGridBlock({ data }) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" }[data.cols || 3] || "grid-cols-3";
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {data.title && <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">{data.title}</h2>}
      {data.subtitle && <p className="text-center text-gray-500 mb-6">{data.subtitle}</p>}
      <div className={`grid ${colClass} gap-4`}>
        {(data.items || []).map((item, i) => (
          <div key={i} className="text-center p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            {item.icon && <div className="text-3xl mb-2">{item.icon}</div>}
            {item.title && <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>}
            {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBlock({ data }) {
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {(data.items || []).map((item, i) => (
          <div key={i}>
            <div className="text-3xl font-bold text-[#1B365D]">{item.value}</div>
            <div className="text-gray-500 mt-1 text-sm">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTABlock({ data }) {
  return (
    <div className="py-12 text-center" style={{ backgroundColor: data.bg_color || "#E8792F" }}>
      <div className="max-w-3xl mx-auto px-6">
        {data.title && <h2 className="text-2xl font-bold mb-2" style={{ color: data.text_color || "#fff" }}>{data.title}</h2>}
        {data.subtitle && <p className="mb-5 text-sm" style={{ color: data.text_color || "#fff" }}>{data.subtitle}</p>}
        {data.button_text && (
          <button className="px-6 py-2.5 rounded-full font-semibold transition hover:opacity-90"
            style={{ backgroundColor: data.button_bg || "#ffffff", color: data.button_text_color || "#E8792F" }}>
            {data.button_text}
          </button>
        )}
      </div>
    </div>
  );
}

function FAQBlock({ data }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {data.title && <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{data.title}</h2>}
      <div className="space-y-2">
        {(data.items || []).map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button className="w-full text-left px-5 py-3.5 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 text-sm"
              onClick={() => setOpen(open === i ? null : i)}>
              {item.question}<span>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-5 pb-4 text-gray-600 text-sm">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoBlock({ data }) {
  const embedUrl = getVideoEmbed(data.url);
  if (!embedUrl) return <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-300 text-sm">[Video block — no URL set]</div>;
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {data.title && <h2 className="text-xl font-bold text-center mb-4">{data.title}</h2>}
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={data.title || "video"} />
      </div>
    </div>
  );
}

function GalleryBlock({ data }) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" }[data.cols || 3] || "grid-cols-3";
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className={`grid ${colClass} gap-3`}>
        {(data.images || []).map((img, i) => (
          <img key={i} src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
        ))}
        {(data.images || []).length === 0 && <p className="col-span-3 text-center text-gray-300 text-sm">[Gallery — no images added]</p>}
      </div>
    </div>
  );
}

function TestimonialsBlock({ data }) {
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {data.title && <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data.items || []).map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex mb-2">{Array.from({ length: item.rating || 5 }).map((_, s) => <span key={s} className="text-yellow-400">★</span>)}</div>
              <p className="text-gray-600 mb-3 text-sm">"{item.text}"</p>
              <p className="font-semibold text-gray-900 text-sm">— {item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactFormBlock({ data }) {
  const [formConfig, setFormConfig] = useState(null);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    if (data.form_id) {
      base44.entities.FormConfig.filter({ id: data.form_id }).then(res => {
        if (res && res.length > 0) setFormConfig(res[0]);
      });
    }
    base44.entities.Facility.list("name", 100).then(setFacilities);
  }, [data.form_id]);

  if (!data.form_id) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center text-gray-400 text-sm">
        [Contact Form — no form selected]
      </div>
    );
  }

  if (!formConfig) {
    return <div className="max-w-3xl mx-auto px-6 py-10 text-center text-gray-300 text-sm">Loading form...</div>;
  }

  const ci = formConfig.contact_info || {};
  const hasContactInfo = ci.phone || ci.email || ci.address || ci.hours;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {formConfig.title && <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">{formConfig.title}</h2>}
      {formConfig.subtitle && <p className="text-center text-gray-500 mb-6 text-sm">{formConfig.subtitle}</p>}
      <div className={`grid gap-10 ${hasContactInfo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-xl mx-auto"}`}>
        {hasContactInfo && (
          <div className="space-y-3">
            {ci.phone && <div className="flex items-center gap-3"><span className="text-xl">📞</span><span className="text-gray-700 text-sm">{ci.phone}</span></div>}
            {ci.email && <div className="flex items-center gap-3"><span className="text-xl">✉️</span><span className="text-gray-700 text-sm">{ci.email}</span></div>}
            {ci.address && <div className="flex items-center gap-3"><span className="text-xl">📍</span><span className="text-gray-700 text-sm">{ci.address}</span></div>}
            {ci.hours && <div className="flex items-start gap-3"><span className="text-xl">🕐</span><span className="text-gray-700 text-sm whitespace-pre-line">{ci.hours}</span></div>}
          </div>
        )}
        <div className="space-y-3">
          {formConfig.show_facility_selector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{formConfig.facility_selector_label || "Select a Location"}</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" disabled>
                <option>— Select a location —</option>
                {facilities.map(f => <option key={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          {(formConfig.fields || []).map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.type === "textarea" && (
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={3} placeholder={field.placeholder} readOnly />
              )}
              {field.type === "dropdown" && (
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" disabled>
                  <option>{field.placeholder || "Select..."}</option>
                  {(field.options || []).map((opt, j) => <option key={j}>{opt}</option>)}
                </select>
              )}
              {field.type === "checkbox" && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" disabled className="rounded" />
                  <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
                </div>
              )}
              {!["textarea", "dropdown", "checkbox"].includes(field.type) && (
                <input
                  type={field.type === "date" ? "date" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder={field.placeholder}
                  readOnly
                />
              )}
            </div>
          ))}
          <button
            className="w-full py-2.5 rounded-lg font-semibold text-sm opacity-70 cursor-default text-white"
            style={{ backgroundColor: formConfig.submit_button_color || "#1B365D" }}
          >
            {formConfig.submit_button_text || "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationsGridBlock({ data }) {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    if (data.facility_ids?.length) {
      base44.entities.Facility.list("name", 100).then((all) => {
        setFacilities(all.filter((f) => data.facility_ids.includes(f.id)));
      });
    }
  }, [data.facility_ids]);

  const colClass = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }[data.cols || 3] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  if (!data.facility_ids?.length) {
    return <div className="max-w-6xl mx-auto px-6 py-10 text-center text-gray-300 text-sm">[Locations Grid — no locations selected]</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {data.title && <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">{data.title}</h2>}
      <div className={`grid ${colClass} gap-6`}>
        {facilities.map((f) => {
          const address = [f.address, f.city, f.state, f.zip].filter(Boolean).join(", ");
          const facilityUrl = f.slug
            ? `/locations/${(f.state || "").toLowerCase()}/${(f.city || "").toLowerCase().replace(/\s+/g, "-")}/${f.slug}`
            : null;
          return (
            <div key={f.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {f.banner_image || (f.photos && f.photos[0]) ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={f.banner_image || f.photos[0]}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">No photo</div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#1B365D] mb-2">{f.name}</h3>
                {address && (
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{address}</span>
                  </div>
                )}
                {f.phone && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span>{f.phone}</span>
                  </div>
                )}
                {(f.features || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {f.features.slice(0, 4).map((feat, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{feat}</span>
                    ))}
                  </div>
                )}
                {facilityUrl && (
                  <a href={facilityUrl} className="text-sm font-semibold text-[#E8792F] hover:underline">
                    View Details →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmbedBlock({ data }) {
  if (!data.code) return <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-300 text-sm">[Embed block — no code set]</div>;
  return <div className="max-w-4xl mx-auto px-6 py-8" style={{ minHeight: data.height || "400px" }} dangerouslySetInnerHTML={{ __html: data.code || "" }} />;
}

function renderBlock(block, i) {
  const { type, data } = block;
  switch (type) {
    case "hero": return <HeroBlock key={i} data={data} />;
    case "heading": return <HeadingBlock key={i} data={data} />;
    case "divider": return <DividerBlock key={i} data={data} />;
    case "text": return <TextBlock key={i} data={data} />;
    case "image": return <ImageBlock key={i} data={data} />;
    case "two_column": return <TwoColumnBlock key={i} data={data} />;
    case "features_grid": return <FeaturesGridBlock key={i} data={data} />;
    case "stats": return <StatsBlock key={i} data={data} />;
    case "cta": return <CTABlock key={i} data={data} />;
    case "faq": return <FAQBlock key={i} data={data} />;
    case "video": return <VideoBlock key={i} data={data} />;
    case "gallery": return <GalleryBlock key={i} data={data} />;
    case "testimonials": return <TestimonialsBlock key={i} data={data} />;
    case "contact_form": return <ContactFormBlock key={i} data={data} />;
    case "embed": return <EmbedBlock key={i} data={data} />;
    case "locations_grid": return <LocationsGridBlock key={i} data={data} />;
    default: return null;
  }
}

export default function StaticPagePreview({ form }) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Preview header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-xs text-gray-500 font-medium sticky top-0 z-10">
        Live Preview — /{form.slug || "untitled"}
      </div>
      <div className="min-h-full">
        {(form.content_blocks || []).length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-300 text-sm">
            Add blocks on the left to see a preview here
          </div>
        ) : (
          (form.content_blocks || []).map((block, i) => renderBlock(block, i))
        )}
      </div>
    </div>
  );
}