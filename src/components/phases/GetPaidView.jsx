import { ClipboardCheck, Stamp, Receipt, Send, Bell, CreditCard, BookOpen, Heart, Star, Image, Archive, BarChart3, RefreshCcw } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";

export default function GetPaidView({ onChatCommand }) {
  const fire = (cmd) => {
    if (onChatCommand) onChatCommand(cmd);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="get_paid" size="sm" active />
          <span className="text-sm font-semibold text-white">Phase 4 · 13 Tools</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          GET PAID
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Click any tool to run it via AI. From walkthrough to final payment.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        <WorkflowSection title="WALKTHROUGH & SIGN-OFF" subtitle="Document the finished job and get client approval.">
          <WorkflowToolCard num="4.1" label="AI Walkthrough Checklist" Icon={ClipboardCheck} statusBadge="Inspect"
            description="Guided inspection with client present — photo documentation, systematic checklist."
            onAction={fire} chatCommand="Create a walkthrough checklist for my latest completed job" />
          <WorkflowToolCard num="4.2" label="AI Digital Sign-Off" Icon={Stamp} statusBadge="Legal"
            description="Client signs completion approval — legally binding, timestamped." />
        </WorkflowSection>

        <WorkflowSection title="INVOICING & PAYMENTS" subtitle="Get paid faster with automated invoicing and tracking.">
          <WorkflowToolCard num="4.3" label="AI Final Invoice" Icon={Receipt} statusBadge="Billing"
            description="Auto-generated from job data — deposit subtracted, terms applied."
            onAction={fire} chatCommand="Generate a final invoice for the latest completed proposal" />
          <WorkflowToolCard num="4.4" label="AI Invoice Delivery" Icon={Send} statusBadge="Delivery"
            description="Sends branded invoice with payment link + open tracking."
            onAction={fire} chatCommand="Send the latest invoice to the client" />
          <WorkflowToolCard num="4.5" label="AI Payment Follow-Up" Icon={Bell} statusBadge="Collections"
            description="Automated escalating reminders: email, text, call, formal letter."
            onAction={fire} chatCommand="Follow up on all overdue invoices" />
          <WorkflowToolCard num="4.6" label="AI Payment Processing" Icon={CreditCard} statusBadge="Payments"
            description="Online payment acceptance — auto-records, updates books."
            onAction={fire} chatCommand="Show me all unpaid invoices and their status" />
          <WorkflowToolCard num="4.7" label="AI Bookkeeping Sync" Icon={BookOpen} statusBadge="Accounting"
            description="Auto-reconciles payment to invoice to job."
            onAction={fire} chatCommand="Show me a financial summary of all paid invoices" />
        </WorkflowSection>

        <WorkflowSection title="CLIENT RETENTION & GROWTH" subtitle="Turn completed jobs into reviews, referrals, and repeat business.">
          <WorkflowToolCard num="4.8" label="AI Thank You" Icon={Heart} statusBadge="Retention"
            description="Personalized thank you email auto-sent on payment receipt."
            onAction={fire} chatCommand="Send a thank you email to our latest paid client" />
          <WorkflowToolCard num="4.9" label="AI Review Request" Icon={Star} statusBadge="Reputation"
            description="Sends friendly text/email with direct Google review link."
            onAction={fire} chatCommand="Send a review request to our last paid client" />
          <WorkflowToolCard num="4.10" label="AI Portfolio Builder" Icon={Image} statusBadge="Marketing"
            description="Auto-generates before/after case study from job photos + specs."
            onAction={fire} chatCommand="Create a case study from our latest completed project" />
        </WorkflowSection>

        <WorkflowSection title="RECORDS & REFERRALS" subtitle="Archive everything and keep generating business.">
          <WorkflowToolCard num="4.11" label="AI Record Keeper" Icon={Archive} statusBadge="Archive"
            description="All docs, photos, invoices archived and searchable."
            onAction={fire} chatCommand="Show me all records for our Won deals" />
          <WorkflowToolCard num="4.12" label="AI Job P&L" Icon={BarChart3} statusBadge="Finance"
            description="Auto-calculates actual profit: revenue - materials - labor - overhead."
            onAction={fire} chatCommand="Calculate profit/loss for all completed jobs" />
          <WorkflowToolCard num="4.13" label="AI Referral Engine" Icon={RefreshCcw} statusBadge="Growth"
            description="Auto-asks for referrals, tracks past clients for repeat business."
            onAction={fire} chatCommand="Identify past clients for referral outreach" />
        </WorkflowSection>
      </div>
    </div>
  );
}