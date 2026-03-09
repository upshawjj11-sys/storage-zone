import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminForms() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["form-configs"],
    queryFn: () => base44.entities.FormConfig.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FormConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["form-configs"] }),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Forms</h1>
          <p className="text-gray-500 text-sm mt-1">Build and manage reusable contact forms for your pages.</p>
        </div>
        <Button onClick={() => navigate(createPageUrl("AdminFormEdit"))} style={{ background: "#E8792F" }} className="gap-2">
          <Plus className="w-4 h-4" /> New Form
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No forms yet</p>
            <p className="text-gray-400 text-sm mt-1">Create a form and add it to any page as a Contact Form block.</p>
            <Button onClick={() => navigate(createPageUrl("AdminFormEdit"))} className="mt-4 gap-2" style={{ background: "#E8792F" }}>
              <Plus className="w-4 h-4" /> Create your first form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forms.map(form => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 px-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{form.name}</h3>
                    <Badge variant={form.status === "active" ? "default" : "secondary"} className="text-xs">
                      {form.status || "active"}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {(form.fields || []).length} field{(form.fields || []).length !== 1 ? "s" : ""}
                    {form.show_facility_selector ? " · Facility selector" : ""}
                    {form.recipient_email ? ` · Sends to ${form.recipient_email}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(createPageUrl("AdminFormEdit") + `&id=${form.id}`)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600"
                    onClick={() => { if (confirm("Delete this form?")) deleteMutation.mutate(form.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}