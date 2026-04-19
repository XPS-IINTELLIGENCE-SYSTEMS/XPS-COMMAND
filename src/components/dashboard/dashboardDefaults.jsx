import {
  Users, Briefcase, Building2, Search, FileText, BarChart3,
  BookOpen, Swords, Link2, Shield, Settings, Bot,
  Target, Send, Clock, GitBranch,
  Upload, Database, Sprout, Sliders, Share2, Globe,
  Sparkles, Brain, TrendingUp, Heart, Wrench
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

  // 29–31: System
  { id: "admin", label: "Admin Control", desc: "Users, keys & promo codes", iconName: "Shield", color: "#a855f7" },
  { id: "tool_creator", label: "Tool Creator", desc: "Build unlimited custom tools with AI", iconName: "Wrench", color: "#f43f5e" },
  { id: "system_health", label: "System Health", desc: "Auto-diagnose, heal & optimize", iconName: "Heart", color: "#22c55e" },
  { id: "settings", label: "Settings", desc: "Account & preferences", iconName: "Settings", color: "#64748b" },
];