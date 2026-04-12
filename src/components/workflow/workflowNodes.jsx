import {
  Globe, Database, FileSearch, CheckCircle, Star, FolderOpen,
  Brain, PhoneCall, Mail, Target, BarChart3, TrendingUp,
  Zap, Bot, MessageSquare, Shield, Search, Layers,
  Sparkles, GitBranch, ArrowDownToLine, Filter, Award
} from "lucide-react";

const nodeCategories = [
  {
    label: "Data Acquisition",
    color: "#3b82f6",
    nodes: [
      { type: "web_scrape", label: "Web Scraper", icon: Globe, desc: "Crawl by keyword or URL" },
      { type: "mass_ingest", label: "Mass Data Ingestion", icon: ArrowDownToLine, desc: "Async multi-site scraping" },
      { type: "drive_import", label: "Google Drive Import", icon: Database, desc: "Import from Drive/Sheets" },
      { type: "supabase_import", label: "Supabase Import", icon: Database, desc: "Pull from Supabase tables" },
      { type: "file_upload", label: "File Upload", icon: FileSearch, desc: "CSV, JSON, PDF ingestion" },
    ],
  },
  {
    label: "Data Processing",
    color: "#8b5cf6",
    nodes: [
      { type: "validation", label: "Data Validation", icon: CheckCircle, desc: "Clean & validate records" },
      { type: "scoring", label: "Scoring & Prioritizing", icon: Star, desc: "AI-powered lead scoring" },
      { type: "organization", label: "Data Organization", icon: FolderOpen, desc: "Categorize & structure" },
      { type: "dedup", label: "Deduplication", icon: Filter, desc: "Remove duplicate entries" },
    ],
  },
  {
    label: "AI Intelligence",
    color: "#d4af37",
    nodes: [
      { type: "ai_profile", label: "AI Profiling", icon: Brain, desc: "Deep prospect profiling" },
      { type: "ai_recommend", label: "AI Recommendations", icon: Sparkles, desc: "Smart action suggestions" },
      { type: "deep_insights", label: "Deep Insights", icon: TrendingUp, desc: "AI-driven analytics" },
      { type: "competitor_analysis", label: "Competitor Analysis", icon: Shield, desc: "Market & competitor intel" },
      { type: "predictions", label: "AI Predictions", icon: Zap, desc: "Sales & trend forecasting" },
      { type: "simulation", label: "AI Simulation", icon: Layers, desc: "Scenario modeling" },
    ],
  },
  {
    label: "Sales Outreach",
    color: "#22c55e",
    nodes: [
      { type: "sales_log", label: "Sales Call Log", icon: PhoneCall, desc: "AI call integration" },
      { type: "sales_pitch", label: "Sales Pitch", icon: MessageSquare, desc: "AI pitch generation" },
      { type: "ai_phone", label: "AI Phone Call", icon: PhoneCall, desc: "Automated AI calling" },
      { type: "ai_email", label: "AI Email", icon: Mail, desc: "Smart email outreach" },
      { type: "closing", label: "Closing Recommendation", icon: Award, desc: "AI close strategies" },
    ],
  },
  {
    label: "Analysis & Results",
    color: "#f97316",
    nodes: [
      { type: "data_analysis", label: "Data Analysis", icon: BarChart3, desc: "Statistical analysis" },
      { type: "contact_success", label: "Contact Success", icon: Target, desc: "Track outreach results" },
      { type: "sales_assist", label: "AI Sales Assistant", icon: Bot, desc: "Real-time sale guidance" },
      { type: "report", label: "Report Generator", icon: FileSearch, desc: "Auto-generate reports" },
    ],
  },
  {
    label: "Control Flow",
    color: "#06b6d4",
    nodes: [
      { type: "condition", label: "Condition", icon: GitBranch, desc: "If/else branching" },
      { type: "loop", label: "Loop", icon: Search, desc: "Iterate over data" },
      { type: "agent_assign", label: "Agent Assignment", icon: Bot, desc: "Assign specialty agent" },
    ],
  },
];

export default nodeCategories;