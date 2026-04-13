import { useState, useEffect, useCallback } from "react";
import { Loader2, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, Settings, Compass, CalendarClock, Users, GripVertical, Pencil } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import EditCardModal from "./EditCardModal";
import CRMTopCards from "./CRMTopCards";

const ICON_MAP = { Users, Compass, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, CalendarClock, Settings };

const DEFAULT_GROUPS = [
  {
    heading: "Pipeline Overview",
    cards: [
      { id: "xpress_leads", label: "XPress Pipeline", desc: "Contractor & operator leads", icon: "Package", nav: "xpress_leads", iconColor: "#d4af37" },
      { id: "job_leads", label: "Jobs Pipeline", desc: "End-buyer project leads", icon: "Hammer", nav: "job_leads", iconColor: "#d4af37" },
      { id: "follow_up", label: "Follow-Up", desc: "Sequences & reminders", icon: "Clock", nav: "follow_up", iconColor: "#d4af37" },
    ],
  },
  {
    heading: "Prospecting & Discovery",
    cards: [
      { id: "start_here", label: "Start Here", desc: "Get set up in minutes", icon: "Compass", nav: "start_here", iconColor: "#d4af37" },
      { id: "find_work", label: "Discovery", desc: "Signal-based prospecting", icon: "Search", nav: "find_work", iconColor: "#d4af37" },
      { id: "crm", label: "CRM Board", desc: "Manage every deal", icon: "Users", nav: "crm", iconColor: "#d4af37" },
    ],
  },
  {
    heading: "Outreach & Closing",
    cards: [
      { id: "get_work", label: "Contact", desc: "Outreach & comms", icon: "Phone", nav: "get_work", iconColor: "#d4af37" },
      { id: "win_work", label: "Close", desc: "Proposals & closing", icon: "Trophy", nav: "win_work", iconColor: "#d4af37" },
      { id: "do_work", label: "Execute", desc: "Jobs & execution", icon: "HardHat", nav: "do_work", iconColor: "#d4af37" },
    ],
  },
  {
    heading: "Revenue & Insights",
    cards: [
      { id: "get_paid", label: "Collect", desc: "Invoice & collect", icon: "DollarSign", nav: "get_paid", iconColor: "#d4af37" },
      { id: "analytics", label: "Analytics", desc: "Charts & revenue", icon: "BarChart3", nav: "analytics", iconColor: "#d4af37" },
      { id: "tips", label: "Tips & Tricks", desc: "Pro knowledge", icon: "Lightbulb", nav: "tips", iconColor: "#d4af37" },
    ],
  },
  {
    heading: "System & Tools",
    cards: [
      { id: "agents", label: "Agents", desc: "AI agent command", icon: "Bot", nav: "agents", iconColor: "#d4af37" },
      { id: "task_scheduler", label: "Task Scheduler", desc: "Scraper control center", icon: "CalendarClock", nav: "task_scheduler", iconColor: "#d4af37" },
      { id: "settings", label: "Settings", desc: "Account & preferences", icon: "Settings", nav: "settings", iconColor: "#d4af37" },
    ],
  },
];

function buildGroupsFromSidebar(phases) {
  const items = phases.filter(p => p.id !== "command");
  const groups = [];
  for (let i = 0; i < items.length; i += 3) {
    const chunk = items.slice(i, i + 3);
    const heading = chunk.map(c => c.label).join(" · ");
    groups.push({
      heading,
      cards: chunk.map(p => ({
        id: p.id,
        label: p.label,
        desc: p.desc || "",
        icon: SIDEBAR_ICON_MAP[p.id] || "Settings",
        nav: p.id,
        iconColor: "#d4af37",
      })),
    });
  }
  return groups;
}

const SIDEBAR_ICON_MAP = {
  crm: "Users", start_here: "Compass", find_work: "Search", xpress_leads: "Package",
  job_leads: "Hammer", get_work: "Phone", follow_up: "Clock", win_work: "Trophy",
  do_work: "HardHat", get_paid: "DollarSign", analytics: "BarChart3", tips: "Lightbulb",
  agents: "Bot", task_scheduler: "CalendarClock", settings: "Settings", admin: "Users",
};

