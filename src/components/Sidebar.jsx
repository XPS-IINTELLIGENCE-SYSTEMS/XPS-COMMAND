import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavIcon from "./shared/NavIcon";
import { ChevronRight } from "lucide-react";

const phases = [
  { id: "start_here", label: "Start Here", num: null, desc: "Get set up in minutes" },
  { id: "command", label: "Dashboard", num: null, desc: "Pipeline & metrics" },
  { id: "crm", label: "CRM Pipeline", num: null, desc: "Manage all leads" },
  { id: "analytics", label: "Analytics", num: null, desc: "Charts & revenue" },
  { id: "find_work", label: "Discover", num: "1", desc: "Signal-based prospecting" },
  { id: "get_work", label: "Engage", num: "2", desc: "Outreach & comms" },
  { id: "win_work", label: "Close", num: "3", desc: "Proposals & closing" },
  { id: "do_work", label: "Execute", num: "4", desc: "Jobs & execution" },
  { id: "get_paid", label: "Collect", num: "5", desc: "Invoice & collect" },
  { id: "tips", label: "Tips & Tricks", num: null, desc: "Pro knowledge" },
];

const utilityNav = [
  { id: "agents", label: "Agent Command" },
  { id: "settings", label: "Settings" },
];

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <div className="w-full h-full bg-sidebar border-r border-sidebar-border flex flex-col">
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
            <div className="relative">
              {/* Zig-zag connecting line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary/30 via-white/10 to-primary/30 pointer-events-none" />

              <div className="space-y-1 relative">
                {phases.map((item, idx) => {
                  const isActive = activeView === item.id;
                  const isNumbered = !!item.num;
                  const isOdd = isNumbered && parseInt(item.num) % 2 === 1;
                  const isEven = isNumbered && parseInt(item.num) % 2 === 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={cn(
                        "shimmer-card w-full flex items-center gap-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/10 border border-primary/25 text-primary"
                          : "text-foreground/60 hover:text-foreground hover:bg-secondary/50 border border-transparent",
                        isOdd ? "ml-0 mr-3 pr-2 pl-2 py-2" : "",
                        isEven ? "ml-3 mr-0 pl-2 pr-2 py-2" : "",
                        !isNumbered ? "px-2.5 py-2" : ""
                      )}
                    >
                      {/* Step dot on the line */}
                      <div className="relative flex-shrink-0">
                        <NavIcon id={item.id} size="sm" active={isActive} />
                        {isNumbered && (
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
                        <div className={cn("text-[9px] truncate", isActive ? "text-primary/60" : "text-muted-foreground/50")}>{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
              System
            </div>
            <div className="space-y-0.5">
              {utilityNav.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "shimmer-card w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <NavIcon id={item.id} size="sm" active={isActive} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}