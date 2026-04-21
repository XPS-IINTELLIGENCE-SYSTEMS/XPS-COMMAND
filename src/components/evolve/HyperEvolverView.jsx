import { useState } from "react";
import { Zap, Loader2, Globe, Brain, Cpu, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const ACTIONS = [
  { id: "full", label: "Full Evolution Scan", desc: "All 18 sources + self-reflection", icon: Zap, color: "#d4af37" },
  { id: "industry", label: "Industry Intel Only", desc: "Top 10 epoxy/concrete/flooring sites", icon: Globe, color: "#22c55e" },
  { id: "ai", label: "AI/ML Intel Only", desc: "HuggingFace, LangChain, OpenAI, Google AI, GitHub", icon: Brain, color: "#8b5cf6" },
  { id: "evolve", label: "Self-Evolve Prompts", desc: "Analyze system + generate prompt improvements", icon: Cpu, color: "#06b6d4" },
];

export default function HyperEvolverView() {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAction = async (action) => {
    setRunning(action);
    setResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('hyperEvolver', { action });
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    }
    setRunning(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold metallic-gold tracking-tight">Hyper-Evolution Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Self-evolving AI that scrapes top industry + AI websites, generates prompt improvements, and feeds intelligence back into the system. Runs automatically every day at 3 AM.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const isRunning = running === a.id;
          return (
            <button
              key={a.id}
              onClick={() => runAction(a.id)}
              disabled={!!running}
              className="shimmer-card glass-card rounded-xl p-4 text-left transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shimmer-icon-container" style={{ background: `${a.color}15` }}>
                  {isRunning ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: a.color }} /> : <Icon className="w-5 h-5 shimmer-icon" style={{ color: a.color }} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{a.label}</h3>
                  <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {result && (
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-foreground">Evolution Complete</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-lg font-bold metallic-gold">{result.saved || 0}</div>
              <div className="text-[10px] text-muted-foreground">Records Saved</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-lg font-bold metallic-gold">{result.sources || 0}</div>
              <div className="text-[10px] text-muted-foreground">Sources Scraped</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-lg font-bold metallic-gold">{result.errors?.length || 0}</div>
              <div className="text-[10px] text-muted-foreground">Errors</div>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="text-[10px] text-destructive/80 mt-2">
              {result.errors.slice(0, 3).map((e, i) => <div key={i}>⚠ {e}</div>)}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="glass-card rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      <div className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-primary" /> Automated Schedule
        </h3>
        <p className="text-[11px] text-muted-foreground">
          The full evolution scan runs automatically <strong>every day at 3:00 AM ET</strong>. It scrapes 18 intelligence targets (10 industry + 8 AI/ML), generates system enhancement recommendations, and stores everything in your Intel Core.
        </p>
        <div className="text-[10px] text-muted-foreground space-y-0.5 mt-2">
          <div>🏗 <strong>Industry:</strong> Concrete Network, Husqvarna, HTC, Seal-Krete, Polyaspartic.com, Concrete Decor, Floor Skinz, Rust-Oleum, CPA, XPS</div>
          <div>🤖 <strong>AI/ML:</strong> HuggingFace, LangChain, Anthropic, OpenAI, Google AI, GitHub Trending, Papers With Code, AI News</div>
        </div>
      </div>
    </div>
  );
}