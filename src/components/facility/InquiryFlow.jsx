import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import FlowModal from "./FlowModal";
import FlowSuccess from "./FlowSuccess";
import FlowInput, { FlowSelect, FlowTextarea } from "./FlowInput";

const DEFAULT_CONFIG = {
  heading: "Inquire About This Space",
  subheading: "Fill out the form below and we'll be in touch shortly.",
  submit_button_text: "Send Inquiry",
  success_title: "Inquiry Sent!",
  success_message: "Our team will be in touch with you shortly.",
  style: {},
  fields: {},
};

export default function InquiryFlow({ open, onClose, facility, unit }) {
  const cfg = { ...DEFAULT_CONFIG, ...(facility?.flow_config?.inquiry_flow || {}) };
  const fields = cfg.fields || {};
  const style = cfg.style || {};
  const inputStyle = style.input_style || "rounded";
  const accentColor = style.accent_color || "#1B365D";
  const btnBg = style.button_bg || accentColor;
  const btnText = style.button_text_color || "#ffffff";

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "",
    subject: "", unit_type: "", message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.first_name && form.last_name && form.email;

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Reservation.create({
      customer_name: `${form.first_name} ${form.last_name}`.trim(),
      customer_email: form.email,
      customer_phone: form.phone,
      notes: [form.subject && `Subject: ${form.subject}`, form.unit_type && `Unit Type: ${form.unit_type}`, form.message].filter(Boolean).join("\n"),
      facility_id: facility.id,
      facility_name: facility.name,
      facility_type: "business_center",
      unit_name: unit?.name || "",
      unit_size: unit?.size || "",
      unit_price: unit?.price || 0,
      unit_type: form.unit_type || unit?.unit_type || "",
      unit_features: unit?.features || [],
      reservation_type: "inquiry",
    });
    setSubmitting(false);
    setDone(true);
  };

  return (
    <FlowModal open={open} onClose={() => { onClose(); setDone(false); setForm({ first_name: "", last_name: "", phone: "", email: "", subject: "", unit_type: "", message: "" }); }}>
      {done ? (
        <FlowSuccess title={cfg.success_title} message={cfg.success_message} onClose={onClose} accentColor={accentColor} />
      ) : (
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{cfg.heading}</h2>
            {cfg.subheading && <p className="text-gray-500 mt-1 text-sm">{cfg.subheading}</p>}
          </div>

          {/* Unit preview */}
          {unit && (
            <div className="mb-6 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-0.5">
              <p className="font-semibold text-gray-900">{unit.name}</p>
              {unit.unit_type && <p>Type: {unit.unit_type}</p>}
              {unit.size && <p>Size: {unit.size}</p>}
              {unit.price > 0 && <p>Starting at ${unit.price.toLocaleString()}/mo</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FlowInput label="First Name" required inputStyle={inputStyle} value={form.first_name} onChange={set("first_name")} />
              <FlowInput label="Last Name" required inputStyle={inputStyle} value={form.last_name} onChange={set("last_name")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FlowInput label="Email" required type="email" inputStyle={inputStyle} value={form.email} onChange={set("email")} />
              <FlowInput label="Phone" type="tel" inputStyle={inputStyle} value={form.phone} onChange={set("phone")} />
            </div>
            {fields.show_subject && (
              <FlowInput label="Subject" inputStyle={inputStyle} value={form.subject} onChange={set("subject")} />
            )}
            {fields.show_unit_type && fields.unit_types?.length > 0 && (
              <FlowSelect label="Unit Type" inputStyle={inputStyle} value={form.unit_type} onChange={set("unit_type")} options={fields.unit_types} placeholder="Select a unit type..." />
            )}
            <FlowTextarea label="Message" inputStyle={inputStyle} value={form.message} onChange={set("message")} placeholder="Tell us about your needs..." rows={4} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="mt-6 w-full py-3 rounded-full font-semibold text-sm transition hover:opacity-90 disabled:opacity-50"
            style={{ background: btnBg, color: btnText }}
          >
            {submitting ? "Sending..." : cfg.submit_button_text}
          </button>
        </div>
      )}
    </FlowModal>
  );
}