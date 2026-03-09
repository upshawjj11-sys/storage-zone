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

const blockTypes = [
  { value: "hero", label: "Hero Banner" },
  { value: "text", label: "Text / Rich Content" },
  { value: "image", label: "Image" },
  { value: "gallery", label: "Photo Gallery" },
  { value: "video", label: "Video Embed" },
  { value: "cta", label: "Call to Action" },
  { value: "faq", label: "FAQ Accordion" },
  { value: "table", label: "Table" },
  { value: "two_column", label: "Two Columns" },
  { value: "testimonials", label: "Testimonials" },
  { value: "divider", label: "Divider / Spacer" },
];

// ── Shared color picker row ──────────────────────────────────────────────────
function ColorRow({ label, value, defaultVal, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs w-24 flex-shrink-0">{label}</Label>
      <input type="color" value={value || defaultVal} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border cursor-pointer p-0.5" />
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={defaultVal} className="text-xs w-28" />
    </div>
  );
}



// ── Image settings panel ─────────────────────────────────────────────────────
function ImageSettingsPanel({ data, onChange }) {
  return (
    <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Image Settings</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Object Fit</Label>
          <Select value={data.object_fit || "cover"} onValueChange={(v) => onChange({ object_fit: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (fill area)</SelectItem>
              <SelectItem value="contain">Contain (fit inside)</SelectItem>
              <SelectItem value="fill">Stretch</SelectItem>
              <SelectItem value="none">Original size</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Max Height</Label>
          <Select value={data.max_height || "auto"} onValueChange={(v) => onChange({ max_height: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="200px">Small (200px)</SelectItem>
              <SelectItem value="400px">Medium (400px)</SelectItem>
              <SelectItem value="600px">Large (600px)</SelectItem>
              <SelectItem value="800px">X-Large (800px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Border Radius</Label>
          <Select value={data.border_radius || "xl"} onValueChange={(v) => onChange({ border_radius: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">X-Large</SelectItem>
              <SelectItem value="full">Full (circle)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Alignment</Label>
          <Select value={data.img_align || "center"} onValueChange={(v) => onChange({ img_align: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Shadow</Label>
          <Select value={data.shadow || "md"} onValueChange={(v) => onChange({ shadow: v })}>
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
          <Label className="text-xs">Width</Label>
          <Select value={data.img_width || "full"} onValueChange={(v) => onChange({ img_width: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="1/2">Half width</SelectItem>
              <SelectItem value="2/3">Two-thirds</SelectItem>
              <SelectItem value="3/4">Three-quarters</SelectItem>
              <SelectItem value="full">Full width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={!!data.link_enabled} onCheckedChange={(v) => onChange({ link_enabled: v })} />
        <Label className="text-xs">Make image clickable / linked</Label>
      </div>
      {data.link_enabled && (
        <Input className="h-8 text-xs" placeholder="https://..." value={data.link_url || ""} onChange={(e) => onChange({ link_url: e.target.value })} />
      )}
    </div>
  );
}

// ── Section padding/bg panel ─────────────────────────────────────────────────
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

// ── Live preview ─────────────────────────────────────────────────────────────
function BlockPreview({ block }) {
  const [openFaq, setOpenFaq] = useState(null);
  const data = block.data || {};
  const paddingMap = { none: "py-0", sm: "py-4", md: "py-8", lg: "py-12", xl: "py-16" };
  const padCls = paddingMap[data.padding] || "py-8";
  const maxWMap = { sm: "max-w-sm", "2xl": "max-w-2xl", "4xl": "max-w-4xl", "6xl": "max-w-6xl", full: "w-full" };
  const maxWCls = maxWMap[data.max_width] || "max-w-4xl";

  switch (block.type) {
    case "hero":
      return (
        <div className="relative py-12 md:py-16 overflow-hidden rounded-xl" style={{ background: data.bg_color || "#1B365D" }}>
          {data.bg_image && (<><img src={data.bg_image} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="" /><div className="absolute inset-0 bg-black/50 rounded-xl" /></>)}
          <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-black mb-3">{data.title || "(No title)"}</h1>
            {data.subtitle && <p className="text-lg text-white/80">{data.subtitle}</p>}
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
      const widthMap = { auto: "w-auto", "1/2": "w-1/2", "2/3": "w-2/3", "3/4": "w-3/4", full: "w-full" };
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.url ? (
            <img src={data.url} alt={data.alt || ""} style={{ maxHeight: data.max_height !== "auto" ? data.max_height : undefined, objectFit: data.object_fit || "cover" }}
              className={`${alignMap[data.img_align] || "mx-auto"} ${radiusMap[data.border_radius] || "rounded-xl"} ${shadowMap[data.shadow] || "shadow"} ${widthMap[data.img_width] || "w-full"} block`}
            />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Image className="w-8 h-8" /></div>
          )}
          {data.caption && <p className="text-center text-sm text-gray-500 mt-2 italic">{data.caption}</p>}
        </div>
      );
    }
    case "gallery": {
      const cols = data.columns || 3;
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className={`grid grid-cols-${cols} gap-3`}>
            {(data.images || []).map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-40 object-cover rounded-xl" />
            ))}
            {(data.images || []).length === 0 && <div className="col-span-3 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">No images yet</div>}
          </div>
        </div>
      );
    }
    case "video":
      return (
        <div className={`${maxWCls} mx-auto px-4 ${padCls}`}>
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          {data.embed_url ? (
            <div className="aspect-video rounded-xl overflow-hidden">
              <iframe src={data.embed_url} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title="video" />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">Paste a video embed URL</div>
          )}
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
                  {openFaq === j ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {openFaq === j && <div className="px-4 pb-4 text-sm text-gray-600">{faq.answer || "(No answer)"}</div>}
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
            {data.button_text && (
              <span className="inline-block px-6 py-2 rounded-full font-semibold text-white" style={{ background: data.button_bg || "#E8792F" }}>{data.button_text}</span>
            )}
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
                  <tr>{data.headers.map((h, k) => <th key={k} className="px-4 py-3 text-left font-semibold text-gray-700">{h || `Col ${k+1}`}</th>)}</tr>
                </thead>
              )}
              <tbody>
                {(data.rows || []).map((row, j) => (
                  <tr key={j} className="border-t" style={{ background: j % 2 === 0 ? (data.row_even_bg || "#ffffff") : (data.row_odd_bg || "#f9fafb") }}>
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
          <div className={`grid grid-cols-2 gap-6`} style={{ gridTemplateColumns: `${data.left_width || 50}% ${100 - (data.left_width || 50)}%` }}>
            <div className="prose max-w-none">
              {data.left_title && <h3 className="font-bold text-lg">{data.left_title}</h3>}
              <ReactMarkdown>{data.left_content || "(Left column empty)"}</ReactMarkdown>
            </div>
            <div className="prose max-w-none">
              {data.right_title && <h3 className="font-bold text-lg">{data.right_title}</h3>}
              {data.right_image ? <img src={data.right_image} className="w-full rounded-xl" alt="" /> : <ReactMarkdown>{data.right_content || "(Right column empty)"}</ReactMarkdown>}
            </div>
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
    case "divider":
      return (
        <div className={`${maxWCls} mx-auto px-4`} style={{ paddingTop: data.space_top || "2rem", paddingBottom: data.space_bottom || "2rem" }}>
          {data.style !== "blank" && <hr style={{ borderColor: data.line_color || "#e5e7eb", borderWidth: data.line_thickness || 1 }} />}
        </div>
      );
    default:
      return null;
  }
}

// ── Block editors ─────────────────────────────────────────────────────────────
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

// ── Main page ─────────────────────────────────────────────────────────────────
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
    if (pageId) { await base44.entities.StaticPage.update(pageId, data); }
    else { await base44.entities.StaticPage.create(data); }
    setSaving(false);
    navigate(createPageUrl("AdminPages"));
  };

  const addBlock = (type) => {
    const newBlock = { type, data: {}, order: form.content_blocks.length };
    if (type === "faq") newBlock.data = { title: "FAQ", items: [{ question: "", answer: "" }] };
    if (type === "table") newBlock.data = { title: "", headers: ["Column 1", "Column 2"], rows: [["", ""]] };
    if (type === "gallery") newBlock.data = { images: [], columns: 3 };
    if (type === "testimonials") newBlock.data = { items: [], columns: 2, card_bg: "#ffffff" };
    if (type === "two_column") newBlock.data = { left_content: "", right_content: "", left_width: 50 };
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
            <div>
              <Label>Background Image</Label>
              <div className="space-y-2 mt-1">
                <div className="flex gap-2 items-center">
                  <Input placeholder="Paste image URL..." value={data.bg_image || ""} onChange={(e) => upd({ bg_image: e.target.value })} />
                  {data.bg_image && <button onClick={() => upd({ bg_image: "" })} className="text-red-400 hover:text-red-600 flex-shrink-0"><X className="w-4 h-4" /></button>}
                </div>
                <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit text-sm text-gray-600">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); upd({ bg_image: file_url }); }} />
                </label>
                {data.bg_image && <img src={data.bg_image} alt="" className="w-full h-28 object-cover rounded-lg border" />}
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div><Label>Section Title (optional)</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div>
              <Label className="mb-2 block">Content</Label>
              <RichTextEditor
                value={data.content || ""}
                onChange={(val) => upd({ content: val })}
                placeholder="Start typing your content..."
                minHeight={250}
              />
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <div className="space-y-2 mt-1">
                <div className="flex gap-2 items-center">
                  <Input placeholder="Paste image URL..." value={data.url || ""} onChange={(e) => upd({ url: e.target.value })} />
                  {data.url && <button onClick={() => upd({ url: "" })} className="text-red-400 hover:text-red-600 flex-shrink-0"><X className="w-4 h-4" /></button>}
                </div>
                <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit text-sm text-gray-600">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); upd({ url: file_url }); }} />
                </label>
              </div>
            </div>
            {data.url && <img src={data.url} alt="" className="w-full h-40 object-cover rounded-xl" />}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Alt Text</Label><Input value={data.alt || ""} onChange={(e) => upd({ alt: e.target.value })} /></div>
              <div><Label>Caption</Label><Input value={data.caption || ""} onChange={(e) => upd({ caption: e.target.value })} /></div>
            </div>
            <ImageSettingsPanel data={data} onChange={upd} />
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-4">
            <div><Label>Section Title (optional)</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Columns</Label>
                <Select value={String(data.columns || 3)} onValueChange={(v) => upd({ columns: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image Height</Label>
                <Select value={data.img_height || "h-40"} onValueChange={(v) => upd({ img_height: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h-24">Small (96px)</SelectItem>
                    <SelectItem value="h-40">Medium (160px)</SelectItem>
                    <SelectItem value="h-56">Large (224px)</SelectItem>
                    <SelectItem value="h-72">X-Large (288px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Photos</Label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {(data.images || []).map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button onClick={() => upd({ images: (data.images || []).filter((_, j) => j !== i) })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                  </div>
                ))}
                <label className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition text-gray-400 text-xs gap-1">
                  <Upload className="w-4 h-4" /> Add Photo
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); upd({ images: [...(data.images || []), file_url] }); }} />
                </label>
              </div>
            </div>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <div><Label>Section Title (optional)</Label><Input value={data.title || ""} onChange={(e) => upd({ title: e.target.value })} /></div>
            <div>
              <Label>Video Embed URL</Label>
              <Input className="mt-1" placeholder="https://www.youtube.com/embed/VIDEO_ID" value={data.embed_url || ""} onChange={(e) => upd({ embed_url: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Use the embed URL format: youtube.com/embed/... or player.vimeo.com/video/...</p>
            </div>
            <div>
              <Label>Aspect Ratio</Label>
              <Select value={data.aspect || "16/9"} onValueChange={(v) => upd({ aspect: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="16/9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="4/3">4:3 (Standard)</SelectItem>
                  <SelectItem value="1/1">1:1 (Square)</SelectItem>
                  <SelectItem value="9/16">9:16 (Vertical)</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-2 gap-3">
              <ColorRow label="Border Color" value={data.border_color} defaultVal="#e5e7eb" onChange={(v) => upd({ border_color: v })} />
              <ColorRow label="Answer Text" value={data.answer_color} defaultVal="#4b5563" onChange={(v) => upd({ answer_color: v })} />
            </div>
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
            <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { question: "", answer: "" }] })}>
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

      case "table":
        return (
          <div className="space-y-4">
            <TableEditor data={data} onChange={upd} />
            <BlockStylePanel data={data} onChange={upd} />
          </div>
        );

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
              <div className="space-y-2 p-3 bg-gray-50 rounded-xl border">
                <p className="text-xs font-semibold text-gray-500">Left Column</p>
                <div><Label className="text-xs">Heading</Label><Input className="mt-1 text-sm h-8" value={data.left_title || ""} onChange={(e) => upd({ left_title: e.target.value })} /></div>
                <Textarea rows={5} placeholder="Content (Markdown supported)" value={data.left_content || ""} onChange={(e) => upd({ left_content: e.target.value })} className="text-xs" />
              </div>
              <div className="space-y-2 p-3 bg-gray-50 rounded-xl border">
                <p className="text-xs font-semibold text-gray-500">Right Column</p>
                <div><Label className="text-xs">Heading</Label><Input className="mt-1 text-sm h-8" value={data.right_title || ""} onChange={(e) => upd({ right_title: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">Content Type</Label>
                  <Select value={data.right_type || "text"} onValueChange={(v) => upd({ right_type: v })}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text / Markdown</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(data.right_type || "text") === "text" ? (
                  <Textarea rows={5} placeholder="Content (Markdown supported)" value={data.right_content || ""} onChange={(e) => upd({ right_content: e.target.value })} className="text-xs" />
                ) : (
                  <div className="space-y-2">
                    <Input className="text-xs" placeholder="Image URL" value={data.right_image || ""} onChange={(e) => upd({ right_image: e.target.value })} />
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-gray-800">
                      <Upload className="w-3 h-3" /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const { file_url } = await base44.integrations.Core.UploadFile({ file }); upd({ right_image: file_url }); }} />
                    </label>
                    {data.right_image && <img src={data.right_image} alt="" className="w-full h-24 object-cover rounded-lg" />}
                  </div>
                )}
              </div>
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
                  <SelectContent>
                    <SelectItem value="1">1 column</SelectItem>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                  </SelectContent>
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
            <Button variant="outline" size="sm" onClick={() => upd({ items: [...(data.items || []), { name: "", text: "", rating: 5 }] })}>
              <Plus className="w-3 h-3 mr-1" /> Add Review
            </Button>
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
                  <SelectItem value="dotted">Dotted Line</SelectItem>
                  <SelectItem value="blank">Blank Space Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Space Above</Label>
                <Select value={data.space_top || "2rem"} onValueChange={(v) => upd({ space_top: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1rem">Small (1rem)</SelectItem>
                    <SelectItem value="2rem">Medium (2rem)</SelectItem>
                    <SelectItem value="4rem">Large (4rem)</SelectItem>
                    <SelectItem value="6rem">X-Large (6rem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Space Below</Label>
                <Select value={data.space_bottom || "2rem"} onValueChange={(v) => upd({ space_bottom: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1rem">Small (1rem)</SelectItem>
                    <SelectItem value="2rem">Medium (2rem)</SelectItem>
                    <SelectItem value="4rem">Large (4rem)</SelectItem>
                    <SelectItem value="6rem">X-Large (6rem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {data.style !== "blank" && (
              <div className="grid grid-cols-2 gap-3">
                <ColorRow label="Line Color" value={data.line_color} defaultVal="#e5e7eb" onChange={(v) => upd({ line_color: v })} />
                <div>
                  <Label className="text-xs">Thickness</Label>
                  <Select value={String(data.line_thickness || 1)} onValueChange={(v) => upd({ line_thickness: parseInt(v) })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1px</SelectItem>
                      <SelectItem value="2">2px</SelectItem>
                      <SelectItem value="4">4px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const sortedBlocks = [...form.content_blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
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

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className={`overflow-y-auto p-6 space-y-6 ${showPreview ? "w-1/2 border-r" : "w-full max-w-5xl mx-auto"}`}>
          {/* Page settings */}
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
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
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

          {/* Content blocks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Blocks</CardTitle>
                <Select onValueChange={addBlock}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="+ Add a block..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blockTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
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

        {/* Preview panel */}
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