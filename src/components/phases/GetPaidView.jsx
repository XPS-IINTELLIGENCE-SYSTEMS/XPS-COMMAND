import { Sparkles, ClipboardCheck, Receipt, Bell, CreditCard, Heart, Star, Archive, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavIcon from "../shared/NavIcon";

const steps = [
  { num: "4.1", label: "Client Walkthrough & Sign-Off", desc: "Guided inspection with photos, digital approval on-site", Icon: ClipboardCheck },
  { num: "4.2", label: "Send Final Invoice", desc: "Auto-generated from job data, deposit subtracted, terms applied", Icon: Receipt },
  { num: "4.3", label: "Follow Up on Payment", desc: "Escalating reminders: email → text → call → formal letter", Icon: Bell },
  { num: "4.4", label: "Collect Payment", desc: "Online payment link, auto-records and confirms", Icon: CreditCard },
  { num: "4.5", label: "Send Thank You", desc: "Personalized thank you auto-sent on payment receipt", Icon: Heart },
  { num: "4.6", label: "Request Google Review", desc: "Friendly text/email with direct review link, timed perfectly", Icon: Star },
  { num: "4.7", label: "Archive & Analyze", desc: "All docs archived, job profitability calculated, referral request sent", Icon: Archive },
  { num: "4.8", label: "Job P&L Report", desc: "Auto-calculates actual profit: revenue - materials - labor - overhead", Icon: BarChart3 },
];

export default function GetPaidView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <NavIcon id="get_paid" size="lg" active />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>GET PAID</h1>
          <p className="text-xs text-muted-foreground">Invoicing, collections & reputation building</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-semibold text-foreground">Quick Command</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Tell your AI agent what you need:</p>
        <div className="space-y-2">
          {["Send final invoice to Acme Corp — job is complete", "Follow up on all unpaid invoices over 7 days old", "Send thank you & review request to Smith Corp"].map((cmd) => (
            <button key={cmd} className="shimmer-card w-full text-left px-3 py-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
              <span className="text-xs text-foreground">"{cmd}"</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Workflow Steps</h2>
        {steps.map((step) => (
          <div key={step.num} className="shimmer-card flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
            <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <step.Icon className="w-4 h-4 shimmer-icon metallic-silver-icon" />
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
        ))}
      </div>
    </div>
  );
}