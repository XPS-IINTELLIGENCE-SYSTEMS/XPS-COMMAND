import { Mail, Phone, Brain, ShoppingBag, MapPin, DollarSign } from "lucide-react";
import { StatusBadge, ScoreBadge } from "../shared/DataPageLayout";

export default function MobileLeadCard({ lead, stageColors, bidStageColors, onInsight, onRecommend, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-border bg-card/30 active:bg-card/50 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{lead.company}</div>
          <div className="text-xs text-muted-foreground truncate">{lead.contact_name}</div>
        </div>
        <ScoreBadge score={lead.score} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <StatusBadge status={lead.stage} colorMap={stageColors} />
        {lead.bid_stage && lead.bid_stage !== "Not Started" && (
          <StatusBadge status={lead.bid_stage} colorMap={bidStageColors} />
        )}
        {lead.vertical && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{lead.vertical}</span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        {(lead.city || lead.state) && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city}{lead.state ? `, ${lead.state}` : ""}</span>
        )}
        {lead.estimated_value > 0 && (
          <span className="flex items-center gap-1 text-foreground font-medium"><DollarSign className="w-3 h-3" />{lead.estimated_value.toLocaleString()}</span>
        )}
      </div>

      <div className="flex items-center gap-1 pt-2 border-t border-border/50">
        <button onClick={(e) => { e.stopPropagation(); onInsight?.(lead); }} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary">
          <Brain className="w-3.5 h-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRecommend?.(lead); }} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary">
          <ShoppingBag className="w-3.5 h-3.5" />
        </button>
        {lead.email && (
          <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </button>
  );
}