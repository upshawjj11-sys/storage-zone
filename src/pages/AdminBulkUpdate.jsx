import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, CheckSquare, CalendarDays, MessageSquare, Bell, Star, List, HelpCircle, Layout, Palette, Table2 } from "lucide-react";
import IconPicker from "../components/admin/IconPicker";
import FacilityStyleEditor from "../components/admin/FacilityStyleEditor";
import FacilitySectionOrderEditor from "../components/admin/FacilitySectionOrderEditor";

// --- Save Button helper ---
function SaveBtn({ saving, saved, disabled, onClick, label }) {
  return (
    <Button disabled={disabled || saving} style={{ background: "#E8792F" }} className="gap-2" onClick={onClick}>
      <Save className="w-4 h-4" />
      {saving ? "Saving..." : saved ? "Saved!" : label}
    </Button>
  );
}

export default function AdminBulkUpdate() {
  const queryClient = useQueryClient();

  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities-bulk"],
    queryFn: () => base44.entities.Facility.list(),
  });

  const { data: popups = [] } = useQuery({
    queryKey: ["popups-bulk"],
    queryFn: () => base44.entities.Popup.list(),
  });

  // --- Shared facility selection ---
  const [selectedIds, setSelectedIds] = useState([]);
  const toggleFacility = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const selectAll = () => setSelectedIds(facilities.map((f) => f.id));
  const clearAll = () => setSelectedIds([]);

  const appliedLabel = (n) => `Apply to ${n} Facilit${n !== 1 ? "ies" : "y"}`;

  // ---------- Holiday Hours ----------
  const [holidays, setHolidays] = useState([]);
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [holidaySaved, setHolidaySaved] = useState(false);

  const addHoliday = () =>
    setHolidays((prev) => [...prev, { date: "", label: "", closed: true, open: "", close: "", is_24_hours: false, applies_to: "both" }]);
  const updateHoliday = (i, patch) =>
    setHolidays((prev) => { const next = [...prev]; next[i] = { ...next[i], ...patch }; return next; });
  const removeHoliday = (i) => setHolidays((prev) => prev.filter((_, j) => j !== i));

  const saveHolidayHours = async () => {
    if (!selectedIds.length || !holidays.length) return;
    setHolidaySaving(true);
    for (const id of selectedIds) {
      const fac = facilities.find((f) => f.id === id);
      const existing = fac?.holiday_hours || [];
      const merged = [...existing];
      for (const h of holidays) {
        const idx = merged.findIndex((e) => e.date === h.date && e.applies_to === h.applies_to);
        if (idx >= 0) merged[idx] = h; else merged.push(h);
      }
      await base44.entities.Facility.update(id, { holiday_hours: merged });
    }
    setHolidaySaving(false);
    setHolidaySaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setHolidaySaved(false), 3000);
  };

  // ---------- Features ----------
  const [bulkFeatures, setBulkFeatures] = useState([""]);
  const [featuresSaving, setFeaturesSaving] = useState(false);
  const [featuresSaved, setFeaturesSaved] = useState(false);

  const saveFeatures = async () => {
    if (!selectedIds.length) return;
    const toAdd = bulkFeatures.map((f) => f.trim()).filter(Boolean);
    if (!toAdd.length) return;
    setFeaturesSaving(true);
    for (const id of selectedIds) {
      const fac = facilities.find((f) => f.id === id);
      const existing = fac?.features || [];
      await base44.entities.Facility.update(id, { features: [...new Set([...existing, ...toAdd])] });
    }
    setFeaturesSaving(false);
    setFeaturesSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setFeaturesSaved(false), 3000);
  };

  // ---------- FAQs ----------
  const [bulkFaqs, setBulkFaqs] = useState([{ question: "", answer: "" }]);
  const [faqsSaving, setFaqsSaving] = useState(false);
  const [faqsSaved, setFaqsSaved] = useState(false);

  const saveFaqs = async () => {
    if (!selectedIds.length) return;
    const toAdd = bulkFaqs.filter((f) => f.question.trim() && f.answer.trim());
    if (!toAdd.length) return;
    setFaqsSaving(true);
    for (const id of selectedIds) {
      const fac = facilities.find((f) => f.id === id);
      const existing = fac?.faqs || [];
      await base44.entities.Facility.update(id, { faqs: [...existing, ...toAdd] });
    }
    setFaqsSaving(false);
    setFaqsSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setFaqsSaved(false), 3000);
  };

  // ---------- Pillars ----------
  const [bulkPillars, setBulkPillars] = useState([{ icon: "Check", text: "", label: "", icon_color: "#E8792F", text_color: "#ffffff" }]);
  const [pillarsBgColor, setPillarsBgColor] = useState("#1B365D");
  const [pillarsSaving, setPillarsSaving] = useState(false);
  const [pillarsSaved, setPillarsSaved] = useState(false);
  const [pillarsMode, setPillarsMode] = useState("replace");

  const savePillars = async () => {
    if (!selectedIds.length) return;
    const toSave = bulkPillars.filter((p) => p.text.trim());
    if (!toSave.length) return;
    setPillarsSaving(true);
    for (const id of selectedIds) {
      const fac = facilities.find((f) => f.id === id);
      await base44.entities.Facility.update(id, {
        show_pillars: true,
        pillars_bg_color: pillarsBgColor,
        pillars: pillarsMode === "append" ? [...(fac?.pillars || []), ...toSave] : toSave,
      });
    }
    setPillarsSaving(false);
    setPillarsSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setPillarsSaved(false), 3000);
  };

  // ---------- Notice Bar ----------
  const [noticeBar, setNoticeBar] = useState({
    enabled: true, text: "", bg_color: "#E8792F", text_color: "#ffffff", bold: false, italic: false, underline: false,
  });
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeSaved, setNoticeSaved] = useState(false);

  const saveNoticeBar = async () => {
    if (!selectedIds.length || !noticeBar.text.trim()) return;
    setNoticeSaving(true);
    for (const id of selectedIds) {
      await base44.entities.Facility.update(id, { notice_bar: noticeBar });
    }
    setNoticeSaving(false);
    setNoticeSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setNoticeSaved(false), 3000);
  };

  // ---------- Layout (Section Order) ----------
  const [bulkSectionsOrder, setBulkSectionsOrder] = useState([]);
  const [layoutSaving, setLayoutSaving] = useState(false);
  const [layoutSaved, setLayoutSaved] = useState(false);

  const saveLayout = async () => {
    if (!selectedIds.length || !bulkSectionsOrder.length) return;
    setLayoutSaving(true);
    for (const id of selectedIds) {
      await base44.entities.Facility.update(id, { sections_order: bulkSectionsOrder });
    }
    setLayoutSaving(false);
    setLayoutSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setLayoutSaved(false), 3000);
  };

  // ---------- Style ----------
  const [bulkStyles, setBulkStyles] = useState({});
  const [styleSaving, setStyleSaving] = useState(false);
  const [styleSaved, setStyleSaved] = useState(false);

  const saveStyles = async () => {
    if (!selectedIds.length || !Object.keys(bulkStyles).length) return;
    setStyleSaving(true);
    for (const id of selectedIds) {
      const fac = facilities.find((f) => f.id === id);
      await base44.entities.Facility.update(id, { page_styles: { ...(fac?.page_styles || {}), ...bulkStyles } });
    }
    setStyleSaving(false);
    setStyleSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setStyleSaved(false), 3000);
  };

  // ---------- Popup ----------
  const [popupId, setPopupId] = useState("");
  const [popupSaving, setPopupSaving] = useState(false);
  const [popupSaved, setPopupSaved] = useState(false);

  const savePopup = async () => {
    if (!selectedIds.length || !popupId) return;
    setPopupSaving(true);
    const popup = popups.find((p) => p.id === popupId);
    if (popup) {
      const existing = popup.show_on_pages || [];
      await base44.entities.Popup.update(popupId, { show_on_pages: [...new Set([...existing, ...selectedIds])], status: "active" });
      queryClient.invalidateQueries({ queryKey: ["popups-bulk"] });
    }
    setPopupSaving(false);
    setPopupSaved(true);
    setTimeout(() => setPopupSaved(false), 3000);
  };

  // ---------- Data Table ----------
  const [tableData, setTableData] = useState(null); // null = not loaded
  const [tableSaving, setTableSaving] = useState(false);
  const [tableSaved, setTableSaved] = useState(false);

  const loadTableData = () => {
    setTableData(facilities.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug || "",
      city: f.city || "",
      state: f.state || "",
      latitude: f.latitude || "",
      longitude: f.longitude || "",
      google_place_id: f.google_place_id || "",
      google_my_business_url: f.google_my_business_url || "",
      facebook_url: f.facebook_url || "",
      instagram_url: f.instagram_url || "",
      x_url: f.x_url || "",
      tiktok_url: f.tiktok_url || "",
      youtube_url: f.youtube_url || "",
      payment_center_url: f.payment_center_url || "",
    })));
  };

  const updateTableRow = (id, field, value) => {
    setTableData((prev) => prev.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  const saveTableData = async () => {
    if (!tableData) return;
    setTableSaving(true);
    for (const row of tableData) {
      const patch = {
        slug: row.slug,
        latitude: row.latitude !== "" ? parseFloat(row.latitude) : null,
        longitude: row.longitude !== "" ? parseFloat(row.longitude) : null,
        google_place_id: row.google_place_id,
        google_my_business_url: row.google_my_business_url,
        facebook_url: row.facebook_url,
        instagram_url: row.instagram_url,
        x_url: row.x_url,
        tiktok_url: row.tiktok_url,
        youtube_url: row.youtube_url,
        payment_center_url: row.payment_center_url,
      };
      await base44.entities.Facility.update(row.id, patch);
    }
    setTableSaving(false);
    setTableSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => { setTableSaved(false); setTableData(null); }, 3000);
  };

  const TABLE_COLS = [
    { key: "name", label: "Facility", readOnly: true, width: "160px" },
    { key: "slug", label: "Slug", width: "130px" },
    { key: "latitude", label: "Latitude", width: "110px" },
    { key: "longitude", label: "Longitude", width: "110px" },
    { key: "google_place_id", label: "Google Place ID", width: "180px" },
    { key: "google_my_business_url", label: "GMB URL", width: "200px" },
    { key: "facebook_url", label: "Facebook", width: "200px" },
    { key: "instagram_url", label: "Instagram", width: "200px" },
    { key: "x_url", label: "X (Twitter)", width: "200px" },
    { key: "tiktok_url", label: "TikTok", width: "200px" },
    { key: "youtube_url", label: "YouTube", width: "200px" },
    { key: "payment_center_url", label: "Payment Portal URL", width: "220px" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Update</h1>
        <p className="text-gray-500 mt-1">Apply changes to multiple facilities at once, or edit facility data in a spreadsheet-style table.</p>
      </div>

      {/* Facility Selector */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">1. Select Facilities <span className="text-xs font-normal text-gray-400">(for bulk apply tabs below)</span></CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={selectAll}>
                <CheckSquare className="w-3.5 h-3.5" /> Select All
              </Button>
              <Button variant="ghost" size="sm" className="text-xs" onClick={clearAll}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {facilities.map((f) => (
              <label
                key={f.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedIds.includes(f.id) ? "border-[#E8792F] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <Checkbox checked={selectedIds.includes(f.id)} onCheckedChange={() => toggleFacility(f.id)} />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400 truncate">{f.city}, {f.state}</p>
                </div>
              </label>
            ))}
          </div>
          {selectedIds.length > 0 && (
            <p className="mt-3 text-sm text-[#E8792F] font-medium">{selectedIds.length} facilit{selectedIds.length > 1 ? "ies" : "y"} selected</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Tabs defaultValue="table">
        <TabsList className="bg-gray-100 p-1 rounded-xl mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="table" className="gap-1.5"><Table2 className="w-4 h-4" /> Data Table</TabsTrigger>
          <TabsTrigger value="holiday" className="gap-1.5"><CalendarDays className="w-4 h-4" /> Holiday Hours</TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5"><List className="w-4 h-4" /> Features</TabsTrigger>
          <TabsTrigger value="faqs" className="gap-1.5"><HelpCircle className="w-4 h-4" /> FAQs</TabsTrigger>
          <TabsTrigger value="pillars" className="gap-1.5"><Star className="w-4 h-4" /> Pillars</TabsTrigger>
          <TabsTrigger value="banner" className="gap-1.5"><Bell className="w-4 h-4" /> Notice Bar</TabsTrigger>
          <TabsTrigger value="layout" className="gap-1.5"><Layout className="w-4 h-4" /> Layout</TabsTrigger>
          <TabsTrigger value="style" className="gap-1.5"><Palette className="w-4 h-4" /> Style</TabsTrigger>
          <TabsTrigger value="popup" className="gap-1.5"><MessageSquare className="w-4 h-4" /> Popups</TabsTrigger>
        </TabsList>

        {/* ===== DATA TABLE ===== */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Facility Data Table</CardTitle>
                  <p className="text-xs text-gray-400 mt-1">Edit slugs, coordinates, social links, and more for all facilities in one place.</p>
                </div>
                <div className="flex gap-2">
                  {!tableData && (
                    <Button variant="outline" className="gap-2" onClick={loadTableData}>
                      Load Table
                    </Button>
                  )}
                  {tableData && (
                    <>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTableData(null)}>Reset</Button>
                      <SaveBtn saving={tableSaving} saved={tableSaved} disabled={!tableData} onClick={saveTableData} label="Save All Changes" />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {!tableData ? (
                <div className="text-center py-12 text-gray-400">
                  <Table2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Click "Load Table" to edit facility data in a spreadsheet view.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        {TABLE_COLS.map((col) => (
                          <th key={col.key} className="text-left px-3 py-2.5 font-semibold text-gray-600 text-xs whitespace-nowrap border-r last:border-r-0" style={{ minWidth: col.width }}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, ri) => (
                        <tr key={row.id} className={`border-b last:border-b-0 ${ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                          {TABLE_COLS.map((col) => (
                            <td key={col.key} className="px-2 py-1.5 border-r last:border-r-0">
                              {col.readOnly ? (
                                <span className="font-medium text-gray-800 px-1">{row[col.key]}</span>
                              ) : (
                                <input
                                  value={row[col.key]}
                                  onChange={(e) => updateTableRow(row.id, col.key, e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-transparent rounded hover:border-gray-200 focus:border-[#E8792F] focus:outline-none bg-transparent focus:bg-white transition"
                                  style={{ minWidth: col.width }}
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== HOLIDAY HOURS ===== */}
        <TabsContent value="holiday">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Holiday / Special Hours</CardTitle>
                  <p className="text-xs text-gray-400 mt-1">Merged into holiday hours for each selected facility.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1" onClick={addHoliday}>
                  <Plus className="w-4 h-4" /> Add Holiday
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {holidays.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No holidays added yet. Click "Add Holiday" to start.</p>
              )}
              {holidays.map((h, i) => (
                <div key={i} className="p-4 border rounded-xl bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-700">{h.label || `Holiday #${i + 1}`}</span>
                    <Button variant="ghost" size="icon" className="text-red-500 w-7 h-7" onClick={() => removeHoliday(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><Label className="text-xs">Name</Label><Input value={h.label} placeholder="e.g. Christmas" onChange={(e) => updateHoliday(i, { label: e.target.value })} className="mt-1 h-8 text-sm" /></div>
                    <div><Label className="text-xs">Date</Label><Input type="date" value={h.date} onChange={(e) => updateHoliday(i, { date: e.target.value })} className="mt-1 h-8 text-sm" /></div>
                    <div>
                      <Label className="text-xs">Applies To</Label>
                      <Select value={h.applies_to} onValueChange={(v) => updateHoliday(i, { applies_to: v })}>
                        <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="office">Office Only</SelectItem>
                          <SelectItem value="access">Access Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={!h.closed} onCheckedChange={(v) => updateHoliday(i, { closed: !v })} />
                      <span className="text-sm text-gray-600">{h.closed ? "Closed" : "Open"}</span>
                    </div>
                    {!h.closed && <div className="flex items-center gap-2"><Switch checked={!!h.is_24_hours} onCheckedChange={(v) => updateHoliday(i, { is_24_hours: v })} /><span className="text-sm text-gray-600">24 Hours</span></div>}
                    {!h.closed && !h.is_24_hours && (
                      <div className="flex items-center gap-2">
                        <Input className="w-28 h-8 text-sm" value={h.open} placeholder="9:00 AM" onChange={(e) => updateHoliday(i, { open: e.target.value })} />
                        <span className="text-gray-400 text-sm">to</span>
                        <Input className="w-28 h-8 text-sm" value={h.close} placeholder="2:00 PM" onChange={(e) => updateHoliday(i, { close: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {holidays.length > 0 && (
                <SaveBtn saving={holidaySaving} saved={holidaySaved} disabled={!selectedIds.length} onClick={saveHolidayHours} label={appliedLabel(selectedIds.length)} />
              )}
              {!selectedIds.length && holidays.length > 0 && <p className="text-xs text-amber-600">Select at least one facility above.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== FEATURES ===== */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Features to Facilities</CardTitle>
              <p className="text-xs text-gray-400">Appended (merged) into each selected facility's feature list.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {bulkFeatures.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={f} placeholder="e.g. Climate Controlled" onChange={(e) => { const n = [...bulkFeatures]; n[i] = e.target.value; setBulkFeatures(n); }} />
                  {bulkFeatures.length > 1 && <Button variant="ghost" size="icon" className="text-red-500 flex-shrink-0" onClick={() => setBulkFeatures(bulkFeatures.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setBulkFeatures([...bulkFeatures, ""])}><Plus className="w-3.5 h-3.5" /> Add Another</Button>
              <div className="pt-2"><SaveBtn saving={featuresSaving} saved={featuresSaved} disabled={!selectedIds.length} onClick={saveFeatures} label={appliedLabel(selectedIds.length)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== FAQs ===== */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add FAQs to Facilities</CardTitle>
              <p className="text-xs text-gray-400">Appended to each selected facility's FAQ list.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {bulkFaqs.map((faq, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">FAQ #{i + 1}</span>
                    {bulkFaqs.length > 1 && <Button variant="ghost" size="icon" className="text-red-500 w-7 h-7" onClick={() => setBulkFaqs(bulkFaqs.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                  <div><Label className="text-xs">Question</Label><Input className="mt-1" value={faq.question} onChange={(e) => { const n = [...bulkFaqs]; n[i] = { ...n[i], question: e.target.value }; setBulkFaqs(n); }} /></div>
                  <div><Label className="text-xs">Answer</Label><Textarea className="mt-1" rows={3} value={faq.answer} onChange={(e) => { const n = [...bulkFaqs]; n[i] = { ...n[i], answer: e.target.value }; setBulkFaqs(n); }} /></div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setBulkFaqs([...bulkFaqs, { question: "", answer: "" }])}><Plus className="w-3.5 h-3.5" /> Add Another FAQ</Button>
              <div><SaveBtn saving={faqsSaving} saved={faqsSaved} disabled={!selectedIds.length} onClick={saveFaqs} label={appliedLabel(selectedIds.length)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PILLARS ===== */}
        <TabsContent value="pillars">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Update Pillars</CardTitle>
              <p className="text-xs text-gray-400">Set or append pillars across selected facilities.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex gap-3">
                {["replace", "append"].map((mode) => (
                  <button key={mode} onClick={() => setPillarsMode(mode)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${pillarsMode === mode ? "bg-[#1B365D] text-white border-[#1B365D]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                    {mode === "replace" ? "Replace All" : "Append to Existing"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 flex-1">Bar Background Color</p>
                <input type="color" value={pillarsBgColor} onChange={(e) => setPillarsBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                <Input className="w-24 h-8 text-xs font-mono" value={pillarsBgColor} onChange={(e) => setPillarsBgColor(e.target.value)} />
              </div>
              <div className="space-y-3">
                {bulkPillars.map((p, i) => {
                  const upd = (patch) => { const n = [...bulkPillars]; n[i] = { ...n[i], ...patch }; setBulkPillars(n); };
                  return (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Pillar {i + 1}</span>
                        {bulkPillars.length > 1 && <Button variant="ghost" size="icon" className="text-red-400 w-7 h-7" onClick={() => setBulkPillars(bulkPillars.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Icon</Label><div className="mt-1"><IconPicker value={p.icon} onChange={(v) => upd({ icon: v })} /></div></div>
                        <div><Label className="text-xs">Main Text</Label><Input className="mt-1 h-8 text-sm" value={p.text} placeholder="e.g. 24/7 Access" onChange={(e) => upd({ text: e.target.value })} /></div>
                        <div><Label className="text-xs">Sub-label</Label><Input className="mt-1 h-8 text-sm" value={p.label || ""} onChange={(e) => upd({ label: e.target.value })} /></div>
                        <div className="flex gap-3 items-end">
                          <div><Label className="text-xs">Icon Color</Label><div className="flex items-center gap-1 mt-1"><input type="color" value={p.icon_color || "#E8792F"} onChange={(e) => upd({ icon_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-200" /><Input className="w-20 h-8 text-xs font-mono" value={p.icon_color || "#E8792F"} onChange={(e) => upd({ icon_color: e.target.value })} /></div></div>
                          <div><Label className="text-xs">Text Color</Label><div className="flex items-center gap-1 mt-1"><input type="color" value={p.text_color || "#ffffff"} onChange={(e) => upd({ text_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-200" /><Input className="w-20 h-8 text-xs font-mono" value={p.text_color || "#ffffff"} onChange={(e) => upd({ text_color: e.target.value })} /></div></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="gap-1" disabled={bulkPillars.length >= 5} onClick={() => setBulkPillars([...bulkPillars, { icon: "Check", text: "", label: "", icon_color: "#E8792F", text_color: "#ffffff" }])}><Plus className="w-3.5 h-3.5" /> Add Pillar</Button>
              <div><SaveBtn saving={pillarsSaving} saved={pillarsSaved} disabled={!selectedIds.length} onClick={savePillars} label={appliedLabel(selectedIds.length)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== NOTICE BAR ===== */}
        <TabsContent value="banner">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Notice Bar</CardTitle>
              <p className="text-xs text-gray-400">Configure and apply a notice bar to all selected facilities.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-800">Enable Notice Bar</p>
                  <p className="text-xs text-gray-400">Toggle on/off for selected facilities</p>
                </div>
                <Switch checked={!!noticeBar.enabled} onCheckedChange={(v) => setNoticeBar({ ...noticeBar, enabled: v })} />
              </div>
              <div>
                <Label>Message Text</Label>
                <Input className="mt-1" value={noticeBar.text} placeholder="e.g. Special offer: First month free! Call us today." onChange={(e) => setNoticeBar({ ...noticeBar, text: e.target.value })} />
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input type="color" value={noticeBar.bg_color} onChange={(e) => setNoticeBar({ ...noticeBar, bg_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                    <Input className="w-24 h-8 text-xs font-mono" value={noticeBar.bg_color} onChange={(e) => setNoticeBar({ ...noticeBar, bg_color: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input type="color" value={noticeBar.text_color} onChange={(e) => setNoticeBar({ ...noticeBar, text_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
                    <Input className="w-24 h-8 text-xs font-mono" value={noticeBar.text_color} onChange={(e) => setNoticeBar({ ...noticeBar, text_color: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {[["bold", "B", "font-bold"], ["italic", "I", "italic"], ["underline", "U", "underline"]].map(([key, letter, cls]) => (
                    <button key={key} type="button" onClick={() => setNoticeBar({ ...noticeBar, [key]: !noticeBar[key] })}
                      className={`w-8 h-8 rounded border text-sm ${cls} transition ${noticeBar[key] ? "bg-[#1B365D] text-white border-[#1B365D]" : "bg-white text-gray-600 border-gray-300"}`}>
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
              {noticeBar.text && (
                <div className="rounded-lg px-4 py-2 text-sm text-center" style={{ background: noticeBar.bg_color, color: noticeBar.text_color }}>
                  <span style={{ fontWeight: noticeBar.bold ? "bold" : "normal", fontStyle: noticeBar.italic ? "italic" : "normal", textDecoration: noticeBar.underline ? "underline" : "none" }}>
                    {noticeBar.text}
                  </span>
                </div>
              )}
              <SaveBtn saving={noticeSaving} saved={noticeSaved} disabled={!selectedIds.length || !noticeBar.text.trim()} onClick={saveNoticeBar} label={appliedLabel(selectedIds.length)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== LAYOUT ===== */}
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Page Layout</CardTitle>
              <p className="text-xs text-gray-400 mt-1">Set the section order and visibility for all selected facilities. This will overwrite their existing layout.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <FacilitySectionOrderEditor order={bulkSectionsOrder} onChange={setBulkSectionsOrder} />
              <SaveBtn saving={layoutSaving} saved={layoutSaved} disabled={!selectedIds.length || !bulkSectionsOrder.length} onClick={saveLayout} label={appliedLabel(selectedIds.length)} />
              {!selectedIds.length && <p className="text-xs text-amber-600">Select at least one facility above.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== STYLE ===== */}
        <TabsContent value="style">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Page Style</CardTitle>
              <p className="text-xs text-gray-400 mt-1">Set style/color overrides for selected facilities. Only fields you change here will be merged into each facility's styles.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <FacilityStyleEditor styles={bulkStyles} onChange={setBulkStyles} />
              <SaveBtn saving={styleSaving} saved={styleSaved} disabled={!selectedIds.length || !Object.keys(bulkStyles).length} onClick={saveStyles} label={appliedLabel(selectedIds.length)} />
              {!selectedIds.length && <p className="text-xs text-amber-600">Select at least one facility above.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== POPUPS ===== */}
        <TabsContent value="popup">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign Popup to Facilities</CardTitle>
              <p className="text-xs text-gray-400">Select a popup to enable it on all selected facilities.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {popups.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No popups found. Create popups in the Popups admin page first.</p>
              ) : (
                <>
                  <div>
                    <Label>Select Popup</Label>
                    <Select value={popupId} onValueChange={setPopupId}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a popup…" /></SelectTrigger>
                      <SelectContent>
                        {popups.map((p) => <SelectItem key={p.id} value={p.id}>{p.title || "Untitled"} ({p.status})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <SaveBtn saving={popupSaving} saved={popupSaved} disabled={!selectedIds.length || !popupId} onClick={savePopup} label={`Assign to ${selectedIds.length} Facilit${selectedIds.length !== 1 ? "ies" : "y"}`} />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}