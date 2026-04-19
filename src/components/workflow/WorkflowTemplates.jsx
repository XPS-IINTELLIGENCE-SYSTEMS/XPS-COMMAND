import { Users, Briefcase, Send, Star, Brain, Zap, Search, Mail, Clock, Filter, FileText, Building2, BarChart3 } from "lucide-react";

const WORKFLOW_TEMPLATES = [
  {
    name: "Full Lead Pipeline",
    description: "Scrape leads → Score → Enrich contacts → Deep research top prospects → Send outreach email. The universal end-to-end pipeline for any market.",
    icon: Users,
    color: "#d4af37",
    trigger: "Daily at 8 AM",
    steps: [
      { id: "t1_1", type: "bulk_pipeline", label: "Bulk Lead Pipeline", config: { locations: "Phoenix, AZ; Columbus, OH; Chicago, IL; Miami, FL", count_per_location: "10", industry: "flooring, epoxy, concrete" }, on_error: "continue" },
      { id: "t1_2", type: "lead_scorer", label: "Score All New Leads", config: { batch_all: "true", min_score: "40" }, on_error: "continue" },
      { id: "t1_3", type: "filter_leads", label: "Filter Hot Leads", config: { field: "score", operator: "> 65", value: "" }, on_error: "continue" },
      { id: "t1_4", type: "contact_enricher", label: "Enrich Top Contacts", config: {}, on_error: "continue" },
      { id: "t1_5", type: "deep_research", label: "Research Top 5", config: {}, on_error: "skip" },
      { id: "t1_6", type: "send_email", label: "Send Outreach Email", config: { auto_humanize: "true" }, on_error: "continue" },
    ],
  },
  {
    name: "Bid Discovery & Proposal",
    description: "Discover government & commercial bids → AI takeoff estimation → Generate branded bid package → Email bid to GC. Win more commercial jobs.",
    icon: Briefcase,
    color: "#22c55e",
    trigger: "Daily at 6 AM",
    steps: [
      { id: "t2_1", type: "discover_jobs", label: "Discover Bid Jobs", config: { states: "AZ, OH, IL, FL", project_types: "warehouse, retail, healthcare, office", sector: "all" }, on_error: "continue" },
      { id: "t2_2", type: "filter_leads", label: "Filter High-Value Bids", config: { field: "project_value", operator: "> 100000", value: "" }, on_error: "continue" },
      { id: "t2_3", type: "ai_takeoff", label: "AI Takeoff Estimate", config: {}, on_error: "skip" },
      { id: "t2_4", type: "generate_bid", label: "Generate Bid Package", config: {}, on_error: "stop" },
      { id: "t2_5", type: "send_email", label: "Email Bid to Contact", config: { auto_humanize: "true" }, on_error: "continue" },
    ],
  },
  {
    name: "Contractor Outreach Sequence",
    description: "Scrape new contractors → Send intro package → Wait 3 days → Follow-up email → Wait 5 days → SMS follow-up. Automated multi-touch outreach.",
    icon: Send,
    color: "#ec4899",
    trigger: "Weekly Monday",
    steps: [
      { id: "t3_1", type: "scrape_contractors", label: "Find New Contractors", config: { states: "AZ, OH, IL, FL", contractor_type: "General Contractor", limit: "20" }, on_error: "continue" },
      { id: "t3_2", type: "send_intro", label: "Send Intro Package", config: {}, on_error: "continue" },
      { id: "t3_3", type: "delay", label: "Wait 3 Days", config: { duration: "3", unit: "days" }, on_error: "continue" },
      { id: "t3_4", type: "send_email", label: "Follow-Up Email", config: { auto_humanize: "true" }, on_error: "continue" },
      { id: "t3_5", type: "delay", label: "Wait 5 Days", config: { duration: "5", unit: "days" }, on_error: "continue" },
      { id: "t3_6", type: "send_sms", label: "SMS Follow-Up", config: { auto_generate: "true" }, on_error: "skip" },
    ],
  },
  {
    name: "Market Intelligence Report",
    description: "Research territory → Scrape competitors → Analyze pricing → Generate executive brief. Weekly competitive intelligence for strategic planning.",
    icon: Brain,
    color: "#8b5cf6",
    trigger: "Weekly Friday",
    steps: [
      { id: "t4_1", type: "territory_analyzer", label: "Analyze Territory", config: { city: "Phoenix", state: "AZ", radius_miles: "50" }, on_error: "continue" },
      { id: "t4_2", type: "competitor_scrape", label: "Scrape Competitors", config: {}, on_error: "continue" },
      { id: "t4_3", type: "web_research", label: "Industry Pricing Research", config: { query: "commercial flooring pricing trends 2026", deep_analysis: "true" }, on_error: "continue" },
      { id: "t4_4", type: "knowledge_scraper", label: "Store in Knowledge Base", config: { category: "Market Analysis" }, on_error: "continue" },
      { id: "t4_5", type: "executive_brief", label: "Generate Executive Brief", config: {}, on_error: "continue" },
    ],
  },
  {
    name: "Social Content Engine",
    description: "Generate weekly content calendar → Create brand images → Write platform-specific posts → Schedule across channels. Hands-free social media.",
    icon: BarChart3,
    color: "#0ea5e9",
    trigger: "Weekly Monday",
    steps: [
      { id: "t5_1", type: "social_media", label: "Generate Content Calendar", config: { action: "calendar", platform: "all", tone: "professional" }, on_error: "continue" },
      { id: "t5_2", type: "brand_asset", label: "Create Before/After Images", config: { asset_type: "social_post", style: "professional", prompt: "before and after epoxy floor coating transformation" }, on_error: "skip" },
      { id: "t5_3", type: "social_media", label: "Write Instagram Post", config: { action: "create", platform: "Instagram", tone: "engaging" }, on_error: "continue" },
      { id: "t5_4", type: "social_media", label: "Write LinkedIn Post", config: { action: "create", platform: "LinkedIn", tone: "professional" }, on_error: "continue" },
      { id: "t5_5", type: "social_media", label: "Write Facebook Post", config: { action: "create", platform: "Facebook", tone: "friendly" }, on_error: "continue" },
    ],
  },
];

export default WORKFLOW_TEMPLATES;