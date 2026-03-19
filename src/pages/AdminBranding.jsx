import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Upload, Palette } from "lucide-react";
import BrandedColorPicker from "@/components/admin/BrandedColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminBranding() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: "Storage Zone", logo_url: "", logo_dark_url: "", favicon_url: "",
    primary_color: "#1B365D", secondary_color: "#E8792F", accent_color: "#2A9D8F",
    text_color: "#0F172A", background_color: "#FFFFFF",
    font_heading: "Inter", font_body: "Inter",
    tagline: "", footer_text: "",
    social_facebook: "", social_instagram: "", social_twitter: "",
    social_youtube: "", social_linkedin: "", custom_css: "",
  });

  const { data: existing, refetch } = useQuery({
    queryKey: ["branding-edit"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
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
      await base44.entities.BrandingKit.update(existing.id, data);
    } else {
      await base44.entities.BrandingKit.create(data);
    }
    setSaving(false);
    refetch();
  };

  const handleFileUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update(field, file_url);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Branding Kit</h1>
          <p className="text-gray-500 mt-1">Customize your brand identity.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Site Name</Label><Input value={form.site_name} onChange={(e) => update("site_name", e.target.value)} /></div>
              <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Logo (Light Background)</Label>
                {form.logo_url && <img src={form.logo_url} alt="" className="h-12 mb-2 bg-white p-1 rounded" />}
                <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="w-4 h-4" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("logo_url", e)} />
                </label>
              </div>
              <div>
                <Label>Logo (Dark Background)</Label>
                {form.logo_dark_url && <img src={form.logo_dark_url} alt="" className="h-12 mb-2 bg-gray-900 p-1 rounded" />}
                <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="w-4 h-4" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("logo_dark_url", e)} />
                </label>
              </div>
              <div>
                <Label>Favicon</Label>
                {form.favicon_url && <img src={form.favicon_url} alt="" className="h-8 mb-2" />}
                <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="w-4 h-4" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload("favicon_url", e)} />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Colors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { field: "primary_color", label: "Primary" },
                { field: "secondary_color", label: "Secondary" },
                { field: "accent_color", label: "Accent" },
                { field: "text_color", label: "Text" },
                { field: "background_color", label: "Background" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <Label className="mb-1 block">{label}</Label>
                  <BrandedColorPicker value={form[field]} onChange={(v) => update(field, v)} />
                </div>
              ))}
            </div>
            {/* Preview */}
            <div className="p-6 rounded-xl border" style={{ background: form.background_color, color: form.text_color }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: form.primary_color }}>Brand Preview</h3>
              <p className="text-sm mb-3">This is how your brand colors look together.</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ background: form.primary_color }}>Primary</button>
                <button className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ background: form.secondary_color }}>Secondary</button>
                <button className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ background: form.accent_color }}>Accent</button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Typography</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Heading Font</Label><Input value={form.font_heading} onChange={(e) => update("font_heading", e.target.value)} /></div>
              <div><Label>Body Font</Label><Input value={form.font_body} onChange={(e) => update("font_body", e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Facebook URL</Label><Input value={form.social_facebook} onChange={(e) => update("social_facebook", e.target.value)} /></div>
              <div><Label>Instagram URL</Label><Input value={form.social_instagram} onChange={(e) => update("social_instagram", e.target.value)} /></div>
              <div><Label>Twitter / X URL</Label><Input value={form.social_twitter} onChange={(e) => update("social_twitter", e.target.value)} /></div>
              <div><Label>YouTube URL</Label><Input value={form.social_youtube} onChange={(e) => update("social_youtube", e.target.value)} /></div>
              <div><Label>LinkedIn URL</Label><Input value={form.social_linkedin} onChange={(e) => update("social_linkedin", e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Footer & Custom CSS</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Footer Text</Label><Input value={form.footer_text} onChange={(e) => update("footer_text", e.target.value)} placeholder="© 2026 Storage Zone. All rights reserved." /></div>
            <div><Label>Custom CSS</Label><Textarea rows={6} value={form.custom_css} onChange={(e) => update("custom_css", e.target.value)} placeholder="Add custom CSS overrides here..." className="font-mono text-sm" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}