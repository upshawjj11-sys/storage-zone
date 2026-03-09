import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long Text" },
  { value: "dropdown", label: "Dropdown" },
  { value: "date", label: "Date Picker" },
  { value: "checkbox", label: "Checkbox" },
];

function FieldEditor({ field, allFields, onChange, onDelete, dragHandleProps }) {
  const update = (key, val) => onChange({ ...field, [key]: val });

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-3 pb-3 px-4">
        <div className="flex items-start gap-2">
          <div {...dragHandleProps} className="mt-1 text-gray-300 hover:text-gray-500 cursor-grab">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <Label className="text-xs">Field Label</Label>
                <Input value={field.label || ""} onChange={e => update("label", e.target.value)} placeholder="e.g. Your Name" />
              </div>
              <div className="w-36">
                <Label className="text-xs">Type</Label>
                <Select value={field.type || "text"} onValueChange={v => update("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <Switch checked={!!field.required} onCheckedChange={v => update("required", v)} />
                <Label className="text-xs">Required</Label>
              </div>
              <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 mt-4" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Placeholder</Label>
                <Input value={field.placeholder || ""} onChange={e => update("placeholder", e.target.value)} placeholder="e.g. Enter your name..." />
              </div>
            </div>

            {field.type === "dropdown" && (
              <div>
                <Label className="text-xs">Options (one per line)</Label>
                <Textarea
                  rows={3}
                  value={(field.options || []).join("\n")}
                  onChange={e => update("options", e.target.value.split("\n").filter(Boolean))}
                  placeholder={"Option A\nOption B\nOption C"}
                />
              </div>
            )}

            {allFields.filter(f => f.id !== field.id && f.type === "dropdown").length > 0 && (
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <Label className="text-xs text-gray-500">Show only if field...</Label>
                  <Select value={field.condition_field || "__none__"} onValueChange={v => update("condition_field", v === "__none__" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="No condition" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No condition</SelectItem>
                      {allFields.filter(f => f.id !== field.id && f.type === "dropdown").map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {field.condition_field && (
                  <div>
                    <Label className="text-xs text-gray-500">...equals value</Label>
                    <Input value={field.condition_value || ""} onChange={e => update("condition_value", e.target.value)} placeholder="e.g. Yes" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminFormEdit() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get("id");
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    title: "Contact Us",
    subtitle: "",
    recipient_email: "",
    submit_button_text: "Send Message",
    submit_button_color: "#1B365D",
    success_message: "Thank you! We'll be in touch shortly.",
    show_facility_selector: false,
    facility_selector_label: "Select a Location",
    fields: [],
    contact_info: { phone: "", email: "", address: "", hours: "" },
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const { data: formData } = useQuery({
    queryKey: ["form-config", formId],
    queryFn: () => base44.entities.FormConfig.filter({ id: formId }),
    enabled: !!formId,
  });

  useEffect(() => {
    if (formData && formData.length > 0) setForm(formData[0]);
  }, [formData]);

  const addField = () => {
    const newField = { id: `field_${Date.now()}`, label: "", type: "text", placeholder: "", required: false };
    setForm(f => ({ ...f, fields: [...(f.fields || []), newField] }));
  };

  const updateField = (index, updated) => {
    const fields = [...form.fields];
    fields[index] = updated;
    setForm(f => ({ ...f, fields }));
  };

  const deleteField = (index) => {
    setForm(f => ({ ...f, fields: f.fields.filter((_, i) => i !== index) }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const fields = Array.from(form.fields);
    const [moved] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, moved);
    setForm(f => ({ ...f, fields }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (formId) {
      await base44.entities.FormConfig.update(formId, form);
    } else {
      await base44.entities.FormConfig.create(form);
    }
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ["form-configs"] });
    navigate(createPageUrl("AdminForms"));
  };

  const updateContactInfo = (key, val) => setForm(f => ({ ...f, contact_info: { ...(f.contact_info || {}), [key]: val } }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminForms"))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{formId ? "Edit Form" : "New Form"}</h1>
        </div>
        <Button size="sm" className="gap-2" style={{ background: "#E8792F" }} onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />{saving ? "Saving..." : "Save Form"}
        </Button>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">

        {/* General Settings */}
        <Card>
          <CardHeader><CardTitle>Form Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Internal Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. General Contact Form" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status || "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Form Heading</Label>
              <Input value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Contact Us" />
            </div>
            <div>
              <Label>Subtitle (optional)</Label>
              <Input value={form.subtitle || ""} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="We'd love to hear from you." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Recipient Email</Label>
                <Input type="email" value={form.recipient_email || ""} onChange={e => setForm(f => ({ ...f, recipient_email: e.target.value }))} placeholder="info@yourcompany.com" />
              </div>
              <div>
                <Label>Success Message</Label>
                <Input value={form.success_message || ""} onChange={e => setForm(f => ({ ...f, success_message: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Submit Button Text</Label>
                <Input value={form.submit_button_text || "Send Message"} onChange={e => setForm(f => ({ ...f, submit_button_text: e.target.value }))} />
              </div>
              <div>
                <Label>Submit Button Color</Label>
                <Input type="color" value={form.submit_button_color || "#1B365D"} onChange={e => setForm(f => ({ ...f, submit_button_color: e.target.value }))} className="h-10 p-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facility Selector */}
        <Card>
          <CardHeader><CardTitle>Facility Selector</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={!!form.show_facility_selector} onCheckedChange={v => setForm(f => ({ ...f, show_facility_selector: v }))} />
              <Label>Show facility dropdown on this form</Label>
            </div>
            {form.show_facility_selector && (
              <div>
                <Label>Dropdown Label</Label>
                <Input value={form.facility_selector_label || "Select a Location"} onChange={e => setForm(f => ({ ...f, facility_selector_label: e.target.value }))} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Form Fields</CardTitle>
            <Button size="sm" variant="outline" onClick={addField} className="gap-1">
              <Plus className="w-3 h-3" /> Add Field
            </Button>
          </CardHeader>
          <CardContent>
            {(form.fields || []).length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No fields yet. Click "Add Field" to start building your form.
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                      {form.fields.map((field, index) => (
                        <Draggable key={field.id || index} draggableId={field.id || String(index)} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className={snapshot.isDragging ? "opacity-80" : ""}>
                              <FieldEditor
                                field={field}
                                allFields={form.fields}
                                onChange={(updated) => updateField(index, updated)}
                                onDelete={() => deleteField(index)}
                                dragHandleProps={provided.dragHandleProps}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>

        {/* Contact Info (shown beside form) */}
        <Card>
          <CardHeader><CardTitle>Contact Info (shown beside form)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.contact_info?.phone || ""} onChange={e => updateContactInfo("phone", e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.contact_info?.email || ""} onChange={e => updateContactInfo("email", e.target.value)} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.contact_info?.address || ""} onChange={e => updateContactInfo("address", e.target.value)} /></div>
            <div><Label>Hours</Label><Textarea rows={3} value={form.contact_info?.hours || ""} onChange={e => updateContactInfo("hours", e.target.value)} /></div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}