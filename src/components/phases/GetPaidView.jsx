import { ClipboardCheck, Stamp, Receipt, Send, Bell, CreditCard, BookOpen, Heart, Star, Image, Archive, BarChart3, RefreshCcw, Sparkles } from "lucide-react";
import GlassToolCard from "../shared/GlassToolCard";
import { MiniBarChart, MiniLineChart, MiniDonutChart, MiniAreaChart, StatRow } from "../shared/MiniChart";
import NavIcon from "../shared/NavIcon";

const invoiceData = [
  { name: "Jan", sent: 18, paid: 15 }, { name: "Feb", sent: 22, paid: 19 }, { name: "Mar", sent: 25, paid: 22 },
  { name: "Apr", sent: 30, paid: 27 }, { name: "May", sent: 28, paid: 25 }, { name: "Jun", sent: 35, paid: 32 },
];
const profitData = [
  { name: "Job A", value: 8200 }, { name: "Job B", value: 5800 }, { name: "Job C", value: 12400 },
  { name: "Job D", value: 3200 }, { name: "Job E", value: 9600 },
];
const paymentTimingData = [
  { name: "< 3d", value: 42 }, { name: "3-7d", value: 28 }, { name: "7-14d", value: 18 },
  { name: "14-30d", value: 8 }, { name: "30d+", value: 4 },
];
const reviewData = [
  { name: "5 Star", value: 78 }, { name: "4 Star", value: 15 }, { name: "3 Star", value: 5 }, { name: "Other", value: 2 },
];

