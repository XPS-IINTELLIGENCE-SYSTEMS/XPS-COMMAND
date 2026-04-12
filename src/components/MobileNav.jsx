import { 
  LayoutDashboard, UserSearch, Send, FileText, BarChart3, Bot, Settings, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Overview" },
  { id: "leads", label: "Leads", icon: UserSearch, desc: "Hot prospects" },
  { id: "research", label: "Research", icon: Globe, desc: "Web scraping & intel" },
  { id: "outreach", label: "Outreach", icon: Send, desc: "AI emails & calls" },
  { id: "proposals", label: "Proposals", icon: FileText, desc: "Send quotes" },
  { id: "analytics", label: "Analytics", icon: BarChart3, desc: "Performance" },
  { id: "workflows", label: "AI Workflows", icon: Bot, desc: "Automations" },
  { id: "settings", label: "Settings", icon: Settings, desc: "Account" },
];

export default function MobileNav({ activeView, onViewChange }) {
  return (
    <div className="h-full bg-background overflow-y-auto p-5 safe-top">
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-9 h-9 object-contain" />
          <div>
            <div className="text-base font-bold metallic-gold tracking-wider">XPS INTELLIGENCE</div>
            <div className="text-[11px] text-muted-foreground">Command Center</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]",
                isActive
                  ? "bg-primary/10 border-primary/25"
                  : "bg-card border-border active:bg-secondary"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                isActive ? "bg-primary/15" : "bg-secondary"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-left">
                <div className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {item.label}
                </div>
                <div className="text-[11px] text-muted-foreground">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}