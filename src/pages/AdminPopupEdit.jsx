import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Upload, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import PopupPreview from "../components/popup/PopupPreview";

const TEMPLATES = [
  { id: "centered", label: "Centered", desc: "Title + text centered, optional image above" },
  { id: "image_top", label: "Image Top", desc: "Full-width image banner at top, content below" },
  { id: "image_left", label: "Image Left", desc: "Image on left, text on right (side-by-side)" },
  { id: "image_only", label: "Image Only", desc: "Just an image — can be clickable or informational" },
  { id: "banner", label: "Banner / Strip", desc: "Compact horizontal bar with text and optional CTA" },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

export default function AdminPopupEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const popupId = urlParams.get("id");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const editorRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    image_url: "",
    image_link: "",
    cta_text: "",
    cta_link: "",
    cta_bg_color: "#E8792F",
    cta_text_color: "#ffffff",
    background_color: "#ffffff",
    text_color: "#111827",
    template: "centered",
    max_width: "480px",
    show_on_pages: [],
    trigger: "on_load",
    delay_seconds: 3,
    status: "inactive",
    start_date: "",
    end_date: "",
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
    if (existing) {
      setForm((prev) => ({ ...prev, ...existing, show_on_pages: existing.show_on_pages || [] }));
      // Set editor HTML after mount
      setTimeout(() => {
        if (editorRef.current && existing.content) {
          editorRef.current.innerHTML = existing.content;
        }
      }, 100);
    }
  }, [existing]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Rich text editor commands
  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    syncContent();
  };
  const syncContent = () => {
    if (editorRef.current) update("content", editorRef.current.innerHTML);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("image_url", file_url);
    setUploadingImg(false);
  };

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

  const isImageOnly = form.template === "image_only";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminPopups"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{popupId ? "Edit Popup" : "New Popup"}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full gap-2" style={{ background: "#E8792F" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Popup"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT: Editor */}
        <div className="space-y-6">

          {/* Template Picker */}
          <Card>
            <CardHeader><CardTitle className="text-base">Layout Template</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update("template", t.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${form.template === t.id ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-300 bg-white"}`}
                >
                  <div className="font-semibold text-sm text-gray-800">{t.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader><CardTitle className="text-base">Image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.image_url && (
                <div className="relative inline-block">
                  <img src={form.image_url} alt="" className="h-32 rounded-xl object-cover border" />
                  <button onClick={() => update("image_url", "")} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 text-sm text-gray-600 transition w-fit">
                <Upload className="w-4 h-4" />
                {uploadingImg ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
              </label>
              <div>
                <Label className="text-xs text-gray-500">Or paste image URL</Label>
                <Input className="mt-1" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
              </div>
              {!isImageOnly && (
                <div>
                  <Label className="text-xs text-gray-500">Image click link (optional)</Label>
                  <Input className="mt-1" value={form.image_link || ""} onChange={(e) => update("image_link", e.target.value)} placeholder="https://..." />
                </div>
              )}
              {isImageOnly && (
                <div>
                  <Label className="text-xs text-gray-500">Clicking image opens (leave blank = not clickable)</Label>
                  <Input className="mt-1" value={form.cta_link || ""} onChange={(e) => update("cta_link", e.target.value)} placeholder="https://..." />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Title & Content — hidden for image-only */}
          {!isImageOnly && (
            <Card>
              <CardHeader><CardTitle className="text-base">Title & Content</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                  <Input className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Leave blank to hide title" />
                </div>
                <div>
                  <Label>Content <span className="text-gray-400 font-normal text-xs">(optional)</span></Label>
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 mt-1 mb-1 p-2 border border-b-0 rounded-t-lg bg-gray-50">
                    <select
                      className="text-xs border rounded px-1.5 py-1 bg-white"
                      onChange={(e) => exec("fontSize", e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Size</option>
                      {["1","2","3","4","5","6","7"].map((s, i) => (
                        <option key={s} value={s}>{["10","13","16","18","24","32","48"][i]}px</option>
                      ))}
                    </select>
                    <button onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className="p-1.5 rounded hover:bg-gray-200 transition" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className="p-1.5 rounded hover:bg-gray-200 transition" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className="p-1.5 rounded hover:bg-gray-200 transition" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-5 bg-gray-300 mx-1" />
                    <button onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }} className="p-1.5 rounded hover:bg-gray-200 transition"><AlignLeft className="w-3.5 h-3.5" /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }} className="p-1.5 rounded hover:bg-gray-200 transition"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }} className="p-1.5 rounded hover:bg-gray-200 transition"><AlignRight className="w-3.5 h-3.5" /></button>
                    <div className="w-px h-5 bg-gray-300 mx-1" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Color:</span>
                      <input type="color" className="w-6 h-6 rounded cursor-pointer border" onChange={(e) => exec("foreColor", e.target.value)} title="Text color" />
                    </div>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const url = prompt("Enter URL:");
                        if (url) exec("createLink", url);
                      }}
                      className="p-1.5 rounded hover:bg-gray-200 transition" title="Insert link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncContent}
                    className="min-h-[100px] border rounded-b-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                    style={{ color: form.text_color }}
                    data-placeholder="Type your popup content here..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Button */}
          {!isImageOnly && (
            <Card>
              <CardHeader><CardTitle className="text-base">CTA Button <span className="text-gray-400 font-normal text-sm">(optional)</span></CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Button Text</Label><Input className="mt-1" value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} placeholder="e.g. Learn More" /></div>
                  <div><Label className="text-xs">Button Link</Label><Input className="mt-1" value={form.cta_link} onChange={(e) => update("cta_link", e.target.value)} placeholder="https://..." /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Button Background</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.cta_bg_color || "#E8792F"} onChange={(e) => update("cta_bg_color", e.target.value)} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
                      <Input value={form.cta_bg_color || ""} onChange={(e) => update("cta_bg_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Button Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={form.cta_text_color || "#ffffff"} onChange={(e) => update("cta_text_color", e.target.value)} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
                      <Input value={form.cta_text_color || ""} onChange={(e) => update("cta_text_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          <Card>
            <CardHeader><CardTitle className="text-base">Colors & Size</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.background_color || "#ffffff"} onChange={(e) => update("background_color", e.target.value)} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
                    <Input value={form.background_color || ""} onChange={(e) => update("background_color", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={form.text_color || "#111827"} onChange={(e) => update("text_color", e.target.value)} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
                    <Input value={form.text_color || ""} onChange={(e) => update("text_color", e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">Max Width</Label>
                <Select value={form.max_width || "480px"} onValueChange={(v) => update("max_width", v)}>
                  <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="360px">Narrow (360px)</SelectItem>
                    <SelectItem value="480px">Medium (480px)</SelectItem>
                    <SelectItem value="560px">Wide (560px)</SelectItem>
                    <SelectItem value="640px">Extra Wide (640px)</SelectItem>
                    <SelectItem value="100%">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Trigger & Scheduling */}
          <Card>
            <CardHeader><CardTitle className="text-base">Trigger & Scheduling</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Trigger</Label>
                  <Select value={form.trigger} onValueChange={(v) => update("trigger", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_load">On Page Load</SelectItem>
                      <SelectItem value="on_exit">On Exit Intent</SelectItem>
                      <SelectItem value="after_delay">After Delay</SelectItem>
                      <SelectItem value="on_scroll">On Scroll</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.trigger === "after_delay" && (
                  <div><Label className="text-xs">Delay (seconds)</Label><Input type="number" className="mt-1" value={form.delay_seconds} onChange={(e) => update("delay_seconds", parseInt(e.target.value) || 0)} /></div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Start Date</Label><Input type="date" className="mt-1" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} /></div>
                <div><Label className="text-xs">End Date</Label><Input type="date" className="mt-1" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} /></div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-medium text-gray-800">Active</p>
                  <p className="text-xs text-gray-400">Enable this popup on the site</p>
                </div>
                <Switch checked={form.status === "active"} onCheckedChange={(v) => update("status", v ? "active" : "inactive")} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="lg:sticky lg:top-6 self-start space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Live Preview</h2>
            <span className="text-xs text-gray-400">Updates as you edit</span>
          </div>
          <PopupPreview form={form} />
          <p className="text-xs text-gray-400 text-center">This is how your popup will appear to visitors</p>
        </div>
      </div>
    </div>
  );
}