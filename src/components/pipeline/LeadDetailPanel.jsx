import { X, Phone, PhoneCall, Mail, Globe, MapPin, Users, Sparkles, FileText, Lightbulb, Trash2, ExternalLink, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCORE_COLOR = (s) => {
  if (s >= 80) return "text-primary";
  if (s >= 60) return "text-emerald-400";
  if (s >= 40) return "text-yellow-400";
  return "text-red-400";
};

export default function LeadDetailPanel({ lead, onClose, onDelete, onChatCommand }) {
  if (!lead) return null;

  const cmd = (text) => {
    if (onChatCommand) onChatCommand(text);
  };

  return (
    <div className="w-80 md:w-96 h-full glass-panel overflow-y-auto border-l border-white/[0.06] flex-shrink-0">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-foreground truncate">{lead.company}</h2>
            <p className="text-sm text-muted-foreground">{lead.contact_name || "Unknown contact"}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Score + Priority */}
        <div className="flex gap-3">
          {lead.score > 0 && (
            <div className="glass-card rounded-lg p-3 flex-1 text-center">
              <div className={cn("text-2xl font-black", SCORE_COLOR(lead.score))}>{lead.score}</div>
              <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">SCORE</div>
            </div>
          )}
          {lead.priority > 0 && (
            <div className="glass-card rounded-lg p-3 flex-1 text-center">
              <div className="text-2xl font-black text-primary">{lead.priority}</div>
              <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">PRIORITY</div>
            </div>
          )}
          {lead.estimated_value > 0 && (
            <div className="glass-card rounded-lg p-3 flex-1 text-center">
              <div className="text-lg font-black text-primary">${(lead.estimated_value / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">VALUE</div>
            </div>
          )}
        </div>

        {/* Contact Actions */}
        <div className="grid grid-cols-2 gap-2">
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="glass-card rounded-lg p-2.5 flex items-center gap-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all">
              <Phone className="w-3.5 h-3.5" />Call
            </a>
          )}
          {lead.phone && (
            <button onClick={() => cmd(`Make an AI call to ${lead.company} at ${lead.phone}`)} className="glass-card rounded-lg p-2.5 flex items-center gap-2 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-all">
              <PhoneCall className="w-3.5 h-3.5" />AI Call
            </button>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="glass-card rounded-lg p-2.5 flex items-center gap-2 text-xs font-medium text-orange-400 hover:bg-orange-500/10 transition-all">
              <Mail className="w-3.5 h-3.5" />Email
            </a>
          )}
          {lead.email && (
            <button onClick={() => cmd(`Send an outreach email to ${lead.company} at ${lead.email}`)} className="glass-card rounded-lg p-2.5 flex items-center gap-2 text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-all">
              <Mail className="w-3.5 h-3.5" />AI Email
            </button>
          )}
          {lead.email && (
            <button onClick={() => cmd(`Add ${lead.company} (${lead.email}) to mass email list`)} className="glass-card rounded-lg p-2.5 flex items-center gap-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-all col-span-2">
              <Mail className="w-3.5 h-3.5" />Add to Mass Email
            </button>
          )}
        </div>

        {/* Info rows */}
        <div className="space-y-2 text-sm">
          {lead.website && (
            <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors">
              <Globe className="w-3.5 h-3.5" /><span className="truncate">{lead.website}</span><ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          )}
          {(lead.city || lead.state || lead.zip || lead.location) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />{lead.city ? [lead.city, lead.state, lead.zip].filter(Boolean).join(", ") : lead.location}
            </div>
          )}
          {lead.employee_count > 0 && <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3.5 h-3.5" />{lead.employee_count} employees</div>}
          {lead.existing_material && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="w-3.5 h-3.5" />Material: {lead.existing_material}</div>}
          {lead.equipment_used && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="w-3.5 h-3.5" />Equipment: {lead.equipment_used}</div>}
          {lead.years_in_business > 0 && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="w-3.5 h-3.5" />{lead.years_in_business} yrs in business</div>}
        </div>

        {/* AI Insight */}
        {lead.ai_insight && (
          <div className="glass-card rounded-lg p-3 text-xs text-foreground/80">
            <div className="flex items-center gap-1 text-primary font-semibold mb-1"><Sparkles className="w-3 h-3" />AI Insight</div>
            {lead.ai_insight}
          </div>
        )}

        {/* Profile + Recommendation Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => cmd(`Show me the full profile for ${lead.company}`)}
            className="glass-card-active rounded-lg p-3 text-center group"
          >
            <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
            <span className="text-[11px] font-bold text-primary">Profile</span>
          </button>
          <button
            onClick={() => cmd(`Give me an XPS product recommendation for ${lead.company} based on their existing materials: ${lead.existing_material || 'unknown'}`)}
            className="glass-card-active rounded-lg p-3 text-center group"
          >
            <Lightbulb className="w-5 h-5 mx-auto mb-1 text-primary" />
            <span className="text-[11px] font-bold text-primary">Recommendation</span>
          </button>
        </div>

        {/* Recommendation display */}
        {lead.ai_recommendation && (
          <div className="glass-card rounded-lg p-3 text-xs text-foreground/80">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1"><Lightbulb className="w-3 h-3" />AI Recommendation</div>
            {lead.ai_recommendation}
          </div>
        )}

        {/* Validation notes */}
        {lead.validation_notes && (
          <div className="glass-card rounded-lg p-3 text-xs text-foreground/80">
            <div className="flex items-center gap-1 text-blue-400 font-semibold mb-1"><FileText className="w-3 h-3" />Validation Notes</div>
            {lead.validation_notes}
          </div>
        )}

        <Button variant="destructive" size="sm" className="w-full text-xs" onClick={() => onDelete(lead.id)}>
          <Trash2 className="w-3 h-3 mr-1" />Delete Lead
        </Button>
      </div>
    </div>
  );
}