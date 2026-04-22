import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Radar, Loader2, CheckCircle2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const QUICK_REGIONS = [
  { label: "Southeast", states: ["FL","GA","NC","SC","TN","AL","MS","LA"] },
  { label: "Southwest", states: ["AZ","TX","NM","NV","CO","UT"] },
  { label: "Midwest", states: ["OH","MI","IN","IL","WI","MN","IA","MO"] },
  { label: "Northeast", states: ["NY","NJ","PA","CT","MA","MD","VA"] },
  { label: "West Coast", states: ["CA","OR","WA"] },
  { label: "Top 10 Markets", states: ["FL","TX","CA","AZ","GA","NC","OH","TN","CO","NV"] },
];

export default function RegistryScrapePanel({ onComplete }) {
  const [selectedStates, setSelectedStates] = useState(["FL","AZ","OH","TX","CA"]);
  const [maxPerState, setMaxPerState] = useState(15);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const toggleState = (st) => {
    setSelectedStates(prev => prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]);
  };

  const selectRegion = (states) => {
    setSelectedStates(prev => {
      const newSet = new Set([...prev, ...states]);
      return Array.from(newSet);
    });
  };

  const run = async () => {
    setRunning(true);
    setResult(null);
    const res = await base44.functions.invoke("scrapeStateRegistries", {
      states: selectedStates,
      max_per_state: maxPerState,
    });
    setResult(res.data);
    setRunning(false);
    onComplete?.();
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">State Registry Scraper</span>
        </div>
        <span className="text-[9px] text-muted-foreground">Find epoxy, decorative & polished concrete companies</span>
      </div>

      {/* Quick region selectors */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_REGIONS.map(r => (
          <button key={r.label} onClick={() => selectRegion(r.states)} className="px-2 py-1 rounded-lg bg-secondary text-[9px] font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all">
            {r.label}
          </button>
        ))}
        <button onClick={() => setSelectedStates([])} className="px-2 py-1 rounded-lg bg-destructive/10 text-[9px] font-medium text-destructive">
          Clear
        </button>
      </div>

      {/* State grid */}
      <div className="flex flex-wrap gap-1">
        {ALL_STATES.map(st => (
          <button
            key={st}
            onClick={() => toggleState(st)}
            className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
              selectedStates.includes(st) ? "metallic-gold-bg text-background" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-[10px] text-muted-foreground">Max per state:</label>
        <input type="number" value={maxPerState} onChange={e => setMaxPerState(Number(e.target.value))} min={5} max={50} className="glass-input rounded-lg px-2 py-1 w-16 text-xs text-foreground" />
        <span className="text-[10px] text-muted-foreground">×{selectedStates.length} states = ~{maxPerState * selectedStates.length} max</span>
      </div>

      <Button className="w-full metallic-gold-bg text-background gap-2" onClick={run} disabled={running || selectedStates.length === 0}>
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
        {running ? `Scraping ${selectedStates.length} states...` : `Scrape ${selectedStates.length} State Registries`}
      </Button>

      {result && (
        <div className="glass-card rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-400">{result.total_found} companies found</span>
          </div>
          {result.by_state && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(result.by_state).map(([state, count]) => (
                <span key={state} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full bg-secondary">
                  <MapPin className="w-2.5 h-2.5 text-primary" /> {state}: {count}
                </span>
              ))}
            </div>
          )}
          {result.new_companies?.slice(0, 10).map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-bold text-foreground">{c.name}</span>
              <span>{c.state}</span>
              <span className="text-primary">{c.specialty}</span>
              <span className="text-yellow-400">P{c.priority}</span>
              {c.years != null && <span>{c.years}yr</span>}
            </div>
          ))}
          {(result.new_companies?.length || 0) > 10 && (
            <div className="text-[9px] text-muted-foreground">...and {result.new_companies.length - 10} more</div>
          )}
        </div>
      )}
    </div>
  );
}