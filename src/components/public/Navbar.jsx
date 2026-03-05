import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [settings, setSettings] = useState(null);
  const [branding, setBranding] = useState(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    base44.entities.SiteSettings.list().then((r) => r[0] && setSettings(r[0]));
    base44.entities.BrandingKit.list().then((r) => r[0] && setBranding(r[0]));
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bgColor = settings?.nav_bg_color || "#ffffff";
  const textColor = settings?.nav_text_color || "#1B365D";
  const ctaBgColor = settings?.nav_cta_bg_color || "#E8792F";
  const ctaTextColor = settings?.nav_cta_text_color || "#ffffff";
  const ctaStyle = settings?.nav_cta_style || "filled"; // filled | outline | ghost
  const navStyle = settings?.nav_style || "default"; // default | centered | minimal
  const logoText = branding?.site_name || "StoragePro";
  const logoUrl = settings?.nav_logo_url || branding?.logo_url;
  const links = settings?.nav_links || [];
  const ctaText = settings?.nav_cta_text;
  const ctaUrl = settings?.nav_cta_url || createPageUrl("Locations");
  const announcementEnabled = settings?.header_announcement_enabled;
  const announcement = settings?.header_announcement;
  const announcementColor = settings?.header_announcement_color || "#E8792F";
  const announcementTextColor = settings?.header_announcement_text_color || "#ffffff";
  const borderBottom = settings?.nav_border_bottom !== false;

  const ctaClass = {
    filled: `px-5 py-2 rounded-full font-semibold text-sm transition hover:opacity-90`,
    outline: `px-5 py-2 rounded-full font-semibold text-sm border-2 transition hover:opacity-80`,
    ghost: `px-5 py-2 font-semibold text-sm transition hover:underline`,
  }[ctaStyle] || `px-5 py-2 rounded-full font-semibold text-sm transition hover:opacity-90`;

  const ctaInlineStyle = ctaStyle === "filled"
    ? { background: ctaBgColor, color: ctaTextColor }
    : ctaStyle === "outline"
    ? { borderColor: ctaBgColor, color: ctaBgColor }
    : { color: ctaBgColor };

  const navShadow = scrolled ? "shadow-md" : borderBottom ? "border-b border-gray-100" : "";

  const renderLogo = () => (
    <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0">
      {logoUrl
        ? <img src={logoUrl} alt={logoText} className="h-9 object-contain" />
        : <span className="text-xl font-black tracking-tight" style={{ color: textColor }}>{logoText}</span>}
    </Link>
  );

  const renderLinks = (mobile = false) => (
    <>
      {links.map((link, i) => (
        link.url?.startsWith("http") ? (
          <a key={i} href={link.url} target={link.open_new_tab ? "_blank" : "_self"} rel="noreferrer"
            className={`font-medium text-sm transition hover:opacity-70 ${mobile ? "py-2 text-base" : ""}`}
            style={{ color: textColor }}>
            {link.label}
          </a>
        ) : (
          <Link key={i} to={link.url || "#"} target={link.open_new_tab ? "_blank" : "_self"}
            className={`font-medium text-sm transition hover:opacity-70 ${mobile ? "py-2 text-base" : ""}`}
            style={{ color: textColor }}
            onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        )
      ))}
    </>
  );

  const renderCta = (mobile = false) => ctaText && (
    ctaUrl?.startsWith("http") ? (
      <a href={ctaUrl} target="_blank" rel="noreferrer" className={`${ctaClass} ${mobile ? "w-full text-center" : ""}`} style={ctaInlineStyle}>
        {ctaText}
      </a>
    ) : (
      <Link to={ctaUrl} className={`${ctaClass} ${mobile ? "w-full text-center" : ""}`} style={ctaInlineStyle} onClick={() => setOpen(false)}>
        {ctaText}
      </Link>
    )
  );

  return (
    <>
      {/* Announcement Bar */}
      {announcementEnabled && announcement && (
        <div className="w-full text-center py-2 px-4 text-sm font-medium z-50" style={{ background: announcementColor, color: announcementTextColor }}>
          {announcement}
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-shadow ${navShadow} ${announcementEnabled && announcement ? "mt-0" : ""}`}
        style={{ background: bgColor, top: announcementEnabled && announcement ? "auto" : 0 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {navStyle === "centered" ? (
            <div className="flex flex-col items-center py-3 gap-3">
              {renderLogo()}
              <div className="hidden md:flex items-center gap-6">
                {renderLinks()}
                {renderCta()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between h-16 md:h-20">
              {renderLogo()}
              {/* Desktop links */}
              <div className="hidden md:flex items-center gap-6">
                {renderLinks()}
              </div>
              <div className="hidden md:flex items-center gap-3">
                {renderCta()}
              </div>
              {/* Mobile hamburger */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition" onClick={() => setOpen(!open)} style={{ color: textColor }}>
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t px-4 py-4 flex flex-col gap-1" style={{ background: bgColor, borderColor: `${textColor}20` }}>
            {renderLinks(true)}
            <div className="pt-2">{renderCta(true)}</div>
          </div>
        )}
      </nav>

      {/* Spacer to push content below fixed nav */}
      <div style={{ height: announcementEnabled && announcement ? "calc(2.5rem + 5rem)" : "5rem" }} className="hidden md:block" />
      <div style={{ height: announcementEnabled && announcement ? "calc(2.5rem + 4rem)" : "4rem" }} className="md:hidden" />
    </>
  );
}