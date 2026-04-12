import { Ruler, ClipboardCheck, Calculator, DollarSign, FileText, Send, Clock, Swords, PenLine, Stamp, Receipt, CreditCard, Bell } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";

export default function WinWorkView({ onChatCommand }) {
  const fire = (cmd) => {
    if (onChatCommand) onChatCommand(cmd);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="win_work" size="sm" active />
          <span className="text-sm font-semibold text-white">Phase 2 · 13 Tools</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          WIN WORK
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Click any tool to run it via AI. Convert leads into signed contracts.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        <WorkflowSection title="SITE ASSESSMENT" subtitle="Measure, inspect, and calculate before you quote.">
          <WorkflowToolCard num="2.1" label="AI Measurement Assist" Icon={Ruler} statusBadge="Measure"
            description="Input dimensions or upload floor plan — auto-calculates SF, waste factor, edge linear feet."
            onAction={fire} chatCommand="Help me calculate square footage for a new project" />
          <WorkflowToolCard num="2.2" label="AI Condition Checklist" Icon={ClipboardCheck} statusBadge="Inspect"
            description="Guided photo-based inspection form with auto-notes."
            onAction={fire} chatCommand="Create a floor condition checklist for my next site visit" />
          <WorkflowToolCard num="2.3" label="AI Material Calculator" Icon={Calculator} statusBadge="Materials"
            description="Auto-calculates products, quantities, and coats from SF + floor type."
            onAction={fire} chatCommand="Calculate materials needed for a 10,000 sqft epoxy floor coating" />
        </WorkflowSection>

        <WorkflowSection title="PRICING & PROPOSALS" subtitle="Build professional, branded proposals in seconds.">
          <WorkflowToolCard num="2.4" label="AI Bid Calculator" Icon={DollarSign} statusBadge="Pricing"
            description="Uses your pricing matrix + material costs + labor rates for instant accurate bids."
            onAction={fire} chatCommand="Calculate a bid for 10,000 sqft standard epoxy coating" />
          <WorkflowToolCard num="2.5" label="AI Proposal Generator" Icon={FileText} statusBadge="Generate"
            description="Branded, professional proposal auto-built from bid data in 30 seconds."
            onAction={fire} chatCommand="Generate a proposal for my highest scored lead" />
          <WorkflowToolCard num="2.6" label="AI Proposal Delivery" Icon={Send} statusBadge="Tracking"
            description="Sends branded email with real-time tracking."
            onAction={fire} chatCommand="Send the latest proposal to the client" />
        </WorkflowSection>

        <WorkflowSection title="CLOSING THE DEAL" subtitle="Automated follow-ups and negotiation coaching.">
          <WorkflowToolCard num="2.7" label="AI Proposal Follow-Up" Icon={Clock} statusBadge="Follow-Up"
            description="Auto-triggers follow-up based on open/no-response timing."
            onAction={fire} chatCommand="Follow up on all sent proposals that haven't been viewed" />
          <WorkflowToolCard num="2.8" label="AI Negotiation Coach" Icon={Swords} statusBadge="Coach"
            description="Real-time objection handling suggestions and value justification."
            onAction={fire} chatCommand="Help me handle price objections for an epoxy flooring project" />
          <WorkflowToolCard num="2.9" label="AI Quick Revise" Icon={PenLine} statusBadge="Revise"
            description="Update proposal pricing instantly and re-send."
            onAction={fire} chatCommand="Revise the latest proposal to $8/sqft" />
          <WorkflowToolCard num="2.10" label="AI E-Sign" Icon={Stamp} statusBadge="Legal"
            description="Digital signature embedded in proposal — instant notification when signed." />
        </WorkflowSection>

        <WorkflowSection title="POST-CLOSE HANDOFF" subtitle="Transition from signed contract to scheduled job.">
          <WorkflowToolCard num="2.11" label="AI Invoice Generator" Icon={Receipt} statusBadge="Billing"
            description="Auto-creates deposit invoice from signed proposal."
            onAction={fire} chatCommand="Generate an invoice for the latest approved proposal" />
          <WorkflowToolCard num="2.12" label="AI Payment Tracker" Icon={CreditCard} statusBadge="Payments"
            description="Sends payment link, tracks status in real-time."
            onAction={fire} chatCommand="Show me all unpaid invoices" />
          <WorkflowToolCard num="2.13" label="AI Win Notification" Icon={Bell} statusBadge="Alert"
            description="Auto-notifies team, updates pipeline, triggers scheduling."
            onAction={fire} chatCommand="Notify the team about our latest won deal" />
        </WorkflowSection>
      </div>
    </div>
  );
}