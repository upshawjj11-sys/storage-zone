import React, { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ITEM_CATEGORIES, UNIT_SIZES as FALLBACK_UNIT_SIZES } from "./itemData";
import { Plus, Minus, Trash2, GripVertical, ChevronDown, ChevronUp, Info } from "lucide-react";

export default function UnitCalculator({ categories: propCategories, cfg = {} }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);

  // Use prop categories if provided, otherwise fall back to hardcoded
  const categories = propCategories || ITEM_CATEGORIES.map((cat, ci) => ({
    id: `cat-${ci}`, label: cat.label, icon: cat.icon, items: cat.items,
  }));

  const totalCuft = useMemo(
    () => selectedItems.reduce((sum, si) => sum + si.cuft * si.qty, 0),
    [selectedItems]
  );

  // Add 50% buffer — furniture can't be stacked easily, need room to maneuver
  const bufferedCuft = totalCuft * 1.5;

  const recommendation = useMemo(() => {
    if (totalCuft === 0) return null;

    // For each item, find the minimum unit whose floor can fit it
    // (item can be rotated, so we check both orientations)
    const itemFitsInUnit = (item, unit) => {
      const { w, d } = item; // item dimensions in inches
      const { widthIn, depthIn } = unit;
      return (
        (w <= widthIn && d <= depthIn) ||
        (d <= widthIn && w <= depthIn)
      );
    };

    // Find the smallest unit index that can fit EVERY selected item AND has enough volume
    const minIndexByFootprint = selectedItems.reduce((maxIdx, si) => {
      const idx = UNIT_SIZES.findIndex((u) => itemFitsInUnit(si, u));
      return idx === -1 ? UNIT_SIZES.length - 1 : Math.max(maxIdx, idx);
    }, 0);

    // Find smallest unit index by volume
    const minIndexByVolume = UNIT_SIZES.findIndex((u) => u.cuft >= bufferedCuft);

    // Take the larger of the two constraints
    const minIndex = Math.max(
      minIndexByFootprint,
      minIndexByVolume === -1 ? UNIT_SIZES.length - 1 : minIndexByVolume
    );

    if (minIndex >= UNIT_SIZES.length) {
      return { min: UNIT_SIZES[UNIT_SIZES.length - 1], max: null, tooLarge: true };
    }

    // Bias toward the next size up — furniture is hard to stack and customers
    // generally need more room than they think. Show min as the "at least" size
    // and max (one step up) as the primary recommendation.
    const min = UNIT_SIZES[minIndex];
    const max = minIndex + 1 < UNIT_SIZES.length ? UNIT_SIZES[minIndex + 1] : null;
    return { min, recommended: max || min, max, tooLarge: false };
  }, [bufferedCuft, totalCuft, selectedItems]);

  const addItem = (item) => {
    setSelectedItems((prev) => {
      const existing = prev.find((si) => si.id === item.id);
      if (existing) {
        return prev.map((si) => si.id === item.id ? { ...si, qty: si.qty + 1 } : si);
      }
      return [...prev, { ...item, qty: 1, uid: `${item.id}-${Date.now()}` }];
    });
  };

  const updateQty = (id, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((si) => si.id === id ? { ...si, qty: si.qty + delta } : si)
        .filter((si) => si.qty > 0)
    );
  };

  const removeItem = (id) => {
    setSelectedItems((prev) => prev.filter((si) => si.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedItems);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSelectedItems(items);
  };

  // Visual unit fill percentage — based on recommended min unit
  const fillPct = recommendation
    ? Math.min(99, Math.round((bufferedCuft / (recommendation.min?.cuft || 1)) * 100))
    : 0;

  return (
    <div className="pb-16">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Item Picker */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">1. Select Your Items</h2>
          <p className="text-sm text-gray-500 mb-4">Click any item to add it to your storage unit, then adjust quantities.</p>
          <div className="space-y-2">
            {categories.map((cat) => {
              const isOpen = openCategory === cat.id || openCategory === cat.label;
              return (
                <div key={cat.id || cat.label} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
                    onClick={() => setOpenCategory(isOpen ? null : (cat.id || cat.label))}
                  >
                    <span className="font-semibold text-gray-800 flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.label}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {cat.items.map((item) => {
                        const inList = selectedItems.find((si) => si.id === item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => addItem(item)}
                            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all text-sm font-medium hover:shadow-md ${
                              inList
                                ? "border-[#E8792F] bg-orange-50 text-[#E8792F]"
                                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#1B365D]"
                            }`}
                          >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="leading-tight">{item.label}</span>
                            <span className="text-xs text-gray-400 font-normal">{item.cuft} cu ft</span>
                            {inList && (
                              <span className="absolute top-1.5 right-1.5 bg-[#E8792F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {inList.qty}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Unit View + Results */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-gray-800 mb-1">2. Your Storage Unit</h2>

          {/* Selected Items List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-700 text-sm">Selected Items</span>
              {selectedItems.length > 0 && (
                <button onClick={() => setSelectedItems([])} className="text-xs text-red-400 hover:text-red-600 transition">
                  Clear all
                </button>
              )}
            </div>
            {selectedItems.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm">Add items from the left to get started</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="selected-items">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="divide-y divide-gray-100"
                    >
                      {selectedItems.map((si, index) => (
                        <Draggable key={si.uid} draggableId={si.uid} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-3 px-4 py-3 ${snapshot.isDragging ? "bg-blue-50 shadow-md rounded-xl" : "bg-white"}`}
                            >
                              <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab flex-shrink-0">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <span className="text-xl flex-shrink-0">{si.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{si.label}</p>
                                <p className="text-xs text-gray-400">
                                  {Math.round(si.w / 12 * 10) / 10}' × {Math.round(si.d / 12 * 10) / 10}' × {Math.round(si.h / 12 * 10) / 10}' · {si.cuft * si.qty} cu ft
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => updateQty(si.id, -1)}
                                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold text-gray-800">{si.qty}</span>
                                <button
                                  onClick={() => updateQty(si.id, 1)}
                                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(si.id)}
                                className="text-gray-300 hover:text-red-400 transition flex-shrink-0 ml-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
          </div>

          {/* Visual fill + Recommendation */}
          {selectedItems.length > 0 && (
            <>
              {/* Fill Visualizer */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700 text-sm">Estimated Fill</span>
                  <span className="text-sm text-gray-500">{Math.round(totalCuft)} cu ft of items</span>
                </div>
                <div className="relative h-36 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                  {/* Unit outline */}
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-700 flex items-end justify-center"
                    style={{
                      height: `${fillPct}%`,
                      background: fillPct > 85
                        ? "linear-gradient(to top, #ef4444, #f97316)"
                        : fillPct > 60
                        ? "linear-gradient(to top, #E8792F, #fbbf24)"
                        : "linear-gradient(to top, #1B365D, #3b82f6)",
                      opacity: 0.85,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                    <span className="text-2xl font-bold text-white drop-shadow">{fillPct}%</span>
                    <span className="text-xs text-white/80 drop-shadow">unit capacity used</span>
                    {recommendation?.min && (
                      <span className="text-xs text-white/70 mt-1 drop-shadow">
                        Based on {recommendation.min.label}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {cfg.buffer_notice || "50% buffer added — furniture can't be easily stacked, so extra room is factored in for access and layout."}
                </p>
              </div>

              {/* Recommendation Card */}
              <div className="rounded-2xl p-6 shadow-lg" style={{ background: cfg.recommendation_bg || "#1B365D", color: cfg.recommendation_text || "#ffffff" }}>
                <p className="text-sm font-medium mb-1 opacity-70">Recommended Unit Size</p>
                {recommendation?.tooLarge ? (
                  <p className="text-xl font-bold">10' × 30' or larger</p>
                ) : (
                  <p className="text-3xl font-bold">{recommendation?.recommended?.label}</p>
                )}
                <p className="text-sm mt-2 opacity-80">{recommendation?.recommended?.desc}</p>
                {recommendation?.recommended?.label !== recommendation?.min?.label && (
                  <p className="text-xs mt-2 opacity-60">
                    Minimum fit: {recommendation?.min?.label} — but we recommend sizing up so furniture can lay flat and you have room to access your items.
                  </p>
                )}
                <a
                  href={cfg.cta_link || "/locations"}
                  className="mt-4 inline-block font-semibold px-5 py-2.5 rounded-xl text-sm transition hover:opacity-90"
                  style={{ background: cfg.cta_bg || "#E8792F", color: cfg.cta_text_color || "#ffffff" }}
                >
                  {cfg.cta_text || "Find a Location →"}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}