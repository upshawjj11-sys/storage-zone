import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hero_title: "", hero_subtitle: "", hero_image: "",
    hero_cta_text: "Find Your Unit", hero_cta_link: "",
    show_locations: true, show_size_guide: true, sections: [],
  });

  const { data: existing, refetch } = useQuery({
    queryKey: ["homepage-config"],
    queryFn: async () => {
      const items = await base44.entities.HomePageConfig.list();
      return items[0];
    },
  });

  useEffect(() => {
    if (existing) setForm({ ...form, ...existing });
  }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (existing?.id) {
      await base44.entities.HomePageConfig.update(existing.id, data);
    } else {
      await base44.entities.HomePageConfig.create(data);
    }
    setSaving(false);
    refetch();
  };

  const handleHeroUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("hero_image", file_url);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Home Page</h1>
          <p className="text-gray-500 mt-1">Customize your home page content.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title</Label><Input value={form.hero_title} onChange={(e) => update("hero_title", e.target.value)} placeholder="Your Space, Your Storage" /></div>
            <div><Label>Subtitle</Label><Input value={form.hero_subtitle} onChange={(e) => update("hero_subtitle", e.target.value)} placeholder="Find the perfect storage unit near you." /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>CTA Button Text</Label><Input value={form.hero_cta_text} onChange={(e) => update("hero_cta_text", e.target.value)} /></div>
              <div><Label>CTA Button Link</Label><Input value={form.hero_cta_link} onChange={(e) => update("hero_cta_link", e.target.value)} /></div>
            </div>
            <div>
              <Label>Hero Background Image</Label>
              {form.hero_image && <img src={form.hero_image} alt="" className="w-full h-48 object-cover rounded-xl mb-2" />}
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit">
                <Upload className="w-4 h-4" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}