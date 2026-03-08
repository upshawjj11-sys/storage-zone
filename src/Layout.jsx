import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "./components/public/Navbar";
import Footer from "./components/public/Footer";
import AdminSidebar from "./components/admin/AdminSidebar";
import PopupRenderer from "./components/popup/PopupRenderer";
import FacilityPage from "./pages/FacilityPage";

const adminPages = [
  "AdminDashboard",
  "AdminHomePage",
  "AdminFacilities",
  "AdminFacilityEdit",
  "AdminPages",
  "AdminPageEdit",
  "AdminPopups",
  "AdminPopupEdit",
  "AdminReservations",
  "AdminBranding",
  "AdminTeam",
  "AdminSiteSettings",
  "AdminBulkUpdate",
  "AdminPageConfigs",
];

// Detect /locations/[state]/[city]/[slug]/ pattern
function isFacilityPath() {
  const parts = window.location.pathname.replace(/\/$/, "").split("/").filter(Boolean);
  return parts[0] === "locations" && parts.length >= 4;
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);
  const isAdmin = adminPages.includes(currentPageName);
  const isFacilitySlugPage = isFacilityPath();

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const me = await base44.auth.me();
          setUser(me);
        }
      } catch (e) {
        // not logged in
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    if (!user || (user.role !== "admin" && user.role !== "editor")) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">You need admin or editor access to view this page.</p>
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="px-6 py-2.5 bg-[#1B365D] text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  // Extract facilityId from URL for facility-specific popup matching
  const facilityId = new URLSearchParams(window.location.search).get("id");

  // Serve FacilityPage for /locations/[state]/[city]/[slug]/ URLs
  if (isFacilitySlugPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1"><FacilityPage /></main>
        <Footer />
        <PopupRenderer currentPageName="FacilityPage" facilityId={null} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <PopupRenderer currentPageName={currentPageName} facilityId={facilityId} />
    </div>
  );
}