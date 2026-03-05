import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from "react-markdown";

const blockTypes = [
  { value: "hero", label: "Hero Banner" },
  { value: "text", label: "Text / Markdown" },
  { value: "image", label: "Image" },
  { value: "faq", label: "FAQ Section" },
  { value: "cta", label: "Call to Action" },
  { value: "table", label: "Table" },
];

// ── Live preview renderer ──────────────────────────────────────────────────────
function BlockPreview({ block }) {
  const [openFaq, setOpenFaq] = useState(null);
  const data = block.data || {};
  switch (block.type) {
    case "hero":
      return (
        <div className="relative py-12 md:py-16 overflow-hidden rounded-xl" style={{ background: data.bg_color || "#1B365D" }}>
          {data.bg_image && (
            <>
              <img src={data.bg_image} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="" />
              <div className="absolute inset-0 bg-black/50 rounded-xl" />
            </>
          )}
          <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
            <h1 className="text-3xl md:text-4xl font-black mb-3">{data.title || "(No title)"}</h1>
            {data.subtitle && <p className="text-lg text-white/80">{data.subtitle}</p>}
          </div>
        </div>
      );
    case "text":
      return (
        <div className="max-w-4xl mx-auto px-2 py-4">
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className="prose max-w-none text-gray-600">
            <ReactMarkdown>{data.content || "(No content)"}</ReactMarkdown>
          </div>
        </div>
      );
    case "image":
      return (
        <div className="max-w-4xl mx-auto px-2 py-4">
          {data.url ? (
            <img src={data.url} alt={data.alt || ""} className="w-full rounded-xl shadow" />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">(No image URL)</div>
          )}
          {data.caption && <p className="text-center text-sm text-gray-500 mt-2">{data.caption}</p>}
        </div>
      );
    case "faq":
      return (
        <div className="max-w-4xl mx-auto px-2 py-4">
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
          <div className="text-center text-white px-6">
            <h2 className="text-2xl font-bold mb-2">{data.title || "(No title)"}</h2>
            {data.subtitle && <p className="text-white/70 mb-4">{data.subtitle}</p>}
            {data.button_text && (
              <span className="inline-block px-6 py-2 bg-[#E8792F] text-white rounded-full font-semibold">{data.button_text}</span>
            )}
          </div>
        </div>
      );
    case "table":
      return (
        <div className="max-w-4xl mx-auto px-2 py-4">
          {data.title && <h2 className="text-2xl font-bold text-[#1B365D] mb-4">{data.title}</h2>}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              {(data.headers || []).length > 0 && (
                <thead className="bg-gray-50">
                  <tr>{data.headers.map((h, k) => <th key={k} className="px-4 py-3 text-left font-semibold text-gray-700">{h || `Col ${k+1}`}</th>)}</tr>
                </thead>
              )}
              <tbody>
                {(data.rows || []).map((row, j) => (
                  <tr key={j} className="border-t">
                    {row.map((cell, k) => <td key={k} className="px-4 py-3 text-gray-600">{cell}</td>)}
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
}

// ── Block editors ──────────────────────────────────────────────────────────────
function TableEditor({ data, onChange }) {
  const headers = data.headers || ["Column 1", "Column 2"];
  const rows = data.rows || [];

  const updateHeader = (i, val) => {
    const h = [...headers]; h[i] = val; onChange({ headers: h });
  };
  const addColumn = () => {
    const h = [...headers, `Column ${headers.length + 1}`];
    const r = rows.map(row => [...row, ""]);
    onChange({ headers: h, rows: r });
  };
  const removeColumn = (ci) => {
    const h = headers.filter((_, i) => i !== ci);
    const r = rows.map(row => row.filter((_, i) => i !== ci));
    onChange({ headers: h, rows: r });
  };
  const updateCell = (ri, ci, val) => {
    const r = rows.map((row, i) => i === ri ? row.map((c, j) => j === ci ? val : c) : row);
    onChange({ rows: r });
  };
  const addRow = () => onChange({ rows: [...rows, headers.map(() => "")] });
  const removeRow = (ri) => onChange({ rows: rows.filter((_, i) => i !== ri) });

  return (
    <div className="space-y-3">
      <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} /></div>
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
                      {headers.length > 1 && (
                        <button onClick={() => removeColumn(ci)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3 h-3" /></button>
                      )}
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
                  <td className="px-1 py-1">
                    <button onClick={() => removeRow(ri)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </td>
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
    queryFn: async () => {
      const pages = await base44.entities.StaticPage.filter({ id: pageId });
      return pages[0];
    },
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
    if (pageId) {
      await base44.entities.StaticPage.update(pageId, data);
    } else {
      await base44.entities.StaticPage.create(data);
    }
    setSaving(false);
    navigate(createPageUrl("AdminPages"));
  };

  const addBlock = (type) => {
    const newBlock = { type, data: {}, order: form.content_blocks.length };
    if (type === "faq") newBlock.data = { title: "FAQ", items: [{ question: "", answer: "" }] };
    if (type === "table") newBlock.data = { title: "", headers: ["Column 1", "Column 2"], rows: [["", ""]] };
    update("content_blocks", [...form.content_blocks, newBlock]);
    setExpandedBlock(form.content_blocks.length);
  };

  const updateBlock = (index, data) => {
    const blocks = [...form.content_blocks];
    blocks[index] = { ...blocks[index], data: { ...blocks[index].data, ...data } };
    update("content_blocks", blocks);
  };

  const removeBlock = (index) => {
    update("content_blocks", form.content_blocks.filter((_, i) => i !== index));
  };

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
    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => updateBlock(index, { subtitle: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Background Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.bg_color || "#1B365D"} onChange={(e) => updateBlock(index, { bg_color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={data.bg_color || "#1B365D"} onChange={(e) => updateBlock(index, { bg_color: e.target.value })} className="text-xs" />
                </div>
              </div>
            </div>
            <div><Label>Background Image URL</Label><Input value={data.bg_image || ""} onChange={(e) => updateBlock(index, { bg_image: e.target.value })} /></div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-3">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></div>
            <div><Label>Content (Markdown supported)</Label><Textarea rows={8} value={data.content || ""} onChange={(e) => updateBlock(index, { content: e.target.value })} /></div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-3">
            <div><Label>Image URL</Label><Input value={data.url || ""} onChange={(e) => updateBlock(index, { url: e.target.value })} /></div>
            {data.url && <img src={data.url} alt="" className="w-full h-40 object-cover rounded-xl" />}
            <div><Label>Alt Text</Label><Input value={data.alt || ""} onChange={(e) => updateBlock(index, { alt: e.target.value })} /></div>
            <div><Label>Caption</Label><Input value={data.caption || ""} onChange={(e) => updateBlock(index, { caption: e.target.value })} /></div>
          </div>
        );
      case "cta":
        return (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => updateBlock(index, { subtitle: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Button Text</Label><Input value={data.button_text || ""} onChange={(e) => updateBlock(index, { button_text: e.target.value })} /></div>
              <div><Label>Button Link</Label><Input value={data.button_link || ""} onChange={(e) => updateBlock(index, { button_link: e.target.value })} /></div>
            </div>
            <div>
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={data.bg_color || "#1B365D"} onChange={(e) => updateBlock(index, { bg_color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                <Input value={data.bg_color || "#1B365D"} onChange={(e) => updateBlock(index, { bg_color: e.target.value })} className="text-xs" />
              </div>
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-3">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></div>
            {(data.items || []).map((item, j) => (
              <div key={j} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Item {j + 1}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => {
                    const items = [...(data.items || [])]; items.splice(j, 1); updateBlock(index, { items });
                  }}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <Input placeholder="Question" value={item.question} onChange={(e) => {
                  const items = [...(data.items || [])]; items[j] = { ...items[j], question: e.target.value }; updateBlock(index, { items });
                }} />
                <Textarea rows={2} placeholder="Answer" value={item.answer} onChange={(e) => {
                  const items = [...(data.items || [])]; items[j] = { ...items[j], answer: e.target.value }; updateBlock(index, { items });
                }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => updateBlock(index, { items: [...(data.items || []), { question: "", answer: "" }] })}>
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </div>
        );
      case "table":
        return (
          <TableEditor
            data={data}
            onChange={(patch) => updateBlock(index, patch)}
          />
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
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Body: editor + optional preview */}
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
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Add a block..." />
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
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer select-none"
                    onClick={() => setExpandedBlock(expandedBlock === i ? null : i)}
                  >
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