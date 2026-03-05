import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, Shield, Clock, ArrowRight, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: config } = useQuery({
    queryKey: ["home-config"],
    queryFn: async () => {
      const items = await base44.entities.HomePageConfig.list();
      return items[0] || {};
    },
  });

  const { data: facilities } = useQuery({
    queryKey: ["home-facilities"],
    queryFn: () => base44.entities.Facility.filter({ status: "active" }),
    initialData: [],
  });

  const { data: branding } = useQuery({
    queryKey: ["branding"],
    queryFn: async () => {
      const items = await base44.entities.BrandingKit.list();
      return items[0] || {};
    },
  });

  const primaryColor = branding?.primary_color || "#1B365D";
  const secondaryColor = branding?.secondary_color || "#E8792F";

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${config?.hero_image || "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1920&q=80"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Secure & Climate Controlled
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {config?.hero_title || (
                <>
                  Your Space,
                  <br />
                  <span style={{ color: secondaryColor }}>Your Storage</span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-lg">
              {config?.hero_subtitle ||
                "Find the perfect storage unit near you. Clean, safe, and accessible 24/7."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Locations")}>
                <Button
                  size="lg"
                  className="rounded-full text-base px-8 py-6 font-semibold shadow-xl"
                  style={{ background: secondaryColor }}
                >
                  {config?.hero_cta_text || "Find Your Unit"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("Locations")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full text-base px-8 py-6 font-semibold border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  View Locations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>
              Why Choose {branding?.site_name || "Storage Zone"}?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "24/7 Security",
                desc: "State-of-the-art surveillance, gated access, and individually alarmed units.",
              },
              {
                icon: Clock,
                title: "Flexible Access",
                desc: "Access your storage unit on your schedule with convenient hours and keypad entry.",
              },
              {
                icon: MapPin,
                title: "Multiple Locations",
                desc: "Convenient locations near you with drive-up access and loading docks.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ background: `${secondaryColor}15`, color: secondaryColor }}
                >
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      {facilities.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>
                  Our Locations
                </h2>
                <p className="text-gray-500 mt-2">
                  Find a convenient location near you
                </p>
              </div>
              <Link
                to={createPageUrl("Locations")}
                className="hidden md:flex items-center gap-1 font-semibold text-sm hover:gap-2 transition-all"
                style={{ color: secondaryColor }}
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.slice(0, 6).map((f) => (
                <Link
                  key={f.id}
                  to={createPageUrl("FacilityPage") + `?id=${f.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        f.banner_image ||
                        f.photos?.[0] ||
                        "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80"
                      }
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1" style={{ color: primaryColor }}>
                      {f.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {f.city}, {f.state}
                    </p>
                    {f.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {f.features.slice(0, 3).map((feat, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20" style={{ background: primaryColor }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Reserve your storage unit online today. No commitment required.
          </p>
          <Link to={createPageUrl("Locations")}>
            <Button
              size="lg"
              className="rounded-full text-base px-10 py-6 font-semibold shadow-xl"
              style={{ background: secondaryColor }}
            >
              Find Storage Near You
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}