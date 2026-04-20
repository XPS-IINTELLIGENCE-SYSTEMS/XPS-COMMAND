import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Search, Download, Loader2, Check, ChevronRight, ArrowLeft, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TEMPLATE_CATEGORIES = [
  { id: "ui_ux", label: "UI/UX Design", count: 20, desc: "Dashboards, landing pages, forms, mobile layouts", templates: [
    "Admin Dashboard", "Landing Page Hero", "Pricing Page", "User Profile", "Settings Panel",
    "Data Table", "Kanban Board", "Analytics Chart", "Login Flow", "Onboarding Wizard",
    "Mobile Navigation", "Card Grid", "Timeline View", "Chat Interface", "Calendar Widget",
    "Notification Center", "Search Results", "File Manager", "Media Gallery", "Form Builder"
  ]},
  { id: "agents", label: "AI Agents", count: 15, desc: "Autonomous agent configs and prompts", templates: [
    "Sales Agent", "Support Agent", "Research Agent", "Scraping Agent", "Writing Agent",
    "Code Agent", "Data Agent", "Marketing Agent", "Legal Agent", "Finance Agent",
    "HR Agent", "SEO Agent", "Social Agent", "Email Agent", "Scheduler Agent"
  ]},
  { id: "prompts", label: "Prompt Engineering", count: 15, desc: "LLM prompts for every use case", templates: [
    "System Prompt Builder", "Chain of Thought", "Few-Shot Classifier", "Data Extractor",
    "Content Generator", "Code Reviewer", "Translation Prompt", "Summarizer",
    "Sentiment Analyzer", "Entity Extractor", "Decision Maker", "Creative Writer",
    "Technical Writer", "Email Composer", "Report Generator"
  ]},
  { id: "business", label: "Business Plans", count: 10, desc: "Business plans, pitch decks, strategies", templates: [
    "Lean Canvas", "Business Model Canvas", "Pitch Deck", "Financial Projections",
    "Go-To-Market Strategy", "Competitive Analysis", "SWOT Analysis",
    "Executive Summary", "Partnership Proposal", "Growth Strategy"
  ]},
  { id: "finance", label: "Finance", count: 10, desc: "Invoices, estimates, budgets, reports", templates: [
    "Invoice Template", "Estimate Template", "Budget Tracker", "P&L Statement",
    "Cash Flow Forecast", "Expense Report", "Tax Calculator", "ROI Calculator",
    "Subscription Tracker", "Commission Calculator"
  ]},
  { id: "apps", label: "App Templates", count: 12, desc: "Full app starter templates", templates: [
    "CRM Starter", "E-commerce Store", "Project Manager", "Social Network",
    "Blog Platform", "Booking System", "Survey App", "Learning Platform",
    "Job Board", "Real Estate Listing", "Marketplace", "SaaS Dashboard"
  ]},
  { id: "systems", label: "Systems & Frameworks", count: 10, desc: "Architecture patterns and system designs", templates: [
    "Microservices Architecture", "Event-Driven System", "CQRS Pattern", "API Gateway",
    "Message Queue System", "Caching Strategy", "CI/CD Pipeline", "Monitoring Stack",
    "Auth System", "Rate Limiter"
  ]},
  { id: "mobile", label: "Mobile", count: 10, desc: "iOS and Android patterns", templates: [
    "Tab Navigation", "Onboarding Flow", "Profile Screen", "Feed Layout",
    "Chat UI", "Maps Integration", "Push Notifications", "In-App Purchase",
    "Camera/Photo", "Offline Mode"
  ]},
  { id: "desktop", label: "Desktop", count: 8, desc: "Desktop app patterns", templates: [
    "Electron Starter", "Sidebar Layout", "Multi-Window", "System Tray",
    "File Explorer", "Text Editor", "Terminal Emulator", "Dashboard"
  ]},
  { id: "coding", label: "Coding Patterns", count: 12, desc: "Code patterns and snippets", templates: [
    "REST API Boilerplate", "GraphQL Server", "WebSocket Handler", "OAuth Flow",
    "File Upload", "PDF Generator", "Email Service", "Cron Scheduler",
    "Database Migration", "Testing Suite", "Error Handler", "Logger"
  ]},
  { id: "ai_ml", label: "AI & Machine Learning", count: 10, desc: "ML models and AI pipelines", templates: [
    "Classification Model", "NLP Pipeline", "Recommendation Engine", "RAG System",
    "Fine-Tuning Pipeline", "Vector Search", "Anomaly Detection", "Chatbot Framework",
    "Image Classifier", "Data Labeling Tool"
  ]},
  { id: "marketing", label: "Marketing", count: 10, desc: "Campaigns, funnels, content", templates: [
    "Email Campaign", "Landing Page Funnel", "Social Media Calendar", "Content Strategy",
    "A/B Testing Plan", "Referral Program", "Influencer Outreach", "Press Release",
    "Case Study", "Testimonial Collector"
  ]},
  { id: "automation", label: "Automation", count: 10, desc: "Workflow and process automation", templates: [
    "Lead Nurture Sequence", "Onboarding Automation", "Invoice Workflow",
    "Approval Process", "Data Sync Pipeline", "Report Scheduler",
    "Alert System", "Backup Automation", "Cleanup Job", "Health Check"
  ]},
  { id: "ecommerce", label: "E-commerce", count: 8, desc: "Product, cart, checkout patterns", templates: [
    "Product Catalog", "Shopping Cart", "Checkout Flow", "Order Management",
    "Inventory System", "Shipping Calculator", "Review System", "Wishlist"
  ]},
  { id: "websites", label: "Website Templates", count: 10, desc: "Full website layouts", templates: [
    "Corporate Site", "Portfolio", "Restaurant", "Agency", "Real Estate",
    "Nonprofit", "Event Page", "Directory", "Documentation", "Blog"
  ]},
  { id: "data", label: "Data & Analytics", count: 8, desc: "Data pipelines and visualization", templates: [
    "ETL Pipeline", "Data Dashboard", "Report Builder", "Chart Library",
    "Data Warehouse", "Real-Time Analytics", "KPI Tracker", "Data Export"
  ]},
  { id: "security", label: "Security", count: 6, desc: "Auth, encryption, compliance", templates: [
    "JWT Authentication", "Role-Based Access", "Encryption Service",
    "Audit Logger", "Compliance Checker", "Penetration Test Plan"
  ]},
  { id: "communication", label: "Communication", count: 8, desc: "Email, SMS, chat, notifications", templates: [
    "Email Templates", "SMS System", "Live Chat", "Notification Hub",
    "Newsletter Builder", "Announcement System", "Feedback Form", "Support Ticket"
  ]},
  { id: "hr", label: "HR & Team", count: 6, desc: "Hiring, onboarding, management", templates: [
    "Job Posting", "Application Form", "Employee Onboarding",
    "Performance Review", "Time Tracker", "Team Directory"
  ]},
  { id: "legal", label: "Legal & Compliance", count: 6, desc: "Contracts, policies, compliance", templates: [
    "NDA Template", "Terms of Service", "Privacy Policy",
    "Employment Contract", "SLA Template", "Cookie Policy"
  ]},
];

