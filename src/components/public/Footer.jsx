import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    base44.entities.SiteSettings.list().then((r) => r[0] && setSettings(r[0]));
    base44.entities.BrandingKit.list().then((r) => r[0] && setBranding(r[0]));
  }, []);

  const bgColor = settings?.footer_bg_color || "#0F172A";
  const textColor = settings?.footer_text_color || "#ffffff";
  const accentColor = settings?.footer_accent_color || branding?.secondary_color || "#E8792F";
  const logoUrl = settings?.nav_logo_url || branding?.logo_dark_url || branding?.logo_url;
  const siteName = branding?.site_name || "StoragePro";
  const tagline = settings?.footer_tagline || branding?.tagline;
  const copyright = settings?.footer_copyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const columns = settings?.footer_columns || [];
  const quickLinks = settings?.footer_links || [];
  const showSocial = settings?.footer_show_social !== false;

  const socials = [
    { Icon: Facebook, url: branding?.social_facebook },
    { Icon: Instagram, url: branding?.social_instagram },
    { Icon: Twitter, url: branding?.social_twitter },
    { Icon: Youtube, url: branding?.social_youtube },
    { Icon: Linkedin, url: branding?.social_linkedin },
  ].filter((s) => s.url);

  const renderLink = (link, i) => (
    link.url?.startsWith("http") ? (
      <a key={i} href={link.url} target="_blank" rel="noreferrer"
        className="text-sm transition hover:opacity-80 block"
        style={{ color: `${textColor}99` }}>
        {link.label}
      </a>
    ) : (
      <Link key={i} to={link.url || "#"}
        className="text-sm transition hover:opacity-80 block"
        style={{ color: `${textColor}99` }}>
        {link.label}
      </Link>
    )
  );

  const hasColumns = columns.length > 0;
  const hasQuickLinks = quickLinks.length > 0;

  return (
    <footer style={{ background: bgColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className={`grid gap-10 ${hasColumns ? `md:grid-cols-${Math.min(columns.length + 1, 4)}` : "md:grid-cols-1"}`}>
          {/* Brand column */}
          <div className="space-y-4">
            {logoUrl
              ? <img src={logoUrl} alt={siteName} className="h-10 object-contain" />
              : <span className="text-xl font-black tracking-tight" style={{ color: textColor }}>{siteName}</span>}
            {tagline && <p className="text-sm leading-relaxed max-w-xs" style={{ color: `${textColor}80` }}>{tagline}</p>}
            {showSocial && socials.length > 0 && (
              <div className="flex gap-3 pt-1">
                {socials.map(({ Icon, url }, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80"
                    style={{ background: `${textColor}15`, color: textColor }}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
            {hasQuickLinks && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2">
                {quickLinks.map((link, i) => renderLink(link, i))}
              </div>
            )}
          </div>

          {/* Dynamic columns */}
          {columns.map((col, ci) => (
            <div key={ci} className="space-y-3">
              {col.heading && <h4 className="font-semibold text-sm uppercase tracking-wider" style={{ color: accentColor }}>{col.heading}</h4>}
              <div className="space-y-2">
                {(col.links || []).map((link, li) => renderLink(link, li))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: `1px solid ${textColor}20` }}>
          <p className="text-sm" style={{ color: `${textColor}60` }}>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}