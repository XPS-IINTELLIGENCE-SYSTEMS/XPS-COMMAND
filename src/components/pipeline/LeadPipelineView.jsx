import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, RefreshCcw, Package, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import PipelineRow from "./PipelineRow";
import LeadDetailPanel from "./LeadDetailPanel";
import AddLeadModal from "./AddLeadModal";

const TABS = [
  { id: "XPress", label: "XPS XPRESS", desc: "Material · Equipment · Training Sales", icon: Package },
  { id: "Jobs", label: "JOBS PIPELINE", desc: "Contract Work · Projects", icon: Hammer },
];

export default function LeadPipelineView({ onChatCommand }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
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

  const deleteLead = async (id) => {
    await base44.entities.Lead.delete(id);
    setSelected(null);
    toast({ title: "Deleted", description: "Lead removed" });
  };

  // Filter by tab type — default to XPress if no lead_type set
  const byType = leads.filter(l => (l.lead_type || "XPress") === activeTab);

  const filtered = byType.filter(l =>
    !search || (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const incoming = filtered.filter(l => l.pipeline_status === "Incoming" || (!l.pipeline_status && l.stage === "Incoming") || (!l.pipeline_status && l.stage === "New"));
  const prioritized = filtered.filter(l => l.pipeline_status === "Prioritized" || l.stage === "Prioritized");
  const qualified = filtered.filter(l => l.pipeline_status === "Qualified" || l.stage === "Qualified");

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with tabs */}
        <div className="flex-shrink-0 p-3 md:p-4 glass-panel space-y-2">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelected(null); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all flex-1",
                    isActive ? "glass-card-active text-primary" : "glass-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold">{tab.label}</div>
                    <div className="text-[9px] opacity-60">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-foreground">
                {activeTab === "XPress" ? "XPS XPress Lead Pipeline" : "Jobs Lead Pipeline"}
              </h1>
              <p className="text-[11px] text-muted-foreground">{filtered.length} leads</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={load}><RefreshCcw className="w-3 h-3 mr-1" />Refresh</Button>
              <Button size="sm" className="h-8 text-xs" onClick={() => setAdding(true)}><Plus className="w-3 h-3 mr-1" />Add Lead</Button>
            </div>
          </div>
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs glass-input rounded-lg" />
        </div>

        {/* 3-level pipeline rows: Incoming → Prioritized & Scored → Qualified */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
          <PipelineRow
            title="INCOMING"
            subtitle={activeTab === "XPress" ? "Raw contractor leads from ChatGPT, scraper, attachments, Drive, Supabase" : "Incoming job/project leads from all sources"}
            leads={incoming}
            colorKey="Incoming"
            onLeadClick={setSelected}
          />
          <PipelineRow
            title="PRIORITIZED & SCORED"
            subtitle={activeTab === "XPress" ? "Validated, scored & prioritized by AI — ranked by product/training fit" : "Scored & ranked by project value, timeline, and fit"}
            leads={prioritized}
            colorKey="Prioritized"
            onLeadClick={setSelected}
          />
          <PipelineRow
            title="QUALIFIED"
            subtitle={activeTab === "XPress" ? "Qualified contractors ready for outreach — confirmed need for XPS products" : "Qualified projects ready for proposal and engagement"}
            leads={qualified}
            colorKey="Qualified"
            onLeadClick={setSelected}
          />
        </div>
      </div>

      {selected && (
        <LeadDetailPanel
          lead={selected}
          onClose={() => setSelected(null)}
          onDelete={deleteLead}
          onChatCommand={onChatCommand}
        />
      )}

      {adding && <AddLeadModal onClose={() => setAdding(false)} defaultType={activeTab} />}
    </div>
  );
}