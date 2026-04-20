import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, Loader2, Play, Plus, Trash2, Globe, Clock, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const SCRAPE_MODES = [
  { id: "deep_profile", label: "Deep Profile", desc: "Full business intel from URL" },
  { id: "pricing_monitor", label: "Pricing Monitor", desc: "Extract pricing & service data" },
  { id: "contact_harvest", label: "Contact Harvest", desc: "Find emails, phones, names" },
  { id: "content_mirror", label: "Content Mirror", desc: "Mirror page content & structure" },
  { id: "social_intel", label: "Social Intel", desc: "Social media presence scan" },
];

export default function ShadowScraperPanel() {
  const [targets, setTargets] = useState([{ url: "", mode: "deep_profile" }]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState("");
  const [batchScrapeMode, setBatchScrapeMode] = useState("deep_profile");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);

  const addTarget = () => setTargets(prev => [...prev, { url: "", mode: "deep_profile" }]);
  const removeTarget = (idx) => setTargets(prev => prev.filter((_, i) => i !== idx));
  const updateTarget = (idx, field, val) => setTargets(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));

  const runScrape = async () => {
    const scrapeTargets = batchMode
      ? batchUrls.split("\n").filter(u => u.trim()).map(url => ({ url: url.trim(), mode: batchScrapeMode }))
      : targets.filter(t => t.url.trim());

    if (!scrapeTargets.length) return;
    setRunning(true);
    setResults([]);

    const scrapeResults = [];
    for (const target of scrapeTargets) {
      const startTime = Date.now();
      const modeLabel = SCRAPE_MODES.find(m => m.id === target.mode)?.label || target.mode;

      let prompt = "";
      if (target.mode === "deep_profile") {
        prompt = `Deeply research this company/website: ${target.url}. Extract: company name, industry, services offered, pricing signals, team size, locations, key contacts, technology stack, recent news, social media profiles, competitive positioning. Be thorough.`;
      } else if (target.mode === "pricing_monitor") {
        prompt = `Analyze the pricing and services at: ${target.url}. Extract: all pricing tiers, per-unit costs, package deals, discounts, service descriptions, payment terms, hidden fees, competitor price comparisons.`;
      } else if (target.mode === "contact_harvest") {
        prompt = `Find all contact information from: ${target.url}. Extract: email addresses, phone numbers, contact names, titles, departments, office locations, social profiles, contact forms. List every contact found.`;
      } else if (target.mode === "content_mirror") {
        prompt = `Analyze the full content structure of: ${target.url}. Extract: all page headings, key messaging, value propositions, testimonials, case studies, blog topics, FAQ content, imagery descriptions, CTA language, SEO keywords used.`;
      } else if (target.mode === "social_intel") {
        prompt = `Research the social media presence for: ${target.url}. Extract: all social profiles (LinkedIn, Instagram, Facebook, Twitter, YouTube, TikTok), follower counts, posting frequency, top performing content, engagement rates, ad activity, influencer partnerships.`;
      }

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            company_name: { type: "string" },
            summary: { type: "string" },
            data_points: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" }, confidence: { type: "string" } } } },
            contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, email: { type: "string" }, phone: { type: "string" } } } },
            insights: { type: "array", items: { type: "string" } },
            raw_intel: { type: "string" }
          }
        }
      });

      const elapsed = Date.now() - startTime;
      scrapeResults.push({ url: target.url, mode: modeLabel, data: res, elapsed, status: "success" });

      // Save to IntelRecord
      await base44.entities.IntelRecord.create({
        title: `Shadow Scrape: ${res.company_name || target.url}`,
        category: target.mode === "pricing_monitor" ? "pricing" : target.mode === "social_intel" ? "social_media" : "website",
        source_company: "Custom",
        source_url: target.url,
        source_type: "scraper",
        summary: res.summary || "",
        content: res.raw_intel || "",
        metadata: JSON.stringify(res),
        confidence_score: 80,
        is_indexed: true,
        scraped_at: new Date().toISOString()
      });
    }
    setResults(scrapeResults);
    setRunning(false);
    toast({ title: `${scrapeResults.length} target(s) scraped successfully!` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-bold text-foreground">Shadow Scraper</h3>
          <Badge variant="secondary" className="text-[9px]">Deep Web Intelligence</Badge>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setBatchMode(false)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium ${!batchMode ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"}`}>
            Single
          </button>
          <button onClick={() => setBatchMode(true)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium ${batchMode ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"}`}>
            Batch
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        {batchMode ? (
          <>
            <textarea value={batchUrls} onChange={e => setBatchUrls(e.target.value)} rows={5}
              placeholder="Paste URLs (one per line)&#10;https://competitor1.com&#10;https://competitor2.com&#10;https://target-company.com"
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground font-mono resize-none focus:outline-none focus:border-primary" />
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Scrape Mode (all targets)</label>
              <div className="flex gap-1.5 flex-wrap">
                {SCRAPE_MODES.map(m => (
                  <button key={m.id} onClick={() => setBatchScrapeMode(m.id)}
                    className={`px-2.5 py-1 rounded text-[10px] border ${batchScrapeMode === m.id ? "bg-red-500/15 text-red-400 border-red-500/30" : "text-muted-foreground border-border"}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {targets.map((target, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <Input value={target.url} onChange={e => updateTarget(idx, "url", e.target.value)}
                    placeholder="https://target-website.com" className="text-sm font-mono" />
                  <div className="flex gap-1 flex-wrap">
                    {SCRAPE_MODES.map(m => (
                      <button key={m.id} onClick={() => updateTarget(idx, "mode", m.id)}
                        className={`px-2 py-0.5 rounded text-[9px] border ${target.mode === m.id ? "bg-red-500/15 text-red-400 border-red-500/30" : "text-muted-foreground border-border"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                {targets.length > 1 && (
                  <button onClick={() => removeTarget(idx)} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addTarget} className="text-[10px] text-primary flex items-center gap-1 hover:underline">
              <Plus className="w-3 h-3" /> Add another target
            </button>
          </>
        )}

        <Button onClick={runScrape} disabled={running} className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Scraping..." : `Run Shadow Scrape (${batchMode ? batchUrls.split("\n").filter(u => u.trim()).length : targets.filter(t => t.url.trim()).length} target${targets.length > 1 ? "s" : ""})`}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Results ({results.length})</label>
          {results.map((r, i) => (
            <div key={i} className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-foreground">{r.data.company_name || r.url}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Badge variant="secondary" className="text-[9px]">{r.mode}</Badge>
                  <Clock className="w-3 h-3" /> {(r.elapsed / 1000).toFixed(1)}s
                </div>
              </div>

              {r.data.summary && (
                <p className="text-xs text-foreground">{r.data.summary}</p>
              )}

              {r.data.data_points?.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {r.data.data_points.slice(0, 10).map((dp, j) => (
                    <div key={j} className="p-2 rounded-lg bg-card border border-border">
                      <span className="text-[9px] text-muted-foreground uppercase">{dp.label}</span>
                      <p className="text-[11px] text-foreground font-medium">{dp.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {r.data.contacts?.length > 0 && (
                <div>
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase mb-1 block">Contacts Found</label>
                  <div className="space-y-1">
                    {r.data.contacts.map((c, j) => (
                      <div key={j} className="flex items-center gap-3 text-xs p-2 rounded bg-card/50 border border-border">
                        <span className="font-semibold text-foreground">{c.name}</span>
                        {c.title && <span className="text-muted-foreground">{c.title}</span>}
                        {c.email && <span className="text-primary font-mono text-[10px]">{c.email}</span>}
                        {c.phone && <span className="text-muted-foreground">{c.phone}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.data.insights?.length > 0 && (
                <div>
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase mb-1 block">Key Insights</label>
                  <ul className="space-y-0.5">
                    {r.data.insights.map((insight, j) => (
                      <li key={j} className="text-[11px] text-foreground flex items-start gap-1.5">
                        <Search className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}