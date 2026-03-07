import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, MapPin, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight as ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import DynamicIcon from "./DynamicIcon";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=1920&q=80",
];

export default function HeroCarousel({ config, primaryColor, secondaryColor, pillarsSection }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [current, setCurrent] = useState(0);

  // Build carousel images from hero_image + any extra images configured
  const images = (() => {
    const imgs = [];
    if (config?.hero_image) imgs.push(config.hero_image);
    if (config?.hero_images?.length) {
      config.hero_images.forEach((img) => { if (img && !imgs.includes(img)) imgs.push(img); });
    }
    return imgs.length ? imgs : DEFAULT_IMAGES;
  })();

  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, images.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(createPageUrl("Locations") + (searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""));
  };

  const pillars = pillarsSection?.data?.items || [];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "92vh", minHeight: 520 }}>
      {/* Carousel images */}
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            zIndex: 0,
          }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10" style={{ background: `rgba(0,0,0,${config?.hero_overlay_opacity ?? 0.55})` }} />

      {/* Main content — centered vertically */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">

        {/* Title */}
        <div className="text-center mb-8">
          {config?.hero_badge_text && (
            <p className="text-white/80 text-sm uppercase tracking-widest mb-3">{config.hero_badge_text}</p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-xl">
            {config?.hero_title || (
              <>Your Space, <span style={{ color: secondaryColor }}>Your Storage</span></>
            )}
          </h1>
          {config?.hero_subtitle && (
            <p className="text-white/80 mt-3 text-lg max-w-xl mx-auto">{config.hero_subtitle}</p>
          )}
        </div>

        {/* Pillars + Search Panel */}
        <div className="w-full max-w-3xl">
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "rgba(30,30,30,0.82)", backdropFilter: "blur(6px)" }}>

            {/* Pillars row */}
            {pillars.length > 0 && (
              <div
                className="divide-x divide-white/10 border-b border-white/10"
                style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(pillars.length, 5)}, 1fr)` }}
              >
                {pillars.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center">
                    <DynamicIcon name={item.icon} className="w-6 h-6" style={{ color: item.icon_color || secondaryColor }} />
                    <span className="text-xs font-semibold leading-tight" style={{ color: item.text_color || "#ffffff" }}>{item.text}</span>
                    {item.label && <span className="text-white/50 text-xs">{item.label}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Search row */}
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zip or City, State"
                  className="flex-1 outline-none text-sm text-gray-800 bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-90"
                style={{ background: secondaryColor }}
              >
                Search
              </button>
              <span className="text-white/50 text-xs font-medium">OR</span>
              <Link
                to={createPageUrl("Locations")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-white text-sm border border-white/30 hover:bg-white/10 transition"
              >
                <MapPin className="w-4 h-4" /> Near Me
              </Link>
            </form>
          </div>
        </div>
      </div>

      {/* Carousel arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{ background: i === current ? secondaryColor : "rgba(255,255,255,0.4)" }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}