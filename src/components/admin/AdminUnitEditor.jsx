import React, { useState } from "react";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp, GripVertical, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import RichTextEditor from "./RichTextEditor";

export default function AdminUnitEditor({ units, facilityType, onChange }) {
  const [openIndexes, setOpenIndexes] = useState({});
  const isBC = facilityType === "business_center";

  const toggleOpen = (i) => setOpenIndexes((prev) => ({ ...prev, [i]: !prev[i] }));

  const addUnit = () => {
    onChange([...units, {
      name: "", size: "", price: 0,
      unit_type: isBC ? "" : "Standard",
      available: true, features: [], photos: [], videos: []
    }]);
    // auto-open the new unit
    setOpenIndexes((prev) => ({ ...prev, [units.length]: true }));
  };

  const removeUnit = (i) => {
    onChange(units.filter((_, j) => j !== i));
    setOpenIndexes((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < i) next[ki] = v;
        else if (ki > i) next[ki - 1] = v;
      });
      return next;
    });
  };

  const updateUnit = (i, key, val) => {
    const updated = [...units];
    updated[i] = { ...updated[i], [key]: val };
    onChange(updated);
  };

  const handleSort = (sortKey) => {
    const sorted = [...units].sort((a, b) => {
      if (sortKey === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortKey === "price_desc") return (b.price || 0) - (a.price || 0);
      // Size: try to parse a number from size string
      const sizeNum = (u) => parseFloat((u.size || "").replace(/[^0-9.]/g, "")) || 0;
      if (sortKey === "size_asc") return sizeNum(a) - sizeNum(b);
      if (sortKey === "size_desc") return sizeNum(b) - sizeNum(a);
      return 0;
    });
    onChange(sorted);
    setOpenIndexes({});
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(units);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered);
    setOpenIndexes({});
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="gap-2" onClick={addUnit}>
          <Plus className="w-4 h-4" /> Add Unit
        </Button>
        {units.length > 1 && (
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Sort:</span>
            <Select onValueChange={handleSort}>
              <SelectTrigger className="h-8 text-xs w-48">
                <SelectValue placeholder="Sort units…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="size_asc">Size: Small → Large</SelectItem>
                <SelectItem value="size_desc">Size: Large → Small</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {isBC && (
          <p className="text-xs text-gray-500">Business Center: prices shown as "Starting at", units use "Inquire".</p>
        )}
      </div>

      {units.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No units yet. Click "Add Unit" to get started.</p>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="admin-units">
          {(provided) => (
            <div className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
              {units.map((unit, i) => {
                const isOpen = !!openIndexes[i];
                return (
                  <Draggable key={i} draggableId={`unit-${i}`} index={i}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border rounded-xl bg-white overflow-hidden transition-shadow ${snapshot.isDragging ? "shadow-lg ring-2 ring-[#1B365D]" : ""}`}
                      >
                        {/* Collapsed header */}
                        <div className="flex items-center gap-2 px-4 py-3">
                          <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab flex-shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <button
                            className="flex-1 flex items-center gap-3 text-left min-w-0"
                            onClick={() => toggleOpen(i)}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-sm text-gray-800">
                                {unit.name || `Unit #${i + 1}`}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                {unit.size && `${unit.size}`}
                                {unit.size && unit.price > 0 && " · "}
                                {unit.price > 0 && `$${unit.price.toLocaleString()}/mo`}
                                {unit.unit_type && ` · ${unit.unit_type}`}
                              </span>
                            </div>
                            {isOpen
                              ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          </button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-400 w-7 h-7 flex-shrink-0"
                            onClick={() => removeUnit(i)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Expanded content */}
                        {isOpen && (
                          <div className="border-t px-4 py-4 space-y-4 bg-gray-50">
                            {/* Basic info */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                              <div>
                                <Label>Name</Label>
                                <Input value={unit.name || ""} onChange={(e) => updateUnit(i, "name", e.target.value)} placeholder="Suite 101" />
                              </div>
                              <div>
                                <Label>{isBC ? "Square Footage / Size" : "Size"}</Label>
                                <Input value={unit.size || ""} onChange={(e) => updateUnit(i, "size", e.target.value)} placeholder={isBC ? "1,200 sq ft" : "10x10"} />
                              </div>
                              <div>
                                <Label>{isBC ? "Starting Price/mo" : "Price/mo"}</Label>
                                <Input type="number" value={unit.price || 0} onChange={(e) => updateUnit(i, "price", parseFloat(e.target.value) || 0)} />
                              </div>
                              <div>
                                <Label>Unit Type</Label>
                                <Select value={unit.unit_type || ""} onValueChange={(v) => updateUnit(i, "unit_type", v)}>
                                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                                  <SelectContent>
                                    {isBC ? (
                                      <>
                                        <SelectItem value={null}>— None —</SelectItem>
                                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                                        <SelectItem value="Office Space">Office Space</SelectItem>
                                        <SelectItem value="Warehouse/Office Space">Warehouse/Office Space</SelectItem>
                                        <SelectItem value="Suite">Suite</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </>
                                    ) : (
                                      <>
                                        <SelectItem value="Standard">Standard</SelectItem>
                                        <SelectItem value="Climate Controlled">Climate Controlled</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Availability (self storage only) */}
                            {!isBC && (
                              <div className="flex items-center gap-2">
                                <Switch checked={unit.available !== false} onCheckedChange={(v) => updateUnit(i, "available", v)} />
                                <Label>{unit.available !== false ? "Available" : "Occupied / Unavailable"}</Label>
                              </div>
                            )}

                            {/* Business Center options */}
                            {isBC && (
                              <div className="border rounded-xl p-4 bg-blue-50 space-y-3">
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Business Center Options</p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">Show Open / Closed Status</p>
                                    <p className="text-xs text-gray-500">Display an open/closed badge on this unit's card</p>
                                  </div>
                                  <Switch checked={!!unit.show_is_open} onCheckedChange={(v) => updateUnit(i, "show_is_open", v)} />
                                </div>
                                {unit.show_is_open && (
                                  <div className="flex items-center justify-between pl-4 border-l-2 border-blue-200">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Currently Open?</p>
                                      <p className="text-xs text-gray-400">Toggle whether this space is open right now</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-semibold ${unit.is_open ? "text-green-600" : "text-red-500"}`}>
                                        {unit.is_open ? "Open" : "Closed"}
                                      </span>
                                      <Switch checked={!!unit.is_open} onCheckedChange={(v) => updateUnit(i, "is_open", v)} />
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">Enable "More Info" Button</p>
                                    <p className="text-xs text-gray-500">Shows a button linking to a dedicated unit detail page</p>
                                  </div>
                                  <Switch checked={!!unit.show_more_info} onCheckedChange={(v) => updateUnit(i, "show_more_info", v)} />
                                </div>
                              </div>
                            )}

                            {/* Unit features */}
                            <div>
                              <Label className="mb-2 block">Unit Features <span className="text-xs font-normal text-gray-400">(e.g. Power, Private Restroom)</span></Label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {(unit.features || []).map((f, fi) => (
                                  <span key={fi} className="flex items-center gap-1 bg-white border rounded-full px-3 py-1 text-xs text-gray-700">
                                    {f}
                                    <button onClick={() => updateUnit(i, "features", unit.features.filter((_, fj) => fj !== fi))} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                                  </span>
                                ))}
                              </div>
                              <Input
                                placeholder="Add feature and press Enter"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && e.target.value.trim()) {
                                    updateUnit(i, "features", [...(unit.features || []), e.target.value.trim()]);
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </div>

                            {/* Unit photos */}
                            <div>
                              <Label className="mb-2 block">Unit Photos <span className="text-xs font-normal text-gray-400">(optional)</span></Label>
                              <div className="flex gap-2 flex-wrap">
                                {(unit.photos || []).map((url, pi) => (
                                  <div key={pi} className="relative group">
                                    <img src={url} alt="" className="h-20 w-28 object-cover rounded-lg" />
                                    <button onClick={() => updateUnit(i, "photos", unit.photos.filter((_, pj) => pj !== pi))}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                                  </div>
                                ))}
                                <label className="h-20 w-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-400 text-xs gap-1">
                                  <Upload className="w-4 h-4" />
                                  Add Photo
                                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                    const file = e.target.files[0]; if (!file) return;
                                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                    updateUnit(i, "photos", [...(unit.photos || []), file_url]);
                                  }} />
                                </label>
                              </div>
                            </div>

                            {/* Unit videos */}
                            <div>
                              <Label className="mb-2 block">Unit Videos <span className="text-xs font-normal text-gray-400">(optional — YouTube/Vimeo embed URLs)</span></Label>
                              <div className="space-y-2">
                                {(unit.videos || []).map((url, vi) => (
                                  <div key={vi} className="flex gap-2">
                                    <Input value={url} placeholder="https://www.youtube.com/embed/..." onChange={(e) => {
                                      const vids = [...(unit.videos || [])]; vids[vi] = e.target.value; updateUnit(i, "videos", vids);
                                    }} className="flex-1" />
                                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => updateUnit(i, "videos", unit.videos.filter((_, vj) => vj !== vi))}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => updateUnit(i, "videos", [...(unit.videos || []), ""])}>
                                  <Plus className="w-3 h-3" /> Add Video URL
                                </Button>
                              </div>
                            </div>

                            {/* BC-only: Description & PDF */}
                            {isBC && (
                              <>
                                <div>
                                  <Label className="mb-2 block">Unit Description <span className="text-xs font-normal text-gray-400">(shown on the More Info page)</span></Label>
                                  <RichTextEditor
                                    value={unit.description || ""}
                                    onChange={(v) => updateUnit(i, "description", v)}
                                    placeholder="Describe this space..."
                                    minHeight={120}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-1 block">PDF Document URL <span className="text-xs font-normal text-gray-400">(optional — brochure, floor plan, etc.)</span></Label>
                                  <Input
                                    value={unit.pdf_url || ""}
                                    onChange={(e) => updateUnit(i, "pdf_url", e.target.value)}
                                    placeholder="https://..."
                                  />
                                </div>
                              </>
                            )}
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
    </div>
  );
}