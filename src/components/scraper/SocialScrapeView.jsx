import { useState } from "react";
import { Share2, Loader2, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function SocialScrapeView() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Research social media presence for: "${query}"
Platform focus: ${platform}
Find: social profiles, follower counts, recent posts, engagement rates, content themes, brand sentiment.
Provide actionable intelligence for a flooring/epoxy sales team.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          profiles: { type: "array", items: { type: "object", properties: {
            platform: { type: "string" }, handle: { type: "string" }, followers: { type: "string" }, engagement: { type: "string" }, notes: { type: "string" }
          }}},
          summary: { type: "string" },
          opportunities: { type: "string" }
        }
      }
    });
    setResults(res);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Social Media Scraper</h1>
      <p className="text-sm text-muted-foreground mb-6">Research social media presence for companies or competitors</p>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Company name, competitor, or topic..."
            className="flex-1 h-10 px-4 bg-secondary/30 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary" />
          <select value={platform} onChange={e => setPlatform(e.target.value)}
            className="h-10 px-3 bg-secondary/30 border border-border rounded-lg text-sm text-foreground">
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
          <Button onClick={run} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Scrape
          </Button>
        </div>
      </div>

      {results && (
        <div className="space-y-4">
          {results.profiles?.map((p, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">{p.platform}</span>
                <span className="text-xs text-primary">{p.followers} followers</span>
              </div>
              <div className="text-xs text-muted-foreground">@{p.handle} · Engagement: {p.engagement}</div>
              <p className="text-xs text-foreground mt-2">{p.notes}</p>
            </div>
          ))}
          {results.summary && <div className="glass-card rounded-xl p-4"><p className="text-sm text-foreground">{results.summary}</p></div>}
          {results.opportunities && <div className="glass-card rounded-xl p-4 border-primary/20"><p className="text-sm text-primary">{results.opportunities}</p></div>}
        </div>
      )}
    </div>
  );
}