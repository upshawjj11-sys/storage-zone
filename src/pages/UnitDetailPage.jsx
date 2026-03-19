import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RichTextRenderer from "../components/shared/RichTextRenderer";
import InquiryDialog from "../components/facility/InquiryDialog";

export default function UnitDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const facilityId = urlParams.get("facility");
  const unitIndex = parseInt(urlParams.get("unit") || "0", 10);

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", move_in_date: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: facility, isLoading } = useQuery({
    queryKey: ["facility-unit-detail", facilityId],
    queryFn: async () => {
      const items = await base44.entities.Facility.filter({ id: facilityId });
      return items[0];
    },
    enabled: !!facilityId,
  });

  const unit = facility?.units?.[unitIndex];

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Reservation.create({
      ...form,
      facility_id: facility.id,
      facility_name: facility.name,
      facility_type: facility.facility_type || "business_center",
      unit_name: unit?.name || "",
      unit_size: unit?.size || "",
      unit_price: unit?.price || 0,
      unit_type: unit?.unit_type || "",
      unit_features: unit?.features || [],
      reservation_type: "inquiry",
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const ps = facility?.page_styles || {};
  const S = {
    page_bg: ps.page_bg || "#ffffff",
    heading_color: ps.heading_color || "#1B365D",
    body_text_color: ps.body_text_color || "#4B5563",
    accent_color: ps.accent_color || "#2A9D8F",
    section_card_bg: ps.section_card_bg || "#F9FAFB",
    cta_bg: ps.cta_bg || "#1B365D",
    cta_text_color: ps.cta_text_color || "#ffffff",
    cta_button_bg: ps.cta_button_bg || "#E8792F",
    cta_button_text: ps.cta_button_text || "#ffffff",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!facility || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Unit not found.</p>
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Build back URL to facility page
  const facilityPath = facility.slug
    ? `/${facility.slug.replace(/^\//, "")}`
    : `/locations/${(facility.state || "").toLowerCase().replace(/\s+/g, "-")}/${(facility.city || "").toLowerCase().replace(/\s+/g, "-")}/${facility.id}`;

  return (
    <div style={{ background: S.page_bg }} className="min-h-screen">
      {/* Back bar */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {facility.name}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: S.heading_color }}>{unit.name}</h1>
            {unit.unit_type && (
              <Badge className="bg-[#1B365D]/10 text-[#1B365D] border-0 text-sm mt-1">{unit.unit_type}</Badge>
            )}
            {unit.show_is_open && (
              <Badge className={unit.is_open ? "bg-green-100 text-green-700 border-0 mt-1" : "bg-red-100 text-red-700 border-0 mt-1"}>
                {unit.is_open ? "● Open" : "● Closed"}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: S.body_text_color }}>
            {unit.size && <span>{unit.size}</span>}
            {unit.price > 0 && (
              <span className="font-semibold text-lg" style={{ color: S.heading_color }}>
                Starting at ${unit.price.toLocaleString()}/mo
              </span>
            )}
            <Badge className={unit.available !== false ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-500 border-0"}>
              {unit.available !== false ? "Available" : "Occupied"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Photo gallery */}
            {unit.photos?.length > 0 && (
              <div>
                <div className="relative rounded-2xl overflow-hidden bg-black" style={{ height: "360px" }}>
                  <img src={unit.photos[photoIdx]} alt="" className="w-full h-full object-contain mx-auto" />
                  {unit.photos.length > 1 && (
                    <>
                      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                        {unit.photos.map((_, i) => (
                          <button key={i} onClick={() => setPhotoIdx(i)}
                            className={`w-2 h-2 rounded-full transition ${i === photoIdx ? "bg-white" : "bg-white/40"}`} />
                        ))}
                      </div>
                      <button onClick={() => setPhotoIdx((photoIdx - 1 + unit.photos.length) % unit.photos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition text-lg leading-none">‹</button>
                      <button onClick={() => setPhotoIdx((photoIdx + 1) % unit.photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition text-lg leading-none">›</button>
                    </>
                  )}
                </div>
                {unit.photos.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {unit.photos.map((url, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? "border-[#E8792F]" : "border-transparent"}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            {unit.features?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: S.heading_color }}>Features & Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {unit.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: S.section_card_bg }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: S.accent_color }} />
                      <span className="text-sm font-medium" style={{ color: S.body_text_color }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {unit.description && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: S.heading_color }}>About This Space</h2>
                <RichTextRenderer html={unit.description} style={{ color: S.body_text_color }} />
              </div>
            )}

            {/* Videos */}
            {unit.videos?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: S.heading_color }}>Videos</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {unit.videos.map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-video">
                      <iframe src={url} className="w-full h-full" allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF */}
            {unit.pdf_url && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: S.heading_color }}>Documents</h2>
                <a
                  href={unit.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-md transition"
                  style={{ background: S.section_card_bg }}
                >
                  <FileText className="w-8 h-8 flex-shrink-0" style={{ color: S.accent_color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: S.heading_color }}>View / Download PDF</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: S.body_text_color }}>{unit.pdf_url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: S.body_text_color }} />
                </a>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl p-6 text-center" style={{ background: S.cta_bg }}>
                <h3 className="text-xl font-bold mb-2" style={{ color: S.cta_text_color }}>Interested in This Space?</h3>
                <p className="text-sm mb-5" style={{ color: S.cta_text_color, opacity: 0.75 }}>
                  Contact us to schedule a tour or get more information.
                </p>
                <button
                  className="w-full rounded-full font-semibold py-3 transition hover:opacity-90"
                  style={{ background: S.cta_button_bg, color: S.cta_button_text }}
                  onClick={() => { setSubmitted(false); setShowDialog(true); }}
                >
                  Inquire Now
                </button>
              </div>

              {/* Back to facility */}
              <div className="rounded-2xl p-4 border" style={{ background: S.section_card_bg }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: S.body_text_color }}>Located At</p>
                <p className="font-bold text-sm" style={{ color: S.heading_color }}>{facility.name}</p>
                {facility.address && (
                  <p className="text-xs mt-1" style={{ color: S.body_text_color }}>{facility.address}, {facility.city}, {facility.state}</p>
                )}
                <a
                  href={facilityPath}
                  className="mt-3 block text-center text-xs font-medium py-2 rounded-lg border transition hover:opacity-80"
                  style={{ color: S.heading_color, borderColor: S.heading_color + "33" }}
                >
                  View Full Facility →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InquiryDialog
        open={showDialog}
        onOpenChange={(v) => { setShowDialog(v); if (!v) setSubmitted(false); }}
        facility={facility}
        selectedUnit={unit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        submitted={submitted}
        onSubmit={handleSubmit}
      />
    </div>
  );
}