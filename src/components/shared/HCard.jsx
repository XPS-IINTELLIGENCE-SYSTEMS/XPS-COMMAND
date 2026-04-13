import { cn } from "@/lib/utils";

/**
 * Unified card — THE ONLY card style in the app.
 * Even index (0,2,4) = solid black card
 * Odd index (1,3,5) = clear glassmorphic card
 * Hover = deep vibrant glow (same for both)
 */
export default function HCard({ title, subtitle, meta, icon: Icon, onClick, children, index = 0 }) {
  const isGlass = index % 2 === 1;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-[240px] md:w-[260px] rounded-xl p-4 text-left transition-all duration-300 hover:scale-[1.03]",
        isGlass
          ? "bg-white/[0.04] backdrop-blur-xl border border-white/[0.10]"
          : "bg-black/80 border border-white/[0.06]",
        "hover:border-primary/40 hover:shadow-[0_0_28px_rgba(212,175,55,0.18),0_0_8px_rgba(192,192,192,0.12)]",
        "hover:bg-primary/[0.08]"
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
            isGlass ? "bg-white/[0.06]" : "bg-white/[0.04]",
            "group-hover:bg-primary/20 group-hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]"
          )}>
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">{title}</div>
          {subtitle && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</div>}
          {meta && <div className="text-[10px] font-bold text-primary mt-1">{meta}</div>}
        </div>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </button>
  );
}