import { cn } from "@/lib/utils";
import NavIcon from "./shared/NavIcon";

const navItems = [
  { id: "command", label: "Dashboard", sub: "Pipeline & metrics" },
  { id: "crm", label: "CRM Pipeline", sub: "Manage all leads" },
  { id: "analytics", label: "Analytics", sub: "Charts & revenue" },
  { id: "find_work", label: "Find Work", sub: "Signal-based prospecting" },
  { id: "get_work", label: "Get Work", sub: "Outreach & comms" },
  { id: "win_work", label: "Win Work", sub: "Proposals & closing" },
  { id: "do_work", label: "Do Work", sub: "Jobs & execution" },
  { id: "get_paid", label: "Get Paid", sub: "Invoice & collect" },
  { id: "admin", label: "Admin Tools", sub: "Scrapers & command interface" },
  { id: "settings", label: "Settings", sub: "Account & preferences" },
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
              <NavIcon id={item.id} size="lg" active={isActive} />
              <div className="text-left">
                <div className={cn(
                  "text-sm font-semibold",
                  isActive ? "xps-gold-slow-shimmer" : "text-foreground"
                )}>
                  {item.label}
                </div>
                <div className="text-[11px] text-muted-foreground">{item.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}