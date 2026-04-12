import { cn } from "@/lib/utils";
import { Rocket, LayoutDashboard, Search, Megaphone, HardHat, DollarSign, Lightbulb, Settings, Zap, Trophy } from "lucide-react";

const ICON_MAP = {
  start_here: Rocket,
  command: LayoutDashboard,
  agent_hub: Zap,
  find_work: Search,
  get_work: Megaphone,
  win_work: Trophy,
  do_work: HardHat,
  get_paid: DollarSign,
  tips: Lightbulb,
  settings: Settings,
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
        active ? "bg-primary/15" : "bg-secondary/60",
        className
      )}
    >
      <Icon
        className={cn(
          s.icon,
          "transition-colors duration-200",
          active ? "text-primary" : "metallic-silver-icon"
        )}
      />
    </div>
  );
}