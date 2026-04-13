import { useState, useEffect } from "react";
import { HardHat, CalendarClock, ShoppingCart, Users, FileText, Camera, MessageCircle, DollarSign, CheckSquare, Flag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getIconColor } from "@/lib/iconColors";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const WORKFLOW_ID = "do_work";

const EXEC_TOOLS = [
  { id: "job_schedule", label: "AI Job Scheduler", Icon: CalendarClock },
  { id: "procure", label: "AI Procurement", Icon: ShoppingCart },
  { id: "crew", label: "AI Crew Manager", Icon: Users },
  { id: "brief", label: "AI Job Brief", Icon: FileText },
  { id: "photo", label: "AI Photo Logger", Icon: Camera },
  { id: "client_update", label: "AI Client Updates", Icon: MessageCircle },
  { id: "cost", label: "AI Cost Tracker", Icon: DollarSign },
  { id: "qc", label: "AI Quality Check", Icon: CheckSquare },
  { id: "complete", label: "AI Job Completion", Icon: Flag },
];

export default function ExecuteView({ onChatCommand, onOpenTool }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const color = getIconColor(WORKFLOW_ID);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.Lead.list("-created_date", 200);
      setLeads(data || []);
      setLoading(false);
    })();
  }, []);

  const activeJobs = leads.filter(l => l.stage === "Won");
  const negotiating = leads.filter(l => l.stage === "Negotiation");

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-8 space-y-12">
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id={WORKFLOW_ID} size="sm" active />
            <span className="text-xs font-semibold text-white">EXECUTE · JOBS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>EXECUTE</h1>
          <p className="mt-2 text-xs text-white/40">Scheduling, crews, tracking, and job completion</p>
        </div>

        <HScrollRow title="EXECUTION TOOLS" icon={HardHat} count={EXEC_TOOLS.length}>
          {EXEC_TOOLS.map(t => (
            <HCard key={t.id} title={t.label} icon={t.Icon} iconColor={color} onClick={() => onOpenTool?.(t.id, WORKFLOW_ID)}>
              <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity mt-1" style={{ color }}>Open tool →</div>
            </HCard>
          ))}
        </HScrollRow>

        <HScrollRow title="ACTIVE JOBS" subtitle="Won deals in execution" icon={Flag} count={activeJobs.length}>
          {activeJobs.map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.location} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "Active"} icon={HardHat} iconColor={color} onClick={() => onOpenTool?.("brief", WORKFLOW_ID)} />
          ))}
          {activeJobs.length === 0 && <EmptyCard text="No active jobs" />}
        </HScrollRow>

        <HScrollRow title="COMING UP" subtitle="In negotiation" icon={CalendarClock} count={negotiating.length}>
          {negotiating.map(l => (
            <HCard key={l.id} title={l.company} subtitle={l.contact_name} meta={l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "Negotiating"} icon={Users} iconColor={color} />
          ))}
          {negotiating.length === 0 && <EmptyCard text="Nothing in negotiation" />}
        </HScrollRow>
      </div>
    </div>
  );
}

function EmptyCard({ text }) {
  return (
    <div className="flex-shrink-0 w-[240px] rounded-xl p-4 bg-black/60 border border-white/[0.06] flex items-center justify-center">
      <span className="text-[11px] text-muted-foreground/50">{text}</span>
    </div>
  );
}