import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, GripVertical, Target, Check, X, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const DEFAULT_FOCUS_CARDS = [
  { id: "fc_main", name: "Workspace", color: "#d4af37", icon: "🛠️" },
  { id: "fc_bids", name: "Bid Pipeline", color: "#22c55e", icon: "📋" },
  { id: "fc_outreach", name: "Outreach", color: "#ec4899", icon: "📨" },
  { id: "fc_research", name: "Research", color: "#8b5cf6", icon: "🔍" },
];

export default function FocusToolbar({ user }) {
  const [cards, setCards] = useState(DEFAULT_FOCUS_CARDS);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.dashboard_config) {
      try {
        const cfg = typeof user.dashboard_config === "string" ? JSON.parse(user.dashboard_config) : user.dashboard_config;
        if (cfg.focus_cards) setCards(cfg.focus_cards);
      } catch {}
    }
  }, [user]);

  const saveCards = useCallback(async (updated) => {
    const me = await base44.auth.me().catch(() => null);
    if (!me) return;
    let cfg = {};
    try { cfg = typeof me.dashboard_config === "string" ? JSON.parse(me.dashboard_config) : (me.dashboard_config || {}); } catch {}
    cfg.focus_cards = updated;
    await base44.auth.updateMe({ dashboard_config: JSON.stringify(cfg) }).catch(() => {});
  }, []);

  const addCard = () => {
    if (!newName.trim()) return;
    const colors = ["#6366f1", "#f97316", "#06b6d4", "#84cc16", "#a855f7", "#14b8a6"];
    const card = { id: `fc_${Date.now()}`, name: newName.trim(), color: colors[cards.length % colors.length], icon: "📌" };
    const updated = [...cards, card];
    setCards(updated);
    setAdding(false);
    setNewName("");
    saveCards(updated);
  };

  const removeCard = (id, e) => {
    e.stopPropagation();
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    saveCards(updated);
  };

  const renameCard = (id) => {
    if (!editName.trim()) { setEditingId(null); return; }
    const updated = cards.map(c => c.id === id ? { ...c, name: editName.trim() } : c);
    setCards(updated);
    setEditingId(null);
    saveCards(updated);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = [...cards];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setCards(reordered);
    saveCards(reordered);
  };

  const openWorkspace = (cardId) => {
    navigate(`/focus/${cardId}`);
  };

  const autoGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.full_name ? `, ${user.full_name.split(" ")[0]}` : "";

  return (
    <div className="px-1 py-1">
      <h1 className="text-[22px] sm:text-[28px] font-extrabold text-white tracking-tight leading-tight mb-3">
        {autoGreeting()}{displayName}
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="focus-toolbar" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex items-stretch gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className={`flex-shrink-0 ${snap.isDragging ? "opacity-80 shadow-2xl" : ""}`}
                    >
                      {editingId === card.id ? (
                        <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-1 min-w-[140px]">
                          <Input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") renameCard(card.id); if (e.key === "Escape") setEditingId(null); }}
                            className="h-6 text-xs w-24 bg-transparent border-primary/30"
                            autoFocus
                          />
                          <button onClick={() => renameCard(card.id)} className="p-0.5"><Check className="w-3 h-3 text-primary" /></button>
                          <button onClick={() => setEditingId(null)} className="p-0.5"><X className="w-3 h-3 text-muted-foreground" /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openWorkspace(card.id)}
                          className="glass-card shimmer-card rounded-xl px-4 py-3 min-w-[130px] text-left group/fc relative transition-all hover:scale-[1.03] active:scale-[0.98]"
                        >
                          {/* Drag handle */}
                          <div {...prov.dragHandleProps} className="absolute top-1 left-1 p-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover/fc:opacity-60 transition-opacity">
                            <GripVertical className="w-3 h-3 text-muted-foreground" />
                          </div>
                          {/* Edit/Delete on hover */}
                          <div className="absolute top-1 right-1 flex items-center gap-0 opacity-0 group-hover/fc:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); setEditingId(card.id); setEditName(card.name); }} className="p-0.5 rounded hover:bg-white/10">
                              <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                            <button onClick={(e) => removeCard(card.id, e)} className="p-0.5 rounded hover:bg-red-500/20">
                              <Trash2 className="w-2.5 h-2.5 text-red-400" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{card.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white truncate max-w-[90px]">{card.name}</div>
                              <div className="text-[9px] text-white/40 mt-0.5">Open workspace</div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl" style={{ backgroundColor: card.color }} />
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add card button */}
              {adding ? (
                <div className="flex-shrink-0 glass-card rounded-xl px-3 py-2 flex items-center gap-1 min-w-[140px]">
                  <Input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addCard(); if (e.key === "Escape") setAdding(false); }}
                    placeholder="Name..."
                    className="h-6 text-xs w-24 bg-transparent border-primary/30"
                    autoFocus
                  />
                  <button onClick={addCard} className="p-0.5"><Check className="w-3 h-3 text-primary" /></button>
                  <button onClick={() => setAdding(false)} className="p-0.5"><X className="w-3 h-3 text-muted-foreground" /></button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex-shrink-0 glass-card rounded-xl px-3 py-3 min-w-[50px] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}