import { Home, Settings, Database, Users, FileText, Mail, DollarSign, BarChart3, Shield, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
  { id: "leads", icon: Users, label: "Leads", path: "/dashboard" },
  { id: "proposals", icon: FileText, label: "Proposals", path: "/dashboard" },
  { id: "invoices", icon: DollarSign, label: "Invoices", path: "/dashboard" },
  { id: "outreach", icon: Mail, label: "Outreach", path: "/dashboard" },
  { id: "research", icon: Database, label: "Research", path: "/dashboard" },
  { id: "analytics", icon: BarChart3, label: "Analytics", path: "/dashboard" },
  { id: "settings", icon: Settings, label: "Settings", path: "/dashboard" },
];

export default function AdminBottomToolbar() {
  return (
    <div className="h-9 min-h-[36px] border-t border-white/10 bg-black/40 flex items-center px-2 gap-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.path}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <Icon className="w-3 h-3" />
            <span className="text-[9px] font-medium hidden md:inline">{item.label}</span>
          </a>
        );
      })}
      <div className="ml-auto flex items-center gap-2 text-[9px] text-white/30">
        <Layers className="w-3 h-3" />
        <span>XPS Intelligence v2.0</span>
      </div>
    </div>
  );
}