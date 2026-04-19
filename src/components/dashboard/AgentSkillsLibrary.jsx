import { useState } from "react";
import {
  Search, Users, Mail, Phone, FileText, Brain, Globe, Swords, DollarSign,
  BarChart3, Send, Database, Wrench, Shield, Bot, Radar, Code2, GitBranch,
  Image, Calendar, Megaphone, Star, Target, TrendingUp, Clock, Zap
} from "lucide-react";

const SKILL_CATEGORIES = [
  { id: "all", label: "All Skills" },
  { id: "lead_gen", label: "Lead Generation" },
  { id: "outreach", label: "Outreach & Comms" },
  { id: "research", label: "Research & Intel" },
  { id: "content", label: "Content & Creative" },
  { id: "automation", label: "Automation" },
  { id: "analytics", label: "Analytics" },
  { id: "integrations", label: "Integrations" },
  { id: "admin", label: "Admin & System" },
];

const SKILLS = [
  // Lead Generation
  { id: "lead_search", name: "AI Lead Finder", desc: "Search for leads by location, industry, keywords. Uses web AI to find real businesses.", category: "lead_gen", icon: Search, command: "Find me 25 flooring contractors in Tampa, FL", agent: "xps_assistant", function: "leadScraper" },
  { id: "bulk_pipeline", name: "Bulk Pipeline Builder", desc: "Run full pipeline: scrape → score → enrich → research across multiple locations.", category: "lead_gen", icon: Users, command: "Build pipeline for Phoenix, Dallas, and Atlanta — 50 leads each", agent: "lead_gen", function: "bulkLeadPipeline" },
  { id: "contact_enrich", name: "Contact Enrichment", desc: "Find decision-maker emails, phones, LinkedIn profiles for any lead.", category: "lead_gen", icon: Users, command: "Enrich my top 10 leads with contact info", agent: "xps_assistant", function: "contactEnricher" },
  { id: "lead_score", name: "AI Lead Scoring", desc: "Multi-factor AI scoring: location, revenue, industry fit, recency, engagement.", category: "lead_gen", icon: TrendingUp, command: "Score all my new leads", agent: "xps_assistant", function: "leadScorer" },
  { id: "territory", name: "Territory Analyzer", desc: "Analyze market opportunity in any ZIP code radius. Competitor density, demand signals.", category: "lead_gen", icon: Target, command: "Analyze the Tampa Bay territory for epoxy opportunities", agent: "lead_gen", function: "territoryAnalyzer" },
  { id: "xpress_scraper", name: "XPress Pipeline Scraper", desc: "Find material/equipment/training sales leads in Arizona.", category: "lead_gen", icon: Radar, command: "Run XPress scraper for 30 leads", agent: "scraper", function: "xpressLeadScraper" },
  { id: "jobs_scraper", name: "Jobs Pipeline Scraper", desc: "Find end-buyer commercial flooring job leads.", category: "lead_gen", icon: Radar, command: "Run Jobs scraper for 20 leads", agent: "scraper", function: "jobsLeadScraper" },
  { id: "registry_scan", name: "Business Registry Scanner", desc: "Scan state business registries for newly registered flooring companies.", category: "lead_gen", icon: Database, command: "Scan FL and TX registries for new flooring companies", agent: "scraper", function: "registryScraper" },

  // Outreach & Comms
  { id: "ai_email", name: "AI Email Writer", desc: "Generate and send AI-humanized outreach emails. Initial, follow-up, proposal.", category: "outreach", icon: Mail, command: "Draft an initial outreach email for my top lead", agent: "sales_director", function: "sendOutreachEmail" },
  { id: "bulk_email", name: "Bulk Email Campaign", desc: "Send personalized emails to multiple leads at once.", category: "outreach", icon: Send, command: "Send follow-up emails to all contacted leads", agent: "xps_assistant", function: "sendBulkEmails" },
  { id: "sms_send", name: "SMS Messaging", desc: "Send SMS messages via Twilio to leads and contacts.", category: "outreach", icon: Phone, command: "Send an SMS to my top lead", agent: "xps_assistant", function: "sendSms" },
  { id: "ai_call", name: "AI Phone Call", desc: "Initiate AI-powered phone calls with custom scripts.", category: "outreach", icon: Phone, command: "Make an AI call to my top prospect", agent: "xps_assistant", function: "makeAiCall" },
  { id: "gmail_sync", name: "Gmail Integration", desc: "List and send emails through connected Gmail account.", category: "outreach", icon: Mail, command: "Show my recent Gmail messages", agent: "xps_assistant", function: "gmailMessages" },

  // Research & Intel
  { id: "deep_research", name: "Deep Company Research", desc: "Multi-source intelligence report on any company. Revenue, employees, tech stack.", category: "research", icon: Globe, command: "Deep research on [company name]", agent: "xps_assistant", function: "deepResearch" },
  { id: "web_research", name: "Web Research", desc: "Research any topic, URL, or query with AI analysis.", category: "research", icon: Search, command: "Research epoxy flooring market trends 2025", agent: "xps_assistant", function: "webResearch" },
  { id: "competitor_scrape", name: "Competitor Analysis", desc: "Deep scrape competitor websites for products, pricing, reviews, reputation.", category: "research", icon: Swords, command: "Analyze competitor at [url]", agent: "xps_assistant", function: "competitorScrape" },
  { id: "manufacturer_profile", name: "Manufacturer Profiler", desc: "Build comprehensive profiles of flooring product manufacturers.", category: "research", icon: Wrench, command: "Profile Sika as a manufacturer", agent: "xps_assistant", function: "manufacturerProfiler" },
  { id: "knowledge_search", name: "Knowledge Base Search", desc: "Semantic search across all ingested knowledge, specs, and intel.", category: "research", icon: Brain, command: "Search knowledge base for metallic epoxy specs", agent: "xps_assistant", function: "knowledgeSearch" },
  { id: "web_browse", name: "Web Browser", desc: "Browse any URL and extract content for analysis.", category: "research", icon: Globe, command: "Browse https://example.com and summarize", agent: "xps_assistant", function: "webBrowse" },

  // Content & Creative
  { id: "proposal_gen", name: "Proposal Generator", desc: "Generate professional flooring proposals with scope, pricing, timeline.", category: "content", icon: FileText, command: "Generate a proposal for my top lead", agent: "sales_director", function: "generateProposal" },
  { id: "invoice_gen", name: "Invoice Generator", desc: "Create invoices from approved proposals.", category: "content", icon: DollarSign, command: "Generate an invoice for proposal #1", agent: "billing_controller", function: "generateInvoice" },
  { id: "image_gen", name: "AI Image Generator", desc: "Generate marketing images, before/after mockups, social content.", category: "content", icon: Image, command: "Generate a before/after epoxy floor image", agent: "xps_assistant", function: "generateImage" },
  { id: "seo_content", name: "SEO Content Writer", desc: "Generate blog posts, landing pages, and SEO-optimized content.", category: "content", icon: Megaphone, command: "Write a blog post about metallic epoxy benefits", agent: "seo_marketing", function: "seoAnalyze" },
  { id: "social_content", name: "Social Media Content", desc: "Create posts for Instagram, LinkedIn, TikTok, Facebook.", category: "content", icon: Star, command: "Create an Instagram post showcasing a floor project", agent: "social_media", function: "seoAnalyze" },

  // Automation
  { id: "overnight_run", name: "Overnight Pipeline", desc: "Run full overnight FL market pipeline: scrape → score → enrich → brief.", category: "automation", icon: Clock, command: "Start overnight pipeline run", agent: "xps_assistant", function: "overnightRunner" },
  { id: "exec_brief", name: "Executive Brief", desc: "Generate and email morning executive summary with KPIs.", category: "automation", icon: FileText, command: "Generate executive brief", agent: "xps_assistant", function: "executiveBrief" },
  { id: "swarm", name: "Agent Swarm", desc: "Orchestrate multiple agents working in parallel on complex tasks.", category: "automation", icon: GitBranch, command: "Deploy swarm to build Tampa pipeline", agent: "ceo_orchestrator", function: "swarmOrchestrator" },
  { id: "agent_runner", name: "Agent Job System", desc: "Create, run, pause, and monitor agent background jobs.", category: "automation", icon: Bot, command: "Show agent job status", agent: "xps_assistant", function: "agentRunner" },
  { id: "scheduled_scrape", name: "Scheduled Scraping", desc: "Configure and run automated scraping on schedules.", category: "automation", icon: Calendar, command: "Run all scheduled scrape jobs", agent: "scraper", function: "runScheduledScrapeJobs" },
  { id: "knowledge_scraper", name: "Knowledge Scraper", desc: "Scrape knowledge sources by tier (XPS-owned, industry, manufacturers).", category: "automation", icon: Brain, command: "Scrape tier 1 knowledge sources", agent: "xps_assistant", function: "knowledgeScraper" },

  // Analytics
  { id: "pipeline_analytics", name: "Pipeline Analytics", desc: "View pipeline metrics, conversion rates, deal velocity.", category: "analytics", icon: BarChart3, command: "Show my pipeline analytics", agent: "xps_assistant", function: null },
  { id: "revenue_forecast", name: "Revenue Forecasting", desc: "AI-powered revenue predictions based on pipeline data.", category: "analytics", icon: TrendingUp, command: "Forecast next quarter revenue", agent: "prediction", function: null },
  { id: "market_sim", name: "Market Simulation", desc: "What-if scenarios for pricing, territory expansion, hiring.", category: "analytics", icon: BarChart3, command: "Simulate expanding to 3 new states", agent: "simulation", function: null },
  { id: "seo_analytics", name: "SEO Analysis", desc: "Analyze website SEO, keyword rankings, competitor positions.", category: "analytics", icon: Search, command: "Analyze SEO for xtremepolishingsystems.com", agent: "seo_marketing", function: "seoAnalyze" },

  // Integrations
  { id: "hubspot_sync", name: "HubSpot Sync", desc: "Fetch, sync, and push data to/from HubSpot CRM.", category: "integrations", icon: Database, command: "Sync leads to HubSpot", agent: "xps_assistant", function: "hubspotSync" },
  { id: "gdrive", name: "Google Drive", desc: "List and access Google Drive files.", category: "integrations", icon: Database, command: "Show my Google Drive files", agent: "xps_assistant", function: "googleDriveFiles" },
  { id: "groq_ai", name: "Groq AI Inference", desc: "Run fast AI inference via Groq for specialized tasks.", category: "integrations", icon: Zap, command: "Run Groq inference for lead analysis", agent: "code_agent", function: "agentExecute" },
  { id: "supabase", name: "Supabase DB", desc: "Query and manage Supabase database.", category: "integrations", icon: Database, command: "Query Supabase for lead records", agent: "code_agent", function: "agentExecute" },
  { id: "github", name: "GitHub API", desc: "Access GitHub repos, issues, and deployments.", category: "integrations", icon: Code2, command: "List GitHub repos", agent: "code_agent", function: "agentExecute" },

  // Admin & System
  { id: "health_check", name: "System Health Check", desc: "Check status of all API connectors and integrations.", category: "admin", icon: Shield, command: "Run health check on all connectors", agent: "xps_assistant", function: "testConnector" },
  { id: "data_audit", name: "Data Audit", desc: "Audit data quality across all entities.", category: "admin", icon: Shield, command: "Audit data quality for leads", agent: "validation", function: null },
  { id: "site_customize", name: "Site Customization", desc: "Change colors, fonts, layout, branding through chat commands.", category: "admin", icon: Wrench, command: "Change primary color to #3b82f6", agent: "xps_assistant", function: null },
  { id: "process_tasks", name: "Process Agent Tasks", desc: "Run queued agent tasks (emails, notifications).", category: "admin", icon: Clock, command: "Process all queued agent tasks", agent: "xps_assistant", function: "processAgentTasks" },
];

export default function AgentSkillsLibrary({ onRunSkill }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = SKILLS.filter(s => {
    if (activeCategory !== "all" && s.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.command.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = {};
  filtered.forEach(s => {
    const cat = SKILL_CATEGORIES.find(c => c.id === s.category);
    const label = cat?.label || s.category;
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(s);
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Agent Skills Library</h1>
          <p className="text-sm text-muted-foreground">{SKILLS.length} skills across {SKILL_CATEGORIES.length - 1} categories — click any to execute</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..."
          className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SKILL_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === c.id ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {Object.entries(grouped).map(([categoryLabel, skills]) => (
        <div key={categoryLabel} className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{categoryLabel}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map(skill => {
              const Icon = skill.icon;
              return (
                <button key={skill.id} onClick={() => onRunSkill?.(skill.command, skill.agent)}
                  className="glass-card rounded-xl p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground">{skill.name}</div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{skill.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[9px] text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full truncate">{skill.command}</span>
                  </div>
                  {skill.function && (
                    <div className="mt-1.5 text-[8px] text-muted-foreground/60 font-mono">fn: {skill.function}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}