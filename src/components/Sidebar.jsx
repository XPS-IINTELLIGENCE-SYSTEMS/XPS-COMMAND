import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, X, Check, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import NavIcon from "./shared/NavIcon";

const DEFAULT_PHASES = [
  { id: "command", label: "Command", num: null, desc: "Pipeline & metrics" },
  { id: "crm", label: "CRM", num: null, desc: "Pipeline board" },
  { id: "start_here", label: "Start Here", num: null, desc: "Get set up in minutes" },
  { id: "find_work", label: "Discovery", num: "1", desc: "Signal-based prospecting" },
  { id: "xpress_leads", label: "XPress Pipeline", num: null, desc: "Contractor & operator leads" },
  { id: "job_leads", label: "Jobs Pipeline", num: null, desc: "End-buyer project leads" },
  { id: "get_work", label: "Contact", num: "2", desc: "Outreach & comms" },
  { id: "follow_up", label: "Follow-Up", num: null, desc: "Sequences & reminders" },
  { id: "win_work", label: "Close", num: "3", desc: "Proposals & closing" },
  { id: "do_work", label: "Execute", num: "4", desc: "Jobs & execution" },
  { id: "get_paid", label: "Collect", num: "5", desc: "Invoice & collect" },
  { id: "analytics", label: "Analytics", num: null, desc: "Charts & revenue" },
  { id: "tips", label: "Tips & Tricks", num: null, desc: "Pro knowledge" },
];

const DEFAULT_UTILITY = [
  { id: "task_scheduler", label: "Task Scheduler", desc: "Scraper control center" },
  { id: "agents", label: "Agent Command", desc: "All agents & tools" },
  { id: "settings", label: "Settings", desc: "Account & preferences" },
  { id: "admin", label: "Admin", desc: "Admin operator panel" },
];

function loadNav(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return fallback;
}
function saveNav(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function SidebarButton({ item, isActive, onClick, dragHandleProps, onEditLabel, onEditDesc }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [labelVal, setLabelVal] = useState(item.label);
  const [descVal, setDescVal] = useState(item.desc || "");

  useEffect(() => { setLabelVal(item.label); }, [item.label]);
  useEffect(() => { setDescVal(item.desc || ""); }, [item.desc]);

  const saveLabel = () => {
    if (labelVal.trim() && labelVal.trim() !== item.label) onEditLabel(labelVal.trim());
    setEditingLabel(false);
  };
  const saveDesc = () => {
    if (descVal.trim() !== (item.desc || "")) onEditDesc(descVal.trim());
    setEditingDesc(false);
  };

  return (
    <div className={cn(
      "shimmer-card w-full flex items-center gap-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 px-1.5 py-2",
      isActive ? "glass-card-active text-primary" : "glass-card text-foreground/60 hover:text-foreground"
    )}>
      <div {...dragHandleProps} className="flex-shrink-0 p-0.5 cursor-grab active:cursor-grabbing rounded hover:bg-white/10">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
      </div>
      <button onClick={onClick} className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
          <NavIcon id={item.id} size="sm" active={isActive} />
          {item.num && (
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black",
              isActive ? "bg-primary text-background" : "bg-secondary border border-white/20 text-white/70"
            )}>
              {item.num}
            </div>
          )}
        </div>
        <div className="text-left min-w-0 flex-1">
          {editingLabel ? (
            <input
              autoFocus
              value={labelVal}
              onChange={(e) => setLabelVal(e.target.value)}
              onBlur={saveLabel}
              onKeyDown={(e) => { if (e.key === 'Enter') saveLabel(); if (e.key === 'Escape') setEditingLabel(false); }}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-semibold bg-transparent border-b border-primary/40 outline-none text-foreground w-full"
            />
          ) : (
            <div
              className="text-[13px] font-semibold truncate cursor-text"
              onDoubleClick={(e) => { e.stopPropagation(); setEditingLabel(true); }}
            >{item.label}</div>
          )}
          {editingDesc ? (
            <input
              autoFocus
              value={descVal}
              onChange={(e) => setDescVal(e.target.value)}
              onBlur={saveDesc}
              onKeyDown={(e) => { if (e.key === 'Enter') saveDesc(); if (e.key === 'Escape') setEditingDesc(false); }}
              onClick={(e) => e.stopPropagation()}
              className={cn("text-[9px] bg-transparent border-b border-primary/40 outline-none w-full", isActive ? "text-primary/60" : "text-muted-foreground/50")}
            />
          ) : (
            item.desc && (
              <div
                className={cn("text-[9px] truncate cursor-text", isActive ? "text-primary/60" : "text-muted-foreground/50")}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingDesc(true); }}
              >{item.desc}</div>
            )
          )}
        </div>
      </button>
    </div>
  );
}

