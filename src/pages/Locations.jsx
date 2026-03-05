import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Clock, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Locations() {
  const [search, setSearch] = useState("");

  const { data: facilities, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  const filtered = facilities.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.city?.toLowerCase().includes(q) ||
      f.state?.toLowerCase().includes(q) ||
      f.zip?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#1B365D] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Find Your Storage Location
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Search by city, state, or zip code to find a location near you.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by city, state, or zip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl text-base bg-white border-0 shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Locations Found</h3>
            <p className="text-gray-500">Try a different search term or browse all locations.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((f) => (
              <Link
                key={f.id}
                to={createPageUrl("FacilityPage") + `?id=${f.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={
                      f.banner_image ||
                      f.photos?.[0] ||
                      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80"
                    }
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {f.status === "coming_soon" && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Coming Soon
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-[#1B365D] mb-2 group-hover:text-[#E8792F] transition-colors">
                    {f.name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {f.address}, {f.city}, {f.state} {f.zip}
                    </p>
                    {f.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        {f.phone}
                      </p>
                    )}
                  </div>
                  {f.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {f.features.slice(0, 4).map((feat, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E8792F] group-hover:gap-3 transition-all">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}