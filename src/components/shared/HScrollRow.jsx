import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HScrollRow({ title, subtitle, icon: Icon, count, children, accentColor }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={cn("w-4 h-4", accentColor || "text-primary")} />}
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {count !== undefined && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{count}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {subtitle && <span className="text-[10px] text-muted-foreground mr-2 hidden md:block">{subtitle}</span>}
          <button onClick={() => scroll(-1)} className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {children}
      </div>
    </div>
  );
}