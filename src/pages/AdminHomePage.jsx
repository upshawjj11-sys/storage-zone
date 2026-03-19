import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Upload, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Globe, Eye, EyeOff } from "lucide-react";
import IconPicker from "../components/admin/IconPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SortableImageGrid from "../components/admin/SortableImageGrid";
import HomePagePreview from "../components/admin/HomePagePreview";

const SECTION_TYPES = [
  { value: "pillars", label: "Pillars / Value Props (with icons)" },
  { value: "features", label: "Features Grid (with icons)" },
  { value: "locations", label: "Locations Grid" },
  { value: "testimonials", label: "Testimonials" },
  { value: "cta_banner", label: "CTA Banner" },
  { value: "text_block", label: "Text Block" },
  { value: "gallery", label: "Gallery" },
  { value: "faq", label: "FAQ" },
  { value: "stats", label: "Stats Bar" },
  { value: "two_column", label: "Two Column Layout (half + half)" },
];

const COLUMN_BLOCK_TYPES = [
  { value: "text_block", label: "Text Block" },
  { value: "image", label: "Single Image" },
  { value: "features", label: "Features List" },
  { value: "image_slider", label: "Image Slider" },
  { value: "testimonials", label: "Testimonials / Reviews" },
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
      case "pillars": {
        const onPillarDragEnd = (result) => {
          if (!result.destination) return;
          const items = Array.from(data.items || []);
          const [moved] = items.splice(result.source.index, 1);
          items.splice(result.destination.index, 0, moved);
          onChange({ ...section, data: { ...data, items } });
        };
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Shown as a horizontal bar on the hero or below it. Great for value propositions like "Rest of Month Free".</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Layout Style</Label>
                <Select value={data.style || "banner"} onValueChange={(v) => updateData("style", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Dark Banner Bar</SelectItem>
                    <SelectItem value="cards">Cards on Light Background</SelectItem>
                    <SelectItem value="minimal">Minimal / Inline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Columns</Label>
                <Select value={String(data.columns || "4")} onValueChange={(v) => updateData("columns", parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                    <SelectItem value="4">4 columns</SelectItem>
                    <SelectItem value="5">5 columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ icon: "Check", text: "" })}>
              <Plus className="w-3 h-3" /> Add Pillar
            </Button>
            <DragDropContext onDragEnd={onPillarDragEnd}>
              <Droppable droppableId={`pillars-${section.id}`}>
                {(provided) => (
                  <div className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                    {(data.items || []).map((item, i) => (
                      <Draggable key={i} draggableId={`pillar-${section.id}-${i}`} index={i}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab flex-shrink-0">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="w-36 flex-shrink-0">
                                <Label className="text-xs mb-1 block">Icon</Label>
                                <IconPicker value={item.icon || ""} onChange={(v) => updateItem(data.items, i, "icon", v)} />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs mb-1 block">Text</Label>
                                <Input placeholder="Rest of Month Free" value={item.text || ""} onChange={(e) => updateItem(data.items, i, "text", e.target.value)} />
                              </div>
                              <Button size="sm" variant="ghost" className="text-red-500 flex-shrink-0 mt-4" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                            <div className="flex gap-3 pl-7 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Icon Color</Label>
                                <input type="color" value={item.icon_color || "#E8792F"} onChange={(e) => updateItem(data.items, i, "icon_color", e.target.value)} className="h-7 w-10 p-0.5 rounded border" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Text Color</Label>
                                <input type="color" value={item.text_color || "#ffffff"} onChange={(e) => updateItem(data.items, i, "text_color", e.target.value)} className="h-7 w-10 p-0.5 rounded border" />
                              </div>
                              <div className="flex items-center gap-2 ml-auto">
                                <Label className="text-xs">Info Button</Label>
                                <Switch checked={!!item.show_link_button} onCheckedChange={(v) => updateItem(data.items, i, "show_link_button", v)} />
                              </div>
                            </div>
                            {item.show_link_button && (
                              <div className="pl-7">
                                <Label className="text-xs">Button Link URL</Label>
                                <Input className="mt-1" placeholder="https://example.com/more-info" value={item.link || ""} onChange={(e) => updateItem(data.items, i, "link", e.target.value)} />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        );
      }
      case "features":
        return (
          <div className="space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ icon: "Shield", title: "", desc: "" })}>
              <Plus className="w-3 h-3" /> Add Feature
            </Button>
            {(data.items || []).map((item, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Icon</Label>
                    <IconPicker value={item.icon || ""} onChange={(v) => updateItem(data.items, i, "icon", v)} />
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 mb-0.5" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
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
          <div className="space-y-4">
            {/* Style options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Style Template</Label>
                <Select value={data.style || "cards"} onValueChange={(v) => updateData("style", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">White Cards</SelectItem>
                    <SelectItem value="dark">Dark Background</SelectItem>
                    <SelectItem value="minimal">Minimal / Bordered</SelectItem>
                    <SelectItem value="quote">Large Quote Style</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Columns</Label>
                <Select value={String(data.columns || "3")} onValueChange={(v) => updateData("columns", parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 column</SelectItem>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Card BG</Label>
                <input type="color" value={data.card_bg || "#ffffff"} onChange={(e) => updateData("card_bg", e.target.value)} className="h-7 w-10 p-0.5 rounded border" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Text Color</Label>
                <input type="color" value={data.text_color || "#374151"} onChange={(e) => updateData("text_color", e.target.value)} className="h-7 w-10 p-0.5 rounded border" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Star Color</Label>
                <input type="color" value={data.star_color || "#facc15"} onChange={(e) => updateData("star_color", e.target.value)} className="h-7 w-10 p-0.5 rounded border" />
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => addItem({ name: "", text: "", rating: 5, location: "", avatar_color: "#1B365D" })}>
              <Plus className="w-3 h-3" /> Add Testimonial
            </Button>
            {(data.items || []).map((item, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" value={item.name || ""} onChange={(e) => updateItem(data.items, i, "name", e.target.value)} />
                  <Input placeholder="Location / Title" value={item.location || ""} onChange={(e) => updateItem(data.items, i, "location", e.target.value)} />
                </div>
                <Textarea placeholder="Review text" value={item.text || ""} onChange={(e) => updateItem(data.items, i, "text", e.target.value)} rows={2} />
                <div className="flex items-center gap-4">
                  <div><Label className="text-xs">Rating (1–5)</Label><Input type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => updateItem(data.items, i, "rating", parseInt(e.target.value))} className="w-16" /></div>
                  <div className="flex items-center gap-2 mt-4"><Label className="text-xs">Avatar Color</Label><input type="color" value={item.avatar_color || "#1B365D"} onChange={(e) => updateItem(data.items, i, "avatar_color", e.target.value)} className="h-7 w-10 p-0.5 rounded border" /></div>
                  <div className="ml-auto mt-4"><Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button></div>
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
      case "two_column":
        return (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Configure the left and right half-column blocks independently.</p>
            {["left", "right"].map((side) => {
              const col = data[side] || {};
              const updateCol = (key, val) => updateData(side, { ...col, [key]: val });
              const updateColItem = (arr, i, key, val) => {
                const next = arr.map((item, idx) => idx === i ? { ...item, [key]: val } : item);
                updateCol("items", next);
              };
              const addColItem = (defaults) => updateCol("items", [...(col.items || []), defaults]);
              const removeColItem = (i) => updateCol("items", (col.items || []).filter((_, idx) => idx !== i));

              return (
                <div key={side} className="border rounded-xl p-4 space-y-3 bg-white">
                  <h4 className="font-semibold text-sm capitalize text-gray-700">{side} Column</h4>
                  <div>
                    <Label className="text-xs">Block Type</Label>
                    <Select value={col.type || "text_block"} onValueChange={(v) => updateCol("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COLUMN_BLOCK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {(col.type === "text_block" || !col.type) && (
                    <div className="space-y-2">
                      <div><Label className="text-xs">Heading</Label><Input value={col.heading || ""} onChange={(e) => updateCol("heading", e.target.value)} placeholder="Section heading" /></div>
                      <div><Label className="text-xs">Body Text (supports markdown)</Label><Textarea rows={4} value={col.content || ""} onChange={(e) => updateCol("content", e.target.value)} /></div>
                      <div>
                        <Label className="text-xs">Text Alignment</Label>
                        <Select value={col.align || "left"} onValueChange={(v) => updateCol("align", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="border-t pt-2 space-y-2">
                        <Label className="text-xs font-semibold text-gray-600">CTA Button (optional)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label className="text-xs">Button Text</Label><Input value={col.btn_text || ""} onChange={(e) => updateCol("btn_text", e.target.value)} placeholder="Learn More" /></div>
                          <div><Label className="text-xs">Button Link</Label><Input value={col.btn_link || ""} onChange={(e) => updateCol("btn_link", e.target.value)} placeholder="/page/example" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2"><Label className="text-xs whitespace-nowrap">Button BG</Label><input type="color" value={col.btn_bg || "#E8792F"} onChange={(e) => updateCol("btn_bg", e.target.value)} className="h-7 w-10 p-0.5 rounded border" /></div>
                          <div className="flex items-center gap-2"><Label className="text-xs whitespace-nowrap">Button Text Color</Label><input type="color" value={col.btn_text_color || "#ffffff"} onChange={(e) => updateCol("btn_text_color", e.target.value)} className="h-7 w-10 p-0.5 rounded border" /></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {col.type === "image" && (
                    <div className="space-y-2">
                      <div><Label className="text-xs">Image URL</Label><Input value={col.image_url || ""} onChange={(e) => updateCol("image_url", e.target.value)} placeholder="https://..." /></div>
                      <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit text-sm">
                        <Upload className="w-3 h-3" /> Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          const { file_url } = await base44.integrations.Core.UploadFile({ file });
                          updateCol("image_url", file_url);
                        }} />
                      </label>
                      <div><Label className="text-xs">Alt Text</Label><Input value={col.alt || ""} onChange={(e) => updateCol("alt", e.target.value)} /></div>
                    </div>
                  )}

                  {col.type === "image_slider" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Images Per Slide</Label>
                        <Select value={String(col.per_slide || "1")} onValueChange={(v) => updateCol("per_slide", parseInt(v))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 at a time</SelectItem>
                            <SelectItem value="2">2 at a time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Label className="text-xs">Images (drag to reorder)</Label>
                      <SortableImageGrid
                        images={col.images || []}
                        onChange={(imgs) => updateCol("images", imgs)}
                        onRemove={(idx) => updateCol("images", (col.images || []).filter((_, i) => i !== idx))}
                        droppableId={`col-images-${side}`}
                      />
                      <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit text-sm">
                        <Upload className="w-3 h-3" /> Add Image
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          const { file_url } = await base44.integrations.Core.UploadFile({ file });
                          updateCol("images", [...(col.images || []), file_url]);
                        }} />
                      </label>
                    </div>
                  )}

                  {col.type === "testimonials" && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1"><Label className="text-xs">Card BG</Label><input type="color" value={col.card_bg || "#ffffff"} onChange={(e) => updateCol("card_bg", e.target.value)} className="h-6 w-8 p-0.5 rounded border" /></div>
                        <div className="flex items-center gap-1"><Label className="text-xs">Text</Label><input type="color" value={col.text_color || "#374151"} onChange={(e) => updateCol("text_color", e.target.value)} className="h-6 w-8 p-0.5 rounded border" /></div>
                        <div className="flex items-center gap-1"><Label className="text-xs">Stars</Label><input type="color" value={col.star_color || "#facc15"} onChange={(e) => updateCol("star_color", e.target.value)} className="h-6 w-8 p-0.5 rounded border" /></div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => addColItem({ name: "", text: "", rating: 5, location: "" })}>
                        <Plus className="w-3 h-3" /> Add Review
                      </Button>
                      {(col.items || []).map((item, i) => (
                        <div key={i} className="p-2 border rounded-lg space-y-1.5 bg-gray-50">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Input placeholder="Name" value={item.name || ""} onChange={(e) => updateColItem(col.items, i, "name", e.target.value)} />
                            <Input placeholder="Location" value={item.location || ""} onChange={(e) => updateColItem(col.items, i, "location", e.target.value)} />
                          </div>
                          <Textarea placeholder="Review text" value={item.text || ""} onChange={(e) => updateColItem(col.items, i, "text", e.target.value)} rows={2} />
                          <div className="flex items-center justify-between">
                            <div><Label className="text-xs">Rating</Label><Input type="number" min={1} max={5} value={item.rating || 5} onChange={(e) => updateColItem(col.items, i, "rating", parseInt(e.target.value))} className="w-14" /></div>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeColItem(i)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {col.type === "features" && (
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => addColItem({ icon: "Check", title: "", desc: "" })}>
                        <Plus className="w-3 h-3" /> Add Feature
                      </Button>
                      {(col.items || []).map((item, i) => (
                        <div key={i} className="p-2 border rounded-lg space-y-1.5 bg-gray-50">
                          <div className="flex items-end gap-2">
                            <div className="flex-1"><Label className="text-xs mb-1 block">Icon</Label><IconPicker value={item.icon || ""} onChange={(v) => updateColItem(col.items, i, "icon", v)} /></div>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeColItem(i)}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                          <Input placeholder="Title" value={item.title || ""} onChange={(e) => updateColItem(col.items, i, "title", e.target.value)} />
                          <Textarea placeholder="Description" value={item.desc || ""} onChange={(e) => updateColItem(col.items, i, "desc", e.target.value)} rows={2} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
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

          {/* Disclaimer box */}
          <div className="border-t pt-4">
            <div className="border rounded-xl p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">Section Disclaimer</Label>
                <Switch checked={!!(data.disclaimer?.enabled)} onCheckedChange={(v) => updateData("disclaimer", { ...(data.disclaimer||{}), enabled: v })} />
              </div>
              {data.disclaimer?.enabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Disclaimer Text</Label>
                    <Textarea rows={2} value={data.disclaimer?.text || ""} onChange={(e) => updateData("disclaimer", { ...(data.disclaimer||{}), text: e.target.value })} placeholder="* Offer subject to availability. Terms and conditions apply." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Font Size</Label>
                      <Select value={data.disclaimer?.size || "xs"} onValueChange={(v) => updateData("disclaimer", { ...(data.disclaimer||{}), size: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xs">Extra Small</SelectItem>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="base">Normal</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Font Style</Label>
                      <Select value={data.disclaimer?.style || "normal"} onValueChange={(v) => updateData("disclaimer", { ...(data.disclaimer||{}), style: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="italic">Italic</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="bold-italic">Bold Italic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Alignment</Label>
                      <Select value={data.disclaimer?.align || "center"} onValueChange={(v) => updateData("disclaimer", { ...(data.disclaimer||{}), align: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Label className="text-xs whitespace-nowrap">Text Color</Label>
                      <input type="color" value={data.disclaimer?.color || "#6b7280"} onChange={(e) => updateData("disclaimer", { ...(data.disclaimer||{}), color: e.target.value })} className="h-7 w-10 p-0.5 rounded border" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <Select value={data.disclaimer?.font || "inherit"} onValueChange={(v) => updateData("disclaimer", { ...(data.disclaimer||{}), font: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">Default (inherit)</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                        <SelectItem value="cursive">Cursive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminHomePage() {
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    hero_title: "", hero_subtitle: "", hero_image: "", hero_images: [], hero_badge_text: "",
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
    // Add to carousel images list
    update("hero_images", [...(form.hero_images || []), file_url]);
    // Also set hero_image to first image for backward compat
    if (!(form.hero_images?.length)) update("hero_image", file_url);
  };
  const removeHeroImage = (idx) => {
    const imgs = (form.hero_images || []).filter((_, i) => i !== idx);
    update("hero_images", imgs);
    update("hero_image", imgs[0] || "");
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Home Page Editor</h1>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="rounded-full gap-2 border-green-300 text-green-700 hover:bg-green-50">
            <Globe className="w-4 h-4" /> Live
          </Button>
        </a>
        <Button variant="outline" className="rounded-full gap-2" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Hide Preview" : "Preview"}
        </Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`overflow-y-auto p-6 space-y-6 ${showPreview ? "w-1/2 border-r" : "w-full max-w-4xl mx-auto"}`}>
        {/* Hero */}
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Badge Text (small tag above title)</Label><Input value={form.hero_badge_text || ""} onChange={(e) => update("hero_badge_text", e.target.value)} placeholder="WE'RE OPEN. CONTACTLESS LEASING AVAILABLE." /></div>
            <div><Label>Title</Label><Input value={form.hero_title || ""} onChange={(e) => update("hero_title", e.target.value)} placeholder="Your Space, Your Storage" /></div>
            <div><Label>Subtitle</Label><Textarea rows={2} value={form.hero_subtitle || ""} onChange={(e) => update("hero_subtitle", e.target.value)} placeholder="Find the perfect storage unit near you." /></div>
            <div>
              <Label>Background Overlay Opacity ({Math.round((form.hero_overlay_opacity || 0.6) * 100)}%)</Label>
              <input type="range" min={0} max={1} step={0.05} value={form.hero_overlay_opacity || 0.6} onChange={(e) => update("hero_overlay_opacity", parseFloat(e.target.value))} className="w-full mt-1" />
            </div>

            {/* Arrow controls */}
            <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Side Arrow Buttons</Label>
                <Switch checked={(form.hero_arrows?.show ?? true)} onCheckedChange={(v) => update("hero_arrows", { ...(form.hero_arrows||{}), show: v })} />
              </div>
              {(form.hero_arrows?.show ?? true) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Arrow Style</Label>
                    <Select value={form.hero_arrows?.style || "circle"} onValueChange={(v) => update("hero_arrows", { ...(form.hero_arrows||{}), style: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="pill">Pill</SelectItem>
                        <SelectItem value="arrow">Arrow Only (no bg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Icon Type</Label>
                    <Select value={form.hero_arrows?.icon_type || "chevron"} onValueChange={(v) => update("hero_arrows", { ...(form.hero_arrows||{}), icon_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chevron">Chevron ‹ ›</SelectItem>
                        <SelectItem value="arrow">Arrow ← →</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Button BG</Label>
                    <input type="color" value={form.hero_arrows?.color || "#000000"} onChange={(e) => update("hero_arrows", { ...(form.hero_arrows||{}), color: e.target.value })} className="h-7 w-10 p-0.5 rounded border" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Icon Color</Label>
                    <input type="color" value={form.hero_arrows?.icon_color || "#ffffff"} onChange={(e) => update("hero_arrows", { ...(form.hero_arrows||{}), icon_color: e.target.value })} className="h-7 w-10 p-0.5 rounded border" />
                  </div>
                </div>
              )}
            </div>

            {/* Dot controls */}
            <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Slide Indicator Dots</Label>
                <Switch checked={(form.hero_dots?.show ?? true)} onCheckedChange={(v) => update("hero_dots", { ...(form.hero_dots||{}), show: v })} />
              </div>
              {(form.hero_dots?.show ?? true) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Dot Style</Label>
                    <Select value={form.hero_dots?.style || "circle"} onValueChange={(v) => update("hero_dots", { ...(form.hero_dots||{}), style: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="line">Line (expands when active)</SelectItem>
                        <SelectItem value="dash">Dash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Active Color</Label>
                    <input type="color" value={form.hero_dots?.active_color || "#E8792F"} onChange={(e) => update("hero_dots", { ...(form.hero_dots||{}), active_color: e.target.value })} className="h-7 w-10 p-0.5 rounded border" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Inactive Color</Label>
                    <input type="color" value={form.hero_dots?.inactive_color || "#aaaaaa"} onChange={(e) => update("hero_dots", { ...(form.hero_dots||{}), inactive_color: e.target.value })} className="h-7 w-10 p-0.5 rounded border" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Hero Carousel Images</Label>
              <p className="text-xs text-gray-500 mb-2">Add multiple images — drag to reorder, hover to remove.</p>
              <div className="mb-3">
                <SortableImageGrid
                  images={form.hero_images || []}
                  onChange={(imgs) => { update("hero_images", imgs); update("hero_image", imgs[0] || ""); }}
                  onRemove={removeHeroImage}
                  showMainBadge
                  droppableId="hero-images"
                />
              </div>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit">
                <Upload className="w-4 h-4" /> Add Carousel Image
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
              </label>
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
        </div>{/* end scrollable editor */}

        {/* Preview panel */}
        {showPreview && (
          <div className="w-1/2 overflow-hidden flex flex-col border-l">
            <div className="bg-gray-100 border-b px-4 py-2 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Preview</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <HomePagePreview config={form} />
            </div>
          </div>
        )}
      </div>{/* end body flex */}
    </div>
  );
}