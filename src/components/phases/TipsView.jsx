import { useState } from "react";
import { Search, Compass, Package, Hammer, Phone, Clock, Trophy, HardHat, DollarSign, BarChart3, Lightbulb, Bot, CalendarClock, Settings, Users, Layers, Play, BookOpen, Star, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import HScrollRow from "../shared/HScrollRow";
import HCard from "../shared/HCard";
import NavIcon from "../shared/NavIcon";

const TIP_SECTIONS = [
  {
    id: "start_here", title: "START HERE", subtitle: "Getting set up", icon: Compass,
    tips: [
      { title: "First Login Setup", desc: "Complete your profile, set AI mode, and connect services", tag: "Guide" },
      { title: "Quick Start Checklist", desc: "5 steps to go from zero to fully operational", tag: "Guide" },
      { title: "Understanding the Dashboard", desc: "What each card means and how to navigate", tag: "Video" },
      { title: "Customizing Your Sidebar", desc: "Drag, rename, and add custom navigation items", tag: "Pro Tip" },
      { title: "Setting Up Notifications", desc: "Configure email, SMS, and push alerts", tag: "Guide" },
      { title: "Connecting Google Services", desc: "Link Calendar, Drive, Gmail, and Sheets", tag: "Video" },
      { title: "Mobile App Installation", desc: "Add to home screen for native app experience", tag: "Pro Tip" },
      { title: "Inviting Team Members", desc: "How to add operators and set roles", tag: "Guide" },
      { title: "Keyboard Shortcuts", desc: "Navigate faster with built-in shortcuts", tag: "Pro Tip" },
      { title: "Dark vs Light Mode", desc: "Choose the theme that works best for you", tag: "Pro Tip" },
    ],
  },
  {
    id: "find_work", title: "DISCOVERY", subtitle: "Signal-based prospecting", icon: Search,
    tips: [
      { title: "Scraper Configuration", desc: "Set up keywords, locations, and industries for auto-scraping", tag: "Guide" },
      { title: "Reading Lead Signals", desc: "Understanding score, priority, and pipeline status", tag: "Video" },
      { title: "Bulk Lead Import", desc: "Import leads from CSV, Google Sheets, or other CRMs", tag: "Guide" },
      { title: "AI Lead Scoring", desc: "How the AI scores leads and what factors matter most", tag: "Pro Tip" },
      { title: "Manual Lead Entry", desc: "Best practices for adding leads by hand", tag: "Guide" },
      { title: "Territory Mapping", desc: "Use geographic data to identify hot zones", tag: "Sales" },
      { title: "Competitor Research", desc: "Find what your competitors are missing", tag: "Pro Tip" },
      { title: "Google Maps Prospecting", desc: "Using Google Maps data to find new leads", tag: "Video" },
      { title: "Industry Vertical Targeting", desc: "Why vertical-specific scraping outperforms generic", tag: "Sales" },
      { title: "Lead Deduplication", desc: "Automatically prevent duplicate entries", tag: "Pro Tip" },
    ],
  },
  {
    id: "xpress_leads", title: "XPRESS PIPELINE", subtitle: "Contractor & operator leads", icon: Package,
    tips: [
      { title: "XPress vs Jobs Leads", desc: "Understanding the difference between lead types", tag: "Guide" },
      { title: "Pipeline Stage Management", desc: "Moving leads through Incoming → Qualified → Won", tag: "Video" },
      { title: "Filtering & Sorting", desc: "Find the right leads fast with smart filters", tag: "Pro Tip" },
      { title: "Bulk Stage Updates", desc: "Move multiple leads at once to save time", tag: "Pro Tip" },
      { title: "Lead Card Deep Dive", desc: "Every field explained and when to use it", tag: "Guide" },
      { title: "AI Validation Agent", desc: "How the auto-validation enriches lead data", tag: "Video" },
      { title: "Product Recommendations", desc: "AI matches XPS products to lead needs", tag: "Sales" },
      { title: "Priority Ranking System", desc: "How leads get ranked 1-10 automatically", tag: "Guide" },
      { title: "Exporting Lead Data", desc: "Export to CSV, Google Sheets, or PDF", tag: "Pro Tip" },
      { title: "Pipeline Health Metrics", desc: "Track conversion rates across stages", tag: "Sales" },
    ],
  },
  {
    id: "job_leads", title: "JOBS PIPELINE", subtitle: "End-buyer project leads", icon: Hammer,
    tips: [
      { title: "Job Lead Sources", desc: "Where job leads come from and how to get more", tag: "Guide" },
      { title: "Estimating Square Footage", desc: "Quick methods for accurate job sizing", tag: "Pro Tip" },
      { title: "Material Calculator", desc: "Calculate epoxy and coating needs per sqft", tag: "Guide" },
      { title: "Site Visit Checklist", desc: "What to check before quoting a job", tag: "Guide" },
      { title: "Pricing Strategies", desc: "How to price per sqft for maximum margin", tag: "Sales" },
      { title: "Competitive Bidding", desc: "Win bids without racing to the bottom", tag: "Sales" },
      { title: "Upselling Services", desc: "Turn a basic job into a premium package", tag: "Pro Tip" },
      { title: "Commercial vs Residential", desc: "Different approaches for each market", tag: "Guide" },
      { title: "Insurance & Bonding", desc: "What coverage you need for which jobs", tag: "Guide" },
      { title: "Project Timeline Planning", desc: "Accurate scheduling for floor coating jobs", tag: "Pro Tip" },
    ],
  },
  {
    id: "get_work", title: "CONTACT", subtitle: "Outreach & communication", icon: Phone,
    tips: [
      { title: "Cold Email Templates", desc: "Proven templates with 40%+ open rates", tag: "Sales" },
      { title: "AI Email Writer", desc: "Let AI craft personalized outreach for each lead", tag: "Video" },
      { title: "Follow-Up Timing", desc: "The ideal cadence for maximum response rates", tag: "Pro Tip" },
      { title: "Phone Script Preparation", desc: "AI-generated scripts based on lead data", tag: "Guide" },
      { title: "SMS Best Practices", desc: "When and how to text leads professionally", tag: "Pro Tip" },
      { title: "Multi-Channel Outreach", desc: "Combining email, phone, and SMS for results", tag: "Sales" },
      { title: "Handling Objections", desc: "Top 10 objections and how to overcome them", tag: "Video" },
      { title: "Building Rapport Fast", desc: "Techniques for immediate trust building", tag: "Sales" },
      { title: "Email Subject Lines", desc: "Subject lines that get opened every time", tag: "Pro Tip" },
      { title: "Voice Mail Scripts", desc: "Leave voicemails that get callbacks", tag: "Guide" },
    ],
  },
  {
    id: "follow_up", title: "FOLLOW-UP", subtitle: "Sequences & reminders", icon: Clock,
    tips: [
      { title: "3-Touch Email Sequence", desc: "Day 1, 3, 7 follow-up that converts", tag: "Guide" },
      { title: "Automated Reminders", desc: "Set it and forget it follow-up system", tag: "Video" },
      { title: "Re-engaging Cold Leads", desc: "Bring dead leads back to life", tag: "Sales" },
      { title: "Follow-Up Metrics", desc: "Track open rates, replies, and conversions", tag: "Pro Tip" },
      { title: "Multi-Channel Sequences", desc: "Email → SMS → Call combo sequences", tag: "Guide" },
      { title: "Seasonal Follow-Up", desc: "Time-based campaigns for each season", tag: "Sales" },
      { title: "Post-Quote Follow-Up", desc: "What to do after sending a proposal", tag: "Pro Tip" },
      { title: "Referral Request Timing", desc: "When and how to ask for referrals", tag: "Sales" },
      { title: "Anniversary Touches", desc: "Remember client milestones automatically", tag: "Pro Tip" },
      { title: "Stale Lead Reactivation", desc: "30/60/90 day re-engagement strategies", tag: "Guide" },
    ],
  },
  {
    id: "win_work", title: "CLOSE", subtitle: "Proposals & closing", icon: Trophy,
    tips: [
      { title: "Proposal Best Practices", desc: "Structure proposals that win 60%+ of the time", tag: "Guide" },
      { title: "AI Proposal Generator", desc: "Auto-generate proposals from lead data", tag: "Video" },
      { title: "Pricing Psychology", desc: "Frame your price to feel like a bargain", tag: "Sales" },
      { title: "Closing Techniques", desc: "5 closing methods for different buyer types", tag: "Sales" },
      { title: "Handling Price Objections", desc: "When they say it's too expensive", tag: "Pro Tip" },
      { title: "Creating Urgency", desc: "Ethical urgency tactics that accelerate decisions", tag: "Sales" },
      { title: "Visual Proposals", desc: "Add photos and before/after to proposals", tag: "Pro Tip" },
      { title: "Contract Terms", desc: "Standard terms that protect you and close deals", tag: "Guide" },
      { title: "Negotiation Framework", desc: "Win-win negotiation for contractors", tag: "Sales" },
      { title: "Deposit Collection", desc: "Getting the deposit to lock in the job", tag: "Guide" },
    ],
  },
  {
    id: "do_work", title: "EXECUTE", subtitle: "Jobs & execution", icon: HardHat,
    tips: [
      { title: "Job Kickoff Checklist", desc: "Everything to verify before starting work", tag: "Guide" },
      { title: "Surface Prep Secrets", desc: "The #1 mistake contractors make with moisture testing", tag: "Video" },
      { title: "Material Handling", desc: "Proper storage and mixing for best results", tag: "Pro Tip" },
      { title: "Quality Control Checkpoints", desc: "Inspect at each stage to prevent callbacks", tag: "Guide" },
      { title: "Photo Documentation", desc: "Before, during, and after photo system", tag: "Pro Tip" },
      { title: "Client Communication During Jobs", desc: "Keep clients informed and happy", tag: "Guide" },
      { title: "Weather & Conditions", desc: "Temperature and humidity requirements", tag: "Pro Tip" },
      { title: "Crew Management", desc: "Assigning tasks and tracking progress", tag: "Guide" },
      { title: "Safety Protocols", desc: "OSHA compliance and safety gear checklist", tag: "Guide" },
      { title: "Metallic Epoxy Techniques", desc: "Advanced manipulation for show-stopping floors", tag: "Video" },
    ],
  },
  {
    id: "get_paid", title: "COLLECT", subtitle: "Invoice & collect", icon: DollarSign,
    tips: [
      { title: "Invoice Immediately", desc: "Why same-day invoicing increases payment speed", tag: "Pro Tip" },
      { title: "AI Invoice Generator", desc: "Auto-create invoices from completed proposals", tag: "Video" },
      { title: "Payment Terms", desc: "Net 15 vs Net 30 — what works best", tag: "Guide" },
      { title: "Overdue Collections", desc: "Professional escalation steps for late payments", tag: "Guide" },
      { title: "Accept Multiple Payments", desc: "Credit, check, ACH, and financing options", tag: "Pro Tip" },
      { title: "Progress Billing", desc: "Bill in stages for larger projects", tag: "Guide" },
      { title: "Tax Documentation", desc: "Keep records for tax season automatically", tag: "Guide" },
      { title: "Client Payment Portal", desc: "Let clients pay online with one click", tag: "Pro Tip" },
      { title: "Cash Flow Management", desc: "Predict and plan your cash flow monthly", tag: "Sales" },
      { title: "Dispute Resolution", desc: "Handle payment disputes professionally", tag: "Guide" },
    ],
  },
  {
    id: "analytics", title: "ANALYTICS", subtitle: "Charts & revenue", icon: BarChart3,
    tips: [
      { title: "Dashboard KPIs", desc: "The 5 numbers you should check every day", tag: "Guide" },
      { title: "Revenue Forecasting", desc: "Predict next month's revenue from pipeline data", tag: "Pro Tip" },
      { title: "Win Rate Optimization", desc: "Track and improve your close percentage", tag: "Sales" },
      { title: "Lead Source ROI", desc: "Which lead sources generate the most revenue", tag: "Guide" },
      { title: "Pipeline Velocity", desc: "How fast leads move through your pipeline", tag: "Pro Tip" },
      { title: "Monthly Reports", desc: "Auto-generated monthly performance summaries", tag: "Video" },
      { title: "Seasonal Trends", desc: "Identify patterns in your business cycle", tag: "Guide" },
      { title: "Cost Per Lead Analysis", desc: "Calculate true cost per acquired lead", tag: "Pro Tip" },
      { title: "Team Performance", desc: "Compare crew productivity and efficiency", tag: "Guide" },
      { title: "Custom Dashboards", desc: "Build views for the metrics you care about", tag: "Pro Tip" },
    ],
  },
  {
    id: "crm", title: "CRM", subtitle: "Pipeline board", icon: Users,
    tips: [
      { title: "CRM Board Layout", desc: "Understanding columns and how to customize stages", tag: "Guide" },
      { title: "Drag & Drop Management", desc: "Move deals across stages with a drag", tag: "Video" },
      { title: "Lead Prioritization", desc: "How the AI ranks leads for you to contact first", tag: "Pro Tip" },
      { title: "Bulk Operations", desc: "Select multiple leads for mass actions", tag: "Pro Tip" },
      { title: "Custom Fields", desc: "Add fields specific to your business needs", tag: "Guide" },
      { title: "Activity Tracking", desc: "Log calls, emails, and notes on each lead", tag: "Guide" },
      { title: "Deal Value Tracking", desc: "Track estimated vs actual revenue per lead", tag: "Sales" },
      { title: "Pipeline Reports", desc: "Generate reports from your CRM data", tag: "Pro Tip" },
      { title: "Integration Sync", desc: "Keep CRM data in sync with HubSpot or Sheets", tag: "Guide" },
      { title: "Lost Deal Analysis", desc: "Learn from losses to improve your process", tag: "Sales" },
    ],
  },
  {
    id: "templates", title: "TEMPLATES", subtitle: "Ready-to-use templates", icon: Layers,
    tips: [
      { title: "Using Template Library", desc: "Browse, preview, and apply templates instantly", tag: "Guide" },
      { title: "Customizing Templates", desc: "Modify any template to fit your brand", tag: "Pro Tip" },
      { title: "Creating Custom Templates", desc: "Save your work as reusable templates", tag: "Video" },
      { title: "Template Categories", desc: "Understanding what each category offers", tag: "Guide" },
      { title: "Sharing Templates", desc: "Share templates with your team", tag: "Pro Tip" },
      { title: "Industry Templates", desc: "Pre-built setups for specific trades", tag: "Guide" },
      { title: "Agent Templates", desc: "Deploy pre-configured AI agents", tag: "Pro Tip" },
      { title: "Workflow Templates", desc: "Automation sequences ready to activate", tag: "Video" },
      { title: "Email Templates", desc: "Professional email templates for every scenario", tag: "Guide" },
      { title: "Proposal Templates", desc: "Win more jobs with professional proposals", tag: "Sales" },
    ],
  },
  {
    id: "task_scheduler", title: "TASK SCHEDULER", subtitle: "Scraper control center", icon: CalendarClock,
    tips: [
      { title: "Setting Up Scrapers", desc: "Configure automated data collection jobs", tag: "Guide" },
      { title: "Schedule Frequency", desc: "How often to run scrapers for best results", tag: "Pro Tip" },
      { title: "Keyword Strategy", desc: "Choose keywords that find the right leads", tag: "Sales" },
      { title: "Location Targeting", desc: "Set geographic boundaries for scraping", tag: "Guide" },
      { title: "Bulk vs Single Mode", desc: "When to use each scraping approach", tag: "Pro Tip" },
      { title: "Data Destinations", desc: "Route scraped data to the right place", tag: "Guide" },
      { title: "Monitoring Job Health", desc: "Track success rates and fix failures", tag: "Pro Tip" },
      { title: "Google Integration", desc: "Connect Calendar, Drive, Gmail & Sheets", tag: "Video" },
      { title: "Rate Limiting", desc: "Avoid getting blocked by search engines", tag: "Pro Tip" },
      { title: "Custom Scraper Scripts", desc: "Advanced scraping with custom logic", tag: "Guide" },
    ],
  },
  {
    id: "agents", title: "AGENTS", subtitle: "AI agent command", icon: Bot,
    tips: [
      { title: "Agent Fleet Overview", desc: "Understanding your available AI agents", tag: "Guide" },
      { title: "Configuring Agent Behavior", desc: "Set autonomy level and preferred tools", tag: "Video" },
      { title: "Multi-Agent Orchestration", desc: "Run multiple agents in coordinated workflows", tag: "Pro Tip" },
      { title: "Agent Conversations", desc: "Chat with agents for task execution", tag: "Guide" },
      { title: "WhatsApp Integration", desc: "Use agents directly from WhatsApp", tag: "Video" },
      { title: "Custom Agent Creation", desc: "Build agents tailored to your business", tag: "Pro Tip" },
      { title: "Agent Permissions", desc: "Control what each agent can access", tag: "Guide" },
      { title: "Swarm Mode", desc: "Deploy multiple agents on complex tasks", tag: "Pro Tip" },
      { title: "Agent Scheduling", desc: "Run agents on automatic schedules", tag: "Guide" },
      { title: "Monitoring Agent Output", desc: "Review and approve agent actions", tag: "Pro Tip" },
    ],
  },
  {
    id: "settings", title: "SETTINGS", subtitle: "Account & preferences", icon: Settings,
    tips: [
      { title: "Profile Setup", desc: "Complete your profile for personalized AI responses", tag: "Guide" },
      { title: "Notification Preferences", desc: "Fine-tune which alerts you receive", tag: "Pro Tip" },
      { title: "Theme Customization", desc: "Switch between dark and light mode", tag: "Pro Tip" },
      { title: "API Token Management", desc: "Add and manage external service tokens", tag: "Guide" },
      { title: "Connector Setup", desc: "Link all your business tools in one place", tag: "Video" },
      { title: "Security Settings", desc: "Password, 2FA, and access controls", tag: "Guide" },
      { title: "Data Export", desc: "Export all your data at any time", tag: "Pro Tip" },
      { title: "Team Management", desc: "Add, remove, and manage team roles", tag: "Guide" },
      { title: "Billing & Usage", desc: "Track credits, usage, and billing", tag: "Guide" },
      { title: "Backup & Recovery", desc: "How your data is protected and backed up", tag: "Pro Tip" },
    ],
  },
  {
    id: "admin", title: "ADMIN", subtitle: "Operator tools", icon: Shield,
    tips: [
      { title: "Admin Panel Overview", desc: "What tools are available to admin operators", tag: "Guide" },
      { title: "Image AI Generator", desc: "Create professional images with AI", tag: "Video" },
      { title: "Web Browser Tool", desc: "Browse the web from within the admin panel", tag: "Pro Tip" },
      { title: "Command Scraper", desc: "Advanced scraping from the admin console", tag: "Guide" },
      { title: "Multi-Agent Chat", desc: "Orchestrate multiple agents simultaneously", tag: "Video" },
      { title: "UI Builder", desc: "Edit and create UI components visually", tag: "Pro Tip" },
      { title: "Gantt Chart Planning", desc: "Plan projects with visual timelines", tag: "Guide" },
      { title: "Swarm Orchestration", desc: "Deploy AI swarms for complex tasks", tag: "Pro Tip" },
      { title: "GitHub & Supabase", desc: "Connect code repos and databases", tag: "Guide" },
      { title: "System Health Monitoring", desc: "Track app performance and uptime", tag: "Pro Tip" },
    ],
  },
];

const TAG_ICONS = { Video: Play, Guide: BookOpen, "Pro Tip": Star, Sales: Lightbulb };

export default function TipsView() {
  const [search, setSearch] = useState("");

  const filtered = TIP_SECTIONS.filter(section => {
    if (!search) return true;
    const q = search.toLowerCase();
    return section.title.toLowerCase().includes(q) || section.tips.some(t => t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 space-y-12">
        {/* Hero */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <NavIcon id="tips" size="sm" active />
            <span className="text-xs font-semibold text-white">TIPS · TRICKS · KNOWLEDGE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            TIPS & TRICKS
          </h1>
          <p className="mt-2 text-xs text-white/40">Pro knowledge for every step of your workflow</p>
          <div className="mt-4 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 bg-white/[0.04] border-white/[0.1] rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tip sections */}
        {filtered.map((section) => {
          const Icon = section.icon;
          return (
            <HScrollRow key={section.id} title={section.title} subtitle={section.subtitle} icon={Icon} count={section.tips.length}>
              {section.tips.map((tip, i) => {
                const TagIcon = TAG_ICONS[tip.tag] || Lightbulb;
                return (
                  <HCard key={tip.title} title={tip.title} icon={TagIcon} index={i}>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{tip.tag}</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed mt-1">{tip.desc}</p>
                  </HCard>
                );
              })}
            </HScrollRow>
          );
        })}
      </div>
    </div>
  );
}