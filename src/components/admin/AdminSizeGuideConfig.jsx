import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITEM_CATEGORIES } from "../sizeguide/itemData";

const DEFAULT_CONFIG = {
  page_key: "size_guide",
  hero_title: "Storage Size Guide",
  hero_subtitle: "Not sure how much space you need? Use our interactive calculator to drag in your items and get a personalized unit size recommendation.",
  hero_bg_color: "#1B365D",
  hero_title_color: "#ffffff",
  hero_subtitle_color: "#bfdbfe",
  tab_calculator_label: "🧮 Size Calculator",
  tab_guide_label: "📐 Unit Size Guide",
  active_tab_bg: "#1B365D",
  active_tab_text: "#ffffff",
  recommendation_bg: "#1B365D",
  recommendation_text: "#ffffff",
  cta_text: "Find a Location →",
  cta_link: "/locations",
  cta_bg: "#E8792F",
  cta_text_color: "#ffffff",
  categories: ITEM_CATEGORIES.map((cat, ci) => ({
    id: `cat-${ci}`,
    label: cat.label,
    icon: cat.icon,
    items: cat.items.map((item, ii) => ({ ...item, id: item.id || `item-${ci}-${ii}` })),
  })),
};

function ColorRow({ label, field, form, update }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <input type="color" value={form[field] || "#000000"} onChange={(e) => update(field, e.target.value)}
          className="h-9 w-12 p-0.5 rounded border cursor-pointer" />
        <Input value={form[field] || ""} onChange={(e) => update(field, e.target.value)} placeholder="#hex" className="flex-1" />
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function AdminSizeGuideConfig({ onSaveStatus }) {
  const [form, setForm] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);
  const [movingItem, setMovingItem] = useState(null); // { item, fromCatId }

  const { data: configs, refetch } = useQuery({
    queryKey: ["size-guide-config"],
    queryFn: () => base44.entities.SizeGuideConfig.list(),
    initialData: [],
  });

  useEffect(() => {
    if (configs?.length) {
      const saved = configs.find((c) => c.page_key === "size_guide");
      if (saved) setForm({ ...DEFAULT_CONFIG, ...saved });
    }
  }, [configs]);

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    const existing = configs?.find((c) => c.page_key === "size_guide");
    if (existing?.id) {
      await base44.entities.SizeGuideConfig.update(existing.id, data);
    } else {
      await base44.entities.SizeGuideConfig.create(data);
    }
    setSaving(false);
    refetch();
  };

  // ── Category helpers ──────────────────────────────────────────
  const updateCategory = (catId, patch) => {
    setForm((p) => ({
      ...p,
      categories: p.categories.map((c) => c.id === catId ? { ...c, ...patch } : c),
    }));
  };

  const addCategory = () => {
    const id = `cat-${Date.now()}`;
    setForm((p) => ({
      ...p,
      categories: [...p.categories, { id, label: "New Category", icon: "📦", items: [] }],
    }));
    setExpandedCat(id);
  };

  const removeCategory = (catId) => {
    setForm((p) => ({ ...p, categories: p.categories.filter((c) => c.id !== catId) }));
  };

  const onCatDragEnd = (result) => {
    if (!result.destination) return;
    const cats = Array.from(form.categories);
    const [moved] = cats.splice(result.source.index, 1);
    cats.splice(result.destination.index, 0, moved);
    setForm((p) => ({ ...p, categories: cats }));
  };

  // ── Item helpers ──────────────────────────────────────────────
  const updateItem = (catId, itemId, patch) => {
    setForm((p) => ({
      ...p,
      categories: p.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((it) => it.id === itemId ? { ...it, ...patch } : it) }
          : c
      ),
    }));
  };

  const addItem = (catId) => {
    const newItem = { id: `item-${Date.now()}`, label: "New Item", icon: "📦", cuft: 5, w: 24, d: 24, h: 24 };
    setForm((p) => ({
      ...p,
      categories: p.categories.map((c) =>
        c.id === catId ? { ...c, items: [...c.items, newItem] } : c
      ),
    }));
  };

  const removeItem = (catId, itemId) => {
    setForm((p) => ({
      ...p,
      categories: p.categories.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c
      ),
    }));
  };

  const onItemDragEnd = (catId, result) => {
    if (!result.destination) return;
    const cat = form.categories.find((c) => c.id === catId);
    if (!cat) return;
    const items = Array.from(cat.items);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    updateCategory(catId, { items });
  };

  const moveItemToCategory = (item, fromCatId, toCatId) => {
    if (fromCatId === toCatId) return;
    setForm((p) => ({
      ...p,
      categories: p.categories.map((c) => {
        if (c.id === fromCatId) return { ...c, items: c.items.filter((it) => it.id !== item.id) };
        if (c.id === toCatId) return { ...c, items: [...c.items, item] };
        return c;
      }),
    }));
    setMovingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* ── Page Text ── */}
      <SectionCard title="Hero / Page Text">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Page Title</Label>
            <Input className="mt-1" value={form.hero_title} onChange={(e) => update("hero_title", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Page Subtitle</Label>
            <Input className="mt-1" value={form.hero_subtitle} onChange={(e) => update("hero_subtitle", e.target.value)} />
          </div>
          <div>
            <Label>Calculator Tab Label</Label>
            <Input className="mt-1" value={form.tab_calculator_label} onChange={(e) => update("tab_calculator_label", e.target.value)} />
          </div>
          <div>
            <Label>Size Guide Tab Label</Label>
            <Input className="mt-1" value={form.tab_guide_label} onChange={(e) => update("tab_guide_label", e.target.value)} />
          </div>
          <div>
            <Label>CTA Button Text</Label>
            <Input className="mt-1" value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} />
          </div>
          <div>
            <Label>CTA Button Link</Label>
            <Input className="mt-1" value={form.cta_link} onChange={(e) => update("cta_link", e.target.value)} />
          </div>
        </div>
      </SectionCard>

      {/* ── Colors ── */}
      <SectionCard title="Colors">
        <div className="grid md:grid-cols-2 gap-4">
          <ColorRow label="Hero Background" field="hero_bg_color" form={form} update={update} />
          <ColorRow label="Hero Title Color" field="hero_title_color" form={form} update={update} />
          <ColorRow label="Hero Subtitle Color" field="hero_subtitle_color" form={form} update={update} />
          <ColorRow label="Active Tab Background" field="active_tab_bg" form={form} update={update} />
          <ColorRow label="Active Tab Text" field="active_tab_text" form={form} update={update} />
          <ColorRow label="Recommendation Box Background" field="recommendation_bg" form={form} update={update} />
          <ColorRow label="Recommendation Box Text" field="recommendation_text" form={form} update={update} />
          <ColorRow label="CTA Button Background" field="cta_bg" form={form} update={update} />
          <ColorRow label="CTA Button Text Color" field="cta_text_color" form={form} update={update} />
        </div>
      </SectionCard>

      {/* ── Categories & Items ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Item Categories & Items</CardTitle>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={addCategory}>
              <Plus className="w-3 h-3" /> Add Category
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Drag categories to reorder. Expand a category to manage its items, reorder them, or move them to another category.</p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onCatDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {form.categories.map((cat, catIdx) => {
                    const isOpen = expandedCat === cat.id;
                    return (
                      <Draggable key={cat.id} draggableId={cat.id} index={catIdx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-xl overflow-hidden ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          >
                            {/* Category header row */}
                            <div className="flex items-center gap-2 px-3 py-3 bg-gray-50">
                              <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <Input
                                className="w-12 h-7 text-center text-base px-1"
                                value={cat.icon}
                                onChange={(e) => updateCategory(cat.id, { icon: e.target.value })}
                                title="Category icon (emoji)"
                              />
                              <Input
                                className="flex-1 h-7 text-sm font-semibold"
                                value={cat.label}
                                onChange={(e) => updateCategory(cat.id, { label: e.target.value })}
                              />
                              <span className="text-xs text-gray-400 flex-shrink-0">{cat.items.length} items</span>
                              <button onClick={() => setExpandedCat(isOpen ? null : cat.id)} className="text-gray-400 hover:text-gray-700 transition">
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button onClick={() => removeCategory(cat.id)} className="text-red-300 hover:text-red-500 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Items */}
                            {isOpen && (
                              <div className="p-3 space-y-2 bg-white">
                                <DragDropContext onDragEnd={(r) => onItemDragEnd(cat.id, r)}>
                                  <Droppable droppableId={`items-${cat.id}`}>
                                    {(provided) => (
                                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                        {cat.items.map((item, itemIdx) => (
                                          <Draggable key={item.id} draggableId={`${cat.id}-${item.id}`} index={itemIdx}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`p-3 border rounded-xl bg-gray-50 space-y-2 ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab flex-shrink-0">
                                                    <GripVertical className="w-4 h-4" />
                                                  </div>
                                                  <Input
                                                    className="w-10 h-7 text-center text-sm px-1"
                                                    value={item.icon}
                                                    onChange={(e) => updateItem(cat.id, item.id, { icon: e.target.value })}
                                                    title="Item icon (emoji)"
                                                  />
                                                  <Input
                                                    className="flex-1 h-7 text-sm"
                                                    value={item.label}
                                                    onChange={(e) => updateItem(cat.id, item.id, { label: e.target.value })}
                                                    placeholder="Item name"
                                                  />
                                                  {/* Move to category */}
                                                  <select
                                                    className="text-xs border rounded px-1 py-1 bg-white text-gray-600 h-7"
                                                    value={cat.id}
                                                    onChange={(e) => moveItemToCategory(item, cat.id, e.target.value)}
                                                    title="Move to category"
                                                  >
                                                    {form.categories.map((c) => (
                                                      <option key={c.id} value={c.id}>{c.label}</option>
                                                    ))}
                                                  </select>
                                                  <button onClick={() => removeItem(cat.id, item.id)} className="text-red-300 hover:text-red-500 flex-shrink-0">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 pl-6">
                                                  <div>
                                                    <p className="text-[10px] text-gray-400 mb-0.5">Cu Ft</p>
                                                    <Input className="h-7 text-xs" type="number" value={item.cuft} onChange={(e) => updateItem(cat.id, item.id, { cuft: parseFloat(e.target.value) || 0 })} />
                                                  </div>
                                                  <div>
                                                    <p className="text-[10px] text-gray-400 mb-0.5">Width (in)</p>
                                                    <Input className="h-7 text-xs" type="number" value={item.w} onChange={(e) => updateItem(cat.id, item.id, { w: parseFloat(e.target.value) || 0 })} />
                                                  </div>
                                                  <div>
                                                    <p className="text-[10px] text-gray-400 mb-0.5">Depth (in)</p>
                                                    <Input className="h-7 text-xs" type="number" value={item.d} onChange={(e) => updateItem(cat.id, item.id, { d: parseFloat(e.target.value) || 0 })} />
                                                  </div>
                                                  <div>
                                                    <p className="text-[10px] text-gray-400 mb-0.5">Height (in)</p>
                                                    <Input className="h-7 text-xs" type="number" value={item.h} onChange={(e) => updateItem(cat.id, item.id, { h: parseFloat(e.target.value) || 0 })} />
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
                                <Button variant="outline" size="sm" className="gap-1 text-xs w-full mt-2" onClick={() => addItem(cat.id)}>
                                  <Plus className="w-3 h-3" /> Add Item to {cat.label}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}