function loadGroups() {
  try {
    const saved = localStorage.getItem("xps-dash-groups-v2");
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_GROUPS;
}
function saveGroups(g) { localStorage.setItem("xps-dash-groups-v2", JSON.stringify(g)); }

export default function DashboardView({ onNavigate, sidebarPhases }) {
  const [groups, setGroups] = useState(() => {
    // If sidebarPhases provided, build groups from sidebar order
    if (sidebarPhases && sidebarPhases.length > 0) {
      return buildGroupsFromSidebar(sidebarPhases);
    }
    return loadGroups();
  });
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editCard, setEditCard] = useState(null);
  const [editGroupIdx, setEditGroupIdx] = useState(null);
  const [editCardIdx, setEditCardIdx] = useState(null);
  const [editingHeading, setEditingHeading] = useState(null);

  // Rebuild groups whenever sidebarPhases change
  useEffect(() => {
    if (sidebarPhases && sidebarPhases.length > 0) {
      setGroups(buildGroupsFromSidebar(sidebarPhases));
    }
  }, [sidebarPhases]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 500),
      base44.entities.Proposal.list("-created_date", 200),
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.OutreachEmail.list("-created_date", 200),
    ]);
    setD({ leads, proposals, invoices, emails });
    setLoading(false);
  };

  const nav = useCallback((v) => { if (onNavigate) onNavigate(v); }, [onNavigate]);

  // Called from parent DragDropContext via onDashboardDragEnd
  const handleInternalDrag = useCallback((source, destination) => {
    const srcGroupIdx = parseInt(source.droppableId.split("-")[1]);
    const dstGroupIdx = parseInt(destination.droppableId.split("-")[1]);
    const updated = groups.map(g => ({ ...g, cards: [...g.cards] }));
    const [moved] = updated[srcGroupIdx].cards.splice(source.index, 1);
    updated[dstGroupIdx].cards.splice(destination.index, 0, moved);
    setGroups(updated);
    saveGroups(updated);
  }, [groups]);

  // Expose for parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__dashboardDragHandler = handleInternalDrag;
      window.__dashboardAddCard = (card, groupIdx) => {
        const updated = groups.map(g => ({ ...g, cards: [...g.cards] }));
        // Add to specified group or last group
        const targetIdx = groupIdx != null && groupIdx < updated.length ? groupIdx : updated.length - 1;
        if (targetIdx >= 0 && !updated[targetIdx].cards.find(c => c.id === card.id)) {
          updated[targetIdx].cards.push(card);
          setGroups(updated);
          saveGroups(updated);
        }
      };
    }
    return () => { window.__dashboardDragHandler = null; window.__dashboardAddCard = null; };
  }, [handleInternalDrag, groups]);

  const handleEditCard = (gIdx, cIdx) => {
    setEditCard(groups[gIdx].cards[cIdx]);
    setEditGroupIdx(gIdx);
    setEditCardIdx(cIdx);
  };

  const handleSaveCard = (updatedCard) => {
    const updated = groups.map(g => ({ ...g, cards: [...g.cards] }));
    updated[editGroupIdx].cards[editCardIdx] = updatedCard;
    setGroups(updated);
    saveGroups(updated);
    setEditCard(null);
  };

  const handleHeadingSave = (gIdx, newHeading) => {
    const updated = groups.map((g, i) => i === gIdx ? { ...g, heading: newHeading } : g);
    setGroups(updated);
    saveGroups(updated);
    setEditingHeading(null);
  };

  if (loading || !d) return (
    <div className="flex items-center justify-center h-full bg-transparent">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const { leads, proposals, invoices, emails } = d;
  const xp = leads.filter(l => l.lead_type === "XPress");
  const jobs = leads.filter(l => l.lead_type === "Jobs");
  const followUps = leads.filter(l => l.stage === "Contacted");
  const won = proposals.filter(p => p.status === "Approved");
  const paid = invoices.filter(i => i.status === "Paid");
  const wonValue = won.reduce((s, p) => s + (p.total_value || 0), 0);
  const paidValue = paid.reduce((s, i) => s + (i.total || 0), 0);
  const winRate = proposals.length ? Math.round((won.length / proposals.length) * 100) : 0;
  const xpValue = xp.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const jobValue = jobs.reduce((s, l) => s + (l.estimated_value || 0), 0);

  const statMap = {
    crm: `${leads.length} leads`,
    start_here: "5 steps",
    find_work: `${leads.filter(l => l.pipeline_status === "Incoming").length} incoming`,
    xpress_leads: `${xp.length} leads · $${(xpValue / 1000).toFixed(0)}k`,
    job_leads: `${jobs.length} leads · $${(jobValue / 1000).toFixed(0)}k`,
    get_work: `${emails.filter(e => e.status === "Sent").length} sent`,
    follow_up: `${followUps.length} awaiting`,
    win_work: `${winRate}% win rate`,
    do_work: `${leads.filter(l => l.stage === "Won").length} active`,
    get_paid: `$${(paidValue / 1000).toFixed(0)}k collected`,
    analytics: `$${((wonValue + paidValue) / 1000).toFixed(0)}k revenue`,
    tips: "Pro tips",
    agents: "4 agents",
    task_scheduler: "Scrapers",
    settings: "Preferences",
    admin: "Operator tools",
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="relative z-10 p-5 md:p-8 max-w-[1500px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-32">
          <h1 className="text-3xl md:text-5xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            COMMAND CENTER
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Drag cards to reorder · Click pencil to edit</p>
        </div>

        {/* CRM TOP CARDS */}
        <CRMTopCards leads={d.leads} onNavigate={nav} />

        {/* GROUPED CARD ROWS */}
        <div>
          <div className="space-y-10">
            {groups.map((group, gIdx) => (
              <div key={gIdx}>
                {/* Editable group heading */}
                {editingHeading === gIdx ? (
                  <input
                    autoFocus
                    defaultValue={group.heading}
                    onBlur={(e) => handleHeadingSave(gIdx, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleHeadingSave(gIdx, e.target.value); }}
                    className="text-lg md:text-xl font-extrabold tracking-wide bg-transparent border-b-2 border-primary/40 outline-none text-foreground mb-4 w-full max-w-sm xps-gold-slow-shimmer"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingHeading(gIdx)}
                    className="group flex items-center gap-2 mb-4"
                  >
                    <h2 className="text-lg md:text-xl font-extrabold tracking-wide xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {group.heading}
                    </h2>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                {/* 3-column card row with drag & drop */}
                <Droppable droppableId={`group-${gIdx}`} direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-3 gap-4"
                    >
                      {group.cards.map((card, cIdx) => {
                        const Icon = ICON_MAP[card.icon] || Settings;
                        return (
                          <Draggable key={card.id} draggableId={card.id} index={cIdx}>
                            {(prov, snapshot) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                className={cn(
                                  "rounded-2xl p-4 md:p-5 text-center transition-all duration-200 bg-white/[0.04] backdrop-blur-2xl border animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]",
                                  snapshot.isDragging && "ring-2 ring-primary/50 shadow-2xl scale-105 z-50"
                                )}
                                style={{
                                  ...prov.draggableProps.style,
                                  borderColor: card.borderColor || undefined,
                                }}
                              >
                                {/* Top bar: drag handle + edit */}
                                <div className="flex items-center justify-between mb-3">
                                  <div {...prov.dragHandleProps} className="p-1 rounded-md hover:bg-white/10 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                                  </div>
                                  <button onClick={() => handleEditCard(gIdx, cIdx)} className="p-1 rounded-md hover:bg-white/10">
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground/40" />
                                  </button>
                                </div>

                                {/* Icon */}
                                <button onClick={() => nav(card.nav)} className="w-full flex flex-col items-center">
                                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3">
                                    <Icon className="w-6 h-6" style={{ color: card.iconColor || "#d4af37" }} />
                                  </div>
                                  <div className="text-sm font-bold text-foreground mb-0.5">{card.label}</div>
                                  <div className="text-[11px] text-muted-foreground leading-snug">{card.desc}</div>
                                  {statMap[card.id] && (
                                    <div className="mt-2 text-xs font-semibold text-primary/80">{statMap[card.id]}</div>
                                  )}
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Card Modal */}
      <EditCardModal
        open={!!editCard}
        onClose={() => setEditCard(null)}
        card={editCard}
        onSave={handleSaveCard}
      />
    </div>
  );
}