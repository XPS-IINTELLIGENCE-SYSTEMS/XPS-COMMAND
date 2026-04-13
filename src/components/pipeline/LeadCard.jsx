import { Phone, Globe, MapPin, Users, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SCORE_COLOR = (s) => {
  if (s >= 80) return "text-primary bg-primary/15 border-primary/30"; // gold = excellent
  if (s >= 60) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"; // green = good
  if (s >= 40) return "text-yellow-400 bg-yellow-500/15 border-yellow-500/30"; // yellow = neutral
  return "text-red-400 bg-red-500/15 border-red-500/30"; // red = low
};

const SOURCE_BADGE = {
  ChatGPT: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Scraper: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Attachment: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Google Drive": "bg-green-500/20 text-green-300 border-green-500/30",
  Supabase: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Manual: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  HubSpot: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Other: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function LeadCard({ lead, index, onClick }) {
  const isAlt = index % 2 === 1;
  const scoreClass = SCORE_COLOR(lead.score || 0);
  const srcBadge = SOURCE_BADGE[lead.ingestion_source] || SOURCE_BADGE.Other;

  return (
    <button
      onClick={() => onClick(lead)}
      className={cn(
        "shimmer-card flex-shrink-0 w-64 rounded-xl p-3.5 text-left transition-all duration-200 group",
        isAlt ? "glass-card" : "glass-card-active"
      )}
    >
      {/* Top row: company + score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-sm font-bold text-foreground truncate flex-1">{lead.company}</div>
        {lead.score > 0 && (
          <div className={cn("flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md border", scoreClass)}>
            {lead.score}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="text-[11px] text-muted-foreground truncate mb-1.5">{lead.contact_name || "—"}</div>

      {/* Source badge */}
      <div className={cn("inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full border mb-2", srcBadge)}>
        {lead.ingestion_source || "Manual"}
      </div>

      {/* Key info */}
      <div className="space-y-1 text-[10px] text-muted-foreground">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
            <Phone className="w-3 h-3" />{lead.phone}
          </a>
        )}
        {lead.website && (
          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors truncate">
            <Globe className="w-3 h-3" />{lead.website}
          </a>
        )}
        {(lead.city || lead.state || lead.zip) && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}
          </div>
        )}
        {lead.employee_count > 0 && (
          <div className="flex items-center gap-1.5"><Users className="w-3 h-3" />{lead.employee_count} employees</div>
        )}
      </div>

      {/* Value + expand hint */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.06]">
        {lead.estimated_value > 0 ? (
          <span className="text-xs font-bold text-primary">${lead.estimated_value.toLocaleString()}</span>
        ) : (
          <span className="text-[10px] text-muted-foreground/40">No estimate</span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}