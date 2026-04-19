import {
  Users, Briefcase, Send, Star, Brain, Zap, Search, Mail, Clock,
  Filter, FileText, Building2, BarChart3, Target, Shield, Globe,
  Bot, DollarSign, TrendingUp, Share2, PhoneCall, Layers, Map
} from "lucide-react";

const WORKFLOW_TEMPLATES = [
  // ── 1. Full Lead Pipeline ──
  {
    name: "Full Lead Pipeline",
    description: "Scrape leads → AI score → Enrich contacts → Deep research top prospects → Auto outreach email. Universal end-to-end pipeline for any market.",
    icon: Users,
    color: "#d4af37",
    trigger: "Daily at 8 AM",
    steps: [
      { id: "t1_1", type: "bulk_pipeline", label: "Bulk Lead Pipeline", config: { locations: "Phoenix, AZ; Columbus, OH; Chicago, IL; Miami, FL", count_per_location: "10", industry: "flooring, epoxy, concrete" }, on_error: "continue" },
      { id: "t1_2", type: "lead_scorer", label: "Score All New Leads", config: { batch_all: "true", min_score: "40" }, on_error: "continue" },
      { id: "t1_3", type: "filter_leads", label: "Filter Hot Leads (Score > 65)", config: { field: "score", operator: "> 65", value: "" }, on_error: "continue" },
      { id: "t1_4", type: "contact_enricher", label: "Enrich Top Contacts", config: {}, on_error: "continue" },
      { id: "t1_5", type: "deep_research", label: "Research Top 5 Prospects", config: {}, on_error: "skip" },
      { id: "t1_6", type: "send_email", label: "Send Outreach Email", config: { auto_humanize: "true" }, on_error: "continue" },
    ],
  },

  // ── 2. Bid Discovery & Proposal ──
  {
    name: "Bid Discovery & Auto-Proposal",
    description: "Discover gov & commercial bids → Filter high-value → AI takeoff → Generate branded bid package → Email to GC. Automated bid machine.",
    icon: Briefcase,
    color: "#22c55e",
    trigger: "Daily at 6 AM",
    steps: [
      { id: "t2_1", type: "discover_jobs", label: "Discover Bid Opportunities", config: { states: "AZ, OH, IL, FL, TX", project_types: "warehouse, retail, healthcare, office, data_center", sector: "all" }, on_error: "continue" },
      { id: "t2_2", type: "filter_leads", label: "Filter Bids > $100K", config: { field: "project_value", operator: "> 100000", value: "" }, on_error: "continue" },
      { id: "t2_3", type: "ai_takeoff", label: "AI Takeoff Estimate", config: {}, on_error: "skip" },
      { id: "t2_4", type: "generate_bid", label: "Generate Bid Package", config: {}, on_error: "stop" },
      { id: "t2_5", type: "send_email", label: "Email Bid to GC", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t2_6", type: "hubspot_sync", label: "Sync to HubSpot", config: { action: "push" }, on_error: "continue" },
    ],
  },

  // ── 3. Contractor Multi-Touch Outreach ──
  {
    name: "Contractor Multi-Touch Sequence",
    description: "Scrape GCs → Send intro package → Wait → Follow-up email → Wait → SMS → Wait → AI phone call. Full automated multi-channel outreach cadence.",
    icon: Send,
    color: "#ec4899",
    trigger: "Weekly Monday",
    steps: [
      { id: "t3_1", type: "scrape_contractors", label: "Find New Contractors", config: { states: "AZ, OH, IL, FL, TX", contractor_type: "General Contractor", limit: "20" }, on_error: "continue" },
      { id: "t3_2", type: "validate_enrich", label: "Validate & Enrich Data", config: {}, on_error: "continue" },
      { id: "t3_3", type: "send_intro", label: "Send Intro Package", config: {}, on_error: "continue" },
      { id: "t3_4", type: "delay", label: "Wait 3 Days", config: { duration: "3", unit: "days" }, on_error: "continue" },
      { id: "t3_5", type: "send_email", label: "Follow-Up Email", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t3_6", type: "delay", label: "Wait 5 Days", config: { duration: "5", unit: "days" }, on_error: "continue" },
      { id: "t3_7", type: "send_sms", label: "SMS Follow-Up", config: { auto_generate: "true" }, on_error: "skip" },
      { id: "t3_8", type: "delay", label: "Wait 4 Days", config: { duration: "4", unit: "days" }, on_error: "continue" },
      { id: "t3_9", type: "ai_call", label: "AI Phone Call", config: { script: "Intro call — ask about upcoming flooring projects" }, on_error: "skip" },
    ],
  },

  // ── 4. Market Intelligence Report ──
  {
    name: "Weekly Market Intelligence",
    description: "Territory analysis → Scrape competitors → Industry pricing research → Manufacturer profiling → Store in knowledge base → Executive brief. Strategic intel on autopilot.",
    icon: Brain,
    color: "#8b5cf6",
    trigger: "Weekly Friday",
    steps: [
      { id: "t4_1", type: "territory_analyzer", label: "Analyze Territory", config: { city: "Phoenix", state: "AZ", radius_miles: "75" }, on_error: "continue" },
      { id: "t4_2", type: "competitor_scrape", label: "Scrape Top Competitors", config: {}, on_error: "continue" },
      { id: "t4_3", type: "web_research", label: "Industry Pricing Research", config: { query: "commercial flooring pricing trends 2026", deep_analysis: "true" }, on_error: "continue" },
      { id: "t4_4", type: "manufacturer_profiler", label: "Profile Key Manufacturers", config: { manufacturer_name: "auto" }, on_error: "continue" },
      { id: "t4_5", type: "knowledge_scraper", label: "Store in Knowledge Base", config: { category: "Market Analysis" }, on_error: "continue" },
      { id: "t4_6", type: "executive_brief", label: "Generate Weekly Brief", config: {}, on_error: "continue" },
      { id: "t4_7", type: "gmail", label: "Email Brief to Team", config: { action: "send", subject: "Weekly Market Intelligence Report" }, on_error: "continue" },
    ],
  },

  // ── 5. Social Content Engine ──
  {
    name: "Social Content Engine",
    description: "Generate content calendar → Create brand images → Write posts for Instagram, LinkedIn, Facebook, TikTok → SEO keyword optimization. Hands-free social media.",
    icon: Share2,
    color: "#0ea5e9",
    trigger: "Weekly Monday",
    steps: [
      { id: "t5_1", type: "social_media", label: "Generate Weekly Content Calendar", config: { action: "calendar", platform: "all", tone: "professional" }, on_error: "continue" },
      { id: "t5_2", type: "brand_asset", label: "Create Before/After Images", config: { asset_type: "social_post", style: "professional", prompt: "before and after epoxy floor coating transformation" }, on_error: "skip" },
      { id: "t5_3", type: "social_media", label: "Write Instagram Post", config: { action: "create", platform: "Instagram", tone: "engaging" }, on_error: "continue" },
      { id: "t5_4", type: "social_media", label: "Write LinkedIn Post", config: { action: "create", platform: "LinkedIn", tone: "professional" }, on_error: "continue" },
      { id: "t5_5", type: "social_media", label: "Write Facebook Post", config: { action: "create", platform: "Facebook", tone: "friendly" }, on_error: "continue" },
      { id: "t5_6", type: "video_script", label: "TikTok Video Script", config: { video_type: "short_form", platform: "TikTok", duration_seconds: "30", topic: "polished concrete transformation" }, on_error: "skip" },
      { id: "t5_7", type: "seo_analyze", label: "SEO Keyword Check", config: { keyword: "epoxy flooring contractor" }, on_error: "continue" },
    ],
  },

  // ── 6. Overnight Swarm Operation ──
  {
    name: "Overnight Swarm Operation",
    description: "Multi-agent swarm → Scrape 5 markets → Score all leads → Enrich contacts → Discover new bids → Sync HubSpot → Morning executive brief. Let AI work while you sleep.",
    icon: Layers,
    color: "#f59e0b",
    trigger: "Daily at 11 PM",
    steps: [
      { id: "t6_1", type: "swarm", label: "Launch Multi-Market Swarm", config: { command: "scrape_and_score", targets: "AZ, OH, IL, FL, TX", mode: "parallel" }, on_error: "continue" },
      { id: "t6_2", type: "lead_scraper", label: "Scrape Phoenix Market", config: { location: "Phoenix, AZ", industry: "flooring, concrete, epoxy", count: "15" }, on_error: "continue" },
      { id: "t6_3", type: "lead_scraper", label: "Scrape Dallas Market", config: { location: "Dallas, TX", industry: "flooring, concrete, epoxy", count: "15" }, on_error: "continue" },
      { id: "t6_4", type: "lead_scraper", label: "Scrape Chicago Market", config: { location: "Chicago, IL", industry: "flooring, concrete, epoxy", count: "15" }, on_error: "continue" },
      { id: "t6_5", type: "lead_scorer", label: "Score All New Leads", config: { batch_all: "true", min_score: "30" }, on_error: "continue" },
      { id: "t6_6", type: "contact_enricher", label: "Enrich Top Contacts", config: {}, on_error: "continue" },
      { id: "t6_7", type: "discover_jobs", label: "Discover New Bids", config: { states: "AZ, OH, IL, FL, TX", project_types: "all", sector: "all" }, on_error: "continue" },
      { id: "t6_8", type: "hubspot_sync", label: "Sync to HubSpot", config: { action: "push" }, on_error: "continue" },
      { id: "t6_9", type: "executive_brief", label: "Generate Morning Brief", config: {}, on_error: "continue" },
    ],
  },

  // ── 7. New State Expansion ──
  {
    name: "New State Market Expansion",
    description: "Territory analysis → Registry scrape → Contractor discovery → Lead scraping → Competitor intel → Knowledge base → Launch outreach. Enter a new market in 24 hours.",
    icon: Map,
    color: "#14b8a6",
    trigger: "Manual",
    steps: [
      { id: "t7_1", type: "territory_analyzer", label: "Analyze New Territory", config: { city: "Denver", state: "CO", radius_miles: "100" }, on_error: "continue" },
      { id: "t7_2", type: "registry_scraper", label: "Scrape State Business Registry", config: { states: "CO", batch_size: "50" }, on_error: "continue" },
      { id: "t7_3", type: "scrape_contractors", label: "Find Local Contractors", config: { states: "CO", contractor_type: "General Contractor", limit: "30" }, on_error: "continue" },
      { id: "t7_4", type: "lead_scraper", label: "Scrape Local Leads", config: { location: "Denver, CO", industry: "flooring, epoxy, concrete, coatings", count: "25" }, on_error: "continue" },
      { id: "t7_5", type: "competitor_scrape", label: "Map Competitors", config: {}, on_error: "continue" },
      { id: "t7_6", type: "web_research", label: "Local Market Pricing Intel", config: { query: "flooring contractor pricing Denver Colorado 2026", deep_analysis: "true" }, on_error: "continue" },
      { id: "t7_7", type: "knowledge_scraper", label: "Store All Intel", config: { category: "Market Analysis" }, on_error: "continue" },
      { id: "t7_8", type: "lead_scorer", label: "Score All Leads", config: { batch_all: "true", min_score: "40" }, on_error: "continue" },
      { id: "t7_9", type: "send_email", label: "Launch Intro Outreach", config: { auto_humanize: "true" }, on_error: "continue" },
    ],
  },

  // ── 8. Proposal-to-Payment Pipeline ──
  {
    name: "Proposal → Invoice → Follow-Up",
    description: "Generate AI proposal → Email to client → Wait for response → Generate invoice → Send invoice → Payment reminder sequence. Close deals end-to-end.",
    icon: DollarSign,
    color: "#ef4444",
    trigger: "Manual",
    steps: [
      { id: "t8_1", type: "deep_research", label: "Research Client", config: {}, on_error: "continue" },
      { id: "t8_2", type: "generate_proposal", label: "Generate AI Proposal", config: {}, on_error: "stop" },
      { id: "t8_3", type: "send_email", label: "Email Proposal to Client", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t8_4", type: "delay", label: "Wait 3 Days", config: { duration: "3", unit: "days" }, on_error: "continue" },
      { id: "t8_5", type: "send_email", label: "Proposal Follow-Up", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t8_6", type: "generate_invoice", label: "Generate Invoice", config: {}, on_error: "stop" },
      { id: "t8_7", type: "send_email", label: "Send Invoice", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t8_8", type: "delay", label: "Wait 7 Days", config: { duration: "7", unit: "days" }, on_error: "continue" },
      { id: "t8_9", type: "send_sms", label: "Payment Reminder SMS", config: { auto_generate: "true" }, on_error: "skip" },
    ],
  },

  // ── 9. SEO & Reputation Monitor ──
  {
    name: "SEO & Reputation Monitor",
    description: "SEO audit → Competitor keyword tracking → Web research on brand mentions → Browser agent for review sites → Knowledge base → Weekly report. Protect and grow your online presence.",
    icon: TrendingUp,
    color: "#06b6d4",
    trigger: "Weekly Wednesday",
    steps: [
      { id: "t9_1", type: "seo_analyze", label: "SEO Audit — Main Site", config: { url: "https://www.xtremepolishingsystems.com", keyword: "epoxy flooring" }, on_error: "continue" },
      { id: "t9_2", type: "seo_analyze", label: "SEO Audit — NCP Site", config: { url: "https://www.nationalconcretepolishing.com", keyword: "polished concrete" }, on_error: "continue" },
      { id: "t9_3", type: "competitor_scrape", label: "Competitor SEO Check", config: {}, on_error: "continue" },
      { id: "t9_4", type: "browser_agent", label: "Check Google Reviews", config: { task_type: "scrape", target_url: "https://google.com/maps", instructions: "Find and extract recent reviews for Xtreme Polishing Systems" }, on_error: "skip" },
      { id: "t9_5", type: "web_research", label: "Brand Mention Search", config: { query: "Xtreme Polishing Systems OR National Concrete Polishing reviews 2026", deep_analysis: "true" }, on_error: "continue" },
      { id: "t9_6", type: "knowledge_scraper", label: "Store in Knowledge Base", config: { category: "Market Analysis" }, on_error: "continue" },
      { id: "t9_7", type: "executive_brief", label: "Generate SEO Report", config: {}, on_error: "continue" },
    ],
  },

  // ── 10. Smart Lead Nurture ──
  {
    name: "Smart Lead Nurture Campaign",
    description: "Filter stale leads → Re-score → Deep research → AI-personalized email → Wait → SMS touch → Wait → AI phone call → Sync CRM. Re-engage cold leads with intelligence.",
    icon: Target,
    color: "#a855f7",
    trigger: "Weekly Tuesday",
    steps: [
      { id: "t10_1", type: "filter_leads", label: "Filter Stale Leads (30+ days)", config: { field: "last_contacted", operator: "> 30 days ago", value: "" }, on_error: "continue" },
      { id: "t10_2", type: "lead_scorer", label: "Re-Score Stale Leads", config: { batch_all: "true", min_score: "25" }, on_error: "continue" },
      { id: "t10_3", type: "filter_leads", label: "Filter Re-Scored > 40", config: { field: "score", operator: "> 40", value: "" }, on_error: "continue" },
      { id: "t10_4", type: "deep_research", label: "Fresh Intel on Each Lead", config: {}, on_error: "skip" },
      { id: "t10_5", type: "send_email", label: "Personalized Re-Engagement Email", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t10_6", type: "delay", label: "Wait 4 Days", config: { duration: "4", unit: "days" }, on_error: "continue" },
      { id: "t10_7", type: "send_sms", label: "SMS Touch", config: { auto_generate: "true" }, on_error: "skip" },
      { id: "t10_8", type: "delay", label: "Wait 5 Days", config: { duration: "5", unit: "days" }, on_error: "continue" },
      { id: "t10_9", type: "ai_call", label: "AI Warm Call", config: { script: "Friendly re-engagement — ask about current flooring needs" }, on_error: "skip" },
      { id: "t10_10", type: "hubspot_sync", label: "Sync Updated Status to CRM", config: { action: "push" }, on_error: "continue" },
    ],
  },
];

export default WORKFLOW_TEMPLATES;