import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, RefreshCcw, Package, Hammer, Search, MapPin, Users, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getIconColor } from "@/lib/iconColors";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";
import LeadDetailPanel from "./LeadDetailPanel";
import AddLeadModal from "./AddLeadModal";

const PIPELINE_TOOLS = {
  XPress: [
    { id: "scraper", label: "AI Lead Scraper", Icon: Search },
    { id: "enricher", label: "AI Contact Enricher", Icon: Users },
    { id: "scorer", label: "AI Lead Scorer", Icon: TrendingUp },
    { id: "territory", label: "AI Territory Analyzer", Icon: MapPin },
    { id: "research", label: "AI Deep Research", Icon: Target },
  ],
  Jobs: [
    { id: "scraper", label: "AI Job Scraper", Icon: Search },
    { id: "enricher", label: "AI Contact Enricher", Icon: Users },
    { id: "scorer", label: "AI Lead Scorer", Icon: TrendingUp },
    { id: "territory", label: "AI Territory Analyzer", Icon: MapPin },
    { id: "research", label: "AI Deep Research", Icon: Target },
  ],
};

export default function LeadPipelineView({ onChatCommand, onOpenTool, forcedTab }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState(forcedTab || "XPress");
  const { toast } = useToast();

  const workflowId = activeTab === "XPress" ? "xpress_leads" : "job_leads";
  const color = getIconColor(workflowId);
  const LeadIcon = activeTab === "XPress" ? Package : Hammer;

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

  const byType = leads.filter(l => (l.lead_type || "XPress") === activeTab);
  const filtered = byType.filter(l =>
    !search || (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const incoming = filtered.filter(l => l.pipeline_status === "Incoming" || (!l.pipeline_status && l.stage === "Incoming") || (!l.pipeline_status && l.stage === "New"));
  const validated = filtered.filter(l => l.pipeline_status === "Validated" || l.stage === "Validated");
  const prioritized = filtered.filter(l => l.pipeline_status === "Prioritized" || l.stage === "Prioritized");
  const qualified = filtered.filter(l => l.pipeline_status === "Qualified" || l.stage === "Qualified");

  const tools = PIPELINE_TOOLS[activeTab] || [];

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-12">
          {/* Header - Contact page style */}
          <div className="text-center pt-2 pb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
              <NavIcon id={workflowId} size="sm" active />
              <span className="text-xs font-semibold text-white">{activeTab === "XPress" ? "XPRESS · PIPELINE" : "JOBS · PIPELINE"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {activeTab === "XPress" ? "XPRESS PIPELINE" : "JOBS PIPELINE"}
            </h1>
            <p className="mt-2 text-xs text-white/40">{filtered.length} leads in pipeline</p>

            {/* Action bar */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" className="text-xs" onClick={load}><RefreshCcw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
              <Button size="sm" className="text-xs" onClick={() => setAdding(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Add Lead</Button>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mt-4">
              <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 text-sm bg-white/[0.04] border-white/[0.1] rounded-xl" />
            </div>
          </div>

          {/* Tools Row */}
          <HScrollRow title="PIPELINE TOOLS" subtitle="Click to open tool" icon={LeadIcon} count={tools.length}>
            {tools.map(t => (
              <HCard key={t.id} title={t.label} icon={t.Icon} iconColor={color} onClick={() => onOpenTool?.(t.id, workflowId)}>
                <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color }}>Open tool →</div>
              </HCard>
            ))}
          </HScrollRow>

          {/* Pipeline stages as HScrollRow */}
          <HScrollRow title="INCOMING" subtitle={activeTab === "XPress" ? "Raw contractor leads from all sources" : "Incoming job/project leads"} icon={LeadIcon} count={incoming.length}>
            {incoming.slice(0, 20).map(l => (
              <HCard key={l.id} title={l.company} subtitle={l.contact_name || `${l.city || ""}, ${l.state || ""}`} meta={l.score ? `Score: ${l.score}` : l.source || ""} icon={LeadIcon} iconColor={color} onClick={() => setSelected(l)} />
            ))}
            {incoming.length === 0 && <EmptyCard text="No incoming leads" />}
          </HScrollRow>

          <HScrollRow title="VALIDATED" subtitle="Confirmed real businesses" icon={LeadIcon} count={validated.length}>
            {validated.slice(0, 20).map(l => (
              <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.score ? `Score: ${l.score}` : l.email || ""} icon={LeadIcon} iconColor={color} onClick={() => setSelected(l)} />
            ))}
            {validated.length === 0 && <EmptyCard text="No validated leads" />}
          </HScrollRow>

          <HScrollRow title="PRIORITIZED & SCORED" subtitle="AI-scored & ranked" icon={LeadIcon} count={prioritized.length}>
            {prioritized.slice(0, 20).map(l => (
              <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.score ? `Score: ${l.score}` : ""} icon={LeadIcon} iconColor={color} onClick={() => setSelected(l)} />
            ))}
            {prioritized.length === 0 && <EmptyCard text="No prioritized leads" />}
          </HScrollRow>

          <HScrollRow title="QUALIFIED" subtitle="Ready for outreach" icon={LeadIcon} count={qualified.length}>
            {qualified.slice(0, 20).map(l => (
              <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : l.email || ""} icon={LeadIcon} iconColor={color} onClick={() => setSelected(l)} />
            ))}
            {qualified.length === 0 && <EmptyCard text="No qualified leads" />}
          </HScrollRow>
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

function EmptyCard({ text }) {
  return (
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-black/60 border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}