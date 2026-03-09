import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus } from "lucide-react";

export default function ContactFormBlockEditor({ data, update }) {
  const navigate = useNavigate();

  const { data: forms = [] } = useQuery({
    queryKey: ["form-configs"],
    queryFn: () => base44.entities.FormConfig.list("-created_date"),
  });

  const selectedForm = forms.find(f => f.id === data.form_id);

  return (
    <div className="space-y-3">
      <div>
        <Label>Select Form</Label>
        <Select value={data.form_id || "__none__"} onValueChange={v => update("form_id", v === "__none__" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Choose a form..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">— No form selected —</SelectItem>
            {forms.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedForm && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-800">{selectedForm.title || selectedForm.name}</p>
          <p>{(selectedForm.fields || []).length} field(s){selectedForm.show_facility_selector ? " · Facility selector" : ""}</p>
          {selectedForm.recipient_email && <p>Sends to: {selectedForm.recipient_email}</p>}
          <Button
            size="sm" variant="outline" className="gap-1 mt-2"
            onClick={() => navigate(createPageUrl("AdminFormEdit") + `&id=${selectedForm.id}`)}
          >
            <ExternalLink className="w-3 h-3" /> Edit this form
          </Button>
        </div>
      )}

      <div className="border-t pt-3">
        <Button size="sm" variant="ghost" className="gap-1 text-[#E8792F]"
          onClick={() => navigate(createPageUrl("AdminFormEdit"))}>
          <Plus className="w-3 h-3" /> Create a new form
        </Button>
      </div>
    </div>
  );
}