import { Home, Settings, Database, Users, FileText, Mail, DollarSign, BarChart3, Layers, Globe, Search, Radar, Bot, Zap } from "lucide-react";
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
    <div className="h-11 min-h-[44px] border-t border-white/10 bg-black/50 flex items-center justify-center gap-1 mb-3 mx-auto" style={{ width: 'calc(100% - 356px)', marginLeft: '300px' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.path}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/35 hover:text-white/80 hover:bg-white/5 transition-all group"
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        );
      })}
      <div className="ml-4 flex items-center gap-2 text-[9px] text-white/20">
        <Layers className="w-3 h-3" />
        <span>XPS v2.0</span>
      </div>
    </div>
  );
}