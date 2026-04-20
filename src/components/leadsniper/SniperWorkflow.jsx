import { Crosshair, Search, Building2, Send, Mail, FileText, Trophy, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: Search, label: "AI Scrape", desc: "LLM discovers GCs from the web", color: "#d4af37", auto: true },
  { icon: Building2, label: "Database", desc: "Validated & deduped into CRM", color: "#06b6d4", auto: true },
  { icon: Send, label: "Outreach", desc: "Bid list request emails sent", color: "#8b5cf6", auto: true },
  { icon: Mail, label: "Follow-Up", desc: "4-stage drip sequence", color: "#ec4899", auto: true },
  { icon: FileText, label: "Scope In", desc: "GC sends flooring scope", color: "#f59e0b", auto: false },
  { icon: Crosshair, label: "AI Takeoff", desc: "Auto-estimate from plans", color: "#22c55e", auto: true },
  { icon: Trophy, label: "Win", desc: "Bid won → revenue", color: "#d4af37", auto: false },
];

export default function SniperWorkflow() {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Crosshair className="w-4 h-4 metallic-gold-icon" />
        <span className="text-xs font-bold metallic-gold">Automated Workflow</span>
        <span className="text-[9px] text-muted-foreground ml-auto">Daily at 2 AM & 8 AM ET</span>
      </div>
      <div className="flex items-start gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-start flex-shrink-0">
            <div className="flex flex-col items-center w-[80px] sm:w-[100px]">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-1.5"
                style={{ backgroundColor: `${step.color}18`, border: `1px solid ${step.color}30` }}
              >
                <step.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: step.color }} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-foreground text-center leading-tight">{step.label}</span>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground text-center leading-tight mt-0.5">{step.desc}</span>
              {step.auto && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mt-1 font-medium">AUTO</span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 mt-3 mx-0.5 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}