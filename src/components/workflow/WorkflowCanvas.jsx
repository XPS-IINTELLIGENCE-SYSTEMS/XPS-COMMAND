import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Play, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkflowNodeCard from "./WorkflowNodeCard";
import NodeConfigPanel from "./NodeConfigPanel";

export default function WorkflowCanvas({ nodes, setNodes, agents }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [configNode, setConfigNode] = useState(null);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(nodes);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setNodes(items);
  };

  const removeNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
    if (configNode === id) setConfigNode(null);
  };

  const updateNodeConfig = (id, data) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...data } : n));
  };

  const configNodeData = nodes.find(n => n.id === configNode);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white">{nodes.length} nodes</span>
          <span className="text-[10px] text-muted-foreground">· Drag to reorder</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5">
            <Save className="w-3 h-3" /> Save
          </Button>
          <Button size="sm" className="h-7 text-[10px] gap-1.5 metallic-gold-bg text-background hover:brightness-110">
            <Play className="w-3 h-3" /> Run Workflow
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4">
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-white font-medium mb-1">Build Your Workflow</p>
              <p className="text-[10px] text-muted-foreground max-w-xs">
                Drag nodes from the sidebar to create an AI-orchestrated pipeline. 
                Assign specialty agents to each step.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="workflow">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 max-w-lg mx-auto">
                    {/* Start marker */}
                    <div className="flex items-center justify-center">
                      <div className="px-3 py-1 rounded-full bg-xps-green/20 border border-xps-green/30 text-[10px] text-xps-green font-medium">
                        ● START
                      </div>
                    </div>

                    {nodes.map((node, index) => (
                      <Draggable key={node.id} draggableId={node.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <WorkflowNodeCard
                              node={node}
                              index={index}
                              isSelected={selectedNode === node.id}
                              onSelect={setSelectedNode}
                              onRemove={removeNode}
                              onConfigure={setConfigNode}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* End marker */}
                    <div className="flex items-center justify-center pt-2">
                      <div className="px-3 py-1 rounded-full bg-xps-red/20 border border-xps-red/30 text-[10px] text-xps-red font-medium">
                        ■ END
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Config panel */}
        {configNode && configNodeData && (
          <NodeConfigPanel
            node={configNodeData}
            agents={agents}
            onUpdate={(data) => updateNodeConfig(configNode, data)}
            onClose={() => setConfigNode(null)}
          />
        )}
      </div>
    </div>
  );
}