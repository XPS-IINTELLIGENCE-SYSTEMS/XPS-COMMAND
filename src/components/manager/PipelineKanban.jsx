import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STAGES = ["Incoming", "Validated", "Qualified", "Prioritized", "Contacted", "Proposal", "Negotiation", "Won"];
const STAGE_COLORS = {
  Incoming: "#64748b", Validated: "#06b6d4", Qualified: "#60a5fa", Prioritized: "#a78bfa",
  Contacted: "#f97316", Proposal: "#eab308", Negotiation: "#d4af37", Won: "#22c55e",
};

export default function PipelineKanban() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date", 500);
    setLeads(data.filter(l => l.stage !== "Lost"));
    setLoading(false);
  };

  const moveStage = async (lead, newStage) => {
    await base44.entities.Lead.update(lead.id, { stage: newStage });
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: newStage } : l));
  };

  const isStale = (lead) => {
    if (!lead.updated_date) return false;
    const days = (Date.now() - new Date(lead.updated_date).getTime()) / (1000 * 60 * 60 * 24);
    return days > 7;
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-base font-bold text-foreground mb-4">Pipeline Kanban</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage);
          return (
            <div key={stage} className="min-w-[200px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[stage] }} />
                <span className="text-xs font-semibold text-foreground">{stage}</span>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">{stageLeads.length}</Badge>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {stageLeads.slice(0, 15).map(lead => (
                  <div key={lead.id} className={cn("p-2.5 rounded-lg bg-secondary/30 border border-border/30 group", isStale(lead) && "border-yellow-500/40")}>
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-medium text-foreground truncate flex-1">{lead.company}</div>
                      {isStale(lead) && <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0 ml-1" title="Stale: 7+ days inactive" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{lead.contact_name}</div>
                    {lead.estimated_value && <div className="text-[10px] text-primary font-semibold mt-1">${(lead.estimated_value / 1000).toFixed(0)}k</div>}
                    {/* Quick stage move */}
                    <div className="hidden group-hover:flex gap-1 mt-1.5 flex-wrap">
                      {STAGES.filter(s => s !== stage).slice(0, 3).map(s => (
                        <button key={s} onClick={() => moveStage(lead, s)} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20">
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}