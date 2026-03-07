import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Search, ArrowRight, Navigation, Map, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const DEFAULTS = {
  hero_bg_color: "#1B365D",
  hero_bg_image: "",
  hero_title: "Find Your Storage Location",
  hero_subtitle: "Search by city, state, or zip code to find a location near you.",
  hero_title_color: "#ffffff",
  hero_subtitle_color: "rgba(255,255,255,0.7)",
  hero_padding_y: "80px",
  page_bg_color: "#f9fafb",
  card_bg_color: "#ffffff",
  card_border_color: "#f3f4f6",
  card_border_radius: "1rem",
  card_shadow: "sm",
  card_hover_border_color: "#1B365D",
  card_title_color: "#1B365D",
  card_subtitle_color: "#6b7280",
  accent_color: "#E8792F",
  button_bg_color: "#ffffff",
  button_text_color: "#1B365D",
  search_bar_bg: "#ffffff",
  filter_active_bg: "#E8792F",
  filter_active_text: "#ffffff",
  filter_inactive_bg: "rgba(255,255,255,0.1)",
  filter_inactive_text: "#ffffff",
  card_layout: "grid-3",
  show_facility_image: true,
  show_facility_phone: true,
  show_facility_address: true,
  show_facility_features: true,
  show_map_toggle: true,
  show_filter_toggle: true,
  show_near_me_button: true,
};

const shadowMap = { none: "none", sm: "0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06)", md: "0 4px 6px rgba(0,0,0,.07)", lg: "0 10px 15px rgba(0,0,0,.07)", xl: "0 20px 25px rgba(0,0,0,.1)" };

function getAllFeatures(facilities) {
  const set = new Set();
  facilities.forEach((f) => (f.features || []).forEach((feat) => set.add(feat)));
  return [...set].sort();
}

