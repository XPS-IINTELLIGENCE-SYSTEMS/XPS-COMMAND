import { useState, useEffect, useCallback } from "react";
import { Users, Plus, ChevronRight, Loader2, Sparkles, Phone, Mail, DollarSign, MapPin, X, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const STAGE_COLORS = {
  New: "border-t-slate-400",
  Contacted: "border-t-blue-400",
  Qualified: "border-t-yellow-400",
  Proposal: "border-t-orange-400",
  Negotiation: "border-t-purple-400",
  Won: "border-t-green-400",
  Lost: "border-t-red-400",
};

export default function CRMView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newLead, setNewLead] = useState({ company: "", contact_name: "", email: "", phone: "", location: "", stage: "New", estimated_value: 0 });
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
    toast({ title: "Updated", description: `Lead moved to ${newStage}` });
  };

  const createLead = async () => {
    if (!newLead.company.trim()) return;
    await base44.entities.Lead.create(newLead);
    setAdding(false);
    setNewLead({ company: "", contact_name: "", email: "", phone: "", location: "", stage: "New", estimated_value: 0 });
    toast({ title: "Created", description: "New lead added" });
  };

  const deleteLead = async (id) => {
    await base44.entities.Lead.delete(id);
    setSelected(null);
    toast({ title: "Deleted", description: "Lead removed" });
  };

  const filtered = leads.filter(l =>
    !search || (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {};
  STAGES.forEach(s => { grouped[s] = filtered.filter(l => l.stage === s); });
  const totalValue = filtered.reduce((s, l) => s + (l.estimated_value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b border-border bg-card/30 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">{filtered.length} Leads · ${totalValue.toLocaleString()} pipeline</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={load}><RefreshCcw className="w-3 h-3 mr-1" />Refresh</Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => setAdding(true)}><Plus className="w-3 h-3 mr-1" />Add Lead</Button>
          </div>
        </div>
        <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs bg-secondary/30 rounded-lg" />
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-max">
          {STAGES.map(stage => (
            <div key={stage} className={`w-52 flex-shrink-0 flex flex-col border-r border-border/50 ${STAGE_COLORS[stage]} border-t-2`}>
              <div className="px-3 py-2 flex items-center justify-between bg-card/20">
                <span className="text-xs font-bold text-foreground">{stage}</span>
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{grouped[stage].length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
                {grouped[stage].map(lead => (
                  <button
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="w-full text-left bg-card rounded-lg border border-border p-2.5 hover:border-primary/30 transition-colors"
                  >
                    <div className="text-xs font-semibold text-foreground truncate">{lead.company}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{lead.contact_name}</div>
                    {lead.estimated_value > 0 && (
                      <div className="text-[10px] font-bold text-primary mt-1">${lead.estimated_value.toLocaleString()}</div>
                    )}
                    {lead.location && (
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{lead.location}
                      </div>
                    )}
                    {lead.score > 0 && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-primary" />
                        <span className="text-[10px] text-primary font-bold">{lead.score}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-80 bg-card border-l border-border h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">{selected.company}</h2>
                  <p className="text-sm text-muted-foreground">{selected.contact_name}</p>
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
                <div className="bg-primary/5 rounded-lg p-3 text-xs text-foreground/80">
                  <div className="flex items-center gap-1 text-primary font-semibold mb-1"><Sparkles className="w-3 h-3" />AI Insight</div>
                  {selected.ai_insight}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Move to Stage</label>
                <div className="flex flex-wrap gap-1">
                  {STAGES.filter(s => s !== selected.stage).map(s => (
                    <button key={s} onClick={() => { moveStage(selected.id, s); setSelected({ ...selected, stage: s }); }}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-secondary hover:bg-secondary/80 text-foreground border border-border">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="destructive" size="sm" className="w-full text-xs" onClick={() => deleteLead(selected.id)}>Delete Lead</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setAdding(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-card border border-border rounded-xl p-5 w-96 space-y-3 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground">Add New Lead</h3>
            <Input placeholder="Company name *" value={newLead.company} onChange={e => setNewLead({ ...newLead, company: e.target.value })} className="h-9 text-sm" />
            <Input placeholder="Contact name" value={newLead.contact_name} onChange={e => setNewLead({ ...newLead, contact_name: e.target.value })} className="h-9 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} className="h-9 text-sm" />
              <Input placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} className="h-9 text-sm" />
            </div>
            <Input placeholder="Location (City, State)" value={newLead.location} onChange={e => setNewLead({ ...newLead, location: e.target.value })} className="h-9 text-sm" />
            <Input type="number" placeholder="Estimated value ($)" value={newLead.estimated_value || ""} onChange={e => setNewLead({ ...newLead, estimated_value: Number(e.target.value) })} className="h-9 text-sm" />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" className="flex-1" onClick={createLead}>Create Lead</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}