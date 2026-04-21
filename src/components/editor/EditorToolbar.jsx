import { useState } from "react";
import {
  Users, Briefcase, Building2, Search, FileText, BarChart3,
  BookOpen, Swords, Link2, Shield, Settings, Bot,
  Target, Send, Clock, GitBranch, Upload, Database,
  Sprout, Sliders, Share2, Globe, Sparkles, Brain,
  TrendingUp, Heart, Wrench, MapPin, Crosshair, Layers,
  Radar, Layout, Zap, Terminal, X
} from "lucide-react";

const ICON_MAP = {
  Users, Briefcase, Building2, Search, FileText, BarChart3,
  BookOpen, Swords, Link2, Shield, Settings, Bot,
  Target, Send, Clock, GitBranch, Upload, Database,
  Sprout, Sliders, Share2, Globe, Sparkles, Brain,
  TrendingUp, Heart, Wrench, MapPin, Crosshair, Layers,
  Radar, Layout, Zap, Terminal,
};

const CATEGORIES = [
  {
    id: "leads", label: "Lead Engine", icon: "Users", color: "#d4af37",
    tools: [
      { id: "xpress_leads", label: "Leads", icon: "Users" },
      { id: "find_companies", label: "Find Companies", icon: "Building2" },
      { id: "find_jobs", label: "Find Jobs", icon: "Briefcase" },
      { id: "data_bank", label: "Data Bank", icon: "Database" },
      { id: "crm", label: "CRM", icon: "Target" },
      { id: "lead_sniper", label: "Lead Sniper", icon: "Crosshair" },
      { id: "master_database", label: "Operations DB", icon: "Database" },
    ],
  },
  {
    id: "outreach", label: "Outreach", icon: "Send", color: "#ec4899",
    tools: [
      { id: "get_work", label: "Outreach", icon: "Send" },
      { id: "win_work", label: "Proposals", icon: "FileText" },
      { id: "bid_center", label: "Bid Center", icon: "Briefcase" },
      { id: "gc_bid_pipeline", label: "GC Pipeline", icon: "Building2" },
      { id: "master_pipeline", label: "Master Pipeline", icon: "GitBranch" },
      { id: "outreach_automation", label: "Follow-Up Bot", icon: "Send" },
      { id: "sentiment_analyst", label: "Sentiment", icon: "Brain" },
    ],
  },
  {
    id: "estimating", label: "Estimating", icon: "BarChart3", color: "#22c55e",
    tools: [
      { id: "blueprint_takeoff", label: "Blueprint Takeoff", icon: "Upload" },
      { id: "dynamic_pricing", label: "Dynamic Pricing", icon: "TrendingUp" },
      { id: "proposal_generator", label: "Proposal Gen", icon: "FileText" },
      { id: "auto_proposal", label: "AI Bid Writer", icon: "Sparkles" },
      { id: "compliance_checker", label: "Compliance", icon: "Shield" },
    ],
  },
  {
    id: "field", label: "Field Ops", icon: "Wrench", color: "#f97316",
    tools: [
      { id: "field_tech", label: "Field Tech", icon: "Wrench" },
      { id: "job_site_map", label: "Job Map", icon: "MapPin" },
      { id: "client_portal", label: "Client Portal", icon: "Building2" },
      { id: "status_reports", label: "Reports", icon: "FileText" },
    ],
  },
  {
    id: "intel", label: "Intelligence", icon: "Search", color: "#8b5cf6",
    tools: [
      { id: "research", label: "Research Lab", icon: "Search" },
      { id: "knowledge", label: "Knowledge Base", icon: "BookOpen" },
      { id: "knowledge_upload", label: "Upload Intel", icon: "Upload" },
      { id: "competition", label: "Competitors", icon: "Swords" },
      { id: "xps_intel_core", label: "Intel Core", icon: "Brain" },
      { id: "company_assets", label: "Company Assets", icon: "Building2" },
    ],
  },
  {
    id: "content", label: "Content", icon: "Share2", color: "#ec4899",
    tools: [
      { id: "media_hub", label: "Media Hub", icon: "Share2" },
      { id: "scrape_social", label: "Social Intel", icon: "Share2" },
      { id: "scrape_trends", label: "Trends", icon: "Globe" },
      { id: "analytics", label: "Analytics", icon: "BarChart3" },
    ],
  },
  {
    id: "agents", label: "AI Agents", icon: "Bot", color: "#d4af37",
    tools: [
      { id: "ai_assistant", label: "AI Assistant", icon: "Bot" },
      { id: "agent_builder", label: "Agent Builder", icon: "Bot" },
      { id: "agent_fleet", label: "Agent Fleet", icon: "Bot" },
      { id: "agent_command", label: "Agent Command", icon: "Sparkles" },
      { id: "agent_skills", label: "Skills Library", icon: "Bot" },
      { id: "skills_creator", label: "Skills Creator", icon: "Sparkles" },
    ],
  },
  {
    id: "automation", label: "Automation", icon: "GitBranch", color: "#f43f5e",
    tools: [
      { id: "workflows", label: "Workflows", icon: "GitBranch" },
      { id: "scheduler", label: "Scheduler", icon: "Clock" },
      { id: "master_scraper", label: "Scraper", icon: "Radar" },
      { id: "approval_queue", label: "Approvals", icon: "Shield" },
    ],
  },
  {
    id: "system", label: "System", icon: "Settings", color: "#64748b",
    tools: [
      { id: "admin", label: "Admin", icon: "Shield" },
      { id: "settings", label: "Settings", icon: "Settings" },
      { id: "connectors", label: "Connectors", icon: "Link2" },
      { id: "system_health", label: "Health", icon: "Heart" },
      { id: "open_claw", label: "Open Claw", icon: "Radar" },
      { id: "supabase_control", label: "Supabase", icon: "Database" },
      { id: "hyper_evolver", label: "Evolver", icon: "Zap" },
      { id: "system_index", label: "Index", icon: "BookOpen" },
    ],
  },
];

export default function EditorToolbar({ onToolSelect }) {
  const [openCategory, setOpenCategory] = useState(null);

  const handleCategoryClick = (catId) => {
    setOpenCategory(openCategory === catId ? null : catId);
  };

  const activeCat = CATEGORIES.find(c => c.id === openCategory);

  return (
    <div className="w-14 h-full border-l border-border bg-card flex flex-col items-center py-2 gap-1 relative overflow-visible">
      {CATEGORIES.map(cat => {
        const Icon = ICON_MAP[cat.icon] || Settings;
        const isOpen = openCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isOpen ? "bg-primary/15 ring-1 ring-primary/30" : "hover:bg-secondary"
            }`}
            title={cat.label}
          >
            <Icon className="w-4 h-4" style={{ color: cat.color }} />
          </button>
        );
      })}

      {/* Popover for open category */}
      {activeCat && (
        <div className="absolute right-[60px] top-0 w-56 max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <span className="text-xs font-bold text-foreground">{activeCat.label}</span>
            <button onClick={() => setOpenCategory(null)} className="p-1 rounded hover:bg-secondary">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="p-1.5 max-h-80 overflow-y-auto">
            {activeCat.tools.map(tool => {
              const TIcon = ICON_MAP[tool.icon] || Settings;
              return (
                <button
                  key={tool.id}
                  onClick={() => { onToolSelect(tool.id); setOpenCategory(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                >
                  <TIcon className="w-4 h-4 shrink-0" style={{ color: activeCat.color }} />
                  <span className="truncate">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { CATEGORIES };