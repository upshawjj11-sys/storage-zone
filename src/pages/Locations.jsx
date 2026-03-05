import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Search, ArrowRight, Navigation, Map, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// Collect all unique features from facilities
function getAllFeatures(facilities) {
  const set = new Set();
  facilities.forEach((f) => (f.features || []).forEach((feat) => set.add(feat)));
  return [...set].sort();
}

export default function Locations() {
  const [search, setSearch] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: facilities, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  const allFeatures = getAllFeatures(facilities);

  const handleUseMyLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSearch("");
        setLocationLoading(false);
      },
      () => {
        alert("Could not get your location. Please allow location access.");
        setLocationLoading(false);
      }
    );
  };

  const toggleFeature = (feat) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  // Haversine distance
  function distanceMiles(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let filtered = facilities.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      f.name?.toLowerCase().includes(q) ||
      f.city?.toLowerCase().includes(q) ||
      f.state?.toLowerCase().includes(q) ||
      f.zip?.toLowerCase().includes(q);
    const matchFeatures =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((feat) => (f.features || []).includes(feat));
    return matchSearch && matchFeatures;
  });

  // Sort by distance if user location available
  if (userLocation) {
    filtered = filtered
      .map((f) => ({
        ...f,
        distance:
          f.latitude && f.longitude
            ? distanceMiles(userLocation.lat, userLocation.lng, f.latitude, f.longitude)
            : null,
      }))
      .sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : filtered[0]?.latitude
    ? [filtered[0].latitude, filtered[0].longitude]
    : [39.5, -98.35];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-[#1B365D] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Find Your Storage Location
          </h1>
          <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
            Search by city, state, or zip code to find a location near you.
          </p>

          {/* Search row */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by city, state, or zip..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setUserLocation(null); }}
                className="pl-12 h-14 rounded-2xl text-base bg-white border-0 shadow-xl"
              />
            </div>
            <Button
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="h-14 px-5 rounded-2xl bg-white text-[#1B365D] hover:bg-gray-100 shadow-xl font-semibold gap-2 flex-shrink-0"
            >
              <Navigation className={`w-5 h-5 ${locationLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{locationLoading ? "Locating..." : "Near Me"}</span>
            </Button>
          </div>

          {/* Filter / Map toggles */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${showFilters ? "bg-[#E8792F] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${showMap ? "bg-[#E8792F] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <Map className="w-4 h-4" />
              {showMap ? "Hide Map" : "Show Map"}
            </button>
            {userLocation && (
              <button onClick={() => setUserLocation(null)} className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20">
                <X className="w-3.5 h-3.5" /> Clear location
              </button>
            )}
          </div>

          {/* Feature filters */}
          {showFilters && allFeatures.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
              {allFeatures.map((feat) => (
                <button
                  key={feat}
                  onClick={() => toggleFeature(feat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${selectedFeatures.includes(feat) ? "bg-[#E8792F] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  {feat}
                </button>
              ))}
              {selectedFeatures.length > 0 && (
                <button onClick={() => setSelectedFeatures([])} className="px-3 py-1.5 rounded-full text-sm text-white/60 hover:text-white">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="h-80 border-b">
          <MapContainer center={mapCenter} zoom={userLocation ? 10 : 4} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.filter((f) => f.latitude && f.longitude).map((f) => (
              <Marker key={f.id} position={[f.latitude, f.longitude]}>
                <Popup>
                  <strong>{f.name}</strong><br />
                  {f.city}, {f.state}<br />
                  <a href={createPageUrl("FacilityPage") + `?id=${f.id}`} className="text-blue-600 underline">View Details</a>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Your Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {userLocation && (
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <Navigation className="w-4 h-4 text-[#E8792F]" /> Showing results near your location
          </p>
        )}

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
            <p className="text-gray-500">Try a different search or adjust your filters.</p>
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
                    src={f.banner_image || f.photos?.[0] || "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80"}
                    alt={f.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {f.distance != null && (
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {f.distance.toFixed(1)} mi
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-[#1B365D] mb-2 group-hover:text-[#E8792F] transition-colors">{f.name}</h3>
                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {f.address}, {f.city}, {f.state} {f.zip}
                    </p>
                    {f.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" /> {f.phone}
                      </p>
                    )}
                  </div>
                  {f.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {f.features.slice(0, 4).map((feat, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${selectedFeatures.includes(feat) ? "bg-[#E8792F]/10 text-[#E8792F]" : "bg-gray-100 text-gray-600"}`}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E8792F]">
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