import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function LocationsGridBlockEditor({ data, update }) {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    base44.entities.Facility.list("name", 100).then(setFacilities);
  }, []);

  const selectedIds = data.facility_ids || [];

  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    update("facility_ids", next);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title (optional)</Label>
        <Input value={data.title || ""} onChange={(e) => update("title", e.target.value)} placeholder="Our Locations" />
      </div>
      <div>
        <Label>Columns</Label>
        <Select value={String(data.cols || 3)} onValueChange={(v) => update("cols", Number(v))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block">Select Locations to Display</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {facilities.length === 0 && <p className="text-sm text-gray-400">Loading locations...</p>}
          {facilities.map((f) => (
            <label key={f.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded p-1.5">
              <Checkbox
                checked={selectedIds.includes(f.id)}
                onCheckedChange={() => toggle(f.id)}
              />
              <span className="text-sm text-gray-800">{f.name}</span>
              {f.city && <span className="text-xs text-gray-400">{f.city}, {f.state}</span>}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{selectedIds.length} location(s) selected</p>
      </div>
    </div>
  );
}