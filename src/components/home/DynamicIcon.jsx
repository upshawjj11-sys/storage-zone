import { Shield, Lock, ShieldCheck, Key, Eye, Clock, Calendar, CalendarCheck, Timer, MapPin, Map, Navigation, Compass, Home, Building, Building2, Warehouse, Star, Heart, ThumbsUp, Award, Trophy, BadgeCheck, Check, CheckCircle, CheckCircle2, Truck, Car, Package, Package2, PackageCheck, Box, Boxes, Tag, Tags, DollarSign, CreditCard, Banknote, Coins, Percent, BadgeDollarSign, Phone, Mail, MessageCircle, MessageSquare, Bell, BellRing, Leaf, Sun, Moon, Wind, Snowflake, Flame, Zap, Wifi, Plug, Battery, Users, User, UserCheck, UserPlus, Wrench, Settings, Settings2, Hammer, ArrowRight, ArrowUp, ArrowDown, ChevronRight, Plus, X, Minus, RefreshCw, Camera, Image, FileText, Clipboard, ClipboardCheck, BookOpen, Globe, Info, HelpCircle, AlertCircle } from "lucide-react";

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

export default function DynamicIcon({ name, className }) {
  const Icon = name && ICONS[name] ? ICONS[name] : Shield;
  return <Icon className={className} />;
}

export { ICONS };