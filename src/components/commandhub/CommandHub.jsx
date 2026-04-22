import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Users, Target, Crown, Loader2, RefreshCcw, Mail, Briefcase, Building2, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrchestratorPanel from "./OrchestratorPanel";
import DataQualityBar from "./DataQualityBar";
import CallListTab from "../callcenter/CallListTab";
import ClosedDealsTab from "../callcenter/ClosedDealsTab";
import FollowUpTab from "../callcenter/FollowUpTab";
import ProductReferencePanel from "../callcenter/ProductReferencePanel";
import ProspectDatabaseTab from "../callcenter/ProspectDatabaseTab";
import CRMView from "../dashboard/CRMView";
import EmailTemplatesView from "../outreach/EmailTemplatesView";

const TABS = [
  { id: "orchestrator", label: "CEO Ops", icon: Crown, color: "#d4af37" },
  { id: "call_queue", label: "Call Queue", icon: Phone, color: "#22c55e" },
  { id: "crm", label: "CRM", icon: Users, color: "#6366f1" },
  { id: "prospects", label: "Prospect DB", icon: Building2, color: "#ef4444" },
  { id: "templates", label: "Templates", icon: Mail, color: "#ec4899" },
  { id: "closed", label: "Closed", icon: Target, color: "#22c55e" },
  { id: "followups", label: "Follow-Ups", icon: Zap, color: "#f59e0b" },
  { id: "products", label: "XPS Products", icon: Briefcase, color: "#8b5cf6" },
];

