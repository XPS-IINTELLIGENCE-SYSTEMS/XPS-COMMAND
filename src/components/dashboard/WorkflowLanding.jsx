import { LayoutDashboard, Compass, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, CalendarClock, Settings, Users, Shield, Layers } from "lucide-react";
import { getIconColor } from "@/lib/iconColors";

const ITEMS = [
  { id: "command", label: "Dashboard", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "start_here", label: "Start Here", icon: Compass },
  { id: "find_work", label: "Discovery", icon: Search },
  { id: "xpress_leads", label: "XPress", icon: Package },
  { id: "job_leads", label: "Jobs", icon: Hammer },
  { id: "get_work", label: "Contact", icon: Phone },
  { id: "follow_up", label: "Follow-Up", icon: Clock },
  { id: "win_work", label: "Close", icon: Trophy },
  { id: "do_work", label: "Execute", icon: HardHat },
  { id: "get_paid", label: "Collect", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "tips", label: "Tips", icon: Lightbulb },
  { id: "templates", label: "Templates", icon: Layers },
  { id: "task_scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "admin", label: "Admin", icon: Shield },
];

export default function WorkflowLanding({ onSelect }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 safe-top safe-bottom">
      {/* See-through card with animated border */}
      <div
        className="w-full max-w-lg rounded-2xl animated-silver-border overflow-hidden"
        style={{
          background: "rgba(10, 10, 14, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div className="text-center pt-6 pb-4 px-4">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS"
            className="w-10 h-10 object-contain mx-auto mb-3"
          />
          <h2
            className="text-lg md:text-xl font-extrabold xps-gold-slow-shimmer tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            WHERE TO START?
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Pick your priority — switch anytime
          </p>
        </div>

        {/* Grid of square cards — 3 per row */}
        <div className="grid grid-cols-3 gap-2.5 px-4 pb-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {ITEMS.map(item => {
            const Icon = item.icon;
            const color = getIconColor(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="group aspect-square rounded-xl bg-black border border-white/[0.08] flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:border-white/[0.25] hover:bg-white/[0.06] active:scale-95"
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color }} />
                <span className="text-[10px] font-semibold text-white/80 group-hover:text-white transition-colors leading-tight text-center px-1">
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
            className="text-[10px] text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Skip to Command Center
          </button>
        </div>
      </div>
    </div>
  );
}