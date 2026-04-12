import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetalIcon from "../shared/MetalIcon";

const steps = [
  { num: "2.1", label: "Craft First Email", desc: "AI writes personalized outreach using lead research + your brand voice" },
  { num: "2.2", label: "Send Outreach", desc: "Auto-send emails with open & click tracking" },
  { num: "2.3", label: "Call Prep & Script", desc: "AI generates call scripts with talking points & objection handling" },
  { num: "2.4", label: "Text / SMS Outreach", desc: "Personalized texts from your business number with tracking" },
  { num: "2.5", label: "Social Media Posts", desc: "AI creates platform-specific content, schedules across channels" },
  { num: "2.6", label: "Follow-Up Sequences", desc: "Automated drip campaigns — email, text, call with escalation" },
  { num: "2.7", label: "Book Appointments", desc: "AI sends booking links synced to your calendar, auto-confirms" },
];

export default function GetWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <MetalIcon id="get_work" size="lg" />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>GET WORK</h1>
          <p className="text-xs text-muted-foreground">Outreach, communication & booking appointments</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-semibold text-foreground">Quick Command</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Tell your AI agent what you need:</p>
        <div className="space-y-2">
          {["Email my top 10 leads a personalized intro", "Follow up with everyone who hasn't replied in 7 days", "Post a before/after project photo to all social channels"].map((cmd) => (
            <button key={cmd} className="shimmer-card w-full text-left px-3 py-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
              <span className="text-xs text-foreground">"{cmd}"</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Workflow Steps</h2>
        {steps.map((step) => {
          return (
            <div key={step.num} className="shimmer-card flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center flex-shrink-0">
                <MetalIcon id="get_work" size="md" />
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