import { cn } from "@/lib/utils";
import NavIcon from "./shared/NavIcon";

const navItems = [
  { id: "command", label: "Dashboard", sub: "Full workflow overview" },
  { id: "start_here", label: "Start Here", sub: "Get set up" },
  { id: "find_work", label: "Discovery", sub: "Signal-based prospecting" },
  { id: "xpress_leads", label: "XPS XPress Leads", sub: "Contractor & operator leads" },
  { id: "job_leads", label: "Job Leads", sub: "End-buyer project leads" },
  { id: "crm", label: "CRM", sub: "Pipeline board" },
  { id: "get_work", label: "Contact", sub: "Outreach & comms" },
  { id: "win_work", label: "Close", sub: "Proposals & closing" },
  { id: "do_work", label: "Execute", sub: "Jobs & execution" },
  { id: "get_paid", label: "Collect", sub: "Invoice & collect" },
  { id: "analytics", label: "Analytics", sub: "Charts & revenue" },
  { id: "tips", label: "Tips & Tricks", sub: "Pro knowledge" },
  { id: "agents", label: "Agents", sub: "AI agent command" },
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
                "shimmer-card w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]",
                isActive
                  ? "glass-card-active"
                  : "glass-card"
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