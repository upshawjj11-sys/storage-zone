import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Trash2, GripVertical, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import RichTextEditor from "../components/admin/RichTextEditor";
import StaticPagePreview from "../components/admin/StaticPagePreview";
import ContactFormBlockEditor from "../components/admin/ContactFormBlockEditor";
import LocationsGridBlockEditor from "../components/admin/LocationsGridBlockEditor";
import { Columns } from "lucide-react";

const BLOCK_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "heading", label: "Heading / Title" },
  { value: "text", label: "Rich Text" },
  { value: "divider", label: "Divider" },
  { value: "image", label: "Image" },
  { value: "two_column", label: "Two Column" },
  { value: "features_grid", label: "Features Grid" },
  { value: "stats", label: "Stats / Numbers" },
  { value: "cta", label: "CTA Banner" },
  { value: "faq", label: "FAQ" },
  { value: "video", label: "Video Embed" },
  { value: "gallery", label: "Image Gallery" },
  { value: "testimonials", label: "Testimonials" },
  { value: "contact_form", label: "Contact Form" },
  { value: "embed", label: "Custom Embed / HTML" },
  { value: "locations_grid", label: "Locations Grid" },
];

function defaultBlockData(type) {
  switch (type) {
    case "hero": return { title: "Page Title", subtitle: "Subtitle text here", bg_color: "#1B365D", title_color: "#ffffff", subtitle_color: "#e2e8f0", padding_y: "py-20", image: "" };
    case "text": return { content: "<p>Enter your content here...</p>", align: "left" };
    case "image": return { url: "", alt: "", caption: "", width: "full" };
    case "two_column": return {
      left_type: "text", left_data: { content: "<p>Left column content</p>" },
      right_type: "image", right_data: { url: "", alt: "" },
      gap: "gap-8", valign: "items-start"
    };
    case "features_grid": return { title: "Features", subtitle: "", cols: 3, items: [{ icon: "✅", title: "Feature 1", description: "Description" }] };
    case "stats": return { items: [{ value: "100+", label: "Clients" }] };
    case "cta": return { title: "Ready to get started?", subtitle: "", button_text: "Contact Us", button_link: "/contact", bg_color: "#E8792F", text_color: "#ffffff", button_bg: "#ffffff", button_text_color: "#E8792F" };
    case "faq": return { title: "Frequently Asked Questions", items: [{ question: "Question?", answer: "Answer." }] };
    case "video": return { url: "", title: "" };
    case "gallery": return { images: [], cols: 3 };
    case "testimonials": return { title: "What Our Customers Say", items: [{ name: "Customer Name", text: "Great service!", rating: 5 }] };
    case "contact_form": return { form_id: "" };
    case "embed": return { code: "", height: "400px" };
    case "locations_grid": return { title: "", facility_ids: [], cols: 3 };
    default: return {};
  }
}

