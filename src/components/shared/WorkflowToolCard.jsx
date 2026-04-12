import { cn } from "@/lib/utils";

export default function WorkflowToolCard({ num, label, Icon, description, statusBadge, zigzag = "none" }) {
  const isLeft = zigzag === "left";
  const isRight = zigzag === "right";

  return (
    <div className={cn(
      "shimmer-card group relative rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]",
      isLeft && "md:mr-16",
      isRight && "md:ml-16"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02] pointer-events-none" />
      <div className={cn(
        "relative p-5 md:p-6 flex items-start gap-4",
        isRight && "md:flex-row-reverse md:text-right"
      )}>
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-primary/30 transition-colors">
          <Icon className="w-6 h-6 md:w-7 md:h-7 metallic-silver-icon group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("flex items-center gap-2 mb-1.5", isRight && "md:justify-end")}>
            <span className="text-[10px] font-mono font-bold text-primary/80">{num}</span>
            <span className="text-sm md:text-base font-semibold text-white">{label}</span>
            {statusBadge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{statusBadge}</span>
            )}
          </div>
          <p className="text-xs md:text-sm text-white/70 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}