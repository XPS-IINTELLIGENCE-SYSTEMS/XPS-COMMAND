import { useState } from "react";
import { Zap, Loader2, Building2, Briefcase, Globe2, Play, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import LeadEngineResults from "../components/leadengine/LeadEngineResults";
import PageHexGlow from "../components/PageHexGlow";
import GlobalNav from "../components/navigation/GlobalNav";

const MODES = [
  { id: "companies", label: "Companies", icon: Building2, desc: "Businesses by industry & location" },
  { id: "jobs", label: "Jobs & Projects", icon: Briefcase, desc: "Permits, RFPs, construction" },
  { id: "social", label: "Social & Web", icon: Globe2, desc: "Web presence & social profiles" },
  { id: "oracle", label: "Oracle Mode", icon: Zap, desc: "Deep AI extraction" },
];

const VERTICALS = ["All","Retail","Food & Bev","Warehouse","Automotive","Healthcare","Fitness","Education","Industrial","Residential","Government","Other"];
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const SIGNALS = ["All Signals","Permits","New Filings","Real Estate","Facility Issues","Expansions"];
const COUNTS = [5, 10, 15, 25, 50];

export default function LeadEngine() {
  const [mode, setMode] = useState("companies");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [keywords, setKeywords] = useState("");
  const [state, setState] = useState("FL");
  const [city, setCity] = useState("");
  const [vertical, setVertical] = useState("All");
  const [signal, setSignal] = useState("All Signals");
  const [count, setCount] = useState(10);
  const [url, setUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const runScrape = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    const location = city ? `${city}, ${state}` : state;

    try {
      let response;
      if (mode === "companies") {
        response = await base44.functions.invoke("leadScraper", {
          location, industry: vertical !== "All" ? vertical : "", keywords: keywords || "epoxy flooring, concrete polishing",
          count, vertical: vertical !== "All" ? vertical : "All",
          signal_type: signal === "All Signals" ? "all" : signal.toLowerCase().replace(/ /g, "_"),
        });
      } else if (mode === "jobs") {
        response = await base44.functions.invoke("customScraper", {
          keywords: keywords || "commercial construction, building permits, flooring RFP",
          state, city, count, industry: vertical !== "All" ? vertical : "construction", category: "Job/Project Research",
        });
      } else if (mode === "social") {
        response = await base44.functions.invoke("webResearch", {
          query: keywords || `flooring contractors ${location} social media presence`, url: url || "", category: "Social Media",
        });
      } else if (mode === "oracle") {
        response = await base44.functions.invoke("webResearch", {
          query: customPrompt || `Deep competitive intelligence: epoxy flooring market in ${location}`,
          url: url || "", category: "Deep Analysis", deep_analysis: true,
        });
      }
      setResults(response.data);
    } catch (err) {
      setError(err.message || "Scrape failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background hex-bg relative">
      <PageHexGlow />
      <div className="relative z-[1]">
        <GlobalNav />
      </div>

      <div className="relative z-[1] max-w-5xl mx-auto px-6 py-8">
        {/* Mode Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {MODES.map(m => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`rounded-xl p-4 text-left transition-all border ${active ? 'bg-primary/10 border-primary/40' : 'bg-card border-border hover:border-border/80'}`}>
                <Icon className={`w-5 h-5 mb-2 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-sm font-bold text-foreground">{m.label}</div>
                <div className="text-[10px] text-muted-foreground">{m.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Config */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="Keywords">
              <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="epoxy, concrete polishing..." className="field-input" />
            </Field>
            <Field label="State">
              <select value={state} onChange={e => setState(e.target.value)} className="field-input bg-transparent">{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </Field>
            <Field label="City (optional)">
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Tampa, Phoenix..." className="field-input" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="Vertical">
              <select value={vertical} onChange={e => setVertical(e.target.value)} className="field-input bg-transparent">{VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}</select>
            </Field>
            {(mode === "companies" || mode === "jobs") && (
              <>
                <Field label="Signal Type">
                  <select value={signal} onChange={e => setSignal(e.target.value)} className="field-input bg-transparent">{SIGNALS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </Field>
                <Field label="Count">
                  <select value={count} onChange={e => setCount(parseInt(e.target.value))} className="field-input bg-transparent">{COUNTS.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </Field>
              </>
            )}
          </div>

          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-4">
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Advanced
          </button>
          {showAdvanced && (
            <div className="space-y-3 mb-4 p-4 rounded-lg bg-secondary/30 border border-border">
              {(mode === "social" || mode === "oracle") && (
                <Field label="Target URL"><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="field-input" /></Field>
              )}
              {mode === "oracle" && (
                <Field label="Custom Prompt"><textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Deep extraction prompt..." rows={3} className="field-input resize-none" /></Field>
              )}
            </div>
          )}

          <Button onClick={runScrape} disabled={loading} className="w-full metallic-gold-bg text-background font-bold py-3 rounded-xl hover:brightness-110">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Scraping...</> : <><Play className="w-4 h-4 mr-2" /> Run Scrape</>}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-card p-4 mb-6 flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />{error}
          </div>
        )}

        {results && <LeadEngineResults results={results} mode={mode} />}
      </div>

      <style>{`.field-input { width: 100%; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: hsl(var(--foreground)); background: hsl(var(--secondary)); border: 1px solid hsl(var(--border)); outline: none; } .field-input:focus { border-color: hsl(var(--primary)); }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}