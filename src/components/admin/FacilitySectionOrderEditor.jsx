import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Eye, EyeOff } from "lucide-react";

const ALL_SECTIONS = [
  { key: "contact", label: "Contact Information" },
  { key: "about", label: "About This Location" },
  { key: "features", label: "Features & Amenities" },
  { key: "units", label: "Available Units" },
  { key: "photos", label: "Photo Gallery" },
  { key: "videos", label: "Videos" },
  { key: "reviews", label: "Customer Reviews" },
  { key: "faq", label: "Frequently Asked Questions" },
  { key: "socials", label: "Social Media" },
];

export default function FacilitySectionOrderEditor({ order, onChange }) {
  // Parse order: can be array of strings (backwards compat) or objects with {key, visible}
  const parseOrder = (rawOrder) => {
    return rawOrder.map((item) => {
      if (typeof item === "string") return { key: item, visible: true };
      return item;
    });
  };

  const normalizeOrder = (parsed) => {
    return parsed.map((item) => ({
      key: item.key,
      visible: item.visible !== false,
    }));
  };

  const parsedOrder = parseOrder(order || []);
  const fullOrder = [
    ...parsedOrder.filter((item) => ALL_SECTIONS.find((s) => s.key === item.key)),
    ...ALL_SECTIONS.map((s) => ({ key: s.key, visible: true })).filter(
      (item) => !parsedOrder.find((p) => p.key === item.key)
    ),
  ];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...fullOrder];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(normalizeOrder(items));
  };

  const toggleVisibility = (key) => {
    const updated = fullOrder.map((item) =>
      item.key === key ? { ...item, visible: !item.visible } : item
    );
    onChange(normalizeOrder(updated));
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Drag to reorder how sections appear on the facility page.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
               {fullOrder.map((item, index) => {
                 const section = ALL_SECTIONS.find((s) => s.key === item.key);
                 if (!section) return null;
                 return (
                   <Draggable key={item.key} draggableId={item.key} index={index}>
                     {(prov, snap) => (
                       <div
                         ref={prov.innerRef}
                         {...prov.draggableProps}
                         {...prov.dragHandleProps}
                         className={`flex items-center gap-3 p-3 bg-white border rounded-xl select-none transition-shadow ${snap.isDragging ? "shadow-lg border-[#E8792F]" : "border-gray-200"} ${!item.visible ? "opacity-50" : ""}`}
                       >
                         <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                         <span className="text-sm font-medium text-gray-700">{section.label}</span>
                         <span className="ml-auto text-xs text-gray-400">#{index + 1}</span>
                         <button
                           onClick={() => toggleVisibility(item.key)}
                           className="text-gray-400 hover:text-gray-600 transition"
                         >
                           {item.visible ? (
                             <Eye className="w-4 h-4" />
                           ) : (
                             <EyeOff className="w-4 h-4" />
                           )}
                         </button>
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