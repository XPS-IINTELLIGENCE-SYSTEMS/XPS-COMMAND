import { Calculator, FileText, Send, HandshakeIcon, PenTool, Receipt, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { num: "3.1", label: "Measure & Assess Job", desc: "Input dimensions or upload floor plan, auto-calculate SF + conditions", icon: Calculator },
  { num: "3.2", label: "Calculate Materials & Price", desc: "AI builds pricing from your matrix + material costs + margins", icon: Calculator },
  { num: "3.3", label: "Generate Proposal", desc: "Branded, professional proposal auto-built in 30 seconds", icon: FileText },
  { num: "3.4", label: "Send & Track Proposal", desc: "Send with open tracking — know when they view it", icon: Send },
  { num: "3.5", label: "Negotiate & Close", desc: "AI objection handling, competitor comparisons, quick revisions", icon: HandshakeIcon },
  { num: "3.6", label: "Get Contract Signed", desc: "Digital e-signature embedded in proposal", icon: PenTool },
  { num: "3.7", label: "Send Deposit Invoice", desc: "Auto-generate deposit invoice from signed proposal", icon: Receipt },
  { num: "3.8", label: "Collect Deposit", desc: "Payment link, status tracking, auto-reminders", icon: CreditCard },
];

export default function WinWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center text-background font-bold text-lg">3</div>
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>WIN WORK</h1>
          <p className="text-xs text-muted-foreground">Bids, proposals, contracts & closing deals</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-semibold text-foreground">Quick Command</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Tell your AI agent what you need:</p>
        <div className="space-y-2">
          {["Create a bid for Acme Corp — 5000 SF garage coating at $8/sf", "Send the proposal to John at Acme and track opens", "Generate a deposit invoice for the signed Acme deal"].map((cmd) => (
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