import { Search, MapPin, Target, Users, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { num: "1.1", label: "Identify Target Territory", desc: "AI scans permits, census & development data by region", icon: MapPin },
  { num: "1.2", label: "Scrape & Find Leads", desc: "Auto-discover prospects from Google, LinkedIn, directories", icon: Search },
  { num: "1.3", label: "Enrich Contact Info", desc: "Pull decision-maker names, emails, phones automatically", icon: Users },
  { num: "1.4", label: "Deep Research Leads", desc: "Scrape websites, reviews, news, floor photos & permits", icon: Target },
  { num: "1.5", label: "Score & Prioritize", desc: "AI ranks leads by budget, timeline, fit & urgency", icon: TrendingUp },
];

export default function FindWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center text-background font-bold text-lg">1</div>
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>FIND WORK</h1>
          <p className="text-xs text-muted-foreground">Lead generation, territory research & prospecting</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-semibold text-foreground">Quick Command</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Tell your AI agent what you need:</p>
        <div className="space-y-2">
          {["Find me 50 flooring contractors in Phoenix, AZ", "Research companies with new building permits in Dallas", "Score my existing leads and show me the top 10"].map((cmd) => (
            <button key={cmd} className="shimmer-card w-full text-left px-3 py-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
              <span className="text-xs text-foreground">"{cmd}"</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Workflow Steps</h2>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="shimmer-card flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="shimmer-icon-container w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 shimmer-icon metallic-silver-icon" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-primary font-bold">{step.num}</span>
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 text-muted-foreground hover:text-primary">
                Run
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}