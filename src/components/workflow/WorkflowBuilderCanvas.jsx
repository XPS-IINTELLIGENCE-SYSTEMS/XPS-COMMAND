import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Settings, Zap, Plus, ArrowDown, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NODE_REGISTRY, { AI_RECOMMENDATIONS, AGENT_REGISTRY } from "./workflowNodeRegistry";
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
      {/* Main canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-secondary/30 border border-dashed border-border flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Start Building</p>
            <p className="text-xs text-muted-foreground max-w-xs mb-4">
              Add nodes from the palette to create your automation workflow.
              Each node represents an action, condition, or integration.
            </p>
            <Button variant="outline" size="sm" onClick={onAddNodeClick} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add First Step
            </Button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            {/* START marker */}
            <div className="flex justify-center mb-3">
              <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] text-green-400 font-semibold">
                ● TRIGGER
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="workflow-canvas">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-0">
                    {nodes.map((node, index) => {
                      const def = allNodeDefs.find(d => d.type === node.type) || {};
                      const Icon = def.icon || Zap;
                      const rec = AI_RECOMMENDATIONS[node.type];
                      const isHovered = hoveredNodeId === node.id;

                      return (
                        <Draggable key={node.id} draggableId={node.id} index={index}>
                          {(prov, snapshot) => (
                            <div ref={prov.innerRef} {...prov.draggableProps}>
                              {/* Connection arrow */}
                              {index > 0 && (
                                <div className="flex justify-center py-1">
                                  <ArrowDown className="w-4 h-4 text-border" />
                                </div>
                              )}

                              <div
                                onMouseEnter={() => setHoveredNodeId(node.id)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                className={cn(
                                  "relative group rounded-xl border p-3.5 transition-all",
                                  snapshot.isDragging
                                    ? "border-primary shadow-lg shadow-primary/10 bg-card"
                                    : configNodeId === node.id
                                    ? "border-primary/40 bg-card"
                                    : "border-border bg-card/80 hover:border-white/20"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Drag */}
                                  <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  {/* Icon */}
                                  <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${def.catColor || "#6b7280"}15` }}
                                  >
                                    <Icon className="w-4 h-4" style={{ color: def.catColor || "#6b7280" }} />
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">
                                      {node.label || def.label || node.type}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                      {node.agent ? (
                                        <span className="flex items-center gap-1">
                                          <Bot className="w-2.5 h-2.5" />
                                          {node.agent}
                                        </span>
                                      ) : (
                                        def.desc || ""
                                      )}
                                    </div>
                                  </div>

                                  {/* Step # */}
                                  <div className="text-[9px] font-mono text-muted-foreground bg-secondary rounded px-1.5 py-0.5">
                                    #{index + 1}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setConfigNodeId(configNodeId === node.id ? null : node.id)} className="p-1 rounded hover:bg-secondary">
                                      <Settings className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                    <button onClick={() => removeNode(node.id)} className="p-1 rounded hover:bg-destructive/20">
                                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                    </button>
                                  </div>
                                </div>

                                {/* AI recommendation on hover */}
                                {isHovered && rec && !snapshot.isDragging && (
                                  <div className="mt-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Sparkles className="w-3 h-3 text-primary" />
                                      <span className="text-[8px] font-semibold text-primary uppercase tracking-wider">AI Tip</span>
                                    </div>
                                    <p className="text-[10px] text-foreground/70 leading-relaxed">{rec}</p>
                                  </div>
                                )}
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

            {/* Add node between / at end */}
            <div className="flex justify-center py-2">
              <ArrowDown className="w-4 h-4 text-border" />
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={onAddNodeClick} className="gap-1.5 border-dashed">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </Button>
            </div>

            {/* END marker */}
            <div className="flex justify-center mt-3">
              <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] text-red-400 font-semibold">
                ■ END
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