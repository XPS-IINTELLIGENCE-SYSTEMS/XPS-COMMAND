import { useState } from "react";
import { Phone, Mail, Globe, MapPin, Users, Calendar, Star, MessageCircle, Send, Share2, Brain, FileText, ChevronDown, ChevronUp, ExternalLink, Loader2, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CallScriptPanel from "./CallScriptPanel";
import CallActionBar from "./CallActionBar";

const SOURCE_COLORS = { Lead: "#d4af37", Contractor: "#22c55e", ContractorCompany: "#3b82f6", CommercialJob: "#f59e0b" };

export default function CallContactCard({ contact, onOutcome, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [generatingIntel, setGeneratingIntel] = useState(false);
  const [intel, setIntel] = useState(null);

  const generateIntel = async () => {
    setGeneratingIntel(true);
    const prompt = `You are an XPS sales intelligence AI. Generate a caller briefing for a cold call to this company.

Company: ${contact.company_name}
Contact: ${contact.contact_name}
Industry: ${contact.vertical || "Unknown"}
Specialty: ${contact.specialty || "Unknown"}
Location: ${contact.location}
Employees: ${contact.employee_count || "Unknown"}
Current Products: ${contact.existing_products || "Unknown"}
Equipment: ${contact.equipment || "Unknown"}
AI Insight: ${contact.ai_insight || "None"}
Notes: ${contact.notes || "None"}
Score: ${contact.score}/100

Provide:
1. business_summary: 2-3 sentence company overview
2. positive_remarks: 3 genuine compliments about their business to build rapport
3. pitch_recommendation: Specific XPS products to pitch based on their needs
4. opening_script: Natural conversation opener
5. rebuttals: 3 common objections and responses
6. deal_recommendation: Best offer/deal to close them`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          business_summary: { type: "string" },
          positive_remarks: { type: "array", items: { type: "string" } },
          pitch_recommendation: { type: "string" },
          opening_script: { type: "string" },
          rebuttals: { type: "array", items: { type: "object", properties: { objection: { type: "string" }, response: { type: "string" } } } },
          deal_recommendation: { type: "string" },
        },
      },
    });
    setIntel(res);
    setGeneratingIntel(false);
  };

  const priorityColor = contact.priority >= 8 ? "#ef4444" : contact.priority >= 6 ? "#f59e0b" : contact.priority >= 4 ? "#3b82f6" : "#6b7280";
  const outcomeLabel = contact.lastLog?.call_outcome;

  return (
    <div className={`glass-card rounded-xl overflow-hidden transition-all ${expanded ? "ring-1 ring-primary/30" : ""}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Priority */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-background flex-shrink-0" style={{ backgroundColor: priorityColor }}>
          {contact.priority || "–"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{contact.company_name}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ backgroundColor: `${SOURCE_COLORS[contact.source_type]}20`, color: SOURCE_COLORS[contact.source_type] }}>
              {contact.source_type === "ContractorCompany" ? "GC" : contact.source_type === "CommercialJob" ? "Job" : contact.source_type}
            </span>
            {contact.sentiment && (
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                contact.sentiment === "Hot" || contact.sentiment === "On Fire" ? "bg-red-500/20 text-red-400" :
                contact.sentiment === "Warm" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
              }`}>{contact.sentiment}</span>
            )}
            {outcomeLabel && outcomeLabel !== "Pending" && (
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                outcomeLabel === "Sold" ? "bg-green-500/20 text-green-400" :
                outcomeLabel === "Best Lead" ? "bg-yellow-500/20 text-yellow-400" :
                outcomeLabel === "Callback" ? "bg-blue-500/20 text-blue-400" :
                "bg-red-500/20 text-red-400"
              }`}>{outcomeLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
            <span>{contact.contact_name}</span>
            {contact.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{contact.phone}</span>}
            {contact.location && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{contact.location}</span>}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors">
              <Phone className="w-4 h-4" />
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => { setExpanded(true); generateIntel(); }} className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors">
            <Brain className="w-4 h-4" />
          </button>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/30 p-3 space-y-3">
          {/* Contact details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            {contact.employee_count > 0 && (
              <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Employees</span><span className="font-bold text-foreground">{contact.employee_count}</span></div>
            )}
            {contact.years_in_business > 0 && (
              <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Years in Biz</span><span className="font-bold text-foreground">{contact.years_in_business}</span></div>
            )}
            {contact.estimated_value > 0 && (
              <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Est. Value</span><span className="font-bold text-green-400">${contact.estimated_value.toLocaleString()}</span></div>
            )}
            {contact.vertical && (
              <div className="bg-secondary/50 rounded-lg p-2"><span className="text-muted-foreground block">Industry</span><span className="font-bold text-foreground">{contact.vertical}</span></div>
            )}
            {contact.existing_products && (
              <div className="bg-secondary/50 rounded-lg p-2 col-span-2"><span className="text-muted-foreground block">Current Products</span><span className="font-bold text-foreground">{contact.existing_products}</span></div>
            )}
            {contact.website && (
              <div className="bg-secondary/50 rounded-lg p-2 col-span-2">
                <span className="text-muted-foreground block">Website</span>
                <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="font-bold text-primary flex items-center gap-1 truncate">{contact.website} <ExternalLink className="w-2.5 h-2.5" /></a>
              </div>
            )}
          </div>

          {/* AI Insight */}
          {contact.ai_insight && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
              <span className="text-[9px] font-bold text-primary block mb-0.5">AI Insight</span>
              <p className="text-[10px] text-foreground/80">{contact.ai_insight}</p>
            </div>
          )}

          {/* AI Intel (generated) */}
          {generatingIntel && (
            <div className="flex items-center gap-2 py-3 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Generating caller intelligence...</span>
            </div>
          )}

          {intel && (
            <div className="space-y-2 bg-secondary/30 rounded-xl p-3">
              <h4 className="text-[11px] font-bold text-primary flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> Caller Intelligence</h4>
              <div className="text-[10px] text-foreground/80">{intel.business_summary}</div>
              {intel.positive_remarks?.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-green-400 block mb-1">✨ Rapport Builders</span>
                  {intel.positive_remarks.map((r, i) => (
                    <p key={i} className="text-[10px] text-foreground/70 ml-2">• {r}</p>
                  ))}
                </div>
              )}
              <div>
                <span className="text-[9px] font-bold text-primary block mb-1">🎯 Pitch Recommendation</span>
                <p className="text-[10px] text-foreground/80">{intel.pitch_recommendation}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-yellow-400 block mb-1">📞 Opening Script</span>
                <p className="text-[10px] text-foreground/80 italic">"{intel.opening_script}"</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-green-400 block mb-1">💰 Recommended Deal</span>
                <p className="text-[10px] text-foreground/80">{intel.deal_recommendation}</p>
              </div>
              {intel.rebuttals?.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-red-400 block mb-1">🛡️ Rebuttals</span>
                  {intel.rebuttals.map((r, i) => (
                    <div key={i} className="ml-2 mb-1.5">
                      <p className="text-[9px] text-red-400/80">Objection: {r.objection}</p>
                      <p className="text-[10px] text-foreground/80">→ {r.response}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action bar */}
          <CallActionBar contact={contact} onOutcome={onOutcome} intel={intel} />
        </div>
      )}
    </div>
  );
}