function BlockEditor({ block, onChange, onDelete }) {
  const { type, data } = block;
  const update = (field, val) => onChange({ ...block, data: { ...data, [field]: val } });

  const renderFields = () => {
    switch (type) {
      case "hero":
        return (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={e => update("title", e.target.value)} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={e => update("subtitle", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Background Color</Label><Input type="color" value={data.bg_color || "#1B365D"} onChange={e => update("bg_color", e.target.value)} className="h-10 p-1" /></div>
              <div><Label>Title Color</Label><Input type="color" value={data.title_color || "#ffffff"} onChange={e => update("title_color", e.target.value)} className="h-10 p-1" /></div>
              <div><Label>Subtitle Color</Label><Input type="color" value={data.subtitle_color || "#e2e8f0"} onChange={e => update("subtitle_color", e.target.value)} className="h-10 p-1" /></div>
            </div>
            <div><Label>Background Image URL</Label><Input value={data.image || ""} onChange={e => update("image", e.target.value)} placeholder="https://..." /></div>
            <div><Label>Padding</Label>
              <Select value={data.padding_y || "py-20"} onValueChange={v => update("padding_y", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="py-10">Small</SelectItem>
                  <SelectItem value="py-20">Medium</SelectItem>
                  <SelectItem value="py-32">Large</SelectItem>
                  <SelectItem value="py-48">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-3">
            <div><Label>Text Align</Label>
              <Select value={data.align || "left"} onValueChange={v => update("align", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Content</Label><RichTextEditor value={data.content || ""} onChange={v => update("content", v)} /></div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-3">
            <div><Label>Image URL</Label><Input value={data.url || ""} onChange={e => update("url", e.target.value)} placeholder="https://..." /></div>
            <div><Label>Alt Text</Label><Input value={data.alt || ""} onChange={e => update("alt", e.target.value)} /></div>
            <div><Label>Caption</Label><Input value={data.caption || ""} onChange={e => update("caption", e.target.value)} /></div>
            <div><Label>Width</Label>
              <Select value={data.width || "full"} onValueChange={v => update("width", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="large">Large (75%)</SelectItem>
                  <SelectItem value="medium">Medium (50%)</SelectItem>
                  <SelectItem value="small">Small (33%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "two_column":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Left Column Type</Label>
                <Select value={data.left_type || "text"} onValueChange={v => onChange({ ...block, data: { ...data, left_type: v, left_data: defaultBlockData(v) } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Rich Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="embed">Embed/HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Right Column Type</Label>
                <Select value={data.right_type || "image"} onValueChange={v => onChange({ ...block, data: { ...data, right_type: v, right_data: defaultBlockData(v) } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Rich Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="embed">Embed/HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Left Content</p>
                <ColumnContentEditor type={data.left_type || "text"} data={data.left_data || {}} onChange={d => onChange({ ...block, data: { ...data, left_data: d } })} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Right Content</p>
                <ColumnContentEditor type={data.right_type || "image"} data={data.right_data || {}} onChange={d => onChange({ ...block, data: { ...data, right_data: d } })} />
              </div>
            </div>
          </div>
        );
      case "features_grid":
        return (
          <div className="space-y-3">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={e => update("title", e.target.value)} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={e => update("subtitle", e.target.value)} /></div>
            <div><Label>Columns</Label>
              <Select value={String(data.cols || 3)} onValueChange={v => update("cols", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Items</Label>
              <div className="space-y-2 mt-2">
                {(data.items || []).map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 items-start p-2 bg-gray-50 rounded">
                    <Input placeholder="Icon (emoji)" value={item.icon || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, icon: e.target.value }; update("items", items); }} />
                    <Input placeholder="Title" value={item.title || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, title: e.target.value }; update("items", items); }} />
                    <div className="flex gap-1">
                      <Input placeholder="Description" value={item.description || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, description: e.target.value }; update("items", items); }} />
                      <Button size="icon" variant="ghost" onClick={() => { const items = data.items.filter((_, idx) => idx !== i); update("items", items); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => update("items", [...(data.items || []), { icon: "✅", title: "", description: "" }])}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
              </div>
            </div>
          </div>
        );
      case "stats":
        return (
          <div className="space-y-3">
            <Label>Stats</Label>
            <div className="space-y-2">
              {(data.items || []).map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input placeholder="Value (e.g. 100+)" value={item.value || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, value: e.target.value }; update("items", items); }} />
                  <Input placeholder="Label" value={item.label || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, label: e.target.value }; update("items", items); }} />
                  <Button size="icon" variant="ghost" onClick={() => update("items", data.items.filter((_, idx) => idx !== i))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => update("items", [...(data.items || []), { value: "", label: "" }])}><Plus className="w-3 h-3 mr-1" />Add Stat</Button>
            </div>
          </div>
        );
      case "cta":
        return (
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={data.title || ""} onChange={e => update("title", e.target.value)} /></div>
            <div><Label>Subtitle</Label><Input value={data.subtitle || ""} onChange={e => update("subtitle", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Button Text</Label><Input value={data.button_text || ""} onChange={e => update("button_text", e.target.value)} /></div>
              <div><Label>Button Link</Label><Input value={data.button_link || ""} onChange={e => update("button_link", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Background Color</Label><Input type="color" value={data.bg_color || "#E8792F"} onChange={e => update("bg_color", e.target.value)} className="h-10 p-1" /></div>
              <div><Label>Text Color</Label><Input type="color" value={data.text_color || "#ffffff"} onChange={e => update("text_color", e.target.value)} className="h-10 p-1" /></div>
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-3">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={e => update("title", e.target.value)} /></div>
            <div>
              <Label>FAQ Items</Label>
              <div className="space-y-2 mt-2">
                {(data.items || []).map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Question" value={item.question || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, question: e.target.value }; update("items", items); }} />
                      <Button size="icon" variant="ghost" onClick={() => update("items", data.items.filter((_, idx) => idx !== i))}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                    <Textarea placeholder="Answer" value={item.answer || ""} rows={2} onChange={e => { const items = [...data.items]; items[i] = { ...item, answer: e.target.value }; update("items", items); }} />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => update("items", [...(data.items || []), { question: "", answer: "" }])}><Plus className="w-3 h-3 mr-1" />Add FAQ</Button>
              </div>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="space-y-3">
            <div><Label>Video URL (YouTube, Vimeo, or direct MP4)</Label><Input value={data.url || ""} onChange={e => update("url", e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
            <div><Label>Title (optional)</Label><Input value={data.title || ""} onChange={e => update("title", e.target.value)} /></div>
          </div>
        );
      case "gallery":
        return (
          <div className="space-y-3">
            <div><Label>Columns</Label>
              <Select value={String(data.cols || 3)} onValueChange={v => update("cols", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URLs</Label>
              <div className="space-y-2 mt-2">
                {(data.images || []).map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={img} onChange={e => { const images = [...data.images]; images[i] = e.target.value; update("images", images); }} placeholder="https://..." />
                    <Button size="icon" variant="ghost" onClick={() => update("images", data.images.filter((_, idx) => idx !== i))}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => update("images", [...(data.images || []), ""])}><Plus className="w-3 h-3 mr-1" />Add Image</Button>
              </div>
            </div>
          </div>
        );
      case "testimonials":
        return (
          <div className="space-y-3">
            <div><Label>Section Title</Label><Input value={data.title || ""} onChange={e => update("title", e.target.value)} /></div>
            <div>
              <Label>Testimonials</Label>
              <div className="space-y-2 mt-2">
                {(data.items || []).map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Name" value={item.name || ""} onChange={e => { const items = [...data.items]; items[i] = { ...item, name: e.target.value }; update("items", items); }} />
                      <Input type="number" min={1} max={5} placeholder="Rating" value={item.rating || 5} onChange={e => { const items = [...data.items]; items[i] = { ...item, rating: Number(e.target.value) }; update("items", items); }} className="w-24" />
                      <Button size="icon" variant="ghost" onClick={() => update("items", data.items.filter((_, idx) => idx !== i))}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                    <Textarea placeholder="Review text" value={item.text || ""} rows={2} onChange={e => { const items = [...data.items]; items[i] = { ...item, text: e.target.value }; update("items", items); }} />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => update("items", [...(data.items || []), { name: "", text: "", rating: 5 }])}><Plus className="w-3 h-3 mr-1" />Add Testimonial</Button>
              </div>
            </div>
          </div>
        );
      case "contact_form":
        return <ContactFormBlockEditor data={data} update={update} />;
      case "locations_grid":
        return <LocationsGridBlockEditor data={data} update={update} />;
      case "embed":
        return (
          <div className="space-y-3">
            <div><Label>Embed Code or HTML</Label><Textarea value={data.code || ""} rows={6} onChange={e => update("code", e.target.value)} placeholder='<iframe src="..." />' className="font-mono text-sm" /></div>
            <div><Label>Container Height</Label><Input value={data.height || "400px"} onChange={e => update("height", e.target.value)} placeholder="400px" /></div>
          </div>
        );
      default:
        return <p className="text-gray-400 text-sm">No editor for this block type.</p>;
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-gray-700">
          {BLOCK_TYPES.find(b => b.value === type)?.label || type}
        </CardTitle>
        <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4">
        {renderFields()}
      </CardContent>
    </Card>
  );
}

function ColumnContentEditor({ type, data, onChange }) {
  const update = (field, val) => onChange({ ...data, [field]: val });
  switch (type) {
    case "text":
      return <RichTextEditor value={data.content || ""} onChange={v => onChange({ ...data, content: v })} />;
    case "image":
      return (
        <div className="space-y-2">
          <Input placeholder="Image URL" value={data.url || ""} onChange={e => update("url", e.target.value)} />
          <Input placeholder="Alt text" value={data.alt || ""} onChange={e => update("alt", e.target.value)} />
        </div>
      );
    case "video":
      return <Input placeholder="Video URL" value={data.url || ""} onChange={e => update("url", e.target.value)} />;
    case "embed":
      return (
        <div className="space-y-2">
          <Textarea placeholder="Embed code / HTML" value={data.code || ""} rows={4} onChange={e => update("code", e.target.value)} className="font-mono text-sm" />
          <Input placeholder="Height (e.g. 300px)" value={data.height || ""} onChange={e => update("height", e.target.value)} />
        </div>
      );
    default:
      return null;
  }
}

export default function AdminPageEdit() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("id");
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    status: "draft",
    show_in_nav: false,
    meta_title: "",
    meta_description: "",
    content_blocks: [],
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const { data: pageData } = useQuery({
    queryKey: ["static-page", pageId],
    queryFn: () => base44.entities.StaticPage.filter({ id: pageId }),
    enabled: !!pageId,
  });

  useEffect(() => {
    if (pageData && pageData.length > 0) {
      setForm(pageData[0]);
    }
  }, [pageData]);

  const addBlock = (type) => {
    const newBlock = { type, data: defaultBlockData(type), order: form.content_blocks.length };
    setForm(f => ({ ...f, content_blocks: [...f.content_blocks, newBlock] }));
  };

  const updateBlock = (index, updated) => {
    const blocks = [...form.content_blocks];
    blocks[index] = updated;
    setForm(f => ({ ...f, content_blocks: blocks }));
  };

  const deleteBlock = (index) => {
    setForm(f => ({ ...f, content_blocks: f.content_blocks.filter((_, i) => i !== index) }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const blocks = Array.from(form.content_blocks);
    const [moved] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, moved);
    setForm(f => ({ ...f, content_blocks: blocks }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (pageId) {
      await base44.entities.StaticPage.update(pageId, form);
    } else {
      await base44.entities.StaticPage.create(form);
    }
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    navigate(createPageUrl("AdminPages"));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminPages"))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{pageId ? "Edit Page" : "New Page"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowPreview(p => !p)}>
            <Columns className="w-4 h-4" />{showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          {pageId && (
            <a href={`/page/${form.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-2"><Eye className="w-4 h-4" />Open Live</Button>
            </a>
          )}
          <Button size="sm" className="gap-2" style={{ background: "#E8792F" }} onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className={`flex flex-1 overflow-hidden ${showPreview ? "h-[calc(100vh-57px)]" : ""}`}>
      <div className={`${showPreview ? "w-1/2 overflow-y-auto border-r border-gray-200" : "max-w-5xl mx-auto w-full"} px-6 py-8 space-y-8`}>
        {/* Page Settings */}
        <Card>
          <CardHeader><CardTitle>Page Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Page Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="my-page" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Switch checked={!!form.show_in_nav} onCheckedChange={v => setForm(f => ({ ...f, show_in_nav: v }))} />
                <Label>Show in Navigation</Label>
              </div>
            </div>
            <div><Label>Meta Title</Label><Input value={form.meta_title || ""} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} /></div>
            <div><Label>Meta Description</Label><Textarea value={form.meta_description || ""} rows={2} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} /></div>
          </CardContent>
        </Card>

        {/* Content Blocks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Blocks</h2>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                  {form.content_blocks.map((block, index) => (
                    <Draggable key={index} draggableId={String(index)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? "opacity-80" : ""}
                        >
                          <div className="flex items-start gap-2">
                            <div {...provided.dragHandleProps} className="mt-4 text-gray-300 hover:text-gray-500 cursor-grab">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <BlockEditor
                                block={block}
                                onChange={(updated) => updateBlock(index, updated)}
                                onDelete={() => deleteBlock(index)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Block */}
          <Card className="mt-4 border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600 mb-3 text-center">Add a block</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {BLOCK_TYPES.map(bt => (
                  <Button key={bt.value} size="sm" variant="outline" onClick={() => addBlock(bt.value)} className="text-xs">
                    <Plus className="w-3 h-3 mr-1" />{bt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {showPreview && (
        <div className="w-1/2 overflow-hidden">
          <StaticPagePreview form={form} />
        </div>
      )}
      </div>
    </div>
  );
}