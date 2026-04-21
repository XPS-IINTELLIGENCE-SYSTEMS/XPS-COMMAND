import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, Search, Clock, GitBranch, Copy, Play, Loader2,
  ChevronDown, ChevronRight, Share2, Link2, Pencil, Check,
  DollarSign, Target, Zap, BarChart3, Building2, Shield,
  Users, Globe, CalendarDays, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import WORKFLOW_TEMPLATES_50 from "./WorkflowTemplates50";

const CATEGORIES = [
  { id: "all", label: "All", icon: Zap, color: "#d4af37" },
  { id: "Lead Gen", label: "Lead Gen", icon: Target, color: "#d4af37" },
  { id: "Sales", label: "Sales", icon: DollarSign, color: "#ec4899" },
  { id: "Bidding", label: "Bidding", icon: Building2, color: "#22c55e" },
  { id: "Marketing", label: "Marketing", icon: Globe, color: "#8b5cf6" },
  { id: "SEO", label: "SEO", icon: BarChart3, color: "#22c55e" },
  { id: "Research", label: "Research", icon: Search, color: "#06b6d4" },
  { id: "Operations", label: "Operations", icon: Shield, color: "#f59e0b" },
  { id: "Finance", label: "Finance", icon: DollarSign, color: "#ef4444" },
  { id: "Integrations", label: "Integrations", icon: Link2, color: "#84cc16" },
  { id: "Reporting", label: "Reporting", icon: BarChart3, color: "#f97316" },
];

function TemplateCard({ tpl, index, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const Icon = tpl.icon;

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(tpl);
    setAdding(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/workflow-template/${tpl.id}`);
    toast({ title: "Link copied!", description: `Share link for "${tpl.name}"` });
  };

  return (
    <div className="glass-card rounded-xl p-3 hover:border-white/15 transition-all group">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative" style={{ backgroundColor: `${tpl.color}15` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: tpl.color }} />
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold metallic-gold-bg text-black">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-foreground truncate">{tpl.name}</div>
          <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock className="w-2.5 h-2.5" /> {tpl.trigger}
            <span className="text-white/20">·</span>
            <GitBranch className="w-2.5 h-2.5" /> {tpl.steps.length} steps
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[9px] text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">{tpl.description}</p>

      {/* Projected result */}
      <div className="flex items-start gap-1.5 mt-2 px-2 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
        <DollarSign className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
        <span className="text-[8px] text-green-400/80 leading-relaxed">{tpl.projected_result}</span>
      </div>

      {/* Expandable steps */}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[9px] text-muted-foreground hover:text-foreground transition-colors">
        {expanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
        View steps
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-0.5">
          {tpl.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[8px] text-muted-foreground/60 pl-2">
              <span className="w-3.5 h-3.5 rounded-full bg-secondary flex items-center justify-center text-[7px] font-bold flex-shrink-0">{i + 1}</span>
              {step.label}
            </div>
          ))}
          {tpl.linked_tools && (
            <div className="flex flex-wrap gap-1 mt-1.5 pl-2">
              {tpl.linked_tools.slice(0, 4).map((tool, i) => (
                <span key={i} className="text-[7px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/70">{tool}</span>
              ))}
              {tpl.linked_tools.length > 4 && <span className="text-[7px] text-muted-foreground">+{tpl.linked_tools.length - 4}</span>}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/30">
        <Button size="sm" className="h-6 text-[9px] gap-1 flex-1 metallic-gold-bg text-background" onClick={handleAdd} disabled={adding}>
          {adding ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
          {adding ? "Adding..." : "Add to My Workflows"}
        </Button>
        <button onClick={handleCopyLink} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Copy share link">
          <Share2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function WorkflowTemplateLibrary({ onRefresh }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = WORKFLOW_TEMPLATES_50.filter(tpl => {
    if (filter !== "all" && tpl.category !== filter) return false;
    if (search && !tpl.name.toLowerCase().includes(search.toLowerCase()) && !tpl.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addTemplate = async (tpl) => {
    await base44.entities.Workflow.create({
      name: tpl.name,
      description: tpl.description,
      trigger: tpl.trigger,
      category: tpl.category,
      projected_result: tpl.projected_result,
      schedule: tpl.schedule || "",
      is_template: false,
      linked_tools: JSON.stringify(tpl.linked_tools || []),
      steps: JSON.stringify(tpl.steps),
      status: "Draft",
    });
    toast({ title: "Workflow added!", description: `"${tpl.name}" saved as Draft. Open to customize and activate.` });
    onRefresh?.();
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold metallic-gold">Pre-Built Workflow Library</h3>
        <span className="text-[10px] text-muted-foreground">— {WORKFLOW_TEMPLATES_50.length} automated workflows</span>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 glass-input rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => {
            const CIcon = cat.icon;
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${
                  active ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <CIcon className="w-2.5 h-2.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div className="text-[10px] text-muted-foreground mb-2">
        Showing {filtered.length} of {WORKFLOW_TEMPLATES_50.length} workflows
        {filter !== "all" && <span className="text-primary ml-1">• {filter}</span>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
        {filtered.map((tpl, i) => (
          <TemplateCard key={tpl.id} tpl={tpl} index={WORKFLOW_TEMPLATES_50.indexOf(tpl)} onAdd={addTemplate} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">No workflows match your search.</div>
      )}
    </div>
  );
}