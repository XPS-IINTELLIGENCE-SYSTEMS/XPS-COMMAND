import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  GitBranch, Plus, GripVertical, X, Save, Loader2, Play, Square,
  ChevronDown, ChevronRight, Zap, Sparkles, Bot, Settings, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NODE_REGISTRY from "../workflow/workflowNodeRegistry";

const allNodeDefs = NODE_REGISTRY.flatMap(c =>
  c.nodes.map(n => ({ ...n, catColor: c.color, category: c.category }))
);

function NodePalette({ onAdd }) {
  const [expandedCat, setExpandedCat] = useState(null);

  return (
    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
      {NODE_REGISTRY.map((cat) => {
        const CatIcon = cat.icon;
        const open = expandedCat === cat.category;
        return (
          <div key={cat.category}>
            <button
              onClick={() => setExpandedCat(open ? null : cat.category)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <CatIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cat.color }} />
              <span className="text-[11px] font-semibold text-foreground/80 flex-1 text-left truncate">{cat.category}</span>
              <span className="text-[9px] text-muted-foreground">{cat.nodes.length}</span>
              {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </button>
            {open && (
              <div className="ml-2 space-y-0.5 mb-1">
                {cat.nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => onAdd(node)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors group"
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: cat.color }} />
                      <span className="text-[10px] text-foreground/70 group-hover:text-foreground truncate flex-1 text-left">{node.label}</span>
                      <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
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

function StepCard({ node, index, onRemove, dragHandleProps }) {
  const def = allNodeDefs.find(d => d.type === node.type) || {};
  const Icon = def.icon || Zap;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card group transition-all hover:border-white/15">
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${def.catColor || "#6b7280"}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: def.catColor || "#6b7280" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-foreground truncate">{node.label || def.label}</div>
        <div className="text-[9px] text-muted-foreground truncate">{def.desc}</div>
      </div>
      <span className="text-[9px] text-muted-foreground/50 font-bold flex-shrink-0">{index + 1}</span>
      <button onClick={() => onRemove(node.id)} className="p-1 rounded hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

export default function DashboardWorkflowCreator({ onOpenTool }) {
  const [name, setName] = useState("");
  const [nodes, setNodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const addNode = useCallback((nodeDef) => {
    setNodes(prev => [...prev, {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: nodeDef.type,
      label: nodeDef.label,
      agent: "",
      config: {},
      on_error: "continue",
    }]);
    setSaved(false);
  }, []);

  const removeNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setSaved(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(nodes);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setNodes(items);
  };

  const handleSave = async () => {
    if (!name.trim() || nodes.length === 0) return;
    setSaving(true);
    await base44.entities.Workflow.create({
      name: name.trim(),
      description: `Created from dashboard — ${nodes.length} steps`,
      trigger: "Manual",
      status: "Draft",
      steps: JSON.stringify(nodes.map(n => ({
        id: n.id, type: n.type, label: n.label,
        agent: n.agent, config: n.config, on_error: n.on_error,
      }))),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setName("");
      setNodes([]);
      setSaved(false);
    }, 2000);
  };

  const handleReset = () => {
    setName("");
    setNodes([]);
    setSaved(false);
    setShowPalette(false);
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
          placeholder="Workflow name..."
          className="h-8 text-xs bg-secondary/50 border-border/50 flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-[10px] gap-1.5"
          onClick={() => setShowPalette(!showPalette)}
        >
          <Plus className="w-3 h-3" /> {showPalette ? "Hide" : "Add Steps"}
        </Button>
        {nodes.length > 0 && (
          <Button
            size="sm"
            className="h-8 text-[10px] gap-1.5 metallic-gold-bg text-background"
            onClick={handleSave}
            disabled={saving || saved || !name.trim()}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {saving ? "Saving" : saved ? "Saved!" : "Save"}
          </Button>
        )}
      </div>

      {/* Node palette */}
      {showPalette && (
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground">Node Palette</span>
            <span className="text-[9px] text-muted-foreground">— click to add</span>
          </div>
          <NodePalette onAdd={addNode} />
        </div>
      )}

      {/* Canvas: drag & drop steps */}
      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary/30 border border-dashed border-border/50 flex items-center justify-center mb-2">
            <GitBranch className="w-5 h-5 text-muted-foreground/40" />
          </div>
          <p className="text-[11px] font-medium text-foreground/60 mb-1">No steps yet</p>
          <p className="text-[10px] text-muted-foreground">Click "Add Steps" to build your workflow</p>
        </div>
      ) : (
        <div>
          {/* Start marker */}
          <div className="flex items-center gap-2 mb-2 ml-1">
            <div className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/50 flex items-center justify-center">
              <Play className="w-2.5 h-2.5 text-green-400 ml-0.5" />
            </div>
            <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Start</span>
          </div>

          {/* Connecting line + steps */}
          <div className="ml-3.5 border-l border-border/50 pl-4 space-y-1.5">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard-wf-canvas">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                    {nodes.map((node, index) => (
                      <Draggable key={node.id} draggableId={node.id} index={index}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}>
                            <StepCard
                              node={node}
                              index={index}
                              onRemove={removeNode}
                              dragHandleProps={prov.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Add more button inline */}
            <button
              onClick={() => setShowPalette(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.04] text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-3 h-3" /> Add step
            </button>
          </div>

          {/* End marker */}
          <div className="flex items-center gap-2 mt-2 ml-1">
            <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center">
              <Square className="w-2 h-2 text-red-400" />
            </div>
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">End</span>
            <span className="text-[9px] text-muted-foreground ml-1">• {nodes.length} step{nodes.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {/* Footer: open full builder link */}
      <div className="flex items-center justify-between pt-1">
        {nodes.length > 0 && (
          <button onClick={handleReset} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            Clear all
          </button>
        )}
        <button
          onClick={() => onOpenTool?.("workflow_creator")}
          className="text-[10px] text-primary hover:text-primary/80 transition-colors ml-auto"
        >
          Open Full Builder →
        </button>
      </div>
    </div>
  );
}