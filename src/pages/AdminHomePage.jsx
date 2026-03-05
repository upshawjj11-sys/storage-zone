import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Upload, Plus, Trash2, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const SECTION_TYPES = [
  { value: "features", label: "Features Grid" },
  { value: "locations", label: "Locations Grid" },
  { value: "testimonials", label: "Testimonials" },
  { value: "cta_banner", label: "CTA Banner" },
  { value: "text_block", label: "Text Block" },
  { value: "gallery", label: "Gallery" },
  { value: "faq", label: "FAQ" },
  { value: "stats", label: "Stats Bar" },
];

function SectionEditor({ section, onChange, onRemove, index }) {
  const [open, setOpen] = useState(false);
  const data = section.data || {};

  const updateData = (key, val) => onChange({ ...section, data: { ...data, [key]: val } });

  // Helper to edit arrays of objects (features, faqs, testimonials, stats)
  const updateItem = (arr, i, key, val) => {
    const next = arr.map((item, idx) => idx === i ? { ...item, [key]: val } : item);
    onChange({ ...section, data: { ...data, items: next } });
  };
  const addItem = (defaults) => onChange({ ...section, data: { ...data, items: [...(data.items || []), defaults] } });
  const removeItem = (i) => onChange({ ...section, data: { ...data, items: (data.items || []).filter((_, idx) => idx !== i) } });

  const renderDataEditor = () => {
    switch (section.type) {
      case "features":
        return (
          <div className="space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ icon: "Shield", title: "", desc: "" })}>
              <Plus className="w-3 h-3" /> Add Feature
            </Button>
            {(data.items || []).map((item, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                <div className="flex gap-2">
                  <Input placeholder="Icon name (Shield, Clock, MapPin...)" value={item.icon || ""} onChange={(e) => updateItem(data.items, i, "icon", e.target.value)} className="flex-1" />
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <Input placeholder="Title" value={item.title || ""} onChange={(e) => updateItem(data.items, i, "title", e.target.value)} />
                <Textarea placeholder="Description" value={item.desc || ""} onChange={(e) => updateItem(data.items, i, "desc", e.target.value)} rows={2} />
              </div>
            ))}
          </div>
        );
      case "cta_banner":
        return (
          <div className="space-y-3">
            <div><Label>Body Text</Label><Textarea value={data.body || ""} onChange={(e) => updateData("body", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CTA Button Text</Label><Input value={data.cta_text || ""} onChange={(e) => updateData("cta_text", e.target.value)} /></div>
              <div><Label>CTA Button Link</Label><Input value={data.cta_url || ""} onChange={(e) => updateData("cta_url", e.target.value)} /></div>
            </div>
            <div><Label>Background Color</Label><Input type="color" value={data.bg_color || "#1B365D"} onChange={(e) => updateData("bg_color", e.target.value)} className="h-10 w-24 p-1" /></div>
          </div>
        );
      case "text_block":
        return (
          <div className="space-y-3">
            <div><Label>Content (supports markdown)</Label><Textarea value={data.content || ""} onChange={(e) => updateData("content", e.target.value)} rows={5} /></div>
            <div><Label>Text Alignment</Label>
              <Select value={data.align || "left"} onValueChange={(v) => updateData("align", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ question: "", answer: "" })}>
              <Plus className="w-3 h-3" /> Add FAQ
            </Button>
            {(data.items || []).map((item, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                <div className="flex gap-2">
                  <Input placeholder="Question" value={item.question || ""} onChange={(e) => updateItem(data.items, i, "question", e.target.value)} className="flex-1" />
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <Textarea placeholder="Answer" value={item.answer || ""} onChange={(e) => updateItem(data.items, i, "answer", e.target.value)} rows={2} />
              </div>
            ))}
          </div>
        );
      case "testimonials":
        return (
          <div className="space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ name: "", text: "", rating: 5, location: "" })}>
              <Plus className="w-3 h-3" /> Add Testimonial
            </Button>
            {(data.items || []).map((item, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" value={item.name || ""} onChange={(e) => updateItem(data.items, i, "name", e.target.value)} />
                  <Input placeholder="Location" value={item.location || ""} onChange={(e) => updateItem(data.items, i, "location", e.target.value)} />
                </div>
                <Textarea placeholder="Review text" value={item.text || ""} onChange={(e) => updateItem(data.items, i, "text", e.target.value)} rows={2} />
                <div className="flex items-center justify-between">
                  <div><Label className="text-xs">Rating</Label><Input type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => updateItem(data.items, i, "rating", parseInt(e.target.value))} className="w-16" /></div>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        );
      case "stats":
        return (
          <div className="space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ value: "", label: "" })}>
              <Plus className="w-3 h-3" /> Add Stat
            </Button>
            {(data.items || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder="Value (e.g. 5,000+)" value={item.value || ""} onChange={(e) => updateItem(data.items, i, "value", e.target.value)} />
                <Input placeholder="Label (e.g. Units Rented)" value={item.label || ""} onChange={(e) => updateItem(data.items, i, "label", e.target.value)} />
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </div>
        );
      case "locations":
        return <p className="text-sm text-gray-500 italic">This section automatically pulls in your active facilities.</p>;
      case "gallery":
        return <p className="text-sm text-gray-500 italic">Gallery images are pulled from your facility photos.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="text-gray-300 cursor-grab"><GripVertical className="w-5 h-5" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{section.title || SECTION_TYPES.find(t => t.value === section.type)?.label || section.type}</span>
            <Badge className="text-xs border-0 bg-gray-100 text-gray-600">{section.type}</Badge>
            {!section.visible && <Badge className="text-xs border-0 bg-yellow-100 text-yellow-700">Hidden</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Switch checked={!!section.visible} onCheckedChange={(v) => onChange({ ...section, visible: v })} />
          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600" onClick={onRemove}><Trash2 className="w-4 h-4" /></Button>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>
      {open && (
        <div className="border-t p-4 space-y-4 bg-gray-50">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Section Title</Label><Input value={section.title || ""} onChange={(e) => onChange({ ...section, title: e.target.value })} placeholder="Section heading" /></div>
            <div><Label>Section Subtitle</Label><Input value={section.subtitle || ""} onChange={(e) => onChange({ ...section, subtitle: e.target.value })} placeholder="Optional subheading" /></div>
          </div>
          <div><Label>Background Color</Label><Input type="color" value={section.bg_color || "#ffffff"} onChange={(e) => onChange({ ...section, bg_color: e.target.value })} className="h-10 w-24 p-1" /></div>
          <div className="border-t pt-4">{renderDataEditor()}</div>
        </div>
      )}
    </div>
  );
}

export default function AdminHomePage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hero_title: "", hero_subtitle: "", hero_image: "", hero_badge_text: "Secure & Climate Controlled",
    hero_cta_text: "Find Your Unit", hero_cta_link: "", hero_cta2_text: "View Locations", hero_cta2_link: "",
    hero_overlay_opacity: 0.6, sections: [],
  });
  const [newSectionType, setNewSectionType] = useState("features");

  const { data: existing, refetch } = useQuery({
    queryKey: ["homepage-config"],
    queryFn: async () => { const items = await base44.entities.HomePageConfig.list(); return items[0]; },
  });

  useEffect(() => { if (existing) setForm({ ...form, ...existing, sections: existing.sections || [] }); }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("hero_image", file_url);
  };

  const addSection = () => {
    const id = `section_${Date.now()}`;
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { id, type: newSectionType, title: "", subtitle: "", visible: true, order: prev.sections.length, data: {} }],
    }));
  };

  const updateSection = (i, updated) => {
    const sections = [...form.sections];
    sections[i] = updated;
    update("sections", sections);
  };

  const removeSection = (i) => update("sections", form.sections.filter((_, idx) => idx !== i));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const sections = Array.from(form.sections);
    const [moved] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, moved);
    update("sections", sections.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (existing?.id) {
      await base44.entities.HomePageConfig.update(existing.id, data);
    } else {
      await base44.entities.HomePageConfig.create(data);
    }
    setSaving(false);
    refetch();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Home Page Editor</h1>
          <p className="text-gray-500 mt-1">Customize every section of your home page.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Hero */}
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Badge Text (small tag above title)</Label><Input value={form.hero_badge_text} onChange={(e) => update("hero_badge_text", e.target.value)} placeholder="Secure & Climate Controlled" /></div>
            <div><Label>Title</Label><Input value={form.hero_title} onChange={(e) => update("hero_title", e.target.value)} placeholder="Your Space, Your Storage" /></div>
            <div><Label>Subtitle</Label><Textarea rows={2} value={form.hero_subtitle} onChange={(e) => update("hero_subtitle", e.target.value)} placeholder="Find the perfect storage unit near you." /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Primary CTA Text</Label><Input value={form.hero_cta_text} onChange={(e) => update("hero_cta_text", e.target.value)} /></div>
              <div><Label>Primary CTA Link</Label><Input value={form.hero_cta_link} onChange={(e) => update("hero_cta_link", e.target.value)} placeholder="/Locations" /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Secondary CTA Text</Label><Input value={form.hero_cta2_text} onChange={(e) => update("hero_cta2_text", e.target.value)} /></div>
              <div><Label>Secondary CTA Link</Label><Input value={form.hero_cta2_link} onChange={(e) => update("hero_cta2_link", e.target.value)} /></div>
            </div>
            <div>
              <Label>Background Overlay Opacity ({Math.round((form.hero_overlay_opacity || 0.6) * 100)}%)</Label>
              <input type="range" min={0} max={1} step={0.05} value={form.hero_overlay_opacity || 0.6} onChange={(e) => update("hero_overlay_opacity", parseFloat(e.target.value))} className="w-full mt-1" />
            </div>
            <div>
              <Label>Hero Background Image</Label>
              {form.hero_image && <img src={form.hero_image} alt="" className="w-full h-40 object-cover rounded-xl mb-2" />}
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit">
                <Upload className="w-4 h-4" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
              </label>
              {form.hero_image && <button className="text-xs text-red-500 mt-1 block" onClick={() => update("hero_image", "")}>Remove image</button>}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Page Sections</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={newSectionType} onValueChange={setNewSectionType}>
                  <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addSection} className="gap-1 rounded-full" style={{ background: "#E8792F" }}>
                  <Plus className="w-4 h-4" /> Add Section
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Drag to reorder sections. Toggle visibility without deleting.</p>
          </CardHeader>
          <CardContent>
            {form.sections.length === 0 ? (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                <p className="text-sm">No sections yet. Add one above.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                      {form.sections.map((section, i) => (
                        <Draggable key={section.id || i} draggableId={section.id || `s${i}`} index={i}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <SectionEditor
                                section={section}
                                index={i}
                                onChange={(updated) => updateSection(i, updated)}
                                onRemove={() => removeSection(i)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}