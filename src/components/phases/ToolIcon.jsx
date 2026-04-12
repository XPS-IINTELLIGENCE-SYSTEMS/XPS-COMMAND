import {
  MapPin, Search, Users, Target, TrendingUp, Database,
  Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch,
  Ruler, ClipboardCheck, Calculator, DollarSign, FileText, Swords, PenLine, Stamp,
  Receipt, CreditCard, Bell, BookOpen, Heart, Star, Image, RefreshCcw, Archive, BarChart3,
  CalendarClock, ShoppingCart, Truck, ClipboardList, Camera, MessageCircle, FileEdit,
  LayoutDashboard, CheckSquare, Flag, Zap
} from "lucide-react";

const iconMap = {
  MapPin, Search, Users, Target, TrendingUp, Database,
  Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch,
  Ruler, ClipboardCheck, Calculator, DollarSign, FileText, Swords, PenLine, Stamp,
  Receipt, CreditCard, Bell, BookOpen, Heart, Star, Image, RefreshCcw, Archive, BarChart3,
  CalendarClock, ShoppingCart, Truck, ClipboardList, Camera, MessageCircle, FileEdit,
  LayoutDashboard, CheckSquare, Flag, Zap,
};

export default function ToolIcon({ name, className }) {
  const Icon = iconMap[name] || Zap;
  return <Icon className={className} />;
}