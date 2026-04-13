import { useState, useEffect, useCallback } from "react";
import { Loader2, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, Settings, Compass, CalendarClock, Users, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const DEFAULT_CARDS = [
  { id: "crm", label: "CRM Board", desc: "Manage every deal", icon: "Users", nav: "crm" },
  { id: "start_here", label: "Start Here", desc: "Get set up in minutes", icon: "Compass", nav: "start_here" },
  { id: "find_work", label: "Discovery", desc: "Signal-based prospecting", icon: "Search", nav: "find_work" },
  { id: "xpress_leads", label: "XPress Pipeline", desc: "Contractor & operator leads", icon: "Package", nav: "xpress_leads" },
  { id: "job_leads", label: "Jobs Pipeline", desc: "End-buyer project leads", icon: "Hammer", nav: "job_leads" },
  { id: "get_work", label: "Contact", desc: "Outreach & comms", icon: "Phone", nav: "get_work" },
  { id: "follow_up", label: "Follow-Up", desc: "Sequences & reminders", icon: "Clock", nav: "follow_up" },
  { id: "win_work", label: "Close", desc: "Proposals & closing", icon: "Trophy", nav: "win_work" },
  { id: "do_work", label: "Execute", desc: "Jobs & execution", icon: "HardHat", nav: "do_work" },
  { id: "get_paid", label: "Collect", desc: "Invoice & collect", icon: "DollarSign", nav: "get_paid" },
  { id: "analytics", label: "Analytics", desc: "Charts & revenue", icon: "BarChart3", nav: "analytics" },
  { id: "tips", label: "Tips & Tricks", desc: "Pro knowledge", icon: "Lightbulb", nav: "tips" },
  { id: "agents", label: "Agents", desc: "AI agent command", icon: "Bot", nav: "agents" },
  { id: "task_scheduler", label: "Task Scheduler", desc: "Scraper control center", icon: "CalendarClock", nav: "task_scheduler" },
  { id: "settings", label: "Settings", desc: "Account & preferences", icon: "Settings", nav: "settings" },
  { id: "admin", label: "Admin", desc: "Admin operator panel", icon: "Settings", nav: "admin" },
];

const ICON_MAP = { Users, Compass, Search, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, CalendarClock, Settings };

function getStoredOrder() {
  try {
    const saved = localStorage.getItem("xps-dashboard-order");
    if (saved) {
      const ids = JSON.parse(saved);
      const mapped = ids.map(id => DEFAULT_CARDS.find(c => c.id === id)).filter(Boolean);
      const missing = DEFAULT_CARDS.filter(c => !ids.includes(c.id));
      return [...mapped, ...missing];
    }
  } catch {}
  return DEFAULT_CARDS;
}

export default function DashboardView({ onNavigate }) {
  const [cards, setCards] = useState(getStoredOrder);
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const reordered = Array.from(cards);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setCards(reordered);
    localStorage.setItem("xps-dashboard-order", JSON.stringify(reordered.map(c => c.id)));
  }, [cards]);

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
  const overdue = invoices.filter(i => i.status === "Overdue");
  const values = leads.map(l => l.estimated_value || 0).filter(v => v > 0);
  const totalPipeline = values.reduce((s, v) => s + v, 0);
  const wonValue = won.reduce((s, p) => s + (p.total_value || 0), 0);
  const paidValue = paid.reduce((s, i) => s + (i.total || 0), 0);
  const winRate = proposals.length ? Math.round((won.length / proposals.length) * 100) : 0;

  const statMap = {
    crm: `${leads.length} leads`,
    start_here: "5 steps",
    find_work: `${leads.filter(l => l.pipeline_status === "Incoming").length} incoming`,
    xpress_leads: `${xp.length} leads`,
    job_leads: `${jobs.length} leads`,
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

  const xpValue = xp.reduce((s, l) => s + (l.estimated_value || 0), 0);
  const jobValue = jobs.reduce((s, l) => s + (l.estimated_value || 0), 0);

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="relative z-10 p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto">

        {/* HEADER — full width centered */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            COMMAND CENTER
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Drag cards to customize your layout</p>
        </div>

        {/* 3 KEY METRICS — XPress Pipeline, Jobs Pipeline, Follow-Ups */}
        <div className="grid grid-cols-3 gap-4">
          <MetricPill label="XPress Pipeline" value={xp.length} sub={`$${(xpValue / 1000).toFixed(0)}k`} onClick={() => nav("xpress_leads")} />
          <MetricPill label="Jobs Pipeline" value={jobs.length} sub={`$${(jobValue / 1000).toFixed(0)}k`} onClick={() => nav("job_leads")} />
          <MetricPill label="Follow-Ups" value={followUps.length} sub="awaiting reply" onClick={() => nav("follow_up")} />
        </div>

        {/* DRAG & DROP CARD GRID */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-grid" direction="vertical">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => {
                  const Icon = ICON_MAP[card.icon] || Settings;
                  return (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className={cn(
                            "shimmer-card group rounded-2xl p-4 md:p-5 text-left transition-all duration-200 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]",
                            snapshot.isDragging && "ring-2 ring-primary/50 shadow-2xl scale-105 z-50"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div
                              className="shimmer-icon-container w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center cursor-pointer"
                              onClick={() => nav(card.nav)}
                            >
                              <Icon className="w-5 h-5 shimmer-icon metallic-gold-icon" />
                            </div>
                            <div {...prov.dragHandleProps} className="p-1 rounded-md hover:bg-white/10 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          </div>
                          <button onClick={() => nav(card.nav)} className="w-full text-left">
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
        </DragDropContext>

      </div>
    </div>
  );
}

function MetricPill({ label, value, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-4 md:p-5 text-center bg-white/[0.04] backdrop-blur-2xl border border-white/[0.10] animated-silver-border cursor-pointer hover:border-white/[0.25] transition-all duration-300 active:scale-[0.97] w-full"
    >
      <div className="text-2xl md:text-3xl font-extrabold text-foreground">{value}</div>
      <div className="text-xs md:text-sm font-bold text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-[11px] text-primary/70 mt-0.5">{sub}</div>}
    </button>
  );
}