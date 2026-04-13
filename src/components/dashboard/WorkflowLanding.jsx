import { LayoutDashboard, Compass, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, CalendarClock, Settings, Users, Shield, Layers } from "lucide-react";
import { getIconColor } from "@/lib/iconColors";

const ITEMS = [
  // Workflow
  { id: "command", label: "Dashboard", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "start_here", label: "Start Here", icon: Compass },
  { id: "find_work", label: "Discovery", icon: Search },
  { id: "xpress_leads", label: "XPress Pipeline", icon: Package },
  { id: "job_leads", label: "Job Pipeline", icon: Hammer },
  { id: "get_work", label: "Contact", icon: Phone },
  { id: "follow_up", label: "Follow-Up", icon: Clock },
  { id: "win_work", label: "Close", icon: Trophy },
  { id: "do_work", label: "Execute", icon: HardHat },
  { id: "get_paid", label: "Collect", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "tips", label: "Tips", icon: Lightbulb },
  { id: "templates", label: "Templates", icon: Layers },
  // System
  { id: "task_scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "admin", label: "Admin", icon: Shield },
];

export default function WorkflowLanding({ onSelect }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 safe-top safe-bottom"
      style={{ background: "rgba(0,0,0,0.25)" }}
    >
      {/* Glassmorphic see-through card with animated border */}
      <div
        className="w-full max-w-2xl rounded-2xl animated-silver-border overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div className="text-center pt-6 pb-3 px-4">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-12 h-12 object-contain mx-auto mb-3"
          />
          <h2
            className="text-xl md:text-2xl font-extrabold xps-gold-slow-shimmer tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            WHERE TO START?
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick your priority — switch anytime
          </p>
        </div>

        {/* Grid of square cards — 3 per row */}
        <div className="grid grid-cols-3 gap-2 px-5 pb-5 max-h-[65vh] overflow-y-auto scrollbar-hide">
          {ITEMS.map(item => {
            const Icon = item.icon;
            const color = getIconColor(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="group rounded-xl flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-300 animated-silver-border hover:scale-105 active:scale-95"
                style={{
                  background: "#000",
                }}
              >
                <div className="shimmer-icon-container w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center transition-all duration-300 group-hover:bg-white/[0.1] group-hover:border-white/[0.2] group-hover:shadow-[0_0_16px_rgba(212,175,55,0.2)]">
                  <Icon
                    className="w-7 h-7 md:w-8 md:h-8 shimmer-icon transition-transform duration-300 group-hover:scale-110"
                    style={{ color }}
                  />
                </div>
                <span className="text-sm md:text-base font-bold text-white/80 group-hover:text-white transition-colors leading-tight text-center px-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Skip */}
        <div className="text-center pb-4">
          <button
            onClick={() => onSelect("command")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Skip to Command Center
          </button>
        </div>
      </div>
    </div>
  );
}