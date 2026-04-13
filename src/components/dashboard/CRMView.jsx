import { useState, useEffect, useCallback } from "react";
import { Users, Package, Hammer, Plus, Loader2, RefreshCcw, MapPin, Sparkles, DollarSign, Phone, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import HScrollRow from "../shared/HScrollRow";

const CRM_STAGES = ["Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const STAGE_COLORS = {
  Contacted: "text-blue-400",
  Qualified: "text-yellow-400",
  Proposal: "text-orange-400",
  Negotiation: "text-purple-400",
  Won: "text-emerald-400",
  Lost: "text-red-400",
};

export default function CRMView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("XPress");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 500);
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = base44.entities.Lead.subscribe((event) => {
      if (event.type === "create") setLeads(prev => [event.data, ...prev]);
      else if (event.type === "update") setLeads(prev => prev.map(l => l.id === event.id ? event.data : l));
      else if (event.type === "delete") setLeads(prev => prev.filter(l => l.id !== event.id));
    });
    return unsub;
  }, []);

  const moveStage = async (leadId, newStage) => {
    await base44.entities.Lead.update(leadId, { stage: newStage });
    toast({ title: "Updated", description: `Moved to ${newStage}` });
    if (selected?.id === leadId) setSelected({ ...selected, stage: newStage });
  };

  const byType = leads.filter(l => (l.lead_type || "XPress") === activeTab);
  const filtered = byType.filter(l =>
    !search || (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filtered.reduce((s, l) => s + (l.estimated_value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 md:p-4 space-y-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>CRM PIPELINE</h1>
            <p className="text-[11px] text-muted-foreground">{filtered.length} leads · ${totalValue.toLocaleString()} value</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={load}><RefreshCcw className="w-3 h-3 mr-1" />Refresh</Button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {[{ id: "XPress", label: "XPS XPRESS CRM", icon: Package, color: "text-amber-400" }, { id: "Jobs", label: "JOBS CRM", icon: Hammer, color: "text-blue-400" }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelected(null); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1",
                activeTab === tab.id
                  ? "bg-white/[0.08] border border-white/[0.18] shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                  : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
              )}>
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "text-muted-foreground")} />
              {tab.label}
            </button>
          ))}
        </div>

        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs bg-white/[0.04] border-white/[0.1] rounded-lg" />
      </div>

      {/* CRM Stages as horizontal scroll rows */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
        {CRM_STAGES.map(stage => {
          const stageLeads = filtered.filter(l => l.stage === stage);
          return (
            <HScrollRow key={stage} title={stage.toUpperCase()} count={stageLeads.length} accentColor={STAGE_COLORS[stage]}>
              {stageLeads.map(l => (
                <CRMCard key={l.id} lead={l} onClick={() => setSelected(l)} />
              ))}
              {stageLeads.length === 0 && (
                <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40">No leads in {stage}</span>
                </div>
              )}
            </HScrollRow>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-80 bg-card/95 backdrop-blur-xl h-full overflow-y-auto shadow-2xl border-l border-white/[0.1]" onClick={e => e.stopPropagation()}>
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">{selected.company}</h2>
                  <p className="text-sm text-muted-foreground">{selected.contact_name}</p>
                  <p className="text-[10px] text-primary font-bold mt-1">{selected.stage} · {selected.lead_type}</p>
                </div>
                <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-2 text-sm">
                {selected.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{selected.email}</div>}
                {selected.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{selected.phone}</div>}
                {selected.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{selected.location}</div>}
                {selected.estimated_value > 0 && <div className="flex items-center gap-2 text-primary font-bold"><DollarSign className="w-3.5 h-3.5" />${selected.estimated_value.toLocaleString()}</div>}
              </div>
              {selected.ai_insight && (
                <div className="rounded-lg p-3 text-xs text-foreground/80 bg-white/[0.04] border border-white/[0.08]">
                  <div className="flex items-center gap-1 text-primary font-semibold mb-1"><Sparkles className="w-3 h-3" />AI Insight</div>
                  {selected.ai_insight}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Move to Stage</label>
                <div className="flex flex-wrap gap-1.5">
                  {CRM_STAGES.filter(s => s !== selected.stage).map(s => (
                    <button key={s} onClick={() => moveStage(selected.id, s)}
                      className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] text-foreground transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CRMCard({ lead, onClick }) {
  return (
    <button onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-[240px] md:w-[260px] rounded-xl p-4 text-left transition-all duration-300",
        "bg-white/[0.03] backdrop-blur-md border border-white/[0.08]",
        "hover:bg-white/[0.08] hover:border-white/[0.18] hover:shadow-[0_0_24px_rgba(212,175,55,0.12)]",
        "hover:scale-[1.02]"
      )}>
      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{lead.company}</div>
      <div className="text-[10px] text-muted-foreground truncate mt-0.5">{lead.contact_name}</div>
      {lead.estimated_value > 0 && <div className="text-[10px] font-bold text-primary mt-1">${lead.estimated_value.toLocaleString()}</div>}
      <div className="flex items-center gap-2 mt-1.5">
        {lead.score > 0 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">Score: {lead.score}</span>
        )}
        {lead.location && (
          <span className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{lead.city || lead.location}</span>
        )}
      </div>
    </button>
  );
}