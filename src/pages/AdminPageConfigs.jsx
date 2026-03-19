import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Upload, CreditCard, MapPin, Ruler } from "lucide-react";
import AdminSizeGuideConfig from "../components/admin/AdminSizeGuideConfig";
import BrandedColorPicker from "../components/admin/BrandedColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const defaultPayMyBill = {
  page_key: "pay_my_bill",
  pmb_show_search_bar: true,
  pmb_search_bar_placeholder: "Search by name, city, or address...",
  pmb_search_bar_bg: "#ffffff",
  pmb_search_bar_text_color: "#111827",
  hero_bg_color: "#1B365D",
  hero_bg_image: "",
  hero_bg_image_overlay: "rgba(0,0,0,0.4)",
  hero_title: "Pay My Bill",
  hero_subtitle: "Select your storage location below to securely access your account and make a payment.",
  hero_title_color: "#ffffff",
  hero_subtitle_color: "#bfdbfe",
  hero_padding_y: "64px",
  hero_show_icon: true,
  hero_icon_bg_color: "rgba(255,255,255,0.1)",
  page_bg_color: "#f9fafb",
  card_bg_color: "#ffffff",
  card_border_color: "#e5e7eb",
  card_border_radius: "1rem",
  card_shadow: "sm",
  card_hover_border_color: "#1B365D",
  card_title_color: "#111827",
  card_subtitle_color: "#6b7280",
  accent_color: "#E8792F",
  button_bg_color: "#1B365D",
  button_text_color: "#ffffff",
  button_border_radius: "9999px",
  portal_header_bg: "#ffffff",
  portal_header_text_color: "#1f2937",
  portal_back_btn_color: "#1B365D",
};

const defaultLocations = {
  page_key: "locations",
  hero_bg_color: "#1B365D",
  hero_bg_image: "",
  hero_bg_image_overlay: "rgba(0,0,0,0.4)",
  hero_title: "Find Your Storage Location",
  hero_subtitle: "Search by city, state, or zip code to find a location near you.",
  hero_title_color: "#ffffff",
  hero_subtitle_color: "rgba(255,255,255,0.7)",
  hero_padding_y: "80px",
  hero_show_icon: false,
  hero_icon_bg_color: "rgba(255,255,255,0.1)",
  page_bg_color: "#f9fafb",
  card_bg_color: "#ffffff",
  card_border_color: "#f3f4f6",
  card_border_radius: "1rem",
  card_shadow: "sm",
  card_hover_border_color: "#1B365D",
  card_title_color: "#1B365D",
  card_subtitle_color: "#6b7280",
  accent_color: "#E8792F",
  button_bg_color: "#ffffff",
  button_text_color: "#1B365D",
  button_border_radius: "1rem",
  search_bar_bg: "#ffffff",
  search_bar_text_color: "#111827",
  filter_active_bg: "#E8792F",
  filter_active_text: "#ffffff",
  filter_inactive_bg: "rgba(255,255,255,0.1)",
  filter_inactive_text: "#ffffff",
  card_layout: "grid-3",
  show_facility_image: true,
  show_facility_phone: true,
  show_facility_address: true,
  show_facility_features: true,
  show_map_toggle: true,
  show_filter_toggle: true,
  show_near_me_button: true,
  map_tile_style: "dark_all",
  map_draggable: false,
  map_marker_color: "#E8792F",
  map_user_dot_color: "#1B365D",
  search_radius_miles: 50,
  allow_customer_radius_filter: false,
};

