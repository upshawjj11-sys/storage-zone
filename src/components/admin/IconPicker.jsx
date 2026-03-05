import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Shield, Lock, ShieldCheck, Key, Eye, Clock, Calendar, CalendarCheck, Timer, MapPin, Map, Navigation, Compass, Home, Building, Building2, Warehouse, Star, Heart, ThumbsUp, Award, Trophy, BadgeCheck, Check, CheckCircle, CheckCircle2, Truck, Car, Package, Package2, PackageCheck, Box, Boxes, Tag, Tags, DollarSign, CreditCard, Banknote, Coins, Percent, BadgeDollarSign, Phone, Mail, MessageCircle, MessageSquare, Bell, BellRing, Leaf, Sun, Moon, Wind, Snowflake, Flame, Zap, Wifi, Plug, Battery, Users, User, UserCheck, UserPlus, Wrench, Settings, Settings2, Hammer, ArrowRight, ArrowUp, ArrowDown, ChevronRight, Plus, X, Minus, RefreshCw, Camera, Image, FileText, Clipboard, ClipboardCheck, BookOpen, Globe, Info, HelpCircle, AlertCircle } from "lucide-react";

const ICONS = {
  Shield, Lock, ShieldCheck, Key, Eye, Clock, Calendar, CalendarCheck, Timer,
  MapPin, Map, Navigation, Compass, Home, Building, Building2, Warehouse,
  Star, Heart, ThumbsUp, Award, Trophy, BadgeCheck,
  Check, CheckCircle, CheckCircle2,
  Truck, Car, Package, Package2, PackageCheck, Box, Boxes,
  Tag, Tags, DollarSign, CreditCard, Banknote, Coins, Percent, BadgeDollarSign,
  Phone, Mail, MessageCircle, MessageSquare, Bell, BellRing,
  Leaf, Sun, Moon, Wind, Snowflake, Flame, Zap, Wifi, Plug, Battery,
  Users, User, UserCheck, UserPlus,
  Wrench, Settings, Settings2, Hammer,
  ArrowRight, ArrowUp, ArrowDown, ChevronRight,
  Plus, X, Minus, RefreshCw,
  Camera, Image, FileText, Clipboard, ClipboardCheck, BookOpen,
  Globe, Info, HelpCircle, AlertCircle,
};

export default function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = Object.keys(ICONS).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = value && ICONS[value] ? ICONS[value] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 transition text-sm w-full"
      >
        {SelectedIcon ? (
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
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="pl-7 h-8 text-sm"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-6 gap-1 max-h-52 overflow-y-auto">
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