function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Locations() {
  const navigate = useNavigate();
  const location = useLocation();

  const getParams = () => {
    const p = new URLSearchParams(location.search);
    return {
      search: p.get("q") || "",
      features: p.get("features") ? p.get("features").split(",").filter(Boolean) : [],
    };
  };

  const [search, setSearch] = useState(() => getParams().search);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchCoords, setSearchCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState(() => getParams().features);
  const [showFilters, setShowFilters] = useState(() => getParams().features.length > 0);
  const geocodeTimer = React.useRef(null);

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (selectedFeatures.length) p.set("features", selectedFeatures.join(","));
    const qs = p.toString();
    const newUrl = qs ? `?${qs}` : location.pathname;
    navigate(newUrl, { replace: true });
  }, [search, selectedFeatures]);

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  const { data: configs = [] } = useQuery({
    queryKey: ["page-configs-loc"],
    queryFn: () => base44.entities.PageConfig.filter({ page_key: "locations" }),
  });

  const cfg = { ...DEFAULTS, ...(configs[0] || {}) };
  const allFeatures = getAllFeatures(facilities);

  // Geocode search query with debounce
  useEffect(() => {
    if (!search.trim()) { setSearchCoords(null); return; }
    clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      setGeocoding(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&countrycodes=us&format=json&limit=1`);
        const data = await res.json();
        if (data[0]) {
          setSearchCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          setSearchCoords(null);
        }
      } catch {
        setSearchCoords(null);
      }
      setGeocoding(false);
    }, 600);
  }, [search]);

  const handleUseMyLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setSearch(""); setSearchCoords(null); setLocationLoading(false); },
      () => { alert("Could not get your location."); setLocationLoading(false); }
    );
  };

  const toggleFeature = (feat) => {
    setSelectedFeatures((prev) => prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]);
    setShowFilters(true);
  };

  let filtered = facilities.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !search || f.name?.toLowerCase().includes(q) || f.city?.toLowerCase().includes(q) || f.state?.toLowerCase().includes(q) || f.zip?.toLowerCase().includes(q);
    const matchFeatures = selectedFeatures.length === 0 || selectedFeatures.every((feat) => (f.features || []).includes(feat));
    return matchSearch && matchFeatures;
  });

  if (userLocation) {
    filtered = filtered.map((f) => ({
      ...f,
      distance: f.latitude && f.longitude ? distanceMiles(userLocation.lat, userLocation.lng, f.latitude, f.longitude) : null,
    })).sort((a, b) => { if (a.distance == null) return 1; if (b.distance == null) return -1; return a.distance - b.distance; });
  }

  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : filtered[0]?.latitude ? [filtered[0].latitude, filtered[0].longitude] : [39.5, -98.35];

  const gridClass = cfg.card_layout === "grid-2" ? "grid md:grid-cols-2 gap-6" : cfg.card_layout === "list" ? "flex flex-col gap-4" : "grid md:grid-cols-2 lg:grid-cols-3 gap-6";

  const heroStyle = {
    backgroundColor: cfg.hero_bg_color,
    paddingTop: cfg.hero_padding_y,
    paddingBottom: cfg.hero_padding_y,
    ...(cfg.hero_bg_image ? { backgroundImage: `url(${cfg.hero_bg_image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
  };

  return (
    <div style={{ backgroundColor: cfg.page_bg_color }} className="min-h-screen">
      {/* Hero */}
      <div style={heroStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: cfg.hero_title_color }}>
            {cfg.hero_title}
          </h1>
          <p className="text-lg mb-6 max-w-xl mx-auto" style={{ color: cfg.hero_subtitle_color }}>
            {cfg.hero_subtitle}
          </p>

          {/* Search row */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by city, state, or zip..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setUserLocation(null); }}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                className="pl-12 h-14 rounded-2xl text-base border-0 shadow-xl"
                style={{ backgroundColor: cfg.search_bar_bg }}
              />
            </div>
            {cfg.show_near_me_button !== false && (
              <Button
                onClick={handleUseMyLocation}
                disabled={locationLoading}
                className="h-14 px-5 rounded-2xl shadow-xl font-semibold gap-2 flex-shrink-0"
                style={{ backgroundColor: cfg.button_bg_color, color: cfg.button_text_color }}
              >
                <Navigation className={`w-5 h-5 ${locationLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{locationLoading ? "Locating..." : "Near Me"}</span>
              </Button>
            )}
          </div>

          {/* Filter / Map toggles */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {cfg.show_filter_toggle !== false && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition"
                style={showFilters ? { backgroundColor: cfg.filter_active_bg, color: cfg.filter_active_text } : { backgroundColor: cfg.filter_inactive_bg, color: cfg.filter_inactive_text }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
              </button>
            )}
            {cfg.show_map_toggle !== false && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition"
                style={showMap ? { backgroundColor: cfg.filter_active_bg, color: cfg.filter_active_text } : { backgroundColor: cfg.filter_inactive_bg, color: cfg.filter_inactive_text }}
              >
                <Map className="w-4 h-4" />
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            )}
            {userLocation && (
              <button onClick={() => setUserLocation(null)} className="flex items-center gap-1 px-3 py-2 rounded-full text-sm" style={{ backgroundColor: cfg.filter_inactive_bg, color: cfg.filter_inactive_text }}>
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
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition"
                  style={selectedFeatures.includes(feat) ? { backgroundColor: cfg.filter_active_bg, color: cfg.filter_active_text } : { backgroundColor: cfg.filter_inactive_bg, color: cfg.filter_inactive_text }}
                >
                  {feat}
                </button>
              ))}
              {selectedFeatures.length > 0 && (
                <button onClick={() => setSelectedFeatures([])} className="px-3 py-1.5 rounded-full text-sm" style={{ color: cfg.filter_inactive_text, opacity: 0.7 }}>
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
            {userLocation && <Marker position={[userLocation.lat, userLocation.lng]}><Popup>Your Location</Popup></Marker>}
          </MapContainer>
        </div>
      )}

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {userLocation && (
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <Navigation className="w-4 h-4" style={{ color: cfg.accent_color }} /> Showing results near your location
          </p>
        )}

        {isLoading ? (
          <div className={gridClass}>
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
          <div className={gridClass}>
            {filtered.map((f) => (
              <Link
                key={f.id}
                to={createPageUrl("FacilityPage") + `?id=${f.id}`}
                className="group overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: cfg.card_bg_color,
                  borderRadius: cfg.card_border_radius,
                  border: `1px solid ${cfg.card_border_color}`,
                  boxShadow: shadowMap[cfg.card_shadow] || shadowMap.sm,
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = cfg.card_hover_border_color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = cfg.card_border_color}
              >
                {cfg.show_facility_image !== false && (
                  <div className={`overflow-hidden relative ${cfg.card_layout === "list" ? "h-40 md:h-full md:w-48 md:float-left" : "h-52"}`}>
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
                )}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 transition-colors" style={{ color: cfg.card_title_color }}>{f.name}</h3>
                  <div className="space-y-1.5 mb-4">
                    {cfg.show_facility_address !== false && (
                      <p className="text-sm flex items-center gap-2" style={{ color: cfg.card_subtitle_color }}>
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        {f.address}, {f.city}, {f.state} {f.zip}
                      </p>
                    )}
                    {cfg.show_facility_phone !== false && f.phone && (
                      <p className="text-sm flex items-center gap-2" style={{ color: cfg.card_subtitle_color }}>
                        <Phone className="w-4 h-4 flex-shrink-0" /> {f.phone}
                      </p>
                    )}
                  </div>
                  {cfg.show_facility_features !== false && f.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {f.features.slice(0, 4).map((feat, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={selectedFeatures.includes(feat)
                            ? { backgroundColor: `${cfg.accent_color}20`, color: cfg.accent_color }
                            : { backgroundColor: "#f3f4f6", color: "#4b5563" }}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: cfg.accent_color }}>
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