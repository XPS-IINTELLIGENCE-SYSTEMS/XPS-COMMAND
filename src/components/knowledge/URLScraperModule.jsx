import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Plus, X, Loader2, Search, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const CATEGORIES = [
  "Product Info", "Pricing", "Technical Spec", "Market Data", "Industry News",
  "Competitor Intel", "AI Technology", "Government Regulation", "Training Material", "Custom"
];

const DEPTH_OPTIONS = [
  { id: "standard", label: "Standard", desc: "Key facts, products, pricing" },
  { id: "deep", label: "Deep Dive", desc: "Every spec, data point, detail" },
  { id: "competitor", label: "Competitor Intel", desc: "Pricing, positioning, weaknesses" },
];

export default function URLScraperModule({ onComplete }) {
  const [urls, setUrls] = useState([""]);
  const [keywords, setKeywords] = useState([""]);
  const [category, setCategory] = useState("Product Info");
  const [depth, setDepth] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addUrl = () => setUrls(prev => [...prev, ""]);
  const removeUrl = (i) => setUrls(prev => prev.filter((_, idx) => idx !== i));
  const updateUrl = (i, val) => setUrls(prev => prev.map((u, idx) => idx === i ? val : u));

  const addKeyword = () => setKeywords(prev => [...prev, ""]);
  const removeKeyword = (i) => setKeywords(prev => prev.filter((_, idx) => idx !== i));
  const updateKeyword = (i, val) => setKeywords(prev => prev.map((k, idx) => idx === i ? val : k));

  const runScrape = async () => {
    const cleanUrls = urls.filter(u => u.trim());
    const cleanKeywords = keywords.filter(k => k.trim());
    if (cleanUrls.length === 0 && cleanKeywords.length === 0) {
      toast({ title: "Add at least one URL or keyword" });
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke("knowledgeBulkScraper", {
      urls: cleanUrls,
      keywords: cleanKeywords,
      category,
      scrape_depth: depth
    });
    setResult(res.data);
    setLoading(false);
    toast({ title: `Scraped ${res.data?.entries_created || 0} knowledge entries` });
    if (onComplete) onComplete();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">URL & Keyword Scraper</h2>
          <p className="text-xs text-muted-foreground">Input company URLs and industry keywords to build your knowledge bank</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 mb-4">
        {/* URLs */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Company & Industry URLs</label>
          <p className="text-[10px] text-muted-foreground mb-2">Add your companies' websites, competitor sites, industry resources, manufacturer pages</p>
          <div className="space-y-2">
            {urls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                {urls.length > 1 && (
                  <button onClick={() => removeUrl(i)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addUrl} className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> Add another URL
          </button>
        </div>

        {/* Keywords */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Industry Keywords & Phrases</label>
          <p className="text-[10px] text-muted-foreground mb-2">Add keywords to research across industry knowledge sites, trade publications, forums</p>
          <div className="space-y-2">
            {keywords.map((kw, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={kw}
                  onChange={(e) => updateKeyword(i, e.target.value)}
                  placeholder='e.g. "epoxy floor coating commercial pricing 2025"'
                  className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                {keywords.length > 1 && (
                  <button onClick={() => removeKeyword(i)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addKeyword} className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80">
            <Plus className="w-3 h-3" /> Add another keyword
          </button>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Knowledge Category</label>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  category === c ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Depth */}
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Scrape Depth</label>
          <div className="grid grid-cols-3 gap-2">
            {DEPTH_OPTIONS.map(d => (
              <button key={d.id} onClick={() => setDepth(d.id)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  depth === d.id ? "bg-primary/10 border-primary" : "border-border hover:border-primary/30"
                }`}>
                <div className="text-xs font-bold text-foreground">{d.label}</div>
                <div className="text-[10px] text-muted-foreground">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={runScrape} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Scraping & extracting knowledge..." : "Scrape & Build Knowledge"}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-foreground">{result.entries_created} Knowledge Entries Created</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{result.summary}</p>
          <div className="flex gap-4 text-xs text-muted-foreground mb-3">
            <span>Data Points: <span className="text-foreground font-semibold">{result.total_data_points}</span></span>
            <span>Sources: <span className="text-foreground font-semibold">{result.sources_analyzed}</span></span>
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {(result.entries || []).map((entry, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-card/50 border border-border">
                <div className="text-xs font-medium text-foreground">{entry.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{entry.category} · {entry.source_domain || "research"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}