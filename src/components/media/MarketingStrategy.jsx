import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Loader2, Sparkles, Globe, Target, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const STRATEGY_TYPES = [
  { id: "full_plan", label: "Full Marketing Plan", icon: BarChart3 },
  { id: "sales_strategy", label: "Sales Strategy", icon: DollarSign },
  { id: "website_mockup", label: "Website Ideas", icon: Globe },
  { id: "branding_audit", label: "Brand Audit", icon: Target },
];

export default function MarketingStrategy() {
  const [strategyType, setStrategyType] = useState("full_plan");
  const [companyName, setCompanyName] = useState("Xtreme Polishing Systems");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mockups, setMockups] = useState([]);
  const [mockupLoading, setMockupLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setResult(null);

    const prompts = {
      full_plan: `Create a comprehensive digital marketing plan for ${companyName} (commercial flooring company). ${context}
Include: target audience analysis, channel strategy, content calendar framework, budget allocation, KPIs, lead generation tactics, SEO strategy, paid ad recommendations, email marketing flows, and 90-day action plan.`,
      sales_strategy: `Create a sales strategy and playbook for ${companyName}. ${context}
Include: ideal customer profiles, sales funnel stages, outreach sequences, objection handling, pricing strategy, upsell/cross-sell recommendations, referral program design, and CRM workflow automation.`,
      website_mockup: `Create detailed website design recommendations for ${companyName}. ${context}
Include: 3 different homepage concepts (describe layout, hero section, CTAs, color scheme), essential pages, SEO structure, conversion optimization tips, mobile experience, and competitive website analysis.`,
      branding_audit: `Perform a brand audit and provide recommendations for ${companyName}. ${context}
Include: brand positioning analysis, visual identity assessment, messaging framework, brand voice guide, competitive differentiation, recommended brand assets to create, and brand refresh roadmap.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[strategyType],
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          executive_summary: { type: "string" },
          sections: { type: "array", items: { type: "object", properties: { heading: { type: "string" }, content: { type: "string" }, action_items: { type: "array", items: { type: "string" } }, priority: { type: "string" } } } },
          recommended_tools: { type: "array", items: { type: "string" } },
          budget_estimate: { type: "string" },
          timeline: { type: "string" },
          kpis: { type: "array", items: { type: "string" } },
          quick_wins: { type: "array", items: { type: "string" } }
        }
      }
    });
    setResult(res);
    setLoading(false);
    toast({ title: "Strategy generated!" });
  };

  const generateMockups = async () => {
    setMockupLoading(true);
    const promises = [1, 2, 3].map(async (v) => {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Professional website mockup variant ${v} for "${companyName}" - commercial flooring company. ${v === 1 ? "Dark luxury theme with gold accents, full-width hero image of stunning epoxy floor" : v === 2 ? "Clean white modern design with bold typography and before/after gallery" : "Industrial bold design with video hero section and concrete textures"}. Desktop browser frame, realistic web design mockup, modern UI/UX.`
      });
      return { url: res.url, variant: v };
    });
    setMockups(await Promise.all(promises));
    setMockupLoading(false);
    toast({ title: "3 website mockups generated!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">AI Marketing & Strategy</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STRATEGY_TYPES.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setStrategyType(t.id)}
              className={`p-3 rounded-xl border text-center transition-all ${strategyType === t.id ? "border-primary bg-primary/10" : "border-border"}`}>
              <Icon className={`w-4 h-4 mx-auto mb-1 ${strategyType === t.id ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-[10px] font-medium text-foreground">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="text-sm" />
        <textarea value={context} onChange={e => setContext(e.target.value)} rows={2}
          placeholder="Additional context... e.g. 'Focus on warehouse/industrial clients in Southeast US'"
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground resize-none focus:outline-none focus:border-primary" />
        <Button onClick={generate} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Strategy
        </Button>
        {strategyType === "website_mockup" && (
          <Button variant="outline" onClick={generateMockups} disabled={mockupLoading} className="w-full gap-2">
            {mockupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Generate 3 Website Mockup Images
          </Button>
        )}
      </div>

      {/* Website mockups */}
      {mockups.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mockups.map((m, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-border">
              <img src={m.url} alt={`Mockup ${i + 1}`} className="w-full aspect-video object-cover" />
              <div className="p-2 bg-card"><p className="text-[10px] text-foreground font-medium">Concept {i + 1}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Strategy results */}
      {result && (
        <div className="space-y-3">
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-bold text-foreground">{result.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{result.executive_summary}</p>
          </div>

          {/* Quick wins */}
          {result.quick_wins?.length > 0 && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
              <label className="text-[10px] font-semibold text-green-400 uppercase">Quick Wins</label>
              <ul className="mt-1 space-y-1">
                {result.quick_wins.map((w, i) => <li key={i} className="text-xs text-foreground flex items-start gap-2"><span className="text-green-400">✓</span> {w}</li>)}
              </ul>
            </div>
          )}

          {/* Sections */}
          {result.sections?.map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">{s.heading}</h4>
                {s.priority && <span className={`text-[9px] px-2 py-0.5 rounded-full ${s.priority === "high" ? "bg-red-500/10 text-red-400" : s.priority === "medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-blue-500/10 text-blue-400"}`}>{s.priority}</span>}
              </div>
              <p className="text-xs text-foreground/70 whitespace-pre-wrap">{s.content}</p>
              {s.action_items?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {s.action_items.map((a, j) => <p key={j} className="text-[10px] text-primary flex items-start gap-1"><Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" /> {a}</p>)}
                </div>
              )}
            </div>
          ))}

          {/* KPIs & budget */}
          <div className="grid grid-cols-2 gap-3">
            {result.kpis?.length > 0 && (
              <div className="p-3 rounded-xl bg-card/50 border border-border">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">KPIs to Track</label>
                <ul className="mt-1 space-y-0.5">
                  {result.kpis.map((k, i) => <li key={i} className="text-[10px] text-foreground">{k}</li>)}
                </ul>
              </div>
            )}
            <div className="p-3 rounded-xl bg-card/50 border border-border space-y-2">
              {result.budget_estimate && <div><label className="text-[10px] font-semibold text-muted-foreground uppercase">Budget</label><p className="text-xs text-foreground">{result.budget_estimate}</p></div>}
              {result.timeline && <div><label className="text-[10px] font-semibold text-muted-foreground uppercase">Timeline</label><p className="text-xs text-foreground">{result.timeline}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}