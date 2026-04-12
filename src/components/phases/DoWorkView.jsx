import { CalendarClock, ShoppingCart, Truck, Users, FileText, ClipboardList, Camera, MessageCircle, FileEdit, DollarSign, LayoutDashboard, CheckSquare, Flag, Sparkles } from "lucide-react";
import GlassToolCard from "../shared/GlassToolCard";
import { MiniBarChart, MiniLineChart, MiniDonutChart, MiniAreaChart, StatRow } from "../shared/MiniChart";
import NavIcon from "../shared/NavIcon";

const jobStatusData = [
  { name: "Scheduled", value: 5 }, { name: "In Prep", value: 3 }, { name: "Coating", value: 4 },
  { name: "Curing", value: 2 }, { name: "QC", value: 1 }, { name: "Complete", value: 8 },
];
const crewData = [
  { name: "Team A", value: 4 }, { name: "Team B", value: 3 }, { name: "Team C", value: 5 }, { name: "Team D", value: 2 },
];
const costTrackData = [
  { name: "Job 1", bid: 24000, actual: 21500 }, { name: "Job 2", bid: 18000, actual: 19200 },
  { name: "Job 3", bid: 32000, actual: 28800 }, { name: "Job 4", bid: 15000, actual: 14200 },
  { name: "Job 5", bid: 28000, actual: 26500 },
];

