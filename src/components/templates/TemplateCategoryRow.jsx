import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TemplateCategoryRow({ category, isOpen, onToggle }) {
  const scrollRef = useRef(null);
  const Icon = category.icon;
  const displayTemplates = isOpen ? category.templates : category.templates.slice(0, 8);

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div>
      {/* Category header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-extrabold xps-gold-slow-shimmer tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>{category.title}</h2>
            <p className="text-[11px] text-muted-foreground">{category.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-muted-foreground">{category.templates.length}</span>
          <button onClick={() => scroll(-1)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Template cards - horizontal scroll */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide scroll-smooth">
        {displayTemplates.map((tmpl, idx) => (
          <button
            key={tmpl.name}
            className={cn(
              "group flex-shrink-0 w-[220px] md:w-[260px] rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.03] animated-silver-border",
              idx % 2 === 0
                ? "bg-black/70 backdrop-blur-xl border border-white/[0.08]"
                : "bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12]",
              "hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            )}
          >
            {tmpl.preview && <div className="text-2xl mb-2">{tmpl.preview}</div>}
            <div className="text-sm font-bold text-white">{tmpl.name}</div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{tmpl.desc}</p>
          </button>
        ))}

        {/* Show more / less toggle */}
        {category.templates.length > 8 && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 w-[140px] rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-all"
          >
            <ChevronRight className={cn("w-5 h-5 text-primary transition-transform", isOpen && "rotate-180")} />
            <span className="text-xs font-bold text-primary">
              {isOpen ? "Show less" : `+${category.templates.length - 8} more`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}