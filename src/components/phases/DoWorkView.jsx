import { CalendarClock, ShoppingCart, Truck, Users, FileText, ClipboardList, Camera, MessageCircle, FileEdit, DollarSign, LayoutDashboard, CheckSquare, Flag } from "lucide-react";
import WorkflowToolCard from "../shared/WorkflowToolCard";
import WorkflowSection from "../shared/WorkflowSection";
import NavIcon from "../shared/NavIcon";

export default function DoWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      {/* Phase Header */}
      <div className="text-center pt-4 md:pt-8 pb-8 md:pb-12">
        <div className="shimmer-card inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6">
          <NavIcon id="do_work" size="sm" active />
          <span className="text-sm font-semibold text-white">Phase 3 · 13 Tools</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-none xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          DO WORK
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          Manage every job from scheduling to completion. AI handles scheduling, procurement, crew management, and real-time tracking.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10 pb-12">
        {/* Section 1: Scheduling & Prep */}
        <WorkflowSection title="SCHEDULING & PREP" subtitle="Get materials ordered, crews assigned, and jobs queued — automatically.">
          <WorkflowToolCard num="3.1" label="AI Job Scheduler" Icon={CalendarClock} statusBadge="Schedule"
            description="Auto-schedules based on crew availability, travel distance, job duration, weather forecast, and material delivery." />
          <WorkflowToolCard num="3.2" label="AI Procurement" Icon={ShoppingCart} statusBadge="Order"
            description="Auto-generates purchase order from bid specs, sends to supplier with delivery requirements." />
          <WorkflowToolCard num="3.3" label="AI Delivery Tracker" Icon={Truck} statusBadge="Logistics"
            description="Auto-confirms delivery date, alerts if delayed, suggests alternatives for critical materials." />
        </WorkflowSection>

        {/* Section 2: Crew & Execution */}
        <WorkflowSection title="CREW & EXECUTION" subtitle="Assign crews, brief them, and track progress in the field.">
          <WorkflowToolCard num="3.4" label="AI Crew Manager" Icon={Users} statusBadge="Team"
            description="Assigns based on skills + location + availability, sends confirmations, tracks attendance." />
          <WorkflowToolCard num="3.5" label="AI Job Brief" Icon={FileText} statusBadge="Brief"
            description="Auto-sends crew a complete job package: address, scope, floor plan, special notes, materials list, safety." />
          <WorkflowToolCard num="3.6" label="AI Daily Log" Icon={ClipboardList} statusBadge="Logging"
            description="Crew submits progress photos + notes via simple form, auto-updates job status in real-time." />
          <WorkflowToolCard num="3.7" label="AI Photo Logger" Icon={Camera} statusBadge="Photos"
            description="Guided photo capture — auto-tagged to job, timestamped, organized by phase (prep, prime, coat, finish)." />
        </WorkflowSection>

        {/* Section 3: Monitoring & Communication */}
        <WorkflowSection title="MONITORING & COMMUNICATION" subtitle="Keep clients informed and budgets on track throughout the job.">
          <WorkflowToolCard num="3.8" label="AI Client Updates" Icon={MessageCircle} statusBadge="Comms"
            description="Auto-sends progress report with photos at milestones — prep done, first coat, cure, complete." />
          <WorkflowToolCard num="3.9" label="AI Change Order Manager" Icon={FileEdit} statusBadge="Changes"
            description="Documents issue with photos, generates change order with revised pricing, gets digital approval instantly." />
          <WorkflowToolCard num="3.10" label="AI Cost Tracker" Icon={DollarSign} statusBadge="Finance"
            description="Real-time material + labor cost tracking vs. bid — alerts if going over budget with correction suggestions." />
        </WorkflowSection>

        {/* Section 4: Completion */}
        <WorkflowSection title="COMPLETION & HANDOFF" subtitle="Close out the job cleanly and hand off to Phase 4: Get Paid.">
          <WorkflowToolCard num="3.11" label="AI Operations Dashboard" Icon={LayoutDashboard} statusBadge="Overview"
            description="All active jobs at a glance — status, crew, next actions, alerts, weather impacts, material status." />
          <WorkflowToolCard num="3.12" label="AI Quality Checklist" Icon={CheckSquare} statusBadge="QC"
            description="Step-by-step verification with photo documentation — thickness, adhesion, finish, edge quality." />
          <WorkflowToolCard num="3.13" label="AI Job Completion" Icon={Flag} statusBadge="Handoff"
            description="Crew marks complete → auto-triggers Phase 4: walkthrough scheduling, invoice generation, client notification." />
        </WorkflowSection>
      </div>
    </div>
  );
}