function ColorRow({ label, hint, field, form, update }) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="color"
          value={form[field] || "#000000"}
          onChange={(e) => update(field, e.target.value)}
          className="h-9 w-12 p-0.5 rounded border cursor-pointer"
        />
        <Input
          value={form[field] || ""}
          onChange={(e) => update(field, e.target.value)}
          placeholder="#hex or rgba(...)"
          className="flex-1"
        />
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function AdminPageConfigs() {
  const [saving, setSaving] = useState({ pay_my_bill: false, locations: false });
  const [pmb, setPmb] = useState(defaultPayMyBill);
  const [loc, setLoc] = useState(defaultLocations);

  const { data: configs, refetch } = useQuery({
    queryKey: ["page-configs"],
    queryFn: () => base44.entities.PageConfig.list(),
    initialData: [],
  });

  useEffect(() => {
    if (!configs?.length) return;
    const pmbConfig = configs.find((c) => c.page_key === "pay_my_bill");
    const locConfig = configs.find((c) => c.page_key === "locations");
    if (pmbConfig) setPmb({ ...defaultPayMyBill, ...pmbConfig });
    if (locConfig) setLoc({ ...defaultLocations, ...locConfig });
  }, [configs]);

  const updatePmb = (field, val) => setPmb((p) => ({ ...p, [field]: val }));
  const updateLoc = (field, val) => setLoc((p) => ({ ...p, [field]: val }));

  const handleSave = async (pageKey) => {
    setSaving((s) => ({ ...s, [pageKey]: true }));
    const form = pageKey === "pay_my_bill" ? pmb : loc;
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    const existing = configs.find((c) => c.page_key === pageKey);
    if (existing?.id) {
      await base44.entities.PageConfig.update(existing.id, data);
    } else {
      await base44.entities.PageConfig.create(data);
    }
    setSaving((s) => ({ ...s, [pageKey]: false }));
    refetch();
  };

  const handleImageUpload = async (e, setter, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setter(field, file_url);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Page Configurations</h1>
        <p className="text-gray-500 mt-1">Customize the layout, colors, and content of your public-facing pages.</p>
      </div>

      <Tabs defaultValue="pay_my_bill">
        <TabsList className="bg-gray-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="pay_my_bill" className="gap-2">
            <CreditCard className="w-4 h-4" /> Pay My Bill
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-2">
            <MapPin className="w-4 h-4" /> Location Search
          </TabsTrigger>
          <TabsTrigger value="size_guide" className="gap-2">
            <Ruler className="w-4 h-4" /> Size Guide
          </TabsTrigger>
        </TabsList>

        {/* ─── PAY MY BILL ─── */}
        <TabsContent value="pay_my_bill">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => handleSave("pay_my_bill")} disabled={saving.pay_my_bill} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
                <Save className="w-4 h-4" /> {saving.pay_my_bill ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <SectionCard title="Hero Banner">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title Text</Label>
                  <Input className="mt-1" value={pmb.hero_title} onChange={(e) => updatePmb("hero_title", e.target.value)} />
                </div>
                <div>
                  <Label>Title Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={pmb.hero_title_color || "#ffffff"} onChange={(e) => updatePmb("hero_title_color", e.target.value)} className="h-9 w-12 p-0.5 rounded border cursor-pointer" />
                    <Input value={pmb.hero_title_color || ""} onChange={(e) => updatePmb("hero_title_color", e.target.value)} />
                  </div>
                </div>
              </div>
              <div>
                <Label>Subtitle Text</Label>
                <Input className="mt-1" value={pmb.hero_subtitle} onChange={(e) => updatePmb("hero_subtitle", e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Subtitle Color" field="hero_subtitle_color" form={pmb} update={updatePmb} />
                <ColorRow label="Background Color" field="hero_bg_color" form={pmb} update={updatePmb} />
              </div>
              <div>
                <Label>Background Image <span className="text-xs text-gray-400 font-normal">(optional — overrides background color)</span></Label>
                <div className="flex items-center gap-3 mt-1">
                  {pmb.hero_bg_image && (
                    <div className="relative">
                      <img src={pmb.hero_bg_image} alt="hero bg" className="h-16 w-28 object-cover rounded-lg border" />
                      <button onClick={() => updatePmb("hero_bg_image", "")} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                    <Upload className="w-4 h-4" /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, updatePmb, "hero_bg_image")} />
                  </label>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Vertical Padding</Label>
                  <Input className="mt-1" value={pmb.hero_padding_y} onChange={(e) => updatePmb("hero_padding_y", e.target.value)} placeholder="64px" />
                  <p className="text-xs text-gray-400 mt-1">Controls how tall the hero section is (e.g. 48px, 80px)</p>
                </div>
                <div>
                  <Label>Icon Background Color</Label>
                  <Input className="mt-1" value={pmb.hero_icon_bg_color} onChange={(e) => updatePmb("hero_icon_bg_color", e.target.value)} placeholder="rgba(255,255,255,0.1)" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Switch checked={!!pmb.hero_show_icon} onCheckedChange={(v) => updatePmb("hero_show_icon", v)} />
                <div>
                  <p className="text-sm font-medium text-gray-800">Show Icon in Hero</p>
                  <p className="text-xs text-gray-400">Display the credit card icon above the title</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Page & Background">
              <ColorRow label="Page Background Color" field="page_bg_color" form={pmb} update={updatePmb} />
              <ColorRow label="Accent / Highlight Color" hint="Used for count labels and icon accents" field="accent_color" form={pmb} update={updatePmb} />
            </SectionCard>

            <SectionCard title="Facility Cards">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Card Background" field="card_bg_color" form={pmb} update={updatePmb} />
                <ColorRow label="Card Border Color" field="card_border_color" form={pmb} update={updatePmb} />
                <ColorRow label="Card Hover Border Color" field="card_hover_border_color" form={pmb} update={updatePmb} />
                <div>
                  <Label>Card Border Radius</Label>
                  <Input className="mt-1" value={pmb.card_border_radius} onChange={(e) => updatePmb("card_border_radius", e.target.value)} placeholder="1rem" />
                </div>
                <div>
                  <Label>Card Shadow</Label>
                  <Select value={pmb.card_shadow || "sm"} onValueChange={(v) => updatePmb("card_shadow", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ColorRow label="Card Title Color" field="card_title_color" form={pmb} update={updatePmb} />
                <ColorRow label="Card Subtitle / Address Color" field="card_subtitle_color" form={pmb} update={updatePmb} />
              </div>
            </SectionCard>

            <SectionCard title="Facility Search Bar">
              <p className="text-sm text-gray-500">Live search bar shown above the facility list so customers can quickly find their location.</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Switch checked={pmb.pmb_show_search_bar !== false} onCheckedChange={(v) => updatePmb("pmb_show_search_bar", v)} />
                <div>
                  <p className="text-sm font-medium text-gray-800">Show Search Bar</p>
                  <p className="text-xs text-gray-400">Display a search input above the location list</p>
                </div>
              </div>
              <div>
                <Label>Placeholder Text</Label>
                <Input className="mt-1" value={pmb.pmb_search_bar_placeholder || ""} onChange={(e) => updatePmb("pmb_search_bar_placeholder", e.target.value)} placeholder="Search by name, city, or address..." />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Search Bar Background" field="pmb_search_bar_bg" form={pmb} update={updatePmb} />
                <ColorRow label="Search Bar Text Color" field="pmb_search_bar_text_color" form={pmb} update={updatePmb} />
              </div>
            </SectionCard>

            <SectionCard title="Payment Portal Header Bar">
              <p className="text-sm text-gray-500">Styles the top bar shown when a customer has selected a location and the payment iframe is active.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Header Bar Background" field="portal_header_bg" form={pmb} update={updatePmb} />
                <ColorRow label="Header Bar Text Color" field="portal_header_text_color" form={pmb} update={updatePmb} />
                <ColorRow label="Back Button / Link Color" field="portal_back_btn_color" form={pmb} update={updatePmb} />
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* ─── LOCATIONS ─── */}
        <TabsContent value="locations">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => handleSave("locations")} disabled={saving.locations} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
                <Save className="w-4 h-4" /> {saving.locations ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <SectionCard title="Hero Banner">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title Text</Label>
                  <Input className="mt-1" value={loc.hero_title} onChange={(e) => updateLoc("hero_title", e.target.value)} />
                </div>
                <div>
                  <Label>Title Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={loc.hero_title_color || "#ffffff"} onChange={(e) => updateLoc("hero_title_color", e.target.value)} className="h-9 w-12 p-0.5 rounded border cursor-pointer" />
                    <Input value={loc.hero_title_color || ""} onChange={(e) => updateLoc("hero_title_color", e.target.value)} />
                  </div>
                </div>
              </div>
              <div>
                <Label>Subtitle Text</Label>
                <Input className="mt-1" value={loc.hero_subtitle} onChange={(e) => updateLoc("hero_subtitle", e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Subtitle Color" field="hero_subtitle_color" form={loc} update={updateLoc} />
                <ColorRow label="Background Color" field="hero_bg_color" form={loc} update={updateLoc} />
              </div>
              <div>
                <Label>Background Image <span className="text-xs text-gray-400 font-normal">(optional)</span></Label>
                <div className="flex items-center gap-3 mt-1">
                  {loc.hero_bg_image && (
                    <div className="relative">
                      <img src={loc.hero_bg_image} alt="hero bg" className="h-16 w-28 object-cover rounded-lg border" />
                      <button onClick={() => updateLoc("hero_bg_image", "")} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                    <Upload className="w-4 h-4" /> Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, updateLoc, "hero_bg_image")} />
                  </label>
                </div>
              </div>
              <div>
                <Label>Vertical Padding</Label>
                <Input className="mt-1" value={loc.hero_padding_y} onChange={(e) => updateLoc("hero_padding_y", e.target.value)} placeholder="80px" />
                <p className="text-xs text-gray-400 mt-1">Controls hero height (e.g. 64px, 96px)</p>
              </div>
            </SectionCard>

            <SectionCard title="Search Bar & Buttons">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Search Bar Background" field="search_bar_bg" form={loc} update={updateLoc} />
                <ColorRow label="Search Bar Text Color" field="search_bar_text_color" form={loc} update={updateLoc} />
                <ColorRow label="'Near Me' Button Background" field="button_bg_color" form={loc} update={updateLoc} />
                <ColorRow label="'Near Me' Button Text Color" field="button_text_color" form={loc} update={updateLoc} />
              </div>
            </SectionCard>

            <SectionCard title="Filter & Map Toggle Chips">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Active Chip Background" field="filter_active_bg" form={loc} update={updateLoc} />
                <ColorRow label="Active Chip Text" field="filter_active_text" form={loc} update={updateLoc} />
                <ColorRow label="Inactive Chip Background" hint="Can use rgba(...) for translucent" field="filter_inactive_bg" form={loc} update={updateLoc} />
                <ColorRow label="Inactive Chip Text" field="filter_inactive_text" form={loc} update={updateLoc} />
              </div>
            </SectionCard>

            <SectionCard title="Page & Facility Cards">
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Page Background" field="page_bg_color" form={loc} update={updateLoc} />
                <ColorRow label="Accent Color" hint="Hover states, distance badges, feature highlights" field="accent_color" form={loc} update={updateLoc} />
                <ColorRow label="Card Background" field="card_bg_color" form={loc} update={updateLoc} />
                <ColorRow label="Card Border Color" field="card_border_color" form={loc} update={updateLoc} />
                <ColorRow label="Card Hover Border Color" field="card_hover_border_color" form={loc} update={updateLoc} />
                <div>
                  <Label>Card Border Radius</Label>
                  <Input className="mt-1" value={loc.card_border_radius} onChange={(e) => updateLoc("card_border_radius", e.target.value)} placeholder="1rem" />
                </div>
                <div>
                  <Label>Card Shadow</Label>
                  <Select value={loc.card_shadow || "sm"} onValueChange={(v) => updateLoc("card_shadow", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ColorRow label="Card Title Color" field="card_title_color" form={loc} update={updateLoc} />
                <ColorRow label="Card Subtitle Color" field="card_subtitle_color" form={loc} update={updateLoc} />
              </div>
            </SectionCard>

            <SectionCard title="Card Layout">
              <div>
                <Label>Card Grid Layout</Label>
                <Select value={loc.card_layout || "grid-3"} onValueChange={(v) => updateLoc("card_layout", v)}>
                  <SelectTrigger className="mt-1 w-60"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid-3">3 Columns</SelectItem>
                    <SelectItem value="grid-2">2 Columns</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SectionCard>

            <SectionCard title="Map Settings">
              <div>
                <Label>Map Tile Style</Label>
                <p className="text-xs text-gray-400 mb-1">Visual theme for the map — all free, no API key needed</p>
                <Select value={loc.map_tile_style || "dark_all"} onValueChange={(v) => updateLoc("map_tile_style", v)}>
                  <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark_all">Dark (matches navy brand)</SelectItem>
                    <SelectItem value="light_all">Light / Minimal</SelectItem>
                    <SelectItem value="rastertiles/voyager">Voyager (colorful, detailed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <ColorRow label="Facility Pin Color" hint="Color of the location pins on the map" field="map_marker_color" form={loc} update={updateLoc} />
                <ColorRow label="'You Are Here' Dot Color" field="map_user_dot_color" form={loc} update={updateLoc} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">Allow Map Dragging</p>
                  <p className="text-xs text-gray-400">Let visitors pan the map by clicking and dragging</p>
                </div>
                <Switch checked={!!loc.map_draggable} onCheckedChange={(v) => updateLoc("map_draggable", v)} />
              </div>
            </SectionCard>

            <SectionCard title="Search Radius">
              <div>
                <Label>Default Search Radius (miles)</Label>
                <p className="text-xs text-gray-400 mb-1">Used when customers search by city, zip, or use "Near Me"</p>
                <Select value={String(loc.search_radius_miles || 50)} onValueChange={(v) => updateLoc("search_radius_miles", Number(v))}>
                  <SelectTrigger className="mt-1 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 miles</SelectItem>
                    <SelectItem value="25">25 miles</SelectItem>
                    <SelectItem value="50">50 miles</SelectItem>
                    <SelectItem value="100">100 miles</SelectItem>
                    <SelectItem value="250">250 miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">Allow Customers to Change Radius</p>
                  <p className="text-xs text-gray-400">Shows a radius dropdown in the filters bar for visitors to adjust</p>
                </div>
                <Switch checked={!!loc.allow_customer_radius_filter} onCheckedChange={(v) => updateLoc("allow_customer_radius_filter", v)} />
              </div>
            </SectionCard>

            <SectionCard title="Visibility Toggles">
              {[
                { field: "show_facility_image", label: "Show Facility Image on Cards" },
                { field: "show_facility_address", label: "Show Address on Cards" },
                { field: "show_facility_phone", label: "Show Phone Number on Cards" },
                { field: "show_facility_features", label: "Show Feature Badges on Cards" },
                { field: "show_map_toggle", label: "Show Map Toggle Button" },
                { field: "show_filter_toggle", label: "Show Filters Toggle Button" },
                { field: "show_near_me_button", label: "Show 'Near Me' Button" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-gray-700">{label}</span>
                  <Switch checked={loc[field] !== false} onCheckedChange={(v) => updateLoc(field, v)} />
                </div>
              ))}
            </SectionCard>
          </div>
        </TabsContent>
        {/* ─── SIZE GUIDE ─── */}
        <TabsContent value="size_guide">
          <AdminSizeGuideConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}