import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, X, GripVertical, Target, Loader2, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_TOOLS } from "../dashboard/dashboardDefaults";
import { ICON_MAP } from "../dashboard/dashboardDefaults";
import FocusToolCard from "./FocusToolCard";

const DEFAULT_FOCUS_BOARDS = [
  { id: "focus_daily", name: "Daily Ops", tools: ["xpress_leads", "data_bank", "analytics", "scheduler"], color: "#d4af37" },
  { id: "focus_bidding", name: "Bid Workflow", tools: ["find_jobs", "blueprint_takeoff", "dynamic_pricing", "auto_proposal", "bid_center"], color: "#22c55e" },
  { id: "focus_outreach", name: "Outreach", tools: ["get_work", "outreach_automation", "sentiment_analyst", "win_work"], color: "#ec4899" },
];

export default function FocusDashboard({ onOpenTool, compact = false }) {
  const [boards, setBoards] = useState(DEFAULT_FOCUS_BOARDS);
  const [activeBoard, setActiveBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const toolMap = Object.fromEntries(DEFAULT_TOOLS.map(t => [t.id, t]));

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    const me = await base44.auth.me().catch(() => null);
    if (me?.dashboard_config) {
      try {
        const cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : me.dashboard_config;
        if (cfg.focus_boards) setBoards(cfg.focus_boards);
      } catch {}
    }
    setLoading(false);
  };

  const saveBoards = useCallback(async (updated) => {
    const me = await base44.auth.me().catch(() => null);
    if (!me) return;
    let cfg = {};
    try {
      cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : (me.dashboard_config || {});
    } catch {}
    cfg.focus_boards = updated;
    await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) }).catch(() => {});
  }, []);

  const addBoard = () => {
    if (!newName.trim()) return;
    const board = { id: `focus_${Date.now()}`, name: newName.trim(), tools: [], color: "#6366f1" };
    const updated = [...boards, board];
    setBoards(updated);
    setActiveBoard(board.id);
    setAdding(false);
    setNewName("");
    saveBoards(updated);
  };

  const removeBoard = (id) => {
    const updated = boards.filter(b => b.id !== id);
    setBoards(updated);
    if (activeBoard === id) setActiveBoard(null);
    saveBoards(updated);
  };

  const renameBoard = (id) => {
    if (!editName.trim()) { setEditingId(null); return; }
    const updated = boards.map(b => b.id === id ? { ...b, name: editName.trim() } : b);
    setBoards(updated);
    setEditingId(null);
    saveBoards(updated);
  };

  const addToolToBoard = (boardId, toolId) => {
    const updated = boards.map(b => {
      if (b.id !== boardId) return b;
      if (b.tools.includes(toolId)) return b;
      return { ...b, tools: [...b.tools, toolId] };
    });
    setBoards(updated);
    saveBoards(updated);
  };

  const removeToolFromBoard = (boardId, toolId) => {
    const updated = boards.map(b => b.id === boardId ? { ...b, tools: b.tools.filter(t => t !== toolId) } : b);
    setBoards(updated);
    saveBoards(updated);
  };

  const onDragEnd = (result) => {
    if (!result.destination || !activeBoard) return;
    const board = boards.find(b => b.id === activeBoard);
    if (!board) return;
    const newTools = [...board.tools];
    const [moved] = newTools.splice(result.source.index, 1);
    newTools.splice(result.destination.index, 0, moved);
    const updated = boards.map(b => b.id === activeBoard ? { ...b, tools: newTools } : b);
    setBoards(updated);
    saveBoards(updated);
  };

  const currentBoard = boards.find(b => b.id === activeBoard);
  const availableTools = DEFAULT_TOOLS.filter(t => !currentBoard?.tools.includes(t.id));

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  // Compact mode — just a summary card for the dashboard section
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {boards.map(board => (
            <button
              key={board.id}
              onClick={() => onOpenTool?.("focus_dashboard")}
              className="glass-card shimmer-card rounded-xl p-3 text-left transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${board.color}20` }}>
                  <Target className="w-3 h-3" style={{ color: board.color }} />
                </div>
                <span className="text-xs font-bold text-foreground truncate">{board.name}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{board.tools.length} tools</p>
            </button>
          ))}
        </div>
        <button onClick={() => onOpenTool?.("focus_dashboard")} className="w-full text-center text-[10px] text-primary hover:text-primary/80 py-1.5">
          Open Focus Dashboard →
        </button>
      </div>
    );
  }

  // Full page view
  return (
    <div className="space-y-4">
      {/* Board tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {boards.map(board => (
          <div key={board.id} className="flex items-center gap-0">
            {editingId === board.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && renameBoard(board.id)}
                  className="h-7 w-28 text-xs"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => renameBoard(board.id)}><Check className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
              </div>
            ) : (
              <button
                onClick={() => setActiveBoard(activeBoard === board.id ? null : board.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeBoard === board.id
                    ? "metallic-gold-bg text-background shadow-md"
                    : "glass-card text-foreground hover:bg-white/[0.06]"
                }`}
              >
                <Target className="w-3 h-3" style={{ color: activeBoard === board.id ? undefined : board.color }} />
                {board.name}
                <span className="text-[10px] opacity-60">({board.tools.length})</span>
              </button>
            )}
            {activeBoard === board.id && editingId !== board.id && (
              <div className="flex items-center gap-0.5 ml-1">
                <button onClick={() => { setEditingId(board.id); setEditName(board.name); }} className="p-1 rounded hover:bg-white/10">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                <button onClick={() => removeBoard(board.id)} className="p-1 rounded hover:bg-red-500/20">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            )}
          </div>
        ))}

        {adding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addBoard()}
              placeholder="Board name..."
              className="h-7 w-32 text-xs"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={addBoard}><Check className="w-3 h-3 text-primary" /></Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setAdding(false)}><X className="w-3 h-3" /></Button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass-card text-[11px] text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> New Board
          </button>
        )}
      </div>

      {/* Active board content */}
      {currentBoard && (
        <div className="space-y-4">
          {/* Drag-and-drop tool grid */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="focus-tools" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 min-h-[100px] rounded-xl border-2 border-dashed p-3 transition-colors ${
                    snapshot.isDraggingOver ? "border-primary/40 bg-primary/5" : "border-border/50"
                  }`}
                >
                  {currentBoard.tools.length === 0 && (
                    <div className="col-span-full text-center py-8 text-xs text-muted-foreground">
                      Add tools from below to build your focus board
                    </div>
                  )}
                  {currentBoard.tools.map((toolId, index) => {
                    const tool = toolMap[toolId];
                    if (!tool) return null;
                    return (
                      <Draggable key={toolId} draggableId={toolId} index={index}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}>
                            <FocusToolCard
                              tool={tool}
                              onOpen={() => onOpenTool?.(toolId)}
                              onRemove={() => removeToolFromBoard(currentBoard.id, toolId)}
                              dragHandleProps={prov.dragHandleProps}
                            />
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

          {/* Add tool picker */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground mb-2 px-1">+ Add Tools</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-[200px] overflow-y-auto p-1">
              {availableTools.map(tool => {
                const Icon = ICON_MAP[tool.iconName] || Target;
                return (
                  <button
                    key={tool.id}
                    onClick={() => addToolToBoard(currentBoard.id, tool.id)}
                    className="glass-card rounded-lg px-2 py-1.5 text-left hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" style={{ color: tool.color }} />
                    <span className="text-[10px] text-foreground truncate">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!activeBoard && (
        <div className="text-center py-10 text-sm text-muted-foreground">
          Select a focus board above or create a new one
        </div>
      )}
    </div>
  );
}