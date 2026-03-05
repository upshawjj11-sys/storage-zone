import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Plus, Trash2, Upload, GripVertical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AdminSiteSettings() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nav_logo_url: "", nav_style: "default",
    nav_cta_text: "Get Started", nav_cta_url: "", nav_cta_style: "filled",
    nav_cta_bg_color: "#E8792F", nav_cta_text_color: "#ffffff",
    nav_bg_color: "#ffffff", nav_text_color: "#1B365D", nav_border_bottom: true,
    header_announcement: "", header_announcement_color: "#E8792F", header_announcement_text_color: "#ffffff", header_announcement_enabled: false,
    nav_links: [],
    footer_tagline: "", footer_copyright: "", footer_bg_color: "#0F172A", footer_text_color: "#ffffff",
    footer_accent_color: "#E8792F", footer_show_social: true, footer_links: [], footer_columns: [],
  });

  const { data: existing, refetch } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => { const items = await base44.entities.SiteSettings.list(); return items[0]; },
  });

  useEffect(() => {
    if (existing) setForm({
      ...form, ...existing,
      nav_links: existing.nav_links || [],
      footer_links: existing.footer_links || [],
      footer_columns: existing.footer_columns || [],
    });
  }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("nav_logo_url", file_url);
  };

  // Nav links
  const addNavLink = () => update("nav_links", [...form.nav_links, { label: "", url: "", open_new_tab: false }]);
  const updateNavLink = (i, key, val) => {
    const links = form.nav_links.map((l, idx) => idx === i ? { ...l, [key]: val } : l);
    update("nav_links", links);
  };
  const removeNavLink = (i) => update("nav_links", form.nav_links.filter((_, idx) => idx !== i));
  const onNavDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(form.nav_links);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    update("nav_links", items);
  };

  // Footer quick links
  const addFooterLink = () => update("footer_links", [...form.footer_links, { label: "", url: "" }]);
  const updateFooterLink = (i, key, val) => {
    const links = form.footer_links.map((l, idx) => idx === i ? { ...l, [key]: val } : l);
    update("footer_links", links);
  };
  const removeFooterLink = (i) => update("footer_links", form.footer_links.filter((_, idx) => idx !== i));

  // Footer columns
  const addFooterColumn = () => update("footer_columns", [...form.footer_columns, { heading: "", links: [] }]);
  const updateFooterColumn = (ci, key, val) => {
    const cols = form.footer_columns.map((c, idx) => idx === ci ? { ...c, [key]: val } : c);
    update("footer_columns", cols);
  };
  const removeFooterColumn = (ci) => update("footer_columns", form.footer_columns.filter((_, idx) => idx !== ci));
  const addColLink = (ci) => {
    const cols = form.footer_columns.map((c, idx) => idx === ci ? { ...c, links: [...(c.links || []), { label: "", url: "" }] } : c);
    update("footer_columns", cols);
  };
  const updateColLink = (ci, li, key, val) => {
    const cols = form.footer_columns.map((c, idx) => idx !== ci ? c : {
      ...c,
      links: (c.links || []).map((l, lidx) => lidx === li ? { ...l, [key]: val } : l),
    });
    update("footer_columns", cols);
  };
  const removeColLink = (ci, li) => {
    const cols = form.footer_columns.map((c, idx) => idx !== ci ? c : { ...c, links: (c.links || []).filter((_, lidx) => lidx !== li) });
    update("footer_columns", cols);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form };
    delete data.id; delete data.created_date; delete data.updated_date; delete data.created_by;
    if (existing?.id) {
      await base44.entities.SiteSettings.update(existing.id, data);
    } else {
      await base44.entities.SiteSettings.create(data);
    }
    setSaving(false);
    refetch();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 mt-1">Control your navigation, header, and footer.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="nav" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="nav">Navigation</TabsTrigger>
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* NAVIGATION */}
        <TabsContent value="nav">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Logo & Layout</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo Image</Label>
                  {form.nav_logo_url && <img src={form.nav_logo_url} alt="Logo" className="h-12 object-contain mb-2 border rounded-lg p-1" />}
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit">
                    <Upload className="w-4 h-4" /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {form.nav_logo_url && <button className="text-xs text-red-500 mt-1 block" onClick={() => update("nav_logo_url", "")}>Remove</button>}
                </div>
                <div>
                  <Label>Nav Layout Style</Label>
                  <Select value={form.nav_style || "default"} onValueChange={(v) => update("nav_style", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (logo left, links center, CTA right)</SelectItem>
                      <SelectItem value="centered">Centered (logo top, links below)</SelectItem>
                      <SelectItem value="minimal">Minimal (logo + CTA only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.nav_bg_color || "#ffffff"} onChange={(e) => update("nav_bg_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                      <Input value={form.nav_bg_color || ""} onChange={(e) => update("nav_bg_color", e.target.value)} placeholder="#ffffff" />
                    </div>
                  </div>
                  <div>
                    <Label>Link / Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.nav_text_color || "#1B365D"} onChange={(e) => update("nav_text_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                      <Input value={form.nav_text_color || ""} onChange={(e) => update("nav_text_color", e.target.value)} placeholder="#1B365D" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.nav_border_bottom !== false} onCheckedChange={(v) => update("nav_border_bottom", v)} />
                  <Label>Show bottom border on nav</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Navigation Links</CardTitle>
                  <Button size="sm" variant="outline" onClick={addNavLink} className="gap-1"><Plus className="w-3 h-3" /> Add Link</Button>
                </div>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onNavDragEnd}>
                  <Droppable droppableId="nav-links">
                    {(provided) => (
                      <div className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                        {form.nav_links.map((link, i) => (
                          <Draggable key={i} draggableId={`nav-${i}`} index={i}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                                <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab"><GripVertical className="w-4 h-4" /></div>
                                <Input placeholder="Label" value={link.label} onChange={(e) => updateNavLink(i, "label", e.target.value)} className="flex-1" />
                                <Input placeholder="URL (/Locations or https://...)" value={link.url} onChange={(e) => updateNavLink(i, "url", e.target.value)} className="flex-1" />
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Switch checked={!!link.open_new_tab} onCheckedChange={(v) => updateNavLink(i, "open_new_tab", v)} />
                                  <span className="text-xs text-gray-500">New tab</span>
                                </div>
                                <Button size="icon" variant="ghost" className="text-red-400 flex-shrink-0" onClick={() => removeNavLink(i)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {form.nav_links.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No nav links yet.</p>}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>CTA Button</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Button Text</Label><Input className="mt-1" value={form.nav_cta_text || ""} onChange={(e) => update("nav_cta_text", e.target.value)} placeholder="Get Started" /></div>
                  <div><Label>Button URL</Label><Input className="mt-1" value={form.nav_cta_url || ""} onChange={(e) => update("nav_cta_url", e.target.value)} placeholder="/Locations" /></div>
                </div>
                <div>
                  <Label>Button Style</Label>
                  <Select value={form.nav_cta_style || "filled"} onValueChange={(v) => update("nav_cta_style", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled (solid background)</SelectItem>
                      <SelectItem value="outline">Outline (border only)</SelectItem>
                      <SelectItem value="ghost">Ghost (text only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Button Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.nav_cta_bg_color || "#E8792F"} onChange={(e) => update("nav_cta_bg_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                      <Input value={form.nav_cta_bg_color || ""} onChange={(e) => update("nav_cta_bg_color", e.target.value)} placeholder="#E8792F" />
                    </div>
                  </div>
                  <div>
                    <Label>Button Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.nav_cta_text_color || "#ffffff"} onChange={(e) => update("nav_cta_text_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                      <Input value={form.nav_cta_text_color || ""} onChange={(e) => update("nav_cta_text_color", e.target.value)} placeholder="#ffffff" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ANNOUNCEMENT */}
        <TabsContent value="announcement">
          <Card>
            <CardHeader><CardTitle>Announcement Bar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={!!form.header_announcement_enabled} onCheckedChange={(v) => update("header_announcement_enabled", v)} />
                <Label>Enable announcement bar</Label>
              </div>
              <div><Label>Message</Label><Input value={form.header_announcement} onChange={(e) => update("header_announcement", e.target.value)} placeholder="🎉 Summer special: First month free!" /></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.header_announcement_color || "#E8792F"} onChange={(e) => update("header_announcement_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                    <Input value={form.header_announcement_color || ""} onChange={(e) => update("header_announcement_color", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.header_announcement_text_color || "#ffffff"} onChange={(e) => update("header_announcement_text_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                    <Input value={form.header_announcement_text_color || ""} onChange={(e) => update("header_announcement_text_color", e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER */}
        <TabsContent value="footer">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Footer Style</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Tagline / About blurb</Label><Textarea value={form.footer_tagline} onChange={(e) => update("footer_tagline", e.target.value)} rows={2} placeholder="Your trusted storage partner since 2010." /></div>
                <div><Label>Copyright Text</Label><Input value={form.footer_copyright} onChange={(e) => update("footer_copyright", e.target.value)} placeholder="© 2025 Storage Zone. All rights reserved." /></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.footer_bg_color || "#0F172A"} onChange={(e) => update("footer_bg_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                      <Input value={form.footer_bg_color || ""} onChange={(e) => update("footer_bg_color", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.footer_text_color || "#ffffff"} onChange={(e) => update("footer_text_color", e.target.value)} className="h-9 w-12 p-1 rounded border" />
                      <Input value={form.footer_text_color || ""} onChange={(e) => update("footer_text_color", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!form.footer_show_social} onCheckedChange={(v) => update("footer_show_social", v)} />
                  <Label>Show social media icons (from Branding Kit)</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quick Links</CardTitle>
                  <Button size="sm" variant="outline" onClick={addFooterLink} className="gap-1"><Plus className="w-3 h-3" /> Add Link</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.footer_links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Label" value={link.label} onChange={(e) => updateFooterLink(i, "label", e.target.value)} />
                    <Input placeholder="URL" value={link.url} onChange={(e) => updateFooterLink(i, "url", e.target.value)} />
                    <Button size="icon" variant="ghost" className="text-red-400" onClick={() => removeFooterLink(i)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                {form.footer_links.length === 0 && <p className="text-sm text-gray-400">No quick links yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Footer Columns</CardTitle>
                  <Button size="sm" variant="outline" onClick={addFooterColumn} className="gap-1"><Plus className="w-3 h-3" /> Add Column</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.footer_columns.map((col, ci) => (
                  <div key={ci} className="p-4 border rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Column Heading" value={col.heading} onChange={(e) => updateFooterColumn(ci, "heading", e.target.value)} className="flex-1" />
                      <Button size="icon" variant="ghost" className="text-red-400" onClick={() => removeFooterColumn(ci)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="space-y-2 pl-4 border-l">
                      {(col.links || []).map((link, li) => (
                        <div key={li} className="flex gap-2">
                          <Input placeholder="Label" value={link.label} onChange={(e) => updateColLink(ci, li, "label", e.target.value)} />
                          <Input placeholder="URL" value={link.url} onChange={(e) => updateColLink(ci, li, "url", e.target.value)} />
                          <Button size="icon" variant="ghost" className="text-red-400" onClick={() => removeColLink(ci, li)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => addColLink(ci)} className="gap-1 text-gray-500"><Plus className="w-3 h-3" /> Add link</Button>
                    </div>
                  </div>
                ))}
                {form.footer_columns.length === 0 && <p className="text-sm text-gray-400">No columns yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}