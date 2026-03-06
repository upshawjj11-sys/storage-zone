import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Home,
  Palette,
  MessageSquare,
  CalendarCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  ExternalLink,
  LogOut,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", page: "AdminDashboard" },
  { icon: Home, label: "Home Page", page: "AdminHomePage" },
  { icon: Building2, label: "Facilities", page: "AdminFacilities" },
  { icon: FileText, label: "Static Pages", page: "AdminPages" },
  { icon: MessageSquare, label: "Popups", page: "AdminPopups" },
  { icon: CalendarCheck, label: "Reservations", page: "AdminReservations" },
  { icon: Palette, label: "Branding Kit", page: "AdminBranding" },
  { icon: SlidersHorizontal, label: "Site Settings", page: "AdminSiteSettings" },
  { icon: Layers, label: "Bulk Update", page: "AdminBulkUpdate" },
  { icon: Users, label: "Team Members", page: "AdminTeam" },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <aside
      className={`bg-[#0F172A] text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      } min-h-screen sticky top-0`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8792F] flex items-center justify-center font-black text-sm">
              SZ
            </div>
            <span className="font-bold text-sm">Storage Zone</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const url = createPageUrl(item.page);
          const isActive = currentPath === url;
          return (
            <Link
              key={item.page}
              to={url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#E8792F] text-white shadow-lg shadow-orange-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/10 space-y-1">
        <Link
          to={createPageUrl("Home")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          title={collapsed ? "View Site" : undefined}
        >
          <ExternalLink className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-red-400 hover:bg-white/5 transition w-full"
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}