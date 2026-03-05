import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, FileText, Pencil, Trash2, Eye, Globe, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AdminPages() {
  const queryClient = useQueryClient();
  const [ordered, setOrdered] = useState([]);

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => base44.entities.StaticPage.list("-created_date"),
    initialData: [],
  });

  useEffect(() => { setOrdered(pages); }, [pages]);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StaticPage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-pages"] }),
  });

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Static Pages</h1>
          <p className="text-gray-500 mt-1">Drag to reorder. Manage About, FAQ, Terms, and custom pages.</p>
        </div>
        <Link to={createPageUrl("AdminPageEdit")}>
          <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
            <Plus className="w-4 h-4" /> Add Page
          </Button>
        </Link>
      </div>

      {ordered.length === 0 && !isLoading ? (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
            <p className="text-gray-500 mb-6">Create your first static page.</p>
            <Link to={createPageUrl("AdminPageEdit")}>
              <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
                <Plus className="w-4 h-4" /> Add Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="pages">
            {(provided) => (
              <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                {ordered.map((p, index) => (
                  <Draggable key={p.id} draggableId={p.id} index={index}>
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
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{p.title}</h3>
                              <Badge className={`border-0 text-xs ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                {p.status}
                              </Badge>
                              {p.show_in_nav && (
                                <Badge className="border-0 text-xs bg-blue-100 text-blue-700">
                                  <Globe className="w-3 h-3 mr-1" /> In Nav
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">/{p.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={createPageUrl("PublicPage") + `?slug=${p.slug}`}>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={createPageUrl("AdminPageEdit") + `?id=${p.id}`}>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => { if (confirm("Delete this page?")) deleteMutation.mutate(p.id); }}
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