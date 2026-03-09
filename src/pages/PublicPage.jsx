import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";

// Render a column's content (shared with two_column block)
function RenderColContent({ prefix, data }) {
  const type = data[`${prefix}_type`] || "text";
  switch (type) {
    case "text":
      return <div className="prose prose-lg max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1" dangerouslySetInnerHTML={{ __html: data[`${prefix}_content`] || "" }} />;
    case "image":
      return data[`${prefix}_image`] ? <img src={data[`${prefix}_image`]} className="w-full rounded-2xl shadow-lg" alt="" /> : null;
    case "video":
      return data[`${prefix}_embed_url`] ? <div className="aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src={data[`${prefix}_embed_url`]} className="w-full h-full" allowFullScreen /></div> : null;
    case "embed":
      return data[`${prefix}_embed_code`] ? <div dangerouslySetInnerHTML={{ __html: data[`${prefix}_embed_code`] }} /> : null;
    case "features":
      return (
        <ul className="space-y-3">
          {(data[`${prefix}_features`] || []).map((f, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[#2A9D8F] text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
              <span className="text-gray-700">{f}</span>
            </li>
          ))}
        </ul>
      );
    case "stats":
      return (
        <div className="grid grid-cols-2 gap-4">
          {(data[`${prefix}_stats`] || []).map((s, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-3xl font-black text-[#1B365D]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="p-6 rounded-2xl text-center bg-[#1B365D] text-white">
          <h3 className="text-xl font-bold mb-2">{data[`${prefix}_cta_title`]}</h3>
          <p className="text-sm opacity-70 mb-4">{data[`${prefix}_cta_sub`]}</p>
          {data[`${prefix}_cta_btn`] && (
            <a href={data[`${prefix}_cta_link`] || "#"} className="inline-block px-6 py-2 bg-[#E8792F] rounded-full text-sm font-semibold hover:opacity-90 transition">
              {data[`${prefix}_cta_btn`]}
            </a>
          )}
        </div>
      );
    case "reviews":
      return (
        <div className="space-y-4">
          {(data[`${prefix}_reviews`] || []).map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border">
              <div className="flex gap-1 mb-2">{[...Array(r.rating || 5)].map((_, s) => <span key={s} className="text-yellow-400">★</span>)}</div>
              <p className="text-sm text-gray-600">"{r.text}"</p>
              <p className="text-sm font-semibold mt-2">{r.name}</p>
            </div>
          ))}
        </div>
      );
    case "icon_cards":
      return (
        <div className="space-y-3">
          {(data[`${prefix}_cards`] || []).map((c, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">{c.icon}</span>
              <div><p className="font-semibold">{c.title}</p><p className="text-sm text-gray-500 mt-0.5">{c.desc}</p></div>
            </div>
          ))}
        </div>
      );
    case "faq":
      return (
        <div className="space-y-2">
          {(data[`${prefix}_faqs`] || []).map((f, i) => (
            <details key={i} className="border rounded-xl overflow-hidden">
              <summary className="p-4 font-medium cursor-pointer hover:bg-gray-50">{f.question}</summary>
              <div className="px-4 pb-4 text-sm text-gray-600">{f.answer}</div>
            </details>
          ))}
        </div>
      );
    default: return null;
  }
}

export default function PublicPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");
  const [openFaq, setOpenFaq] = useState(null);

  const { data: page, isLoading } = useQuery({
    queryKey: ["public-page", slug],
    queryFn: async () => {
      const pages = await base44.entities.StaticPage.filter({ slug, status: "published" });
      return pages[0];
    },
    enabled: !!slug,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!page) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Page not found.</p>
    </div>
  );

  const blocks = (page.content_blocks || []).sort((a, b) => (a.order || 0) - (b.order || 0));

  const renderBlock = (block, i) => {
    const data = block.data || {};
    const paddingMap = { none: "py-0", sm: "py-4", md: "py-8", lg: "py-12", xl: "py-16" };
    const padCls = paddingMap[data.padding] || "py-12";
    const maxWMap = { sm: "max-w-sm", "2xl": "max-w-2xl", "4xl": "max-w-4xl", "6xl": "max-w-6xl", full: "w-full" };
    const maxWCls = maxWMap[data.max_width] || "max-w-4xl";

    switch (block.type) {
      case "hero":
        return (
          <div key={i} className="relative py-24 md:py-32 overflow-hidden" style={{ background: data.bg_color || "#1B365D" }}>
            {data.bg_image && (<><img src={data.bg_image} className="absolute inset-0 w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/50" /></>)}
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center" style={{ color: data.text_color || "#ffffff" }}>
              <h1 className="text-4xl md:text-6xl font-black mb-4">{data.title || page.title}</h1>
              {data.subtitle && <p className="text-xl opacity-80 mb-6">{data.subtitle}</p>}
              {data.cta_text && (
                <a href={data.cta_link || "#"} className="inline-block px-8 py-3 rounded-full font-semibold text-white hover:opacity-90 transition" style={{ background: data.cta_bg || "#E8792F" }}>
                  {data.cta_text}
                </a>
              )}
            </div>
          </div>
        );

      case "text":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
              <div className="prose prose-lg max-w-none text-gray-600 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1" dangerouslySetInnerHTML={{ __html: data.content || "" }} />
            </div>
          </div>
        );

      case "image": {
        const alignMap = { left: "mr-auto", center: "mx-auto", right: "ml-auto" };
        const radiusMap = { none: "", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-2xl", full: "rounded-full" };
        return (
          <div key={i} className={`${maxWCls} mx-auto px-4 sm:px-6 ${padCls}`}>
            {data.url && <img src={data.url} alt={data.alt || ""} className={`${alignMap[data.img_align] || "mx-auto"} ${radiusMap[data.border_radius] || "rounded-2xl"} shadow-lg w-full block`} />}
            {data.caption && <p className="text-center text-sm text-gray-500 mt-3">{data.caption}</p>}
          </div>
        );
      }

      case "gallery":
        return (
          <div key={i} className={`${maxWCls} mx-auto px-4 sm:px-6 ${padCls}`}>
            {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
            <div className={`grid grid-cols-2 md:grid-cols-${data.columns || 3} gap-4`}>
              {(data.images || []).map((url, j) => <img key={j} src={url} alt="" className={`w-full ${data.img_height || "h-48"} object-cover rounded-2xl`} />)}
            </div>
          </div>
        );

      case "video":
        return (
          <div key={i} className={`${maxWCls} mx-auto px-4 sm:px-6 ${padCls}`}>
            {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
            {data.embed_url && <div className="aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src={data.embed_url} className="w-full h-full" allowFullScreen /></div>}
          </div>
        );

      case "embed":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
              {data.embed_code && <div dangerouslySetInnerHTML={{ __html: data.embed_code }} />}
            </div>
          </div>
        );

      case "features_grid":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-2">{data.title}</h2>}
              {data.subtitle && <p className="text-gray-500 mb-8">{data.subtitle}</p>}
              <div className={`grid sm:grid-cols-2 md:grid-cols-${data.columns || 2} gap-4`}>
                {(data.items || []).map((item, j) => (
                  <div key={j} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: data.item_bg || "#F9FAFB" }}>
                    <span className="text-2xl flex-shrink-0">{item.icon || "✓"}</span>
                    <div>
                      <p className="font-semibold" style={{ color: data.item_title_color || "#1B365D" }}>{item.title}</p>
                      {item.desc && <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "stats":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-8 text-center">{data.title}</h2>}
              <div className={`grid sm:grid-cols-2 md:grid-cols-${data.columns || 3} gap-6`}>
                {(data.items || []).map((item, j) => (
                  <div key={j} className="text-center p-6 rounded-2xl" style={{ background: data.card_bg || "#F9FAFB" }}>
                    <p className="text-5xl font-black" style={{ color: data.value_color || "#1B365D" }}>{item.value}</p>
                    <p className="font-semibold mt-2" style={{ color: data.label_color || "#374151" }}>{item.label}</p>
                    {item.desc && <p className="text-sm text-gray-400 mt-1">{item.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "icon_cards":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-8">{data.title}</h2>}
              <div className={`grid sm:grid-cols-2 md:grid-cols-${data.columns || 3} gap-6`}>
                {(data.items || []).map((item, j) => (
                  <div key={j} className="p-6 rounded-2xl border text-center" style={{ background: data.card_bg || "#ffffff" }}>
                    <span className="text-4xl">{item.icon}</span>
                    <p className="font-semibold mt-3">{item.title}</p>
                    {item.desc && <p className="text-sm text-gray-500 mt-2">{item.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "faq":
        return (
          <div key={i} className={`${maxWCls} mx-auto px-4 sm:px-6 ${padCls}`}>
            {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
            <div className="space-y-2">
              {(data.items || []).map((faq, j) => (
                <div key={j} className="border rounded-xl overflow-hidden" style={{ borderColor: data.border_color || "#e5e7eb" }}>
                  <button onClick={() => setOpenFaq(openFaq === `${i}-${j}` ? null : `${i}-${j}`)} className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50">
                    {faq.question}
                    {openFaq === `${i}-${j}` ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {openFaq === `${i}-${j}` && <div className="px-4 pb-4 text-sm text-gray-600">{faq.answer}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case "cta":
        return (
          <div key={i} className="py-16" style={{ background: data.bg_color || "#1B365D" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6 text-center`} style={{ color: data.text_color || "#ffffff" }}>
              <h2 className="text-3xl font-bold mb-3">{data.title}</h2>
              {data.subtitle && <p className="opacity-70 mb-6">{data.subtitle}</p>}
              {data.button_text && (
                <a href={data.button_link || "#"} className="inline-block px-8 py-3 rounded-full font-semibold hover:opacity-90 transition" style={{ background: data.button_bg || "#E8792F", color: data.button_text_color || "#ffffff" }}>
                  {data.button_text}
                </a>
              )}
            </div>
          </div>
        );

      case "testimonials":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-8 text-center">{data.title}</h2>}
              <div className={`grid sm:grid-cols-2 md:grid-cols-${data.columns || 2} gap-6`}>
                {(data.items || []).map((t, j) => (
                  <div key={j} className="p-5 rounded-2xl border shadow-sm" style={{ background: data.card_bg || "#ffffff" }}>
                    <div className="flex gap-1 mb-3">{[...Array(t.rating || 5)].map((_, s) => <span key={s} className="text-yellow-400">★</span>)}</div>
                    <p className="text-gray-600 mb-4">"{t.text}"</p>
                    <p className="font-semibold text-sm">{t.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "table":
        return (
          <div key={i} className={`${maxWCls} mx-auto px-4 sm:px-6 ${padCls}`}>
            {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
            <div className="overflow-x-auto rounded-2xl border shadow-sm">
              <table className="w-full text-sm">
                {data.headers && (
                  <thead style={{ background: data.header_bg || "#f9fafb" }}>
                    <tr>{data.headers.map((h, j) => <th key={j} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>)}</tr>
                  </thead>
                )}
                <tbody>
                  {(data.rows || []).map((row, j) => (
                    <tr key={j} className="border-t" style={{ background: j % 2 === 0 ? (data.row_even_bg || "#fff") : (data.row_odd_bg || "#f9fafb") }}>
                      {row.map((cell, k) => <td key={k} className="px-4 py-3 text-gray-600">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "two_column":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              <div className="grid md:grid-cols-2 gap-10" style={{ gridTemplateColumns: `${data.left_width || 50}% ${100 - (data.left_width || 50)}%` }}>
                <div>
                  {data.left_title && <h3 className="text-xl font-bold text-[#1B365D] mb-4">{data.left_title}</h3>}
                  <RenderColContent prefix="left" data={data} />
                </div>
                <div>
                  {data.right_title && <h3 className="text-xl font-bold text-[#1B365D] mb-4">{data.right_title}</h3>}
                  <RenderColContent prefix="right" data={data} />
                </div>
              </div>
            </div>
          </div>
        );

      case "contact_form":
        return (
          <div key={i} className={padCls} style={{ background: data.bg_color || "transparent" }}>
            <div className={`${maxWCls} mx-auto px-4 sm:px-6`}>
              {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-8">{data.title}</h2>}
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  {data.phone && <div className="flex gap-3 items-center text-gray-700"><span className="text-xl">📞</span><a href={`tel:${data.phone}`} className="hover:text-[#1B365D]">{data.phone}</a></div>}
                  {data.email && <div className="flex gap-3 items-center text-gray-700"><span className="text-xl">✉️</span><a href={`mailto:${data.email}`} className="hover:text-[#1B365D]">{data.email}</a></div>}
                  {data.address && <div className="flex gap-3 items-start text-gray-700"><span className="text-xl">📍</span><span>{data.address}</span></div>}
                  {data.hours && <div className="flex gap-3 items-start text-gray-700"><span className="text-xl">🕐</span><pre className="font-sans text-sm whitespace-pre-line">{data.hours}</pre></div>}
                </div>
                <div className="space-y-3 bg-gray-50 p-6 rounded-2xl">
                  <input className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20" placeholder="Your Name" />
                  <input className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20" placeholder="Your Email" />
                  <input className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20" placeholder="Phone (optional)" />
                  <textarea rows={4} className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 resize-none" placeholder="Your message..." />
                  <button className="w-full py-3 rounded-full font-semibold text-white hover:opacity-90 transition" style={{ background: "#E8792F" }}>{data.button_text || "Send Message"}</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "divider":
        return (
          <div key={i} className="max-w-4xl mx-auto px-4 sm:px-6" style={{ paddingTop: data.space_top || "2rem", paddingBottom: data.space_bottom || "2rem" }}>
            {data.style !== "blank" && <hr style={{ borderColor: data.line_color || "#e5e7eb", borderWidth: data.line_thickness || 1, borderStyle: data.style || "solid" }} />}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {blocks.map((block, i) => renderBlock(block, i))}
      {blocks.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-[#1B365D] mb-4">{page.title}</h1>
          <p className="text-gray-500">This page has no content yet.</p>
        </div>
      )}
    </div>
  );
}