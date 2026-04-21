import { useState, useRef, useEffect } from "react";
import {
  Globe, ArrowLeft, ArrowRight, RotateCw, X, Maximize2, Minimize2,
  ExternalLink, Loader2, Search, Image, Link2, FileText, ChevronRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";

import BrowserHomePage from "./browser/BrowserHomePage";
import BrowserSearchResults from "./browser/BrowserSearchResults";
import BrowserPageView from "./browser/BrowserPageView";
import BrowserAgentPanel from "./browser/BrowserAgentPanel";
import { useBrowserBridge } from "@/lib/BrowserBridge";

export default function WorkspaceBrowser({ onClose }) {
  const [url, setUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Current view: "home" | "search" | "page"
  const [view, setView] = useState("home");
  const [pageData, setPageData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // History
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const inputRef = useRef(null);
  const browserBridge = useBrowserBridge();

  // Listen for agent-driven browser actions from ChatPanel
  useEffect(() => {
    if (!browserBridge) return;
    return browserBridge.onBrowserAction((action) => {
      if (action.type === "navigate_result" && action.data) {
        const d = action.data;
        setPageData(d);
        setUrl(d.url || "");
        setInputUrl(d.url || "");
        setView("page");
        pushHistory({ type: "page", url: d.url, data: d });
      } else if (action.type === "search_result" && action.data) {
        const d = action.data;
        setSearchResults(d.results || []);
        setSearchQuery(d.query || "");
        setInputUrl(d.query || "");
        setUrl("");
        setView("search");
        pushHistory({ type: "search", query: d.query, results: d.results || [] });
      } else if (action.type === "agent_result" && action.data?.current_page?.url) {
        // Agent task completed — navigate to final page
        navigateToUrl(action.data.current_page.url);
      }
    });
  }, [browserBridge]);

  const pushHistory = (entry) => {
    const newHist = [...history.slice(0, historyIdx + 1), entry];
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
  };

  // Navigate to a URL
  const navigateToUrl = async (targetUrl) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("headlessBrowser", { action: "navigate", url: targetUrl });
      const d = res.data;
      if (d?.success) {
        setPageData(d);
        setUrl(d.url || targetUrl);
        setInputUrl(d.url || targetUrl);
        setView("page");
        pushHistory({ type: "page", url: d.url || targetUrl, data: d });
      } else {
        setError(d?.error || "Failed to load page");
      }
    } catch (err) {
      console.error("Browser navigate error:", err);
      setError(err?.response?.data?.error || err.message || "Navigation failed");
    }
    setLoading(false);
  };

  // Perform a search
  const performSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    try {
      const res = await base44.functions.invoke("headlessBrowser", { action: "search", query });
      const d = res.data;
      if (d?.success) {
        setSearchResults(d.results || []);
        setView("search");
        setUrl("");
        setInputUrl(query);
        pushHistory({ type: "search", query, results: d.results || [] });
      } else {
        setError(d?.error || "Search failed");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Handle URL bar submit
  const handleSubmit = (value) => {
    const v = value.trim();
    if (!v) return;
    const isUrl = v.includes(".") && !v.includes(" ") && !v.startsWith("?");
    if (isUrl) {
      const formatted = v.startsWith("http") ? v : "https://" + v;
      navigateToUrl(formatted);
    } else {
      performSearch(v);
    }
  };

  // Back / Forward
  const goBack = () => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    restoreHistoryEntry(history[newIdx]);
  };

  const goForward = () => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    restoreHistoryEntry(history[newIdx]);
  };

  const restoreHistoryEntry = (entry) => {
    if (entry.type === "page") {
      setPageData(entry.data);
      setUrl(entry.url);
      setInputUrl(entry.url);
      setView("page");
    } else if (entry.type === "search") {
      setSearchResults(entry.results);
      setSearchQuery(entry.query);
      setInputUrl(entry.query);
      setUrl("");
      setView("search");
    }
  };

  // Submit form action
  const submitForm = async (formAction, formMethod, formData) => {
    if (!formAction) return;
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("headlessBrowser", {
        action: "submit_form",
        form_action: formAction,
        form_method: formMethod,
        form_data: formData,
      });
      const d = res.data;
      if (d?.success) {
        setPageData(d);
        setUrl(d.url || formAction);
        setInputUrl(d.url || formAction);
        setView("page");
        pushHistory({ type: "page", url: d.url || formAction, data: d });
      } else {
        setError(d?.error || "Form submission failed");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const goHome = () => {
    setView("home");
    setUrl("");
    setInputUrl("");
    setPageData(null);
    setSearchResults([]);
    setError(null);
  };

  return (
    <div className={`w-full ${fullscreen ? "fixed inset-0 z-50 bg-background" : "max-w-5xl mx-auto"} flex flex-col`}>
      {/* Browser chrome — tab bar */}
      <div className="flex items-center gap-0.5 px-2 pt-2 pb-0 rounded-t-xl bg-[#202124]">
        <div
          onClick={goHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg bg-[#292a2d] text-xs text-white/80 cursor-pointer hover:bg-[#35363a] max-w-[200px] truncate"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin text-blue-400 flex-shrink-0" /> : <Globe className="w-3 h-3 text-white/40 flex-shrink-0" />}
          <span className="truncate">{view === "home" ? "New Tab" : (pageData?.title || searchQuery || "Loading...")}</span>
        </div>
        <div className="flex-1" />
        <button onClick={() => setFullscreen(!fullscreen)} className="p-1 rounded hover:bg-white/10">
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-white/50" /> : <Maximize2 className="w-3.5 h-3.5 text-white/50" />}
        </button>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-3.5 h-3.5 text-white/50" />
          </button>
        )}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#292a2d] border-b border-[#3c3c3c]">
        <button onClick={goBack} disabled={historyIdx <= 0} className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30">
          <ArrowLeft className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={goForward} disabled={historyIdx >= history.length - 1} className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30">
          <ArrowRight className="w-4 h-4 text-white/70" />
        </button>
        <button
          onClick={() => { if (view === "page" && url) navigateToUrl(url); else if (view === "search") performSearch(searchQuery); }}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-white/10 disabled:opacity-30"
        >
          <RotateCw className={`w-4 h-4 text-white/70 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button onClick={goHome} className="p-1.5 rounded-full hover:bg-white/10">
          <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
        </button>

        {/* URL / Search bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#35363a] hover:bg-[#3c3d41]">
          {loading ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
          ) : view === "page" && url ? (
            <svg className="w-4 h-4 text-white/40 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
          ) : (
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSubmit(inputUrl); }}
            onFocus={() => { if (inputRef.current) inputRef.current.select(); }}
            placeholder="Search Google or type a URL"
            className="flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/30"
          />
        </div>

        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-white/10">
            <ExternalLink className="w-4 h-4 text-white/50" />
          </a>
        )}
      </div>

      {/* Viewport */}
      <div
        className="overflow-hidden rounded-b-xl"
        style={{
          height: fullscreen ? "calc(100vh - 82px)" : 600,
          backgroundColor: view === "home" ? "#202124" : "#ffffff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {view === "home" && (
          <div className="flex-1 overflow-y-auto">
            <BrowserHomePage
              onSearch={performSearch}
              onNavigate={navigateToUrl}
              loading={loading}
            />
          </div>
        )}

        {view === "search" && (
          <div className="flex-1 overflow-y-auto">
            <BrowserSearchResults
              query={searchQuery}
              results={searchResults}
              onNavigate={navigateToUrl}
              loading={loading}
            />
          </div>
        )}

        {view === "page" && pageData && (
          <BrowserPageView
            data={pageData}
            onNavigate={navigateToUrl}
            onSearch={performSearch}
            onSubmitForm={submitForm}
          />
        )}
      </div>

      {/* Agent panel */}
      <BrowserAgentPanel
        currentUrl={url}
        pageData={pageData}
        onNavigate={navigateToUrl}
        onSearch={performSearch}
      />
    </div>
  );
}