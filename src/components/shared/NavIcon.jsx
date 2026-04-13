import { cn } from "@/lib/utils";
import { getIconColor } from "@/lib/iconColors";
import { Compass, LayoutDashboard, Search, Megaphone, HardHat, DollarSign, Lightbulb, Settings, Zap, Trophy, Users, BarChart3, Bot, Package, Hammer, Phone, Clock, CalendarClock, Shield } from "lucide-react";

const ICON_MAP = {
  start_here: Compass,
  command: LayoutDashboard,
  agent_hub: Zap,
  crm: Users,
  lead_pipeline: Users,
  xpress_leads: Package,
  job_leads: Hammer,
  analytics: BarChart3,
  agents: Bot,
  find_work: Search,
  get_work: Phone,
  follow_up: Clock,
  win_work: Trophy,
  do_work: HardHat,
  get_paid: DollarSign,
  tips: Lightbulb,
  task_scheduler: CalendarClock,
  settings: Settings,
  admin: Shield,
};

/**
 * Proportional nav/section icon.
 * Sizes follow Apple HIG touch-target and optical balance rules:
 *   sm  = sidebar nav items (icon 16px in 28px container)
 *   md  = section headers / list items (icon 18px in 32px container)
 *   lg  = page hero headers (icon 22px in 40px container)
 *   xl  = onboarding hero (icon 28px in 48px container)
 */
const sizes = {
  sm: { container: "w-7 h-7", icon: "w-4 h-4" },
  md: { container: "w-8 h-8", icon: "w-[18px] h-[18px]" },
  lg: { container: "w-10 h-10", icon: "w-[22px] h-[22px]" },
  xl: { container: "w-12 h-12", icon: "w-7 h-7" },
};

export default function NavIcon({ id, size = "md", active = false, className }) {
  const Icon = ICON_MAP[id];
  if (!Icon) return null;
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
        s.container,
        active ? "bg-white/[0.08]" : "bg-secondary/60",
        className
      )}
    >
      <Icon
        className={cn(
          s.icon,
          "transition-colors duration-200",
          !active && "opacity-60"
        )}
        style={{ color: getIconColor(id) }}
      />
    </div>
  );
}