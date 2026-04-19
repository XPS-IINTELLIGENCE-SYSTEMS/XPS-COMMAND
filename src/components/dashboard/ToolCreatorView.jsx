import { useState } from "react";
import { Sparkles, Plus, Loader2, Palette, Type, Check, Wand2, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { ICON_OPTIONS, ICON_MAP, COLOR_OPTIONS } from "./dashboardDefaults";
import { cn } from "@/lib/utils";

// AI-recommended tools the system doesn't have yet
const AI_TOOL_SUGGESTIONS = [
  { label: "Payment Processing", desc: "Accept deposits & invoice payments via Stripe", iconName: "Shield", color: "#6366f1", category: "Revenue" },
  { label: "E-Signatures", desc: "DocuSign contract signing from bid workflow", iconName: "FileText", color: "#22c55e", category: "Revenue" },
  { label: "Dynamic Pricing", desc: "AI-optimized bid pricing based on market data", iconName: "TrendingUp", color: "#f59e0b", category: "Revenue" },
  { label: "Accounting Sync", desc: "QuickBooks/Xero two-way invoice sync", iconName: "Database", color: "#06b6d4", category: "Revenue" },
  { label: "Revenue Forecast", desc: "Predict monthly revenue from pipeline data", iconName: "BarChart3", color: "#8b5cf6", category: "Revenue" },
  { label: "RAG Knowledge", desc: "Vector-indexed company docs for agent grounding", iconName: "Brain", color: "#d4af37", category: "AI" },
  { label: "Agent Memory", desc: "Persistent long-term memory per agent", iconName: "Bot", color: "#ec4899", category: "AI" },
  { label: "Voice-to-Action", desc: "Voice memo transcription to tasks & leads", iconName: "Bot", color: "#14b8a6", category: "AI" },
  { label: "Prompt Optimizer", desc: "A/B test and auto-refine agent prompts", iconName: "Sliders", color: "#f43f5e", category: "AI" },
  { label: "Agent Analytics", desc: "Cost, accuracy & ROI tracking per agent", iconName: "BarChart3", color: "#0ea5e9", category: "AI" },
  { label: "Maps Enrichment", desc: "Google Maps/Places business data enrichment", iconName: "Globe", color: "#22c55e", category: "Data" },
  { label: "Property Intel", desc: "Zillow property data for estimating needs", iconName: "Building2", color: "#f97316", category: "Data" },
  { label: "Census Data", desc: "Demographics & economics by ZIP for territory scoring", iconName: "Database", color: "#06b6d4", category: "Data" },
  { label: "Weather API", desc: "Climate data for project timelines & material recs", iconName: "Globe", color: "#0ea5e9", category: "Data" },
  { label: "Permit Monitor", desc: "Auto-discover new construction permits", iconName: "Search", color: "#ef4444", category: "Data" },
  { label: "Material Pricing", desc: "Live epoxy/concrete price feeds from suppliers", iconName: "TrendingUp", color: "#f59e0b", category: "Data" },
  { label: "Review Aggregator", desc: "Pull competitor reviews from Yelp/Google/BBB", iconName: "Search", color: "#ec4899", category: "Data" },
  { label: "Project Board", desc: "Post-sale Kanban: crews, materials, timelines", iconName: "Briefcase", color: "#6366f1", category: "Operations" },
  { label: "Route Optimizer", desc: "Optimize daily crew routes between job sites", iconName: "Globe", color: "#22c55e", category: "Operations" },
  { label: "Time Tracking", desc: "Crew hours per project for labor cost accuracy", iconName: "Clock", color: "#f97316", category: "Operations" },
  { label: "Inventory Mgmt", desc: "Track material stock, auto-generate POs", iconName: "Database", color: "#14b8a6", category: "Operations" },
  { label: "Photo Docs", desc: "Before/after with GPS, timestamps, auto-organize", iconName: "Upload", color: "#8b5cf6", category: "Operations" },
  { label: "Safety Tracker", desc: "OSHA certs, insurance, training & renewal alerts", iconName: "Shield", color: "#ef4444", category: "Operations" },
  { label: "Sub Management", desc: "Subcontractor DB with ratings & availability", iconName: "Users", color: "#0ea5e9", category: "Operations" },
  { label: "Warranty Tracker", desc: "Track warranties, auto-trigger renewal outreach", iconName: "Clock", color: "#84cc16", category: "Operations" },
  { label: "SEO Publisher", desc: "Auto-publish location-specific landing pages", iconName: "Globe", color: "#ec4899", category: "Marketing" },
  { label: "Google Business", desc: "Auto-post updates, respond to reviews via API", iconName: "Globe", color: "#22c55e", category: "Marketing" },
  { label: "Ad Manager", desc: "Meta/Google Ads campaign management", iconName: "TrendingUp", color: "#6366f1", category: "Marketing" },
  { label: "Reputation Mgmt", desc: "Auto-request reviews, monitor & alert on negative", iconName: "Shield", color: "#f59e0b", category: "Marketing" },
  { label: "Landing Pages", desc: "Generate campaign-specific landing pages", iconName: "Globe", color: "#8b5cf6", category: "Marketing" },
  { label: "Follow-Up Sequencer", desc: "Multi-channel automated follow-up sequences", iconName: "Send", color: "#d4af37", category: "Revenue" },
  { label: "Win/Loss Analysis", desc: "ML-powered bid outcome prediction", iconName: "BarChart3", color: "#ef4444", category: "Revenue" },
  { label: "Upsell Engine", desc: "Auto-suggest maintenance & upgrades post-job", iconName: "TrendingUp", color: "#14b8a6", category: "Revenue" },
  { label: "Referral Tracker", desc: "Track referral sources & automate rewards", iconName: "Users", color: "#84cc16", category: "Revenue" },
  { label: "Market Expansion", desc: "AI analysis of best new cities to expand into", iconName: "Globe", color: "#f43f5e", category: "Marketing" },
  { label: "Customer Success", desc: "Post-project satisfaction & churn prediction", iconName: "Users", color: "#0ea5e9", category: "Marketing" },
];

const CATEGORIES = ["All", "Revenue", "AI", "Data", "Operations", "Marketing"];

export default function ToolCreatorView({ onSave, onBack }) {
  const [mode, setMode] = useState("browse"); // browse | create | ai
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Create form state
  const [label, setLabel] = useState("");
  const [desc, setDesc] = useState("");
  const [iconName, setIconName] = useState("Bot");
  const [color, setColor] = useState("#d4af37");

  const filtered = AI_TOOL_SUGGESTIONS.filter(t => {
    if (category !== "All" && t.category !== category) return false;
    if (search && !t.label.toLowerCase().includes(search.toLowerCase()) && !t.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateFromSuggestion = (suggestion) => {
    setLabel(suggestion.label);
    setDesc(suggestion.desc);
    setIconName(suggestion.iconName);
    setColor(suggestion.color);
    setMode("create");
  };

  const handleSave = () => {
    if (!label.trim()) return;
    const newTool = {
      id: `custom_${Date.now()}`,
      label: label.trim(),
      desc: desc.trim(),
      iconName,
      color,
    };
    onSave(newTool);
    setLabel("");
    setDesc("");
    setMode("browse");
  };

  const handleAiRecommend = async () => {
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the AI tool recommender for XPS Intelligence — a sales/CRM platform for flooring contractors. Given the existing tools (leads, CRM, proposals, bid center, research, connectors, agents, workflows, scheduler, analytics, media hub, knowledge base, competitor monitoring), suggest 5 NEW high-value tools we should add. For each: name (2-3 words), description (under 15 words), and category (Revenue, AI, Data, Operations, or Marketing). Focus on tools that directly increase revenue or agent capability.`,
        response_json_schema: {
          type: "object",
          properties: {
            tools: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                },
              },
            },
          },
        },
      });
      setAiSuggestions(res.tools || []);
    } catch {
      setAiSuggestions([]);
    }
    setAiLoading(false);
  };

  const SelectedIcon = ICON_MAP[iconName] || ICON_MAP["Bot"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold metallic-gold">Tool Creator</h2>
          <p className="text-xs text-muted-foreground">Build unlimited custom tools or pick from AI recommendations</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        {[
          { id: "browse", label: "Browse 35+ Tools", icon: Search },
          { id: "create", label: "Create Custom", icon: Plus },
          { id: "ai", label: "AI Recommend", icon: Wand2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setMode(tab.id); if (tab.id === "ai" && aiSuggestions.length === 0) handleAiRecommend(); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              mode === tab.id ? "metallic-gold-bg text-background" : "glass-card text-foreground hover:border-primary/30"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Browse mode */}
      {mode === "browse" && (
        <>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search tools..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 h-8 text-xs glass-input"
            />
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all",
                    category === cat ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filtered.map((tool, i) => {
              const TIcon = ICON_MAP[tool.iconName] || ICON_MAP["Bot"];
              return (
                <button
                  key={i}
                  onClick={() => handleCreateFromSuggestion(tool)}
                  className="glass-card rounded-xl p-3 text-left hover:border-primary/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${tool.color}18` }}>
                    <TIcon className="w-4 h-4" style={{ color: tool.color }} />
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{tool.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tool.desc}</div>
                  <div className="text-[9px] text-primary/60 mt-1">{tool.category}</div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Create mode */}
      {mode === "create" && (
        <div className="glass-card rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <SelectedIcon className="w-6 h-6" style={{ color }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold metallic-gold">{label || "New Tool"}</div>
              <div className="text-[10px] text-muted-foreground">{desc || "Add a description..."}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Tool Name</label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Payment Processing" className="h-8 text-xs glass-input" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Description</label>
              <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this tool do?" className="h-8 text-xs glass-input" />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Palette className="w-3 h-3" /> Icon</label>
              <div className="grid grid-cols-7 gap-1.5">
                {ICON_OPTIONS.map(opt => {
                  const I = opt.icon;
                  return (
                    <button
                      key={opt.name}
                      onClick={() => setIconName(opt.name)}
                      className={cn("p-2 rounded-lg transition-all", iconName === opt.name ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-white/5")}
                    >
                      <I className="w-4 h-4 text-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Type className="w-3 h-3" /> Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn("w-7 h-7 rounded-lg transition-all", color === c ? "ring-2 ring-white scale-110" : "hover:scale-105")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={!label.trim()} className="metallic-gold-bg text-background text-xs">
              <Check className="w-3.5 h-3.5 mr-1" /> Create Tool
            </Button>
            <Button variant="outline" onClick={() => setMode("browse")} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {/* AI Recommend mode */}
      {mode === "ai" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 metallic-gold-icon" />
            <span className="text-xs font-bold text-foreground">AI-Generated Recommendations</span>
            <Button size="sm" variant="outline" onClick={handleAiRecommend} disabled={aiLoading} className="ml-auto text-[10px] h-7">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
              Regenerate
            </Button>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleCreateFromSuggestion({ label: s.name, desc: s.description, iconName: "Sparkles", color: COLOR_OPTIONS[i % COLOR_OPTIONS.length], category: s.category })}
                  className="glass-card rounded-xl p-3 text-left hover:border-primary/30 transition-all"
                >
                  <div className="text-xs font-bold text-foreground">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.description}</div>
                  <div className="text-[9px] text-primary/60 mt-1">{s.category}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">Click Regenerate to get AI suggestions</div>
          )}
        </div>
      )}
    </div>
  );
}