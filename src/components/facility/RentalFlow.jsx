import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, ChevronRight } from "lucide-react";
import FlowModal from "./FlowModal";
import FlowSuccess from "./FlowSuccess";
import FlowInput, { FlowSelect, FlowTextarea } from "./FlowInput";

const DEFAULT_CONFIG = {
  heading: "Complete Your Rental",
  subheading: "Secure your unit today.",
  submit_button_text: "Complete Rental",
  success_title: "Rental Submitted!",
  success_message: "Thank you! We'll be in touch to finalize your rental agreement.",
  mode: "multi_step",
  style: {},
  steps: [
    { id: "personal_info", label: "Personal Info", enabled: true },
    { id: "mailing_address", label: "Mailing Address", enabled: true },
    { id: "protection_plan", label: "Protection Plan", enabled: true },
    { id: "lease", label: "Lease Agreement", enabled: true },
    { id: "payment", label: "Payment", enabled: true },
  ],
  reservation_upsell: {},
};

const PROTECTION_PLANS = [
  { id: "basic", name: "Basic", price: "$9/mo", desc: "Up to $2,000 coverage" },
  { id: "standard", name: "Standard", price: "$19/mo", desc: "Up to $5,000 coverage" },
  { id: "premium", name: "Premium", price: "$29/mo", desc: "Up to $10,000 coverage" },
];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function ReservationUpsellBanner({ upsell, onSwitchToReservation }) {
  if (!upsell?.enabled) return null;
  return (
    <div className="mb-6 rounded-xl p-4 border-2" style={{ background: upsell.bg_color || "#F0FDF4", borderColor: upsell.accent_color || "#16a34a" }}>
      <p className="font-bold" style={{ color: upsell.text_color || "#14532d" }}>{upsell.headline || "Not ready to rent yet?"}</p>
      {upsell.subtext && <p className="text-sm mt-1" style={{ color: upsell.text_color || "#14532d", opacity: 0.8 }}>{upsell.subtext}</p>}
      {upsell.show_comparison && (
        <div className="mt-2 text-sm" style={{ color: upsell.text_color || "#14532d", opacity: 0.75 }}>
          Reserve now — no payment required, hold your unit risk-free.
        </div>
      )}
      {upsell.show_price_incentive && upsell.price_incentive_text && (
        <p className="mt-1 text-sm font-semibold" style={{ color: upsell.text_color || "#14532d" }}>{upsell.price_incentive_text}</p>
      )}
      {upsell.cta_text && onSwitchToReservation && (
        <button
          onClick={onSwitchToReservation}
          className="mt-3 text-sm font-bold px-4 py-2 rounded-full transition hover:opacity-90"
          style={{ background: upsell.accent_color || "#16a34a", color: "#fff" }}
        >
          {upsell.cta_text}
        </button>
      )}
    </div>
  );
}

function StepPersonalInfo({ data, setData, inputStyle }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FlowInput label="First Name" required inputStyle={inputStyle} value={data.first_name || ""} onChange={set("first_name")} />
        <FlowInput label="Middle Name" inputStyle={inputStyle} value={data.middle_name || ""} onChange={set("middle_name")} />
        <FlowInput label="Last Name" required inputStyle={inputStyle} value={data.last_name || ""} onChange={set("last_name")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FlowInput label="Phone" required type="tel" inputStyle={inputStyle} value={data.phone || ""} onChange={set("phone")} />
        <FlowInput label="Email" required type="email" inputStyle={inputStyle} value={data.email || ""} onChange={set("email")} />
      </div>
    </div>
  );
}

function StepIdVerification({ data, setData, inputStyle }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <FlowInput label="Driver's License Number" required inputStyle={inputStyle} value={data.dl_number || ""} onChange={set("dl_number")} />
      <div className="grid grid-cols-2 gap-4">
        <FlowSelect label="State Issued" required inputStyle={inputStyle} value={data.dl_state || ""} onChange={set("dl_state")} options={US_STATES} placeholder="Select state..." />
        <FlowInput label="Expiry Date" required type="date" inputStyle={inputStyle} value={data.dl_expiry || ""} onChange={set("dl_expiry")} />
      </div>
    </div>
  );
}

function StepMailingAddress({ data, setData, inputStyle }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <FlowInput label="Street Address" required inputStyle={inputStyle} value={data.address || ""} onChange={set("address")} />
      <div className="grid grid-cols-3 gap-4">
        <FlowInput label="City" required inputStyle={inputStyle} value={data.city || ""} onChange={set("city")} />
        <FlowSelect label="State" required inputStyle={inputStyle} value={data.state || ""} onChange={set("state")} options={US_STATES} placeholder="State..." />
        <FlowInput label="ZIP" required inputStyle={inputStyle} value={data.zip || ""} onChange={set("zip")} />
      </div>
    </div>
  );
}

