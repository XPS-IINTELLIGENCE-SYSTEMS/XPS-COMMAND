import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, RefreshCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PipelineRow from "./PipelineRow";
import LeadDetailPanel from "./LeadDetailPanel";
import AddLeadModal from "./AddLeadModal";

export default function LeadPipelineView({ onChatCommand }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
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

  const deleteLead = async (id) => {
    await base44.entities.Lead.delete(id);
    setSelected(null);
    toast({ title: "Deleted", description: "Lead removed" });
  };

  const filtered = leads.filter(l =>
    !search || (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const incoming = filtered.filter(l => l.pipeline_status === "Incoming" || (!l.pipeline_status && l.stage === "Incoming") || (!l.pipeline_status && l.stage === "New"));
  const qualified = filtered.filter(l => l.pipeline_status === "Qualified" || l.stage === "Qualified");
  const prioritized = filtered.filter(l => l.pipeline_status === "Prioritized");

  const totalValue = filtered.reduce((s, l) => s + (l.estimated_value || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main pipeline area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-3 md:p-4 glass-panel space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-foreground">Lead Pipeline</h1>
              <p className="text-[11px] text-muted-foreground">{filtered.length} leads · ${totalValue.toLocaleString()} pipeline</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={load}><RefreshCcw className="w-3 h-3 mr-1" />Refresh</Button>
              <Button size="sm" className="h-8 text-xs" onClick={() => setAdding(true)}><Plus className="w-3 h-3 mr-1" />Add Lead</Button>
            </div>
          </div>
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs glass-input rounded-lg" />
        </div>

        {/* 3-level pipeline rows */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          <PipelineRow
            title="INCOMING"
            subtitle="Raw leads from ChatGPT, scraper, attachments, Drive, Supabase"
            leads={incoming}
            colorKey="Incoming"
            onLeadClick={setSelected}
          />
          <PipelineRow
            title="SCORED & QUALIFIED"
            subtitle="Validated, scored, and qualified by the AI validation agent"
            leads={qualified}
            colorKey="Qualified"
            onLeadClick={setSelected}
          />
          <PipelineRow
            title="PRIORITIZED"
            subtitle="Top-priority leads ranked by AI formula — ready for outreach"
            leads={prioritized}
            colorKey="Prioritized"
            onLeadClick={setSelected}
          />
        </div>
      </div>

      {/* Detail panel - slides in without blocking chat */}
      {selected && (
        <LeadDetailPanel
          lead={selected}
          onClose={() => setSelected(null)}
          onDelete={deleteLead}
          onChatCommand={onChatCommand}
        />
      )}

      {adding && <AddLeadModal onClose={() => setAdding(false)} />}
    </div>
  );
}