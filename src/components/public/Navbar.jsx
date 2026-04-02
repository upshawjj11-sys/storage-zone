import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
  const navRef = useRef(null);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-navbar"],
    queryFn: () => base44.entities.SiteSettings.list(),
    select: (data) => data?.[0],
  });

  const { data: branding } = useQuery({
    queryKey: ["branding-navbar"],
    queryFn: () => base44.entities.BrandingKit.list(),
    select: (data) => data?.[0],
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navBg = settings?.nav_bg_color || "#ffffff";
  const navText = settings?.nav_text_color || "#1B365D";
  const hoverColor = settings?.nav_menu_hover_color || navText;
  const logoUrl = settings?.nav_logo_url || branding?.logo_url;
  const logoHeight = settings?.nav_logo_height || 48;
  const links = settings?.nav_links || [];
  const ctaButtons = settings?.nav_cta_buttons || [];
  const hasBorder = settings?.nav_border_bottom !== false;

  const fontStyle = {
    fontSize: settings?.nav_menu_font_size ? `${settings.nav_menu_font_size}px` : undefined,
    fontWeight: settings?.nav_menu_font_weight || undefined,
    letterSpacing: settings?.nav_menu_letter_spacing ? `${settings.nav_menu_letter_spacing}px` : undefined,
    textTransform: settings?.nav_menu_text_transform || undefined,
  };

  const handleNav = (url, openNewTab) => {
    setOpenDropdown(null);
    setMobileOpen(false);
    if (!url) return;
    if (openNewTab) {
      window.open(url, "_blank");
      return;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

  const heightClass =
    settings?.nav_height === "xl"
      ? "h-24"
      : settings?.nav_height === "large"
      ? "h-20"
      : "h-16";

  return (
    <nav
      ref={navRef}
      className={`w-full z-50 sticky top-0 ${hasBorder ? "border-b border-gray-200" : ""}`}
      style={{ background: navBg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between ${heightClass}`}>
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ height: `${logoHeight}px` }} className="object-contain" />
            ) : (
              <span className="text-xl font-bold" style={{ color: navText }}>
                {branding?.site_name || "Site"}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link, i) => {
              if (link.type === "dropdown" && link.children?.length > 0) {
                const isOpen = openDropdown === i;
                return (
                  <div key={i} className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-1 transition-opacity hover:opacity-70"
                      style={{ color: navText, ...fontStyle }}
                      onClick={() => setOpenDropdown(isOpen ? null : i)}
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-52 rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                        style={{ background: navBg }}
                      >
                        {link.children.map((child, j) => (
                          <button
                            key={j}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/5"
                            style={{ color: navText, ...fontStyle }}
                            onClick={() => handleNav(child.url, child.open_new_tab)}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={i}
                  type="button"
                  className="transition-opacity hover:opacity-70"
                  style={{ color: navText, ...fontStyle }}
                  onClick={() => handleNav(link.url, link.open_new_tab)}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* CTA Buttons (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {ctaButtons.map((btn, i) => {
              const base = {
                background: btn.bg_color || (btn.style === "outline" ? "transparent" : "#E8792F"),
                color: btn.text_color || "#ffffff",
                border: btn.style === "outline" ? `2px solid ${btn.bg_color || "#E8792F"}` : "none",
              };
              return (
                <button
                  key={i}
                  type="button"
                  className="px-5 py-2 rounded-full font-semibold text-sm transition-opacity hover:opacity-85"
                  style={base}
                  onClick={() => handleNav(btn.url)}
                >
                  {btn.text}
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ color: navText }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-gray-200 px-4 pb-4 pt-2 space-y-1"
          style={{ background: navBg }}
        >
          {links.map((link, i) => {
            if (link.type === "dropdown" && link.children?.length > 0) {
              const isOpen = mobileOpenDropdown === i;
              return (
                <div key={i}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between py-3 font-medium"
                    style={{ color: navText, ...fontStyle }}
                    onClick={() => setMobileOpenDropdown(isOpen ? null : i)}
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="pl-4 space-y-1">
                      {link.children.map((child, j) => (
                        <button
                          key={j}
                          type="button"
                          className="w-full text-left py-2.5 text-sm"
                          style={{ color: navText, opacity: 0.8 }}
                          onClick={() => handleNav(child.url, child.open_new_tab)}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                className="w-full text-left py-3 font-medium"
                style={{ color: navText, ...fontStyle }}
                onClick={() => handleNav(link.url, link.open_new_tab)}
              >
                {link.label}
              </button>
            );
          })}
          {ctaButtons.length > 0 && (
            <div className="pt-2 space-y-2">
              {ctaButtons.map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full py-2.5 rounded-full font-semibold text-sm"
                  style={{
                    background: btn.bg_color || "#E8792F",
                    color: btn.text_color || "#ffffff",
                  }}
                  onClick={() => handleNav(btn.url)}
                >
                  {btn.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}