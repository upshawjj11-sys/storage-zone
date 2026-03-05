import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPopupEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const popupId = urlParams.get("id");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", cta_text: "", cta_link: "", image_url: "",
    background_color: "#ffffff", text_color: "#000000",
    show_on_pages: [], trigger: "on_load", delay_seconds: 3,
    status: "inactive", start_date: "", end_date: "",
  });

  const { data: existing } = useQuery({
    queryKey: ["popup-edit", popupId],
    queryFn: async () => {
      const items = await base44.entities.Popup.filter({ id: popupId });
      return items[0];
    },
    enabled: !!popupId,
  });

  useEffect(() => {
    if (existing) setForm({ ...form, ...existing, show_on_pages: existing.show_on_pages || [] });
  }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (popupId) {
      await base44.entities.Popup.update(popupId, data);
    } else {
      await base44.entities.Popup.create(data);
    }
    setSaving(false);
    navigate(createPageUrl("AdminPopups"));
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminPopups"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1"><h1 className="text-2xl font-bold">{popupId ? "Edit Popup" : "New Popup"}</h1></div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div><Label>Title *</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
          <div><Label>Content *</Label><Textarea rows={4} value={form.content} onChange={(e) => update("content", e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>CTA Button Text</Label><Input value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} /></div>
            <div><Label>CTA Button Link</Label><Input value={form.cta_link} onChange={(e) => update("cta_link", e.target.value)} /></div>
          </div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Background Color</Label><Input type="color" value={form.background_color} onChange={(e) => update("background_color", e.target.value)} /></div>
            <div><Label>Text Color</Label><Input type="color" value={form.text_color} onChange={(e) => update("text_color", e.target.value)} /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Trigger</Label>
              <Select value={form.trigger} onValueChange={(v) => update("trigger", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_load">On Page Load</SelectItem>
                  <SelectItem value="on_exit">On Exit Intent</SelectItem>
                  <SelectItem value="after_delay">After Delay</SelectItem>
                  <SelectItem value="on_scroll">On Scroll</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.trigger === "after_delay" && (
              <div><Label>Delay (seconds)</Label><Input type="number" value={form.delay_seconds} onChange={(e) => update("delay_seconds", parseInt(e.target.value) || 0)} /></div>
            )}
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} /></div>
            <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}