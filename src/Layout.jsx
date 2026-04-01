import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "./components/public/Navbar";
import Footer from "./components/public/Footer";
import PopupRenderer from "./components/popup/PopupRenderer";

// Detect /locations/[state]/[city]/[slug]/ pattern
function isFacilityPath() {
  const parts = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean);
  return parts[0] === "locations" && parts.length >= 4;
}

export default function Layout({ children, currentPageName }) {
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const isFacilitySlugPage = isFacilityPath();

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Extract facilityId from URL for facility-specific popup matching
  // Support both ?id= param (admin preview) and slug-based URLs (/locations/state/city/slug)
  const facilityId = new URLSearchParams(window.location.search).get("id");
  const slugFromPath = isFacilitySlugPage
    ? window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean).pop()
    : null;

  const activePageName = isFacilitySlugPage ? "FacilityPage" : currentPageName;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <PopupRenderer currentPageName={activePageName} facilityId={facilityId} slugFromPath={slugFromPath} />
    </div>
  );
}