function StepEmergencyContact({ data, setData, inputStyle }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <FlowInput label="Contact Name" required inputStyle={inputStyle} value={data.emergency_name || ""} onChange={set("emergency_name")} />
      <div className="grid grid-cols-2 gap-4">
        <FlowInput label="Phone" required type="tel" inputStyle={inputStyle} value={data.emergency_phone || ""} onChange={set("emergency_phone")} />
        <FlowInput label="Relationship" inputStyle={inputStyle} value={data.emergency_relationship || ""} onChange={set("emergency_relationship")} />
      </div>
    </div>
  );
}

function StepMilitary({ data, setData, inputStyle }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  const isMilitary = data.is_military === "yes";
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Are you active military?</label>
        <div className="flex gap-3">
          {["yes", "no"].map((v) => (
            <button
              key={v}
              onClick={() => setData((d) => ({ ...d, is_military: v }))}
              className="px-6 py-2 rounded-full text-sm font-semibold border-2 transition"
              style={data.is_military === v ? { background: "#1B365D", color: "#fff", borderColor: "#1B365D" } : { background: "#fff", color: "#374151", borderColor: "#D1D5DB" }}
            >
              {v === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>
      {isMilitary && (
        <>
          <FlowInput label="Branch" inputStyle={inputStyle} value={data.military_branch || ""} onChange={set("military_branch")} placeholder="e.g. Army, Navy, Air Force..." />
          <FlowInput label="Military ID" inputStyle={inputStyle} value={data.military_id || ""} onChange={set("military_id")} />
        </>
      )}
    </div>
  );
}

function StepProtectionPlan({ data, setData }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-2">Select a protection plan for your stored belongings.</p>
      {PROTECTION_PLANS.map((plan) => (
        <div
          key={plan.id}
          onClick={() => setData((d) => ({ ...d, protection_plan: plan.id }))}
          className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition"
          style={data.protection_plan === plan.id ? { borderColor: "#1B365D", background: "#EFF6FF" } : { borderColor: "#E5E7EB", background: "#fff" }}
        >
          <div>
            <p className="font-semibold text-gray-900">{plan.name}</p>
            <p className="text-sm text-gray-500">{plan.desc}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{plan.price}</p>
            {data.protection_plan === plan.id && <Check className="w-5 h-5 text-blue-600 ml-auto mt-1" />}
          </div>
        </div>
      ))}
      <button
        onClick={() => setData((d) => ({ ...d, protection_plan: "none" }))}
        className="text-sm text-gray-500 hover:text-gray-700 underline mt-1"
      >
        No thanks, I'll skip protection
      </button>
    </div>
  );
}

function StepLease({ data, setData }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 h-48 overflow-y-auto text-sm text-gray-600 leading-relaxed border">
        <p className="font-semibold text-gray-900 mb-2">Rental Agreement</p>
        <p>This Storage Rental Agreement ("Agreement") is entered into between the facility operator ("Operator") and the tenant identified herein ("Tenant"). Tenant agrees to rent the storage unit as described, subject to all terms and conditions herein.</p>
        <p className="mt-2">Rent is due on the first of each month. A late fee may be charged for payments received after the grace period. Operator reserves the right to deny access or overlook the unit if rent is not paid as agreed.</p>
        <p className="mt-2">Tenant acknowledges that they are storing goods at their own risk. Operator is not liable for theft, damage, or loss of stored property. Tenant is encouraged to obtain insurance coverage for stored items.</p>
        <p className="mt-2">This Agreement shall remain in force month-to-month until terminated by either party with appropriate written notice as specified by local law.</p>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!data.lease_agreed}
          onChange={(e) => setData((d) => ({ ...d, lease_agreed: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700 font-medium">I have read and agree to the terms of this lease agreement</span>
      </label>
    </div>
  );
}

function StepPayment({ data, setData, inputStyle }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Your payment details are secure and encrypted.</p>
      <FlowInput label="Card Number" required inputStyle={inputStyle} value={data.card_number || ""} onChange={set("card_number")} placeholder="•••• •••• •••• ••••" />
      <div className="grid grid-cols-3 gap-4">
        <FlowInput label="Expiry" required inputStyle={inputStyle} value={data.card_expiry || ""} onChange={set("card_expiry")} placeholder="MM/YY" />
        <FlowInput label="CVV" required inputStyle={inputStyle} value={data.card_cvv || ""} onChange={set("card_cvv")} placeholder="•••" />
        <FlowInput label="Billing ZIP" required inputStyle={inputStyle} value={data.billing_zip || ""} onChange={set("billing_zip")} />
      </div>
    </div>
  );
}

function renderStep(stepId, data, setData, inputStyle) {
  switch (stepId) {
    case "personal_info": return <StepPersonalInfo data={data} setData={setData} inputStyle={inputStyle} />;
    case "id_verification": return <StepIdVerification data={data} setData={setData} inputStyle={inputStyle} />;
    case "mailing_address": return <StepMailingAddress data={data} setData={setData} inputStyle={inputStyle} />;
    case "emergency_contact": return <StepEmergencyContact data={data} setData={setData} inputStyle={inputStyle} />;
    case "military": return <StepMilitary data={data} setData={setData} inputStyle={inputStyle} />;
    case "protection_plan": return <StepProtectionPlan data={data} setData={setData} />;
    case "lease": return <StepLease data={data} setData={setData} />;
    case "payment": return <StepPayment data={data} setData={setData} inputStyle={inputStyle} />;
    default: return null;
  }
}

function ProgressBar({ steps, currentStep, style }) {
  const barType = style?.progress_bar || "steps";
  const activeColor = style?.progress_active_color || "#1B365D";
  const inactiveColor = style?.progress_inactive_color || "#E5E7EB";

  if (barType === "none") return null;

  if (barType === "bar") {
    const pct = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full h-2 rounded-full mb-6" style={{ background: inactiveColor }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: activeColor }} />
      </div>
    );
  }

  if (barType === "dots") {
    return (
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: i <= currentStep ? activeColor : inactiveColor }} />
        ))}
      </div>
    );
  }

  // "steps" default
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={i < currentStep ? { background: activeColor, color: "#fff" } : i === currentStep ? { background: activeColor, color: "#fff", boxShadow: `0 0 0 3px ${activeColor}30` } : { background: inactiveColor, color: "#9CA3AF" }}
            >
              {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: i <= currentStep ? activeColor : "#9CA3AF" }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className="flex-1 h-0.5 min-w-4" style={{ background: i < currentStep ? activeColor : inactiveColor }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function RentalFlow({ open, onClose, facility, unit, onSwitchToReservation }) {
  const cfg = { ...DEFAULT_CONFIG, ...(facility?.flow_config?.rental_flow || {}) };
  const style = cfg.style || {};
  const inputStyle = style.input_style || "rounded";
  const accentColor = style.accent_color || "#1B365D";
  const btnBg = style.button_bg || accentColor;
  const btnText = style.button_text_color || "#ffffff";
  const mode = cfg.mode || "multi_step";
  const reservationUpsell = cfg.reservation_upsell || {};

  const enabledSteps = (cfg.steps || DEFAULT_CONFIG.steps).filter((s) => s.enabled !== false);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleClose = () => {
    onClose();
    setDone(false);
    setCurrentStep(0);
    setData({});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Reservation.create({
      customer_name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Rental Applicant",
      customer_email: data.email || "",
      customer_phone: data.phone || "",
      notes: JSON.stringify({ protection_plan: data.protection_plan, lease_agreed: data.lease_agreed }),
      facility_id: facility.id,
      facility_name: facility.name,
      facility_type: facility.facility_type || "self_storage",
      unit_name: unit?.name || "",
      unit_size: unit?.size || "",
      unit_price: unit?.price || 0,
      unit_type: unit?.unit_type || "",
      unit_features: unit?.features || [],
      reservation_type: "rental",
    });
    setSubmitting(false);
    setDone(true);
  };

  const isLastStep = currentStep === enabledSteps.length - 1;

  return (
    <FlowModal open={open} onClose={handleClose} maxWidth="max-w-2xl">
      {done ? (
        <FlowSuccess title={cfg.success_title} message={cfg.success_message} onClose={handleClose} accentColor={accentColor} />
      ) : (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{cfg.heading}</h2>
          {cfg.subheading && <p className="text-gray-500 text-sm mb-6">{cfg.subheading}</p>}

          <ReservationUpsellBanner upsell={reservationUpsell} onSwitchToReservation={onSwitchToReservation} />

          {unit && (
            <div className="mb-5 p-3 bg-gray-50 rounded-xl text-sm space-y-0.5">
              <p className="font-semibold text-gray-900">{unit.name}</p>
              {unit.size && <p className="text-gray-600">Size: {unit.size}</p>}
              {unit.price > 0 && <p className="text-gray-600">Price: ${unit.price.toLocaleString()}/mo</p>}
            </div>
          )}

          {mode === "multi_step" ? (
            <>
              <ProgressBar steps={enabledSteps} currentStep={currentStep} style={style} />
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">{enabledSteps[currentStep]?.label}</p>
                {renderStep(enabledSteps[currentStep]?.id, data, setData, inputStyle)}
              </div>
              <div className="flex justify-between mt-8">
                {currentStep > 0 ? (
                  <button onClick={() => setCurrentStep((s) => s - 1)} className="px-5 py-2 rounded-full text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
                    Back
                  </button>
                ) : <div />}
                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-full text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: btnBg, color: btnText }}
                  >
                    {submitting ? "Submitting..." : cfg.submit_button_text}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-semibold transition hover:opacity-90"
                    style={{ background: btnBg, color: btnText }}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            // single_page mode
            <div className="space-y-8">
              {enabledSteps.map((step) => (
                <div key={step.id}>
                  <p className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b">{step.label}</p>
                  {renderStep(step.id, data, setData, inputStyle)}
                </div>
              ))}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-full font-semibold text-sm transition hover:opacity-90 disabled:opacity-50"
                style={{ background: btnBg, color: btnText }}
              >
                {submitting ? "Submitting..." : cfg.submit_button_text}
              </button>
            </div>
          )}
        </div>
      )}
    </FlowModal>
  );
}