import { useState } from "react";
import { Phone, Mail, Globe, MapPin, Brain, ChevronDown, ChevronUp, ExternalLink, Shield, Send, MessageCircle, FileText, Bot, Loader2, Star, Building2, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CRMValidationPanel from "./CRMValidationPanel";
import CallActionBar from "../callcenter/CallActionBar";
import PowerToolsBar from "../shared/PowerToolsBar";

const STAGE_COLORS = {
  Incoming: "#6b7280", Validated: "#3b82f6", Qualified: "#8b5cf6", Prioritized: "#f59e0b",
  Contacted: "#a855f7", Proposal: "#f97316", Negotiation: "#ec4899", Won: "#22c55e", Lost: "#ef4444",
};

const SOURCE_BADGES = {
  "Contractor DB": "#22c55e", "GC DB": "#3b82f6", "CommercialJob": "#f59e0b",
  "ProspectDB": "#ef4444", Manual: "#6b7280", ChatGPT: "#8b5cf6", Scraper: "#14b8a6",
  HubSpot: "#f97316", Other: "#64748b",
};

export default function CRMContactCard({ lead, onUpdate, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const priorityColor = (lead.priority || 0) >= 8 ? "#ef4444" : (lead.priority || 0) >= 6 ? "#f59e0b" : (lead.priority || 0) >= 4 ? "#3b82f6" : "#6b7280";
  const stageColor = STAGE_COLORS[lead.stage] || "#6b7280";
  const sourceKey = Object.keys(SOURCE_BADGES).find(k => (lead.source || "").includes(k)) || "Other";

  const enrichContact = async () => {
    setEnriching(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Research this business and provide enriched data:
Company: ${lead.company}, Contact: ${lead.contact_name}, Location: ${lead.location || ""}, Industry: ${lead.vertical || ""}
Return: employee_count (number), estimated_revenue (number), years_in_business (number), ai_insight (string analysis), ai_recommendation (string with product recommendations), score (0-100 lead quality)`,
      response_json_schema: {
        type: "object",
        properties: {
          employee_count: { type: "number" },
          estimated_revenue: { type: "number" },
          years_in_business: { type: "number" },
          ai_insight: { type: "string" },
          ai_recommendation: { type: "string" },
          score: { type: "number" },
        },
      },
      add_context_from_internet: true,
      model: "gemini_3_flash",
    });
    await base44.entities.Lead.update(lead.id, {
      employee_count: res.employee_count || lead.employee_count,
      estimated_revenue: res.estimated_revenue || lead.estimated_revenue,
      years_in_business: res.years_in_business || lead.years_in_business,
      ai_insight: res.ai_insight || lead.ai_insight,
      ai_recommendation: res.ai_recommendation || lead.ai_recommendation,
      score: res.score || lead.score,
      pipeline_status: "Validated",
    });
    setEnriching(false);
    onRefresh?.();
  };

  const callContact = {
    id: lead.id, source_type: "Lead", source_id: lead.id,
    company_name: lead.company, contact_name: lead.contact_name,
    phone: lead.phone, email: lead.email, website: lead.website,
    location: lead.location, priority: lead.priority || 5, score: lead.score,
    employee_count: lead.employee_count, years_in_business: lead.years_in_business,
    vertical: lead.vertical, existing_products: lead.existing_material,
    ai_insight: lead.ai_insight,
  };

  return (
    <div className={`glass-card rounded-xl overflow-hidden transition-all ${expanded ? "ring-1 ring-primary/30" : ""}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-background flex-shrink-0" style={{ backgroundColor: priorityColor }}>
          {lead.priority || lead.score ? Math.round((lead.score || 0) / 10) : "–"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground truncate">{lead.company}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${stageColor}20`, color: stageColor }}>{lead.stage}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${SOURCE_BADGES[sourceKey]}15`, color: SOURCE_BADGES[sourceKey] }}>
              {lead.lead_type || "XPress"}
            </span>
            {lead.sentiment_label && (
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${lead.sentiment_label === "Hot" || lead.sentiment_label === "On Fire" ? "bg-red-500/20 text-red-400" : lead.sentiment_label === "Warm" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>{lead.sentiment_label}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
            {lead.contact_name && <span>{lead.contact_name}</span>}
            {lead.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{lead.phone}</span>}
            {lead.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{lead.location}</span>}
            {lead.estimated_value > 0 && <span className="flex items-center gap-0.5 text-green-400 font-bold"><DollarSign className="w-2.5 h-2.5" />${lead.estimated_value.toLocaleString()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {lead.phone && <a href={`tel:${lead.phone}`} className="p-2 rounded-lg hover:bg-green-500/20 text-green-400"><Phone className="w-4 h-4" /></a>}
          {lead.email && <a href={`mailto:${lead.email}`} className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400"><Mail className="w-4 h-4" /></a>}
          <button onClick={() => { setExpanded(true); enrichContact(); }} disabled={enriching} className="p-2 rounded-lg hover:bg-primary/20 text-primary">
            {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          </button>
          <button onClick={() => { setExpanded(true); setShowValidation(true); }} className="p-2 rounded-lg hover:bg-yellow-500/20 text-yellow-400">
            <Shield className="w-4 h-4" />
          </button>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border/30 p-3 space-y-3">
          {/* Details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            {lead.vertical && <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Industry</span><span className="font-bold">{lead.vertical}</span></div>}
            {lead.specialty && <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Specialty</span><span className="font-bold">{lead.specialty}</span></div>}
            {lead.employee_count > 0 && <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Employees</span><span className="font-bold">{lead.employee_count}</span></div>}
            {lead.years_in_business > 0 && <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Years in Biz</span><span className="font-bold">{lead.years_in_business}</span></div>}
            {lead.estimated_revenue > 0 && <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Revenue</span><span className="font-bold text-green-400">${(lead.estimated_revenue / 1000).toFixed(0)}k</span></div>}
            {lead.score > 0 && <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">AI Score</span><span className="font-bold text-primary">{lead.score}/100</span></div>}
            {lead.existing_material && <div className="bg-secondary/50 rounded-lg p-2 col-span-2"><span className="text-muted-foreground block">Current Products</span><span className="font-bold">{lead.existing_material}</span></div>}
            {lead.website && (
              <div className="bg-secondary/50 rounded-lg p-2 col-span-2">
                <span className="text-muted-foreground block">Website</span>
                <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="font-bold text-primary flex items-center gap-1 truncate">{lead.website} <ExternalLink className="w-2.5 h-2.5" /></a>
              </div>
            )}
          </div>

          {/* AI insights */}
          {lead.ai_insight && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
              <span className="text-[9px] font-bold text-primary block mb-0.5">AI Insight</span>
              <p className="text-[10px] text-foreground/80">{lead.ai_insight}</p>
            </div>
          )}
          {lead.ai_recommendation && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
              <span className="text-[9px] font-bold text-green-400 block mb-0.5">Product Recommendation</span>
              <p className="text-[10px] text-foreground/80">{lead.ai_recommendation}</p>
            </div>
          )}

          {/* Validation panel */}
          {showValidation && <CRMValidationPanel contact={lead} onClose={() => setShowValidation(false)} />}

          {/* Stage management */}
          <div>
            <div className="text-[10px] font-bold text-muted-foreground mb-1.5">Move Stage</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(STAGE_COLORS).filter(([s]) => s !== lead.stage).map(([stage, color]) => (
                <button key={stage} onClick={async () => { await base44.entities.Lead.update(lead.id, { stage }); onRefresh?.(); }}
                  className="px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Power Tools — Takeoff, Proposal, Website, Workflow, Project */}
          <PowerToolsBar contact={callContact} compact={true} />

          {/* Call Center integration */}
          <CallActionBar contact={callContact} onOutcome={() => onRefresh?.()} intel={null} />
        </div>
      )}
    </div>
  );
}