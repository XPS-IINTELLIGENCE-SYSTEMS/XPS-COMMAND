import { cn } from "@/lib/utils";

/**
 * Unified card — THE ONLY card style in the app.
 * Even index (0,2,4) = solid black card
 * Odd index (1,3,5) = clear glassmorphic card
 * ALL get animated silver border. NO BROWN. NO GOLD BACKGROUNDS.
 */
export default function HCard({ title, subtitle, meta, icon: Icon, onClick, children, index = 0 }) {
  const isGlass = index % 2 === 1;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-[260px] md:w-[280px] rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.03] animated-silver-border",
        isGlass
          ? "bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12]"
          : "bg-black/70 backdrop-blur-xl border border-white/[0.08]",
        "hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]",
        "hover:bg-white/[0.08]"
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
            "bg-white/[0.06] border border-white/[0.08]",
            "group-hover:bg-white/[0.12] group-hover:border-white/[0.2] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]"
          )}>
            <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-foreground truncate group-hover:text-white transition-colors duration-300">{title}</div>
          {subtitle && <div className="text-sm text-muted-foreground truncate mt-1">{subtitle}</div>}
          {meta && <div className="text-sm font-bold text-primary mt-1.5">{meta}</div>}
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </button>
  );
}