import { 
  Zap, Search, MessageSquare, Trophy, DollarSign, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "command", label: "Command Center", icon: Zap, desc: "AI daily briefing" },
  { id: "find_work", label: "1. Find Work", icon: Search, desc: "Lead gen & prospecting" },
  { id: "get_work", label: "2. Get Work", icon: MessageSquare, desc: "Outreach & communication" },
  { id: "win_work", label: "3. Win Work", icon: Trophy, desc: "Bids, proposals & closing" },
  { id: "get_paid", label: "4. Get Paid", icon: DollarSign, desc: "Invoicing & collections" },
  { id: "settings", label: "Settings", icon: Settings, desc: "Account & integrations" },
];

export default function MobileNav({ activeView, onViewChange }) {
  return (
    <div className="h-full bg-background overflow-y-auto p-5 safe-top">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-base font-extrabold xps-gold-slow-shimmer tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>XPS INTELLIGENCE</div>
            <div className="text-[10px] font-semibold metallic-silver tracking-widest">CONTRACTOR ASSIST</div>
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
                "shimmer-card w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]",
                isActive
                  ? "bg-primary/10 border-primary/25"
                  : "bg-card border-border active:bg-secondary"
              )}
            >
              <div className={cn(
                "shimmer-icon-container w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                isActive ? "bg-primary/15" : "bg-secondary"
              )}>
                <Icon className={cn("w-5 h-5 shimmer-icon", isActive ? "metallic-gold-icon" : "metallic-silver-icon")} />
              </div>
              <div className="text-left">
                <div className={cn(
                  "text-sm font-semibold",
                  isActive ? "xps-gold-slow-shimmer" : "text-foreground"
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