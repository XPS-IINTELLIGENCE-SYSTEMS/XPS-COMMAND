import { useState, useRef } from "react";
import { Trash2, Play, Save, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkflowCanvas({ workflow, onUpdate, onDelete }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragging, setDragging] = useState(null);

  const handleAddNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      title: type.replace(/_/g, " "),
      x: 50,
      y: 50 + (workflow.nodes?.length || 0) * 100,
      config: {},
    };
    onUpdate({ ...workflow, nodes: [...(workflow.nodes || []), newNode] });
  };

  const handleDragStart = (e, nodeId) => {
    setDragging({ nodeId, startX: e.clientX, startY: e.clientY });
  };

  const handleDragMove = (e) => {
    if (!dragging || !canvasRef.current) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;
    const updated = workflow.nodes.map(n =>
      n.id === dragging.nodeId ? { ...n, x: n.x + dx, y: n.y + dy } : n
    );
    onUpdate({ ...workflow, nodes: updated });
    setDragging({ ...dragging, startX: e.clientX, startY: e.clientY });
  };

  const handleDragEnd = () => setDragging(null);

  const handleDeleteNode = (nodeId) => {
    onUpdate({
      ...workflow,
      nodes: workflow.nodes.filter(n => n.id !== nodeId),
    });
    setSelectedNode(null);
  };

  const handleConnectNodes = (fromId, toId) => {
    const connections = workflow.connections || [];
    if (!connections.find(c => c.from === fromId && c.to === toId)) {
      onUpdate({
        ...workflow,
        connections: [...connections, { from: fromId, to: toId }],
      });
    }
  };

  const nodeTypes = ["log_crm", "send_slack", "create_event", "send_email", "webhook"];
  const nodeColors = {
    log_crm: "#6366f1",
    send_slack: "#ec4899",
    create_event: "#06b6d4",
    send_email: "#22c55e",
    webhook: "#f59e0b",
  };

  return (
    <div className="space-y-4">
      {/* Node palette */}
      <div className="flex gap-2 flex-wrap p-3 bg-secondary/30 rounded-lg border border-border">
        {nodeTypes.map(type => (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
            className="px-3 py-1.5 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            + {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        className="relative w-full h-96 bg-secondary/10 border border-dashed border-border rounded-lg overflow-auto"
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.1) 25%, rgba(255,255,255,.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.1) 75%, rgba(255,255,255,.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.1) 25%, rgba(255,255,255,.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.1) 75%, rgba(255,255,255,.1) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px"
        }} />

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {(workflow.connections || []).map((conn, i) => {
            const from = workflow.nodes.find(n => n.id === conn.from);
            const to = workflow.nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x + 60} y1={from.y + 30}
                x2={to.x + 60} y2={to.y + 30}
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgba(212, 175, 55, 0.3)" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        {(workflow.nodes || []).map(node => (
          <div
            key={node.id}
            onMouseDown={(e) => handleDragStart(e, node.id)}
            onClick={() => setSelectedNode(node.id)}
            className={`absolute w-28 p-2 rounded-lg cursor-move transition-all ${
              selectedNode === node.id
                ? "ring-2 ring-primary shadow-lg"
                : "shadow"
            }`}
            style={{
              left: node.x,
              top: node.y,
              backgroundColor: nodeColors[node.type] + "20",
              borderColor: nodeColors[node.type],
              borderWidth: "2px",
            }}
          >
            <div className="text-[10px] font-bold text-foreground text-center">{node.title}</div>
            <div className="mt-2 flex gap-1 justify-center">
              {workflow.nodes.map(n => {
                if (n.id === node.id) return null;
                return (
                  <button
                    key={n.id}
                    onClick={(e) => { e.stopPropagation(); handleConnectNodes(node.id, n.id); }}
                    className="text-[8px] px-1 py-0.5 rounded bg-primary/20 text-primary hover:bg-primary/40"
                  >
                    → {n.title.slice(0, 4)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Node editor */}
      {selectedNode && (
        <div className="p-3 bg-secondary/30 rounded-lg border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">
              {workflow.nodes.find(n => n.id === selectedNode)?.title}
            </span>
            <button
              onClick={() => handleDeleteNode(selectedNode)}
              className="p-1 rounded hover:bg-destructive/20"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Config JSON"
            className="w-full text-xs px-2 py-1 rounded bg-background border border-border"
            defaultValue={JSON.stringify(workflow.nodes.find(n => n.id === selectedNode)?.config || {})}
            onChange={(e) => {
              const node = workflow.nodes.find(n => n.id === selectedNode);
              if (node) {
                try {
                  node.config = JSON.parse(e.target.value);
                  onUpdate(workflow);
                } catch {}
              }
            }}
          />
        </div>
      )}
    </div>
  );
}