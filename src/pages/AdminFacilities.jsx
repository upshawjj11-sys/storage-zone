import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Building2, MapPin, Pencil, Trash2, Eye, GripVertical, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AdminFacilities() {
  const queryClient = useQueryClient();
  const [ordered, setOrdered] = useState([]);

  const { data: facilities, isLoading } = useQuery({
    queryKey: ["admin-facilities"],
    queryFn: () => base44.entities.Facility.list("-created_date"),
    initialData: [],
  });

  useEffect(() => { setOrdered(facilities); }, [facilities]);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Facility.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-facilities"] }),
  });

  const duplicateFacility = async (f) => {
    const { id, created_date, updated_date, created_by, ...data } = f;
    await base44.entities.Facility.create({
      ...data,
      name: `${data.name} (Copy)`,
      slug: `${data.slug || data.name.toLowerCase().replace(/\s+/g,"-")}-copy`,
      status: "inactive",
    });
    queryClient.invalidateQueries({ queryKey: ["admin-facilities"] });
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    coming_soon: "bg-yellow-100 text-yellow-700",
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(ordered);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOrdered(items);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Facilities</h1>
          <p className="text-gray-500 mt-1">Drag to reorder. Manage your storage locations.</p>
        </div>
        <Link to={createPageUrl("AdminFacilityEdit")}>
          <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
            <Plus className="w-4 h-4" /> Add Facility
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No facilities yet</h3>
            <p className="text-gray-500 mb-6">Add your first storage facility to get started.</p>
            <Link to={createPageUrl("AdminFacilityEdit")}>
              <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
                <Plus className="w-4 h-4" /> Add Facility
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="facilities">
            {(provided) => (
              <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                {ordered.map((f, index) => (
                  <Draggable key={f.id} draggableId={f.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between transition ${snapshot.isDragging ? "shadow-xl ring-2 ring-[#E8792F]/30" : "hover:shadow-md"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {(f.banner_image || f.photos?.[0]) ? (
                              <img src={f.banner_image || f.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{f.name}</h3>
                              <Badge className={`border-0 text-xs ${statusColors[f.status] || statusColors.active}`}>
                                {f.status?.replace(/_/g, " ") || "active"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {f.city ? `${f.city}, ${f.state}` : "No address set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={createPageUrl("FacilityPage") + `?id=${f.id}`}>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={createPageUrl("AdminFacilityEdit") + `?id=${f.id}`}>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => { if (confirm("Delete this facility?")) deleteMutation.mutate(f.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
      )}
    </div>
  );
}