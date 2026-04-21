import { useState, useRef } from "react";
import { Globe, ArrowLeft, ArrowRight, RotateCw, X, Maximize2, Minimize2, ExternalLink, Loader2, MousePointer, Type, ScrollText, Camera, Bot, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WorkspaceBrowser({ onClose, onAgentBrowse }) {
  const [url, setUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("https://www.google.com");
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [pageTitle, setPageTitle] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [error, setError] = useState(null);
  const [statusText, setStatusText] = useState("Enter a URL and press Enter to browse");

  // Interaction mode
  const [interactMode, setInteractMode] = useState(null); // null, 'click', 'type', 'scroll', 'agent'
  const [interactSelector, setInteractSelector] = useState("");
  const [interactText, setInteractText] = useState("");
  const [agentTask, setAgentTask] = useState("");

  const [pageText, setPageText] = useState(null);

  const callBrowser = async (action, params = {}) => {
    setLoading(true);
    setError(null);
    setPageText(null);
    setStatusText(`${action === 'agent_browse' ? 'Agent working' : 'Loading'}...`);
    try {
      const res = await base44.functions.invoke("headlessBrowser", { action, url, ...params });
      setLoading(false);
      if (res.data?.error && !res.data?.success) {
        setError(res.data.error);
        setStatusText("Error — try again");
        return res.data;
      }
      if (res.data?.screenshot) {
        setScreenshot(res.data.screenshot);
      }
      if (res.data?.fallback && res.data?.pageDescription) {
        setPageText(res.data.pageDescription);
        setScreenshot(null);
      }
      if (res.data?.title) setPageTitle(res.data.title);
      if (res.data?.url) {
        setUrl(res.data.url);
        setInputUrl(res.data.url);
      }
      setStatusText(res.data?.plan || res.data?.title || "Ready");
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.message || "Request failed");
      setStatusText("Error");
      return null;
    }
  };

  const navigate = async (targetUrl) => {
    let formatted = targetUrl.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      if (formatted.includes(".") && !formatted.includes(" ")) {
        formatted = "https://" + formatted;
      } else {
        formatted = `https://www.google.com/search?q=${encodeURIComponent(formatted)}`;
      }
    }
    setUrl(formatted);
    setInputUrl(formatted);
    const newHistory = [...history.slice(0, historyIdx + 1), formatted];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    await callBrowser("screenshot", { url: formatted });
  };

  const goBack = async () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      const prevUrl = history[newIdx];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
      await callBrowser("screenshot", { url: prevUrl });
    }
  };

  const goForward = async () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      const nextUrl = history[newIdx];
      setUrl(nextUrl);
      setInputUrl(nextUrl);
      await callBrowser("screenshot", { url: nextUrl });
    }
  };

  const handleInteract = async () => {
    if (interactMode === "click" && interactSelector) {
      await callBrowser("interact", { selector: interactSelector });
    } else if (interactMode === "type" && interactSelector && interactText) {
      await callBrowser("interact", { selector: interactSelector, text: interactText });
    } else if (interactMode === "scroll") {
      await callBrowser("interact", { scrollY: 500 });
    } else if (interactMode === "agent" && agentTask) {
      const result = await callBrowser("agent_browse", { text: agentTask, url });
      // Notify chat if handler provided
      if (onAgentBrowse && result) {
        onAgentBrowse(result);
      }
    }
    setInteractMode(null);
    setInteractSelector("");
    setInteractText("");
    setAgentTask("");
  };

  const QUICK_SITES = [
    { label: "Google", url: "https://www.google.com" },
    { label: "Gmail", url: "https://mail.google.com" },
    { label: "Drive", url: "https://drive.google.com" },
    { label: "YouTube", url: "https://www.youtube.com" },
    { label: "Maps", url: "https://maps.google.com" },
    { label: "LinkedIn", url: "https://www.linkedin.com" },
  ];

  const TOOLS = [
    { id: "click", label: "Click", icon: MousePointer, color: "#22c55e" },
    { id: "type", label: "Type", icon: Type, color: "#6366f1" },
    { id: "scroll", label: "Scroll", icon: ScrollText, color: "#f59e0b" },
    { id: "agent", label: "AI Agent", icon: Bot, color: "#ec4899" },
  ];

  return (
    <div className={`w-full ${fullscreen ? "fixed inset-0 z-50 bg-background" : "max-w-5xl mx-auto"} flex flex-col`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-t-xl border border-border bg-card/90">
        <button onClick={goBack} disabled={historyIdx <= 0 || loading} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30">
          <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={goForward} disabled={historyIdx >= history.length - 1 || loading} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30">
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onClick={() => navigate(url)} disabled={loading} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30">
          <RotateCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg bg-background/60 border border-border">
          {loading ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" /> : <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !loading) navigate(inputUrl); }}
            placeholder="Search or enter URL..."
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </div>

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

      {/* Quick nav + interaction tools */}
      <div className="flex items-center gap-1 px-2 py-1 border-x border-border bg-card/50 overflow-x-auto scrollbar-hide">
        {QUICK_SITES.map((chip) => (
          <button key={chip.label} onClick={() => !loading && navigate(chip.url)} className="px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors whitespace-nowrap">
            {chip.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = interactMode === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setInteractMode(isActive ? null : tool.id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-all ${
                isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-3 h-3" style={{ color: tool.color }} />
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Interaction bar */}
      {interactMode && interactMode !== "scroll" && (
        <div className="flex items-center gap-2 px-3 py-2 border-x border-border bg-card/70">
          {(interactMode === "click" || interactMode === "type") && (
            <>
              <input
                value={interactSelector}
                onChange={(e) => setInteractSelector(e.target.value)}
                placeholder="CSS selector (e.g. #search, .btn-submit)"
                className="flex-1 bg-transparent text-xs text-foreground outline-none border-b border-border py-1 placeholder:text-muted-foreground/40"
              />
              {interactMode === "type" && (
                <input
                  value={interactText}
                  onChange={(e) => setInteractText(e.target.value)}
                  placeholder="Text to type..."
                  className="flex-1 bg-transparent text-xs text-foreground outline-none border-b border-border py-1 placeholder:text-muted-foreground/40"
                />
              )}
            </>
          )}
          {interactMode === "agent" && (
            <input
              value={agentTask}
              onChange={(e) => setAgentTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleInteract(); }}
              placeholder="Tell the AI what to do on this page..."
              className="flex-1 bg-transparent text-xs text-foreground outline-none border-b border-primary/40 py-1 placeholder:text-muted-foreground/40"
              autoFocus
            />
          )}
          <button
            onClick={handleInteract}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-40"
          >
            <Send className="w-3 h-3" /> Go
          </button>
          <button onClick={() => setInteractMode(null)} className="p-1 rounded hover:bg-white/10">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Viewport */}
      <div className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-black/90 relative" style={{ minHeight: fullscreen ? "calc(100vh - 100px)" : 420 }}>
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-sm">
          {loading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          <span className="text-[10px] text-muted-foreground truncate flex-1">{statusText}</span>
          {pageTitle && <span className="text-[10px] text-foreground/50 truncate max-w-[200px]">{pageTitle}</span>}
        </div>

        {screenshot ? (
          <img
            src={screenshot}
            alt="Browser view"
            className="w-full h-full object-contain object-top"
            style={{ minHeight: fullscreen ? "calc(100vh - 100px)" : 420 }}
          />
        ) : pageText ? (
          <div className="p-4 overflow-y-auto" style={{ maxHeight: fullscreen ? "calc(100vh - 100px)" : 420 }}>
            <div className="text-[11px] text-primary/60 mb-2 font-medium">Fallback mode — showing extracted text content</div>
            <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{pageText}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <Globe className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground/50 mb-2">Headless Browser</p>
            <p className="text-[11px] text-muted-foreground/30 text-center max-w-sm mb-4">
              Enter a URL above and press Enter to browse. Use the tools to click, type, scroll, or let the AI agent navigate for you.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_SITES.slice(0, 4).map((s) => (
                <button
                  key={s.label}
                  onClick={() => navigate(s.url)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium glass-card text-muted-foreground hover:text-foreground transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-2 left-2 right-2 bg-destructive/20 border border-destructive/30 rounded-lg px-3 py-2">
            <p className="text-[11px] text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}