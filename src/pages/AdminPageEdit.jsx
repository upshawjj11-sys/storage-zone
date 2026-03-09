import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Upload, X, Globe, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "../components/admin/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const blockTypes = [
  { value: "hero", label: "🎯 Hero Banner" },
  { value: "text", label: "📝 Text / Rich Content" },
  { value: "two_column", label: "⬛⬛ Two Columns" },
  { value: "image", label: "🖼️ Image" },
  { value: "gallery", label: "📸 Photo Gallery" },
  { value: "video", label: "🎬 Video Embed" },
  { value: "embed", label: "🔗 Custom Embed / HTML" },
  { value: "cta", label: "🚀 Call to Action" },
  { value: "features_grid", label: "✅ Features Grid" },
  { value: "stats", label: "📊 Stats / Numbers" },
  { value: "icon_cards", label: "🃏 Icon Cards" },
  { value: "faq", label: "❓ FAQ Accordion" },
  { value: "testimonials", label: "⭐ Testimonials / Reviews" },
  { value: "table", label: "📋 Table" },
  { value: "contact_form", label: "📬 Contact Form Info" },
  { value: "divider", label: "➖ Divider / Spacer" },
];

// ── Column content types ──────────────────────────────────────────────────────
export const columnTypes = [
  { value: "text", label: "Rich Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video Embed" },
  { value: "embed", label: "Custom Embed / HTML" },
  { value: "features", label: "Features List" },
  { value: "stats", label: "Stats / Numbers" },
  { value: "cta", label: "Call to Action Box" },
  { value: "reviews", label: "Reviews" },
  { value: "icon_cards", label: "Icon Cards" },
  { value: "faq", label: "FAQ" },
];

// ── Shared helpers ────────────────────────────────────────────────────────────
function ColorRow({ label, value, defaultVal, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs w-24 flex-shrink-0">{label}</Label>
      <input type="color" value={value || defaultVal} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border cursor-pointer p-0.5" />
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={defaultVal} className="text-xs w-28" />
    </div>
  );
}

function ImageUploadField({ value, onChange, label = "Image" }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2 items-center">
        <Input className="text-xs" placeholder="Paste image URL..." value={value || ""} onChange={(e) => onChange(e.target.value)} />
        {value && <button onClick={() => onChange("")} className="text-red-400 hover:text-red-600 flex-shrink-0"><X className="w-4 h-4" /></button>}
      </div>
      <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-gray-800 border rounded px-2 py-1 w-fit">
        <Upload className="w-3 h-3" /> Upload
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); onChange(file_url); }} />
      </label>
      {value && <img src={value} alt="" className="w-full h-24 object-cover rounded-lg border" />}
    </div>
  );
}

