import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Play, Image } from "lucide-react";

export default function UnitCard({ unit, facilityType, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  const isBC = facilityType === "business_center";
  const hasMedia = (unit.photos?.length > 0) || (unit.videos?.length > 0);

  return (
    <div
      className={`rounded-xl border transition-all ${unit.available !== false
        ? "bg-white border-gray-200 hover:border-[#E8792F] hover:shadow-md"
        : "bg-gray-50 border-gray-100 opacity-60"}`}
    >
      {/* Main row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => hasMedia ? setExpanded(!expanded) : (unit.available !== false && onAction(unit))}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{unit.name}</p>
            {unit.unit_type && (
              <Badge className="bg-[#1B365D]/10 text-[#1B365D] border-0 text-xs">{unit.unit_type}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {unit.size}
            {unit.type && unit.type !== unit.unit_type ? ` • ${unit.type}` : ""}
          </p>
          {/* Unit features */}
          {unit.features?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {unit.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-600">
                  <Check className="w-3 h-3 text-[#2A9D8F]" />{f}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right ml-4 flex-shrink-0 flex flex-col items-end gap-2">
          {unit.price > 0 && (
            <p className="font-bold text-xl text-[#1B365D]">
              {isBC ? <>Starting at<br /><span>${unit.price.toLocaleString()}/mo</span></> : `$${unit.price}/mo`}
            </p>
          )}
          {unit.available !== false
            ? <Badge className="bg-green-100 text-green-700 border-0">Available</Badge>
            : <Badge variant="secondary">Occupied</Badge>}
          <div className="flex gap-2 items-center">
            {hasMedia && (
              <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="text-xs flex items-center gap-1 text-[#E8792F] hover:underline">
                <Image className="w-3.5 h-3.5" />
                {expanded ? "Hide" : "View"} media
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            {unit.available !== false && (
              <Button size="sm" className="rounded-full text-xs" style={{ background: "#E8792F" }}
                onClick={(e) => { e.stopPropagation(); onAction(unit); }}>
                {isBC ? "Inquire" : "Reserve"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded media */}
      {expanded && hasMedia && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          {unit.photos?.length > 0 && (
            <div>
              <div className="relative rounded-xl overflow-hidden bg-black">
                <img src={unit.photos[photoIdx]} alt="" className="w-full max-h-72 object-contain mx-auto" />
                {unit.photos.length > 1 && (
                  <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                    {unit.photos.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className={`w-2 h-2 rounded-full transition ${i === photoIdx ? "bg-white" : "bg-white/40"}`} />
                    ))}
                  </div>
                )}
                {unit.photos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx((photoIdx - 1 + unit.photos.length) % unit.photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60">‹</button>
                    <button onClick={() => setPhotoIdx((photoIdx + 1) % unit.photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 hover:bg-black/60">›</button>
                  </>
                )}
              </div>
            </div>
          )}
          {unit.videos?.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {unit.videos.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-video">
                  <iframe src={url} className="w-full h-full" allowFullScreen />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}