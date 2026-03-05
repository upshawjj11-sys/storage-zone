import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Phone, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: branding } = useQuery({
    queryKey: ["branding"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
      return items[0] || {};
    },
  });

  const { data: pages } = useQuery({
    queryKey: ["nav-pages"],
    queryFn: () => base44.entities.StaticPage.filter({ show_in_nav: true, status: "published" }),
    initialData: [],
  });

  const { data: facilities } = useQuery({
    queryKey: ["nav-facilities"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryColor = branding?.primary_color || "#1B365D";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            {branding?.logo_url ? (
              <img src={branding.logo_url} alt={branding?.site_name || "Storage Zone"} className="h-8 md:h-10" />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-white font-black text-lg"
                  style={{ background: primaryColor }}
                >
                  SZ
                </div>
                <span className="text-lg md:text-xl font-bold" style={{ color: primaryColor }}>
                  {branding?.site_name || "Storage Zone"}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to={createPageUrl("Home")}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[--sz-primary] hover:bg-gray-50 transition"
            >
              Home
            </Link>
            {facilities.length > 0 && (
              <Link
                to={createPageUrl("Locations")}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[--sz-primary] hover:bg-gray-50 transition"
              >
                Locations
              </Link>
            )}
            {pages.map((p) => (
              <Link
                key={p.id}
                to={createPageUrl("PublicPage") + `?slug=${p.slug}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-[--sz-primary] hover:bg-gray-50 transition"
              >
                {p.title}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to={createPageUrl("Locations")}>
              <Button
                className="rounded-full font-semibold px-6"
                style={{ background: branding?.secondary_color || "#E8792F" }}
              >
                Find Storage
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-xl animate-in slide-in-from-top">
          <div className="px-4 py-4 space-y-1">
            <Link
              to={createPageUrl("Home")}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Home
            </Link>
            <Link
              to={createPageUrl("Locations")}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Locations
            </Link>
            {pages.map((p) => (
              <Link
                key={p.id}
                to={createPageUrl("PublicPage") + `?slug=${p.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                {p.title}
              </Link>
            ))}
            <div className="pt-2">
              <Link to={createPageUrl("Locations")} onClick={() => setMobileOpen(false)}>
                <Button
                  className="w-full rounded-full font-semibold"
                  style={{ background: branding?.secondary_color || "#E8792F" }}
                >
                  Find Storage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}