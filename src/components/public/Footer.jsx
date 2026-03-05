import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  const { data: branding } = useQuery({
    queryKey: ["branding"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
      return items[0] || {};
    },
  });

  const { data: pages } = useQuery({
    queryKey: ["footer-pages"],
    queryFn: () => base44.entities.StaticPage.filter({ status: "published" }),
    initialData: [],
  });

  const { data: facilities } = useQuery({
    queryKey: ["footer-facilities"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  const primaryColor = branding?.primary_color || "#1B365D";
  const socials = [
    { icon: Facebook, url: branding?.social_facebook },
    { icon: Instagram, url: branding?.social_instagram },
    { icon: Twitter, url: branding?.social_twitter },
    { icon: Youtube, url: branding?.social_youtube },
    { icon: Linkedin, url: branding?.social_linkedin },
  ].filter((s) => s.url);

  return (
    <footer style={{ background: primaryColor }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {branding?.logo_dark_url ? (
                <img src={branding.logo_dark_url} alt="" className="h-8" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                    SZ
                  </div>
                  <span className="text-lg font-bold">{branding?.site_name || "Storage Zone"}</span>
                </div>
              )}
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {branding?.tagline || "Secure, affordable self storage solutions for your needs."}
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socials.map(({ icon: Icon, url }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90">Locations</h4>
            <div className="space-y-2">
              {facilities.slice(0, 5).map((f) => (
                <Link
                  key={f.id}
                  to={createPageUrl("FacilityPage") + `?id=${f.id}`}
                  className="block text-sm text-white/60 hover:text-white transition"
                >
                  {f.name}
                </Link>
              ))}
              {facilities.length > 5 && (
                <Link to={createPageUrl("Locations")} className="block text-sm text-white/60 hover:text-white transition">
                  View all →
                </Link>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90">Quick Links</h4>
            <div className="space-y-2">
              <Link to={createPageUrl("Home")} className="block text-sm text-white/60 hover:text-white transition">
                Home
              </Link>
              <Link to={createPageUrl("Locations")} className="block text-sm text-white/60 hover:text-white transition">
                Find Storage
              </Link>
              {pages.map((p) => (
                <Link
                  key={p.id}
                  to={createPageUrl("PublicPage") + `?slug=${p.slug}`}
                  className="block text-sm text-white/60 hover:text-white transition"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/90">Contact</h4>
            <div className="space-y-3">
              {facilities[0]?.phone && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${facilities[0].phone}`}>{facilities[0].phone}</a>
                </div>
              )}
              {facilities[0]?.email && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${facilities[0].email}`}>{facilities[0].email}</a>
                </div>
              )}
              {facilities[0]?.address && (
                <div className="flex items-start gap-2 text-sm text-white/60">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{facilities[0].address}, {facilities[0].city}, {facilities[0].state}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/40">
          {branding?.footer_text || `© ${new Date().getFullYear()} ${branding?.site_name || "Storage Zone"}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}