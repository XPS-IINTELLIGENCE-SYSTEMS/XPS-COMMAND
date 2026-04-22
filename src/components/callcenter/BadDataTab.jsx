import { useState } from "react";
import { AlertTriangle, Search, Loader2, Wrench, Phone, Mail, Shield, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const RISK_CONFIG = {
  high: { color: "#ef4444", label: "HIGH RISK", icon: XCircle },
  medium: { color: "#f59e0b", label: "MEDIUM", icon: AlertTriangle },
  low: { color: "#3b82f6", label: "LOW", icon: Shield },
};

const ISSUE_LABELS = {
  phone_fake_555: "Fake 555 number",
  phone_missing: "No phone",
  phone_too_short: "Phone too short",
  phone_repeated_digits: "Repeated digits",
  phone_invalid_prefix: "Invalid prefix",
  email_missing: "No email",
  email_placeholder: "Placeholder email",
  email_bad_format: "Bad email format",
  email_fake_domain: "Fake email domain",
  no_contact_name: "No contact name",
  no_company_name: "No company name",
};

export default function BadDataTab({ queue, onRefresh }) {
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const badRecords = queue.filter(c => c.risk === "high" || c.risk === "medium");
  const filtered = badRecords.filter(c => {
    if (riskFilter !== "all" && c.risk !== riskFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return c.company_name.toLowerCase().includes(s) || (c.contact_name || "").toLowerCase().includes(s);
    }
    return true;
  });

  const fixBatch = async () => {
    const toFix = filtered.filter(c => c.risk === "high").slice(0, 10);
    if (toFix.length === 0) return;
    setFixing(true);
    setFixResults(null);
    const res = await base44.functions.invoke("scrapeFixBadData", {
      records: toFix.map(c => ({
        company_name: c.company_name,
        website: c.website || "",
        state: c.state || "",
        source_ids: c.source_ids || [],
        primary_source: c.primary_source || "",
      })),
    });
    setFixResults(res.data);
    setFixing(false);
    onRefresh?.();
  };

  const highCount = queue.filter(c => c.risk === "high").length;
  const medCount = queue.filter(c => c.risk === "medium").length;

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-xl p-3 text-center">
          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
          <div className="text-xl font-black text-red-400 mt-1">{highCount}</div>
          <div className="text-[9px] text-muted-foreground">HIGH RISK</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mx-auto" />
          <div className="text-xl font-black text-yellow-400 mt-1">{medCount}</div>
          <div className="text-[9px] text-muted-foreground">MEDIUM RISK</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
          <div className="text-xl font-black text-green-400 mt-1">{queue.filter(c => c.risk === "clean").length}</div>
          <div className="text-[9px] text-muted-foreground">CLEAN</div>
        </div>
      </div>

      {/* Fix Button */}
      <Button onClick={fixBatch} disabled={fixing || highCount === 0} className="w-full metallic-gold-bg text-background font-black">
        {fixing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> AI Scraping Real Data...</> : <><Wrench className="w-4 h-4 mr-2" /> Auto-Fix Top 10 High Risk Records</>}
      </Button>

      {/* Fix Results */}
      {fixResults && (
        <div className="glass-card rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400">Fixed {fixResults.fixed} / {fixResults.processed} records</span>
          </div>
          {fixResults.results?.map((r, i) => (
            <div key={i} className="text-[10px] flex items-center gap-2">
              <span className={r.fixed ? "text-green-400" : "text-red-400"}>{r.fixed ? "✅" : "❌"}</span>
              <span className="text-foreground font-bold">{r.company}</span>
              {r.fixed && <span className="text-muted-foreground">→ {r.found?.phone || ""} / {r.found?.email || ""}</span>}
              {r.found?.confidence && <span className="text-primary text-[8px]">{r.found.confidence}% conf</span>}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 glass-input rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bad records..." className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground text-foreground" />
        </div>
        {["all", "high", "medium"].map(r => (
          <button key={r} onClick={() => setRiskFilter(r)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${riskFilter === r ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground"}`}>
            {r === "all" ? "All" : r.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-1.5 max-h-[calc(100vh-500px)] overflow-y-auto">
        {filtered.map((c, i) => {
          const cfg = RISK_CONFIG[c.risk] || RISK_CONFIG.medium;
          const Icon = cfg.icon;
          return (
            <div key={i} className="glass-card rounded-lg p-2.5 flex items-start gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cfg.color}20` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground truncate">{c.company_name}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                  <span className="text-[8px] text-muted-foreground">{c.primary_source}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(c.issues || []).map((issue, j) => (
                    <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                      {ISSUE_LABELS[issue] || issue}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 mt-1 text-[9px] text-muted-foreground">
                  {c.phone && <span className={`flex items-center gap-0.5 ${c.phone_valid ? "text-green-400" : "text-red-400"}`}><Phone className="w-2.5 h-2.5" /> {c.phone}</span>}
                  {c.email && <span className={`flex items-center gap-0.5 ${c.email_valid ? "text-green-400" : "text-red-400"}`}><Mail className="w-2.5 h-2.5" /> {c.email}</span>}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No bad data records found</div>}
      </div>
    </div>
  );
}