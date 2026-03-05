import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Save, Plus, Trash2, Upload, X, GripVertical
} from "lucide-react";
import FacilitySectionOrderEditor from "../components/admin/FacilitySectionOrderEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultHours = [
  { day: "Monday", open: "9:00 AM", close: "6:00 PM", closed: false },
  { day: "Tuesday", open: "9:00 AM", close: "6:00 PM", closed: false },
  { day: "Wednesday", open: "9:00 AM", close: "6:00 PM", closed: false },
  { day: "Thursday", open: "9:00 AM", close: "6:00 PM", closed: false },
  { day: "Friday", open: "9:00 AM", close: "6:00 PM", closed: false },
  { day: "Saturday", open: "9:00 AM", close: "5:00 PM", closed: false },
  { day: "Sunday", open: "", close: "", closed: true },
];

export default function AdminFacilityEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const facilityId = urlParams.get("id");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", address: "", city: "", state: "", zip: "",
    phone: "", email: "", about: "", status: "active",
    facility_type: "self_storage",
    banner_image: "", banner_title: "", banner_subtitle: "",
    features: [], photos: [], videos: [], hours: defaultHours,
    faqs: [], reviews: [], units: [],
    unit_grid_api_key: "", unit_grid_widget_code: "",
    latitude: null, longitude: null, meta_title: "", meta_description: "",
    sections_order: [],
  });
  const [newFeature, setNewFeature] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["facility-edit", facilityId],
    queryFn: async () => {
      const items = await base44.entities.Facility.filter({ id: facilityId });
      return items[0];
    },
    enabled: !!facilityId,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        ...form,
        ...existing,
        hours: existing.hours?.length > 0 ? existing.hours : defaultHours,
        features: existing.features || [],
        photos: existing.photos || [],
        videos: existing.videos || [],
        faqs: existing.faqs || [],
        reviews: existing.reviews || [],
        units: existing.units || [],
        sections_order: existing.sections_order || [],
      });
    }
  }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id;
    delete data.created_date;
    delete data.updated_date;
    delete data.created_by;
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (facilityId) {
      await base44.entities.Facility.update(facilityId, data);
    } else {
      await base44.entities.Facility.create(data);
    }
    setSaving(false);
    navigate(createPageUrl("AdminFacilities"));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("photos", [...form.photos, file_url]);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("banner_image", file_url);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminFacilities"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {facilityId ? "Edit Facility" : "New Facility"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="banner">Banner</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="widget">Widget/API</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto-generated" /></div>
              </div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>City</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
                <div><Label>State</Label><Input value={form.state} onChange={(e) => update("state", e.target.value)} /></div>
                <div><Label>ZIP</Label><Input value={form.zip} onChange={(e) => update("zip", e.target.value)} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>About</Label><Textarea rows={5} value={form.about} onChange={(e) => update("about", e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banner">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div><Label>Banner Title</Label><Input value={form.banner_title} onChange={(e) => update("banner_title", e.target.value)} /></div>
              <div><Label>Banner Subtitle</Label><Input value={form.banner_subtitle} onChange={(e) => update("banner_subtitle", e.target.value)} /></div>
              <div>
                <Label className="text-base font-semibold mb-3 block">Banner / Slider Images</Label>
                <p className="text-xs text-gray-500 mb-3">These images rotate as a slider on the facility page. First image is used as the main banner.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {(form.photos || []).map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-32 object-cover rounded-xl" />
                      {i === 0 && <span className="absolute top-2 left-2 bg-[#E8792F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Main</span>}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        {i > 0 && <button onClick={() => { const p=[...form.photos]; [p[i-1],p[i]]=[p[i],p[i-1]]; update("photos",p); }} className="bg-white rounded-full p-1 shadow text-gray-700 hover:text-[#1B365D]">←</button>}
                        {i < form.photos.length-1 && <button onClick={() => { const p=[...form.photos]; [p[i],p[i+1]]=[p[i+1],p[i]]; update("photos",p); }} className="bg-white rounded-full p-1 shadow text-gray-700 hover:text-[#1B365D]">→</button>}
                        <button onClick={() => update("photos", form.photos.filter((_, j) => j !== i))} className="bg-red-500 text-white rounded-full p-1 shadow"><X className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                  <label className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition text-gray-400">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">Add Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardContent className="p-6 space-y-3">
              {form.hours.map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="w-24 font-medium text-sm text-gray-700">{h.day}</span>
                  <Switch checked={!h.closed} onCheckedChange={(v) => {
                    const hours = [...form.hours];
                    hours[i] = { ...hours[i], closed: !v };
                    update("hours", hours);
                  }} />
                  {!h.closed && (
                    <>
                      <Input className="w-32" value={h.open} onChange={(e) => {
                        const hours = [...form.hours]; hours[i] = { ...hours[i], open: e.target.value }; update("hours", hours);
                      }} />
                      <span className="text-gray-400">to</span>
                      <Input className="w-32" value={h.close} onChange={(e) => {
                        const hours = [...form.hours]; hours[i] = { ...hours[i], close: e.target.value }; update("hours", hours);
                      }} />
                    </>
                  )}
                  {h.closed && <span className="text-sm text-gray-500">Closed</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Add a feature (e.g., Climate Controlled)" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => {
                  if (e.key === "Enter" && newFeature.trim()) { update("features", [...form.features, newFeature.trim()]); setNewFeature(""); }
                }} />
                <Button variant="outline" onClick={() => { if (newFeature.trim()) { update("features", [...form.features, newFeature.trim()]); setNewFeature(""); }}}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm">
                    {f}
                    <button onClick={() => update("features", form.features.filter((_, j) => j !== i))}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Button variant="outline" className="gap-2" onClick={() => update("units", [...form.units, { name: "", size: "", price: 0, type: "Standard", available: true, features: [] }])}>
                <Plus className="w-4 h-4" /> Add Unit
              </Button>
              {form.units.map((unit, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-700">Unit #{i + 1}</span>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => update("units", form.units.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div><Label>Name</Label><Input value={unit.name} onChange={(e) => {
                      const units = [...form.units]; units[i] = { ...units[i], name: e.target.value }; update("units", units);
                    }} /></div>
                    <div><Label>Size</Label><Input value={unit.size} onChange={(e) => {
                      const units = [...form.units]; units[i] = { ...units[i], size: e.target.value }; update("units", units);
                    }} placeholder="10x10" /></div>
                    <div><Label>Price/mo</Label><Input type="number" value={unit.price} onChange={(e) => {
                      const units = [...form.units]; units[i] = { ...units[i], price: parseFloat(e.target.value) || 0 }; update("units", units);
                    }} /></div>
                    <div><Label>Type</Label><Input value={unit.type} onChange={(e) => {
                      const units = [...form.units]; units[i] = { ...units[i], type: e.target.value }; update("units", units);
                    }} /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={unit.available} onCheckedChange={(v) => {
                      const units = [...form.units]; units[i] = { ...units[i], available: v }; update("units", units);
                    }} />
                    <Label>{unit.available ? "Available" : "Occupied"}</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-gray-500">Photos managed in the Banner tab serve as the image slider. Additional photos added here also appear in the gallery section.</p>
              <div>
                <Label className="text-base font-semibold mb-3 block">Videos</Label>
                <p className="text-xs text-gray-500 mb-3">Paste a YouTube or Vimeo embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID)</p>
                <div className="space-y-2 mb-3">
                  {form.videos.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={url} onChange={(e) => { const v=[...form.videos]; v[i]=e.target.value; update("videos",v); }} className="flex-1" placeholder="https://www.youtube.com/embed/..." />
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => update("videos", form.videos.filter((_, j) => j !== i))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="gap-2" onClick={() => update("videos", [...form.videos, ""])}>
                  <Plus className="w-4 h-4" /> Add Video URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Button variant="outline" className="gap-2" onClick={() => update("faqs", [...form.faqs, { question: "", answer: "" }])}>
                <Plus className="w-4 h-4" /> Add FAQ
              </Button>
              {form.faqs.map((faq, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">FAQ #{i + 1}</span>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => update("faqs", form.faqs.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div><Label>Question</Label><Input value={faq.question} onChange={(e) => {
                    const faqs = [...form.faqs]; faqs[i] = { ...faqs[i], question: e.target.value }; update("faqs", faqs);
                  }} /></div>
                  <div><Label>Answer</Label><Textarea value={faq.answer} onChange={(e) => {
                    const faqs = [...form.faqs]; faqs[i] = { ...faqs[i], answer: e.target.value }; update("faqs", faqs);
                  }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Button variant="outline" className="gap-2" onClick={() => update("reviews", [...form.reviews, { name: "", rating: 5, text: "", date: "" }])}>
                <Plus className="w-4 h-4" /> Add Review
              </Button>
              {form.reviews.map((review, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Review #{i + 1}</span>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => update("reviews", form.reviews.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div><Label>Name</Label><Input value={review.name} onChange={(e) => {
                      const reviews = [...form.reviews]; reviews[i] = { ...reviews[i], name: e.target.value }; update("reviews", reviews);
                    }} /></div>
                    <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={review.rating} onChange={(e) => {
                      const reviews = [...form.reviews]; reviews[i] = { ...reviews[i], rating: parseInt(e.target.value) || 5 }; update("reviews", reviews);
                    }} /></div>
                    <div><Label>Date</Label><Input type="date" value={review.date} onChange={(e) => {
                      const reviews = [...form.reviews]; reviews[i] = { ...reviews[i], date: e.target.value }; update("reviews", reviews);
                    }} /></div>
                  </div>
                  <div><Label>Review Text</Label><Textarea value={review.text} onChange={(e) => {
                    const reviews = [...form.reviews]; reviews[i] = { ...reviews[i], text: e.target.value }; update("reviews", reviews);
                  }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widget">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Connect to your storage management software for live unit availability.</p>
              <div><Label>API Key</Label><Input value={form.unit_grid_api_key} onChange={(e) => update("unit_grid_api_key", e.target.value)} placeholder="Your storage management API key" /></div>
              <div><Label>Widget Embed Code</Label><Textarea rows={6} value={form.unit_grid_widget_code} onChange={(e) => update("unit_grid_widget_code", e.target.value)} placeholder="Paste your widget HTML/JS embed code here" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card>
            <CardHeader><CardTitle>Page Section Order</CardTitle></CardHeader>
            <CardContent className="p-6">
              <FacilitySectionOrderEditor
                order={form.sections_order || []}
                onChange={(order) => update("sections_order", order)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div><Label>Meta Title</Label><Input value={form.meta_title} onChange={(e) => update("meta_title", e.target.value)} /></div>
              <div><Label>Meta Description</Label><Textarea value={form.meta_description} onChange={(e) => update("meta_description", e.target.value)} /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Latitude</Label><Input type="number" step="any" value={form.latitude || ""} onChange={(e) => update("latitude", parseFloat(e.target.value) || null)} /></div>
                <div><Label>Longitude</Label><Input type="number" step="any" value={form.longitude || ""} onChange={(e) => update("longitude", parseFloat(e.target.value) || null)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}