import { useState } from "react";
import { Globe, Search, Sparkles, Loader2, ChevronDown, ArrowRight, Building2, Swords, TrendingUp, MapPin, DollarSign, Newspaper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";

const presets = [
  { label: "Epoxy flooring competitors Florida", icon: Swords, category: "Competitor Intel" },
  { label: "Commercial floor coating market size 2025", icon: TrendingUp, category: "Market Analysis" },
  { label: "New warehouse construction permits Tampa Bay", icon: Building2, category: "Lead Research" },
  { label: "Industrial flooring pricing trends", icon: DollarSign, category: "Pricing Intel" },
  { label: "Epoxy flooring industry news", icon: Newspaper, category: "Industry News" },
  { label: "New commercial real estate developments Florida", icon: MapPin, category: "Lead Research" },
];

export default function ResearchBrowser({ onComplete }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runResearch = async (searchQuery, category) => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setResult(null);
    setError(null);

    const isUrl = searchQuery.startsWith("http://") || searchQuery.startsWith("https://");

    const response = await base44.functions.invoke("webResearch", {
      query: isUrl ? undefined : searchQuery,
      url: isUrl ? searchQuery : undefined,
      category: category || "Custom",
      deep_analysis: true,
    });

    if (response.data?.error) {
      setError(response.data.error);
    } else {
      setResult(response.data);
      onComplete?.(response.data);
    }
    setSearching(false);
  };

  const handlePreset = (preset) => {
    setQuery(preset.label);
    setShowPresets(false);
    runResearch(preset.label, preset.category);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runResearch(query);
  };

  return (
    <div className="border-b border-border">
      {/* Browser bar */}
      <div className="px-3 md:px-6 pt-3 md:pt-5 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Web Research Browser</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => !query && setShowPresets(true)}
              placeholder="Enter keywords, company name, or paste a URL..."
              className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              disabled={searching}
            />
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary"
            >
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showPresets && "rotate-180")} />
            </button>
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 disabled:opacity-50 active:scale-[0.97] transition-transform"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {searching ? "Researching..." : "Research"}
          </button>
        </form>

        {/* Preset dropdown */}
        {showPresets && !searching && (
          <div className="mt-2 bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Suggested Searches</div>
            {presets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground">{preset.label}</div>
                    <div className="text-xs text-muted-foreground">{preset.category}</div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}

        {/* Searching indicator */}
        {searching && (
          <div className="mt-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-foreground">AI is researching...</div>
              <div className="text-sm text-muted-foreground">Scraping web data → Extracting facts → Generating deep insights</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
            <div className="text-sm text-destructive font-medium">Research failed</div>
            <div className="text-sm text-destructive/80 mt-0.5">{error}</div>
          </div>
        )}

        {/* Inline result preview */}
        {result && !searching && (
          <div className="mt-3 bg-card border border-primary/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{result.title}</span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{result.summary}</p>
            {result.key_data?.opportunities?.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Opportunities</div>
                <div className="space-y-1">
                  {result.key_data.opportunities.slice(0, 3).map((opp, i) => (
                    <div key={i} className="text-sm text-foreground/70 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span> {opp}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {result.tags?.split(", ").filter(Boolean).slice(0, 5).map((tag) => (
                <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}