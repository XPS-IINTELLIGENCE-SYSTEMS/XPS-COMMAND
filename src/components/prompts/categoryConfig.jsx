// Nested category tree: category -> subcategories
export const CATEGORY_TREE = {
  leads_intelligence: {
    label: "Leads & Intelligence",
    color: "#d4af37",
    subcategories: ["Lead Scoring", "Lead Qualification", "Company Research", "Contact Enrichment", "Customer Journey"],
  },
  outreach_campaigns: {
    label: "Outreach Campaigns",
    color: "#6366f1",
    subcategories: ["Cold Email", "Follow-Up Sequences", "SMS Outreach", "LinkedIn", "Re-engagement"],
  },
  bid_pricing: {
    label: "Bid & Pricing",
    color: "#22c55e",
    subcategories: ["Bid Analysis", "Win Strategy", "Dynamic Pricing", "Cost Estimation", "Competitive Pricing"],
  },
  competitor_research: {
    label: "Competitor Research",
    color: "#ef4444",
    subcategories: ["Competitive Analysis", "Price Monitoring", "Feature Comparison", "Market Positioning"],
  },
  content_creation: {
    label: "Content Creation",
    color: "#ec4899",
    subcategories: ["SEO Content", "Social Media", "Email Copy", "Video Scripts", "Ad Copy"],
  },
  agent_building: {
    label: "Agent Building",
    color: "#8b5cf6",
    subcategories: ["Agent Design", "Agent Capabilities", "Multi-Agent Systems", "Agent Memory", "Tool Integration"],
  },
  automation_workflows: {
    label: "Automation Workflows",
    color: "#f59e0b",
    subcategories: ["Process Design", "Data Pipelines", "Event Triggers", "Scheduling", "Error Handling"],
  },
  financial_ai: {
    label: "Financial AI",
    color: "#14b8a6",
    subcategories: ["Portfolio Analysis", "Risk Assessment", "Financial Modeling", "Market Analysis", "Reporting"],
  },
  autonomous_systems: {
    label: "Autonomous Systems",
    color: "#d4af37",
    subcategories: ["System Architecture", "Self-Healing", "Decision Engines", "Monitoring", "Optimization"],
  },
  wealth_creation: {
    label: "Wealth Creation",
    color: "#f97316",
    subcategories: ["Revenue Models", "Passive Income", "Asset Building", "Business Systems", "Scaling"],
  },
  trading_systems: {
    label: "Trading Systems",
    color: "#22c55e",
    subcategories: ["Strategy Design", "Signal Generation", "Risk Management", "Backtesting", "Portfolio Rebalancing"],
  },
  prediction_systems: {
    label: "Prediction Systems",
    color: "#06b6d4",
    subcategories: ["Forecasting", "ML Models", "Feature Engineering", "Model Evaluation", "Deployment"],
  },
  recommendation_systems: {
    label: "Recommendations",
    color: "#a855f7",
    subcategories: ["Collaborative Filtering", "Content-Based", "Hybrid Systems", "Cold Start", "Real-Time"],
  },
  scraping_harvesting: {
    label: "Scraping & Harvesting",
    color: "#ef4444",
    subcategories: ["Web Scraping", "API Harvesting", "Data Cleaning", "Anti-Detection", "Storage"],
  },
  system_cloning: {
    label: "System Cloning",
    color: "#84cc16",
    subcategories: ["Business Model Clone", "Tech Stack Clone", "Market Adaptation", "Localization", "Rapid Launch"],
  },
  invention_systems: {
    label: "Invention Systems",
    color: "#f59e0b",
    subcategories: ["Ideation", "Feasibility", "Prototyping", "Market Testing", "IP Strategy"],
  },
  meta_systems: {
    label: "Meta-Systems",
    color: "#d4af37",
    subcategories: ["System Factories", "Template Engines", "Configuration Frameworks", "Unified Infrastructure"],
  },
  open_source_integration: {
    label: "Open Source",
    color: "#64748b",
    subcategories: ["Stack Selection", "Integration Architecture", "Cost Optimization", "Community Support"],
  },
  system_refactoring: {
    label: "Refactoring",
    color: "#0ea5e9",
    subcategories: ["Code Quality", "Modularity", "AI Integration Points", "Migration Strategy", "Testing"],
  },
  recursive_building: {
    label: "Recursive Building",
    color: "#8b5cf6",
    subcategories: ["Layer Design", "Value Multiplication", "Self-Improvement Loops", "Cross-Layer Learning"],
  },
  millionaire_paths: {
    label: "Millionaire Paths",
    color: "#d4af37",
    subcategories: ["Business Models", "Investment Strategies", "Leverage Points", "Network Effects"],
  },
  ai_architecture: {
    label: "AI Architecture",
    color: "#6366f1",
    subcategories: ["LLM Integration", "Prompt Engineering", "RAG Systems", "Fine-tuning", "Evaluation"],
  },
  idea_generation: {
    label: "Idea Generation",
    color: "#ec4899",
    subcategories: ["Brainstorming", "Problem Discovery", "Opportunity Mapping", "Validation"],
  },
  custom: {
    label: "Custom",
    color: "#64748b",
    subcategories: [],
  },
};

// Flat map for easy lookup
export const CATEGORIES = Object.fromEntries(
  Object.entries(CATEGORY_TREE).map(([k, v]) => [k, v.label])
);

// All category keys in order
export const CATEGORY_KEYS = Object.keys(CATEGORY_TREE);