import { cn } from "@/lib/utils";

export default function HCard({ title, subtitle, meta, icon: Icon, accentColor, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-[240px] md:w-[260px] rounded-xl p-4 text-left transition-all duration-300",
        "bg-white/[0.03] backdrop-blur-md border border-white/[0.08]",
        "hover:bg-white/[0.08] hover:border-white/[0.18] hover:shadow-[0_0_24px_rgba(212,175,55,0.12)]",
        "hover:scale-[1.02]"
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300",
            "bg-white/[0.06] group-hover:bg-primary/20"
          )}>
            <Icon className={cn("w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors", accentColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{title}</div>
          {subtitle && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</div>}
          {meta && <div className="text-[10px] font-bold text-primary mt-1">{meta}</div>}
        </div>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </button>
  );
}