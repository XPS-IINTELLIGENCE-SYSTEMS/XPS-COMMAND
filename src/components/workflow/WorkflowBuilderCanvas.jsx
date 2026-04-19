import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Settings, Zap, Plus, Sparkles, Bot, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NODE_REGISTRY, { AI_RECOMMENDATIONS } from "./workflowNodeRegistry";
import WorkflowNodeConfigPanel from "./WorkflowNodeConfigPanel";

const allNodeDefs = NODE_REGISTRY.flatMap(c => c.nodes.map(n => ({ ...n, catColor: c.color, category: c.category })));

export default function WorkflowBuilderCanvas({ nodes, setNodes, onAddNodeClick }) {
  const [configNodeId, setConfigNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(nodes);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setNodes(items);
  };

  const removeNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (configNodeId === id) setConfigNodeId(null);
  };

  const updateNode = (id, data) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...data } : n));
  };

  const configNode = nodes.find(n => n.id === configNodeId);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-secondary/30 border border-dashed border-border flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-base font-bold text-foreground mb-1">Start Building Your Workflow</p>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              Add nodes from the palette on the left. Each node is an action, condition, or integration step.
            </p>
            <Button variant="outline" onClick={onAddNodeClick} className="gap-2">
              <Plus className="w-4 h-4" /> Add First Step
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* ── TRIGGER node ── */}
            <div className="flex items-center gap-4 mb-0">
              <div className="flex flex-col items-center w-14 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500/15 border-2 border-green-500/50 flex items-center justify-center">
                  <Play className="w-4 h-4 text-green-400 ml-0.5" />
                </div>
                {/* Line down */}
                <div className="w-0.5 h-8 bg-gradient-to-b from-green-500/50 to-border" />
              </div>
              <div className="pb-8">
                <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-0.5">Trigger</div>
                <div className="text-sm text-muted-foreground">Workflow starts here</div>
              </div>
            </div>

            {/* ── STEPS ── */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="workflow-canvas">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {nodes.map((node, index) => {
                      const def = allNodeDefs.find(d => d.type === node.type) || {};
                      const Icon = def.icon || Zap;
                      const rec = AI_RECOMMENDATIONS[node.type];
                      const isHovered = hoveredNodeId === node.id;
                      const isLast = index === nodes.length - 1;
                      const stepNum = index + 1;

                      return (
                        <Draggable key={node.id} draggableId={node.id} index={index}>
                          {(prov, snapshot) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} className="flex gap-4">
                              {/* Left rail: step number + connecting line */}
                              <div className="flex flex-col items-center w-14 flex-shrink-0">
                                {/* Step circle */}
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all flex-shrink-0",
                                    snapshot.isDragging
                                      ? "border-primary bg-primary/20 text-primary"
                                      : configNodeId === node.id
                                      ? "border-primary/60 bg-primary/10 text-primary"
                                      : "border-border bg-card text-muted-foreground"
                                  )}
                                >
                                  {stepNum}
                                </div>
                                {/* Connecting line */}
                                {!isLast && (
                                  <div className="w-0.5 flex-1 min-h-[24px] bg-border" />
                                )}
                              </div>

                              {/* Step card */}
                              <div
                                className="flex-1 pb-6"
                                onMouseEnter={() => setHoveredNodeId(node.id)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                              >
                                {/* Step label above card */}
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                                  Step {stepNum}
                                </div>

                                <div
                                  className={cn(
                                    "relative group rounded-xl border transition-all",
                                    snapshot.isDragging
                                      ? "border-primary shadow-lg shadow-primary/10 bg-card"
                                      : configNodeId === node.id
                                      ? "border-primary/40 bg-card"
                                      : "border-border bg-card/80 hover:border-white/15"
                                  )}
                                >
                                  {/* Main row */}
                                  <div className="flex items-center gap-3 p-4">
                                    <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex-shrink-0">
                                      <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div
                                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                      style={{ backgroundColor: `${def.catColor || "#6b7280"}15` }}
                                    >
                                      <Icon className="w-5 h-5" style={{ color: def.catColor || "#6b7280" }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-bold text-foreground truncate">
                                        {node.label || def.label || node.type}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                                        {node.agent ? (
                                          <span className="flex items-center gap-1">
                                            <Bot className="w-3 h-3" />
                                            {node.agent}
                                          </span>
                                        ) : (
                                          def.desc || ""
                                        )}
                                      </div>
                                    </div>

                                    {/* On-error badge */}
                                    {node.on_error && node.on_error !== "continue" && (
                                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium flex-shrink-0">
                                        on error: {node.on_error}
                                      </span>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                      <button onClick={() => setConfigNodeId(configNodeId === node.id ? null : node.id)} className="p-1.5 rounded-md hover:bg-secondary">
                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                      </button>
                                      <button onClick={() => removeNode(node.id)} className="p-1.5 rounded-md hover:bg-destructive/20">
                                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* AI tip on hover */}
                                  {isHovered && rec && !snapshot.isDragging && (
                                    <div className="mx-4 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Tip</span>
                                      </div>
                                      <p className="text-xs text-foreground/70 leading-relaxed">{rec}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* ── ADD STEP button ── */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center w-14 flex-shrink-0">
                <div className="w-0.5 h-4 bg-border" />
                <button
                  onClick={onAddNodeClick}
                  className="w-10 h-10 rounded-full border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors group"
                >
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </button>
                <div className="w-0.5 h-4 bg-border" />
              </div>
              <div>
                <button onClick={onAddNodeClick} className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                  + Add next step
                </button>
              </div>
            </div>

            {/* ── END node ── */}
            <div className="flex items-center gap-4 mt-0">
              <div className="flex flex-col items-center w-14 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center">
                  <Square className="w-3.5 h-3.5 text-red-400" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">End</div>
                <div className="text-sm text-muted-foreground">Workflow complete</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Config panel */}
      {configNode && (
        <WorkflowNodeConfigPanel
          node={configNode}
          onUpdate={(data) => updateNode(configNode.id, data)}
          onClose={() => setConfigNodeId(null)}
        />
      )}
    </div>
  );
}