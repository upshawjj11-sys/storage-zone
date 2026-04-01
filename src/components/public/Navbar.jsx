import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_HEIGHTS = { normal: "h-16", large: "h-20", xl: "h-24" };
const NAV_HEIGHT_PX = { normal: 64, large: 80, xl: 96 };

// Desktop dropdown — controlled externally so only one can be open at a time
function DesktopDropdown({ link, textStyle, hoverStyle, dropdownStyle, isOpen, onToggle, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-1 transition-colors duration-150 whitespace-nowrap"
        style={isOpen ? hoverStyle : textStyle}
        onClick={onToggle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
        onMouseLeave={(e) => { if (!isOpen) Object.assign(e.currentTarget.style, textStyle); }}
      >
        {link.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[180px] rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          style={{ background: dropdownStyle?.bg || "#ffffff" }}
        >
          {(link.children || []).map((child, i) => (
            <a
              key={i}
              href={child.url || "#"}
              target={child.open_new_tab ? "_blank" : "_self"}
              rel="noreferrer"
              className="block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
              style={{ color: dropdownStyle?.text || "#1B365D" }}
              onClick={onClose}
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopLink({ link, textStyle, hoverStyle }) {
  return (
    <a
      href={link.url || "#"}
      target={link.open_new_tab ? "_blank" : "_self"}
      rel="noreferrer"
      className="transition-colors duration-150 whitespace-nowrap"
      style={textStyle}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, textStyle)}
    >
      {link.label}
    </a>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  // Only one desktop dropdown open at a time — track by index, null = all closed
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-nav"],
    queryFn: async () => {
      const items = await base44.entities.SiteSettings.list();
      return items[0] || {};
    },
    staleTime: 30000,
  });

  const s = settings || {};
  const navHeight = NAV_HEIGHTS[s.nav_height] || "h-16";
  const navHeightPx = NAV_HEIGHT_PX[s.nav_height] || 64;
  const logoHeight = s.nav_logo_height || 48;
  const bgColor = s.nav_bg_color || "#ffffff";
  const textColor = s.nav_text_color || "#1B365D";
  const links = s.nav_links || [];
  const ctaButtons = s.nav_cta_buttons || [];
  const hasBorder = s.nav_border_bottom !== false;

  const menuFontSize = s.nav_menu_font_size || "15";
  const menuFontWeight = s.nav_menu_font_weight || "500";
  const menuLetterSpacing = s.nav_menu_letter_spacing || "0";
  const menuTextTransform = s.nav_menu_text_transform || "none";
  const menuHoverColor = s.nav_menu_hover_color || textColor;
  const menuHoverUnderline = s.nav_menu_hover_underline || false;
  const menuHoverBg = s.nav_menu_hover_bg || "";
  const menuHoverOpacity = s.nav_menu_hover_opacity != null ? s.nav_menu_hover_opacity : 0.7;

  const textStyle = {
    color: textColor,
    fontSize: `${menuFontSize}px`,
    fontWeight: menuFontWeight,
    letterSpacing: menuLetterSpacing !== "0" ? `${menuLetterSpacing}px` : undefined,
    textTransform: menuTextTransform !== "none" ? menuTextTransform : undefined,
  };

  const hoverStyle = {
    color: menuHoverColor || textColor,
    fontSize: `${menuFontSize}px`,
    fontWeight: menuFontWeight,
    letterSpacing: menuLetterSpacing !== "0" ? `${menuLetterSpacing}px` : undefined,
    textTransform: menuTextTransform !== "none" ? menuTextTransform : undefined,
    opacity: menuHoverOpacity,
    textDecoration: menuHoverUnderline ? "underline" : "none",
    background: menuHoverBg || undefined,
    borderRadius: menuHoverBg ? "4px" : undefined,
    padding: menuHoverBg ? "2px 6px" : undefined,
  };

  const dropdownStyle = { bg: bgColor, text: textColor };

  const renderCta = (btn, i) => {
    const base = "px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 whitespace-nowrap";
    if (btn.style === "outline") {
      return (
        <a key={i} href={btn.url || "#"} className={`${base} border-2`}
          style={{ borderColor: btn.bg_color || "#E8792F", color: btn.bg_color || "#E8792F", background: "transparent" }}>
          {btn.text}
        </a>
      );
    }
    if (btn.style === "ghost") {
      return (
        <a key={i} href={btn.url || "#"} className={base}
          style={{ color: btn.bg_color || "#E8792F", background: "transparent" }}>
          {btn.text}
        </a>
      );
    }
    return (
      <a key={i} href={btn.url || "#"} className={base}
        style={{ background: btn.bg_color || "#E8792F", color: btn.text_color || "#ffffff" }}>
        {btn.text}
      </a>
    );
  };

  return (
    <>
      {/* Announcement bar */}
      {s.header_announcement_enabled && s.header_announcement && (
        <div
          className="text-center text-sm py-2 px-4 font-medium"
          style={{ background: s.header_announcement_color || "#E8792F", color: s.header_announcement_text_color || "#ffffff" }}
        >
          {s.header_announcement}
        </div>
      )}

      {/* Main navbar */}
      <nav
        className={`${navHeight} flex items-center px-4 md:px-8 sticky top-0 z-40`}
        style={{
          background: bgColor,
          borderBottom: hasBorder ? "1px solid rgba(0,0,0,0.08)" : "none",
          boxShadow: hasBorder ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-6">

          {/* Logo */}
          <a href="/" className="flex-shrink-0">
            {s.nav_logo_url ? (
              <img
                src={s.nav_logo_url}
                alt="Logo"
                style={{ height: `${logoHeight}px`, maxHeight: `${navHeightPx - 16}px`, width: "auto", objectFit: "contain" }}
              />
            ) : (
              <span className="text-xl font-bold" style={{ color: textColor }}>Site</span>
            )}
          </a>

          {/* Desktop nav links — only one dropdown open at a time */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {links.map((link, i) => {
              if (link.type === "dropdown") {
                return (
                  <DesktopDropdown
                    key={i}
                    link={link}
                    textStyle={textStyle}
                    hoverStyle={hoverStyle}
                    dropdownStyle={dropdownStyle}
                    isOpen={openDropdownIndex === i}
                    onToggle={() => setOpenDropdownIndex(openDropdownIndex === i ? null : i)}
                    onClose={() => setOpenDropdownIndex(null)}
                  />
                );
              }
              return <DesktopLink key={i} link={link} textStyle={textStyle} hoverStyle={hoverStyle} />;
            })}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {ctaButtons.map((btn, i) => renderCta(btn, i))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: textColor }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-x-0 z-30 shadow-lg border-b"
          style={{ background: bgColor, top: navHeightPx + (s.header_announcement_enabled && s.header_announcement ? 36 : 0) }}
        >
          <div className="px-5 py-4 space-y-1">
            {links.map((link, i) => {
              if (link.type === "dropdown") {
                return (
                  <div key={i}>
                    <button
                      className="w-full flex items-center justify-between py-2.5 text-left"
                      style={textStyle}
                      onClick={() => setMobileDropdowns(p => ({ ...p, [i]: !p[i] }))}
                    >
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdowns[i] ? "rotate-180" : ""}`} />
                    </button>
                    {mobileDropdowns[i] && (
                      <div className="pl-4 space-y-1 border-l-2 border-gray-100 mb-1">
                        {(link.children || []).map((child, ci) => (
                          <a key={ci} href={child.url || "#"} target={child.open_new_tab ? "_blank" : "_self"} rel="noreferrer"
                            className="block py-2 text-sm" style={{ color: textColor }}
                            onClick={() => setMobileOpen(false)}>
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <a key={i} href={link.url || "#"} target={link.open_new_tab ? "_blank" : "_self"} rel="noreferrer"
                  className="block py-2.5" style={textStyle}
                  onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              );
            })}
            <div className="pt-3 flex flex-col gap-2 border-t border-gray-100">
              {ctaButtons.map((btn, i) => renderCta(btn, i))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}