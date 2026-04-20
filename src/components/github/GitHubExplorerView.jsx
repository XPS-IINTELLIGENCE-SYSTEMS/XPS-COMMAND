import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Download, Loader2, Star, GitBranch, ExternalLink, RefreshCw, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RECOMMENDED_SEARCHES = [
  "web scraping python", "AI agent framework", "CRM open source", "headless browser automation",
  "LLM tools", "react dashboard template", "email automation", "PDF generator javascript",
  "construction management", "invoice generator", "social media scraper", "data pipeline",
  "proposal builder", "knowledge graph", "vector database", "workflow engine",
];

export default function GitHubExplorerView() {
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState({});
  const [ingested, setIngested] = useState({});

  const searchRepos = async (q) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Search GitHub for the top 15 most useful open source repositories matching: "${searchQuery}". For each repo, provide: name, full_name (owner/repo), description, stars count, language, url, and a brief analysis of how it could be useful for a flooring/construction company's AI-powered CRM and automation platform.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            repos: { type: "array", items: { type: "object", properties: {
              name: { type: "string" }, full_name: { type: "string" },
              description: { type: "string" }, stars: { type: "number" },
              language: { type: "string" }, url: { type: "string" },
              usefulness: { type: "string" }
            }}}
          }
        },
        model: "gemini_3_flash"
      });
      setRepos(res?.repos || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const ingestRepo = async (repo) => {
    setIngesting(p => ({ ...p, [repo.full_name]: true }));
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the GitHub repository "${repo.full_name}" (${repo.url}). Extract: README content, key features, API endpoints, installation steps, dependencies, configuration options, and code examples. Provide a comprehensive technical summary suitable for a knowledge base.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, summary: { type: "string" },
            features: { type: "string" }, installation: { type: "string" },
            api_docs: { type: "string" }, dependencies: { type: "string" },
            code_examples: { type: "string" }, tags: { type: "string" }
          }
        },
        model: "gemini_3_flash"
      });
      await base44.entities.IntelRecord.create({
        source_company: "GitHub", category: "github_repo",
        title: `${repo.full_name} — ${repo.description}`,
        content: `${res.summary}\n\nFeatures: ${res.features}\n\nInstallation: ${res.installation}\n\nAPI: ${res.api_docs}\n\nDependencies: ${res.dependencies}\n\nExamples: ${res.code_examples}`,
        source_url: repo.url, source_type: "github",
        tags: res.tags || `github,${repo.language},${repo.name}`,
        confidence_score: 90, scraped_at: new Date().toISOString(), is_indexed: true,
        metadata: JSON.stringify({ stars: repo.stars, language: repo.language, full_name: repo.full_name })
      });
      setIngested(p => ({ ...p, [repo.full_name]: true }));
    } catch (e) { console.error(e); }
    setIngesting(p => ({ ...p, [repo.full_name]: false }));
  };

  const ingestAll = async () => {
    for (const repo of repos) {
      if (!ingested[repo.full_name]) await ingestRepo(repo);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="w-6 h-6 metallic-gold-icon" />
        <div>
          <h2 className="text-xl font-bold metallic-gold">GitHub Explorer</h2>
          <p className="text-xs text-muted-foreground">Search, discover & ingest open source repos into your knowledge base</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchRepos()} placeholder="Search GitHub repos..." className="pl-9 h-9 text-xs" />
        </div>
        <Button onClick={() => searchRepos()} disabled={loading} className="gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Search
        </Button>
      </div>

      {/* Recommended */}
      <div>
        <span className="text-[10px] text-muted-foreground font-medium">Recommended searches:</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {RECOMMENDED_SEARCHES.map(s => (
            <button key={s} onClick={() => { setQuery(s); searchRepos(s); }} className="text-[9px] px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {repos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground">{repos.length} repositories found</span>
            <Button size="sm" variant="outline" onClick={ingestAll} className="gap-1.5 text-[10px]">
              <Download className="w-3 h-3" /> Ingest All
            </Button>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {repos.map(repo => (
              <div key={repo.full_name} className="glass-card rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{repo.full_name}</span>
                      {repo.language && <Badge variant="outline" className="text-[8px]">{repo.language}</Badge>}
                      <span className="flex items-center gap-0.5 text-[9px] text-yellow-400"><Star className="w-2.5 h-2.5 fill-current" />{repo.stars?.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{repo.description}</p>
                    {repo.usefulness && <p className="text-[9px] text-primary mt-1">{repo.usefulness}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                    {repo.url && <a href={repo.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-secondary"><ExternalLink className="w-3 h-3 text-muted-foreground" /></a>}
                    <Button size="sm" variant={ingested[repo.full_name] ? "default" : "outline"} className="h-7 text-[10px] gap-1" onClick={() => ingestRepo(repo)} disabled={ingesting[repo.full_name] || ingested[repo.full_name]}>
                      {ingesting[repo.full_name] ? <Loader2 className="w-3 h-3 animate-spin" /> : ingested[repo.full_name] ? <BookOpen className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      {ingested[repo.full_name] ? "Ingested" : "Ingest"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}