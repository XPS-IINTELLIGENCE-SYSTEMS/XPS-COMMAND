import { useState } from "react";
import { Lightbulb, Target, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const URGENCY_COLORS = {
  immediate: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400',
};

export default function AIRecommendations({ intelRecords }) {
  const [expandedRec, setExpandedRec] = useState(null);
  const [expandedOpp, setExpandedOpp] = useState(null);

  // Parse latest report that has metadata with recommendations
  const reports = intelRecords
    .filter(r => (r.tags || '').includes('financial-sandbox') && (r.tags || '').includes('report'))
    .sort((a, b) => new Date(b.scraped_at || b.created_date) - new Date(a.scraped_at || a.created_date));

  let recommendations = [];
  let riskWarnings = [];
  let opportunities = [];
  let rebalancing = '';

  for (const report of reports.slice(0, 3)) {
    let meta = {};
    try { meta = JSON.parse(report.metadata || '{}'); } catch {}
    if (meta.recommendations?.length > 0 && recommendations.length === 0) recommendations = meta.recommendations;
    if (meta.risk_warnings?.length > 0 && riskWarnings.length === 0) riskWarnings = meta.risk_warnings;
    if (meta.new_opportunities?.length > 0 && opportunities.length === 0) opportunities = meta.new_opportunities;
    if (meta.rebalancing && !rebalancing) rebalancing = meta.rebalancing;
  }

  return (
    <div className="space-y-4">
      {/* Auto Recommendations */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          AI Recommendations — Increase Profitability
        </h3>
        <div className="space-y-2">
          {recommendations.map((rec, i) => {
            const isExpanded = expandedRec === i;
            const urgencyClass = URGENCY_COLORS[(rec.urgency || '').toLowerCase()] || URGENCY_COLORS.medium;
            return (
              <div key={i} className="border border-border/50 rounded-lg p-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
                onClick={() => setExpandedRec(isExpanded ? null : i)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Target className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-[11px] font-bold text-foreground">{rec.title || rec.action}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rec.expected_gain_pct && (
                      <span className="text-[9px] text-green-400 font-bold">+{rec.expected_gain_pct}%</span>
                    )}
                    <Badge className={`text-[7px] ${urgencyClass}`}>{rec.urgency || 'medium'}</Badge>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/30 space-y-1.5 text-[10px]">
                    <div className="text-foreground/80 leading-relaxed bg-white/[0.02] rounded-md p-2">
                      <span className="font-bold text-primary">Action: </span>{rec.action}
                    </div>
                    {rec.reasoning && (
                      <div className="text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground/60">Why: </span>{rec.reasoning}
                      </div>
                    )}
                    <div className="flex gap-4 text-[9px] text-muted-foreground flex-wrap">
                      {rec.ticker && <span>Ticker: <span className="text-foreground font-bold">{rec.ticker}</span></span>}
                      {rec.entry_price && <span>Entry: {rec.entry_price}</span>}
                      {rec.target_price && <span>Target: <span className="text-green-400">{rec.target_price}</span></span>}
                      {rec.bucket && <span>Bucket: {rec.bucket}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {recommendations.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-6">Run a trading cycle to generate recommendations.</div>
          )}
        </div>
      </div>

      {/* Risk Warnings */}
      {riskWarnings.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Risk Warnings
          </h3>
          <div className="space-y-1.5">
            {riskWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-red-400/80 bg-red-500/5 rounded-lg p-2.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Opportunities */}
      {opportunities.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 metallic-gold-icon" />
            Live Market Opportunities
          </h3>
          <div className="space-y-2">
            {opportunities.map((opp, i) => {
              const isExpanded = expandedOpp === i;
              return (
                <div key={i} className="border border-primary/20 rounded-lg p-3 hover:bg-primary/5 cursor-pointer transition-colors"
                  onClick={() => setExpandedOpp(isExpanded ? null : i)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-[11px] font-bold text-foreground">{opp.opportunity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {opp.ticker && <span className="text-[9px] font-bold text-primary">{opp.ticker}</span>}
                      {opp.potential_return && <span className="text-[9px] text-green-400">{opp.potential_return}</span>}
                    </div>
                  </div>
                  {isExpanded && opp.why_now && (
                    <div className="mt-2 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/60">Why now: </span>{opp.why_now}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rebalancing */}
      {rebalancing && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> Rebalancing Suggestion
          </h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{rebalancing}</p>
        </div>
      )}
    </div>
  );
}