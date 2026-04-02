import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRight, X, CheckCircle } from "lucide-react";
import FlowModal from "./FlowModal";
import FlowSuccess from "./FlowSuccess";
import FlowInput, { FlowTextarea } from "./FlowInput";

const DEFAULT_CONFIG = {
  heading: "Reserve Your Unit",
  subheading: "No commitment required. We'll hold your unit and follow up to confirm.",
  submit_button_text: "Submit Reservation",
  success_title: "Reservation Submitted!",
  success_message: "We'll confirm your reservation soon. Thank you!",
  style: {},
  fields: {},
};

function UpsellBanner({ upsell, onSwitchToRental, currentPosition }) {
  if (!upsell?.enabled || upsell.position !== currentPosition) return null;
  const ctaBg = upsell.cta_color || "#E8792F";
  const ctaText = upsell.cta_text_color || "#ffffff";
  return (
    <div className="rounded-xl p-4 mb-5 border-2" style={{ background: "#FFF7ED", borderColor: ctaBg }}>
      <p className="font-bold text-base text-gray-900">{upsell.headline || "Ready to rent now?"}</p>
      {upsell.subtext && <p className="text-sm mt-1 text-gray-600">{upsell.subtext}</p>}
      {upsell.show_benefits && upsell.benefits?.length > 0 && (
        <ul className="mt-2.5 space-y-1">
          {upsell.benefits.map((b, i) => (
            <li key={i} className="text-sm flex items-center gap-1.5 text-gray-700">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ctaBg }} /> {b}
            </li>
          ))}
        </ul>
      )}
      {upsell.show_urgency && upsell.urgency_text && (
        <p className="mt-2 text-xs font-semibold italic" style={{ color: ctaBg }}>{upsell.urgency_text}</p>
      )}
      {upsell.cta_text && onSwitchToRental && (
        <button
          onClick={onSwitchToRental}
          className="mt-3 flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full transition hover:opacity-90"
          style={{ background: ctaBg, color: ctaText }}
        >
          {upsell.cta_text} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function UpsellModal({ upsell, onSwitchToRental, onDismiss }) {
  if (!upsell?.enabled || upsell.position !== "modal") return null;
  const ctaBg = upsell.cta_color || "#E8792F";
  const ctaText = upsell.cta_text_color || "#ffffff";
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onDismiss}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onDismiss} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-400" />
        </button>
        <p className="text-xl font-bold text-gray-900 pr-6">{upsell.headline || "Ready to rent now?"}</p>
        {upsell.subtext && <p className="text-sm mt-2 text-gray-600">{upsell.subtext}</p>}
        {upsell.show_benefits && upsell.benefits?.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {upsell.benefits.map((b, i) => (
              <li key={i} className="text-sm flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: ctaBg }} /> {b}
              </li>
            ))}
          </ul>
        )}
        {upsell.show_urgency && upsell.urgency_text && (
          <p className="mt-3 text-xs font-semibold italic" style={{ color: ctaBg }}>{upsell.urgency_text}</p>
        )}
        <div className="mt-5 flex gap-3">
          {upsell.cta_text && onSwitchToRental && (
            <button
              onClick={onSwitchToRental}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-full transition hover:opacity-90"
              style={{ background: ctaBg, color: ctaText }}
            >
              {upsell.cta_text} <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            Continue Reserving
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationFlow({ open, onClose, facility, unit, onSwitchToRental }) {
  const cfg = { ...DEFAULT_CONFIG, ...(facility?.flow_config?.reservation_flow || {}) };
  const fields = cfg.fields || {};
  const style = cfg.style || {};
  // Upsell sourced from facility.flow_config.reservation_flow.upsell
  const upsell = facility?.flow_config?.reservation_flow?.upsell || {};
  const inputStyle = style.input_style || "rounded";
  const accentColor = style.accent_color || "#1B365D";
  const btnBg = style.button_bg || accentColor;
  const btnText = style.button_text_color || "#ffffff";

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "", move_in_date: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  // Show modal upsell when flow opens
  useEffect(() => {
    if (open && upsell?.enabled && upsell?.position === "modal") {
      setShowUpsellModal(true);
    }
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.first_name && form.last_name && form.email;

  const handleClose = () => {
    onClose();
    setDone(false);
    setShowUpsellModal(false);
    setForm({ first_name: "", last_name: "", phone: "", email: "", move_in_date: "", notes: "" });
  };

  const handleSwitchToRental = () => {
    setShowUpsellModal(false);
    onSwitchToRental?.();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Reservation.create({
      customer_name: `${form.first_name} ${form.last_name}`.trim(),
      customer_email: form.email,
      customer_phone: form.phone,
      move_in_date: form.move_in_date || undefined,
      notes: form.notes || undefined,
      facility_id: facility.id,
      facility_name: facility.name,
      facility_type: facility.facility_type || "self_storage",
      unit_name: unit?.name || "",
      unit_size: unit?.size || "",
      unit_price: unit?.price || 0,
      unit_type: unit?.unit_type || "",
      unit_features: unit?.features || [],
      reservation_type: "reservation",
    });
    setSubmitting(false);
    setDone(true);
  };

  return (
    <>
      <UpsellModal
        upsell={upsell}
        onSwitchToRental={handleSwitchToRental}
        onDismiss={() => setShowUpsellModal(false)}
        {...(showUpsellModal ? {} : { upsell: null })}
      />
      <FlowModal open={open} onClose={handleClose}>
        {done ? (
          <FlowSuccess title={cfg.success_title} message={cfg.success_message} onClose={handleClose} accentColor={accentColor} />
        ) : (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{cfg.heading}</h2>
            {cfg.subheading && <p className="text-gray-500 text-sm mb-6">{cfg.subheading}</p>}

            <UpsellBanner upsell={upsell} onSwitchToRental={handleSwitchToRental} currentPosition="above_form" />

            {unit && (
              <div className="mb-5 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-0.5">
                <p className="font-semibold text-gray-900">{unit.name}</p>
                {unit.size && <p>Size: {unit.size}</p>}
                {unit.price > 0 && <p>Price: ${unit.price.toLocaleString()}/mo</p>}
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
              {fields.show_move_in_date !== false && (
                <FlowInput label="Desired Move-in Date" type="date" inputStyle={inputStyle} value={form.move_in_date} onChange={set("move_in_date")} />
              )}
              {fields.show_notes !== false && (
                <FlowTextarea label="Notes" inputStyle={inputStyle} value={form.notes} onChange={set("notes")} placeholder="Anything we should know?" rows={3} />
              )}
            </div>

            <UpsellBanner upsell={upsell} onSwitchToRental={handleSwitchToRental} currentPosition="below_form" />

            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="mt-6 w-full py-3 rounded-full font-semibold text-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ background: btnBg, color: btnText }}
            >
              {submitting ? "Submitting..." : cfg.submit_button_text}
            </button>
          </div>
        )}
      </FlowModal>
    </>
  );
}