import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { ICONS } from "@/components/home/DynamicIcon";
import { base44 } from "@/api/base44Client";

export default function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("library");
  const [uploading, setUploading] = useState(false);

  const allNames = Object.keys(ICONS);
  const filtered = search
    ? allNames.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : allNames;

  const isUrl = value && (value.startsWith("http") || value.startsWith("/"));
  const SelectedIcon = value && ICONS[value] ? ICONS[value] : null;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setOpen(false);
    setUploading(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 transition text-sm w-full"
      >
        {isUrl ? (
          <>
            <img src={value} alt="icon" className="w-4 h-4 object-contain" />
            <span className="text-gray-700 text-xs truncate max-w-[120px]">Custom image</span>
          </>
        ) : SelectedIcon ? (
          <>
            <SelectedIcon className="w-4 h-4 text-[#E8792F]" />
            <span className="text-gray-700">{value}</span>
          </>
        ) : (
          <span className="text-gray-400">Choose icon…</span>
        )}
        <span className="ml-auto text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-80 bg-white border rounded-xl shadow-xl p-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${tab === "library" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              Icon Library
            </button>
            <button
              type="button"
              onClick={() => setTab("custom")}
              className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${tab === "custom" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              Custom Image
            </button>
          </div>

          {tab === "library" && (
            <>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  className="pl-7 h-8 text-sm"
                  placeholder={`Search ${allNames.length} icons...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
                {filtered.map((name) => {
                  const Icon = ICONS[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#E8792F]/10 transition ${value === name ? "bg-[#E8792F]/15 ring-1 ring-[#E8792F]" : ""}`}
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {tab === "custom" && (
            <div className="space-y-3 py-2">
              <p className="text-xs text-gray-500">Upload a favicon, logo, or any small image to use as the icon.</p>
              <label className={`flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">{uploading ? "Uploading..." : "Click to upload"}</span>
                <span className="text-xs text-gray-400">PNG, SVG, ICO, JPG accepted</span>
                <input type="file" accept="image/*,.ico,.svg" className="hidden" onChange={handleUpload} />
              </label>
              {isUrl && (
                <div className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                  <img src={value} alt="current" className="w-8 h-8 object-contain" />
                  <span className="text-xs text-gray-500 flex-1 truncate">Current custom image</span>
                </div>
              )}
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="mt-2 text-xs text-red-400 hover:text-red-600 block w-full text-center"
            >
              Clear icon
            </button>
          )}
        </div>
      )}
    </div>
  );
}