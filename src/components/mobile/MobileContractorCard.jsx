import { Mail, Phone, Send, Loader2, MapPin } from "lucide-react";
import { StatusBadge } from "../shared/DataPageLayout";
import { Button } from "@/components/ui/button";

export default function MobileContractorCard({ contractor, relColors, onSendIntro, sending }) {
  const c = contractor;
  return (
    <div className="p-4 rounded-xl border border-border bg-card/30">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{c.company_name}</div>
          <div className="text-xs text-muted-foreground truncate">{c.contact_name}{c.title ? ` — ${c.title}` : ""}</div>
        </div>
        <StatusBadge status={c.relationship_status || "New"} colorMap={relColors} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        {c.contractor_type && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{c.contractor_type}</span>
        )}
        {(c.city || c.state) && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.city}, {c.state}</span>
        )}
      </div>

      <div className="flex items-center gap-1 pt-2 border-t border-border/50">
        {!c.intro_sent && c.email && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => onSendIntro(c.id)} disabled={sending}>
            {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Send Intro
          </Button>
        )}
        {c.email && <a href={`mailto:${c.email}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><Mail className="w-3.5 h-3.5" /></a>}
        {c.phone && <a href={`tel:${c.phone}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><Phone className="w-3.5 h-3.5" /></a>}
      </div>
    </div>
  );
}