import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavIcon from "./shared/NavIcon";

const phases = [
  { id: "command", label: "Dashboard", num: null, desc: "Pipeline & metrics" },
  { id: "start_here", label: "Start Here", num: null, desc: "Get set up in minutes" },
  { id: "find_work", label: "Discovery", num: "1", desc: "Signal-based prospecting" },
  { id: "xpress_leads", label: "XPress Pipeline", num: null, desc: "Contractor & operator leads" },
  { id: "job_leads", label: "Jobs Pipeline", num: null, desc: "End-buyer project leads" },
  { id: "crm", label: "CRM", num: null, desc: "Pipeline board" },
  { id: "get_work", label: "Contact", num: "2", desc: "Outreach & comms" },
  { id: "win_work", label: "Close", num: "3", desc: "Proposals & closing" },
  { id: "do_work", label: "Execute", num: "4", desc: "Jobs & execution" },
  { id: "get_paid", label: "Collect", num: "5", desc: "Invoice & collect" },
  { id: "analytics", label: "Analytics", num: null, desc: "Charts & revenue" },
  { id: "tips", label: "Tips & Tricks", num: null, desc: "Pro knowledge" },
];

const utilityNav = [
  { id: "agents", label: "Agent Command", desc: "All agents & tools" },
  { id: "settings", label: "Settings", desc: "Account & preferences" },
];

function SidebarButton({ item, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shimmer-card w-full flex items-center gap-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 px-2.5 py-2",
        isActive
          ? "glass-card-active text-primary"
          : "glass-card text-foreground/60 hover:text-foreground"
      )}
    >
      <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
        <NavIcon id={item.id} size="sm" active={isActive} />
        {item.num && (
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black",
            isActive ? "bg-primary text-background" : "bg-secondary border border-white/20 text-white/70"
          )}>
            {item.num}
          </div>
        )}
      </div>
      <div className="text-left min-w-0 flex-1">
        <div className="text-[13px] font-semibold truncate">{item.label}</div>
        {item.desc && (
          <div className={cn("text-[9px] truncate", isActive ? "text-primary/60" : "text-muted-foreground/50")}>{item.desc}</div>
        )}
      </div>
    </button>
  );
}

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <div className="w-full h-full bg-sidebar/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <a href="/dashboard" className="flex items-center gap-2.5 transition-all duration-300 hover:scale-105">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <div className="text-sm font-extrabold xps-gold-slow-shimmer tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>XPS INTELLIGENCE</div>
            <div className="text-[9px] font-semibold metallic-silver tracking-widest">XTREME POLISHING SYSTEMS</div>
          </div>
        </a>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-4 px-3 space-y-6">
          <div>
            <div className="px-2 mb-3 text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
              Workflow
            </div>
            <div className="space-y-1">
              {phases.map((item) => (
                <SidebarButton
                  key={item.id}
                  item={item}
                  isActive={activeView === item.id}
                  onClick={() => onViewChange(item.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
              System
            </div>
            <div className="space-y-1">
              {utilityNav.map((item) => (
                <SidebarButton
                  key={item.id}
                  item={item}
                  isActive={activeView === item.id}
                  onClick={() => onViewChange(item.id)}
                />
              ))}
            </div>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}