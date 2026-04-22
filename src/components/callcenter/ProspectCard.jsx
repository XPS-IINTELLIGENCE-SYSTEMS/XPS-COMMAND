import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Phone, Mail, Globe, MapPin, Calendar, Sparkles, Loader2, Star, Clock, Building2, Wrench, GraduationCap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import CallActionBar from "./CallActionBar";

const PRIORITY_COLORS = {
  10: { bg: "bg-red-500/20", text: "text-red-400", label: "🔥 Brand New" },
  9: { bg: "bg-orange-500/20", text: "text-orange-400", label: "🔥 Very New" },
  8: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "⚡ New" },
  7: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Fresh" },
  6: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Growing" },
  5: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Established" },
  4: { bg: "bg-gray-600/20", text: "text-gray-500", label: "Veteran" },
};

const STATUS_COLORS = {
  "Not Contacted": "bg-red-500/20 text-red-400",
  "Attempted": "bg-orange-500/20 text-orange-400",
  "Contacted": "bg-blue-500/20 text-blue-400",
  "Interested": "bg-green-500/20 text-green-400",
  "Demo Scheduled": "bg-purple-500/20 text-purple-400",
  "Sold": "bg-emerald-500/20 text-emerald-400",
  "Not Interested": "bg-gray-500/20 text-gray-500",
  "Wrong Number": "bg-gray-600/20 text-gray-600",
  "Out of Business": "bg-gray-700/20 text-gray-600",
};

export default function ProspectCard({ prospect, callLogs, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const p = prospect;
  const priority = PRIORITY_COLORS[p.cold_call_priority] || PRIORITY_COLORS[5];
  const statusColor = STATUS_COLORS[p.cold_call_status] || STATUS_COLORS["Not Contacted"];

  const handleEnrich = async () => {
    setEnriching(true);
    await base44.functions.invoke("enrichProspect", { prospect_id: p.id });
    setEnriching(false);
    onRefresh?.();
  };

  const handleStatusUpdate = async (status) => {
    await base44.entities.ProspectCompany.update(p.id, {
      cold_call_status: status,
      last_contacted: new Date().toISOString(),
      call_count: (p.call_count || 0) + 1,
    });
    onRefresh?.();
  };

  // Build a contact object compatible with CallActionBar
  const callContact = {
    id: p.id,
    source_type: "ProspectCompany",
    source_id: p.id,
    company_name: p.company_name,
    contact_name: p.owner_name || "",
    phone: p.phone || "",
    email: p.email || "",
    notes: p.notes || "",
    priority: p.cold_call_priority || 5,
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header row */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors">
        {/* Priority badge */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${priority.bg} ${priority.text}`}>
          {p.cold_call_priority || 5}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground truncate">{p.company_name}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusColor}`}>{p.cold_call_status}</span>
            <span className="text-[9px] text-primary font-medium px-1.5 py-0.5 rounded-full bg-primary/10">{p.specialty}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
            {p.owner_name && <span>{p.owner_name}</span>}
            {p.phone && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{p.phone}</span>}
            {(p.city || p.state) && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{[p.city, p.state].filter(Boolean).join(", ")}</span>}
            {p.formation_date && <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{p.years_in_business != null ? `${p.years_in_business}yr` : ""}</span>}
            <span className={`font-medium ${priority.text}`}>{priority.label}</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          {p.phone && (
            <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
              <Phone className="w-3.5 h-3.5 text-green-400" />
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
            </a>
          )}
          {!p.enriched && (
            <button onClick={e => { e.stopPropagation(); handleEnrich(); }} disabled={enriching} className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors">
              {enriching ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            {p.address && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Address</span><span className="text-foreground">{p.address}</span></div>}
            {p.website && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Website</span><a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate block">{p.website}</a></div>}
            {p.business_type && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Type</span><span className="text-foreground">{p.business_type}</span></div>}
            {p.formation_date && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Formed</span><span className="text-foreground">{p.formation_date}</span></div>}
            {p.license_number && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">License</span><span className="text-foreground">{p.license_number}</span></div>}
            {p.source && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Source</span><span className="text-foreground">{p.source}</span></div>}
            {p.current_supplier && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Current Supplier</span><span className="text-foreground">{p.current_supplier}</span></div>}
            {p.current_products && <div className="glass-card rounded-lg p-2"><span className="text-muted-foreground block">Current Products</span><span className="text-foreground">{p.current_products}</span></div>}
          </div>

          {/* Needs indicators */}
          <div className="flex gap-2">
            {p.needs_training && <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-purple-500/15 text-purple-400"><GraduationCap className="w-3 h-3" /> Needs Training</span>}
            {p.needs_equipment && <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-orange-500/15 text-orange-400"><Wrench className="w-3 h-3" /> Needs Equipment</span>}
            {p.needs_products && <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-green-500/15 text-green-400"><Package className="w-3 h-3" /> Needs Products</span>}
          </div>

          {/* AI Summary & Pitch */}
          {p.enriched && p.ai_summary && (
            <div className="glass-card rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary"><Sparkles className="w-3 h-3" /> AI Intelligence</div>
              <p className="text-[11px] text-foreground/80">{p.ai_summary}</p>
              {p.ai_pitch && (
                <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-[9px] font-bold text-primary mb-1">Recommended Pitch</div>
                  <p className="text-[10px] text-foreground/70">{p.ai_pitch}</p>
                </div>
              )}
            </div>
          )}

          {!p.enriched && (
            <Button size="sm" variant="outline" className="gap-1.5 w-full" onClick={handleEnrich} disabled={enriching}>
              {enriching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI Enrich — Find Phone, Email, Pitch
            </Button>
          )}

          {/* Call action bar */}
          <CallActionBar
            contact={callContact}
            onOutcome={(contact, outcome) => {
              handleStatusUpdate(outcome === "Sold" ? "Sold" : outcome === "No" ? "Not Interested" : outcome === "Best Lead" ? "Interested" : outcome === "Callback" ? "Contacted" : "Attempted");
            }}
            onRefresh={onRefresh}
          />
        </div>
      )}
    </div>
  );
}