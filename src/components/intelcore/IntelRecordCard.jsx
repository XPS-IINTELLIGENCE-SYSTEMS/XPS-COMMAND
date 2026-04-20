import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Clock, Tag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

const CAT_COLORS = {
  website: "#6366f1", pricing: "#22c55e", product: "#f59e0b", social_media: "#ec4899",
  youtube: "#ef4444", branding: "#8b5cf6", keywords: "#0ea5e9", seo: "#14b8a6",
  location: "#06b6d4", team: "#a855f7", news: "#84cc16", review: "#f43f5e",
  training: "#d4af37", industry_data: "#64748b", market_trend: "#10b981",
};

const SRC_LABELS = {
  XPS: "Xtreme Polishing", NCP: "National Concrete", CPU: "Polishing University",
  "XPS Xpress": "XPS Xpress", "Epoxy Network": "Epoxy Network",
  "XPS Intelligence": "XPS Intel", "XPS Location": "Location",
};

export default function IntelRecordCard({ record }) {
  const [open, setOpen] = useState(false);
  const color = CAT_COLORS[record.category] || "#64748b";

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-3 flex items-start gap-3">
        <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground truncate">{record.title}</span>
            <Badge variant="outline" className="text-[8px] h-4 px-1.5" style={{ borderColor: color, color }}>
              {record.category?.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
            <span className="font-medium" style={{ color }}>{SRC_LABELS[record.source_company] || record.source_company}</span>
            {record.location_name && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{record.location_name}</span>}
            {record.scraped_at && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{moment(record.scraped_at).fromNow()}</span>}
            {record.confidence_score > 0 && <span>{record.confidence_score}%</span>}
          </div>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
          {record.content && (
            <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto bg-secondary/30 rounded p-2">
              {record.content.slice(0, 2000)}
            </pre>
          )}
          {record.pricing_data && (
            <div><span className="text-[9px] font-bold text-green-400">Pricing:</span>
              <pre className="text-[9px] text-muted-foreground bg-secondary/30 rounded p-2 mt-1 max-h-32 overflow-y-auto">{record.pricing_data.slice(0, 800)}</pre>
            </div>
          )}
          {record.keyword_data && (
            <div><span className="text-[9px] font-bold text-blue-400">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(() => { try { return JSON.parse(record.keyword_data).slice(0, 15); } catch { return []; } })().map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-[8px] h-4"><Tag className="w-2 h-2 mr-0.5" />{kw}</Badge>
                ))}
              </div>
            </div>
          )}
          {record.engagement_metrics && (
            <div><span className="text-[9px] font-bold text-pink-400">Engagement:</span>
              <span className="text-[9px] text-muted-foreground ml-2">{record.engagement_metrics.slice(0, 300)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {record.tags && <span className="flex-1 text-[8px] text-muted-foreground/60 truncate">{record.tags}</span>}
            {record.source_url && (
              <a href={record.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-primary hover:underline">
                <ExternalLink className="w-2.5 h-2.5" /> Source
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}