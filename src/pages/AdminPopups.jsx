import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPopups() {
  const queryClient = useQueryClient();

  const { data: popups, isLoading } = useQuery({
    queryKey: ["admin-popups"],
    queryFn: () => base44.entities.Popup.list("-created_date"),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Popup.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-popups"] }),
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Popups</h1>
          <p className="text-gray-500 mt-1">Create and manage promotional popups.</p>
        </div>
        <Link to={createPageUrl("AdminPopupEdit")}>
          <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
            <Plus className="w-4 h-4" /> Add Popup
          </Button>
        </Link>
      </div>

      {popups.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No popups yet</h3>
            <p className="text-gray-500 mb-6">Create your first popup to engage visitors.</p>
            <Link to={createPageUrl("AdminPopupEdit")}>
              <Button className="rounded-full gap-2" style={{ background: "#E8792F" }}>
                <Plus className="w-4 h-4" /> Add Popup
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {popups.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{p.title || <span className="italic text-gray-400">Untitled</span>}</h3>
                    <Badge className={`border-0 text-xs ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </Badge>
                    {p.template && p.template !== "centered" && (
                      <Badge className="border-0 text-xs bg-blue-50 text-blue-600 capitalize">{p.template.replace(/_/g, " ")}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Trigger: {p.trigger?.replace(/_/g, " ")} • Pages: {p.show_on_pages?.join(", ") || "All"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={createPageUrl("AdminPopupEdit") + `?id=${p.id}`}>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => {
                    if (confirm("Delete this popup?")) deleteMutation.mutate(p.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}