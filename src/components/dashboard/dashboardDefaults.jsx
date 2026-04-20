import {
  Users, Briefcase, Building2, Search, FileText, BarChart3,
  BookOpen, Swords, Link2, Shield, Settings, Bot,
  Target, Send, Clock, GitBranch,
  Upload, Database, Sprout, Sliders, Share2, Globe,
  Sparkles, Brain, TrendingUp, Heart, Wrench, MapPin, Crosshair,
  Layers, Radar, Layout, Zap, Terminal
} from "lucide-react";

// Master list of all available icons for the icon picker
export const ICON_OPTIONS = [
  { name: "Users", icon: Users },
  { name: "Target", icon: Target },
  { name: "Database", icon: Database },
  { name: "Briefcase", icon: Briefcase },
  { name: "Building2", icon: Building2 },
  { name: "Share2", icon: Share2 },
  { name: "Globe", icon: Globe },
  { name: "Search", icon: Search },
  { name: "Send", icon: Send },
  { name: "FileText", icon: FileText },
  { name: "BarChart3", icon: BarChart3 },
  { name: "BookOpen", icon: BookOpen },
  { name: "Upload", icon: Upload },
  { name: "Sprout", icon: Sprout },
  { name: "Swords", icon: Swords },
  { name: "Sliders", icon: Sliders },
  { name: "Clock", icon: Clock },
  { name: "GitBranch", icon: GitBranch },
  { name: "Shield", icon: Shield },
  { name: "Settings", icon: Settings },
  { name: "Bot", icon: Bot },
  { name: "Link2", icon: Link2 },
  { name: "Sparkles", icon: Sparkles },
  { name: "Brain", icon: Brain },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Heart", icon: Heart },
  { name: "Wrench", icon: Wrench },
  { name: "MapPin", icon: MapPin },
  { name: "Crosshair", icon: Crosshair },
  { name: "Layers", icon: Layers },
  { name: "Radar", icon: Radar },
  { name: "Layout", icon: Layout },
  { name: "Zap", icon: Zap },
  { name: "Terminal", icon: Terminal },

];

export const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map(i => [i.name, i.icon]));

export const COLOR_OPTIONS = [
  "#d4af37", "#6366f1", "#06b6d4", "#22c55e", "#f59e0b",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#ef4444",
  "#84cc16", "#0ea5e9", "#f43f5e", "#a855f7", "#64748b",
  "#10b981", "#e11d48", "#7c3aed", "#059669", "#ea580c",
];

