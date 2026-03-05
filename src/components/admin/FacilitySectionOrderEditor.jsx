import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

const ALL_SECTIONS = [
  { key: "contact", label: "Contact Information" },
  { key: "about", label: "About This Location" },
  { key: "features", label: "Features & Amenities" },
  { key: "units", label: "Available Units" },
  { key: "photos", label: "Photo Gallery" },
  { key: "videos", label: "Videos" },
  { key: "reviews", label: "Customer Reviews" },
  { key: "faq", label: "Frequently Asked Questions" },
];

export default function FacilitySectionOrderEditor({ order, onChange }) {
  // Fill in any missing sections at the end
  const fullOrder = [
    ...order.filter((k) => ALL_SECTIONS.find((s) => s.key === k)),
    ...ALL_SECTIONS.map((s) => s.key).filter((k) => !order.includes(k)),
  ];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...fullOrder];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onChange(items);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Drag to reorder how sections appear on the facility page.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {fullOrder.map((key, index) => {
                const section = ALL_SECTIONS.find((s) => s.key === key);
                if (!section) return null;
                return (
                  <Draggable key={key} draggableId={key} index={index}>
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className={`flex items-center gap-3 p-3 bg-white border rounded-xl select-none transition-shadow ${snap.isDragging ? "shadow-lg border-[#E8792F]" : "border-gray-200"}`}
                      >
                        <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{section.label}</span>
                        <span className="ml-auto text-xs text-gray-400">#{index + 1}</span>
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