import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Brain, Zap, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AutoEnhanceView() {
  const [analyzing, setAnalyzing] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const [enhancements, setEnhancements] = useState(null);
  const [reflection, setReflection] = useState(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    const res = await base44.functions.invoke("autoEnhanceTools", { action: "analyze" });
    setEnhancements(res.data);
    setAnalyzing(false);
  };

  const runReflection = async () => {
    setReflecting(true);
    const res = await base44.functions.invoke("autoEnhanceTools", { action: "self_reflect" });
    setReflection(res.data?.reflection);
    setReflecting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Auto-Enhancement Engine</h2>
          <p className="text-[11px] text-muted-foreground">AI-powered tool analysis, self-reflection & automated upgrade recommendations</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={runAnalysis} disabled={analyzing} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all text-left">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Analyze All 50+ Tools</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">AI scans every tool and generates targeted enhancement recommendations</p>
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="text-[10px] text-primary font-medium">Run Analysis →</span>}
        </button>

        <button onClick={runReflection} disabled={reflecting} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all text-left">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">System Self-Reflection</span>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Deep audit: capability gaps, ROI features, reliability, AI model upgrades</p>
          {reflecting ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <span className="text-[10px] text-primary font-medium">Run Reflection →</span>}
        </button>
      </div>

      {/* Enhancement Results */}
      {enhancements && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-bold text-foreground">{enhancements.enhancements_generated} Enhancements Generated</h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(enhancements.enhancements || []).map((e, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">{e.impact_score}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground">{e.enhancement_title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{e.tool_name} • {e.category}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1">{e.enhancement_description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">All {enhancements.enhancements_generated} enhancements saved to Site Improvements</p>
        </div>
      )}

      {/* Reflection Results */}
      {reflection && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Self-Reflection Audit</h3>
            </div>
            <div className="px-3 py-1 rounded-full metallic-gold-bg text-background text-xs font-bold">{reflection.overall_score}/100</div>
          </div>
          <p className="text-[11px] text-muted-foreground">{reflection.summary}</p>

          {reflection.capability_gaps?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-foreground mb-2">Capability Gaps</h4>
              <div className="space-y-1.5">
                {reflection.capability_gaps.map((g, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] font-semibold text-foreground">{g.gap}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{g.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reflection.high_roi_features?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-foreground mb-2">High ROI Features</h4>
              <div className="space-y-1.5">
                {reflection.high_roi_features.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-[10px] font-semibold text-foreground">{f.feature}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">ROI: {f.expected_roi}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reflection.ai_upgrades?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-foreground mb-2">AI Model Upgrades</h4>
              <div className="space-y-1.5">
                {reflection.ai_upgrades.map((u, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <p className="text-[10px] font-semibold text-foreground">{u.upgrade}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{u.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}