import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Search, ArrowRight, Navigation, Map, X, SlidersHorizontal } from "lucide-react";
import { facilityUrl } from "./FacilityPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const STATE_ABBR = {
  "alabama":"AL","alaska":"AK","arizona":"AZ","arkansas":"AR","california":"CA",
  "colorado":"CO","connecticut":"CT","delaware":"DE","florida":"FL","georgia":"GA",
  "hawaii":"HI","idaho":"ID","illinois":"IL","indiana":"IN","iowa":"IA","kansas":"KS",
  "kentucky":"KY","louisiana":"LA","maine":"ME","maryland":"MD","massachusetts":"MA",
  "michigan":"MI","minnesota":"MN","mississippi":"MS","missouri":"MO","montana":"MT",
  "nebraska":"NE","nevada":"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM",
  "new york":"NY","north carolina":"NC","north dakota":"ND","ohio":"OH","oklahoma":"OK",
  "oregon":"OR","pennsylvania":"PA","rhode island":"RI","south carolina":"SC",
  "south dakota":"SD","tennessee":"TN","texas":"TX","utah":"UT","vermont":"VT",
  "virginia":"VA","washington":"WA","west virginia":"WV","wisconsin":"WI","wyoming":"WY"
};

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
  search_radius_miles: 50,
  allow_customer_radius_filter: false,
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
  const [customRadius, setCustomRadius] = useState(null);
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
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSearch("");
        setSearchCoords(null);
        setLocationLoading(false);
      },
      () => { alert("Could not get your location. Please allow location access in your browser."); setLocationLoading(false); }
    );
  };

  const toggleFeature = (feat) => {
    setSelectedFeatures((prev) => prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]);
    setShowFilters(true);
  };

  // Active coords: prefer userLocation (Near Me), fall back to geocoded search coords
  const activeCoords = userLocation || searchCoords;
  const RADIUS_MI = customRadius ?? (cfg.search_radius_miles || 50);

  // While geocoding is in progress for a typed search, don't filter yet
  const isWaitingForGeocode = search.trim() && !userLocation && geocoding;

  const q = search.trim().toLowerCase();
  // Resolve full state name to abbreviation (e.g. "florida" → "FL")
  const qStateAbbr = STATE_ABBR[q] || null;

  function textMatch(f) {
    if (!q) return true;
    const name = f.name?.toLowerCase() || "";
    const city = f.city?.toLowerCase() || "";
    const state = (f.state || "").toLowerCase();
    const zip = f.zip?.toLowerCase() || "";
    const address = f.address?.toLowerCase() || "";
    // Match on any field, or if query is a full state name match the abbreviation
    return (
      name.includes(q) ||
      city.includes(q) ||
      state.includes(q) ||
      zip.includes(q) ||
      address.includes(q) ||
      (qStateAbbr && state.toUpperCase() === qStateAbbr)
    );
  }

  let filtered = isWaitingForGeocode ? [] : facilities
    .map((f) => ({
      ...f,
      distance: activeCoords && f.latitude && f.longitude
        ? distanceMiles(activeCoords.lat, activeCoords.lng, f.latitude, f.longitude)
        : null,
    }))
    .filter((f) => {
      const matchFeatures = selectedFeatures.length === 0 || selectedFeatures.every((feat) => (f.features || []).includes(feat));
      if (!matchFeatures) return false;

      // Near Me mode (no search text): show only facilities within range
      if (userLocation && !q) {
        return f.distance != null && f.distance <= RADIUS_MI;
      }

      if (!q) return true;

      // Text match covers: city, state (full name or abbrev), zip, name, address
      if (textMatch(f)) return true;

      // Geocoded coordinates resolved: also show nearby facilities within radius
      if (activeCoords && f.distance != null && f.distance <= RADIUS_MI) return true;

      return false;
    })
    .sort((a, b) => {
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

  const mapCenter = activeCoords
    ? [activeCoords.lat, activeCoords.lng]
    : filtered[0]?.latitude
    ? [filtered[0].latitude, filtered[0].longitude]
    : [39.5, -98.35];
  const mapZoom = activeCoords ? 10 : 4;

  function MapRecenter({ center, zoom }) {
    const map = useMap();
    useEffect(() => { map.setView(center, zoom); }, [center, zoom]);
    return null;
  }

  const markerColor = cfg.map_marker_color || "#E8792F";
  const userDotColor = cfg.map_user_dot_color || "#1B365D";

  const facilityIcon = L.divIcon({
    className: "",
    html: `<div style="
      width: 36px; height: 36px;
      background: ${markerColor};
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });

  const userIcon = L.divIcon({
    className: "",
    html: `<div style="
      width: 20px; height: 20px;
      background: ${userDotColor};
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 5px rgba(27,54,93,0.25);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });

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
            {(userLocation || searchCoords) && (
              <button onClick={() => { setUserLocation(null); setSearchCoords(null); setSearch(""); }} className="flex items-center gap-1 px-3 py-2 rounded-full text-sm" style={{ backgroundColor: cfg.filter_inactive_bg, color: cfg.filter_inactive_text }}>
                <X className="w-3.5 h-3.5" /> Clear location
              </button>
            )}
          </div>

          {/* Feature filters + optional radius filter */}
          {showFilters && (allFeatures.length > 0 || cfg.allow_customer_radius_filter) && (
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
              {cfg.allow_customer_radius_filter && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: cfg.filter_inactive_bg, color: cfg.filter_inactive_text }}>
                  <span className="whitespace-nowrap">Radius:</span>
                  <select
                    value={customRadius ?? (cfg.search_radius_miles || 50)}
                    onChange={(e) => setCustomRadius(Number(e.target.value))}
                    className="bg-transparent border-0 outline-none text-sm font-medium cursor-pointer"
                    style={{ color: cfg.filter_inactive_text }}
                  >
                    {[10, 25, 50, 100, 250].map((r) => (
                      <option key={r} value={r} style={{ color: "#111" }}>{r} mi</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedFeatures.length > 0 && (
                <button onClick={() => setSelectedFeatures([])} className="px-3 py-1.5 rounded-full text-sm" style={{ color: cfg.filter_inactive_text, opacity: 0.7 }}>
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map — full-width inline expanded section */}
      {showMap && (
        <div className="w-full" style={{ height: "460px", position: "relative" }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
            dragging={!!cfg.map_draggable}
            zoomControl={true}
          >
            <TileLayer
              url={`https://{s}.basemaps.cartocdn.com/${cfg.map_tile_style || "dark_all"}/{z}/{x}/{y}{r}.png`}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapRecenter center={mapCenter} zoom={mapZoom} />
            {filtered.filter((f) => f.latitude && f.longitude).map((f) => (
              <Marker key={f.id} position={[f.latitude, f.longitude]} icon={facilityIcon}>
                <Popup className="custom-map-popup">
                  <div style={{ minWidth: "160px", fontFamily: "Inter, sans-serif" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1B365D", marginBottom: "4px" }}>{f.name}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>{f.city}, {f.state}</div>
                    {f.distance != null && <div style={{ fontSize: "11px", color: "#E8792F", fontWeight: 600, marginBottom: "6px" }}>{f.distance.toFixed(1)} mi away</div>}
                    <a href={facilityUrl(f)} style={{ fontSize: "12px", color: "#E8792F", fontWeight: 600, textDecoration: "none" }}>View Details →</a>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup><div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#1B365D", fontSize: "13px" }}>📍 Your Location</div></Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {activeCoords && (
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <Navigation className="w-4 h-4" style={{ color: cfg.accent_color }} />
            {userLocation ? "Showing locations nearest to you" : `Showing locations within ${RADIUS_MI} miles of "${search}"`}
            {geocoding && <span className="ml-2 text-xs text-gray-400">Locating...</span>}
          </p>
        )}

        {isLoading || isWaitingForGeocode ? (
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
            <p className="text-gray-500">
              {activeCoords && search
                ? `No locations found within ${RADIUS_MI} miles of "${search}". Try a broader search or check back later.`
                : "Try a different search or adjust your filters."}
            </p>
          </div>
        ) : (
          <div className={gridClass}>
            {filtered.map((f) => (
              <a
                key={f.id}
                href={facilityUrl(f)}
                className="group overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: cfg.card_bg_color,
                  borderRadius: cfg.card_border_radius,
                  border: `1px solid ${cfg.card_border_color}`,
                  boxShadow: shadowMap[cfg.card_shadow] || shadowMap.sm,
                  display: "block",
                  textDecoration: "none",
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
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}