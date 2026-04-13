import { useState, useEffect, useRef } from "react";
import { Search, Sun, Moon, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TopBar({ children, theme, onThemeToggle, height = 48 }) {
  const toggleButtons = children ? (Array.isArray(children) ? children : [children]) : [];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(query.trim()), 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runSearch = async (q) => {
    setSearching(true);
    setOpen(true);
    const lower = q.toLowerCase();
    const [leads, proposals, invoices] = await Promise.all([
      base44.entities.Lead.list("-created_date", 100),
      base44.entities.Proposal.list("-created_date", 50),
      base44.entities.Invoice.list("-created_date", 50),
    ]);

    const matched = [];
    leads.filter(l => (l.company || "").toLowerCase().includes(lower) || (l.contact_name || "").toLowerCase().includes(lower))
      .slice(0, 5).forEach(l => matched.push({ type: "Lead", label: l.company, sub: `${l.contact_name} · ${l.stage}`, id: l.id }));
    proposals.filter(p => (p.title || "").toLowerCase().includes(lower) || (p.client_name || "").toLowerCase().includes(lower))
      .slice(0, 3).forEach(p => matched.push({ type: "Proposal", label: p.title, sub: `${p.client_name} · $${(p.total_value || 0).toLocaleString()}`, id: p.id }));
    invoices.filter(i => (i.invoice_number || "").toLowerCase().includes(lower) || (i.client_name || "").toLowerCase().includes(lower))
      .slice(0, 3).forEach(i => matched.push({ type: "Invoice", label: i.invoice_number, sub: `${i.client_name} · $${(i.total || 0).toLocaleString()}`, id: i.id }));

    setResults(matched);
    setSearching(false);
  };

  return (
    <div className="border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm" style={{ height, minHeight: height }}>
      <div className="flex items-center gap-2">
        {toggleButtons[0]}
      </div>

      <div className="flex-1 max-w-lg mx-4 relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 metallic-silver-icon" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search leads, companies, proposals..."
            className="w-full pl-9 pr-8 h-9 text-xs bg-secondary/30 border border-border/50 rounded-xl focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 chat-input-metallic text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => { setQuery(""); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded">
              <X className="w-3 h-3 text-white/40" />
            </button>
          )}
        </div>

        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
            {searching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">No results for "{query}"</div>
            ) : (
              results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 cursor-pointer border-b border-border/30 last:border-0">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">{r.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.sub}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="shimmer-card p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 shimmer-icon metallic-silver-icon" /> : <Moon className="w-4 h-4 shimmer-icon metallic-silver-icon" />}
        </button>
        {toggleButtons[1]}
      </div>
    </div>
  );
}