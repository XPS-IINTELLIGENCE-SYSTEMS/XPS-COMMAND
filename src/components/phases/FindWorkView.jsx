import { MapPin, Search, Users, Target, TrendingUp, Database, Mail, Send, Phone, MessageSquare, Share2, Clock, ListChecks, CalendarCheck, GitBranch, Sparkles } from "lucide-react";
import GlassToolCard from "../shared/GlassToolCard";
import { MiniBarChart, MiniLineChart, MiniDonutChart, MiniAreaChart, StatRow } from "../shared/MiniChart";
import NavIcon from "../shared/NavIcon";

const territoryData = [
  { name: "Phoenix", value: 340 }, { name: "Dallas", value: 280 }, { name: "Houston", value: 410 },
  { name: "Atlanta", value: 195 }, { name: "Denver", value: 150 }, { name: "Tampa", value: 220 },
];
const leadSourceData = [
  { name: "Google Maps", value: 45 }, { name: "LinkedIn", value: 25 }, { name: "Permits", value: 20 }, { name: "Directories", value: 10 },
];
const scoreData = [
  { name: "Mon", scored: 12, qualified: 8 }, { name: "Tue", scored: 18, qualified: 11 },
  { name: "Wed", scored: 22, qualified: 15 }, { name: "Thu", scored: 14, qualified: 9 },
  { name: "Fri", scored: 28, qualified: 19 },
];
const emailData = [
  { name: "Week 1", sent: 45, opened: 32, replied: 8 }, { name: "Week 2", sent: 52, opened: 38, replied: 12 },
  { name: "Week 3", sent: 61, opened: 44, replied: 15 }, { name: "Week 4", sent: 48, opened: 35, replied: 11 },
];
const followUpData = [
  { name: "Day 3", value: 65 }, { name: "Day 7", value: 48 }, { name: "Day 14", value: 32 },
  { name: "Day 30", value: 18 }, { name: "Day 60", value: 8 },
];
const pipelineData = [
  { name: "New", value: 47 }, { name: "Contacted", value: 23 }, { name: "Qualified", value: 12 },
  { name: "Proposal", value: 8 }, { name: "Negotiation", value: 4 },
];