function BlockStylePanel({ data, onChange }) {
  return (
    <div className="p-4 bg-gray-50 border rounded-xl space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Block Appearance</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Padding</Label>
          <Select value={data.padding || "md"} onValueChange={(v) => onChange({ padding: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">X-Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Max Width</Label>
          <Select value={data.max_width || "4xl"} onValueChange={(v) => onChange({ max_width: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small (640px)</SelectItem>
              <SelectItem value="2xl">Medium (672px)</SelectItem>
              <SelectItem value="4xl">Large (896px)</SelectItem>
              <SelectItem value="6xl">X-Large (1152px)</SelectItem>
              <SelectItem value="full">Full width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ColorRow label="Background" value={data.bg_color} defaultVal="#ffffff" onChange={(v) => onChange({ bg_color: v })} />
    </div>
  );
}

// ── Column content editor (reused for both left/right) ────────────────────────
function ColumnEditor({ prefix, data, onChange }) {
  const type = data[`${prefix}_type`] || "text";
  const upd = (patch) => onChange(patch);

  const renderTypeEditor = () => {
    switch (type) {
      case "text":
        return <RichTextEditor value={data[`${prefix}_content`] || ""} onChange={(val) => upd({ [`${prefix}_content`]: val })} placeholder="Column content..." minHeight={150} />;
      case "image":
        return <ImageUploadField value={data[`${prefix}_image`]} onChange={(v) => upd({ [`${prefix}_image`]: v })} label="Image" />;
      case "video":
        return (
          <div className="space-y-2">
            <Input className="text-xs" placeholder="https://www.youtube.com/embed/..." value={data[`${prefix}_embed_url`] || ""} onChange={(e) => upd({ [`${prefix}_embed_url`]: e.target.value })} />
            <p className="text-xs text-gray-400">Use YouTube/Vimeo embed URLs</p>
            {data[`${prefix}_embed_url`] && <div className="aspect-video rounded overflow-hidden"><iframe src={data[`${prefix}_embed_url`]} className="w-full h-full" allowFullScreen /></div>}
          </div>
        );
      case "embed":
        return (
          <div className="space-y-2">
            <Textarea rows={4} className="text-xs font-mono" placeholder="Paste HTML embed code here..." value={data[`${prefix}_embed_code`] || ""} onChange={(e) => upd({ [`${prefix}_embed_code`]: e.target.value })} />
          </div>
        );
      case "features":
        return (
          <div className="space-y-2">
            {(data[`${prefix}_features`] || []).map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input className="text-xs h-7" value={f} onChange={(e) => { const arr = [...(data[`${prefix}_features`] || [])]; arr[i] = e.target.value; upd({ [`${prefix}_features`]: arr }); }} />
                <button onClick={() => { const arr = (data[`${prefix}_features`] || []).filter((_, j) => j !== i); upd({ [`${prefix}_features`]: arr }); }} className="text-red-400"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ [`${prefix}_features`]: [...(data[`${prefix}_features`] || []), ""] })}><Plus className="w-3 h-3 mr-1" /> Add Feature</Button>
          </div>
        );
      case "stats":
        return (
          <div className="space-y-2">
            {(data[`${prefix}_stats`] || []).map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input className="text-xs h-7 w-20" placeholder="Value" value={s.value || ""} onChange={(e) => { const arr = [...(data[`${prefix}_stats`] || [])]; arr[i] = { ...arr[i], value: e.target.value }; upd({ [`${prefix}_stats`]: arr }); }} />
                <Input className="text-xs h-7 flex-1" placeholder="Label" value={s.label || ""} onChange={(e) => { const arr = [...(data[`${prefix}_stats`] || [])]; arr[i] = { ...arr[i], label: e.target.value }; upd({ [`${prefix}_stats`]: arr }); }} />
                <button onClick={() => { const arr = (data[`${prefix}_stats`] || []).filter((_, j) => j !== i); upd({ [`${prefix}_stats`]: arr }); }} className="text-red-400"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ [`${prefix}_stats`]: [...(data[`${prefix}_stats`] || []), { value: "", label: "" }] })}><Plus className="w-3 h-3 mr-1" /> Add Stat</Button>
          </div>
        );
      case "cta":
        return (
          <div className="space-y-2">
            <Input className="text-xs h-7" placeholder="Heading" value={data[`${prefix}_cta_title`] || ""} onChange={(e) => upd({ [`${prefix}_cta_title`]: e.target.value })} />
            <Input className="text-xs h-7" placeholder="Subtext" value={data[`${prefix}_cta_sub`] || ""} onChange={(e) => upd({ [`${prefix}_cta_sub`]: e.target.value })} />
            <div className="flex gap-2">
              <Input className="text-xs h-7" placeholder="Button text" value={data[`${prefix}_cta_btn`] || ""} onChange={(e) => upd({ [`${prefix}_cta_btn`]: e.target.value })} />
              <Input className="text-xs h-7" placeholder="Button link" value={data[`${prefix}_cta_link`] || ""} onChange={(e) => upd({ [`${prefix}_cta_link`]: e.target.value })} />
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-2">
            {(data[`${prefix}_reviews`] || []).map((r, i) => (
              <div key={i} className="p-2 bg-white rounded border space-y-1">
                <div className="flex gap-2">
                  <Input className="text-xs h-7" placeholder="Name" value={r.name || ""} onChange={(e) => { const arr = [...(data[`${prefix}_reviews`] || [])]; arr[i] = { ...arr[i], name: e.target.value }; upd({ [`${prefix}_reviews`]: arr }); }} />
                  <Input type="number" min={1} max={5} className="text-xs h-7 w-16" placeholder="★" value={r.rating || 5} onChange={(e) => { const arr = [...(data[`${prefix}_reviews`] || [])]; arr[i] = { ...arr[i], rating: parseInt(e.target.value) }; upd({ [`${prefix}_reviews`]: arr }); }} />
                  <button onClick={() => { const arr = (data[`${prefix}_reviews`] || []).filter((_, j) => j !== i); upd({ [`${prefix}_reviews`]: arr }); }} className="text-red-400"><X className="w-3 h-3" /></button>
                </div>
                <Textarea rows={2} className="text-xs" placeholder="Review text" value={r.text || ""} onChange={(e) => { const arr = [...(data[`${prefix}_reviews`] || [])]; arr[i] = { ...arr[i], text: e.target.value }; upd({ [`${prefix}_reviews`]: arr }); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ [`${prefix}_reviews`]: [...(data[`${prefix}_reviews`] || []), { name: "", text: "", rating: 5 }] })}><Plus className="w-3 h-3 mr-1" /> Add Review</Button>
          </div>
        );
      case "icon_cards":
        return (
          <div className="space-y-2">
            {(data[`${prefix}_cards`] || []).map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input className="text-xs h-7 w-12" placeholder="🏠" value={c.icon || ""} onChange={(e) => { const arr = [...(data[`${prefix}_cards`] || [])]; arr[i] = { ...arr[i], icon: e.target.value }; upd({ [`${prefix}_cards`]: arr }); }} />
                <Input className="text-xs h-7 flex-1" placeholder="Title" value={c.title || ""} onChange={(e) => { const arr = [...(data[`${prefix}_cards`] || [])]; arr[i] = { ...arr[i], title: e.target.value }; upd({ [`${prefix}_cards`]: arr }); }} />
                <Input className="text-xs h-7 flex-1" placeholder="Description" value={c.desc || ""} onChange={(e) => { const arr = [...(data[`${prefix}_cards`] || [])]; arr[i] = { ...arr[i], desc: e.target.value }; upd({ [`${prefix}_cards`]: arr }); }} />
                <button onClick={() => { const arr = (data[`${prefix}_cards`] || []).filter((_, j) => j !== i); upd({ [`${prefix}_cards`]: arr }); }} className="text-red-400 mt-1"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ [`${prefix}_cards`]: [...(data[`${prefix}_cards`] || []), { icon: "", title: "", desc: "" }] })}><Plus className="w-3 h-3 mr-1" /> Add Card</Button>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-2">
            {(data[`${prefix}_faqs`] || []).map((f, i) => (
              <div key={i} className="space-y-1 p-2 bg-white border rounded">
                <div className="flex gap-2">
                  <Input className="text-xs h-7 flex-1" placeholder="Question" value={f.question || ""} onChange={(e) => { const arr = [...(data[`${prefix}_faqs`] || [])]; arr[i] = { ...arr[i], question: e.target.value }; upd({ [`${prefix}_faqs`]: arr }); }} />
                  <button onClick={() => { const arr = (data[`${prefix}_faqs`] || []).filter((_, j) => j !== i); upd({ [`${prefix}_faqs`]: arr }); }} className="text-red-400"><X className="w-3 h-3" /></button>
                </div>
                <Textarea rows={2} className="text-xs" placeholder="Answer" value={f.answer || ""} onChange={(e) => { const arr = [...(data[`${prefix}_faqs`] || [])]; arr[i] = { ...arr[i], answer: e.target.value }; upd({ [`${prefix}_faqs`]: arr }); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ [`${prefix}_faqs`]: [...(data[`${prefix}_faqs`] || []), { question: "", answer: "" }] })}><Plus className="w-3 h-3 mr-1" /> Add FAQ</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-xl border">
      <p className="text-xs font-semibold text-gray-500 capitalize">{prefix} Column</p>
      <div><Label className="text-xs">Heading (optional)</Label><Input className="mt-1 text-sm h-8" value={data[`${prefix}_title`] || ""} onChange={(e) => upd({ [`${prefix}_title`]: e.target.value })} /></div>
      <div>
        <Label className="text-xs">Content Type</Label>
        <Select value={type} onValueChange={(v) => upd({ [`${prefix}_type`]: v })}>
          <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {columnTypes.map((ct) => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {renderTypeEditor()}
    </div>
  );
}

// ── Table editor ──────────────────────────────────────────────────────────────
function TableEditor({ data, onChange }) {
  const headers = data.headers || ["Column 1", "Column 2"];
  const rows = data.rows || [];
  const updateHeader = (i, val) => { const h = [...headers]; h[i] = val; onChange({ headers: h }); };
  const addColumn = () => { const h = [...headers, `Column ${headers.length + 1}`]; const r = rows.map(row => [...row, ""]); onChange({ headers: h, rows: r }); };
  const removeColumn = (ci) => { const h = headers.filter((_, i) => i !== ci); const r = rows.map(row => row.filter((_, i) => i !== ci)); onChange({ headers: h, rows: r }); };
  const updateCell = (ri, ci, val) => { const r = rows.map((row, i) => i === ri ? row.map((c, j) => j === ci ? val : c) : row); onChange({ rows: r }); };
  const addRow = () => onChange({ rows: [...rows, headers.map(() => "")] });
  const removeRow = (ri) => onChange({ rows: rows.filter((_, i) => i !== ri) });
  return (
    <div className="space-y-3">
      <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} /></div>
      <div className="grid grid-cols-3 gap-3">
        <ColorRow label="Header BG" value={data.header_bg} defaultVal="#f9fafb" onChange={(v) => onChange({ header_bg: v })} />
        <ColorRow label="Even Row BG" value={data.row_even_bg} defaultVal="#ffffff" onChange={(v) => onChange({ row_even_bg: v })} />
        <ColorRow label="Odd Row BG" value={data.row_odd_bg} defaultVal="#f9fafb" onChange={(v) => onChange({ row_odd_bg: v })} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Table</Label>
          <Button variant="outline" size="sm" onClick={addColumn}><Plus className="w-3 h-3 mr-1" /> Add Column</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h, ci) => (
                  <th key={ci} className="px-2 py-2 border-r last:border-r-0">
                    <div className="flex items-center gap-1">
                      <Input value={h} onChange={(e) => updateHeader(ci, e.target.value)} className="h-7 text-xs font-semibold" />
                      {headers.length > 1 && <button onClick={() => removeColumn(ci)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3 h-3" /></button>}
                    </div>
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-t">
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-2 py-1 border-r last:border-r-0">
                      <Input value={row[ci] || ""} onChange={(e) => updateCell(ri, ci, e.target.value)} className="h-7 text-xs" />
                    </td>
                  ))}
                  <td className="px-1 py-1"><button onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={addRow}><Plus className="w-3 h-3 mr-1" /> Add Row</Button>
      </div>
    </div>
  );
}

// ── Live block preview ────────────────────────────────────────────────────────
export function BlockPreview({ block }) {
  const [openFaq, setOpenFaq] = useState(null);
  const data = block.data || {};
  const paddingMap = { none: "py-0", sm: "py-4", md: "py-8", lg: "py-12", xl: "py-16" };
  const padCls = paddingMap[data.padding] || "py-8";
  const maxWMap = { sm: "max-w-sm", "2xl": "max-w-2xl", "4xl": "max-w-4xl", "6xl": "max-w-6xl", full: "w-full" };
  const maxWCls = maxWMap[data.max_width] || "max-w-4xl";

  // Render a column's content inline
  const renderColContent = (prefix, colData) => {
    const type = colData[`${prefix}_type`] || "text";
    switch (type) {
      case "text":
        return <div className="prose max-w-none ql-snow"><div className="ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: colData[`${prefix}_content`] || "<p>(empty)</p>" }} /></div>;
      case "image":
        return colData[`${prefix}_image`] ? <img src={colData[`${prefix}_image`]} className="w-full rounded-xl" alt="" /> : <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No image</div>;
      case "video":
        return colData[`${prefix}_embed_url`] ? <div className="aspect-video rounded-xl overflow-hidden"><iframe src={colData[`${prefix}_embed_url`]} className="w-full h-full" allowFullScreen /></div> : <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No video URL</div>;
      case "embed":
        return colData[`${prefix}_embed_code`] ? <div dangerouslySetInnerHTML={{ __html: colData[`${prefix}_embed_code`] }} /> : <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No embed code</div>;
      case "features":
        return (
          <ul className="space-y-2">
            {(colData[`${prefix}_features`] || []).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm"><span className="w-4 h-4 rounded-full bg-[#2A9D8F] text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>{f}</li>
            ))}
          </ul>
        );
      case "stats":
        return (
          <div className="grid grid-cols-2 gap-3">
            {(colData[`${prefix}_stats`] || []).map((s, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-black text-[#1B365D]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        );
      case "cta":
        return (
          <div className="p-4 rounded-xl text-center bg-[#1B365D] text-white">
            <h3 className="font-bold mb-1">{colData[`${prefix}_cta_title`] || "CTA Title"}</h3>
            <p className="text-sm opacity-70 mb-3">{colData[`${prefix}_cta_sub`]}</p>
            {colData[`${prefix}_cta_btn`] && <span className="inline-block px-4 py-1.5 bg-[#E8792F] rounded-full text-sm font-semibold">{colData[`${prefix}_cta_btn`]}</span>}
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-3">
            {(colData[`${prefix}_reviews`] || []).map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 border">
                <div className="flex gap-1 mb-1">{[...Array(r.rating || 5)].map((_, s) => <span key={s} className="text-yellow-400 text-xs">★</span>)}</div>
                <p className="text-xs text-gray-600">"{r.text}"</p>
                <p className="text-xs font-semibold mt-1">{r.name}</p>
              </div>
            ))}
          </div>
        );
      case "icon_cards":
        return (
          <div className="space-y-2">
            {(colData[`${prefix}_cards`] || []).map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">{c.icon}</span>
                <div><p className="font-semibold text-sm">{c.title}</p><p className="text-xs text-gray-500">{c.desc}</p></div>
              </div>
            ))}
          </div>
        );
      case "faq":
        return (
          <div className="space-y-2">
            {(colData[`${prefix}_faqs`] || []).map((f, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="p-3 font-medium text-sm">{f.question}</div>
                <div className="px-3 pb-3 text-xs text-gray-500">{f.answer}</div>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  switch (block.type) {
    case "hero":
      return (
        <div className="relative py-12 overflow-hidden rounded-xl" style={{ background: data.bg_color || "#1B365D" }}>
          {data.bg_image && (<><img src={data.bg_image} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="" /><div className="absolute inset-0 bg-black/50 rounded-xl" /></>)}
          <div className="relative text-center px-6 text-white">
            <h1 className="text-3xl font-black mb-2">{data.title || "(No title)"}</h1>
            {data.subtitle && <p className="text-lg opacity-80">{data.subtitle}</p>}
            {data.cta_text && <span className="inline-block mt-4 px-6 py-2 rounded-full font-semibold text-sm" style={{ background: data.cta_bg || "#E8792F" }}>{data.cta_text}</span>}
          </div>
        </div>
      );
    case "text":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`} style={{ background: data.bg_color || "transparent" }}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className="prose max-w-none ql-snow">
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: data.content || "<p>(No content)</p>" }} style={{ padding: 0 }} />
          </div>
        </div>
      );
    case "image": {
      const alignMap = { left: "mr-auto", center: "mx-auto", right: "ml-auto" };
      const radiusMap = { none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full" };
      const shadowMap = { none: "", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl" };
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.url ? <img src={data.url} alt={data.alt || ""} style={{ maxHeight: data.max_height !== "auto" ? data.max_height : undefined, objectFit: data.object_fit || "cover" }}
            className={`${alignMap[data.img_align] || "mx-auto"} ${radiusMap[data.border_radius] || "rounded-xl"} ${shadowMap[data.shadow] || "shadow"} w-full block`} />
            : <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Image className="w-8 h-8" /></div>}
          {data.caption && <p className="text-center text-sm text-gray-500 mt-2 italic">{data.caption}</p>}
        </div>
      );
    }
    case "gallery":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className={`grid grid-cols-${data.columns || 3} gap-3`}>
            {(data.images || []).map((url, i) => <img key={i} src={url} alt="" className={`w-full ${data.img_height || "h-40"} object-cover rounded-xl`} />)}
            {(data.images || []).length === 0 && <div className="col-span-3 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No images yet</div>}
          </div>
        </div>
      );
    case "video":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          {data.embed_url ? <div className="aspect-video rounded-xl overflow-hidden"><iframe src={data.embed_url} className="w-full h-full" allowFullScreen title="video" /></div>
            : <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Paste a video embed URL</div>}
        </div>
      );
    case "embed":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`} style={{ background: data.bg_color || "transparent" }}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          {data.embed_code ? <div dangerouslySetInnerHTML={{ __html: data.embed_code }} />
            : <div className="h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No embed code</div>}
        </div>
      );
    case "features_grid":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`} style={{ background: data.bg_color || "transparent" }}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-2">{data.title}</h2>}
          {data.subtitle && <p className="text-gray-500 mb-6">{data.subtitle}</p>}
          <div className={`grid grid-cols-${data.columns || 2} gap-3`}>
            {(data.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: data.item_bg || "#F9FAFB" }}>
                <span className="text-xl flex-shrink-0">{item.icon || "✓"}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: data.item_title_color || "#1B365D" }}>{item.title}</p>
                  {item.desc && <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "stats":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`} style={{ background: data.bg_color || "transparent" }}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-6 text-center">{data.title}</h2>}
          <div className={`grid grid-cols-${data.columns || 3} gap-4`}>
            {(data.items || []).map((item, i) => (
              <div key={i} className="text-center p-4 rounded-2xl" style={{ background: data.card_bg || "#F9FAFB" }}>
                <p className="text-4xl font-black" style={{ color: data.value_color || "#1B365D" }}>{item.value}</p>
                <p className="text-sm mt-1" style={{ color: data.label_color || "#6B7280" }}>{item.label}</p>
                {item.desc && <p className="text-xs text-gray-400 mt-1">{item.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case "icon_cards":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`} style={{ background: data.bg_color || "transparent" }}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-6">{data.title}</h2>}
          <div className={`grid grid-cols-${data.columns || 3} gap-4`}>
            {(data.items || []).map((item, i) => (
              <div key={i} className="p-4 rounded-2xl border text-center" style={{ background: data.card_bg || "#ffffff" }}>
                <span className="text-3xl">{item.icon}</span>
                <p className="font-semibold mt-2 text-sm">{item.title}</p>
                {item.desc && <p className="text-xs text-gray-500 mt-1">{item.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    case "faq":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className="space-y-2">
            {(data.items || []).map((faq, j) => (
              <div key={j} className="border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === j ? null : j)} className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50">
                  {faq.question || "(No question)"}
                  {openFaq === j ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openFaq === j && <div className="px-4 pb-4 text-sm text-gray-600">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="py-10 rounded-xl" style={{ background: data.bg_color || "#1B365D" }}>
          <div className="text-center px-6" style={{ color: data.text_color || "#ffffff" }}>
            <h2 className="text-2xl font-bold mb-2">{data.title || "(No title)"}</h2>
            {data.subtitle && <p className="opacity-70 mb-4">{data.subtitle}</p>}
            {data.button_text && <span className="inline-block px-6 py-2 rounded-full font-semibold text-white" style={{ background: data.button_bg || "#E8792F" }}>{data.button_text}</span>}
          </div>
        </div>
      );
    case "testimonials":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-6 text-center">{data.title}</h2>}
          <div className={`grid grid-cols-${data.columns || 2} gap-4`}>
            {(data.items || []).map((t, i) => (
              <div key={i} className="p-4 rounded-xl border" style={{ background: data.card_bg || "#ffffff" }}>
                <div className="flex gap-1 mb-2">{[...Array(t.rating || 5)].map((_, s) => <span key={s} className="text-yellow-400">★</span>)}</div>
                <p className="text-sm text-gray-600 mb-3">"{t.text}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "table":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              {(data.headers || []).length > 0 && (
                <thead style={{ background: data.header_bg || "#f9fafb" }}>
                  <tr>{data.headers.map((h, k) => <th key={k} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>)}</tr>
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
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          <div className="grid gap-6" style={{ gridTemplateColumns: `${data.left_width || 50}% ${100 - (data.left_width || 50)}%` }}>
            <div>
              {data.left_title && <h3 className="font-bold text-lg mb-3">{data.left_title}</h3>}
              {renderColContent("left", data)}
            </div>
            <div>
              {data.right_title && <h3 className="font-bold text-lg mb-3">{data.right_title}</h3>}
              {renderColContent("right", data)}
            </div>
          </div>
        </div>
      );
    case "contact_form":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {data.phone && <div className="flex gap-3 items-center"><span>📞</span><span>{data.phone}</span></div>}
              {data.email && <div className="flex gap-3 items-center"><span>✉️</span><span>{data.email}</span></div>}
              {data.address && <div className="flex gap-3 items-start"><span>📍</span><span>{data.address}</span></div>}
              {data.hours && <div className="flex gap-3 items-start"><span>🕐</span><span className="text-sm whitespace-pre-line">{data.hours}</span></div>}
            </div>
            <div className="space-y-2">
              <div className="h-8 rounded bg-gray-100 border px-3 flex items-center text-xs text-gray-400">Name</div>
              <div className="h-8 rounded bg-gray-100 border px-3 flex items-center text-xs text-gray-400">Email</div>
              <div className="h-16 rounded bg-gray-100 border px-3 py-2 text-xs text-gray-400">Message</div>
              <div className="h-9 rounded-full bg-[#E8792F] text-white flex items-center justify-center text-sm font-semibold">{data.button_text || "Send Message"}</div>
            </div>
          </div>
        </div>
      );
    case "divider":
      return (
        <div className={`${maxWCls} mx-auto px-4`} style={{ paddingTop: data.space_top || "2rem", paddingBottom: data.space_bottom || "2rem" }}>
          {data.style !== "blank" && <hr style={{ borderColor: data.line_color || "#e5e7eb", borderWidth: data.line_thickness || 1 }} />}
        </div>
      );
    default: return null;
  }
}

// ── Main page editor ──────────────────────────────────────────────────────────
export default function AdminPageEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("id");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: "", slug: "", status: "draft", show_in_nav: false,
    content_blocks: [], meta_title: "", meta_description: "",
  });

  const { data: existing } = useQuery({
    queryKey: ["page-edit", pageId],
    queryFn: async () => { const pages = await base44.entities.StaticPage.filter({ id: pageId }); return pages[0]; },
    enabled: !!pageId,
  });

  useEffect(() => {
    if (existing) setForm({ ...form, ...existing, content_blocks: existing.content_blocks || [] });
  }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (!data.slug) data.slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (pageId) await base44.entities.StaticPage.update(pageId, data);
    else await base44.entities.StaticPage.create(data);
    setSaving(false);
    navigate(createPageUrl("AdminPages"));
  };

  const addBlock = (type) => {
    const defaults = {
      faq: { title: "FAQ", items: [{ question: "", answer: "" }] },
      table: { title: "", headers: ["Column 1", "Column 2"], rows: [["", ""]] },
      gallery: { images: [], columns: 3 },
      testimonials: { items: [], columns: 2, card_bg: "#ffffff" },
      two_column: { left_content: "", left_type: "text", right_content: "", right_type: "text", left_width: 50 },
      features_grid: { items: [], columns: 2 },
      stats: { items: [], columns: 3 },
      icon_cards: { items: [], columns: 3 },
      contact_form: { button_text: "Send Message" },
    };
    const newBlock = { type, data: defaults[type] || {}, order: form.content_blocks.length };
    update("content_blocks", [...form.content_blocks, newBlock]);
    setExpandedBlock(form.content_blocks.length);
  };

  const updateBlock = (index, data) => {
    const blocks = [...form.content_blocks];
    blocks[index] = { ...blocks[index], data: { ...blocks[index].data, ...data } };
    update("content_blocks", blocks);
  };

  const removeBlock = (index) => update("content_blocks", form.content_blocks.filter((_, i) => i !== index));
  const moveBlock = (index, dir) => {
    const blocks = [...form.content_blocks];
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    blocks.forEach((b, i) => (b.order = i));
    update("content_blocks", blocks);
  };

  const renderBlockEditor = (block, index) => {
    const data = block.data || {};
    const upd = (patch) => updateBlock(index, patch);

    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => upd({ subtitle: e.target.value })} /></div>
            <div>
              <Label>CTA Button</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input placeholder="Button text" value={data.cta_text || ""} onChange={(e) => upd({ cta_text: e.target.value })} />
                <Input placeholder="Button link" value={data.cta_link || ""} onChange={(e) => upd({ cta_link: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="BG Color" value={data.bg_color} defaultVal="#1B365D" onChange={(v) => upd({ bg_color: v })} />
              <ColorRow label="Text Color" value={data.text_color} defaultVal="#ffffff" onChange={(v) => upd({ text_color: v })} />
              <ColorRow label="Button BG" value={data.cta_bg} defaultVal="#E8792F" onChange={(v) => upd({ cta_bg: v })} />
            </div>
            <ImageUploadField value={data.bg_image} onChange={(v) => upd({ bg_image: v })} label="Background Image" />
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div><Label>Section Title (optional)</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <RichTextEditor value={data.content || ""} onChange={(val) => upd({ content: val })} placeholder="Start typing..." minHeight={250} />
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <ImageUploadField value={data.url} onChange={(v) => upd({ url: v })} label="Image" />
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Alt Text</Label><Input className="text-xs" value={data.alt || ""} onChange={(e) => upd({ alt: e.target.value })} /></div>
              <div><Label className="text-xs">Caption</Label><Input className="text-xs" value={data.caption || ""} onChange={(e) => upd({ caption: e.target.value })} /></div>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Columns</Label>
                <Select value={String(data.columns || 3)} onValueChange={(v) => upd({ columns: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Photos</Label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {(data.images || []).map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button onClick={() => upd({ images: (data.images || []).filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
                <label className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 text-xs gap-1">
                  <Upload className="w-4 h-4" /> Add
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); upd({ images: [...(data.images || []), file_url] }); }} />
                </label>
              </div>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div>
              <Label>Video Embed URL</Label>
              <Input className="mt-1" placeholder="https://www.youtube.com/embed/VIDEO_ID" value={data.embed_url || ""} onChange={(e) => upd({ embed_url: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Use the embed URL format: youtube.com/embed/... or player.vimeo.com/video/...</p>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "embed":
        return (
          <div className="space-y-4">
            <div><Label>Section Title (optional)</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div>
              <Label>HTML / Embed Code</Label>
              <Textarea className="mt-1 font-mono text-xs" rows={6} placeholder="Paste any HTML, iframe, or embed code here..." value={data.embed_code || ""} onChange={(e) => upd({ embed_code: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Works with Google Maps, Calendly, Typeform, social posts, booking widgets, etc.</p>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "features_grid":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => upd({ subtitle: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Columns</Label>
                <Select value={String(data.columns || 2)} onValueChange={(v) => upd({ columns: parseInt(v) })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent>
                </Select>
              </div>
              <ColorRow label="Item BG" value={data.item_bg} defaultVal="#F9FAFB" onChange={(v) => upd({ item_bg: v })} />
            </div>
            <div className="space-y-2">
              {(data.items || []).map((item, j) => (
                <div key={j} className="flex gap-2 items-center">
                  <Input className="w-12 text-center text-xs h-8" placeholder="✓" value={item.icon || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], icon: e.target.value }; upd({ items }); }} />
                  <Input className="flex-1 text-xs h-8" placeholder="Feature title" value={item.title || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], title: e.target.value }; upd({ items }); }} />
                  <Input className="flex-1 text-xs h-8" placeholder="Description (optional)" value={item.desc || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], desc: e.target.value }; upd({ items }); }} />
                  <button onClick={() => { const items = (data.items || []).filter((_, i) => i !== j); upd({ items }); }} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { icon: "", title: "", desc: "" }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "stats":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Columns</Label>
                <Select value={String(data.columns || 3)} onValueChange={(v) => upd({ columns: parseInt(v) })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent>
                </Select>
              </div>
              <ColorRow label="Card BG" value={data.card_bg} defaultVal="#F9FAFB" onChange={(v) => upd({ card_bg: v })} />
            </div>
            <div className="space-y-2">
              {(data.items || []).map((item, j) => (
                <div key={j} className="flex gap-2 items-center">
                  <Input className="w-24 text-xs h-8 font-bold" placeholder="100+" value={item.value || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], value: e.target.value }; upd({ items }); }} />
                  <Input className="flex-1 text-xs h-8" placeholder="Label" value={item.label || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], label: e.target.value }; upd({ items }); }} />
                  <Input className="flex-1 text-xs h-8" placeholder="Description" value={item.desc || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], desc: e.target.value }; upd({ items }); }} />
                  <button onClick={() => { const items = (data.items || []).filter((_, i) => i !== j); upd({ items }); }} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { value: "", label: "", desc: "" }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add Stat
              </Button>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "icon_cards":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Columns</Label>
                <Select value={String(data.columns || 3)} onValueChange={(v) => upd({ columns: parseInt(v) })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem></SelectContent>
                </Select>
              </div>
              <ColorRow label="Card BG" value={data.card_bg} defaultVal="#ffffff" onChange={(v) => upd({ card_bg: v })} />
            </div>
            <div className="space-y-2">
              {(data.items || []).map((item, j) => (
                <div key={j} className="flex gap-2 items-start">
                  <Input className="w-12 text-center text-lg h-8" placeholder="🏠" value={item.icon || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], icon: e.target.value }; upd({ items }); }} />
                  <Input className="flex-1 text-xs h-8" placeholder="Card title" value={item.title || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], title: e.target.value }; upd({ items }); }} />
                  <Input className="flex-1 text-xs h-8" placeholder="Description" value={item.desc || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], desc: e.target.value }; upd({ items }); }} />
                  <button onClick={() => { const items = (data.items || []).filter((_, i) => i !== j); upd({ items }); }} className="text-red-400 mt-1.5"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { icon: "", title: "", desc: "" }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add Card
              </Button>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "cta":
        return (
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => upd({ subtitle: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Button Text</Label><Input value={data.button_text || ""} onChange={(e) => upd({ button_text: e.target.value })} /></div>
              <div><Label>Button Link</Label><Input value={data.button_link || ""} onChange={(e) => upd({ button_link: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="BG Color" value={data.bg_color} defaultVal="#1B365D" onChange={(v) => upd({ bg_color: v })} />
              <ColorRow label="Text Color" value={data.text_color} defaultVal="#ffffff" onChange={(v) => upd({ text_color: v })} />
              <ColorRow label="Button BG" value={data.button_bg} defaultVal="#E8792F" onChange={(v) => upd({ button_bg: v })} />
              <ColorRow label="Button Text" value={data.button_text_color} defaultVal="#ffffff" onChange={(v) => upd({ button_text_color: v })} />
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="space-y-3">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            {(data.items || []).map((item, j) => (
              <div key={j} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Item {j + 1}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => { const items = [...(data.items || [])]; items.splice(j, 1); upd({ items }); }}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <Input placeholder="Question" value={item.question} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], question: e.target.value }; upd({ items }); }} />
                <Textarea rows={2} placeholder="Answer" value={item.answer} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], answer: e.target.value }; upd({ items }); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { question: "", answer: "" }] })}><Plus className="w-3 h-3 mr-1" /> Add Item</Button>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "table":
        return <div className="space-y-4"><TableEditor data={data} onChange={upd} /><BlockStylePanel data={data} onChange={upd} /></div>;

      case "two_column":
        return (
          <div className="space-y-4">
            <div>
              <Label>Column Split (%)</Label>
              <div className="flex items-center gap-3 mt-1">
                <input type="range" min={20} max={80} step={5} value={data.left_width || 50} onChange={(e) => upd({ left_width: parseInt(e.target.value) })} className="flex-1" />
                <span className="text-sm font-mono w-20 text-right">{data.left_width || 50}% / {100 - (data.left_width || 50)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ColumnEditor prefix="left" data={data} onChange={upd} />
              <ColumnEditor prefix="right" data={data} onChange={upd} />
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "testimonials":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Columns</Label>
                <Select value={String(data.columns || 2)} onValueChange={(v) => upd({ columns: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent>
                </Select>
              </div>
              <ColorRow label="Card BG" value={data.card_bg} defaultVal="#ffffff" onChange={(v) => upd({ card_bg: v })} />
            </div>
            {(data.items || []).map((item, j) => (
              <div key={j} className="p-3 bg-gray-50 rounded-lg space-y-2 border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Review {j + 1}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => { const items = [...(data.items || [])]; items.splice(j, 1); upd({ items }); }}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" value={item.name || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], name: e.target.value }; upd({ items }); }} />
                  <Input type="number" min={1} max={5} placeholder="Rating (1-5)" value={item.rating || 5} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], rating: parseInt(e.target.value) }; upd({ items }); }} />
                </div>
                <Textarea rows={2} placeholder="Review text" value={item.text || ""} onChange={(e) => { const items = [...(data.items || [])]; items[j] = { ...items[j], text: e.target.value }; upd({ items }); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { name: "", text: "", rating: 5 }] })}><Plus className="w-3 h-3 mr-1" /> Add Review</Button>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "contact_form":
        return (
          <div className="space-y-4">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Phone</Label><Input className="text-xs" value={data.phone || ""} onChange={(e) => upd({ phone: e.target.value })} /></div>
              <div><Label className="text-xs">Email</Label><Input className="text-xs" value={data.email || ""} onChange={(e) => upd({ email: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Address</Label><Input className="text-xs" value={data.address || ""} onChange={(e) => upd({ address: e.target.value })} /></div>
            <div><Label className="text-xs">Hours (text)</Label><Textarea rows={3} className="text-xs" value={data.hours || ""} onChange={(e) => upd({ hours: e.target.value })} /></div>
            <div><Label className="text-xs">Button Text</Label><Input className="text-xs" value={data.button_text || "Send Message"} onChange={(e) => upd({ button_text: e.target.value })} /></div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "divider":
        return (
          <div className="space-y-3">
            <div>
              <Label>Style</Label>
              <Select value={data.style || "line"} onValueChange={(v) => upd({ style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Solid Line</SelectItem>
                  <SelectItem value="dashed">Dashed Line</SelectItem>
                  <SelectItem value="blank">Blank Space Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Space Above</Label>
                <Select value={data.space_top || "2rem"} onValueChange={(v) => upd({ space_top: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="0">None</SelectItem><SelectItem value="1rem">Small</SelectItem><SelectItem value="2rem">Medium</SelectItem><SelectItem value="4rem">Large</SelectItem><SelectItem value="6rem">X-Large</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Space Below</Label>
                <Select value={data.space_bottom || "2rem"} onValueChange={(v) => upd({ space_bottom: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="0">None</SelectItem><SelectItem value="1rem">Small</SelectItem><SelectItem value="2rem">Medium</SelectItem><SelectItem value="4rem">Large</SelectItem><SelectItem value="6rem">X-Large</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {data.style !== "blank" && <ColorRow label="Line Color" value={data.line_color} defaultVal="#e5e7eb" onChange={(v) => upd({ line_color: v })} />}
          </div>
        );

      default: return null;
    }
  };

  const sortedBlocks = [...form.content_blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminPages"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{pageId ? "Edit Page" : "New Page"}</h1>
        {form.slug && form.status === "published" && (
          <a href={`/page/${form.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 rounded-full border-green-300 text-green-700 hover:bg-green-50">
              <Globe className="w-4 h-4" /> Live
            </Button>
          </a>
        )}
        <Button variant="outline" className="gap-2 rounded-full" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`overflow-y-auto p-6 space-y-6 ${showPreview ? "w-1/2 border-r" : "w-full max-w-5xl mx-auto"}`}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto-generated" /></div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v)}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.show_in_nav} onCheckedChange={(v) => update("show_in_nav", v)} />
                  <Label>Show in navigation</Label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Meta Title</Label><Input value={form.meta_title} onChange={(e) => update("meta_title", e.target.value)} /></div>
                <div><Label>Meta Description</Label><Input value={form.meta_description} onChange={(e) => update("meta_description", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Blocks</CardTitle>
                <Select onValueChange={addBlock}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="+ Add a block..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blockTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {form.content_blocks.length === 0 && (
                <p className="text-center text-gray-400 py-8">No content blocks yet. Add one above.</p>
              )}
              {form.content_blocks.map((block, i) => (
                <div key={i} className="border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer select-none" onClick={() => setExpandedBlock(expandedBlock === i ? null : i)}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(i, -1); }} className="text-gray-400 hover:text-gray-600"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(i, 1); }} className="text-gray-400 hover:text-gray-600"><ChevronDown className="w-3 h-3" /></button>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-white px-2 py-1 rounded border">
                        {blockTypes.find(t => t.value === block.type)?.label || block.type}
                      </span>
                      <span className="text-sm text-gray-700">{block.data?.title || ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); removeBlock(i); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedBlock === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {expandedBlock === i && (
                    <div className="p-4 border-t">{renderBlockEditor(block, i)}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <div className="w-1/2 overflow-y-auto bg-white">
            <div className="sticky top-0 bg-gray-100 border-b px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Live Preview — {form.title || "Untitled Page"}
            </div>
            <div className="p-4 space-y-4">
              {sortedBlocks.length === 0 ? (
                <div className="text-center py-20 text-gray-400">Add content blocks to preview them here.</div>
              ) : (
                sortedBlocks.map((block, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border">
                    <BlockPreview block={block} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}