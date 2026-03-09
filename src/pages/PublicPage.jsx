import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

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
        {data.title && <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: data.title_color || "#ffffff" }}>{data.title}</h1>}
        {data.subtitle && <p className="text-lg md:text-xl" style={{ color: data.subtitle_color || "#e2e8f0" }}>{data.subtitle}</p>}
      </div>
    </div>
  );
}

function TextBlock({ data }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div
        className="prose prose-lg max-w-none"
        style={{ textAlign: data.align || "left" }}
        dangerouslySetInnerHTML={{ __html: data.content || "" }}
      />
    </div>
  );
}

function ImageBlock({ data }) {
  const widthClass = { full: "w-full", large: "max-w-3xl", medium: "max-w-xl", small: "max-w-sm" }[data.width || "full"] || "w-full";
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center">
      <img src={data.url} alt={data.alt || ""} className={`${widthClass} rounded-xl shadow-md`} />
      {data.caption && <p className="text-sm text-gray-500 mt-2 text-center">{data.caption}</p>}
    </div>
  );
}

function ColumnContent({ type, data }) {
  switch (type) {
    case "text":
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.content || "" }} />;
    case "image":
      return <img src={data.url} alt={data.alt || ""} className="w-full rounded-xl shadow-md" />;
    case "video": {
      const embedUrl = getVideoEmbed(data.url);
      return embedUrl ? (
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="video" />
        </div>
      ) : null;
    }
    case "embed":
      return (
        <div style={{ height: data.height || "400px" }} dangerouslySetInnerHTML={{ __html: data.code || "" }} />
      );
    default:
      return null;
  }
}

function TwoColumnBlock({ data }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className={`grid grid-cols-1 md:grid-cols-2 ${data.gap || "gap-8"} ${data.valign || "items-start"}`}>
        <div><ColumnContent type={data.left_type || "text"} data={data.left_data || {}} /></div>
        <div><ColumnContent type={data.right_type || "image"} data={data.right_data || {}} /></div>
      </div>
    </div>
  );
}

