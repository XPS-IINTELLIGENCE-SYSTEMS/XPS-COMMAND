import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavIcon from "./shared/NavIcon";

const phases = [
  { id: "start_here", label: "Start Here", num: null },
  { id: "command", label: "Dashboard", num: null },
  { id: "agent_hub", label: "Agent Hub", num: null },
  { id: "find_work", label: "Find Work", num: "1" },
  { id: "get_work", label: "Get Work", num: "2" },
  { id: "win_work", label: "Win Work", num: "3" },
  { id: "do_work", label: "Do Work", num: "4" },
  { id: "get_paid", label: "Get Paid", num: "5" },
  { id: "tips", label: "Tips & Tricks", num: null },
];

const utilityNav = [
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
            <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">
              Workflow
            </div>
            <div className="space-y-0.5">
              {phases.map((item) => {
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
                    {item.num && (
                      <span className={cn("text-[10px] font-bold font-mono w-4", isActive ? "text-primary" : "text-muted-foreground")}>{item.num}</span>
                    )}
                    {item.label}
                  </button>
                );
              })}
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