/**
 * Central registry of all phase tools.
 * Each tool: { id, label, icon (lucide name), description, badge, moduleType, defaultParams, chatCommand }
 * moduleType maps to a specific interactive module component.
 */

export const PHASES = [
  {
    id: "find_work",
    label: "Discover",
    num: "1",
    desc: "Leads & prospecting",
    categories: [
      {
        title: "TERRITORY & INTELLIGENCE",
        subtitle: "Discover high-value markets and research prospects.",
        tools: [
          { id: "territory_analyzer", label: "Territory Analyzer", icon: "MapPin", badge: "Intel", moduleType: "scraper", description: "Scrapes census data, permits, and commercial development by zip code.", defaultParams: { location: "", radius: "25 miles", industry: "Commercial", count: 25 } },
          { id: "lead_scraper", label: "Lead Scraper", icon: "Search", badge: "Active", moduleType: "scraper", description: "Scrapes Google Maps, Yelp, permits, LinkedIn, and directories.", defaultParams: { location: "", radius: "25 miles", industry: "", count: 25 } },
          { id: "contact_enricher", label: "Contact Enricher", icon: "Users", badge: "Enrich", moduleType: "action", description: "Auto-pulls decision maker names, emails, phones, LinkedIn profiles.", defaultParams: { target: "Top 10 leads" } },
          { id: "deep_research", label: "Deep Research", icon: "Target", badge: "Research", moduleType: "research", description: "Scrapes website, reviews, social media, news, and floor photos.", defaultParams: { query: "", depth: "Full" } },
        ],
      },
      {
        title: "SCORING & ORGANIZATION",
        subtitle: "Let AI rank and organize your leads.",
        tools: [
          { id: "lead_scorer", label: "Lead Scorer", icon: "TrendingUp", badge: "Score", moduleType: "action", description: "Ranks leads by budget, timeline, decision-maker access, and industry fit.", defaultParams: { target: "All leads" } },
          { id: "auto_entry", label: "Auto-Entry to CRM", icon: "Database", badge: "Auto", moduleType: "action", description: "Leads automatically created in CRM with all enriched data.", defaultParams: {} },
        ],
      },
    ],
  },
  {
    id: "get_work",
    label: "Engage",
    num: "2",
    desc: "Outreach & comms",
    categories: [
      {
        title: "OUTREACH & COMMUNICATION",
        subtitle: "Engage leads across every channel with AI-personalized messaging.",
        tools: [
          { id: "email_writer", label: "AI Email Writer", icon: "Mail", badge: "Content", moduleType: "composer", description: "Generates personalized email using lead research and templates.", defaultParams: { to: "", subject: "", tone: "Professional" } },
          { id: "auto_send", label: "Auto-Send Email", icon: "Send", badge: "Delivery", moduleType: "action", description: "Sends via integrated email with open/click tracking.", defaultParams: { target: "Top 5 leads" } },
          { id: "call_prep", label: "Call Prep", icon: "Phone", badge: "Voice", moduleType: "composer", description: "Generates call script with talking points and objection responses.", defaultParams: { contact: "", purpose: "Discovery" } },
          { id: "sms_outreach", label: "SMS Outreach", icon: "MessageSquare", badge: "SMS", moduleType: "composer", description: "Personalized text from business number with delivery tracking.", defaultParams: { to: "", message: "" } },
          { id: "content_creator", label: "Content Creator", icon: "Share2", badge: "Social", moduleType: "composer", description: "Generates platform-specific posts for Instagram/Facebook/LinkedIn/TikTok.", defaultParams: { platform: "Instagram", topic: "" } },
        ],
      },
      {
        title: "FOLLOW-UP & PIPELINE",
        subtitle: "AI manages sequences, logs conversations, and moves leads forward.",
        tools: [
          { id: "followup_engine", label: "Follow-Up Engine", icon: "Clock", badge: "Auto", moduleType: "action", description: "Automated drip sequences across email/text/call with escalation.", defaultParams: { target: "All contacted leads" } },
          { id: "conversation_logger", label: "Conversation Logger", icon: "ListChecks", badge: "Track", moduleType: "action", description: "All touchpoints auto-logged to lead timeline.", defaultParams: {} },
          { id: "scheduler", label: "AI Scheduler", icon: "CalendarCheck", badge: "Book", moduleType: "action", description: "Sends booking link synced to calendar, auto-confirms, sends reminders.", defaultParams: { contact: "" } },
          { id: "pipeline_manager", label: "Pipeline Manager", icon: "GitBranch", badge: "CRM", moduleType: "action", description: "Auto-advances pipeline stage based on activity.", defaultParams: {} },
        ],
      },
    ],
  },
  {
    id: "win_work",
    label: "Close",
    num: "3",
    desc: "Proposals & closing",
    categories: [
      {
        title: "SITE ASSESSMENT",
        subtitle: "Measure, inspect, and calculate before you quote.",
        tools: [
          { id: "measurement_assist", label: "Measurement Assist", icon: "Ruler", badge: "Measure", moduleType: "calculator", description: "Input dimensions or upload floor plan — auto-calculates SF, waste factor.", defaultParams: { length: "", width: "", waste_factor: "10%" } },
          { id: "condition_checklist", label: "Condition Checklist", icon: "ClipboardCheck", badge: "Inspect", moduleType: "checklist", description: "Guided photo-based inspection form with auto-notes.", defaultParams: {} },
          { id: "material_calculator", label: "Material Calculator", icon: "Calculator", badge: "Materials", moduleType: "calculator", description: "Auto-calculates products, quantities, and coats from SF + floor type.", defaultParams: { sqft: "", floor_type: "Epoxy", coats: "2" } },
        ],
      },
      {
        title: "PRICING & PROPOSALS",
        subtitle: "Build professional, branded proposals in seconds.",
        tools: [
          { id: "bid_calculator", label: "Bid Calculator", icon: "DollarSign", badge: "Pricing", moduleType: "calculator", description: "Uses your pricing matrix + material costs + labor rates for instant bids.", defaultParams: { sqft: "", service_type: "Standard Epoxy", rate: "" } },
          { id: "proposal_generator", label: "Proposal Generator", icon: "FileText", badge: "Generate", moduleType: "action", description: "Branded, professional proposal auto-built from bid data in 30 seconds.", defaultParams: { lead: "" } },
          { id: "proposal_delivery", label: "Proposal Delivery", icon: "Send", badge: "Track", moduleType: "action", description: "Sends branded email with real-time tracking.", defaultParams: {} },
        ],
      },
      {
        title: "CLOSING THE DEAL",
        subtitle: "Automated follow-ups and negotiation coaching.",
        tools: [
          { id: "proposal_followup", label: "Proposal Follow-Up", icon: "Clock", badge: "Follow-Up", moduleType: "action", description: "Auto-triggers follow-up based on open/no-response timing.", defaultParams: {} },
          { id: "negotiation_coach", label: "Negotiation Coach", icon: "Swords", badge: "Coach", moduleType: "composer", description: "Real-time objection handling suggestions and value justification.", defaultParams: { objection: "" } },
          { id: "quick_revise", label: "Quick Revise", icon: "PenLine", badge: "Revise", moduleType: "action", description: "Update proposal pricing instantly and re-send.", defaultParams: { new_price: "" } },
        ],
      },
    ],
  },
  {
    id: "do_work",
    label: "Execute",
    num: "4",
    desc: "Jobs & execution",
    categories: [
      {
        title: "SCHEDULING & PREP",
        subtitle: "Materials ordered, crews assigned, jobs queued — automatically.",
        tools: [
          { id: "job_scheduler", label: "Job Scheduler", icon: "CalendarClock", badge: "Schedule", moduleType: "action", description: "Auto-schedules based on crew availability, travel distance, and weather.", defaultParams: {} },
          { id: "procurement", label: "Procurement", icon: "ShoppingCart", badge: "Order", moduleType: "action", description: "Auto-generates purchase order from bid specs.", defaultParams: {} },
          { id: "delivery_tracker", label: "Delivery Tracker", icon: "Truck", badge: "Logistics", moduleType: "action", description: "Auto-confirms delivery date, alerts if delayed.", defaultParams: {} },
        ],
      },
      {
        title: "CREW & EXECUTION",
        subtitle: "Assign crews, brief them, and track progress.",
        tools: [
          { id: "crew_manager", label: "Crew Manager", icon: "Users", badge: "Team", moduleType: "action", description: "Assigns based on skills + location + availability.", defaultParams: {} },
          { id: "job_brief", label: "Job Brief", icon: "FileText", badge: "Brief", moduleType: "action", description: "Auto-sends crew a complete job package.", defaultParams: {} },
          { id: "daily_log", label: "Daily Log", icon: "ClipboardList", badge: "Log", moduleType: "action", description: "Crew submits progress photos + notes.", defaultParams: {} },
        ],
      },
      {
        title: "MONITORING & COMPLETION",
        subtitle: "Keep clients informed and jobs on track.",
        tools: [
          { id: "client_updates", label: "Client Updates", icon: "MessageCircle", badge: "Comms", moduleType: "composer", description: "Auto-sends progress report with photos at milestones.", defaultParams: {} },
          { id: "change_order", label: "Change Order Manager", icon: "FileEdit", badge: "Changes", moduleType: "action", description: "Documents issue, generates change order with revised pricing.", defaultParams: {} },
          { id: "cost_tracker", label: "Cost Tracker", icon: "DollarSign", badge: "Finance", moduleType: "action", description: "Real-time material + labor cost tracking vs. bid.", defaultParams: {} },
          { id: "quality_checklist", label: "Quality Checklist", icon: "CheckSquare", badge: "QC", moduleType: "checklist", description: "Step-by-step verification with photo documentation.", defaultParams: {} },
          { id: "job_completion", label: "Job Completion", icon: "Flag", badge: "Handoff", moduleType: "action", description: "Marks complete → triggers invoicing and client notification.", defaultParams: {} },
        ],
      },
    ],
  },
  {
    id: "get_paid",
    label: "Collect",
    num: "5",
    desc: "Invoice & collect",
    categories: [
      {
        title: "INVOICING & PAYMENTS",
        subtitle: "Get paid faster with automated invoicing.",
        tools: [
          { id: "final_invoice", label: "Final Invoice", icon: "Receipt", badge: "Billing", moduleType: "action", description: "Auto-generated from job data — deposit subtracted, terms applied.", defaultParams: {} },
          { id: "invoice_delivery", label: "Invoice Delivery", icon: "Send", badge: "Delivery", moduleType: "action", description: "Sends branded invoice with payment link + tracking.", defaultParams: {} },
          { id: "payment_followup", label: "Payment Follow-Up", icon: "Bell", badge: "Collect", moduleType: "action", description: "Automated escalating reminders: email, text, call.", defaultParams: {} },
          { id: "bookkeeping_sync", label: "Bookkeeping Sync", icon: "BookOpen", badge: "Accounting", moduleType: "action", description: "Auto-reconciles payment to invoice to job.", defaultParams: {} },
        ],
      },
      {
        title: "CLIENT RETENTION & GROWTH",
        subtitle: "Turn completed jobs into reviews, referrals, and repeat business.",
        tools: [
          { id: "thank_you", label: "AI Thank You", icon: "Heart", badge: "Retention", moduleType: "action", description: "Personalized thank you on payment receipt.", defaultParams: {} },
          { id: "review_request", label: "Review Request", icon: "Star", badge: "Reputation", moduleType: "action", description: "Sends friendly text/email with Google review link.", defaultParams: {} },
          { id: "portfolio_builder", label: "Portfolio Builder", icon: "Image", badge: "Marketing", moduleType: "action", description: "Auto-generates before/after case study from job photos.", defaultParams: {} },
          { id: "referral_engine", label: "Referral Engine", icon: "RefreshCcw", badge: "Growth", moduleType: "action", description: "Auto-asks for referrals, tracks for repeat business.", defaultParams: {} },
        ],
      },
    ],
  },
];

export function getPhaseById(id) {
  return PHASES.find((p) => p.id === id);
}

export function getAllToolsForPhase(phaseId) {
  const phase = getPhaseById(phaseId);
  if (!phase) return [];
  return phase.categories.flatMap((c) => c.tools);
}