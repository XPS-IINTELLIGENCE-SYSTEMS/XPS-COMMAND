import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, Sparkles, Plus, Loader2, Check, Search, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TOP_50_SKILLS = [
  { name: "Web Scraper", cat: "Data", desc: "Scrape any website and extract structured data", profit: 9 },
  { name: "Lead Scorer", cat: "Sales", desc: "AI-score leads based on fit, intent, and engagement", profit: 10 },
  { name: "Email Writer", cat: "Outreach", desc: "Generate personalized outreach emails", profit: 9 },
  { name: "Proposal Generator", cat: "Sales", desc: "Auto-generate PDF proposals from job data", profit: 10 },
  { name: "Invoice Creator", cat: "Finance", desc: "Generate and send professional invoices", profit: 8 },
  { name: "Social Media Poster", cat: "Marketing", desc: "Create and schedule social media posts", profit: 8 },
  { name: "Competitor Monitor", cat: "Intel", desc: "Track competitor websites for changes", profit: 9 },
  { name: "SEO Optimizer", cat: "Marketing", desc: "Analyze and optimize website SEO", profit: 8 },
  { name: "Meeting Scheduler", cat: "Productivity", desc: "Coordinate and book meetings across calendars", profit: 7 },
  { name: "Document Summarizer", cat: "AI", desc: "Summarize long documents into key points", profit: 8 },
  { name: "Data Entry Automator", cat: "Productivity", desc: "Extract data from emails/docs and enter into CRM", profit: 9 },
  { name: "Follow-Up Bot", cat: "Sales", desc: "Auto-send follow-ups based on engagement", profit: 10 },
  { name: "Price Calculator", cat: "Finance", desc: "Dynamic pricing based on materials, labor, market", profit: 9 },
  { name: "Contract Reviewer", cat: "Legal", desc: "Review contracts for risks and key terms", profit: 8 },
  { name: "Translation Agent", cat: "AI", desc: "Translate content across 100+ languages", profit: 7 },
  { name: "Image Generator", cat: "Creative", desc: "Generate marketing images and graphics", profit: 8 },
  { name: "Code Generator", cat: "Tech", desc: "Write code snippets and full functions", profit: 9 },
  { name: "Bug Fixer", cat: "Tech", desc: "Analyze and fix code bugs automatically", profit: 8 },
  { name: "Customer Support Bot", cat: "Support", desc: "Answer customer questions 24/7", profit: 9 },
  { name: "Knowledge Q&A", cat: "AI", desc: "Answer questions from your knowledge base", profit: 10 },
  { name: "Report Generator", cat: "Analytics", desc: "Generate weekly/monthly performance reports", profit: 8 },
  { name: "Sentiment Analyzer", cat: "Intel", desc: "Analyze customer sentiment from reviews/emails", profit: 8 },
  { name: "Resume Screener", cat: "HR", desc: "Score and rank job applications", profit: 7 },
  { name: "Market Researcher", cat: "Intel", desc: "Deep research any market or industry", profit: 9 },
  { name: "Product Recommender", cat: "Sales", desc: "Recommend products based on customer needs", profit: 9 },
  { name: "Expense Tracker", cat: "Finance", desc: "Track and categorize business expenses", profit: 7 },
  { name: "Blog Writer", cat: "Marketing", desc: "Generate SEO-optimized blog posts", profit: 8 },
  { name: "Video Script Writer", cat: "Creative", desc: "Write scripts for YouTube, TikTok, ads", profit: 8 },
  { name: "Ad Copy Generator", cat: "Marketing", desc: "Write high-converting ad copy for any platform", profit: 9 },
  { name: "Chatbot Builder", cat: "Tech", desc: "Create custom chatbots for any use case", profit: 8 },
  { name: "Data Analyzer", cat: "Analytics", desc: "Analyze datasets and surface insights", profit: 9 },
  { name: "Appointment Setter", cat: "Sales", desc: "Qualify leads and book sales appointments", profit: 10 },
  { name: "Territory Mapper", cat: "Sales", desc: "Map and assign sales territories", profit: 7 },
  { name: "Workflow Automator", cat: "Productivity", desc: "Create multi-step automation workflows", profit: 9 },
  { name: "Feedback Collector", cat: "Support", desc: "Collect and analyze customer feedback", profit: 7 },
  { name: "Compliance Checker", cat: "Legal", desc: "Check content/processes for compliance", profit: 8 },
  { name: "Brand Voice Writer", cat: "Creative", desc: "Write content in your brand's voice", profit: 8 },
  { name: "Inventory Tracker", cat: "Operations", desc: "Track inventory levels and reorder points", profit: 7 },
  { name: "Project Planner", cat: "Productivity", desc: "Break projects into tasks with timelines", profit: 8 },
  { name: "Financial Forecaster", cat: "Finance", desc: "Predict revenue, costs, and cash flow", profit: 9 },
  { name: "RFP Responder", cat: "Sales", desc: "Auto-respond to RFPs with tailored proposals", profit: 10 },
  { name: "Patent Researcher", cat: "Legal", desc: "Search and analyze patents and IP", profit: 7 },
  { name: "Presentation Builder", cat: "Creative", desc: "Generate slide decks from data", profit: 8 },
  { name: "API Integrator", cat: "Tech", desc: "Connect and sync data between APIs", profit: 8 },
  { name: "Voiceover Generator", cat: "Creative", desc: "Generate AI voiceovers for videos", profit: 7 },
  { name: "Form Builder", cat: "Tech", desc: "Create smart forms with validation", profit: 7 },
  { name: "Benchmark Analyzer", cat: "Intel", desc: "Benchmark your metrics vs. industry", profit: 8 },
  { name: "Email Classifier", cat: "Productivity", desc: "Auto-sort and tag incoming emails", profit: 7 },
  { name: "News Monitor", cat: "Intel", desc: "Track industry news and alert on trends", profit: 8 },
  { name: "Training Content Creator", cat: "Education", desc: "Generate training modules and quizzes", profit: 8 },
];

