import { 
  LayoutDashboard, Users, UserSearch, Bot, FlaskConical, Send, FileText, 
  BarChart3, BookOpen, Eye, Link2, Shield, Settings, Pencil, Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "leads", label: "Leads", icon: UserSearch },
  { id: "workflows", label: "Workflows", icon: Bot },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "outreach", label: "Outreach", icon: Send },
  { id: "proposals", label: "Proposals", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "editor", label: "Editor", icon: Pencil },
  { id: "operator", label: "Operator", icon: Terminal },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "competition", label: "Competition", icon: Eye },
  { id: "connectors", label: "Connectors", icon: Link2 },
  { id: "admin", label: "Admin", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MobileNav({ activeView, onViewChange }) {
  return (
    <div className="h-full bg-background overflow-y-auto p-4 safe-top">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-8 h-8 object-contain" />
          <span className="text-base font-bold metallic-gold tracking-wider">XPS</span>
        </div>
        <p className="text-xs text-muted-foreground">Tap to navigate</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all active:scale-95",
                isActive
                  ? "bg-primary/10 border-primary/30 shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                  : "bg-card border-border active:bg-secondary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "metallic-gold-icon" : "metallic-silver-icon")} />
              <span className={cn(
                "text-[11px] font-semibold leading-tight text-center",
                isActive ? "metallic-gold" : "text-foreground/80"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}