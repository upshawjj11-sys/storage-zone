import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site-settings-nav"],
    queryFn: async () => { const items = await base44.entities.SiteSettings.list(); return items[0] || {}; },
  });

  const { data: branding } = useQuery({
    queryKey: ["branding-nav"],
    queryFn: async () => { const items = await base44.entities.BrandingKit.list(); return items[0] || {}; },
  });

  const logoUrl = settings?.nav_logo_url || branding?.logo_url;
  const siteName = branding?.site_name || "Storage Zone";
  const bgColor = settings?.nav_bg_color || "#ffffff";
  const textColor = settings?.nav_text_color || "#1B365D";
  const borderBottom = settings?.nav_border_bottom !== false;
  const navLinks = settings?.nav_links || [];
  const ctaButtons = settings?.nav_cta_buttons || [];
  const announcement = settings?.header_announcement_enabled ? settings.header_announcement : null;

  const renderCtaButton = (btn, i) => {
    const style = btn.style || "filled";
    const bg = btn.bg_color || "#E8792F";
    const tc = btn.text_color || "#ffffff";
    const href = btn.url || "#";
    const isExternal = href.startsWith("http");

    let className = "px-4 py-2 rounded-lg text-sm font-semibold transition";
    let inlineStyle = {};

    if (style === "filled") {
      inlineStyle = { background: bg, color: tc };
    } else if (style === "outline") {
      className += " border-2";
      inlineStyle = { borderColor: bg, color: bg };
    } else {
      inlineStyle = { color: bg };
    }

    if (isExternal) {
      return <a key={i} href={href} target="_blank" rel="noreferrer" className={className} style={inlineStyle}>{btn.text}</a>;
    }
    return <Link key={i} to={href} className={className} style={inlineStyle}>{btn.text}</Link>;
  };

  return (
    <>
      {announcement && (
        <div
          className="text-center text-sm py-2 px-4 font-medium"
          style={{
            background: settings.header_announcement_color || "#E8792F",
            color: settings.header_announcement_text_color || "#ffffff",
          }}
        >
          {announcement}
        </div>
      )}
      <nav
        className={`sticky top-0 z-50 w-full${borderBottom ? " border-b border-gray-200" : ""}`}
        style={{ background: bgColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl font-black" style={{ color: textColor }}>{siteName}</span>
            )}
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((link, i) => (
              link.url?.startsWith("http") ? (
                <a key={i} href={link.url} target={link.open_new_tab ? "_blank" : undefined} rel="noreferrer"
                  className="text-sm font-medium hover:opacity-70 transition" style={{ color: textColor }}>
                  {link.label}
                </a>
              ) : (
                <Link key={i} to={link.url || "/"} className="text-sm font-medium hover:opacity-70 transition" style={{ color: textColor }}>
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* CTA buttons — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {ctaButtons.map((btn, i) => renderCtaButton(btn, i))}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" style={{ color: textColor }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-3" style={{ background: bgColor }}>
            {navLinks.map((link, i) => (
              link.url?.startsWith("http") ? (
                <a key={i} href={link.url} target={link.open_new_tab ? "_blank" : undefined} rel="noreferrer"
                  className="block text-sm font-medium py-1" style={{ color: textColor }} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ) : (
                <Link key={i} to={link.url || "/"} className="block text-sm font-medium py-1" style={{ color: textColor }} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              )
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {ctaButtons.map((btn, i) => renderCtaButton(btn, i))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}