const tools = [
  {
    num: "1.1", label: "AI Territory Analyzer", Icon: MapPin,
    old: "Gut feeling, word of mouth, driving around looking for opportunities",
    ai: "Scrapes census data, building permits, commercial development data by zip code to identify high-value territories",
    badge: "Intel",
    fn: "territoryAnalyzer", params: { city: "Phoenix", state: "AZ", radius_miles: 25 },
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Permits by Territory</div>
        <MiniBarChart data={territoryData} dataKey="value" />
        <StatRow items={[{ value: "6", label: "Territories" }, { value: "1,595", label: "Total Permits" }, { value: "340", label: "Top: Phoenix" }]} />
      </>
    ),
  },
  {
    num: "1.2", label: "AI Lead Scraper", Icon: Search,
    old: "Yellow pages, Blue Book, cold door knocking, trade shows",
    ai: "Scrapes Google Maps, Yelp, permit databases, LinkedIn, industry directories by region + keywords",
    badge: "Active",
    fn: "leadScraper", params: { location: "Phoenix, AZ", count: 25 },
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Lead Sources Breakdown</div>
        <MiniDonutChart data={leadSourceData} />
        <StatRow items={[{ value: "142", label: "Found Today" }, { value: "89%", label: "With Email" }, { value: "4.2s", label: "Avg Speed" }]} />
      </>
    ),
  },
  {
    num: "1.3", label: "AI Contact Enricher", Icon: Users,
    old: "Manually search websites, call front desks, ask around for decision-maker info",
    ai: "Auto-pulls decision maker names, emails, phones, LinkedIn profiles from multiple data sources",
    badge: "Enrichment",
    fn: "contactEnricher", params: { batch_ids: [] },
    chart: (
      <>
        <StatRow items={[{ value: "94%", label: "Email Hit Rate" }, { value: "78%", label: "Phone Found" }, { value: "86%", label: "LinkedIn Match" }, { value: "2.1s", label: "Avg Enrich" }]} />
      </>
    ),
  },
  {
    num: "1.4", label: "AI Deep Research", Icon: Target,
    old: "Google them, drive by the location, ask around for intel",
    ai: "Scrapes their website, reviews, social media, recent news, building permits, existing floor photos",
    badge: "Research",
    fn: "deepResearch", params: { company_name: "" },
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Research Depth Score</div>
        <MiniAreaChart data={[{ name: "Web", value: 92 }, { name: "Reviews", value: 78 }, { name: "Social", value: 85 }, { name: "Permits", value: 68 }, { name: "News", value: 45 }]} color="#c0c0c0" />
      </>
    ),
  },
  {
    num: "1.5", label: "AI Lead Scorer", Icon: TrendingUp,
    old: "Gut feeling, whoever called back, stack of business cards on your desk",
    ai: "Ranks leads by budget indicators, timeline urgency, decision-maker access, square footage, industry fit",
    badge: "Scoring",
    fn: "leadScorer", params: { batch_all: true, top_n: 20 },
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Daily Scoring Activity</div>
        <MiniLineChart data={scoreData} lines={[{ key: "scored", color: "#c0c0c0" }, { key: "qualified", color: "#d4af37" }]} />
      </>
    ),
  },
  {
    num: "1.6", label: "AI Auto-Entry", Icon: Database,
    old: "Write on a notepad, spreadsheet, sticky notes, whiteboard",
    ai: "Lead automatically created in CRM with all enriched data, tagged and scored — zero manual entry",
    badge: "Auto",
    chart: (
      <>
        <StatRow items={[{ value: "0s", label: "Manual Entry" }, { value: "142", label: "Auto-Created" }, { value: "100%", label: "Data Complete" }]} />
      </>
    ),
  },
  {
    num: "1.7", label: "AI Email Writer", Icon: Mail,
    old: "Type it yourself from scratch every single time",
    ai: "Generates personalized email using lead research + your brand voice + proven high-conversion templates",
    badge: "Content",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Email Performance</div>
        <MiniLineChart data={emailData} lines={[{ key: "sent", color: "#a0a0a0" }, { key: "opened", color: "#c0c0c0" }, { key: "replied", color: "#d4af37" }]} />
      </>
    ),
  },
  {
    num: "1.8", label: "AI Auto-Send", Icon: Send,
    old: "Open Gmail, copy paste, hit send one at a time",
    ai: "Sends via integrated email with open/click tracking, delivery confirmation, and smart send-time optimization",
    badge: "Delivery",
    chart: (
      <>
        <StatRow items={[{ value: "98.2%", label: "Delivery Rate" }, { value: "42%", label: "Open Rate" }, { value: "12%", label: "Reply Rate" }, { value: "< 2m", label: "Send Speed" }]} />
      </>
    ),
  },
  {
    num: "1.9", label: "AI Call Prep", Icon: Phone,
    old: "Look up number, dial, hope they answer, wing the conversation",
    ai: "Generates call script with talking points, company intel, objection responses; auto-logs call notes",
    badge: "Voice",
    chart: (
      <>
        <StatRow items={[{ value: "85%", label: "Connect Rate" }, { value: "4.2m", label: "Avg Duration" }, { value: "32%", label: "Meeting Set" }]} />
      </>
    ),
  },
  {
    num: "1.10", label: "AI SMS Outreach", Icon: MessageSquare,
    old: "Type from personal phone, no tracking, unprofessional",
    ai: "Personalized text from business number with delivery tracking and response management",
    badge: "SMS",
    chart: (
      <>
        <StatRow items={[{ value: "98%", label: "Delivered" }, { value: "67%", label: "Read Rate" }, { value: "23%", label: "Response" }, { value: "< 30s", label: "Send Time" }]} />
      </>
    ),
  },
  {
    num: "1.11", label: "AI Content Creator", Icon: Share2,
    old: "Think of something, take a photo, post manually on each platform",
    ai: "Generates platform-specific posts, schedules across Instagram/Facebook/LinkedIn/TikTok with analytics",
    badge: "Social",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Social Reach by Platform</div>
        <MiniDonutChart data={[{ name: "Instagram", value: 42 }, { name: "Facebook", value: 28 }, { name: "LinkedIn", value: 18 }, { name: "TikTok", value: 12 }]} />
      </>
    ),
  },
  {
    num: "1.12", label: "AI Follow-Up Engine", Icon: Clock,
    old: "Try to remember, check notepad, forget most of them entirely",
    ai: "Automated drip sequences across email/text/call with escalation logic — never miss a follow-up",
    badge: "Automation",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Follow-Up Response Curve</div>
        <MiniAreaChart data={followUpData} color="#d4af37" />
      </>
    ),
  },
  {
    num: "1.13", label: "AI Conversation Logger", Icon: ListChecks,
    old: "Scroll through texts, search email, try to remember phone calls",
    ai: "All touchpoints auto-logged to lead timeline — emails, calls, texts, meetings in one unified view",
    badge: "Tracking",
    chart: (
      <>
        <StatRow items={[{ value: "1,247", label: "Logged Today" }, { value: "100%", label: "Auto-Captured" }, { value: "3", label: "Channels" }]} />
      </>
    ),
  },
  {
    num: "1.14", label: "AI Scheduler", Icon: CalendarCheck,
    old: "Back-and-forth emails and texts trying to find availability",
    ai: "Sends booking link synced to your calendar, auto-confirms, sends reminders, handles rescheduling",
    badge: "Booking",
    chart: (
      <>
        <StatRow items={[{ value: "18", label: "Booked This Week" }, { value: "92%", label: "Show Rate" }, { value: "0", label: "No-Shows" }]} />
      </>
    ),
  },
  {
    num: "1.15", label: "AI Pipeline Manager", Icon: GitBranch,
    old: "Manually drag cards, update spreadsheet, forget to do it",
    ai: "Auto-advances pipeline stage based on activity — email opened → replied → meeting booked → proposal sent",
    badge: "CRM",
    chart: (
      <>
        <div className="text-[10px] font-semibold text-foreground mb-2">Pipeline Distribution</div>
        <MiniBarChart data={pipelineData} color="#c0c0c0" />
      </>
    ),
  },
];

export default function FindWorkView() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <NavIcon id="find_work" size="lg" active />
        <div>
          <h1 className="text-lg md:text-xl font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>FIND WORK</h1>
          <p className="text-xs text-muted-foreground">15 AI tools for lead generation, territory research & prospecting</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 metallic-gold-icon" />
          <span className="text-[10px] font-bold text-primary">Phase 1 · 15 Tools</span>
        </div>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => (
          <GlassToolCard
            key={tool.num}
            num={tool.num}
            label={tool.label}
            Icon={tool.Icon}
            oldWay={tool.old}
            aiTool={tool.ai}
            statusBadge={tool.badge}
            functionName={tool.fn}
            functionParams={tool.params}
          >
            {tool.chart}
          </GlassToolCard>
        ))}
      </div>
    </div>
  );
}