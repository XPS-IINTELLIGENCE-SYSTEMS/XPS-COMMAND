import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import LeadCard from "./LeadCard";

const ROW_COLORS = {
  Incoming: "border-l-blue-400",
  Validated: "border-l-cyan-400",
  Prioritized: "border-l-primary",
  Qualified: "border-l-emerald-400",
};

export default function PipelineRow({ title, subtitle, leads, colorKey, onLeadClick }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className={cn("border-l-4 rounded-r-2xl p-4 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border", ROW_COLORS[colorKey] || "border-l-white/20")}>
      {/* Row header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-muted-foreground">{leads.length}</span>
          <div className="flex gap-1">
            <button onClick={() => scroll(-1)} disabled={!canScrollLeft} className={cn("p-1.5 rounded-lg transition-all", canScrollLeft ? "hover:bg-white/10 text-foreground" : "text-muted-foreground/30 cursor-default")}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} disabled={!canScrollRight} className={cn("p-1.5 rounded-lg transition-all", canScrollRight ? "hover:bg-white/10 text-foreground" : "text-muted-foreground/30 cursor-default")}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {leads.length === 0 ? (
          <div className="flex-shrink-0 w-64 h-52 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-sm text-muted-foreground/50">
            No leads yet
          </div>
        ) : (
          leads.map((lead, i) => (
            <div key={lead.id} style={{ scrollSnapAlign: "start" }}>
              <LeadCard lead={lead} index={i} onClick={onLeadClick} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}