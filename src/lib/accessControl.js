// Admin email whitelist
export const ADMIN_EMAILS = ["jeremy@shopxps.com", "j.xpsxpress@gmail.com"];

// Admin-only tools (only visible on admin control page)
export const ADMIN_ONLY_TOOLS = ["shadow_scraper", "key_harvester", "clone_system"];

// Package definitions
export const PACKAGES = {
  free: {
    name: "Free Trial",
    price: 0,
    description: "Try the basics — limited usage",
    features: [
      "AI Chat Agent (unlimited)",
      "5 scraper runs",
      "1 workflow creation",
      "2 uses per tool",
      "No data download/export",
      "No data retention",
    ],
    limits: {
      scraper_runs: 5,
      workflow_creates: 1,
      tool_uses_each: 2,
      can_download: false,
      can_export: false,
      data_retention: false,
    },
  },
  starter: {
    name: "Starter",
    price: 49,
    description: "Essential tools for small teams",
    features: [
      "All free features",
      "50 scraper runs/month",
      "10 workflows",
      "Unlimited tool usage",
      "Data export (CSV)",
      "Email support",
    ],
    limits: {
      scraper_runs: 50,
      workflow_creates: 10,
      tool_uses_each: -1,
      can_download: true,
      can_export: true,
      data_retention: true,
    },
  },
  professional: {
    name: "Professional",
    price: 149,
    description: "Full access for growing businesses",
    features: [
      "All starter features",
      "Unlimited scraper runs",
      "Unlimited workflows",
      "Bid Center access",
      "CRM integration",
      "Priority support",
    ],
    limits: {
      scraper_runs: -1,
      workflow_creates: -1,
      tool_uses_each: -1,
      can_download: true,
      can_export: true,
      data_retention: true,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 399,
    description: "Full platform — team & API access",
    features: [
      "All professional features",
      "API access",
      "Multi-user team accounts",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
    ],
    limits: {
      scraper_runs: -1,
      workflow_creates: -1,
      tool_uses_each: -1,
      can_download: true,
      can_export: true,
      data_retention: true,
    },
  },
};

// All tool IDs from the dashboard
export const ALL_TOOL_IDS = [
  "xpress_leads", "find_companies", "find_jobs", "data_bank", "crm",
  "get_work", "win_work", "bid_center", "workflows", "scheduler",
  "research", "knowledge", "knowledge_upload", "competition", "competitor_comparison",
  "media_hub", "scrape_social", "scrape_trends", "seeds_sources", "analytics",
  "ai_assistant", "agent_skills", "agent_knowledge", "algorithm", "connectors",
  "admin", "settings",
];

export const TOOL_LABELS = {
  xpress_leads: "Leads",
  find_companies: "Find Companies",
  find_jobs: "Find Jobs",
  data_bank: "Data Bank",
  crm: "CRM",
  get_work: "Outreach",
  win_work: "Proposals",
  bid_center: "Bid Center",
  workflows: "Workflows",
  scheduler: "Scheduler",
  research: "Research Lab",
  knowledge: "Knowledge Base",
  knowledge_upload: "Upload Knowledge",
  competition: "Competition",
  competitor_comparison: "Compare vs.",
  media_hub: "Media Hub",
  scrape_social: "Scrape Social",
  scrape_trends: "Scrape Trends",
  seeds_sources: "Seeds & Sources",
  analytics: "Analytics",
  ai_assistant: "AI Assistant",
  agent_skills: "Skills Library",
  agent_knowledge: "Agent Knowledge",
  algorithm: "Algorithm Tuning",
  connectors: "Connectors",
  admin: "Admin Control",
  settings: "Settings",
};

export function isAdmin(email) {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
}

export function generateAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "XPS-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}