import { Phone, Globe, MapPin, Users, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SCORE_COLOR = (s) => {
  if (s >= 80) return "text-primary bg-primary/15 border-primary/30";
  if (s >= 60) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
  if (s >= 40) return "text-yellow-400 bg-yellow-500/15 border-yellow-500/30";
  return "text-red-400 bg-red-500/15 border-red-500/30";
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
        "shimmer-card flex-shrink-0 w-56 h-44 rounded-xl p-3 text-left transition-all duration-200 group flex flex-col",
        isAlt ? "glass-card" : "glass-card-active"
      )}
    >
      {/* Top row: company + score */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="text-[12px] font-bold text-foreground truncate flex-1 leading-tight">{lead.company}</div>
        {lead.score > 0 && (
          <div className={cn("flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md border", scoreClass)}>
            {lead.score}
          </div>
        )}
      </div>

      {/* Contact + source */}
      <div className="text-[10px] text-muted-foreground truncate">{lead.contact_name || "—"}</div>
      <div className="flex items-center gap-1.5 mt-1 mb-1.5">
        <div className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full border", srcBadge)}>
          {lead.ingestion_source || "Manual"}
        </div>
        {lead.vertical && (
          <span className="text-[8px] text-muted-foreground/70 truncate">{lead.vertical}</span>
        )}
      </div>

      {/* Key info - compact */}
      <div className="space-y-0.5 text-[10px] text-muted-foreground flex-1 min-h-0">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-emerald-400 transition-colors truncate">
            <Phone className="w-2.5 h-2.5 flex-shrink-0" /><span className="truncate">{lead.phone}</span>
          </a>
        )}
        {lead.website && (
          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-blue-400 transition-colors truncate">
            <Globe className="w-2.5 h-2.5 flex-shrink-0" /><span className="truncate">{lead.website}</span>
          </a>
        )}
        {(lead.city || lead.state || lead.zip) && (
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}</span>
          </div>
        )}
        {lead.existing_material && (
          <div className="flex items-center gap-1 truncate">
            <Building2 className="w-2.5 h-2.5 flex-shrink-0" /><span className="truncate">{lead.existing_material}</span>
          </div>
        )}
      </div>

      {/* Footer: employee count + expand */}
      <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
          {lead.employee_count > 0 && (
            <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{lead.employee_count}</span>
          )}
          {lead.years_in_business > 0 && (
            <span>{lead.years_in_business}yr</span>
          )}
        </div>
        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}