export default function AgentSkillsCreatorView() {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(null);
  const [created, setCreated] = useState({});

  const createSkill = async (skill) => {
    setCreating(skill.name);
    try {
      await base44.entities.IntelRecord.create({
        source_company: "Custom", category: "agent_skill",
        title: `Agent Skill: ${skill.name}`,
        content: `Category: ${skill.cat}\nDescription: ${skill.desc}\nProfit Potential: ${skill.profit}/10\n\nThis agent skill enables: ${skill.desc}. It can be used by any agent in the fleet for automated task execution.`,
        source_type: "manual", tags: `agent,skill,${skill.cat.toLowerCase()},${skill.name.toLowerCase()}`,
        confidence_score: 95, is_indexed: true,
      });
      setCreated(p => ({ ...p, [skill.name]: true }));
    } catch (e) { console.error(e); }
    setCreating(null);
  };

  const createAll = async () => {
    for (const skill of TOP_50_SKILLS) {
      if (!created[skill.name]) await createSkill(skill);
    }
  };

  const filtered = TOP_50_SKILLS.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.cat.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(TOP_50_SKILLS.map(s => s.cat))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 metallic-gold-icon" />
          <div>
            <h2 className="text-xl font-bold metallic-gold">Agent Skills Creator</h2>
            <p className="text-xs text-muted-foreground">Top 50 most profitable & useful agent skills</p>
          </div>
        </div>
        <Button onClick={createAll} size="sm" className="gap-1.5"><Zap className="w-3.5 h-3.5" /> Create All 50</Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => <Badge key={c} variant="outline" className="text-[9px]">{c} ({TOP_50_SKILLS.filter(s => s.cat === c).length})</Badge>)}
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..." className="h-8 text-xs" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
        {filtered.map(skill => (
          <div key={skill.name} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{skill.name}</span>
                <Badge variant="outline" className="text-[8px]">{skill.cat}</Badge>
                <span className="flex items-center gap-0.5 text-[8px] text-yellow-400"><Star className="w-2 h-2 fill-current" />{skill.profit}</span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">{skill.desc}</p>
            </div>
            <Button size="sm" variant={created[skill.name] ? "default" : "outline"} className="h-7 text-[10px] gap-1 flex-shrink-0" onClick={() => createSkill(skill)} disabled={creating === skill.name || created[skill.name]}>
              {creating === skill.name ? <Loader2 className="w-3 h-3 animate-spin" /> : created[skill.name] ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {created[skill.name] ? "Added" : "Create"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}