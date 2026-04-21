// Tool categories for dashboard organization
// Each category groups related tools and displays with vertical spacing

export const TOOL_CATEGORIES = [
  {
    id: "lead_engine",
    label: "Lead Engine",
    desc: "Discover, scrape & manage leads",
    toolIds: ["xpress_leads", "job_leads", "find_companies", "find_jobs", "lead_sniper", "data_bank", "crm", "seeds_sources"],
  },
  {
    id: "pipeline_bids",
    label: "Pipeline & Bidding",
    desc: "Track deals, bids & proposals from start to close",
    toolIds: ["master_pipeline", "gc_bid_pipeline", "bid_center", "blueprint_takeoff", "dynamic_pricing", "proposal_generator", "auto_proposal", "compliance_checker"],
  },
  {
    id: "outreach_comms",
    label: "Outreach & Communications",
    desc: "Email, SMS, follow-ups & campaigns",
    toolIds: ["get_work", "win_work", "outreach_automation", "sentiment_analyst", "status_reports"],
  },
  {
    id: "operations",
    label: "Operations & Field",
    desc: "Job sites, time tracking & client management",
    toolIds: ["master_database", "field_tech", "job_site_map", "client_portal"],
  },
  {
    id: "intelligence",
    label: "Intelligence & Research",
    desc: "Market intel, competitor monitoring & knowledge",
    toolIds: ["xps_intel_core", "research", "knowledge", "knowledge_upload", "competition", "competitor_comparison", "company_assets", "scrape_social", "scrape_trends"],
  },
  {
    id: "ai_agents",
    label: "AI Agents & Automation",
    desc: "Build, manage & deploy AI-powered agents",
    toolIds: ["ai_assistant", "agent_command", "agent_fleet", "agent_builder", "agent_skills", "skills_creator", "agent_knowledge", "workflows", "scheduler"],
  },
  {
    id: "media_content",
    label: "Media & Content",
    desc: "Branding, video, images & social content",
    toolIds: ["media_hub", "templates_library"],
  },
  {
    id: "system_admin",
    label: "System & Admin",
    desc: "Configuration, health & platform controls",
    toolIds: ["admin", "connectors", "settings", "algorithm", "tool_creator", "system_health", "system_index", "system_instructions", "auto_enhance", "page_builder", "analytics", "approval_queue", "master_scraper", "github_explorer"],
  },
];

// Top 10 quick-access dashboard headers — the most-used, highest-impact actions
export const QUICK_ACCESS_HEADERS = [
  { id: "master_pipeline", label: "Pipeline" },
  { id: "xpress_leads", label: "Leads" },
  { id: "gc_bid_pipeline", label: "Bids" },
  { id: "master_database", label: "Ops DB" },
  { id: "crm", label: "CRM" },
  { id: "xps_intel_core", label: "Intel" },
  { id: "agent_command", label: "Agents" },
  { id: "get_work", label: "Outreach" },
  { id: "bid_center", label: "Bid Center" },
  { id: "analytics", label: "Analytics" },
];