import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CalendarCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function AdminReservations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: () => base44.entities.Reservation.list("-created_date"),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reservation.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reservations"] }),
  });

  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.facility_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    moved_in: "bg-blue-100 text-blue-700",
    moved_out: "bg-gray-100 text-gray-600",
  };

  const typeColors = {
    inquiry: "bg-purple-100 text-purple-700",
    reservation: "bg-blue-100 text-blue-700",
    rental: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reservations & Inquiries</h1>
        <p className="text-gray-500 mt-1">Manage customer reservations, rentals, and business center inquiries.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} className="w-40">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="moved_in">Moved In</SelectItem>
            <SelectItem value="moved_out">Moved Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reservations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Facility</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Unit / Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.customer_name}</p>
                      <p className="text-xs text-gray-500">{r.customer_email}</p>
                    </td>
                    <td className="px-4 py-3">
                       <p className="text-gray-800 font-medium">{r.facility_name}</p>
                       {r.facility_type === "business_center" && (
                         <span className="text-xs text-purple-600 font-medium">Business Center</span>
                       )}
                     </td>
                    <td className="px-4 py-3">
                       <p className="text-gray-700">{r.unit_name || "—"}</p>
                       {r.unit_type && <p className="text-xs text-gray-400">{r.unit_type}</p>}
                       {r.unit_size && <p className="text-xs text-gray-400">{r.unit_size}</p>}
                       {r.unit_features?.length > 0 && (
                         <p className="text-xs text-gray-400">{r.unit_features.join(", ")}</p>
                       )}
                     </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.move_in_date ? format(new Date(r.move_in_date), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border-0 text-xs ${typeColors[r.reservation_type] || "bg-gray-100 text-gray-600"}`}>
                        {r.reservation_type || "reservation"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border-0 text-xs ${statusColors[r.status]}`}>
                        {r.status?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={r.status}
                        onValueChange={(v) => updateMutation.mutate({ id: r.id, data: { status: v } })}
                      >
                        <SelectTrigger className="h-8 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="moved_in">Moved In</SelectItem>
                          <SelectItem value="moved_out">Moved Out</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}