import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

/**
 * A drag-to-reorder image grid.
 * Props:
 *   images: string[]
 *   onChange: (newImages: string[]) => void
 *   onRemove: (idx: number) => void
 *   showMainBadge?: boolean  — marks index 0 as "Main"
 *   droppableId?: string     — unique id when multiple grids exist on page
 */
export default function SortableImageGrid({ images = [], onChange, onRemove, showMainBadge = false, droppableId = "img-grid" }) {
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onChange(reordered);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId} direction="horizontal">
        {(provided) => (
          <div
            className="flex flex-wrap gap-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {images.map((img, idx) => (
              <Draggable key={img + idx} draggableId={`${droppableId}-${idx}`} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`relative group w-28 h-20 flex-shrink-0 rounded-lg border overflow-hidden ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-400" : ""}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {/* drag handle */}
                    <div
                      {...provided.dragHandleProps}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20 cursor-grab"
                    >
                      <GripVertical className="w-5 h-5 text-white drop-shadow" />
                    </div>
                    {/* remove */}
                    <button
                      onClick={() => onRemove(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10"
                    >×</button>
                    {showMainBadge && idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 rounded pointer-events-none">Main</span>
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
  );
}