function FeaturesGridBlock({ data }) {
  const colClass = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" }[data.cols || 3] || "grid-cols-3";
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {data.title && <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{data.title}</h2>}
      {data.subtitle && <p className="text-center text-gray-500 mb-8">{data.subtitle}</p>}
      <div className={`grid ${colClass} gap-6`}>
        {(data.items || []).map((item, i) => (
          <div key={i} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            {item.icon && <div className="text-4xl mb-3">{item.icon}</div>}
            {item.title && <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>}
            {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBlock({ data }) {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {(data.items || []).map((item, i) => (
          <div key={i}>
            <div className="text-4xl font-bold text-[#1B365D]">{item.value}</div>
            <div className="text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTABlock({ data }) {
  return (
    <div className="py-16 text-center" style={{ backgroundColor: data.bg_color || "#E8792F" }}>
      <div className="max-w-3xl mx-auto px-6">
        {data.title && <h2 className="text-3xl font-bold mb-3" style={{ color: data.text_color || "#fff" }}>{data.title}</h2>}
        {data.subtitle && <p className="mb-6" style={{ color: data.text_color || "#fff" }}>{data.subtitle}</p>}
        {data.button_text && data.button_link && (
          <a href={data.button_link}>
            <button className="px-8 py-3 rounded-full font-semibold text-lg transition hover:opacity-90"
              style={{ backgroundColor: data.button_bg || "#ffffff", color: data.button_text_color || "#E8792F" }}>
              {data.button_text}
            </button>
          </a>
        )}
      </div>
    </div>
  );
}

function FAQBlock({ data }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {data.title && <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{data.title}</h2>}
      <div className="space-y-3">
        {(data.items || []).map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button className="w-full text-left px-5 py-4 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50"
              onClick={() => setOpen(open === i ? null : i)}>
              {item.question}
              <span>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <div className="px-5 pb-4 text-gray-600">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoBlock({ data }) {
  const embedUrl = getVideoEmbed(data.url);
  if (!embedUrl) return null;
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {data.title && <h2 className="text-2xl font-bold text-center mb-4">{data.title}</h2>}
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={data.title || "video"} />
      </div>
    </div>
  );
}

function GalleryBlock({ data }) {
  const colClass = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" }[data.cols || 3] || "grid-cols-3";
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className={`grid ${colClass} gap-4`}>
        {(data.images || []).map((img, i) => (
          <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function TestimonialsBlock({ data }) {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {data.title && <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{data.title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data.items || []).map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex mb-2">
                {Array.from({ length: item.rating || 5 }).map((_, s) => (
                  <span key={s} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-600 mb-3">"{item.text}"</p>
              <p className="font-semibold text-gray-900">— {item.name}</p>
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
  const [submitted, setSubmitted] = useState(false);
  const [fieldValues, setFieldValues] = useState({});
  const [visibleFields, setVisibleFields] = useState({});

  useEffect(() => {
    if (data.form_id) {
      base44.entities.FormConfig.filter({ id: data.form_id }).then(res => {
        if (res && res.length > 0) setFormConfig(res[0]);
      });
    }
    base44.entities.Facility.list("name", 100).then(setFacilities);
  }, [data.form_id]);

  useEffect(() => {
    if (!formConfig) return;
    const visible = {};
    (formConfig.fields || []).forEach(field => {
      if (!field.condition_field) {
        visible[field.id] = true;
      } else {
        visible[field.id] = fieldValues[field.condition_field] === field.condition_value;
      }
    });
    setVisibleFields(visible);
  }, [formConfig, fieldValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formConfig?.recipient_email) {
      const body = Object.entries(fieldValues).map(([k, v]) => {
        const field = formConfig.fields.find(f => f.id === k);
        return `${field?.label || k}: ${v}`;
      }).join("\n");
      await base44.integrations.Core.SendEmail({
        to: formConfig.recipient_email,
        subject: `New form submission: ${formConfig.title || formConfig.name}`,
        body,
      });
    }
    setSubmitted(true);
  };

  if (!data.form_id || !formConfig) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400 text-sm">
        {!data.form_id ? "[Contact Form — no form configured]" : "Loading form..."}
      </div>
    );
  }

  const ci = formConfig.contact_info || {};
  const hasContactInfo = ci.phone || ci.email || ci.address || ci.hours;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {formConfig.title && <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{formConfig.title}</h2>}
      {formConfig.subtitle && <p className="text-center text-gray-500 mb-8">{formConfig.subtitle}</p>}
      <div className={`grid gap-12 ${hasContactInfo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-xl mx-auto"}`}>
        {hasContactInfo && (
          <div className="space-y-4">
            {ci.phone && <div className="flex items-center gap-3"><span className="text-2xl">📞</span><span className="text-gray-700">{ci.phone}</span></div>}
            {ci.email && <div className="flex items-center gap-3"><span className="text-2xl">✉️</span><span className="text-gray-700">{ci.email}</span></div>}
            {ci.address && <div className="flex items-center gap-3"><span className="text-2xl">📍</span><span className="text-gray-700">{ci.address}</span></div>}
            {ci.hours && <div className="flex items-start gap-3"><span className="text-2xl">🕐</span><span className="text-gray-700 whitespace-pre-line">{ci.hours}</span></div>}
          </div>
        )}
        <div>
          {submitted ? (
            <div className="text-center py-8 text-green-600 font-semibold text-lg">
              {formConfig.success_message || "Thank you! We'll be in touch shortly."}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {formConfig.show_facility_selector && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{formConfig.facility_selector_label || "Select a Location"}</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                    value={fieldValues["__facility__"] || ""}
                    onChange={e => setFieldValues(v => ({ ...v, __facility__: e.target.value }))}
                  >
                    <option value="">— Select a location —</option>
                    {facilities.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                  </select>
                </div>
              )}
              {(formConfig.fields || []).filter(field => visibleFields[field.id]).map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === "textarea" && (
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                      rows={4}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={fieldValues[field.id] || ""}
                      onChange={e => setFieldValues(v => ({ ...v, [field.id]: e.target.value }))}
                    />
                  )}
                  {field.type === "dropdown" && (
                    <select
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                      required={field.required}
                      value={fieldValues[field.id] || ""}
                      onChange={e => setFieldValues(v => ({ ...v, [field.id]: e.target.value }))}
                    >
                      <option value="">{field.placeholder || "Select..."}</option>
                      {(field.options || []).map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {field.type === "checkbox" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        required={field.required}
                        checked={!!fieldValues[field.id]}
                        onChange={e => setFieldValues(v => ({ ...v, [field.id]: e.target.checked }))}
                      />
                      <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
                    </div>
                  )}
                  {!["textarea", "dropdown", "checkbox"].includes(field.type) && (
                    <input
                      type={field.type === "date" ? "date" : field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
                      placeholder={field.placeholder}
                      required={field.required}
                      value={fieldValues[field.id] || ""}
                      onChange={e => setFieldValues(v => ({ ...v, [field.id]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold hover:opacity-90 transition text-white"
                style={{ backgroundColor: formConfig.submit_button_color || "#1B365D" }}
              >
                {formConfig.submit_button_text || "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function EmbedBlock({ data }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10" style={{ minHeight: data.height || "400px" }}
      dangerouslySetInnerHTML={{ __html: data.code || "" }} />
  );
}

function renderBlock(block, i) {
  const { type, data } = block;
  switch (type) {
    case "hero": return <HeroBlock key={i} data={data} />;
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
    default: return null;
  }
}

export default function PublicPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const { data: pages, isLoading } = useQuery({
    queryKey: ["public-page", slug],
    queryFn: () => base44.entities.StaticPage.filter({ slug }),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const page = pages && pages.length > 0 ? pages[0] : null;

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-500">The page "{slug}" does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {(page.content_blocks || []).map((block, i) => renderBlock(block, i))}
    </div>
  );
}