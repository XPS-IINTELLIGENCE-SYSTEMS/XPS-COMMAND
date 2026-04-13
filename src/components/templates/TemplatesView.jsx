import { useState } from "react";
import { Search, ChevronRight, ChevronLeft, Palette, Type, Bot, Zap, Link2, Layout, FileText, Phone, Mail, BarChart3, Globe, Briefcase, Lightbulb, MonitorSmartphone, Users, DollarSign, Layers, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NavIcon from "../shared/NavIcon";
import TemplateCategoryRow from "./TemplateCategoryRow";
import { TEMPLATE_CATEGORIES } from "./templateData";

export default function TemplatesView() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredCategories = TEMPLATE_CATEGORIES.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.desc.toLowerCase().includes(q) ||
      cat.templates.some((t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 space-y-12">
        {/* Hero */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-white">TEMPLATES · LIBRARY</span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            XPS TEMPLATES
          </h1>
          <p className="mt-2 text-xs text-white/40 max-w-xl mx-auto">
            Ready-to-use templates for every stage of your business — agents, workflows, proposals, themes, and more
          </p>
          <div className="mt-4 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-white/[0.04] border-white/[0.1] rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Category rows */}
        {filteredCategories.map((cat) => (
          <TemplateCategoryRow
            key={cat.id}
            category={cat}
            isOpen={activeCategory === cat.id}
            onToggle={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
          />
        ))}
      </div>
    </div>
  );
}