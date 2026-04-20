// Master catalog of all system capabilities organized by category

export const SYSTEM_CATALOG = [
  {
    category: "Lead Generation & Pipeline",
    items: [
      { id: "xpress_leads", name: "XPress Leads", type: "Tool", color: "#d4af37", description: "AI lead intelligence and pipeline management for flooring contractors", maxCapabilities: "500+ leads, auto-scoring, enrichment, validation", examples: ["Score leads 0-100", "Auto-validate contacts", "Enrich with web data", "Pipeline stage tracking"] },
      { id: "find_companies", name: "Find Companies", type: "Tool", color: "#f59e0b", description: "AI-powered company discovery scraper using web intelligence", maxCapabilities: "Unlimited web scraping, multi-source aggregation", examples: ["Search by industry", "Search by location", "Extract contact info", "Bulk discovery"] },
      { id: "find_jobs", name: "Find Jobs", type: "Tool", color: "#22c55e", description: "Commercial project discovery from permit databases and bid platforms", maxCapabilities: "SAM.gov, Dodge, PlanHub, ConstructConnect integration", examples: ["Search SAM.gov", "Find permits", "Track bid deadlines", "Auto-route to pipeline"] },
      { id: "lead_sniper", name: "Lead Sniper", type: "Tool", color: "#d4af37", description: "Full automated GC discovery → outreach → bid pipeline system", maxCapabilities: "End-to-end GC acquisition automation", examples: ["Auto-discover GCs", "Send RFQs", "Track bid pipeline", "Auto follow-up"] },
      { id: "data_bank", name: "Data Bank", type: "Tool", color: "#06b6d4", description: "Centralized lead repository with import/export/share capabilities", maxCapabilities: "Unlimited records, CSV/JSON import, bulk operations", examples: ["Import CSV leads", "Export filtered data", "Bulk update", "Share lists"] },
      { id: "crm", name: "CRM", type: "Tool", color: "#6366f1", description: "Contact and deal management system", maxCapabilities: "Full CRM with pipeline stages, deal tracking", examples: ["Track contacts", "Manage deals", "Pipeline kanban", "Activity logging"] },
      { id: "sentiment_analyst", name: "Sentiment Analyst", type: "Tool", color: "#8b5cf6", description: "AI intent scoring based on email/communication analysis", maxCapabilities: "LLM-powered sentiment analysis, auto-priority adjustment", examples: ["Score 0-100 intent", "Label Cold→On Fire", "Analyze email history", "Adjust follow-up cadence"] },
      { id: "lead_nurture", name: "Lead Nurture Engine", type: "Backend", color: "#ec4899", description: "Automated follow-up cadence based on sentiment analysis", maxCapabilities: "Auto-switch templates, dynamic cadence, WhatsApp+Email", examples: ["High-intent auto-escalation", "Cool-down stale leads", "Dynamic template switching"] },
    ]
  },
  {
    category: "Bidding & Proposals",
    items: [
      { id: "bid_center", name: "Bid Center", type: "Tool", color: "#ef4444", description: "Government and commercial bidding command center", maxCapabilities: "Full bid lifecycle management", examples: ["Track bid deadlines", "Manage submissions", "Win/loss analysis"] },
      { id: "gc_bid_pipeline", name: "GC Bid Pipeline", type: "Tool", color: "#d4af37", description: "National GC database with bid list campaigns and scope tracking", maxCapabilities: "50-state GC database, automated outreach campaigns", examples: ["Build bid lists by state", "Track scope requests", "Auto-campaign GCs"] },
      { id: "blueprint_takeoff", name: "Blueprint Takeoff", type: "Tool", color: "#06b6d4", description: "Upload PDF plans — AI extracts rooms, zones, and measurements", maxCapabilities: "PDF parsing, zone extraction, material calculation", examples: ["Upload blueprints", "Extract zones", "Calculate materials", "Auto-price zones"] },
      { id: "dynamic_pricing", name: "Dynamic Pricing", type: "Tool", color: "#22c55e", description: "AI bid pricing based on market data and cost analysis", maxCapabilities: "Regional rate analysis, 3-tier pricing, competitor benchmarking", examples: ["Generate 3-tier pricing", "Regional cost adjustment", "Market comparison"] },
      { id: "auto_proposal", name: "AI Bid Writer", type: "Tool", color: "#8b5cf6", description: "Auto-generate professional bid proposals from job data", maxCapabilities: "Full proposal generation with scope, pricing, timeline", examples: ["Generate proposals", "3-tier pricing", "Zone breakdowns", "Save as bid document"] },
      { id: "proposal_generator", name: "Proposal Generator", type: "Tool", color: "#14b8a6", description: "PDF proposal generation from job data", maxCapabilities: "Formatted PDF output, cover letter, scope, terms", examples: ["Generate PDF", "Email to GC", "Track submissions"] },
      { id: "compliance_checker", name: "Compliance Checker", type: "Backend", color: "#f59e0b", description: "Cross-reference bid requirements with proposal content", maxCapabilities: "PDF requirement extraction, gap analysis, mandatory form detection", examples: ["Flag missing sections", "Check pricing compliance", "Verify mandatory forms"] },
    ]
  },
  {
    category: "Outreach & Communication",
    items: [
      { id: "get_work", name: "Outreach", type: "Tool", color: "#ec4899", description: "Email and SMS campaign management", maxCapabilities: "Multi-channel campaigns, template engine, bulk send", examples: ["Email campaigns", "SMS via Twilio", "Template variables", "Bulk outreach"] },
      { id: "outreach_automation", name: "Follow-Up Bot", type: "Tool", color: "#ec4899", description: "Automated follow-ups for stale bids and leads", maxCapabilities: "4-stage drip campaigns, auto-scheduling", examples: ["Day 3/7/14/30 follow-ups", "Auto-send emails", "Track opens/replies"] },
      { id: "status_reports", name: "Status Reports", type: "Tool", color: "#0ea5e9", description: "Auto-generate and email project status reports", maxCapabilities: "AI-written reports, auto-email to stakeholders", examples: ["Generate weekly reports", "Email to GC", "Track project milestones"] },
      { id: "client_portal", name: "Client Portal", type: "Tool", color: "#14b8a6", description: "Client-facing portal with photos, approvals, and e-signatures", maxCapabilities: "Photo sharing, change order approval, digital signatures", examples: ["Share site photos", "Get approvals", "E-sign documents"] },
    ]
  },
  {
    category: "Intelligence & Research",
    items: [
      { id: "research", name: "Research Lab", type: "Tool", color: "#8b5cf6", description: "Deep web research with AI-powered analysis", maxCapabilities: "Internet-connected LLM queries, structured output", examples: ["Company research", "Market analysis", "Competitor intel", "Industry trends"] },
      { id: "knowledge", name: "Knowledge Base", type: "Tool", color: "#06b6d4", description: "Company and industry intelligence repository", maxCapabilities: "Unlimited knowledge entries, AI search", examples: ["Search knowledge", "Browse by topic", "AI summaries"] },
      { id: "knowledge_upload", name: "Upload Knowledge", type: "Tool", color: "#10b981", description: "Feed documents and URLs into the intelligence system", maxCapabilities: "PDF, URL, text ingestion with AI extraction", examples: ["Upload PDFs", "Scrape URLs", "Extract structured data"] },
      { id: "competition", name: "Competition Monitor", type: "Tool", color: "#ef4444", description: "Competitor website monitoring and change detection", maxCapabilities: "Automated scanning, pricing extraction, change alerts", examples: ["Monitor competitor sites", "Track pricing changes", "Analyze market position"] },
      { id: "competitor_comparison", name: "Compare vs.", type: "Tool", color: "#f43f5e", description: "Head-to-head competitor analysis", maxCapabilities: "Side-by-side comparison, pricing analysis", examples: ["Compare products", "Compare pricing", "SWOT analysis"] },
      { id: "master_database", name: "Master Database", type: "Tool", color: "#6366f1", description: "20-industry indexed universal intelligence database", maxCapabilities: "Cross-industry data indexing, searchable records", examples: ["Search by industry", "Cross-reference data", "Export intel"] },
      { id: "company_assets", name: "Company Assets", type: "Tool", color: "#d4af37", description: "XPS, NCP, XPress, CPU branded intel hubs", maxCapabilities: "Per-brand intelligence organization", examples: ["View XPS intel", "NCP data", "XPress assets"] },
    ]
  },
  {
    category: "Scraping & Data Ingestion",
    items: [
      { id: "master_scraper", name: "Master Scraper", type: "Tool", color: "#ef4444", description: "Unified scraping control center — manual and automated", maxCapabilities: "Multi-source web scraping, browserless integration", examples: ["Manual scrape", "Scheduled scrape", "Custom targets"] },
      { id: "scrape_social", name: "Social Scrape", type: "Tool", color: "#ec4899", description: "Social media intelligence gathering", maxCapabilities: "Platform-specific scraping, trend analysis", examples: ["LinkedIn data", "Social mentions", "Engagement analysis"] },
      { id: "scrape_trends", name: "Trends Scrape", type: "Tool", color: "#8b5cf6", description: "Market trends, consensus data, economic indicators", maxCapabilities: "Macro trend analysis, industry benchmarking", examples: ["Market trends", "Industry reports", "Economic data"] },
      { id: "seeds_sources", name: "Seeds & Sources", type: "Tool", color: "#84cc16", description: "Lead source management and seed list configuration", maxCapabilities: "Source priority management, ICP targeting", examples: ["Define ICPs", "Manage sources", "Priority scoring"] },
      { id: "github_explorer", name: "GitHub Explorer", type: "Tool", color: "#64748b", description: "Search, discover, and ingest open source repos", maxCapabilities: "GitHub API integration, repo analysis", examples: ["Search repos", "Analyze code", "Track trends"] },
      { id: "scheduler", name: "Scheduler", type: "Tool", color: "#0ea5e9", description: "Schedule automated scraping jobs", maxCapabilities: "Cron scheduling, recurring jobs, batch processing", examples: ["Daily scrapes", "Weekly batches", "Custom schedules"] },
    ]
  },
  {
    category: "AI Agents & Automation",
    items: [
      { id: "agent_command", name: "Agent Command Center", type: "Tool", color: "#d4af37", description: "Autonomous multi-agent execution engine", maxCapabilities: "Goal-driven agents, parallel execution, handoffs", examples: ["Submit goals", "Monitor agents", "View job results"] },
      { id: "agent_fleet", name: "Agent Fleet", type: "Tool", color: "#06b6d4", description: "Agent library and management", maxCapabilities: "50+ agent types, custom creation", examples: ["Browse agents", "Deploy agents", "Monitor performance"] },
      { id: "agent_builder", name: "Agent Builder", type: "Tool", color: "#f43f5e", description: "Build custom AI agents with natural language", maxCapabilities: "Custom instructions, tool access, entity permissions", examples: ["Create agent", "Set permissions", "Define tools"] },
      { id: "agent_skills", name: "Skills Library", type: "Tool", color: "#8b5cf6", description: "All agent capabilities and skill definitions", maxCapabilities: "50+ pre-built skills", examples: ["Browse skills", "Assign to agents", "Create custom skills"] },
      { id: "skills_creator", name: "Skills Creator", type: "Tool", color: "#ec4899", description: "Build and manage agent skills", maxCapabilities: "Custom skill definitions, prompt engineering", examples: ["Define new skill", "Test skill", "Deploy to agents"] },
      { id: "workflows", name: "Workflows", type: "Tool", color: "#f43f5e", description: "Drag and drop automation builder", maxCapabilities: "Visual workflow builder, conditional logic, triggers", examples: ["Create workflow", "Set triggers", "Add conditions", "Chain actions"] },
      { id: "approval_queue", name: "Approval Queue", type: "Tool", color: "#f59e0b", description: "Review and approve AI agent actions before execution", maxCapabilities: "Human-in-the-loop, batch approve/reject", examples: ["Review actions", "Approve/reject", "Set auto-approve rules"] },
    ]
  },
  {
    category: "Field Operations",
    items: [
      { id: "field_tech", name: "Field Tech", type: "Tool", color: "#f97316", description: "Work orders, site photos, and punch lists", maxCapabilities: "GPS check-in, material logging, stage tracking", examples: ["Create work orders", "Upload site photos", "Track stages", "Log materials"] },
      { id: "job_site_map", name: "Job Site Map", type: "Tool", color: "#0ea5e9", description: "Live map with routing and time tracking", maxCapabilities: "GPS tracking, route optimization, time entries", examples: ["View job locations", "Route planning", "Time tracking"] },
    ]
  },
  {
    category: "Content & Media",
    items: [
      { id: "media_hub", name: "Media Hub", type: "Tool", color: "#ec4899", description: "Video, images, branding, social content, AI voice", maxCapabilities: "AI image generation, video scripts, voiceover, social factory", examples: ["Generate images", "Create videos", "Design branding", "Social posts"] },
      { id: "templates_library", name: "Templates Library", type: "Tool", color: "#14b8a6", description: "200+ templates for UI, agents, prompts, and business", maxCapabilities: "Categorized template system", examples: ["Browse templates", "Apply to projects", "Create custom"] },
    ]
  },
  {
    category: "System & Admin",
    items: [
      { id: "admin", name: "Admin Control", type: "Tool", color: "#a855f7", description: "User management, API keys, promo codes", maxCapabilities: "Full admin panel, role management", examples: ["Manage users", "API tokens", "Access codes"] },
      { id: "system_health", name: "System Health", type: "Tool", color: "#22c55e", description: "Auto-diagnose, heal, and optimize system", maxCapabilities: "Self-healing, performance monitoring", examples: ["Run diagnostics", "Auto-fix issues", "Performance report"] },
      { id: "auto_enhance", name: "Auto-Enhance", type: "Tool", color: "#d4af37", description: "AI tool analysis, self-reflection, and upgrade engine", maxCapabilities: "50+ tool analysis, capability gap detection", examples: ["Analyze tools", "Generate improvements", "System audit"] },
      { id: "connectors", name: "Connectors", type: "Tool", color: "#84cc16", description: "Integrations and API management", maxCapabilities: "30+ connector types, OAuth, API keys", examples: ["Connect Gmail", "Connect Drive", "Setup webhooks"] },
      { id: "tool_creator", name: "Tool Creator", type: "Tool", color: "#f43f5e", description: "Build custom tools with AI", maxCapabilities: "Unlimited custom tool creation", examples: ["Define tool", "Set AI prompt", "Deploy to dashboard"] },
      { id: "page_builder", name: "Page Builder", type: "Tool", color: "#6366f1", description: "Create custom pages with drag & drop widgets", maxCapabilities: "16 widget types, 6 templates", examples: ["Create dashboard", "Add charts", "Embed tools"] },
      { id: "settings", name: "Settings", type: "Tool", color: "#64748b", description: "Account and preference management", maxCapabilities: "Theme, notifications, profile", examples: ["Update profile", "Change theme", "Manage notifications"] },
      { id: "analytics", name: "Analytics", type: "Tool", color: "#f97316", description: "Performance and pipeline analytics", maxCapabilities: "Charts, KPIs, trend analysis", examples: ["Pipeline metrics", "Revenue tracking", "Conversion rates"] },
      { id: "algorithm", name: "Algorithm Tuning", type: "Tool", color: "#f59e0b", description: "Fine-tune AI scoring and model parameters", maxCapabilities: "Lead scoring weights, model selection", examples: ["Adjust scoring", "Set thresholds", "Choose AI models"] },
      { id: "system_instructions", name: "System Instructions", type: "Tool", color: "#d4af37", description: "Admin command center for agent rules, directives, and system prompts", maxCapabilities: "Natural language system programming, real-time agent configuration", examples: ["Set agent rules", "Create directives", "Define standing orders", "Program system behavior"] },
    ]
  },
];