const tools = [
  {
    num: "3.1", label: "AI Job Scheduler", Icon: CalendarClock,
    old: "Write on whiteboard, office calendar, text the crew — chaos",
    ai: "Auto-schedules based on crew availability, travel distance, job duration, weather forecast, and material delivery",
    badge: "Schedule",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Job Status Board</div>
        <MiniBarChart data={jobStatusData} color="#c0c0c0" />
      </>
    ),
  },
  {
    num: "3.2", label: "AI Procurement", Icon: ShoppingCart,
    old: "Call the supplier, read off a list, hope you don't forget anything",
    ai: "Auto-generates purchase order from bid specs, sends to supplier with delivery requirements",
    badge: "Order",
    chart: (<StatRow items={[{ value: "Auto", label: "PO Generation" }, { value: "100%", label: "Spec Match" }, { value: "$2.4k", label: "Saved/Month" }]} />),
  },
  {
    num: "3.3", label: "AI Delivery Tracker", Icon: Truck,
    old: "Call supplier day before, cross fingers it arrives on time",
    ai: "Auto-confirms delivery date, alerts if delayed, suggests alternatives for critical materials",
    badge: "Logistics",
    chart: (<StatRow items={[{ value: "98%", label: "On-Time" }, { value: "Auto", label: "Alerts" }, { value: "< 2h", label: "Delay Notice" }]} />),
  },
  {
    num: "3.4", label: "AI Crew Manager", Icon: Users,
    old: "Call guys, text group chat, hope everyone shows up",
    ai: "Assigns based on skills + location + availability, sends confirmations, tracks attendance",
    badge: "Team",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Crew Utilization</div>
        <MiniDonutChart data={crewData} />
      </>
    ),
  },
  {
    num: "3.5", label: "AI Job Brief", Icon: FileText,
    old: "Text the address, maybe a photo, 'figure it out'",
    ai: "Auto-sends crew a complete job package: address, scope, floor plan, special notes, materials list, safety requirements",
    badge: "Brief",
    chart: (<StatRow items={[{ value: "Auto", label: "Generated" }, { value: "100%", label: "Complete" }, { value: "PDF", label: "Format" }]} />),
  },
  {
    num: "3.6", label: "AI Daily Log", Icon: ClipboardList,
    old: "Call the crew asking 'how's it going?' — no documentation",
    ai: "Crew submits progress photos + notes via simple form, auto-updates job status in real-time",
    badge: "Logging",
    chart: (<StatRow items={[{ value: "23", label: "Logs Today" }, { value: "100%", label: "With Photos" }, { value: "Auto", label: "Status Update" }]} />),
  },
  {
    num: "3.7", label: "AI Photo Logger", Icon: Camera,
    old: "Take on personal phone, forget to send to office",
    ai: "Guided photo capture — auto-tagged to job, timestamped, organized by phase (prep, prime, coat, finish)",
    badge: "Photos",
    chart: (<StatRow items={[{ value: "847", label: "Photos Logged" }, { value: "Auto", label: "Tagged" }, { value: "GPS", label: "Verified" }]} />),
  },
  {
    num: "3.8", label: "AI Client Updates", Icon: MessageCircle,
    old: "Call or text the client when you remember to",
    ai: "Auto-sends progress report with photos at milestones — prep done, first coat, cure, complete",
    badge: "Comms",
    chart: (<StatRow items={[{ value: "Auto", label: "Milestone Alerts" }, { value: "96%", label: "Client Satisfaction" }, { value: "4", label: "Touchpoints/Job" }]} />),
  },
  {
    num: "3.9", label: "AI Change Order Manager", Icon: FileEdit,
    old: "Panic, call the boss, argue about money later",
    ai: "Documents issue with photos, generates change order with revised pricing, gets digital approval instantly",
    badge: "Changes",
    chart: (<StatRow items={[{ value: "< 5m", label: "Generate CO" }, { value: "Auto", label: "Price Update" }, { value: "E-Sign", label: "Approval" }]} />),
  },
  {
    num: "3.10", label: "AI Cost Tracker", Icon: DollarSign,
    old: "Don't track. Find out you lost money after the job is done",
    ai: "Real-time material + labor cost tracking vs. bid — alerts if going over budget with correction suggestions",
    badge: "Finance",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Bid vs Actual Cost</div>
        <MiniLineChart data={costTrackData} lines={[{ key: "bid", color: "#d4af37" }, { key: "actual", color: "#a0a0a0" }]} xKey="name" />
      </>
    ),
  },
  {
    num: "3.11", label: "AI Operations Dashboard", Icon: LayoutDashboard,
    old: "Whiteboard with 15 jobs, total chaos, missed deadlines",
    ai: "All active jobs at a glance — status, crew, next actions, alerts, weather impacts, material status",
    badge: "Overview",
    chart: (
      <>
        <StatRow items={[{ value: "23", label: "Active Jobs" }, { value: "14", label: "Crews Out" }, { value: "3", label: "Alerts" }, { value: "$1.2M", label: "In Progress" }]} />
      </>
    ),
  },
  {
    num: "3.12", label: "AI Quality Checklist", Icon: CheckSquare,
    old: "Eyeball it, hope it looks good, cross your fingers",
    ai: "Step-by-step verification with photo documentation — thickness, adhesion, finish, edge quality",
    badge: "QC",
    chart: (<StatRow items={[{ value: "18", label: "Check Points" }, { value: "100%", label: "Photo Proof" }, { value: "99.2%", label: "Pass Rate" }]} />),
  },
  {
    num: "3.13", label: "AI Job Completion", Icon: Flag,
    old: "Text the office 'we're done' — no handoff, no documentation",
    ai: "Crew marks complete → auto-triggers Phase 4: walkthrough scheduling, invoice generation, client notification",
    badge: "Handoff",
    chart: (<StatRow items={[{ value: "Auto", label: "Trigger P4" }, { value: "Instant", label: "Notification" }, { value: "100%", label: "Documented" }]} />),
  },
];

export default function DoWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <NavIcon id="do_work" size="lg" active />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>DO WORK</h1>
          <p className="text-xs text-muted-foreground">13 AI tools for operations, execution & job management</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 metallic-gold-icon" />
          <span className="text-[10px] font-bold text-primary">Phase 3 · 13 Tools</span>
        </div>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => (
          <GlassToolCard key={tool.num} num={tool.num} label={tool.label} Icon={tool.Icon} oldWay={tool.old} aiTool={tool.ai} statusBadge={tool.badge}>
            {tool.chart}
          </GlassToolCard>
        ))}
      </div>
    </div>
  );
}