export default function TemplatesLibraryView() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(null);
  const [generated, setGenerated] = useState({});

  const generateTemplate = async (catId, templateName) => {
    const key = `${catId}_${templateName}`;
    setGenerating(key);
    try {
      const cat = TEMPLATE_CATEGORIES.find(c => c.id === catId);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complete, production-ready template for: "${templateName}" in the "${cat.label}" category. Include: full description, use cases, implementation guide, code snippets or configuration, best practices, and customization tips. Make it detailed and immediately usable.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, description: { type: "string" },
            use_cases: { type: "string" }, implementation: { type: "string" },
            code: { type: "string" }, best_practices: { type: "string" },
            customization: { type: "string" }
          }
        }
      });
      await base44.entities.IntelRecord.create({
        source_company: "Custom", category: "template",
        title: `Template: ${templateName}`,
        content: `${result.description}\n\nUse Cases: ${result.use_cases}\n\nImplementation: ${result.implementation}\n\nCode: ${result.code}\n\nBest Practices: ${result.best_practices}\n\nCustomization: ${result.customization}`,
        source_type: "llm", tags: `template,${cat.id},${templateName.toLowerCase()}`,
        confidence_score: 85, is_indexed: true, industry: cat.label,
      });
      setGenerated(p => ({ ...p, [key]: true }));
    } catch (e) { console.error(e); }
    setGenerating(null);
  };

  const filtered = TEMPLATE_CATEGORIES.filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()));
  const totalTemplates = TEMPLATE_CATEGORIES.reduce((sum, c) => sum + c.templates.length, 0);

  if (selected) {
    const cat = TEMPLATE_CATEGORIES.find(c => c.id === selected);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{cat.label}</h2>
            <p className="text-[10px] text-muted-foreground">{cat.templates.length} templates — {cat.desc}</p>
          </div>
        </div>
        <div className="space-y-2 max-h-[65vh] overflow-y-auto">
          {cat.templates.map(t => {
            const key = `${cat.id}_${t}`;
            return (
              <div key={t} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs font-semibold text-foreground flex-1">{t}</span>
                <Button size="sm" variant={generated[key] ? "default" : "outline"} className="h-7 text-[10px] gap-1" onClick={() => generateTemplate(cat.id, t)} disabled={generating === key || generated[key]}>
                  {generating === key ? <Loader2 className="w-3 h-3 animate-spin" /> : generated[key] ? <Check className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  {generated[key] ? "Generated" : "Generate"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 metallic-gold-icon" />
        <div>
          <h2 className="text-xl font-bold metallic-gold">Templates Library</h2>
          <p className="text-xs text-muted-foreground">{TEMPLATE_CATEGORIES.length} categories — {totalTemplates} templates</p>
        </div>
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..." className="h-8 text-xs" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(cat => (
          <div key={cat.id} onClick={() => setSelected(cat.id)} className="glass-card rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">{cat.label}</h3>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">{cat.desc}</p>
            <Badge variant="outline" className="text-[9px]">{cat.templates.length} templates</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}