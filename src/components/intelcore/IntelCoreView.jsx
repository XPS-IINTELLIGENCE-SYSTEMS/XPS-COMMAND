import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Database, Search, Loader2, RefreshCw, Zap, Building2, MapPin, DollarSign, Youtube, Hash, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IntelCoreStats from "./IntelCoreStats";
import IntelCoreScrapePanel from "./IntelCoreScrapePanel";
import IntelRecordCard from "./IntelRecordCard";

const TABS = [
  { id: "all", label: "All Intel", icon: Database },
  { id: "brands", label: "Brands", icon: Building2 },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "social", label: "Social & Video", icon: Youtube },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "keywords", label: "Keywords", icon: Hash },
];

export default function IntelCoreView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showScraper, setShowScraper] = useState(false);
  const [limit, setLimit] = useState(50);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.IntelRecord.list("-created_date", 500);
    setRecords(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = records;
    if (tab === "brands") list = list.filter(r => ["XPS","NCP","CPU","XPS Xpress","Epoxy Network","XPS Intelligence"].includes(r.source_company));
    else if (tab === "pricing") list = list.filter(r => r.category === "pricing" || r.pricing_data);
    else if (tab === "social") list = list.filter(r => ["social_media","youtube","video"].includes(r.category));
    else if (tab === "locations") list = list.filter(r => r.category === "location" || r.source_company === "XPS Location");
    else if (tab === "keywords") list = list.filter(r => ["keywords","seo"].includes(r.category));

    if (catFilter !== "all") list = list.filter(r => r.category === catFilter);

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(r => (r.title||"").toLowerCase().includes(s) || (r.content||"").toLowerCase().includes(s) || (r.tags||"").toLowerCase().includes(s) || (r.source_company||"").toLowerCase().includes(s) || (r.location_name||"").toLowerCase().includes(s));
    }

    return [...list].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === "confidence") return (b.confidence_score||0) - (a.confidence_score||0);
      return 0;
    });
  }, [records, tab, search, catFilter, sortBy]);

  const categories = [...new Set(records.map(r => r.category).filter(Boolean))].sort();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Brain className="w-7 h-7 metallic-gold-icon" />
          <div>
            <h2 className="text-xl font-extrabold metallic-gold">XPS Intel Core</h2>
            <p className="text-[10px] text-muted-foreground">
              Xtreme Polishing Systems master intelligence — {records.length} records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1.5" onClick={load} disabled={loading}>
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Reload
          </Button>
          <Button size="sm" onClick={() => setShowScraper(!showScraper)}
            className={`text-[10px] h-7 gap-1.5 ${showScraper ? "bg-primary/20 text-primary border border-primary/30" : "metallic-gold-bg text-background"}`}>
            <Zap className="w-3 h-3" /> {showScraper ? "Hide Scraper" : "Run Scraper"}
          </Button>
        </div>
      </div>

      {showScraper && <IntelCoreScrapePanel onComplete={load} />}

      <IntelCoreStats records={records} />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setLimit(50); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                tab === t.id ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search XPS intel..." className="h-8 text-xs pl-8" />
          </div>
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="h-8 w-36 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c.replace(/_/g," ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-28 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-xs">Newest</SelectItem>
            <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
            <SelectItem value="confidence" className="text-xs">Confidence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Showing {Math.min(limit, filtered.length)} of {filtered.length}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No XPS intel found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Run the scraper to build intelligence</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.slice(0, limit).map(r => <IntelRecordCard key={r.id} record={r} />)}
          {limit < filtered.length && (
            <button onClick={() => setLimit(l => l + 50)} className="w-full py-3 text-xs text-primary glass-card rounded-lg">
              <ChevronDown className="w-4 h-4 mx-auto mb-1" /> Load more ({filtered.length - limit} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}