import { Ruler, ClipboardCheck, Calculator, DollarSign, FileText, Send, Clock, Swords, PenLine, Stamp, Receipt, CreditCard, Bell } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";

export default function WinWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      {/* Phase Header */}
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="win_work" size="sm" active />
          <span className="text-sm font-semibold text-white">Phase 2 · 13 Tools</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          WIN WORK
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Convert leads into signed contracts. From site measurement to proposal delivery and e-signature — close deals faster with AI.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        {/* Section 1: Site Assessment */}
        <WorkflowSection title="SITE ASSESSMENT" subtitle="Measure, inspect, and calculate before you quote.">
          <WorkflowToolCard num="2.1" label="AI Measurement Assist" Icon={Ruler} statusBadge="Measure"
            description="Input dimensions or upload floor plan — auto-calculates SF, waste factor, edge linear feet, and room segments." />
          <WorkflowToolCard num="2.2" label="AI Condition Checklist" Icon={ClipboardCheck} statusBadge="Inspect"
            description="Guided photo-based inspection form with auto-notes — moisture, cracks, coatings, slope, drainage assessment." />
          <WorkflowToolCard num="2.3" label="AI Material Calculator" Icon={Calculator} statusBadge="Materials"
            description="Auto-calculates products, quantities, and coats from SF + floor type + system — linked to supplier pricing." />
        </WorkflowSection>

        {/* Section 2: Pricing & Proposals */}
        <WorkflowSection title="PRICING & PROPOSALS" subtitle="Build professional, branded proposals in seconds — not hours.">
          <WorkflowToolCard num="2.4" label="AI Bid Calculator" Icon={DollarSign} statusBadge="Pricing"
            description="Uses your pricing matrix + material costs + labor rates + profit margin targets for instant accurate bids." />
          <WorkflowToolCard num="2.5" label="AI Proposal Generator" Icon={FileText} statusBadge="Generate"
            description="Branded, professional proposal auto-built from bid data in 30 seconds with your company branding." />
          <WorkflowToolCard num="2.6" label="AI Proposal Delivery" Icon={Send} statusBadge="Tracking"
            description="Sends branded email with real-time tracking — opened, viewed, time spent per page, forwarded." />
        </WorkflowSection>

        {/* Section 3: Closing */}
        <WorkflowSection title="CLOSING THE DEAL" subtitle="Automated follow-ups, negotiation coaching, and digital signatures to close faster.">
          <WorkflowToolCard num="2.7" label="AI Proposal Follow-Up" Icon={Clock} statusBadge="Follow-Up"
            description="Auto-triggers follow-up based on open/no-response timing with escalating touchpoint strategy." />
          <WorkflowToolCard num="2.8" label="AI Negotiation Coach" Icon={Swords} statusBadge="Coach"
            description="Real-time objection handling suggestions, competitor comparison data, and value justification scripts." />
          <WorkflowToolCard num="2.9" label="AI Quick Revise" Icon={PenLine} statusBadge="Revise"
            description="'Update the Acme proposal to $12/sf' → done in seconds, auto-re-sent with revision tracking." />
          <WorkflowToolCard num="2.10" label="AI E-Sign" Icon={Stamp} statusBadge="Legal"
            description="Digital signature embedded in proposal — legally binding, instant notification when signed." />
        </WorkflowSection>

        {/* Section 4: Post-Close */}
        <WorkflowSection title="POST-CLOSE HANDOFF" subtitle="Seamlessly transition from signed contract to scheduled job.">
          <WorkflowToolCard num="2.11" label="AI Invoice Generator" Icon={Receipt} statusBadge="Billing"
            description="Auto-creates deposit invoice from signed proposal — 50% or custom split, terms auto-applied." />
          <WorkflowToolCard num="2.12" label="AI Payment Tracker" Icon={CreditCard} statusBadge="Payments"
            description="Sends payment link, tracks status in real-time, auto-reminds if overdue — never chase again." />
          <WorkflowToolCard num="2.13" label="AI Win Notification" Icon={Bell} statusBadge="Alert"
            description="Auto-notifies team, updates pipeline, triggers Phase 3 scheduling — seamless handoff to operations." />
        </WorkflowSection>
      </div>
    </div>
  );
}