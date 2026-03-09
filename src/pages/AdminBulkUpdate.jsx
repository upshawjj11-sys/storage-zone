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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, CheckSquare, CalendarDays, MessageSquare, Image, Star, List, HelpCircle } from "lucide-react";
import IconPicker from "../components/admin/IconPicker";

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

  // --- Holiday Hours state ---
  const [holidays, setHolidays] = useState([]);
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [holidaySaved, setHolidaySaved] = useState(false);

  const addHoliday = () =>
    setHolidays((prev) => [...prev, { date: "", label: "", closed: true, open: "", close: "", is_24_hours: false, applies_to: "both" }]);
  const updateHoliday = (i, patch) =>
    setHolidays((prev) => { const next = [...prev]; next[i] = { ...next[i], ...patch }; return next; });
  const removeHoliday = (i) =>
    setHolidays((prev) => prev.filter((_, j) => j !== i));

  const saveHolidayHours = async () => {
    if (!selectedIds.length || !holidays.length) return;
    setHolidaySaving(true);
    for (const id of selectedIds) {
      const fac = facilities.find((f) => f.id === id);
      const existing = fac?.holiday_hours || [];
      // Merge: replace entries with same date+applies_to, append new
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

  // --- Banner bulk state ---
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerSaved, setBannerSaved] = useState(false);

  const saveBanner = async () => {
    if (!selectedIds.length) return;
    setBannerSaving(true);
    const patch = {};
    if (bannerTitle.trim()) patch.banner_title = bannerTitle.trim();
    if (bannerSubtitle.trim()) patch.banner_subtitle = bannerSubtitle.trim();
    for (const id of selectedIds) {
      await base44.entities.Facility.update(id, patch);
    }
    setBannerSaving(false);
    setBannerSaved(true);
    queryClient.invalidateQueries({ queryKey: ["facilities-bulk"] });
    setTimeout(() => setBannerSaved(false), 3000);
  };

  // --- Popup bulk state ---
  const [popupId, setPopupId] = useState("");
  const [popupSaving, setPopupSaving] = useState(false);
  const [popupSaved, setPopupSaved] = useState(false);

  // Popups use show_on_pages (array of facility ids or names)
  const savePopup = async () => {
    if (!selectedIds.length || !popupId) return;
    setPopupSaving(true);
    const popup = popups.find((p) => p.id === popupId);
    if (popup) {
      const existing = popup.show_on_pages || [];
      const merged = [...new Set([...existing, ...selectedIds])];
      await base44.entities.Popup.update(popupId, { show_on_pages: merged, status: "active" });
      queryClient.invalidateQueries({ queryKey: ["popups-bulk"] });
    }
    setPopupSaving(false);
    setPopupSaved(true);
    setTimeout(() => setPopupSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Update</h1>
        <p className="text-gray-500 mt-1">Apply holiday hours, banners, or popups to multiple facilities at once.</p>
      </div>

      {/* Facility Selector */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">1. Select Facilities</CardTitle>
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
                <Checkbox
                  checked={selectedIds.includes(f.id)}
                  onCheckedChange={() => toggleFacility(f.id)}
                />
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
      <Tabs defaultValue="holiday">
        <TabsList className="bg-gray-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="holiday" className="gap-2"><CalendarDays className="w-4 h-4" /> Holiday Hours</TabsTrigger>
          <TabsTrigger value="banner" className="gap-2"><Image className="w-4 h-4" /> Banner Text</TabsTrigger>
          <TabsTrigger value="popup" className="gap-2"><MessageSquare className="w-4 h-4" /> Popups</TabsTrigger>
        </TabsList>

        {/* Holiday Hours */}
        <TabsContent value="holiday">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Holiday / Special Hours</CardTitle>
                  <p className="text-xs text-gray-400 mt-1">These will be merged into the holiday hours for each selected facility.</p>
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
                    <div>
                      <Label className="text-xs">Holiday Name</Label>
                      <Input value={h.label} placeholder="e.g. Christmas" onChange={(e) => updateHoliday(i, { label: e.target.value })} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input type="date" value={h.date} onChange={(e) => updateHoliday(i, { date: e.target.value })} className="mt-1 h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Applies To</Label>
                      <Select value={h.applies_to} onValueChange={(v) => updateHoliday(i, { applies_to: v })}>
                        <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both (Office + Access)</SelectItem>
                          <SelectItem value="office">Office Hours Only</SelectItem>
                          <SelectItem value="access">Access Hours Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={!h.closed} onCheckedChange={(v) => updateHoliday(i, { closed: !v })} />
                      <span className="text-sm text-gray-600">{h.closed ? "Closed" : "Open"}</span>
                    </div>
                    {!h.closed && (
                      <div className="flex items-center gap-2">
                        <Switch checked={!!h.is_24_hours} onCheckedChange={(v) => updateHoliday(i, { is_24_hours: v })} />
                        <span className="text-sm text-gray-600">24 Hours</span>
                      </div>
                    )}
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
                <Button
                  disabled={!selectedIds.length || holidaySaving}
                  className="gap-2"
                  style={{ background: "#E8792F" }}
                  onClick={saveHolidayHours}
                >
                  <Save className="w-4 h-4" />
                  {holidaySaving ? "Saving..." : holidaySaved ? "Saved!" : `Apply to ${selectedIds.length} Facilit${selectedIds.length !== 1 ? "ies" : "y"}`}
                </Button>
              )}
              {!selectedIds.length && holidays.length > 0 && (
                <p className="text-xs text-amber-600">Please select at least one facility above.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banner Text */}
        <TabsContent value="banner">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Banner Text</CardTitle>
              <p className="text-xs text-gray-400">Only filled fields will be updated. Leave blank to keep existing.</p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div>
                <Label>Banner Title</Label>
                <Input className="mt-1" placeholder="Leave blank to keep existing" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
              </div>
              <div>
                <Label>Banner Subtitle</Label>
                <Input className="mt-1" placeholder="Leave blank to keep existing" value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} />
              </div>
              <Button
                disabled={!selectedIds.length || bannerSaving || (!bannerTitle.trim() && !bannerSubtitle.trim())}
                style={{ background: "#E8792F" }}
                className="gap-2"
                onClick={saveBanner}
              >
                <Save className="w-4 h-4" />
                {bannerSaving ? "Saving..." : bannerSaved ? "Saved!" : `Apply to ${selectedIds.length} Facilit${selectedIds.length !== 1 ? "ies" : "y"}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popups */}
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
                        {popups.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title || "Untitled"} ({p.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    disabled={!selectedIds.length || !popupId || popupSaving}
                    style={{ background: "#E8792F" }}
                    className="gap-2"
                    onClick={savePopup}
                  >
                    <Save className="w-4 h-4" />
                    {popupSaving ? "Saving..." : popupSaved ? "Saved!" : `Assign to ${selectedIds.length} Facilit${selectedIds.length !== 1 ? "ies" : "y"}`}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}