const tools = [
  {
    num: "4.1", label: "AI Walkthrough Checklist", Icon: ClipboardCheck,
    old: "Show up, walk around, verbal 'looks good' — no documentation",
    ai: "Guided inspection with client present — photo documentation, systematic checklist, digital approval on-site",
    badge: "Inspect",
    chart: (<StatRow items={[{ value: "15", label: "Check Points" }, { value: "Auto", label: "Photo Tag" }, { value: "100%", label: "Documented" }]} />),
  },
  {
    num: "4.2", label: "AI Digital Sign-Off", Icon: Stamp,
    old: "Handshake, verbal agreement, or chase a signature for weeks",
    ai: "Client signs completion approval on phone/tablet on-site — legally binding, timestamped, GPS verified",
    badge: "Legal",
    chart: (<StatRow items={[{ value: "< 2m", label: "Sign Time" }, { value: "On-Site", label: "Captured" }, { value: "GPS", label: "Verified" }]} />),
  },
  {
    num: "4.3", label: "AI Final Invoice", Icon: Receipt,
    old: "Open QuickBooks, manually enter line items, subtract deposit",
    ai: "Auto-generated from job data — deposit subtracted, terms applied, line items from bid + change orders",
    badge: "Billing",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Invoices Sent vs Paid</div>
        <MiniLineChart data={invoiceData} lines={[{ key: "sent", color: "#a0a0a0" }, { key: "paid", color: "#d4af37" }]} />
      </>
    ),
  },
  {
    num: "4.4", label: "AI Invoice Delivery", Icon: Send,
    old: "Email PDF, mail a paper copy, hope they open it",
    ai: "Sends branded invoice with payment link + open tracking — know exactly when they view it",
    badge: "Delivery",
    chart: (<StatRow items={[{ value: "94%", label: "Open Rate" }, { value: "< 1h", label: "Avg Open" }, { value: "Link", label: "Pay Button" }]} />),
  },
  {
    num: "4.5", label: "AI Payment Follow-Up", Icon: Bell,
    old: "Call, leave voicemails, get frustrated, chase for weeks",
    ai: "Automated escalating reminders: email day 1 → text day 7 → call day 14 → formal letter day 30",
    badge: "Collections",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Payment Timing Distribution</div>
        <MiniBarChart data={paymentTimingData} color="#c0c0c0" />
      </>
    ),
  },
  {
    num: "4.6", label: "AI Payment Processing", Icon: CreditCard,
    old: "Wait for check in mail, deposit at bank, hope it clears",
    ai: "Online payment acceptance — auto-records, updates books, sends receipt, marks invoice paid instantly",
    badge: "Payments",
    chart: (<StatRow items={[{ value: "2.1d", label: "Avg Pay Time" }, { value: "97%", label: "Online Pay" }, { value: "Auto", label: "Receipt" }]} />),
  },
  {
    num: "4.7", label: "AI Bookkeeping Sync", Icon: BookOpen,
    old: "Manually enter in QuickBooks/spreadsheet after every payment",
    ai: "Auto-reconciles payment to invoice to job — books always accurate, zero manual entry",
    badge: "Accounting",
    chart: (<StatRow items={[{ value: "0s", label: "Manual Entry" }, { value: "100%", label: "Reconciled" }, { value: "Real-Time", label: "Sync" }]} />),
  },
  {
    num: "4.8", label: "AI Thank You", Icon: Heart,
    old: "Forget to, or send a generic email weeks later",
    ai: "Personalized thank you email auto-sent on payment receipt with project photos and review request",
    badge: "Retention",
    chart: (<StatRow items={[{ value: "Auto", label: "On Payment" }, { value: "100%", label: "Sent" }, { value: "Personal", label: "AI-Written" }]} />),
  },
  {
    num: "4.9", label: "AI Review Request", Icon: Star,
    old: "Awkwardly ask in person, forget most of the time entirely",
    ai: "Sends friendly text/email with direct Google review link — timed perfectly after payment + thank you",
    badge: "Reputation",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Review Score Distribution</div>
        <MiniDonutChart data={reviewData} />
        <StatRow items={[{ value: "4.9", label: "Avg Rating" }, { value: "67%", label: "Response Rate" }, { value: "142", label: "Total Reviews" }]} />
      </>
    ),
  },
  {
    num: "4.10", label: "AI Portfolio Builder", Icon: Image,
    old: "Maybe post on Facebook, probably forget about the project",
    ai: "Auto-generates before/after case study from job photos + specs + client testimonial for your website",
    badge: "Marketing",
    chart: (<StatRow items={[{ value: "Auto", label: "Generated" }, { value: "B/A", label: "Photo Pairs" }, { value: "Web", label: "Published" }]} />),
  },
  {
    num: "4.11", label: "AI Record Keeper", Icon: Archive,
    old: "Filing cabinet, random folder on computer, lost documents",
    ai: "All docs, photos, invoices, comms archived and searchable — never lose a job record again",
    badge: "Archive",
    chart: (<StatRow items={[{ value: "∞", label: "Storage" }, { value: "Search", label: "Instant" }, { value: "100%", label: "Backed Up" }]} />),
  },
  {
    num: "4.12", label: "AI Job P&L", Icon: BarChart3,
    old: "'I think we made money on that one?' — no idea of actual profit",
    ai: "Auto-calculates actual profit: revenue - materials - labor - overhead — know exactly what you earned",
    badge: "Finance",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Job Profitability</div>
        <MiniBarChart data={profitData} color="#d4af37" />
      </>
    ),
  },
  {
    num: "4.13", label: "AI Referral Engine", Icon: RefreshCcw,
    old: "Hope they refer someone someday — zero proactive follow-up",
    ai: "Auto-asks for referrals, tracks past clients for repeat business, sends seasonal maintenance reminders",
    badge: "Growth",
    chart: (<StatRow items={[{ value: "32%", label: "Referral Rate" }, { value: "18", label: "Repeat Clients" }, { value: "$124k", label: "Referral Rev" }]} />),
  },
];

export default function GetPaidView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <NavIcon id="get_paid" size="lg" active />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>GET PAID</h1>
          <p className="text-xs text-muted-foreground">13 AI tools for invoicing, collections & reputation building</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 metallic-gold-icon" />
          <span className="text-[10px] font-bold text-primary">Phase 4 · 13 Tools</span>
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