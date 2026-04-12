import { Ruler, ClipboardCheck, Calculator, DollarSign, FileText, Send, Clock, Swords, PenLine, Stamp, Receipt, CreditCard, Bell, Sparkles } from "lucide-react";
import GlassToolCard from "../shared/GlassToolCard";
import { MiniBarChart, MiniLineChart, MiniDonutChart, MiniAreaChart, StatRow } from "../shared/MiniChart";
import NavIcon from "../shared/NavIcon";

const proposalData = [
  { name: "Jan", sent: 12, won: 7 }, { name: "Feb", sent: 15, won: 9 }, { name: "Mar", sent: 18, won: 11 },
  { name: "Apr", sent: 22, won: 14 }, { name: "May", sent: 19, won: 12 }, { name: "Jun", sent: 25, won: 17 },
];
const bidData = [
  { name: "$5-8/sf", value: 35 }, { name: "$8-12/sf", value: 42 }, { name: "$12-18/sf", value: 18 }, { name: "$18+/sf", value: 5 },
];
const closeRateData = [
  { name: "Week 1", value: 45 }, { name: "Week 2", value: 52 }, { name: "Week 3", value: 48 },
  { name: "Week 4", value: 61 }, { name: "Week 5", value: 58 }, { name: "Week 6", value: 67 },
];
const revenueData = [
  { name: "Jan", value: 45000 }, { name: "Feb", value: 62000 }, { name: "Mar", value: 78000 },
  { name: "Apr", value: 95000 }, { name: "May", value: 88000 }, { name: "Jun", value: 115000 },
];

