import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Radar, Loader2, Globe, Key, Eye, Code, Layers, Play, Copy, Check, ChevronDown, ChevronUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SavedAssetsList from "../assets/SavedAssetsList";

const ENGINES = [
  { id: "site_clone", label: "Site Clone", desc: "Full-fidelity multi-page clone with design token extraction", icon: Globe, color: "text-blue-400" },
  { id: "key_harvest", label: "Key Harvest", desc: "Extract API keys, endpoints, secrets, env vars from any site", icon: Key, color: "text-amber-400" },
  { id: "shadow_scrape", label: "Shadow Scrape", desc: "Deep scrape with network intercept and AI analysis", icon: Eye, color: "text-red-400" },
  { id: "algorithm_extract", label: "Algorithm Extract", desc: "Reverse-engineer JS architecture, components, data schemas", icon: Code, color: "text-green-400" },
  { id: "multi_scrape", label: "Multi-Engine", desc: "Run all engines on one target simultaneously", icon: Layers, color: "text-purple-400" },
];

export default function OpenClawView() {
  const [url, setUrl] = useState("");
  const [engine, setEngine] = useState("shadow_scrape");
  const [depth, setDepth] = useState(2);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [savedKey, setSavedKey] = useState(0);

  const run = async () => {
    if (!url.trim()) return;
    setRunning(true);
    setResult(null);
    setError(null);

    const params = { action: engine, url: url.trim() };
    if (engine === "site_clone") params.depth = depth;

    try {
      const res = await base44.functions.invoke("openClawEngine", params);
      setResult(res.data);
      setSavedKey(k => k + 1);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Engine returned an error. The target site may be unreachable or blocking scraping.");
    } finally {
      setRunning(false);
    }
  };

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));
  const activeEngine = ENGINES.find(e => e.id === engine);

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Radar className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Open Claw Engine</h1>
          <p className="text-xs text-muted-foreground">Site clone, key harvest, shadow scrape, algorithm extraction</p>
        </div>
      </div>

      {/* Engine selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ENGINES.map(e => {
          const Icon = e.icon;
          return (
            <button key={e.id} onClick={() => setEngine(e.id)}
              className={`p-3 rounded-xl border text-left transition-all ${engine === e.id ? "border-primary/40 bg-primary/5" : "border-border glass-card hover:border-primary/20"}`}>
              <Icon className={`w-4 h-4 mb-1 ${engine === e.id ? e.color : "text-muted-foreground"}`} />
              <span className="text-[11px] font-semibold text-foreground block">{e.label}</span>
              <span className="text-[9px] text-muted-foreground line-clamp-2">{e.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://target-website.com" className="text-sm font-mono" />
        {engine === "site_clone" && (
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-semibold text-muted-foreground">Crawl Depth:</label>
            {[1, 2, 3, 4].map(d => (
              <button key={d} onClick={() => setDepth(d)}
                className={`w-8 h-8 rounded-lg text-xs font-bold ${depth === d ? "metallic-gold-bg text-background" : "bg-secondary text-muted-foreground"}`}>
                {d}
              </button>
            ))}
          </div>
        )}
        <Button onClick={run} disabled={running || !url.trim()} className="w-full gap-2 h-11 metallic-gold-bg text-background">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? `Running ${activeEngine?.label}...` : `Run ${activeEngine?.label}`}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/5">
          <p className="text-sm font-semibold text-red-400 mb-1">Engine Error</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Saved Assets */}
      <div className="glass-card rounded-xl p-4">
        <button onClick={() => setShowSaved(!showSaved)}
          className="flex items-center gap-2 text-sm font-bold text-foreground w-full">
          <Database className="w-4 h-4 text-primary" /> Saved Results
          <Badge variant="secondary" className="text-[8px] ml-auto">{showSaved ? "Hide" : "Show"}</Badge>
        </button>
        {showSaved && (
          <div className="mt-3">
            <SavedAssetsList
              key={savedKey}
              onSelect={(asset) => {
                if (asset.result_data) {
                  try { setResult(JSON.parse(asset.result_data)); } catch { setResult({ raw: asset.result_data }); }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="metallic-gold-bg text-background text-[9px]">{activeEngine?.label}</Badge>
              <span className="text-xs text-foreground font-semibold">{url}</span>
            </div>

            {/* Site Clone results */}
            {result.pages_cloned != null && (
              <div className="space-y-2">
                <div className="text-sm font-bold text-foreground">{result.pages_cloned} pages cloned</div>
                {result.pages?.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs">
                    <span className="font-mono text-foreground truncate flex-1">{p.url}</span>
                    <div className="flex gap-2 text-muted-foreground">
                      <span>{p.links} links</span>
                      <span>{p.css_vars} vars</span>
                      <Badge variant="secondary" className="text-[8px]">L{p.level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Harvest results */}
            {result.findings_count != null && (
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Badge variant={result.critical > 0 ? "destructive" : "secondary"} className="text-[9px]">{result.critical} Critical</Badge>
                  <Badge variant="secondary" className="text-[9px]">{result.high} High</Badge>
                  <Badge variant="secondary" className="text-[9px]">{result.findings_count} Total</Badge>
                </div>
                {result.findings?.map((f, i) => (
                  <div key={i} className={`p-2 rounded-lg border text-xs ${f.severity === "CRITICAL" ? "border-red-500/40 bg-red-500/5" : f.severity === "HIGH" ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.severity === "CRITICAL" ? "destructive" : "secondary"} className="text-[8px]">{f.severity}</Badge>
                      <span className="font-semibold text-foreground">{f.type}</span>
                    </div>
                    <pre className="text-[10px] text-muted-foreground mt-1 font-mono truncate">{f.value}</pre>
                  </div>
                ))}
              </div>
            )}

            {/* Shadow Scrape / Algorithm results */}
            {result.analysis && (
              <div className="space-y-2">
                {result.network_count != null && (
                  <Badge variant="secondary" className="text-[9px]">{result.network_count} network requests intercepted</Badge>
                )}
                {Object.entries(result.analysis).map(([key, val]) => {
                  if (!val || (Array.isArray(val) && val.length === 0)) return null;
                  const isOpen = expanded[key];
                  return (
                    <div key={key} className="border border-border rounded-lg overflow-hidden">
                      <button onClick={() => toggle(key)} className="flex items-center justify-between w-full px-3 py-2 hover:bg-secondary/30 transition-colors">
                        <span className="text-[11px] font-semibold text-foreground capitalize">{key.replace(/_/g, " ")}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-2">
                          <pre className="text-[10px] text-foreground/80 font-mono whitespace-pre-wrap">{typeof val === "string" ? val : JSON.stringify(val, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Network requests */}
            {result.network_requests?.length > 0 && (
              <div className="mt-3">
                <button onClick={() => toggle("network")} className="flex items-center gap-2 text-[11px] font-semibold text-foreground mb-2">
                  Network Requests ({result.network_requests.length})
                  {expanded.network ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {expanded.network && (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {result.network_requests.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-card border border-border text-[10px]">
                        <Badge variant="secondary" className="text-[8px] w-10 text-center flex-shrink-0">{r.method}</Badge>
                        <span className="text-[9px] text-muted-foreground flex-shrink-0">{r.type}</span>
                        <span className="font-mono text-foreground truncate">{r.url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}