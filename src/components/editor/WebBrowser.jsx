import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Globe, Search, ArrowLeft, ArrowRight, RotateCw, Loader2, ExternalLink, Bot } from "lucide-react";

export default function WebBrowser() {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState(null);

  const handleNavigate = async () => {
    if (!url.trim()) return;
    const target = url.startsWith("http") ? url : `https://${url}`;
    setLoading(true);
    setSearchResults(null);
    try {
      const result = await base44.functions.invoke("webBrowse", { url: target });
      setContent(result.data);
      setCurrentUrl(target);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), target]);
      setHistoryIndex(prev => prev + 1);
    } catch (err) {
      setContent({ error: "Failed to load page: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setContent(null);
    try {
      const result = await base44.functions.invoke("webBrowse", { search: url.trim() });
      setSearchResults(result.data?.results || []);
      setCurrentUrl(`search: ${url.trim()}`);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setUrl(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setUrl(history[historyIndex + 1]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Browser toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goBack} disabled={historyIndex <= 0}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goForward} disabled={historyIndex >= history.length - 1}>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNavigate}>
          <RotateCw className="w-3.5 h-3.5" />
        </Button>
        <div className="flex-1 relative">
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (url.includes(".") || url.startsWith("http")) handleNavigate();
                else handleSearch();
              }
            }}
            placeholder="Enter URL or search query..."
            className="pl-7 h-7 text-xs bg-secondary/50"
          />
        </div>
        <Button size="sm" className="h-7 text-xs gap-1 bg-primary text-primary-foreground" onClick={handleSearch}>
          <Search className="w-3 h-3" /> Search
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleNavigate}>
          <ExternalLink className="w-3 h-3" /> Go
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : searchResults ? (
          <div className="p-4 space-y-3">
            <div className="text-xs text-muted-foreground mb-2">Search results for "{url}"</div>
            {searchResults.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/20 cursor-pointer transition-colors"
                onClick={() => { setUrl(r.url); setSearchResults(null); }}
              >
                <div className="text-xs font-medium text-primary">{r.title}</div>
                <div className="text-[10px] text-xps-green truncate">{r.url}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{r.description}</div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <p className="text-xs text-muted-foreground">No results found</p>
            )}
          </div>
        ) : content ? (
          <div className="p-4">
            {content.error ? (
              <p className="text-xs text-xps-red">{content.error}</p>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-[10px] text-muted-foreground mb-2">URL: {currentUrl}</div>
                {content.title && <h2 className="text-sm font-semibold text-foreground">{content.title}</h2>}
                <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{content.text?.slice(0, 5000)}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-primary/30" />
            </div>
            <p className="text-xs text-foreground font-medium">Web Browser</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Browse the web, research companies, or ask the AI agent to navigate for you
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
              <Bot className="w-3 h-3 text-primary" />
              Connected to AI Agent for autonomous browsing
            </div>
          </div>
        )}
      </div>
    </div>
  );
}