function AddItemForm({ onAdd, onCancel }) {
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <div className="glass-card rounded-xl p-2.5 space-y-2">
      <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} className="h-7 text-xs bg-transparent" />
      <Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="h-7 text-xs bg-transparent" />
      <div className="flex items-center gap-1.5 justify-end">
        <button onClick={onCancel} className="p-1 rounded hover:bg-white/10"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
        <button
          onClick={() => { if (label.trim()) { onAdd({ id: `custom_${Date.now()}`, label: label.trim(), desc: desc.trim(), num: null }); } }}
          className="p-1 rounded hover:bg-white/10"
        >
          <Check className="w-3.5 h-3.5 text-primary" />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ activeView, onViewChange, onPhasesChange }) {
  const [phases, setPhases] = useState(() => {
    const saved = loadNav("xps-sidebar-phases", DEFAULT_PHASES);
    // Migrate: rename "Dashboard" to "Command" if cached
    return saved.map(p => p.id === "command" && p.label === "Dashboard" ? { ...p, label: "Command" } : p);
  });
  const [utility, setUtility] = useState(() => loadNav("xps-sidebar-utility", DEFAULT_UTILITY));
  const [addingTo, setAddingTo] = useState(null); // "workflow" | "system" | null

  const onDragEnd = useCallback((result) => {
    const { source, destination } = result;
    if (!destination) return;
    const srcList = source.droppableId === "workflow" ? phases : utility;
    const dstList = destination.droppableId === "workflow" ? phases : utility;
    const setSrc = source.droppableId === "workflow" ? setPhases : setUtility;
    const setDst = destination.droppableId === "workflow" ? setPhases : setUtility;

    if (source.droppableId === destination.droppableId) {
      const reordered = Array.from(srcList);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setSrc(reordered);
      saveNav(source.droppableId === "workflow" ? "xps-sidebar-phases" : "xps-sidebar-utility", reordered);
      if (source.droppableId === "workflow" && onPhasesChange) onPhasesChange(reordered);
    } else {
      const srcCopy = Array.from(srcList);
      const dstCopy = Array.from(dstList);
      const [moved] = srcCopy.splice(source.index, 1);
      dstCopy.splice(destination.index, 0, moved);
      setSrc(srcCopy);
      setDst(dstCopy);
      const newPhases = source.droppableId === "workflow" ? srcCopy : dstCopy;
      saveNav("xps-sidebar-phases", newPhases);
      saveNav("xps-sidebar-utility", source.droppableId === "system" ? srcCopy : dstCopy);
      if (onPhasesChange) onPhasesChange(newPhases);
    }
  }, [phases, utility]);

  const editItem = (section, idx, field, value) => {
    if (section === "workflow") {
      const updated = phases.map((p, i) => i === idx ? { ...p, [field]: value } : p);
      setPhases(updated);
      saveNav("xps-sidebar-phases", updated);
      if (onPhasesChange) onPhasesChange(updated);
    } else {
      const updated = utility.map((u, i) => i === idx ? { ...u, [field]: value } : u);
      setUtility(updated);
      saveNav("xps-sidebar-utility", updated);
    }
  };

  useEffect(() => {
    if (onPhasesChange) onPhasesChange(phases);
  }, []);

  const addItem = (section, item) => {
    if (section === "workflow") {
      const updated = [...phases, item];
      setPhases(updated);
      saveNav("xps-sidebar-phases", updated);
      if (onPhasesChange) onPhasesChange(updated);
    } else {
      const updated = [...utility, item];
      setUtility(updated);
      saveNav("xps-sidebar-utility", updated);
    }
    setAddingTo(null);
  };

  return (
    <div className="w-full h-full bg-sidebar/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <a href="/dashboard" className="flex items-center gap-2.5 transition-all duration-300 hover:scale-105">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <div className="text-sm font-extrabold xps-gold-slow-shimmer tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>XPS INTELLIGENCE</div>
            <div className="text-[9px] font-semibold metallic-silver tracking-widest">XTREME POLISHING SYSTEMS</div>
          </div>
        </a>
      </div>

      {/* Navigation with DnD */}
      <ScrollArea className="flex-1">
        <DragDropContext onDragEnd={onDragEnd}>
          <nav className="py-4 px-3 space-y-6">
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">Workflow</div>
                <button onClick={() => setAddingTo(addingTo === "workflow" ? null : "workflow")} className="p-0.5 rounded hover:bg-white/10">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground/50" />
                </button>
              </div>
              <Droppable droppableId="workflow">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                    {phases.map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}>
                            <SidebarButton
                              item={item}
                              isActive={activeView === item.id}
                              onClick={() => onViewChange(item.id)}
                              dragHandleProps={prov.dragHandleProps}
                              onEditLabel={(v) => editItem("workflow", idx, "label", v)}
                              onEditDesc={(v) => editItem("workflow", idx, "desc", v)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              {addingTo === "workflow" && (
                <div className="mt-2">
                  <AddItemForm onAdd={(item) => addItem("workflow", item)} onCancel={() => setAddingTo(null)} />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="text-[10px] font-semibold text-muted-foreground/60 tracking-wider uppercase">System</div>
                <button onClick={() => setAddingTo(addingTo === "system" ? null : "system")} className="p-0.5 rounded hover:bg-white/10">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground/50" />
                </button>
              </div>
              <Droppable droppableId="system">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                    {utility.map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}>
                            <SidebarButton
                              item={item}
                              isActive={activeView === item.id}
                              onClick={() => onViewChange(item.id)}
                              dragHandleProps={prov.dragHandleProps}
                              onEditLabel={(v) => editItem("system", idx, "label", v)}
                              onEditDesc={(v) => editItem("system", idx, "desc", v)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              {addingTo === "system" && (
                <div className="mt-2">
                  <AddItemForm onAdd={(item) => addItem("system", item)} onCancel={() => setAddingTo(null)} />
                </div>
              )}
            </div>
          </nav>
        </DragDropContext>
      </ScrollArea>
    </div>
  );
}