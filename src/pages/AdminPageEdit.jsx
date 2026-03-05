import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const blockTypes = [
  { value: "hero", label: "Hero Banner" },
  { value: "text", label: "Text / Markdown" },
  { value: "image", label: "Image" },
  { value: "faq", label: "FAQ Section" },
  { value: "cta", label: "Call to Action" },
  { value: "table", label: "Table" },
];

export default function AdminPageEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("id");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
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
            <div><Label>Background Color</Label><Input value={data.bg_color || "#1B365D"} onChange={(e) => updateBlock(index, { bg_color: e.target.value })} /></div>
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
            <div><Label>Alt Text</Label><Input value={data.alt || ""} onChange={(e) => updateBlock(index, { alt: e.target.value })} /></div>
            <div><Label>Caption</Label><Input value={data.caption || ""} onChange={(e) => updateBlock(index, { caption: e.target.value })} /></div>
          </div>
        );
      case "cta":
        return (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={(e) => updateBlock(index, { subtitle: e.target.value })} /></div>
            <div><Label>Button Text</Label><Input value={data.button_text || ""} onChange={(e) => updateBlock(index, { button_text: e.target.value })} /></div>
            <div><Label>Button Link</Label><Input value={data.button_link || ""} onChange={(e) => updateBlock(index, { button_link: e.target.value })} /></div>
            <div><Label>Background Color</Label><Input value={data.bg_color || "#1B365D"} onChange={(e) => updateBlock(index, { bg_color: e.target.value })} /></div>
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
                <Textarea placeholder="Answer" value={item.answer} onChange={(e) => {
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
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></div>
            <div>
              <Label>Headers (comma separated)</Label>
              <Input value={(data.headers || []).join(", ")} onChange={(e) => updateBlock(index, { headers: e.target.value.split(",").map(s => s.trim()) })} />
            </div>
            <div>
              <Label>Rows</Label>
              {(data.rows || []).map((row, j) => (
                <div key={j} className="flex gap-2 mb-2">
                  <Input value={row.join(", ")} onChange={(e) => {
                    const rows = [...(data.rows || [])]; rows[j] = e.target.value.split(",").map(s => s.trim()); updateBlock(index, { rows });
                  }} />
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                    const rows = [...(data.rows || [])]; rows.splice(j, 1); updateBlock(index, { rows });
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateBlock(index, { rows: [...(data.rows || []), (data.headers || []).map(() => "")] })}>
                <Plus className="w-3 h-3 mr-1" /> Add Row
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminPages"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1"><h1 className="text-2xl font-bold">{pageId ? "Edit Page" : "New Page"}</h1></div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto-generated" /></div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedBlock(expandedBlock === i ? null : i)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(i, -1); }} className="text-gray-400 hover:text-gray-600"><ChevronUp className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(i, 1); }} className="text-gray-400 hover:text-gray-600"><ChevronDown className="w-3 h-3" /></button>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 bg-white px-2 py-1 rounded">
                      {blockTypes.find(t => t.value === block.type)?.label || block.type}
                    </span>
                    <span className="text-sm text-gray-700">{block.data?.title || ""}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); removeBlock(i); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {expandedBlock === i && (
                  <div className="p-4">{renderBlockEditor(block, i)}</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}