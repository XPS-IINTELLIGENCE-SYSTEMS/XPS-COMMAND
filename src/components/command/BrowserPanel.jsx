import { useState, useRef } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, Search, ExternalLink, Bookmark, Shield, AlertTriangle, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

const BOOKMARKS = [
  { label: "Google Search", url: "https://www.google.com/webhp?igu=1" },
  { label: "Wikipedia", url: "https://en.m.wikipedia.org" },
  { label: "Yelp", url: "https://m.yelp.com" },
  { label: "BBB", url: "https://www.bbb.org" },
  { label: "Craigslist", url: "https://www.craigslist.org" },
  { label: "Reddit", url: "https://old.reddit.com" },
];

export default function BrowserPanel() {
  const [mode, setMode] = useState("iframe"); // "iframe" or "fetch"
  const [url, setUrl] = useState("https://www.google.com/webhp?igu=1");
  const [inputUrl, setInputUrl] = useState("");
  const [key, setKey] = useState(0);
  const [fetchedHtml, setFetchedHtml] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [history, setHistory] = useState(["https://www.google.com/webhp?igu=1"]);
  const [histIdx, setHistIdx] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  const navigateIframe = (newUrl) => {
    let final = newUrl;
    if (!final.startsWith("http")) {
      if (final.includes(".") && !final.includes(" ")) {
        final = "https://" + final;
      } else {
        final = "https://www.google.com/search?igu=1&q=" + encodeURIComponent(final);
      }
    }
    setUrl(final);
    setInputUrl(final);
    setKey(k => k + 1);
    setIframeError(false);
    setHistory(prev => [...prev.slice(0, histIdx + 1), final]);
    setHistIdx(prev => prev + 1);
  };

  const fetchPage = async (targetUrl) => {
    let final = targetUrl || inputUrl;
    if (!final) return;
    if (!final.startsWith("http")) {
      if (final.includes(".") && !final.includes(" ")) {
        final = "https://" + final;
      } else {
        final = "https://www.google.com/search?q=" + encodeURIComponent(final);
      }
    }
    setFetching(true);
    setFetchError(null);
    setFetchedHtml(null);
    setInputUrl(final);
    try {
      const res = await base44.functions.invoke("webBrowse", { url: final });
      if (res.data?.content) {
        setFetchedHtml(res.data.content);
      } else if (res.data?.error) {
        setFetchError(res.data.error);
      } else {
        setFetchedHtml(res.data?.html || "<p>No content returned</p>");
      }
    } catch (err) {
      setFetchError(err.message || "Failed to fetch page");
    } finally {
      setFetching(false);
    }
  };

  const handleNavigate = (target) => {
    if (mode === "iframe") {
      navigateIframe(target || inputUrl);
    } else {
      fetchPage(target || inputUrl);
    }
  };

  const goBack = () => {
    if (histIdx > 0 && mode === "iframe") {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setKey(k => k + 1);
      setIframeError(false);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1 && mode === "iframe") {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setKey(k => k + 1);
      setIframeError(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mode + Bookmarks */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-card/40 overflow-x-auto flex-shrink-0">
        <div className="flex items-center gap-1 mr-2 flex-shrink-0">
          <button
            onClick={() => setMode("iframe")}
            className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md transition-all", mode === "iframe" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            Live
          </button>
          <button
            onClick={() => setMode("fetch")}
            className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md transition-all", mode === "fetch" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            Fetch
          </button>
        </div>
        <Bookmark className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        {BOOKMARKS.map(b => (
          <button
            key={b.label}
            onClick={() => { setInputUrl(b.url); handleNavigate(b.url); }}
            className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all whitespace-nowrap"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* URL Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/60 flex-shrink-0">
        <button onClick={goBack} disabled={histIdx <= 0 || mode === "fetch"} className="p-1.5 rounded-md hover:bg-secondary/50 disabled:opacity-30">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1 || mode === "fetch"} className="p-1.5 rounded-md hover:bg-secondary/50 disabled:opacity-30">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={() => mode === "iframe" ? setKey(k => k + 1) : fetchPage(inputUrl)} className="p-1.5 rounded-md hover:bg-secondary/50">
          <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border">
          {mode === "iframe" ? (
            <Globe className="w-3 h-3 text-blue-400 flex-shrink-0" />
          ) : (
            <Eye className="w-3 h-3 text-primary flex-shrink-0" />
          )}
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
            className="flex-1 bg-transparent text-xs text-foreground outline-none min-w-0"
            placeholder={mode === "iframe" ? "Enter URL or search..." : "Enter URL to fetch content..."}
          />
          <button onClick={() => handleNavigate()} className="p-1 rounded hover:bg-secondary/80">
            <Search className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        <button onClick={() => window.open(url, "_blank")} className="p-1.5 rounded-md hover:bg-secondary/50">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {mode === "iframe" ? (
          <>
            <iframe
              key={key}
              src={url}
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title="Web Browser"
            />
          </>
        ) : (
          <div className="h-full overflow-y-auto">
            {fetching ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Fetching page...</span>
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Failed to load page</p>
                <p className="text-xs text-muted-foreground max-w-md">{fetchError}</p>
              </div>
            ) : fetchedHtml ? (
              <div className="p-4">
                <div
                  className="prose prose-sm prose-invert max-w-none text-xs [&_a]:text-primary [&_img]:max-w-full [&_img]:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: fetchedHtml }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <Eye className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-foreground">Fetch Mode</p>
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  Enter any URL and hit Enter. The backend will fetch the page content and display it here. This works for sites that block iframe embedding.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Info Bar */}
      <div className="px-3 py-1.5 border-t border-border bg-card/30 flex-shrink-0">
        <p className="text-[9px] text-muted-foreground">
          {mode === "iframe" ? (
            <>💡 <strong>Live mode</strong> — Some sites block iframe embedding. Switch to <button onClick={() => setMode("fetch")} className="text-primary font-bold underline">Fetch mode</button> to load any page.</>
          ) : (
            <>🔍 <strong>Fetch mode</strong> — Loads page content via backend. Switch to <button onClick={() => setMode("iframe")} className="text-primary font-bold underline">Live mode</button> for interactive sites.</>
          )}
        </p>
      </div>
    </div>
  );
}