const tools = [
  {
    num: "2.1", label: "AI Measurement Assist", Icon: Ruler,
    old: "Tape measure, walk the floor, rough guess on square footage",
    ai: "Input dimensions or upload floor plan — auto-calculates SF, waste factor, edge linear feet, and room segments",
    badge: "Measure",
    chart: (<StatRow items={[{ value: "±1%", label: "Accuracy" }, { value: "< 10s", label: "Calculate" }, { value: "8%", label: "Waste Factor" }]} />),
  },
  {
    num: "2.2", label: "AI Condition Checklist", Icon: ClipboardCheck,
    old: "Visual inspection, moisture test, write notes on paper",
    ai: "Guided photo-based inspection form with auto-notes — moisture, cracks, coatings, slope, drainage assessment",
    badge: "Inspect",
    chart: (<StatRow items={[{ value: "12", label: "Check Points" }, { value: "Auto", label: "Photo Tag" }, { value: "PDF", label: "Report" }]} />),
  },
  {
    num: "2.3", label: "AI Material Calculator", Icon: Calculator,
    old: "Pull out calculator, reference product sheets, call supplier",
    ai: "Auto-calculates products, quantities, coats from SF + floor type + system selected — linked to supplier pricing",
    badge: "Materials",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Bid Price Distribution</div>
        <MiniDonutChart data={bidData} />
      </>
    ),
  },
  {
    num: "2.4", label: "AI Bid Calculator", Icon: DollarSign,
    old: "Spreadsheet, calculator, guess based on experience",
    ai: "Uses your pricing matrix + material costs + labor rates + profit margin targets for instant accurate bids",
    badge: "Pricing",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Revenue Trend</div>
        <MiniAreaChart data={revenueData} color="#d4af37" />
      </>
    ),
  },
  {
    num: "2.5", label: "AI Proposal Generator", Icon: FileText,
    old: "Word doc template, copy/paste from last job, spend 2 hours formatting",
    ai: "Branded, professional proposal auto-built from bid data in 30 seconds with your company branding",
    badge: "Generate",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Proposals Sent vs Won</div>
        <MiniLineChart data={proposalData} lines={[{ key: "sent", color: "#a0a0a0" }, { key: "won", color: "#d4af37" }]} />
      </>
    ),
  },
  {
    num: "2.6", label: "AI Proposal Delivery", Icon: Send,
    old: "Email as PDF attachment with no tracking or insight",
    ai: "Sends branded email with real-time tracking — opened, viewed, time spent per page, forwarded",
    badge: "Tracking",
    chart: (<StatRow items={[{ value: "92%", label: "Open Rate" }, { value: "3.2m", label: "Avg View" }, { value: "24%", label: "Forwarded" }]} />),
  },
  {
    num: "2.7", label: "AI Proposal Follow-Up", Icon: Clock,
    old: "Try to remember to call in a few days and follow up",
    ai: "Auto-triggers follow-up based on open/no-response timing with escalating touchpoint strategy",
    badge: "Follow-Up",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Close Rate Trend</div>
        <MiniAreaChart data={closeRateData} color="#c0c0c0" />
      </>
    ),
  },
  {
    num: "2.8", label: "AI Negotiation Coach", Icon: Swords,
    old: "Wing it on the phone, no data to back up your pricing",
    ai: "Real-time objection handling suggestions, competitor comparison data, value justification scripts",
    badge: "Coach",
    chart: (<StatRow items={[{ value: "78%", label: "Win Rate" }, { value: "12%", label: "Avg Discount" }, { value: "94%", label: "Satisfaction" }]} />),
  },
  {
    num: "2.9", label: "AI Quick Revise", Icon: PenLine,
    old: "Re-open Word doc, change numbers, re-save, re-send manually",
    ai: '"Update the Acme proposal to $12/sf" → done in seconds, auto-re-sent with revision tracking',
    badge: "Revise",
    chart: (<StatRow items={[{ value: "< 5s", label: "Revision Time" }, { value: "Auto", label: "Re-Send" }, { value: "V3", label: "Avg Revisions" }]} />),
  },
  {
    num: "2.10", label: "AI E-Sign", Icon: Stamp,
    old: "Print, mail, meet in person, or email PDF and wait weeks for a signature",
    ai: "Digital signature embedded in proposal — legally binding, instant notification when signed",
    badge: "Legal",
    chart: (<StatRow items={[{ value: "< 2h", label: "Avg Sign Time" }, { value: "100%", label: "Legally Valid" }, { value: "Auto", label: "Notification" }]} />),
  },
  {
    num: "2.11", label: "AI Invoice Generator", Icon: Receipt,
    old: "Open QuickBooks, manually create invoice, email it separately",
    ai: "Auto-creates deposit invoice from signed proposal — 50% or custom split, terms auto-applied",
    badge: "Billing",
    chart: (<StatRow items={[{ value: "0s", label: "Manual Work" }, { value: "Auto", label: "From Proposal" }, { value: "50%", label: "Default Split" }]} />),
  },
  {
    num: "2.12", label: "AI Payment Tracker", Icon: CreditCard,
    old: "Wait for check, chase them down, hope it clears",
    ai: "Sends payment link, tracks status in real-time, auto-reminds if overdue — never chase again",
    badge: "Payments",
    chart: (<StatRow items={[{ value: "2.1d", label: "Avg Pay Time" }, { value: "96%", label: "Collected" }, { value: "Auto", label: "Reminders" }]} />),
  },
  {
    num: "2.13", label: "AI Win Notification", Icon: Bell,
    old: "Call the office, tell the team, maybe send an email",
    ai: "Auto-notifies team, updates pipeline, triggers Phase 3 scheduling — seamless handoff to operations",
    badge: "Alert",
    chart: (<StatRow items={[{ value: "Instant", label: "Team Alert" }, { value: "Auto", label: "Pipeline Update" }, { value: "→ P3", label: "Triggers Next" }]} />),
  },
];

export default function WinWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <NavIcon id="do_work" size="lg" active />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>WIN WORK</h1>
          <p className="text-xs text-muted-foreground">13 AI tools for estimating, proposals & closing deals</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 metallic-gold-icon" />
          <span className="text-[10px] font-bold text-primary">Phase 2 · 13 Tools</span>
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