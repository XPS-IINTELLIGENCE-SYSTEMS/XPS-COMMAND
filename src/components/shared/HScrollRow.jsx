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
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {count !== undefined && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/[0.08] text-muted-foreground">{count}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {subtitle && <span className="text-[10px] text-muted-foreground mr-2 hidden md:block">{subtitle}</span>}
          <button onClick={() => scroll(-1)} className="p-1.5 rounded-lg bg-black/40 border border-white/[0.08] hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => scroll(1)} className="p-1.5 rounded-lg bg-black/40 border border-white/[0.08] hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {indexedChildren}
      </div>
    </div>
  );
}