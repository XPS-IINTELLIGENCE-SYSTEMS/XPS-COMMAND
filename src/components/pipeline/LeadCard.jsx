import { Phone, Globe, MapPin, Users, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SCORE_COLOR = (s) => {
  if (s >= 80) return "text-emerald-300 bg-emerald-500/15 border-emerald-500/30";
  if (s >= 60) return "text-cyan-300 bg-cyan-500/15 border-cyan-500/30";
  if (s >= 40) return "text-yellow-300 bg-yellow-500/15 border-yellow-500/30";
  return "text-red-300 bg-red-500/15 border-red-500/30";
};

const SOURCE_BADGE = {
  ChatGPT: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  Scraper: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Attachment: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Google Drive": "bg-green-500/15 text-green-300 border-green-500/25",
  Supabase: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  Manual: "bg-slate-500/15 text-slate-300 border-slate-500/25",
  HubSpot: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  Other: "bg-slate-500/15 text-slate-300 border-slate-500/25",
};

export default function LeadCard({ lead, index, onClick }) {
  const isGlass = index % 2 === 1;
  const scoreClass = SCORE_COLOR(lead.score || 0);
  const srcBadge = SOURCE_BADGE[lead.ingestion_source] || SOURCE_BADGE.Other;

  return (
    <button
      onClick={() => onClick(lead)}
      className={cn(
        "shimmer-card flex-shrink-0 w-64 h-52 rounded-2xl p-4 text-left transition-all duration-200 group flex flex-col animated-silver-border",
        isGlass
          ? "bg-white/[0.05] backdrop-blur-2xl border border-white/[0.12]"
          : "bg-black/70 backdrop-blur-xl border border-white/[0.08]",
        "hover:border-white/[0.25] hover:shadow-[0_0_30px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]",
        "hover:bg-white/[0.08]"
      )}
    >
      {/* Top row: company + score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-base font-bold text-foreground truncate flex-1 leading-tight">{lead.company}</div>
        {lead.score > 0 && (
          <div className={cn("flex-shrink-0 text-xs font-black px-2 py-1 rounded-lg border", scoreClass)}>
            {lead.score}
          </div>
        )}
      </div>

      {/* Contact + source */}
      <div className="text-sm text-muted-foreground truncate">{lead.contact_name || "—"}</div>
      <div className="flex items-center gap-2 mt-1.5 mb-2">
        <div className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", srcBadge)}>
          {lead.ingestion_source || "Manual"}
        </div>
        {lead.vertical && (
          <span className="text-xs text-muted-foreground/70 truncate">{lead.vertical}</span>
        )}
      </div>

      {/* Key info */}
      <div className="space-y-1 text-sm text-muted-foreground flex-1 min-h-0">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors truncate">
            <Phone className="w-3 h-3 flex-shrink-0" /><span className="truncate">{lead.phone}</span>
          </a>
        )}
        {lead.website && (
          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors truncate">
            <Globe className="w-3 h-3 flex-shrink-0" /><span className="truncate">{lead.website}</span>
          </a>
        )}
        {(lead.city || lead.state || lead.zip) && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          {lead.employee_count > 0 && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{lead.employee_count}</span>
          )}
          {lead.years_in_business > 0 && (
            <span>{lead.years_in_business}yr</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-white transition-colors" />
      </div>
    </button>
  );
}