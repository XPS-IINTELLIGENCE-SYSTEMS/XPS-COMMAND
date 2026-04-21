import { useState, useCallback, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  GitBranch, Plus, X, Save, Loader2, Play, Square,
  Zap, Sparkles, Check, ChevronDown, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NODE_REGISTRY from "../workflow/workflowNodeRegistry";
import WorkflowAutoBuilder from "./WorkflowAutoBuilder";

const allNodeDefs = NODE_REGISTRY.flatMap(c =>
  c.nodes.map(n => ({ ...n, catColor: c.color, category: c.category }))
);

/* ── Horizontal step card ── */
function HStepCard({ node, index, onRemove }) {
  const def = allNodeDefs.find(d => d.type === node.type) || {};
  const Icon = def.icon || Zap;
  return (
    <div className="relative flex-shrink-0 w-[100px] group">
      <div className="glass-card rounded-xl p-2 flex flex-col items-center text-center gap-1 h-full hover:border-white/15 transition-all">
        <button onClick={() => onRemove(node.id)} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <X className="w-2.5 h-2.5" />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${def.catColor || "#6b7280"}15` }}>
          <Icon className="w-4 h-4" style={{ color: def.catColor || "#6b7280" }} />
        </div>
        <span className="text-[9px] font-bold text-foreground leading-tight line-clamp-2">{node.label || def.label}</span>
        <span className="text-[8px] text-muted-foreground/60">Step {index + 1}</span>
      </div>
    </div>
  );
}

/* ── Inline "+" insert button ── */
function InsertButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-6 h-6 rounded-full border border-dashed border-primary/40 hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all self-center"
    >
      <Plus className="w-3 h-3 text-primary/60 hover:text-primary" />
    </button>
  );
}

/* ── Compact node palette (popover-style) ── */
function MiniPalette({ onAdd, onClose }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 top-full mt-1 left-0 w-[220px] glass-card rounded-xl p-2 shadow-2xl max-h-[260px] overflow-y-auto">
      {NODE_REGISTRY.map((cat) => {
        const CatIcon = cat.icon;
        const open = expandedCat === cat.category;
        return (
          <div key={cat.category}>
            <button onClick={() => setExpandedCat(open ? null : cat.category)} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              <CatIcon className="w-3 h-3 flex-shrink-0" style={{ color: cat.color }} />
              <span className="text-[10px] font-semibold text-foreground/80 flex-1 text-left truncate">{cat.category}</span>
              {open ? <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" /> : <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />}
            </button>
            {open && (
              <div className="ml-2 mb-1 space-y-0.5">
                {cat.nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button key={node.type} onClick={() => { onAdd(node); onClose(); }} className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.06] transition-colors group">
                      <Icon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: cat.color }} />
                      <span className="text-[9px] text-foreground/70 group-hover:text-foreground truncate flex-1 text-left">{node.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardWorkflowCreator({ onOpenTool }) {
  const [name, setName] = useState("");
  const [nodes, setNodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paletteInsertIdx, setPaletteInsertIdx] = useState(null); // index to insert at, or "end"
  const [showAutoBuilder, setShowAutoBuilder] = useState(false);
  const scrollRef = useRef(null);

  const addNodeAt = useCallback((nodeDef, insertIdx) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: nodeDef.type,
      label: nodeDef.label,
      agent: "",
      config: {},
      on_error: "continue",
    };
    setNodes(prev => {
      if (insertIdx === "end" || insertIdx >= prev.length) return [...prev, newNode];
      const copy = [...prev];
      copy.splice(insertIdx, 0, newNode);
      return copy;
    });
    setSaved(false);
  }, []);

  const removeNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!name.trim() || nodes.length === 0) return;
    setSaving(true);
    await base44.entities.Workflow.create({
      name: name.trim(),
      description: `Created from dashboard — ${nodes.length} steps`,
      trigger: "Manual",
      status: "Draft",
      steps: JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, label: n.label, agent: n.agent, config: n.config, on_error: n.on_error }))),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setName(""); setNodes([]); setSaved(false); }, 2000);
  };

  const handleAutoBuilderResult = (builtNodes) => {
    setNodes(builtNodes);
    setShowAutoBuilder(false);
    setSaved(false);
  };

  // Scroll to end when nodes added
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [nodes.length]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
          placeholder="Workflow name..."
          className="h-8 text-xs bg-secondary/50 border-border/50 flex-1 min-w-[140px]"
        />
        <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1.5" onClick={() => setShowAutoBuilder(!showAutoBuilder)}>
          <Sparkles className="w-3 h-3 text-primary" /> {showAutoBuilder ? "Manual" : "Auto Build"}
        </Button>
        {nodes.length > 0 && (
          <>
            <Button size="sm" variant="ghost" className="h-8 text-[10px] text-muted-foreground" onClick={() => { setNodes([]); setSaved(false); }}>
              Clear
            </Button>
            <Button size="sm" className="h-8 text-[10px] gap-1.5 metallic-gold-bg text-background" onClick={handleSave} disabled={saving || saved || !name.trim()}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saving ? "Saving" : saved ? "Saved!" : "Save"}
            </Button>
          </>
        )}
      </div>

      {/* Auto Builder */}
      {showAutoBuilder && (
        <WorkflowAutoBuilder onResult={handleAutoBuilderResult} onCancel={() => setShowAutoBuilder(false)} />
      )}

      {/* Horizontal workflow canvas */}
      {!showAutoBuilder && (
        <div className="relative">
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center py-8 border border-dashed border-border/40 rounded-xl">
              <div className="relative">
                <button
                  onClick={() => setPaletteInsertIdx("end")}
                  className="flex flex-col items-center gap-2 text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/30 border border-dashed border-primary/30 group-hover:border-primary flex items-center justify-center transition-all">
                    <Plus className="w-5 h-5 text-primary/40 group-hover:text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground">Add first step</span>
                </button>
                {paletteInsertIdx === "end" && nodes.length === 0 && (
                  <MiniPalette onAdd={(n) => addNodeAt(n, "end")} onClose={() => setPaletteInsertIdx(null)} />
                )}
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="flex items-center gap-0 overflow-x-auto pb-2 scrollbar-hide">
              {/* Start pill */}
              <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 mr-1">
                <Play className="w-2.5 h-2.5 text-green-400" />
                <span className="text-[8px] font-bold text-green-400 uppercase tracking-wider">Start</span>
              </div>

              {/* Steps with + buttons between them */}
              {nodes.map((node, idx) => (
                <div key={node.id} className="flex items-center">
                  {/* + before this step */}
                  <div className="relative">
                    <InsertButton onClick={() => setPaletteInsertIdx(idx)} />
                    {paletteInsertIdx === idx && (
                      <MiniPalette onAdd={(n) => addNodeAt(n, idx)} onClose={() => setPaletteInsertIdx(null)} />
                    )}
                  </div>
                  {/* Arrow line */}
                  <div className="w-3 h-px bg-border/60 flex-shrink-0" />
                  <HStepCard node={node} index={idx} onRemove={removeNode} />
                  <div className="w-3 h-px bg-border/60 flex-shrink-0" />
                </div>
              ))}

              {/* + at the end */}
              <div className="relative flex-shrink-0">
                <InsertButton onClick={() => setPaletteInsertIdx("end")} />
                {paletteInsertIdx === "end" && nodes.length > 0 && (
                  <MiniPalette onAdd={(n) => addNodeAt(n, "end")} onClose={() => setPaletteInsertIdx(null)} />
                )}
              </div>

              {/* Connector line to End */}
              <div className="w-3 h-px bg-border/60 flex-shrink-0" />

              {/* End pill */}
              <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 ml-1">
                <Square className="w-2 h-2 text-red-400" />
                <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider">End</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {nodes.length > 0 && <span className="text-[9px] text-muted-foreground">{nodes.length} step{nodes.length !== 1 ? "s" : ""}</span>}
        <button onClick={() => onOpenTool?.("workflow_creator")} className="text-[10px] text-primary hover:text-primary/80 transition-colors ml-auto">
          Open Full Builder →
        </button>
      </div>
    </div>
  );
}