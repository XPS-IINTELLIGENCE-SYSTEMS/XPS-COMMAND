import { X, Calendar, MapPin, Building2, Ruler, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SniperWinningBid from "./SniperWinningBid";

export default function SniperScopeDetail({ scope, allScopes, onClose }) {
  let zones = [];
  try { zones = JSON.parse(scope.extracted_zones || "[]"); } catch {}
  let specials = [];
  try { specials = JSON.parse(scope.special_requirements || "[]"); } catch {}

  return (
    <div className="glass-card rounded-xl p-4 space-y-4 border border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">{scope.project_name}</h2>
          <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{scope.gc_company_name}</span>
            {scope.project_city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{scope.project_city}, {scope.project_state}</span>}
            {scope.bid_due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {scope.bid_due_date}</span>}
            {scope.total_flooring_sqft > 0 && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{scope.total_flooring_sqft.toLocaleString()} SF</span>}
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scope Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="text-[10px] text-muted-foreground mb-1">Project Type</div>
          <div className="text-xs font-medium text-foreground capitalize">{(scope.project_type || "other").replace(/_/g, " ")}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="text-[10px] text-muted-foreground mb-1">Specified System</div>
          <div className="text-xs font-medium text-foreground">{scope.specified_system || "Not specified"}</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="text-[10px] text-muted-foreground mb-1">Bid Status</div>
          <div className="text-xs font-medium text-foreground capitalize">{(scope.bid_status || "not_started").replace(/_/g, " ")}</div>
        </div>
      </div>

      {/* Zones */}
      {zones.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-foreground mb-1.5">Zones ({zones.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {zones.map((z, i) => (
              <div key={i} className="text-[10px] rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
                <span className="font-medium text-foreground">{z.name}</span>
                {z.sqft > 0 && <span className="text-muted-foreground ml-1">({z.sqft.toLocaleString()} SF)</span>}
                {z.system_type && <div className="text-muted-foreground">{z.system_type}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Requirements */}
      {specials.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specials.map((s, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">{s}</span>
          ))}
        </div>
      )}

      {/* AI Winning Bid Analyzer */}
      <SniperWinningBid scope={scope} allScopes={allScopes} />
    </div>
  );
}