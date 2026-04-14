import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Brain, Search, Loader2, Plus, RefreshCw, ExternalLink,
  Star, Tag, Clock, Eye, Trash2, ChevronRight, X, BookOpen, Zap
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const CATEGORIES = [
  "All", "Product Info", "Pricing", "Technical Spec", "Market Data",
  "Industry News", "Competitor Intel", "AI Technology", "Government Regulation",
  "Financial Data", "Social Trend", "Case Study", "Training Material"
];

function EntryCard({ entry, onView }) {
  return (
    <button onClick={() => onView(entry)} className="w-full text-left glass-card rounded-xl p-3 hover:bg-white/[0.04] transition-all">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{entry.title}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{entry.summary || entry.content?.substring(0, 120)}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{entry.category}</span>
            {entry.is_pricing_data && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">Pricing</span>}
            {entry.is_competitor_intel && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">Competitor</span>}
            {entry.is_high_priority && <Star className="w-3 h-3 text-amber-400" />}
            <span className="text-[9px] text-muted-foreground/40 flex items-center gap-0.5">
              <Eye className="w-2.5 h-2.5" /> {entry.view_count || 0}
            </span>
            {entry.quality_score && (
              <span className="text-[9px] text-muted-foreground/40">Q:{entry.quality_score}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

function EntryDetail({ entry, onClose, onDelete }) {
  let keyFacts = [];
  try { keyFacts = JSON.parse(entry.key_facts || '[]'); } catch {}

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">{entry.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{entry.category}</span>
            <span className="text-[9px] text-muted-foreground">{entry.source_domain}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {entry.source_url && (
            <a href={entry.source_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><ExternalLink className="w-3 h-3" /></Button>
            </a>
          )}
          <Button size="sm" variant="ghost" onClick={() => onDelete(entry)} className="h-6 w-6 p-0"><Trash2 className="w-3 h-3 text-red-400" /></Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-6 w-6 p-0"><X className="w-3 h-3" /></Button>
        </div>
      </div>

      {entry.summary && (
        <div className="text-xs text-foreground/70 bg-white/[0.03] rounded-lg p-2.5">{entry.summary}</div>
      )}

      {keyFacts.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Key Facts</div>
          <ul className="space-y-1">
            {keyFacts.map((f, i) => (
              <li key={i} className="text-xs text-foreground/60 flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.tags && (
        <div className="flex items-center gap-1 flex-wrap">
          <Tag className="w-3 h-3 text-muted-foreground/40" />
          {entry.tags.split(',').map((t, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-muted-foreground">{t.trim()}</span>
          ))}
        </div>
      )}

      <div className="text-[9px] text-muted-foreground/40 flex items-center gap-3">
        <span>Quality: {entry.quality_score || 0}/100</span>
        <span>Views: {entry.view_count || 0}</span>
        {entry.ingested_date && <span>Ingested: {new Date(entry.ingested_date).toLocaleDateString()}</span>}
      </div>

      {entry.content && (
        <div className="max-h-60 overflow-y-auto text-xs text-foreground/50 bg-white/[0.02] rounded-lg p-3 whitespace-pre-wrap">
          {entry.content.substring(0, 5000)}
        </div>
      )}
    </div>
  );
}

export default function KnowledgeAdminPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.KnowledgeEntry.list('-created_date', 200);
    setEntries(data);
    try {
      const s = await base44.functions.invoke('knowledgeSearch', { action: 'stats' });
      setStats(s.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await base44.functions.invoke('knowledgeSearch', { action: 'search', query: searchQuery, limit: 15 });
      setSearchResults(res.data);
    } catch (err) {
      toast({ title: "Search error", description: err.message, variant: "destructive" });
    }
    setSearching(false);
  };

  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const res = await base44.functions.invoke('knowledgeScraper', { action: 'scrape_url', url: scrapeUrl });
      toast({ title: "Scrape Complete", description: `Scraped: ${res.data?.result?.title || scrapeUrl}` });
      setScrapeUrl("");
      load();
    } catch (err) {
      toast({ title: "Scrape Failed", description: err.message, variant: "destructive" });
    }
    setScraping(false);
  };

  const handleDelete = async (entry) => {
    await base44.entities.KnowledgeEntry.delete(entry.id);
    setSelectedEntry(null);
    load();
  };

  const filtered = activeCategory === "All"
    ? entries
    : entries.filter(e => e.category === activeCategory);

  const displayEntries = searchResults ? searchResults.results : filtered;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 metallic-gold-icon" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Knowledge Engine</h3>
            <p className="text-[10px] text-muted-foreground">
              {stats ? `${stats.total_entries} entries · ${stats.unique_sources} sources · ${stats.total_words?.toLocaleString()} words` : 'Loading...'}
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={load} className="h-7 w-7 p-0">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search knowledge base..."
          className="h-8 bg-transparent text-sm flex-1"
        />
        <Button size="sm" onClick={handleSearch} disabled={searching} className="h-8 gap-1 text-[10px]">
          {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          Search
        </Button>
      </div>

      {/* Search result summary */}
      {searchResults && (
        <div className="glass-card rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-foreground">{searchResults.total} results</span>
            <button onClick={() => setSearchResults(null)} className="text-[10px] text-primary">Clear</button>
          </div>
          {searchResults.answer_summary && (
            <p className="text-xs text-foreground/70">{searchResults.answer_summary}</p>
          )}
          {searchResults.confidence && (
            <span className="text-[9px] text-muted-foreground">Confidence: {searchResults.confidence}%</span>
          )}
        </div>
      )}

      {/* Manual scrape */}
      <div className="flex gap-2">
        <Input
          value={scrapeUrl}
          onChange={(e) => setScrapeUrl(e.target.value)}
          placeholder="Paste URL to scrape..."
          className="h-8 bg-transparent text-sm font-mono flex-1"
        />
        <Button size="sm" onClick={handleScrapeUrl} disabled={scraping} className="h-8 gap-1 text-[10px]">
          {scraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Scrape
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchResults(null); }}
            className={cn(
              "text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all",
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-white/[0.05] text-muted-foreground hover:bg-white/[0.08]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : selectedEntry ? (
        <EntryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} onDelete={handleDelete} />
      ) : displayEntries.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No knowledge entries yet</p>
          <p className="text-xs text-muted-foreground/50">Scrape a URL or run the scheduled scrapers</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
          {displayEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onView={setSelectedEntry} />
          ))}
        </div>
      )}

      {/* Stats footer */}
      {stats && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.04]">
          <div className="text-center">
            <div className="text-lg font-black text-foreground">{stats.competitor_entries || 0}</div>
            <div className="text-[9px] text-muted-foreground">Competitor</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-foreground">{stats.pricing_entries || 0}</div>
            <div className="text-[9px] text-muted-foreground">Pricing</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-foreground">{stats.tech_spec_entries || 0}</div>
            <div className="text-[9px] text-muted-foreground">Tech Specs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-foreground">{stats.high_priority_count || 0}</div>
            <div className="text-[9px] text-muted-foreground">High Priority</div>
          </div>
        </div>
      )}
    </div>
  );
}