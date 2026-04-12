import { useState, useRef } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, Search, ExternalLink, Bookmark, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const BOOKMARKS = [
  { label: "Google", url: "https://www.google.com" },
  { label: "Google Maps", url: "https://www.google.com/maps" },
  { label: "LinkedIn", url: "https://www.linkedin.com" },
  { label: "Yelp", url: "https://www.yelp.com" },
  { label: "BBB", url: "https://www.bbb.org" },
  { label: "ConstructionMonitor", url: "https://www.constructionmonitor.com" },
  { label: "LoopNet", url: "https://www.loopnet.com" },
  { label: "Permits", url: "https://www.google.com/search?q=building+permits+database" },
];

export default function BrowserPanel() {
  const [url, setUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("https://www.google.com");
  const [key, setKey] = useState(0);
  const [history, setHistory] = useState(["https://www.google.com"]);
  const [histIdx, setHistIdx] = useState(0);

  const navigate = (newUrl) => {
    let final = newUrl;
    if (!final.startsWith("http")) {
      if (final.includes(".") && !final.includes(" ")) {
        final = "https://" + final;
      } else {
        final = "https://www.google.com/search?q=" + encodeURIComponent(final);
      }
    }
    setUrl(final);
    setInputUrl(final);
    setKey(k => k + 1);
    setHistory(prev => [...prev.slice(0, histIdx + 1), final]);
    setHistIdx(prev => prev + 1);
  };

  const goBack = () => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setKey(k => k + 1);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setKey(k => k + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Quick Bookmarks */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-card/40 overflow-x-auto flex-shrink-0">
        <Bookmark className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        {BOOKMARKS.map(b => (
          <button
            key={b.label}
            onClick={() => navigate(b.url)}
            className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all whitespace-nowrap"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* URL Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/60 flex-shrink-0">
        <button onClick={goBack} disabled={histIdx <= 0} className="p-1.5 rounded-md hover:bg-secondary/50 disabled:opacity-30">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={goForward} disabled={histIdx >= history.length - 1} className="p-1.5 rounded-md hover:bg-secondary/50 disabled:opacity-30">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={() => setKey(k => k + 1)} className="p-1.5 rounded-md hover:bg-secondary/50">
          <RotateCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 border border-border">
          <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate(inputUrl)}
            className="flex-1 bg-transparent text-xs text-foreground outline-none min-w-0"
            placeholder="Enter URL or search..."
          />
          <button onClick={() => navigate(inputUrl)} className="p-1 rounded hover:bg-secondary/80">
            <Search className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        <button onClick={() => window.open(url, "_blank")} className="p-1.5 rounded-md hover:bg-secondary/50">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          key={key}
          src={url}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          title="Web Browser"
        />
      </div>
    </div>
  );
}