import React, { useState } from "react";

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

function TextBlock({ data }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="prose prose-sm max-w-none" style={{ textAlign: data.align || "left" }}
        dangerouslySetInnerHTML={{ __html: data.content || "" }} />
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
      return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.content || "" }} />;
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
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {data.title && <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">{data.title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          {data.phone && <div className="flex items-center gap-3"><span className="text-xl">📞</span><span className="text-gray-700 text-sm">{data.phone}</span></div>}
          {data.email && <div className="flex items-center gap-3"><span className="text-xl">✉️</span><span className="text-gray-700 text-sm">{data.email}</span></div>}
          {data.address && <div className="flex items-center gap-3"><span className="text-xl">📍</span><span className="text-gray-700 text-sm">{data.address}</span></div>}
          {data.hours && <div className="flex items-start gap-3"><span className="text-xl">🕐</span><span className="text-gray-700 text-sm whitespace-pre-line">{data.hours}</span></div>}
        </div>
        <div className="space-y-3">
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Your Name" readOnly />
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Email" readOnly />
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Message" readOnly />
          <button className="w-full py-2.5 bg-[#1B365D] text-white rounded-lg font-semibold text-sm opacity-70 cursor-default">Send Message</button>
        </div>
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