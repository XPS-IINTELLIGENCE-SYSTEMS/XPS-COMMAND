import { Bot, Sparkles, Zap, Brain, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const models = [
  { 
    name: "Open Claw — Main Agent", 
    model: "GPT-4o", 
    status: "active",
    tokensToday: "412K",
    avgLatency: "1.8s",
    accuracy: "94.2%",
    desc: "Primary autonomous agent — research, CRM, proposals, outreach"
  },
  { 
    name: "Lead Scorer", 
    model: "GPT-4o-mini", 
    status: "active",
    tokensToday: "287K",
    avgLatency: "0.4s",
    accuracy: "91.8%",
    desc: "Scores and ranks leads by conversion probability"
  },
  { 
    name: "Proposal Generator", 
    model: "Claude Sonnet", 
    status: "active",
    tokensToday: "148K",
    avgLatency: "3.2s",
    accuracy: "96.1%",
    desc: "Generates professional estimates and proposals"
  },
];

const stats = [
  { label: "Total Tokens Today", value: "847K", sub: "$12.40 estimated cost" },
  { label: "Avg Latency", value: "1.8s", sub: "-0.3s vs last week" },
  { label: "Success Rate", value: "99.4%", sub: "6 failures today" },
  { label: "Active Models", value: "3", sub: "All healthy" },
];

const recentRuns = [
  { task: "Lead scoring batch — 47 leads processed", model: "GPT-4o-mini", tokens: "12.4K", time: "5 min ago", status: "success" },
  { task: "Proposal generated for Gulf Coast Logistics", model: "Claude Sonnet", tokens: "8.2K", time: "12 min ago", status: "success" },
  { task: "Competitor analysis — Tampa Bay region", model: "GPT-4o", tokens: "24.1K", time: "28 min ago", status: "success" },
  { task: "Email sequence generation — 12 templates", model: "GPT-4o", tokens: "18.7K", time: "1 hr ago", status: "success" },
  { task: "Web research — Palm Medical Center", model: "GPT-4o", tokens: "31.2K", time: "2 hr ago", status: "success" },
];

export default function AdminAIModels() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-border p-3">
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            <div className="text-lg font-bold text-foreground mt-1">{stat.value}</div>
            <div className="text-[10px] text-primary/80">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Model cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Active Models</h3>
        <div className="space-y-2">
          {models.map((m) => (
            <div key={m.name} className="bg-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground">{m.model}</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">{m.desc}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-secondary/50 rounded-xl px-2.5 py-1.5 text-center">
                  <div className="text-xs font-bold text-foreground">{m.tokensToday}</div>
                  <div className="text-[9px] text-muted-foreground">Tokens today</div>
                </div>
                <div className="bg-secondary/50 rounded-xl px-2.5 py-1.5 text-center">
                  <div className="text-xs font-bold text-foreground">{m.avgLatency}</div>
                  <div className="text-[9px] text-muted-foreground">Avg latency</div>
                </div>
                <div className="bg-secondary/50 rounded-xl px-2.5 py-1.5 text-center">
                  <div className="text-xs font-bold text-foreground">{m.accuracy}</div>
                  <div className="text-[9px] text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent AI runs */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent AI Runs</h3>
        <div className="space-y-2">
          {recentRuns.map((run, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">{run.task}</div>
                <div className="text-[10px] text-muted-foreground">{run.model} · {run.tokens} tokens · {run.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}