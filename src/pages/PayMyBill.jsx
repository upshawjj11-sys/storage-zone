import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, CreditCard, ChevronRight, ArrowLeft } from "lucide-react";

export default function PayMyBill() {
  const [selected, setSelected] = useState(null);

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ["facilities-payment"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
  });

  const payableFacilities = facilities.filter((f) => f.payment_center_url);

  if (selected) {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
        {/* Header bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b shadow-sm flex-shrink-0">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1B365D] transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Location
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#E8792F]" />
            <span className="font-semibold text-gray-800 text-sm">{selected.name}</span>
            {selected.city && (
              <span className="text-xs text-gray-400">— {selected.city}, {selected.state}</span>
            )}
          </div>
        </div>

        {/* Payment portal iframe */}
        <iframe
          src={selected.payment_center_url}
          title={`Payment Portal – ${selected.name}`}
          className="flex-1 w-full border-0"
          allow="payment"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1B365D] text-white py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-5">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Pay My Bill</h1>
          <p className="text-blue-200 text-lg">
            Select your storage location below to securely access your account and make a payment.
          </p>
        </div>
      </div>

      {/* Facility list */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : payableFacilities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No payment portals configured yet.</p>
            <p className="text-sm mt-1">Please contact us directly for payment assistance.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium mb-5 text-center">
              {payableFacilities.length} location{payableFacilities.length !== 1 ? "s" : ""} available
            </p>
            {payableFacilities.map((facility) => (
              <button
                key={facility.id}
                onClick={() => setSelected(facility)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-transparent hover:border-[#1B365D] hover:shadow-md transition-all text-left group"
              >
                {facility.photos?.[0] ? (
                  <img
                    src={facility.photos[0]}
                    alt={facility.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#1B365D]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#1B365D]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-[#1B365D] transition">{facility.name}</p>
                  {(facility.address || facility.city) && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {[facility.address, facility.city, facility.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1B365D] transition flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}