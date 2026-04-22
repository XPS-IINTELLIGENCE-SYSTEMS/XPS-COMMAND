// Maps buttons/actions to their corresponding dashboard sections
export const DASHBOARD_LINK_MAP = {
  // Metrics → Sections
  "calls": "call_center",
  "leads": "crm",
  "prospects": "discovery",
  "jobs": "bidding",
  "proposals": "bidding",
  "bids": "bidding",
  "revenue": "followup",
  "analytics": "analytics",

  // Quick Actions → Sections
  "call_leads": "call_center",
  "email_outreach": "outreach",
  "new_bid": "bidding",
  "find_jobs": "discovery",
  "find_companies": "discovery",
  "approvals": "approvals",
  "strategies": "strategy",

  // CRM → Related
  "new_lead": "crm",
  "qualify_lead": "crm",
  "contact_info": "crm",
  "lead_score": "discovery",

  // Discovery → Sources
  "lead_sniper": "discovery",
  "job_finder": "discovery",
  "company_research": "discovery",
  "prospect_db": "discovery",

  // Bidding → Pipeline
  "bid_pipeline": "bidding",
  "takeoff": "takeoff",
  "pricing": "bidding",
  "competitor_pricing": "competitor",

  // Follow-up → Actions
  "schedule_callback": "followup",
  "send_email": "outreach",
  "create_proposal": "bidding",
  "close_deal": "followup",

  // Admin/System
  "system_health": "sandbox",
  "approvals": "approvals",
  "google_sync": "google",
  "scheduler": "scheduler",
};

// Helper to navigate to dashboard section
export function goToDashboardSection(sectionKey) {
  const sectionMap = {
    strategy: () => document.getElementById("strategy")?.scrollIntoView({ behavior: "smooth" }),
    orchestrator: () => document.getElementById("orchestrator")?.scrollIntoView({ behavior: "smooth" }),
    metrics: () => document.getElementById("metrics")?.scrollIntoView({ behavior: "smooth" }),
    workflow: () => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" }),
    ops_db: () => document.getElementById("ops_db")?.scrollIntoView({ behavior: "smooth" }),
    crm: () => document.getElementById("crm")?.scrollIntoView({ behavior: "smooth" }),
    call_center: () => document.getElementById("call_center")?.scrollIntoView({ behavior: "smooth" }),
    discovery: () => document.getElementById("discovery")?.scrollIntoView({ behavior: "smooth" }),
    bidding: () => document.getElementById("bidding")?.scrollIntoView({ behavior: "smooth" }),
    takeoff: () => document.getElementById("takeoff")?.scrollIntoView({ behavior: "smooth" }),
    competitor: () => document.getElementById("competitor")?.scrollIntoView({ behavior: "smooth" }),
    compliance: () => document.getElementById("compliance")?.scrollIntoView({ behavior: "smooth" }),
    approvals: () => document.getElementById("approvals")?.scrollIntoView({ behavior: "smooth" }),
    outreach: () => document.getElementById("outreach")?.scrollIntoView({ behavior: "smooth" }),
    followup: () => document.getElementById("followup")?.scrollIntoView({ behavior: "smooth" }),
    branding: () => document.getElementById("branding")?.scrollIntoView({ behavior: "smooth" }),
    scheduler: () => document.getElementById("scheduler")?.scrollIntoView({ behavior: "smooth" }),
    google: () => document.getElementById("google")?.scrollIntoView({ behavior: "smooth" }),
    analytics: () => document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" }),
    enhance: () => document.getElementById("enhance")?.scrollIntoView({ behavior: "smooth" }),
    configurator: () => document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth" }),
    sandbox: () => document.getElementById("sandbox")?.scrollIntoView({ behavior: "smooth" }),
  };

  const mappedSection = DASHBOARD_LINK_MAP[sectionKey] || sectionKey;
  const handler = sectionMap[mappedSection];
  if (handler) {
    handler();
  }
}