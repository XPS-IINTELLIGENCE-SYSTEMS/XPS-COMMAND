import { Clock, HardHat, Truck, Wrench, Camera, Users, ClipboardCheck, CheckCircle } from "lucide-react";
import NavIcon from "../shared/NavIcon";

const steps = [
  { num: "1", label: "Schedule & Dispatch", desc: "Assign crews, set dates, confirm materials", Icon: Clock },
  { num: "2", label: "Surface Prep", desc: "Grinding, shot blasting, moisture testing", Icon: HardHat },
  { num: "3", label: "Material Management", desc: "Track inventory, order products, manage deliveries", Icon: Truck },
  { num: "4", label: "Job Execution", desc: "Apply coatings, monitor quality, manage timelines", Icon: Wrench },
  { num: "5", label: "Photo Documentation", desc: "Before/after photos, progress shots, quality proof", Icon: Camera },
  { num: "6", label: "Crew Management", desc: "Track hours, manage subcontractors, assign tasks", Icon: Users },
  { num: "7", label: "Quality Checklist", desc: "Final inspection, thickness readings, sign-off", Icon: ClipboardCheck },
  { num: "8", label: "Job Completion", desc: "Client walkthrough, punchlist, approval", Icon: CheckCircle },
];

const quickCommands = [
  "Schedule a new job",
  "Check today's crew assignments",
  "Log job progress photos",
  "Run quality checklist",
];

export default function DoWorkView() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <NavIcon id="do_work" size="lg" active />
          <div>
            <h1 className="text-lg font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>Do Work</h1>
            <p className="text-xs text-muted-foreground">Execute jobs, manage crews, deliver quality</p>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {quickCommands.map((cmd) => (
            <button key={cmd} className="shimmer-card text-left px-3 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
              <span className="text-[11px] text-foreground">{cmd}</span>
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.num} className="shimmer-card flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
              <span className="text-xs font-bold font-mono text-muted-foreground w-5">{step.num}</span>
              <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <step.Icon className="w-4 h-4 shimmer-icon metallic-silver-icon" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{step.label}</div>
                <div className="text-[11px] text-muted-foreground">{step.desc}</div>
              </div>
              <button className="px-3 py-1.5 text-[10px] font-semibold rounded-lg metallic-gold-bg text-background hover:brightness-110 transition-all">
                Execute
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}