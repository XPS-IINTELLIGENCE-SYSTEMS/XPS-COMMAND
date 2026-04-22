import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Users, PhoneForwarded, Trophy, Clock, RefreshCcw, Loader2, Filter, Search, ArrowUpDown, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import CallListTab from "./CallListTab";
import ClosedDealsTab from "./ClosedDealsTab";
import FollowUpTab from "./FollowUpTab";
import ProductReferencePanel from "./ProductReferencePanel";
import ProspectDatabaseTab from "./ProspectDatabaseTab";

const TABS = [
  { id: "active", label: "Call Queue", icon: Phone, color: "#d4af37" },
  { id: "prospects", label: "Prospect DB", icon: Radar, color: "#ef4444" },
  { id: "closed", label: "Closed Deals", icon: Trophy, color: "#22c55e" },
  { id: "followup", label: "Follow-Ups", icon: Clock, color: "#f59e0b" },
  { id: "products", label: "XPS Products", icon: Users, color: "#6366f1" },
];

export default function CallCenterView() {
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [callQueue, setCallQueue] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [leads, contractors, gcCompanies, jobs, logs, prospectList] = await Promise.all([
      base44.entities.Lead.list("-score", 200).catch(() => []),
      base44.entities.Contractor.list("-score", 200).catch(() => []),
      base44.entities.ContractorCompany.list("-created_date", 200).catch(() => []),
      base44.entities.CommercialJob.list("-urgency_score", 100).catch(() => []),
      base44.entities.CallLog.list("-created_date", 500).catch(() => []),
      base44.entities.ProspectCompany.list("-cold_call_priority", 500).catch(() => []),
    ]);
    setProspects(prospectList);
    setCallLogs(logs);

    // Build unified call queue — merge all sources, skip already-logged
    const loggedSourceIds = new Set(logs.map(l => l.source_id));
    const queue = [];

    leads.forEach(l => {
      if (!l.phone && !l.email) return;
      queue.push({
        id: l.id,
        source_type: "Lead",
        source_id: l.id,
        company_name: l.company || "Unknown",
        contact_name: l.contact_name || "",
        phone: l.phone || "",
        email: l.email || "",
        website: l.website || "",
        location: l.location || `${l.city || ""}, ${l.state || ""}`.trim(),
        priority: l.priority || Math.round((l.score || 50) / 10),
        score: l.score || 0,
        employee_count: l.employee_count || 0,
        years_in_business: l.years_in_business || 0,
        vertical: l.vertical || "",
        specialty: l.specialty || "",
        existing_products: l.existing_material || "",
        equipment: l.equipment_used || "",
        ai_insight: l.ai_insight || "",
        ai_recommendation: l.ai_recommendation || "",
        sentiment: l.sentiment_label || "",
        stage: l.stage || "Incoming",
        lead_type: l.lead_type || "XPress",
        notes: l.notes || "",
        profile_url: l.profile_url || "",
        estimated_value: l.estimated_value || 0,
        logged: loggedSourceIds.has(l.id),
        lastLog: logs.find(log => log.source_id === l.id),
      });
    });

    contractors.forEach(c => {
      if (!c.phone && !c.email) return;
      queue.push({
        id: c.id,
        source_type: "Contractor",
        source_id: c.id,
        company_name: c.company_name || "Unknown",
        contact_name: c.contact_name || "",
        phone: c.phone || "",
        email: c.email || "",
        website: c.website || "",
        location: `${c.city || ""}, ${c.state || ""}`.trim(),
        priority: Math.round((c.score || 50) / 10),
        score: c.score || 0,
        employee_count: c.employee_count || 0,
        vertical: c.contractor_type || "",
        specialty: c.specialty || "",
        notes: c.notes || "",
        relationship: c.relationship_status || "New",
        logged: loggedSourceIds.has(c.id),
        lastLog: logs.find(log => log.source_id === c.id),
      });
    });

    gcCompanies.forEach(gc => {
      if (!gc.phone && !gc.email) return;
      queue.push({
        id: gc.id,
        source_type: "ContractorCompany",
        source_id: gc.id,
        company_name: gc.company_name || "Unknown",
        contact_name: gc.preconstruction_contact_name || gc.estimator_name || "",
        phone: gc.phone || gc.preconstruction_phone || gc.estimator_phone || "",
        email: gc.email || gc.preconstruction_email || gc.estimator_email || "",
        website: gc.website || "",
        location: `${gc.city || ""}, ${gc.state || ""}`.trim(),
        priority: gc.relationship_strength === "preferred" ? 9 : gc.relationship_strength === "active" ? 7 : 5,
        score: gc.jobs_won_count ? 80 : 50,
        employee_count: gc.employee_count || 0,
        vertical: "General Contractor",
        notes: gc.notes || "",
        relationship: gc.bid_list_status || "not_contacted",
        logged: loggedSourceIds.has(gc.id),
        lastLog: logs.find(log => log.source_id === gc.id),
      });
    });

    jobs.forEach(j => {
      if (!j.gc_phone && !j.gc_email && !j.owner_phone && !j.owner_email) return;
      queue.push({
        id: j.id,
        source_type: "CommercialJob",
        source_id: j.id,
        company_name: j.gc_name || j.owner_name || j.job_name || "Unknown",
        contact_name: j.gc_contact || j.owner_contact || "",
        phone: j.gc_phone || j.owner_phone || "",
        email: j.gc_email || j.owner_email || "",
        website: "",
        location: `${j.city || ""}, ${j.state || ""}`.trim(),
        priority: Math.round((j.urgency_score || j.lead_score || 50) / 10),
        score: j.lead_score || j.urgency_score || 50,
        vertical: j.project_type || "",
        notes: j.notes || "",
        job_name: j.job_name || "",
        project_phase: j.project_phase || "",
        estimated_value: j.estimated_flooring_value || j.project_value || 0,
        logged: loggedSourceIds.has(j.id),
        lastLog: logs.find(log => log.source_id === j.id),
      });
    });

    // Add prospect companies to the call queue
    prospectList.forEach(p => {
      if (!p.phone && !p.email) return;
      if (p.cold_call_status === "Sold" || p.cold_call_status === "Not Interested" || p.cold_call_status === "Out of Business") return;
      queue.push({
        id: p.id,
        source_type: "ProspectCompany",
        source_id: p.id,
        company_name: p.company_name || "Unknown",
        contact_name: p.owner_name || "",
        phone: p.phone || "",
        email: p.email || "",
        website: p.website || "",
        location: `${p.city || ""}, ${p.state || ""}`.trim(),
        priority: p.cold_call_priority || 5,
        score: (p.cold_call_priority || 5) * 10,
        employee_count: p.employee_count || 0,
        years_in_business: p.years_in_business || 0,
        vertical: p.specialty || "Epoxy",
        specialty: p.specialty || "",
        existing_products: p.current_products || "",
        ai_insight: p.ai_summary || "",
        ai_recommendation: p.ai_pitch || "",
        notes: p.notes || "",
        lead_type: "XPress",
        logged: loggedSourceIds.has(p.id),
        lastLog: logs.find(log => log.source_id === p.id),
      });
    });

    // Sort by priority descending
    queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    setCallQueue(queue);
    setLoading(false);
  };

  const stats = {
    total: callQueue.length,
    called: callLogs.length,
    sold: callLogs.filter(l => l.call_outcome === "Sold").length,
    callbacks: callLogs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome)).length,
    prospects: prospects.length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Phone className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-lg font-black metallic-gold">XPS Call Center</h1>
            <p className="text-[11px] text-muted-foreground">AI-Enhanced Outbound Call System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Total Queue", value: stats.total, color: "#d4af37" },
          { label: "Prospect DB", value: stats.prospects, color: "#ef4444" },
          { label: "Calls Made", value: stats.called, color: "#3b82f6" },
          { label: "Closed Deals", value: stats.sold, color: "#22c55e" },
          { label: "Follow-Ups", value: stats.callbacks, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
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
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {tab === "active" && <CallListTab queue={callQueue} callLogs={callLogs} onRefresh={loadAll} />}
          {tab === "prospects" && <ProspectDatabaseTab prospects={prospects} callLogs={callLogs} onRefresh={loadAll} />}
          {tab === "closed" && <ClosedDealsTab callLogs={callLogs.filter(l => l.call_outcome === "Sold")} onRefresh={loadAll} />}
          {tab === "followup" && <FollowUpTab callLogs={callLogs.filter(l => ["Callback", "No Answer", "Voicemail"].includes(l.call_outcome))} queue={callQueue} onRefresh={loadAll} />}
          {tab === "products" && <ProductReferencePanel />}
        </>
      )}
    </div>
  );
}