export default function CommandHub() {
  const [tab, setTab] = useState("orchestrator");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [callQueue, setCallQueue] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [lastLog, setLastLog] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [leadsList, prospectList, logsList, contractors, gcCompanies, jobs, logs] = await Promise.all([
      base44.entities.Lead.list("-score", 1000).catch(() => []),
      base44.entities.ProspectCompany.list("-cold_call_priority", 500).catch(() => []),
      base44.entities.OrchestratorLog.list("-created_date", 5).catch(() => []),
      base44.entities.Contractor.list("-score", 200).catch(() => []),
      base44.entities.ContractorCompany.list("-created_date", 200).catch(() => []),
      base44.entities.CommercialJob.list("-urgency_score", 100).catch(() => []),
      base44.entities.CallLog.list("-created_date", 500).catch(() => []),
    ]);

    setLeads(leadsList);
    setProspects(prospectList);
    setCallLogs(logs);
    setLastLog(logsList.find(l => l.status === 'complete') || null);

    // Build unified call queue
    const loggedIds = new Set(logs.map(l => l.source_id));
    const queue = [];

    const addToQueue = (items, sourceType, mapper) => {
      items.forEach(item => {
        const mapped = mapper(item);
        if (!mapped.phone && !mapped.email) return;
        queue.push({ ...mapped, source_type: sourceType, source_id: item.id, logged: loggedIds.has(item.id), lastLog: logs.find(l => l.source_id === item.id) });
      });
    };

    addToQueue(leadsList, "Lead", l => ({
      id: l.id, company_name: l.company || "Unknown", contact_name: l.contact_name || "", phone: l.phone || "", email: l.email || "",
      website: l.website || "", location: l.location || `${l.city || ""}, ${l.state || ""}`.trim(),
      priority: l.priority || Math.round((l.score || 50) / 10), score: l.score || 0,
      employee_count: l.employee_count || 0, years_in_business: l.years_in_business || 0,
      vertical: l.vertical || "", specialty: l.specialty || "", existing_products: l.existing_material || "",
      ai_insight: l.ai_insight || "", ai_recommendation: l.ai_recommendation || "",
      sentiment: l.sentiment_label || "", stage: l.stage || "Incoming", lead_type: l.lead_type || "XPress",
      notes: l.notes || "", estimated_value: l.estimated_value || 0,
    }));

    addToQueue(contractors, "Contractor", c => ({
      id: c.id, company_name: c.company_name || "Unknown", contact_name: c.contact_name || "", phone: c.phone || "", email: c.email || "",
      website: c.website || "", location: `${c.city || ""}, ${c.state || ""}`.trim(),
      priority: Math.round((c.score || 50) / 10), score: c.score || 0,
      employee_count: c.employee_count || 0, vertical: c.contractor_type || "", specialty: c.specialty || "",
      notes: c.notes || "", relationship: c.relationship_status || "New",
    }));

    addToQueue(prospectList, "ProspectCompany", p => ({
      id: p.id, company_name: p.company_name || "Unknown", contact_name: p.owner_name || "", phone: p.phone || "", email: p.email || "",
      website: p.website || "", location: `${p.city || ""}, ${p.state || ""}`.trim(),
      priority: p.cold_call_priority || 5, score: (p.cold_call_priority || 5) * 10,
      employee_count: p.employee_count || 0, years_in_business: p.years_in_business || 0,
      vertical: p.specialty || "Epoxy", specialty: p.specialty || "",
      existing_products: p.current_products || "", ai_insight: p.ai_summary || "",
      ai_recommendation: p.ai_pitch || "", notes: p.notes || "", lead_type: "XPress",
    }));

    addToQueue(gcCompanies, "ContractorCompany", gc => ({
      id: gc.id, company_name: gc.company_name || "Unknown", contact_name: gc.preconstruction_contact_name || gc.estimator_name || "",
      phone: gc.phone || gc.preconstruction_phone || "", email: gc.email || gc.preconstruction_email || "",
      website: gc.website || "", location: `${gc.city || ""}, ${gc.state || ""}`.trim(),
      priority: 7, score: 70, vertical: "General Contractor", notes: gc.notes || "",
    }));

    addToQueue(jobs, "CommercialJob", j => ({
      id: j.id, company_name: j.gc_name || j.owner_name || j.job_name || "Unknown", contact_name: j.gc_contact || j.owner_contact || "",
      phone: j.gc_phone || j.owner_phone || "", email: j.gc_email || j.owner_email || "",
      website: "", location: `${j.city || ""}, ${j.state || ""}`.trim(),
      priority: Math.round((j.urgency_score || j.lead_score || 50) / 10), score: j.lead_score || j.urgency_score || 50,
      vertical: j.project_type || "", notes: j.notes || "", job_name: j.job_name || "",
      estimated_value: j.estimated_flooring_value || j.project_value || 0,
    }));

    queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    setCallQueue(queue);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center"><Crown className="w-5 h-5 text-background" /></div>
          <div>
            <h1 className="text-lg font-black metallic-gold">XPS Command Hub</h1>
            <p className="text-[10px] text-muted-foreground">CEO Orchestrator + CRM + Call Center — unified operations center</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll}><RefreshCcw className="w-3.5 h-3.5" /></Button>
      </div>

      {/* Data Quality Bar — always visible */}
      <DataQualityBar leads={leads} prospects={prospects} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 overflow-x-auto scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                tab === t.id ? "metallic-gold-bg text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "orchestrator" && <OrchestratorPanel lastLog={lastLog} onRefresh={loadAll} onCompileComplete={(compiled) => {
        setCallQueue(compiled);
        setLeads(compiled.filter(c => c.primary_source === "Lead"));
        setProspects(compiled.filter(c => c.primary_source === "Prospect"));
      }} />}
      {tab === "call_queue" && <CallListTab queue={callQueue} callLogs={callLogs} onRefresh={loadAll} />}
      {tab === "crm" && <CRMView />}
      {tab === "prospects" && <ProspectDatabaseTab prospects={prospects} callLogs={callLogs} onRefresh={loadAll} />}
      {tab === "templates" && <EmailTemplatesView />}
      {tab === "closed" && <ClosedDealsTab callLogs={callLogs.filter(l => l.call_outcome === "Sold")} onRefresh={loadAll} />}
      {tab === "followups" && <FollowUpTab callLogs={callLogs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome))} queue={callQueue} onRefresh={loadAll} />}
      {tab === "products" && <ProductReferencePanel />}
    </div>
  );
}