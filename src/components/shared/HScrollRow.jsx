import { useRef, Children, cloneElement } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HScrollRow({ title, subtitle, icon: Icon, count, children }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
    }
  };

  // Auto-inject index into HCard children for alternating styles
  const indexedChildren = Children.map(children, (child, i) => {
    if (child && child.props && child.type?.name === "HCard") {
      return cloneElement(child, { index: i });
    }
    // For non-HCard children (like EmptyCard), pass through
    return child;
  });

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>{title}</h3>
          {count !== undefined && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-muted-foreground">{count}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {subtitle && <span className="text-xs text-white/70 mr-2 hidden md:block">{subtitle}</span>}
          <button onClick={() => scroll(-1)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {indexedChildren}
      </div>
    </div>
  );
}