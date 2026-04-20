import { useState } from "react";
import { Search, GripVertical } from "lucide-react";
import WIDGET_REGISTRY, { WIDGET_CATEGORIES } from "./WidgetRegistry";

export default function WidgetPalette({ onAddWidget }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = WIDGET_REGISTRY.filter(w => {
    const matchSearch = !search || w.label.toLowerCase().includes(search.toLowerCase()) || w.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || w.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search widgets..."
          className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {["All", ...WIDGET_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
              activeCategory === cat ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map(widget => {
          const Icon = widget.icon;
          return (
            <button
              key={widget.id}
              onClick={() => onAddWidget(widget)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-border transition-all group text-left"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground" />
              <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">{widget.label}</p>
                <p className="text-[9px] text-muted-foreground truncate">{widget.desc}</p>
              </div>
              <span className="text-[9px] text-muted-foreground/60 bg-background px-1.5 py-0.5 rounded">{widget.category}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-[11px] text-muted-foreground py-6">No widgets found</p>
        )}
      </div>
    </div>
  );
}