export const MISSING_CAPABILITIES = [
  { name: "Real-time Collaboration", description: "Multi-user simultaneous editing with presence indicators and live cursors", category: "Collaboration", priority: "High" },
  { name: "Advanced OCR for Handwritten Notes", description: "Extract text from handwritten field notes and sketches", category: "Field Ops", priority: "Medium" },
  { name: "3D Floor Plan Visualization", description: "Convert 2D blueprints to interactive 3D walkthroughs", category: "Takeoff", priority: "Medium" },
  { name: "Payment Processing", description: "Invoice payment collection via Stripe/ACH", category: "Finance", priority: "High" },
  { name: "Time Series Forecasting", description: "ML-based revenue and pipeline forecasting with confidence intervals", category: "Analytics", priority: "High" },
  { name: "Document E-Signing (DocuSign/HelloSign)", description: "Full legally-binding e-signature workflow", category: "Legal", priority: "High" },
  { name: "Automatic Bid Bond Generation", description: "Auto-generate bid bonds for government projects", category: "Bidding", priority: "Medium" },
  { name: "Multi-Language Support", description: "Interface and content in Spanish, French, etc.", category: "UX", priority: "Low" },
  { name: "Offline Mode / PWA", description: "Full functionality without internet for field techs", category: "Mobile", priority: "High" },
  { name: "Video Conferencing Integration", description: "Built-in video calls for client walkthroughs", category: "Communication", priority: "Medium" },
  { name: "Automated Lien Waiver Generation", description: "Generate lien waivers tied to payment milestones", category: "Legal", priority: "Medium" },
  { name: "Supply Chain Tracking", description: "Real-time material shipment tracking and ETA alerts", category: "Operations", priority: "Medium" },
  { name: "OSHA Compliance Checker", description: "Safety compliance verification for job sites", category: "Safety", priority: "High" },
  { name: "Drone Integration", description: "Aerial site surveys and progress documentation", category: "Field Ops", priority: "Low" },
  { name: "AR Floor Visualization", description: "Augmented reality floor coating preview for clients", category: "Sales", priority: "Low" },
];