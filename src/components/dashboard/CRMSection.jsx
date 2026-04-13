import { useState, useEffect, useCallback } from "react";
import { Users, Package, Hammer, RefreshCcw, MapPin, Sparkles, DollarSign, Phone, Mail, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import HScrollRow from "../shared/HScrollRow";

const CRM_STAGES = ["Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export default function CRMSection() {
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
    return (
      <div className="rounded-2xl p-8 flex items-center justify-center bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border">
        {/* CRM Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground tracking-wider">CRM PIPELINE</h2>
                <p className="text-sm text-muted-foreground">{filtered.length} leads · ${totalValue.toLocaleString()} pipeline value</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-sm" onClick={load}>
              <RefreshCcw className="w-4 h-4 mr-2" />Refresh
            </Button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-3 mb-4">
            {[
              { id: "XPress", label: "XPRESS CRM", icon: Package },
              { id: "Jobs", label: "JOBS CRM", icon: Hammer },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelected(null); }}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all flex-1",
                  activeTab === tab.id
                    ? "bg-white/[0.08] backdrop-blur-2xl border border-white/[0.2] shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                    : "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18]"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-primary" : "text-muted-foreground")} />
                {tab.label}
              </button>
            ))}
          </div>

          <Input
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 text-sm bg-white/[0.04] border-white/[0.1] rounded-xl"
          />
        </div>

        {/* CRM Stages */}
        <div className="p-5 md:p-6 space-y-5">
          {CRM_STAGES.map(stage => {
            const stageLeads = filtered.filter(l => l.stage === stage);
            return (
              <HScrollRow key={stage} title={stage.toUpperCase()} count={stageLeads.length}>
                {stageLeads.map((l, i) => (
                  <CRMCard key={l.id} lead={l} onClick={() => setSelected(l)} index={i} />
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex-shrink-0 w-[270px] rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center">
                    <span className="text-sm text-muted-foreground/50">No leads in {stage}</span>
                  </div>
                )}
              </HScrollRow>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div className="relative w-96 bg-black/90 backdrop-blur-2xl border-l border-white/[0.1] h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selected.company}</h2>
                  <p className="text-base text-muted-foreground">{selected.contact_name}</p>
                  <p className="text-sm text-primary font-bold mt-1">{selected.stage} · {selected.lead_type}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3 text-base">
                {selected.email && <div className="flex items-center gap-3 text-muted-foreground"><Mail className="w-4 h-4" />{selected.email}</div>}
                {selected.phone && <div className="flex items-center gap-3 text-muted-foreground"><Phone className="w-4 h-4" />{selected.phone}</div>}
                {selected.location && <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="w-4 h-4" />{selected.location}</div>}
                {selected.estimated_value > 0 && <div className="flex items-center gap-3 text-primary font-bold text-lg"><DollarSign className="w-5 h-5" />${selected.estimated_value.toLocaleString()}</div>}
              </div>
              {selected.ai_insight && (
                <div className="rounded-xl p-4 text-sm text-foreground/80 bg-white/[0.05] border border-white/[0.1]">
                  <div className="flex items-center gap-2 text-primary font-semibold mb-2"><Sparkles className="w-4 h-4" />AI Insight</div>
                  {selected.ai_insight}
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-3 block">Move to Stage</label>
                <div className="flex flex-wrap gap-2">
                  {CRM_STAGES.filter(s => s !== selected.stage).map(s => (
                    <button key={s} onClick={() => moveStage(selected.id, s)}
                      className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/[0.05] border border-white/[0.1] hover:border-white/[0.25] hover:bg-white/[0.1] text-foreground transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CRMCard({ lead, onClick, index = 0 }) {
  const isGlass = index % 2 === 1;
  return (
    <button onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-[270px] md:w-[290px] rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.03]",
        isGlass
          ? "bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-black/70 backdrop-blur-xl border border-white/[0.08]",
        "hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]",
        "hover:bg-white/[0.08]"
      )}>
      <div className="text-base font-bold text-foreground truncate group-hover:text-white transition-colors duration-300">{lead.company}</div>
      <div className="text-sm text-muted-foreground truncate mt-1">{lead.contact_name}</div>
      {lead.estimated_value > 0 && <div className="text-base font-bold text-primary mt-2">${lead.estimated_value.toLocaleString()}</div>}
      <div className="flex items-center gap-2 mt-2">
        {lead.score > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.1] text-foreground">Score: {lead.score}</span>
        )}
        {lead.location && (
          <span className="text-xs text-muted-foreground/60 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city || lead.location}</span>
        )}
      </div>
    </button>
  );
}