import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Page not found.</p>
      </div>
    );
  }

  const blocks = (page.content_blocks || []).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-white min-h-screen">
      {blocks.map((block, i) => {
        const data = block.data || {};
        switch (block.type) {
          case "hero":
            return (
              <div key={i} className="relative py-24 md:py-32 overflow-hidden" style={{ background: data.bg_color || "#1B365D" }}>
                {data.bg_image && (
                  <>
                    <img src={data.bg_image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/50" />
                  </>
                )}
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-black mb-4">{data.title || page.title}</h1>
                  {data.subtitle && <p className="text-xl text-white/80">{data.subtitle}</p>}
                </div>
              </div>
            );
          case "text":
            return (
              <div key={i} className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
                <div
                  className="prose prose-lg max-w-none text-gray-600 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
                  dangerouslySetInnerHTML={{ __html: data.content || "" }}
                />
              </div>
            );
          case "image":
            return (
              <div key={i} className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <img src={data.url} alt={data.alt || ""} className="w-full rounded-2xl shadow-lg" />
                {data.caption && <p className="text-center text-sm text-gray-500 mt-3">{data.caption}</p>}
              </div>
            );
          case "faq":
            return (
              <div key={i} className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
                <div className="space-y-2">
                  {(data.items || []).map((faq, j) => (
                    <div key={j} className="border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === `${i}-${j}` ? null : `${i}-${j}`)}
                        className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50"
                      >
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
                  <h2 className="text-3xl font-bold mb-3">{data.title}</h2>
                  {data.subtitle && <p className="text-white/70 mb-6">{data.subtitle}</p>}
                  {data.button_text && (
                    <a
                      href={data.button_link || "#"}
                      className="inline-block px-8 py-3 bg-[#E8792F] text-white rounded-full font-semibold hover:opacity-90 transition"
                    >
                      {data.button_text}
                    </a>
                  )}
                </div>
              </div>
            );
          case "table":
            return (
              <div key={i} className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                {data.title && <h2 className="text-3xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    {data.headers && (
                      <thead className="bg-gray-50">
                        <tr>
                          {data.headers.map((h, j) => (
                            <th key={j} className="px-4 py-3 text-left font-semibold text-gray-700">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {(data.rows || []).map((row, j) => (
                        <tr key={j} className="border-t">
                          {row.map((cell, k) => (
                            <td key={k} className="px-4 py-3 text-gray-600">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}

      {blocks.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-[#1B365D] mb-4">{page.title}</h1>
          <p className="text-gray-500">This page has no content yet.</p>
        </div>
      )}
    </div>
  );
}