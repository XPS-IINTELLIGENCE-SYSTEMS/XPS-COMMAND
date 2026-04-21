import { useState, useRef } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, X, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function WorkspaceBrowser({ onClose }) {
  const [url, setUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("https://www.google.com");
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(["https://www.google.com"]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const iframeRef = useRef(null);

  const navigate = (newUrl) => {
    let formatted = newUrl.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      // If it looks like a URL, add https, otherwise search Google
      if (formatted.includes(".") && !formatted.includes(" ")) {
        formatted = "https://" + formatted;
      } else {
        formatted = `https://www.google.com/search?igu=1&q=${encodeURIComponent(formatted)}`;
      }
    }
    setUrl(formatted);
    setInputUrl(formatted);
    setLoading(true);
    const newHistory = [...history.slice(0, historyIdx + 1), formatted];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
      setLoading(true);
    }
  };

  return (
    <div className={`w-full ${fullscreen ? "fixed inset-0 z-50 bg-background" : "max-w-5xl mx-auto"} flex flex-col`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-t-xl border border-border bg-card/90">
        {/* Nav buttons */}
        <button onClick={goBack} disabled={historyIdx <= 0} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={goForward} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={refresh} className="p-1.5 rounded-lg hover:bg-white/10">
          <RotateCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg bg-background/60 border border-border">
          <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") navigate(inputUrl); }}
            placeholder="Search or enter URL..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Open external */}
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
        <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg hover:bg-white/10">
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" /> : <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Quick nav chips */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-x border-border bg-card/50 overflow-x-auto scrollbar-hide">
        {[
          { label: "Google", url: "https://www.google.com" },
          { label: "Gmail", url: "https://mail.google.com" },
          { label: "Drive", url: "https://drive.google.com" },
          { label: "YouTube", url: "https://www.youtube.com" },
          { label: "Maps", url: "https://maps.google.com" },
          { label: "News", url: "https://news.google.com" },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => navigate(chip.url)}
            className="px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-white" style={{ height: fullscreen ? "calc(100vh - 76px)" : 480 }}>
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          onLoad={() => setLoading(false)}
          title="Web Browser"
        />
      </div>
    </div>
  );
}