// Default tool card definitions — ordered by logical user workflow (most important first)
export const DEFAULT_TOOLS = [
  // 1–5: Core lead engine
  { id: "xpress_leads", label: "Leads", desc: "Lead intelligence & pipeline", iconName: "Users", color: "#d4af37" },
  { id: "find_companies", label: "Find Companies", desc: "AI company scraper", iconName: "Building2", color: "#f59e0b" },
  { id: "find_jobs", label: "Find Jobs", desc: "Commercial project discovery", iconName: "Briefcase", color: "#22c55e" },
  { id: "data_bank", label: "Data Bank", desc: "All leads — import, export, share", iconName: "Database", color: "#06b6d4" },
  { id: "crm", label: "CRM", desc: "Contacts & deals", iconName: "Target", color: "#6366f1" },

  // 6–10: Outreach & revenue
  { id: "get_work", label: "Outreach", desc: "Email & SMS campaigns", iconName: "Send", color: "#ec4899" },
  { id: "win_work", label: "Proposals", desc: "AI proposal engine", iconName: "FileText", color: "#14b8a6" },
  { id: "bid_center", label: "Bid Center", desc: "Gov & commercial bidding system", iconName: "Briefcase", color: "#ef4444" },
  { id: "workflows", label: "Workflows", desc: "Drag & drop automation builder", iconName: "GitBranch", color: "#f43f5e" },
  { id: "scheduler", label: "Scheduler", desc: "Schedule automated scraping", iconName: "Clock", color: "#0ea5e9" },

  // 11–15: Research & intelligence
  { id: "research", label: "Research Lab", desc: "Deep web research", iconName: "Search", color: "#8b5cf6" },
  { id: "knowledge", label: "Knowledge Base", desc: "Company & industry intel", iconName: "BookOpen", color: "#06b6d4" },
  { id: "knowledge_upload", label: "Upload Knowledge", desc: "Feed intel into the system", iconName: "Upload", color: "#10b981" },
  { id: "competition", label: "Competition", desc: "Competitor monitoring", iconName: "Swords", color: "#ef4444" },
  { id: "competitor_comparison", label: "Compare vs.", desc: "Head-to-head price & product analysis", iconName: "Swords", color: "#f43f5e" },

  // 16–20: Content & data sources
  { id: "media_hub", label: "Media Hub", desc: "Video, images, branding, social, AI voice", iconName: "Share2", color: "#ec4899" },
  { id: "scrape_social", label: "Scrape Social", desc: "Social media intelligence", iconName: "Share2", color: "#ec4899" },
  { id: "scrape_trends", label: "Scrape Trends", desc: "Trends, consensus, economics", iconName: "Globe", color: "#8b5cf6" },
  { id: "seeds_sources", label: "Seeds & Sources", desc: "Lead sources & seed lists", iconName: "Sprout", color: "#84cc16" },
  { id: "analytics", label: "Analytics", desc: "Performance & pipeline", iconName: "BarChart3", color: "#f97316" },

  // 21–25: AI, agents & admin
  { id: "ai_assistant", label: "AI Assistant", desc: "Chat-driven commands", iconName: "Bot", color: "#d4af37" },
  { id: "agent_skills", label: "Skills Library", desc: "All agent capabilities", iconName: "Bot", color: "#8b5cf6" },
  { id: "agent_knowledge", label: "Agent Knowledge", desc: "Upload docs & URLs to agents", iconName: "Upload", color: "#10b981" },
  { id: "algorithm", label: "Algorithm Tuning", desc: "Fine-tune scoring & AI", iconName: "Sliders", color: "#f59e0b" },
  { id: "connectors", label: "Connectors", desc: "Integrations & APIs", iconName: "Link2", color: "#84cc16" },

  // 26–28: AI Agents
  { id: "agent_builder", label: "Agent Builder", desc: "Build custom AI agents", iconName: "Bot", color: "#f43f5e" },
  { id: "agent_fleet", label: "Agent Fleet", desc: "Fleet library & management", iconName: "Bot", color: "#06b6d4" },

  // 29–31: Estimating & Pricing
  { id: "blueprint_takeoff", label: "Blueprint Takeoff", desc: "Upload PDF plans — AI extracts rooms & zones", iconName: "Upload", color: "#06b6d4" },
  { id: "dynamic_pricing", label: "Dynamic Pricing", desc: "AI bid pricing based on market & costs", iconName: "TrendingUp", color: "#22c55e" },
  { id: "proposal_generator", label: "Proposal Generator", desc: "Auto-generate PDF proposals from job data", iconName: "FileText", color: "#14b8a6" },

  { id: "field_tech", label: "Field Tech", desc: "Work orders, photos & punch lists", iconName: "Wrench", color: "#f97316" },
  { id: "job_site_map", label: "Job Site Map", desc: "Live map, routing & time tracking", iconName: "MapPin", color: "#0ea5e9" },
  { id: "auto_proposal", label: "AI Bid Writer", desc: "Auto-generate bids from job data", iconName: "Sparkles", color: "#8b5cf6" },
  { id: "client_portal", label: "Client Portal", desc: "Client photos, approvals & e-sign", iconName: "Building2", color: "#14b8a6" },
  { id: "agent_command", label: "Agent Command", desc: "Autonomous multi-agent engine", iconName: "Sparkles", color: "#d4af37" },

  // Outreach, Sentiment & Reports
  { id: "outreach_automation", label: "Follow-Up Bot", desc: "Auto follow-ups for stale bids", iconName: "Send", color: "#ec4899" },
  { id: "sentiment_analyst", label: "Sentiment Analyst", desc: "AI intent scoring for leads", iconName: "Brain", color: "#8b5cf6" },
  { id: "status_reports", label: "Status Reports", desc: "Auto-generate & email project reports", iconName: "FileText", color: "#0ea5e9" },

  // 32–35: System
  { id: "admin", label: "Admin Control", desc: "Users, keys & promo codes", iconName: "Shield", color: "#a855f7" },
  { id: "tool_creator", label: "Tool Creator", desc: "Build unlimited custom tools with AI", iconName: "Wrench", color: "#f43f5e" },
  { id: "system_health", label: "System Health", desc: "Auto-diagnose, heal & optimize", iconName: "Heart", color: "#22c55e" },
  { id: "settings", label: "Settings", desc: "Account & preferences", iconName: "Settings", color: "#64748b" },

  // Human Approval Queue
  { id: "approval_queue", label: "Approval Queue", desc: "Review & approve AI agent actions before execution", iconName: "Shield", color: "#f59e0b" },

  // Master Pipeline
  { id: "master_pipeline", label: "Master Pipeline", desc: "Full XPS contractor acquisition workflow — 8 phases, 24 stages", iconName: "GitBranch", color: "#d4af37" },

  // GC Bid Pipeline
  { id: "gc_bid_pipeline", label: "GC Bid Pipeline", desc: "National GC database, bid list campaigns & scope tracking", iconName: "Building2", color: "#d4af37" },
  { id: "lead_sniper", label: "Lead Sniper", desc: "Full automated GC discovery → outreach → bid pipeline system", iconName: "Crosshair", color: "#d4af37" },

  // Company Assets, Master Scraper, Master DB, GitHub, Skills Creator, Templates
  { id: "company_assets", label: "Company Assets", desc: "XPS, NCP, XPress, CPU — branded intel hubs", iconName: "Building2", color: "#d4af37" },
  { id: "master_scraper", label: "Master Scraper", desc: "Unified scraping control center — manual & auto", iconName: "Radar", color: "#ef4444" },
  { id: "master_database", label: "Master Database", desc: "20 industries indexed — universal intelligence", iconName: "Database", color: "#6366f1" },
  { id: "github_explorer", label: "GitHub Explorer", desc: "Search, discover & ingest open source repos", iconName: "GitBranch", color: "#64748b" },
  { id: "skills_creator", label: "Skills Creator", desc: "Build & manage top 50 agent skills", iconName: "Sparkles", color: "#ec4899" },
  { id: "templates_library", label: "Templates Library", desc: "200+ templates — UI, agents, prompts, business", iconName: "Layers", color: "#14b8a6" },

  // Visual Page Builder & Auto-Enhancement
  { id: "page_builder", label: "Page Builder", desc: "Create custom pages with drag & drop widgets", iconName: "Layout", color: "#6366f1" },
  { id: "auto_enhance", label: "Auto-Enhance", desc: "AI tool analysis, self-reflection & upgrade engine", iconName: "Zap", color: "#d4af37" },

  // System Index, Instructions & Compliance
  { id: "system_index", label: "System Index", desc: "Master catalog of all tools, agents & capabilities", iconName: "BookOpen", color: "#6366f1" },
  { id: "system_instructions", label: "System Instructions", desc: "Set rules, directives & commands for agents", iconName: "Terminal", color: "#d4af37" },
  { id: "compliance_checker", label: "Compliance Checker", desc: "Cross-reference bid requirements with proposals", iconName: "Shield", color: "#f59e0b" },
];