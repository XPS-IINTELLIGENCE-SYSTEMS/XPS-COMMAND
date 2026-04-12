import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Radar, Loader2, Globe, Search, ChevronDown, ChevronRight, ExternalLink, Copy, Trash2, Database, Eye, Tag, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

const CATEGORIES = [
  "Company Research", "Competitor Intel", "Market Analysis",
  "Lead Research", "Industry News", "Pricing Intel", "Technology", "Custom"
];

function ResultCard({ result, onDelete, expanded, onToggle }) {
  let keyData = {};
  try { keyData = JSON.parse(result.key_data_points || "{}"); } catch {}

  return (
    <div className="border border-border rounded-xl bg-card/40 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/30 transition-all">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
          result.status === "Complete" ? "bg-green-500" :
          result.status === "Failed" ? "bg-red-500" :
          "bg-yellow-500 animate-pulse"
        )} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{result.title || result.query}</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
            <span>{result.category}</span>
            <span>·</span>
            <span>{moment(result.created_date).fromNow()}</span>
            {result.source_url && (
              <>
                <span>·</span>
                <a href={result.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="w-2.5 h-2.5" /> source
                </a>
              </>
            )}
          </div>
        </div>
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full",
          result.status === "Complete" ? "bg-green-500/10 text-green-500" :
          result.status === "Failed" ? "bg-red-500/10 text-red-500" :
          "bg-yellow-500/10 text-yellow-500"
        )}>{result.status}</span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* AI Summary */}
          {result.ai_summary && (
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">AI Summary</h4>
              <p className="text-xs text-foreground/80 leading-relaxed">{result.ai_summary}</p>
            </div>
          )}

          {/* Insights */}
          {result.ai_insights && (
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">Deep Insights</h4>
              <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{result.ai_insights}</p>
            </div>
          )}

          {/* Key Data Points */}
          {keyData.key_facts?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Key Facts</h4>
              <ul className="space-y-1">
                {keyData.key_facts.map((fact, i) => (
                  <li key={i} className="text-[11px] text-foreground/70 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">▸</span> {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contacts */}
          {keyData.contacts_found?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Contacts Found</h4>
              <div className="space-y-1.5">
                {keyData.contacts_found.map((c, i) => (
                  <div key={i} className="text-[11px] text-foreground/70 bg-secondary/30 rounded-lg px-2.5 py-1.5">
                    <span className="font-semibold">{c.name}</span>
                    {c.title && <span className="text-muted-foreground"> — {c.title}</span>}
                    {c.email && <span className="block text-primary">{c.email}</span>}
                    {c.phone && <span className="block text-muted-foreground">{c.phone}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {keyData.opportunities?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1.5">Opportunities</h4>
              <ul className="space-y-1">
                {keyData.opportunities.map((opp, i) => (
                  <li key={i} className="text-[11px] text-foreground/70 flex items-start gap-1.5">
                    <Zap className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" /> {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {result.tags && (
            <div className="flex flex-wrap gap-1.5">
              {result.tags.split(",").map((tag, i) => (
                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground border border-border">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Raw Content */}
          {result.raw_content && (
            <details className="group">
              <summary className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground">
                Raw Content ▾
              </summary>
              <pre className="mt-2 text-[10px] text-muted-foreground bg-black/20 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                {result.raw_content}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary/50"
            >
              <Copy className="w-3 h-3" /> Copy JSON
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(result.ai_summary + "\n\n" + result.ai_insights)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary/50"
            >
              <Copy className="w-3 h-3" /> Copy Report
            </button>
            <button
              onClick={() => onDelete(result.id)}
              className="flex items-center gap-1 text-[10px] text-destructive/70 hover:text-destructive px-2 py-1 rounded-md hover:bg-destructive/10 ml-auto"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShadowScraper() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Company Research");
  const [deepAnalysis, setDeepAnalysis] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [mode, setMode] = useState("single"); // single, bulk

  // Load history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const data = await base44.entities.ResearchResult.list("-created_date", 50);
    setResults(data);
    setLoadingHistory(false);
  };

  const runScrape = async () => {
    if ((!query.trim() && !url.trim()) || loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("webResearch", {
        query: query || undefined,
        url: url || undefined,
        category,
        deep_analysis: deepAnalysis,
      });
      // Refresh results
      await loadHistory();
      setExpandedId(null);
      // Expand the newest one
      setTimeout(async () => {
        const fresh = await base44.entities.ResearchResult.list("-created_date", 1);
        if (fresh.length) setExpandedId(fresh[0].id);
      }, 500);
    } catch (err) {
      alert("Scrape failed: " + err.message);
    } finally {
      setLoading(false);
      setQuery("");
      setUrl("");
    }
  };

  const runBulkScrape = async () => {
    const urls = query.split("\n").filter(u => u.trim());
    if (!urls.length || loading) return;
    setLoading(true);
    for (const line of urls) {
      try {
        await base44.functions.invoke("webResearch", {
          query: line.trim(),
          url: line.trim().startsWith("http") ? line.trim() : undefined,
          category,
          deep_analysis: deepAnalysis,
        });
      } catch {}
    }
    await loadHistory();
    setLoading(false);
    setQuery("");
  };

  const handleDelete = async (id) => {
    await base44.entities.ResearchResult.delete(id);
    setResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 metallic-gold-icon" />
            <span className="text-sm font-bold text-foreground">Shadow Scraper</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">INTEL</span>
          </div>
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
            <button onClick={() => setMode("single")} className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md transition-all", mode === "single" ? "bg-primary/15 text-primary" : "text-muted-foreground")}>Single</button>
            <button onClick={() => setMode("bulk")} className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md transition-all", mode === "bulk" ? "bg-primary/15 text-primary" : "text-muted-foreground")}>Bulk</button>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          {mode === "single" ? (
            <div className="flex gap-2">
              <div className="flex-1 space-y-1.5">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Target URL (optional)..."
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runScrape()}
                  placeholder="Search query (company, topic, keyword)..."
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                />
              </div>
              <button onClick={runScrape} disabled={loading || (!query.trim() && !url.trim())} className="px-4 rounded-xl metallic-gold-bg text-background text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 self-end h-[34px]">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Scrape
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="One URL or query per line..."
                rows={3}
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none font-mono"
              />
              <button onClick={runBulkScrape} disabled={loading || !query.trim()} className="px-4 rounded-xl metallic-gold-bg text-background text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 self-end h-[34px]">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Bulk
              </button>
            </div>
          )}

          {/* Options Row */}
          <div className="flex items-center gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-[10px] text-foreground focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={deepAnalysis} onChange={(e) => setDeepAnalysis(e.target.checked)} className="rounded" />
              Deep Analysis
            </label>
            <span className="text-[10px] text-muted-foreground ml-auto">
              <Database className="w-3 h-3 inline mr-0.5" /> {results.length} results
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div>
              <div className="text-xs font-bold text-foreground">Scraping in progress...</div>
              <div className="text-[10px] text-muted-foreground">Gathering data → AI analysis → Deep insights</div>
            </div>
          </div>
        )}

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Radar className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm font-medium">No scrape results yet</p>
            <p className="text-xs mt-1">Enter a URL or query above to begin intelligence gathering</p>
          </div>
        ) : (
          results.map(r => (
            <ResultCard
              key={r.id}
              result={r}
              expanded={expandedId === r.id}
              onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}