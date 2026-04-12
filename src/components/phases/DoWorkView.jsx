import { CalendarClock, ShoppingCart, Truck, Users, FileText, ClipboardList, Camera, MessageCircle, FileEdit, DollarSign, LayoutDashboard, CheckSquare, Flag } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";

export default function DoWorkView({ onChatCommand }) {
  const fire = (cmd) => {
    if (onChatCommand) onChatCommand(cmd);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="do_work" size="sm" active />
          <span className="text-sm font-semibold text-white">Phase 3 · 13 Tools</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          DO WORK
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Click any tool to run it via AI. Manage every job from scheduling to completion.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        <WorkflowSection title="SCHEDULING & PREP" subtitle="Materials ordered, crews assigned, jobs queued — automatically.">
          <WorkflowToolCard num="3.1" label="AI Job Scheduler" Icon={CalendarClock} statusBadge="Schedule"
            description="Auto-schedules based on crew availability, travel distance, job duration, and weather."
            onAction={fire} chatCommand="Schedule my next job based on crew availability" />
          <WorkflowToolCard num="3.2" label="AI Procurement" Icon={ShoppingCart} statusBadge="Order"
            description="Auto-generates purchase order from bid specs."
            onAction={fire} chatCommand="Generate a purchase order for my latest approved proposal" />
          <WorkflowToolCard num="3.3" label="AI Delivery Tracker" Icon={Truck} statusBadge="Logistics"
            description="Auto-confirms delivery date, alerts if delayed."
            onAction={fire} chatCommand="Track material deliveries for all active jobs" />
        </WorkflowSection>

        <WorkflowSection title="CREW & EXECUTION" subtitle="Assign crews, brief them, and track progress.">
          <WorkflowToolCard num="3.4" label="AI Crew Manager" Icon={Users} statusBadge="Team"
            description="Assigns based on skills + location + availability."
            onAction={fire} chatCommand="Assign crew for my next scheduled job" />
          <WorkflowToolCard num="3.5" label="AI Job Brief" Icon={FileText} statusBadge="Brief"
            description="Auto-sends crew a complete job package."
            onAction={fire} chatCommand="Create a job brief for the next scheduled project" />
          <WorkflowToolCard num="3.6" label="AI Daily Log" Icon={ClipboardList} statusBadge="Logging"
            description="Crew submits progress photos + notes via simple form."
            onAction={fire} chatCommand="Show me today's job progress logs" />
          <WorkflowToolCard num="3.7" label="AI Photo Logger" Icon={Camera} statusBadge="Photos"
            description="Guided photo capture — auto-tagged to job, timestamped." />
        </WorkflowSection>

        <WorkflowSection title="MONITORING & COMMUNICATION" subtitle="Keep clients informed and budgets on track.">
          <WorkflowToolCard num="3.8" label="AI Client Updates" Icon={MessageCircle} statusBadge="Comms"
            description="Auto-sends progress report with photos at milestones."
            onAction={fire} chatCommand="Send a progress update to the client for the active job" />
          <WorkflowToolCard num="3.9" label="AI Change Order Manager" Icon={FileEdit} statusBadge="Changes"
            description="Documents issue, generates change order with revised pricing."
            onAction={fire} chatCommand="Create a change order for the active project" />
          <WorkflowToolCard num="3.10" label="AI Cost Tracker" Icon={DollarSign} statusBadge="Finance"
            description="Real-time material + labor cost tracking vs. bid."
            onAction={fire} chatCommand="Show me cost tracking for all active jobs" />
        </WorkflowSection>

        <WorkflowSection title="COMPLETION & HANDOFF" subtitle="Close out the job and hand off to Get Paid.">
          <WorkflowToolCard num="3.11" label="AI Operations Dashboard" Icon={LayoutDashboard} statusBadge="Overview"
            description="All active jobs at a glance — status, crew, next actions."
            onAction={fire} chatCommand="Show me the operations dashboard for all active jobs" />
          <WorkflowToolCard num="3.12" label="AI Quality Checklist" Icon={CheckSquare} statusBadge="QC"
            description="Step-by-step verification with photo documentation."
            onAction={fire} chatCommand="Create a quality checklist for the latest completed job" />
          <WorkflowToolCard num="3.13" label="AI Job Completion" Icon={Flag} statusBadge="Handoff"
            description="Crew marks complete → triggers invoicing and client notification."
            onAction={fire} chatCommand="Mark the active job as complete and trigger invoicing" />
        </WorkflowSection>
      </div>
    </div>
  );
}