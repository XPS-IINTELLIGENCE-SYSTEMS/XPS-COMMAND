import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Crown, Play, Loader2, Brain, TrendingUp, Mail, Database, CheckCircle2, AlertTriangle, Zap, RefreshCcw, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompileResultsPanel from "./CompileResultsPanel";
import GroqAgentChat from "../chat/GroqAgentChat";

const ACTIONS = [
  { id: "compile", label: "Compile & Dedup", icon: Database, desc: "Merge all 9 data sources, remove duplicates", color: "#d4af37", fn: "compileCallQueue" },
  { id: "full_briefing", label: "Full Scan", icon: Crown, desc: "Enrich + score + test + report", color: "#8b5cf6", fn: "ceoMorningBriefing" },
  { id: "enrich", label: "Enrich Leads", icon: Brain, desc: "AI-enrich 10 leads from web", color: "#22c55e", fn: "ceoMorningBriefing" },
  { id: "score", label: "Score Leads", icon: TrendingUp, desc: "Score 20 unscored leads", color: "#3b82f6", fn: "ceoMorningBriefing" },
  { id: "test_email", label: "Test Email", icon: Mail, desc: "Send system test email", color: "#f59e0b", fn: "ceoMorningBriefing" },
];

export default function OrchestratorPanel({ lastLog, onRefresh, onCompileComplete }) {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [compileResult, setCompileResult] = useState(null);

  const runAction = async (action) => {
    const cfg = ACTIONS.find(a => a.id === action);
    setRunning(action);
    setResult(null);
    if (action === "compile") setCompileResult(null);

    try {
      const payload = action === "compile" ? {} : { action };
      const res = await base44.functions.invoke(cfg.fn, payload);
      if (action === "compile") {
        setCompileResult(res.data);
        onCompileComplete?.(res.data.queue || []);
      } else {
        setResult(res.data);
      }
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(null);
    if (action !== "compile") onRefresh?.();
  };

  return (
    <div className="space-y-3">
      {/* Tabs for Control vs Chat */}
      <Tabs defaultValue="control" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="control" className="gap-2">
            <Crown className="w-3 h-3" /> Control
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="w-3 h-3" /> Groq Agent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-3">
      {/* Action Buttons Grid */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-black metallic-gold">Operations Control</h2>
          </div>
          <span className="text-[9px] text-muted-foreground">Manual — no automations running</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {ACTIONS.map(a => {
            const Icon = a.icon;
            const isRunning = running === a.id;
            return (
              <button
                key={a.id}
                onClick={() => runAction(a.id)}
                disabled={running}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: `${a.color}10`, border: `1px solid ${a.color}25` }}
              >
                {isRunning ? (
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: a.color }} />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: a.color }} />
                )}
                <span className="text-[9px] font-bold text-foreground leading-tight text-center">{a.label}</span>
                <span className="text-[8px] text-muted-foreground leading-tight text-center hidden sm:block">{a.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compile Results */}
      {compileResult && <CompileResultsPanel data={compileResult} />}

      {/* Orchestrator Results */}
      {result && !result.error && (
        <div className="glass-card rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-bold text-green-400">Complete</span>
          </div>
          {result.results?.actions?.map((a, i) => (
            <div key={i} className="text-[10px] text-foreground/80 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-primary" /> {a}
            </div>
          ))}
          {result.analysis?.top_priorities?.slice(0, 3).map((p, i) => (
            <div key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="text-primary font-bold">{i + 1}.</span> {p.priority}
            </div>
          ))}
        </div>
      )}

      {result?.error && (
        <div className="bg-destructive/10 rounded-lg p-2 text-[10px] text-destructive flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {result.error}
        </div>
      )}

      {lastLog && (
        <div className="text-[9px] text-muted-foreground">
          Last orchestrator run: {new Date(lastLog.created_date).toLocaleString()} — {lastLog.status}
        </div>
      )}
        </TabsContent>

        <TabsContent value="chat" className="h-96">
          <GroqAgentChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}