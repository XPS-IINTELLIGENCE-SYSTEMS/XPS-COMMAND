import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Loader2, Search, ExternalLink, Sparkles, Save, Video, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const SEARCH_TYPES = [
  { id: "youtube", label: "YouTube Videos" },
  { id: "social_trends", label: "Social Trends" },
  { id: "competitor_content", label: "Competitor Content" },
  { id: "design_inspiration", label: "Design Inspiration" },
  { id: "viral_content", label: "Viral Content" },
];

export default function ContentScraper() {
  const [searchType, setSearchType] = useState("youtube");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const scrape = async () => {
    if (!query.trim()) return;
    setLoading(true);

    const prompts = {
      youtube: `Search for the most relevant and popular YouTube videos about: "${query}" in the flooring/construction/epoxy industry. Find 8-10 real videos with their titles, channels, view counts, and key takeaways. Also analyze what makes these videos successful and provide recommendations for creating better content.`,
      social_trends: `Research current social media trends related to: "${query}" for the flooring/epoxy/concrete industry. Find trending hashtags, popular content formats, viral posts, and engagement patterns. Include specific examples and actionable insights for Xtreme Polishing Systems.`,
      competitor_content: `Research competitor content and marketing for: "${query}" in the commercial flooring/epoxy industry. Find what competitors are posting, their best-performing content, messaging strategies, and visual approaches. Include specific examples and counter-strategies.`,
      design_inspiration: `Find design inspiration and references for: "${query}" related to flooring, epoxy, polished concrete, and commercial spaces. Include visual references, color palettes, layout ideas, and creative approaches from top brands.`,
      viral_content: `Find the most viral and engaging content related to: "${query}" in construction/flooring/home improvement. Analyze what makes it viral — hooks, formats, music, visual techniques. Provide 8-10 examples with engagement metrics and replication strategies.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: prompts[searchType],
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                source: { type: "string" },
                url: { type: "string" },
                description: { type: "string" },
                metrics: { type: "string" },
                key_takeaway: { type: "string" },
                relevance_score: { type: "number" }
              }
            }
          },
          analysis: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          trending_formats: { type: "array", items: { type: "string" } },
          content_gaps: { type: "string" }
        }
      }
    });
    setResults(res);
    setLoading(false);
    toast({ title: `Found ${res.results?.length || 0} results!` });
  };

  const saveInspiration = async (item) => {
    await base44.entities.MediaProject.create({
      name: `Inspiration: ${item.title}`,
      project_type: "Custom",
      assets: JSON.stringify([{ type: "reference", name: item.title, url: item.url, metadata: JSON.stringify(item), category: "Inspiration" }]),
      description: item.description,
      tags: searchType,
      status: "Draft"
    });
    toast({ title: "Saved to projects!" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Content Inspiration Scraper</h2>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {SEARCH_TYPES.map(t => (
          <button key={t.id} onClick={() => setSearchType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
              searchType === t.id ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"
            }`}>{t.label}</button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input value={query} onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${SEARCH_TYPES.find(t => t.id === searchType)?.label}... e.g. 'metallic epoxy floor transformation'`}
          className="text-sm" onKeyDown={e => e.key === 'Enter' && scrape()} />
        <Button onClick={scrape} disabled={loading || !query.trim()} className="gap-1 flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {results && (
        <div className="space-y-3">
          {/* Results list */}
          {results.results?.map((r, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {searchType === "youtube" ? <Video className="w-4 h-4 text-red-400 flex-shrink-0" /> : <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                    <h4 className="text-sm font-semibold text-foreground truncate">{r.title}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.source} {r.metrics && `· ${r.metrics}`}</p>
                  <p className="text-xs text-foreground/70 mt-1">{r.description}</p>
                  {r.key_takeaway && <p className="text-[10px] text-primary mt-1">💡 {r.key_takeaway}</p>}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/10">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  <button onClick={() => saveInspiration(r)} className="p-1.5 rounded hover:bg-white/10">
                    <Save className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Analysis */}
          {results.analysis && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
              <label className="text-[10px] font-semibold text-primary uppercase">Analysis</label>
              <p className="text-xs text-foreground mt-1">{results.analysis}</p>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations?.length > 0 && (
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Recommendations for XPS</label>
              <ul className="mt-1 space-y-1">
                {results.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2">
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content gaps */}
          {results.content_gaps && (
            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
              <label className="text-[10px] font-semibold text-yellow-400 uppercase">Content Gaps (Opportunity!)</label>
              <p className="text-xs text-foreground mt-1">{results.content_gaps}</p>
            </div>
          )}

          {/* Trending formats */}
          {results.trending_formats?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {results.trending_formats.map((f, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{f}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}