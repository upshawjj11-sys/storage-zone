import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Building2,
  FileText,
  CalendarCheck,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: facilities } = useQuery({
    queryKey: ["admin-facilities"],
    queryFn: () => base44.entities.Facility.list(),
    initialData: [],
  });

  const { data: reservations } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: () => base44.entities.Reservation.list("-created_date", 50),
    initialData: [],
  });

  const { data: pages } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => base44.entities.StaticPage.list(),
    initialData: [],
  });

  const pendingReservations = reservations.filter((r) => r.status === "pending");
  const recentReservations = reservations.slice(0, 5);

  const stats = [
    {
      icon: Building2,
      label: "Facilities",
      value: facilities.length,
      color: "bg-blue-500",
      page: "AdminFacilities",
    },
    {
      icon: CalendarCheck,
      label: "Total Reservations",
      value: reservations.length,
      color: "bg-green-500",
      page: "AdminReservations",
    },
    {
      icon: Clock,
      label: "Pending",
      value: pendingReservations.length,
      color: "bg-orange-500",
      page: "AdminReservations",
    },
    {
      icon: FileText,
      label: "Pages",
      value: pages.length,
      color: "bg-purple-500",
      page: "AdminPages",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to Storage Zone admin panel.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Link key={i} to={createPageUrl(stat.page)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color.replace("bg-", "text-")}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reservations</CardTitle>
          <Link to={createPageUrl("AdminReservations")} className="text-sm text-[#E8792F] font-medium">
            View All →
          </Link>
        </CardHeader>
        <CardContent>
          {recentReservations.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No reservations yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {r.facility_name} {r.unit_name && `• ${r.unit_name}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      r.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : r.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}