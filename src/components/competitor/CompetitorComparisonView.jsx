import { useState } from "react";
import { Swords, Loader2, RotateCcw, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import CompanyCard from "./CompanyCard";
import RecommendationsPanel from "./RecommendationsPanel";

export default function CompetitorComparisonView() {
  const [yourCompany, setYourCompany] = useState("Xtreme Polishing Systems");
  const [yourUrl, setYourUrl] = useState("https://xtremepolishingsystems.com");
  const [competitorCompany, setCompetitorCompany] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runComparison = async () => {
    if (!yourUrl.trim() || !competitorUrl.trim()) return;
    setLoading(true);
    setResults(null);
    const res = await base44.functions.invoke("competitorScrape", {
      your_url: yourUrl,
      competitor_url: competitorUrl,
      your_company: yourCompany,
      competitor_company: competitorCompany,
    });
    setResults(res.data);
    setLoading(false);
  };

  const reset = () => {
    setResults(null);
    setCompetitorCompany("");
    setCompetitorUrl("");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <Swords className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Competitor Comparison</h1>
          <p className="text-sm text-muted-foreground">Deep-scrape two companies and get a head-to-head analysis</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Company */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Your Company</span>
            </div>
            <input
              value={yourCompany}
              onChange={e => setYourCompany(e.target.value)}
              placeholder="Your company name"
              className="w-full h-10 px-4 mb-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={yourUrl}
                onChange={e => setYourUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Competitor */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Competitor</span>
            </div>
            <input
              value={competitorCompany}
              onChange={e => setCompetitorCompany(e.target.value)}
              placeholder="Competitor company name"
              className="w-full h-10 px-4 mb-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={competitorUrl}
                onChange={e => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
                className="w-full h-10 pl-10 pr-4 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* VS divider on mobile */}
        <div className="flex items-center justify-center my-4 md:hidden">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-black text-muted-foreground">VS</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={runComparison}
            disabled={loading || !yourUrl.trim() || !competitorUrl.trim()}
            className="flex-1 h-12 text-base font-bold metallic-gold-bg text-background gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
            {loading ? "Analyzing Both Companies..." : "Run Comparison Analysis"}
          </Button>
          {results && (
            <Button variant="outline" onClick={reset} className="h-12 gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Deep-scraping both companies...</p>
            <p className="text-xs text-muted-foreground mt-1">Analyzing products, pricing, reviews, and reputation</p>
          </div>
        </div>
      )}

      {/* Results - Side by Side */}
      {results && !loading && (
        <>
          {/* VS Header */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 bg-primary/20" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary">{results.your_company?.company_name || yourCompany}</span>
              <div className="w-10 h-10 rounded-full metallic-gold-bg flex items-center justify-center shadow-lg">
                <span className="text-xs font-black text-background">VS</span>
              </div>
              <span className="text-sm font-bold text-red-400">{results.competitor?.company_name || competitorCompany}</span>
            </div>
            <div className="h-px flex-1 bg-red-500/20" />
          </div>

          {/* Side by Side Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyCard data={results.your_company} label="Your Company" accentColor="gold" />
            <CompanyCard data={results.competitor} label="Competitor" accentColor="red" />
          </div>

          {/* Recommendations */}
          <RecommendationsPanel data={results.recommendations} />
        </>
      )}
    </div>
  );
}