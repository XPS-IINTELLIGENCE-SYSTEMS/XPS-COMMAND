import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Loader2, Sparkles, CheckCircle2, AlertTriangle, Database, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const FOCUS_AREAS = [
  "Sales & Closing", "Technical Specifications", "Pricing & Quoting", "Competitor Intelligence",
  "Product Recommendations", "Industry Trends", "Government Contracts", "Training & Certification",
  "Installation Methods", "Surface Preparation", "Customer Service"
];

const KNOWLEDGE_CATEGORIES = [
  "Product Info", "Pricing", "Technical Spec", "Market Data", "Industry News",
  "Competitor Intel", "AI Technology", "Government Regulation", "Training Material",
  "Financial Data", "Case Study", "Custom"
];

export default function BuildLLMModule() {
  const [agentName, setAgentName] = useState("XPS Intelligence Agent");
  const [personality, setPersonality] = useState("Professional, knowledgeable, proactive sales & operations expert for the flooring industry");
  const [focusAreas, setFocusAreas] = useState(["Sales & Closing", "Technical Specifications", "Pricing & Quoting"]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [knowledgeStats, setKnowledgeStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setStatsLoading(true);
    const entries = await base44.entities.KnowledgeEntry.list("-created_date", 500);
    const cats = {};
    entries.forEach(e => { cats[e.category] = (cats[e.category] || 0) + 1; });
    setKnowledgeStats({
      total: entries.length,
      categories: cats,
      competitor: entries.filter(e => e.is_competitor_intel).length,
      pricing: entries.filter(e => e.is_pricing_data).length,
      technical: entries.filter(e => e.is_technical_spec).length,
      highPriority: entries.filter(e => e.is_high_priority).length,
    });
    setStatsLoading(false);
  };

  const toggleFocus = (f) => setFocusAreas(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const toggleCategory = (c) => setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const buildLLM = async () => {
    if (!knowledgeStats || knowledgeStats.total === 0) {
      toast({ title: "No knowledge entries found", description: "Scrape some data first using the URL & Keyword Scraper" });
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke("buildCustomLLM", {
      agent_name: agentName,
      personality,
      focus_areas: focusAreas,
      include_categories: selectedCategories
    });
    setResult(res.data);
    setLoading(false);
    toast({ title: "Custom LLM Built!", description: `Compiled ${res.data?.entries_compiled} knowledge entries` });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">Build Custom LLM</h2>
          <p className="text-xs text-muted-foreground">Compile your knowledge bank into a custom-trained AI agent brain</p>
        </div>
      </div>

      {/* Knowledge Bank Stats */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Knowledge Bank Status</span>
          <button onClick={loadStats} className="ml-auto text-[10px] text-primary hover:underline">Refresh</button>
        </div>
        {statsLoading ? (
          <div className="flex items-center gap-2 py-4 justify-center"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
        ) : knowledgeStats?.total === 0 ? (
          <div className="flex items-center gap-2 py-4 text-center">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">No knowledge entries yet. Use the URL & Keyword Scraper first.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <StatBox label="Total Entries" value={knowledgeStats.total} icon={BookOpen} />
              <StatBox label="Competitor Intel" value={knowledgeStats.competitor} icon={Zap} />
              <StatBox label="Pricing Data" value={knowledgeStats.pricing} icon={Database} />
              <StatBox label="Technical Specs" value={knowledgeStats.technical} icon={Sparkles} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(knowledgeStats.categories).map(([cat, count]) => (
                <span key={cat} className="px-2 py-0.5 rounded-full text-[9px] bg-secondary text-muted-foreground">
                  {cat}: {count}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Configuration */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Agent Name</label>
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Agent Personality</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Focus Areas</label>
          <div className="flex gap-1.5 flex-wrap">
            {FOCUS_AREAS.map(f => (
              <button key={f} onClick={() => toggleFocus(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  focusAreas.includes(f) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Include Knowledge Categories <span className="normal-case font-normal">(empty = all)</span></label>
          <div className="flex gap-1.5 flex-wrap">
            {KNOWLEDGE_CATEGORIES.map(c => (
              <button key={c} onClick={() => toggleCategory(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  selectedCategories.includes(c) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <Button onClick={buildLLM} disabled={loading || (knowledgeStats?.total || 0) === 0} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          {loading ? "Compiling knowledge into custom LLM..." : "Build Custom LLM Agent"}
        </Button>
        <p className="text-[9px] text-muted-foreground text-center mt-2">Uses Claude Sonnet for high-quality agent compilation (higher credit usage)</p>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold text-foreground">Custom LLM Built Successfully</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatBox label="Entries Compiled" value={result.entries_compiled} icon={Database} />
            <StatBox label="Prompt Length" value={`${Math.round(result.system_prompt_length / 1000)}K chars`} icon={BookOpen} />
            <StatBox label="Accuracy Est." value={`${result.estimated_accuracy}%`} icon={Sparkles} />
            <StatBox label="Capabilities" value={result.capabilities?.length || 0} icon={Zap} />
          </div>

          <div className="mb-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Knowledge Summary</span>
            <p className="text-xs text-foreground mt-1">{result.knowledge_summary}</p>
          </div>

          {result.capabilities?.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Agent Capabilities</span>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {result.capabilities.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg text-[10px] bg-primary/10 text-primary border border-primary/20">{c}</span>
                ))}
              </div>
            </div>
          )}

          {result.knowledge_gaps?.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Knowledge Gaps to Fill</span>
              <div className="space-y-1 mt-1">
                {result.knowledge_gaps.map((g, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-yellow-400">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="p-3 rounded-lg bg-card/50 border border-border text-center">
      <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
      <div className="text-lg font-extrabold text-foreground">{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  );
}