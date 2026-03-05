import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Mail, Clock, Star, ChevronDown, ChevronUp, Check, ChevronLeft, ChevronRight, Building2, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ImageSlider from "../components/shared/ImageSlider";
import UnitCard from "../components/facility/UnitCard";
import InquiryDialog from "../components/facility/InquiryDialog";

export default function FacilityPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const facilityId = urlParams.get("id");
  const [openFaq, setOpenFaq] = useState(null);
  const [hoursTab, setHoursTab] = useState("office");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    move_in_date: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: facility, isLoading } = useQuery({
    queryKey: ["facility", facilityId],
    queryFn: async () => {
      const items = await base44.entities.Facility.filter({ id: facilityId });
      return items[0];
    },
    enabled: !!facilityId,
  });

  const isBC = facility?.facility_type === "business_center";

  const handleAction = (unit = null) => {
    setSelectedUnit(unit);
    setSubmitted(false);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Reservation.create({
      ...form,
      facility_id: facilityId,
      facility_name: facility.name,
      facility_type: facility.facility_type || "self_storage",
      unit_name: selectedUnit?.name || "",
      unit_size: selectedUnit?.size || "",
      unit_price: selectedUnit?.price || 0,
      unit_type: selectedUnit?.unit_type || selectedUnit?.type || "",
      unit_features: selectedUnit?.features || [],
      reservation_type: isBC ? "inquiry" : "reservation",
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" /></div>;
  if (!facility) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Facility not found.</p></div>;

  const DEFAULT_ORDER = ["contact", "about", "features", "units", "photos", "videos", "reviews", "faq"];
  const rawOrder = facility.sections_order?.length > 0 ? facility.sections_order : DEFAULT_ORDER;
  const sectionsOrder = [
    ...rawOrder.filter((k) => DEFAULT_ORDER.includes(k)),
    ...DEFAULT_ORDER.filter((k) => !rawOrder.includes(k)),
  ];

  const sectionMap = {
    contact: (facility.address || facility.phone || facility.email) ? (
      <div key="contact" className="grid sm:grid-cols-3 gap-4">
        {facility.address && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <MapPin className="w-5 h-5 text-[#E8792F] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Address</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{facility.address}, {facility.city}, {facility.state} {facility.zip}</p>
            </div>
          </div>
        )}
        {facility.phone && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <Phone className="w-5 h-5 text-[#E8792F] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</p>
              <a href={`tel:${facility.phone}`} className="text-sm font-medium text-gray-900 mt-1 block">{facility.phone}</a>
            </div>
          </div>
        )}
        {facility.email && (
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <Mail className="w-5 h-5 text-[#E8792F] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
              <a href={`mailto:${facility.email}`} className="text-sm font-medium text-gray-900 mt-1 block">{facility.email}</a>
            </div>
          </div>
        )}
      </div>
    ) : null,

    about: facility.about ? (
      <div key="about">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">About This Location</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{facility.about}</p>
      </div>
    ) : null,

    features: facility.features?.length > 0 ? (
      <div key="features">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">Features & Amenities</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {facility.features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <Check className="w-5 h-5 text-[#2A9D8F]" />
              <span className="text-sm font-medium text-gray-700">{f}</span>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    units: facility.unit_grid_widget_code ? (
      <div key="units">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">Available Units</h2>
        <div dangerouslySetInnerHTML={{ __html: facility.unit_grid_widget_code }} />
      </div>
    ) : facility.units?.length > 0 ? (
      <div key="units">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">
          {isBC ? "Available Spaces" : "Available Units"}
        </h2>
        {isBC && (
          <p className="text-gray-500 text-sm mb-4">Select a space below to inquire for more information.</p>
        )}
        <div className="space-y-3">
          {facility.units.map((unit, i) => (
            <UnitCard
              key={i}
              unit={unit}
              facilityType={facility.facility_type}
              onAction={handleAction}
            />
          ))}
        </div>
      </div>
    ) : null,

    photos: facility.photos?.length > 0 ? (
      <div key="photos">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {facility.photos.map((url, i) => (
            <button key={i} onClick={() => setLightboxIdx(i)} className="overflow-hidden rounded-xl group">
              <img src={url} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            </button>
          ))}
        </div>
      </div>
    ) : null,

    videos: facility.videos?.length > 0 ? (
      <div key="videos">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">Videos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {facility.videos.map((url, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-video">
              <iframe src={url} className="w-full h-full" allowFullScreen />
            </div>
          ))}
        </div>
      </div>
    ) : null,

    reviews: facility.reviews?.length > 0 ? (
      <div key="reviews">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">Customer Reviews</h2>
        <div className="space-y-4">
          {facility.reviews.map((r, i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{r.name}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    faq: facility.faqs?.length > 0 ? (
      <div key="faq">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {facility.faqs.map((faq, i) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition">
                {faq.question}
                {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  // Banner: use dedicated banner_image first, then photos, then fallback
  const bannerImages = facility.banner_image
    ? [facility.banner_image]
    : (facility.photos?.length > 0 ? facility.photos : ["https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80"]);

  return (
    <div className="bg-white">
      {/* Banner Slider */}
      <div className="relative h-[40vh] md:h-[55vh]">
        <ImageSlider images={bannerImages} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            {isBC && (
              <span className="inline-flex items-center gap-1.5 bg-[#E8792F] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Building2 className="w-3.5 h-3.5" /> Business Center
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{facility.banner_title || facility.name}</h1>
            <p className="text-white/80 text-lg">{facility.banner_subtitle || `${facility.city}, ${facility.state}`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {sectionsOrder.map((key) => sectionMap[key] || null)}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {(facility.hours?.length > 0 || facility.access_hours?.length > 0) && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-[#1B365D] mb-3 flex items-center gap-2"><Clock className="w-5 h-5" /> Hours</h3>
                  {/* Toggle tabs if both hour types exist */}
                  {facility.hours?.length > 0 && facility.access_hours?.length > 0 && (
                    <div className="flex bg-white border rounded-lg p-0.5 mb-4 text-xs font-semibold">
                      <button
                        onClick={() => setHoursTab("office")}
                        className={`flex-1 rounded-md py-1.5 transition ${hoursTab === "office" ? "bg-[#1B365D] text-white" : "text-gray-500 hover:text-gray-700"}`}
                      >Office Hours</button>
                      <button
                        onClick={() => setHoursTab("access")}
                        className={`flex-1 rounded-md py-1.5 transition ${hoursTab === "access" ? "bg-[#1B365D] text-white" : "text-gray-500 hover:text-gray-700"}`}
                      >Access Hours</button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {(hoursTab === "access" && facility.access_hours?.length > 0 ? facility.access_hours : facility.hours || []).map((h, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{h.day}</span>
                        <span className="text-gray-900">{h.closed ? "Closed" : `${h.open} - ${h.close}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-[#1B365D] rounded-2xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  {isBC ? "Interested in a Space?" : "Reserve Your Unit"}
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  {isBC ? "Contact us to schedule a tour or get more info." : "No commitment. Cancel anytime."}
                </p>
                <button
                  className="w-full rounded-full font-semibold py-3 text-white transition hover:opacity-90"
                  style={{ background: "#E8792F" }}
                  onClick={() => handleAction(null)}
                >
                  {isBC ? "Inquire Now" : "Reserve Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20">✕</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-2 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + facility.photos.length) % facility.photos.length); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={facility.photos[lightboxIdx]} alt="" className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 rounded-full p-2 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % facility.photos.length); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <InquiryDialog
        open={showDialog}
        onOpenChange={(v) => { setShowDialog(v); if (!v) setSubmitted(false); }}
        facility={facility}
        selectedUnit={selectedUnit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        submitted={submitted}
        onSubmit={handleSubmit}
      />
    </div>
  );
}