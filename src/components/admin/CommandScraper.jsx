import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Radar, Loader2, Globe, Search, Zap, Database, Play, Pause, Trash2,
  ChevronDown, ChevronRight, Clock, MapPin, Building2, Tag, ArrowRight,
  Save, RefreshCw, Eye, ExternalLink, Copy, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

const PRESET_KEYWORDS = [
  { label: "Epoxy Flooring Contractors", keywords: "epoxy flooring contractor", industry: "Flooring" },
  { label: "Polished Concrete Installers", keywords: "polished concrete installer", industry: "Concrete" },
  { label: "Warehouse Facilities", keywords: "warehouse facility manager, distribution center", industry: "Warehouse" },
  { label: "Retail Store Builds", keywords: "retail store construction, retail buildout", industry: "Retail" },
  { label: "Healthcare Facilities", keywords: "hospital construction, medical facility flooring", industry: "Healthcare" },
  { label: "Automotive Dealerships", keywords: "auto dealership, car showroom", industry: "Automotive" },
  { label: "Restaurant/Food Service", keywords: "restaurant construction, commercial kitchen flooring", industry: "Food & Bev" },
  { label: "Fitness Centers/Gyms", keywords: "gym construction, fitness center flooring", industry: "Fitness" },
  { label: "Industrial Plants", keywords: "industrial plant, manufacturing facility", industry: "Industrial" },
  { label: "Competitor Research", keywords: "epoxy flooring company, concrete coating company", industry: "Flooring" },
];

const PRESET_URLS = [
  { label: "Google Maps — Epoxy Contractors", url: "https://www.google.com/maps/search/epoxy+flooring+contractor" },
  { label: "Yelp — Floor Coatings", url: "https://www.yelp.com/search?find_desc=epoxy+floor+coating" },
  { label: "HomeAdvisor — Flooring", url: "https://www.homeadvisor.com/c.Epoxy-Flooring.html" },
  { label: "BBB — Flooring Contractors", url: "https://www.bbb.org/search?find_text=epoxy+flooring" },
  { label: "LinkedIn — Facility Managers", url: "https://www.linkedin.com/search/results/people/?keywords=facility+manager" },
  { label: "Construction Permits DB", url: "https://www.constructionmonitor.com" },
];

const DESTINATIONS = [
  { id: "Local", label: "Local DB", icon: Database },
  { id: "Pre-Stage", label: "Pre-Stage", icon: Eye },
  { id: "Stage", label: "Stage", icon: ArrowRight },
  { id: "HubSpot Ready", label: "HubSpot", icon: Zap },
  { id: "Google Drive", label: "Drive", icon: Globe },
  { id: "Supabase", label: "Supabase", icon: Database },
  { id: "Airtable", label: "Airtable", icon: Database },
  { id: "Knowledge Base", label: "KB", icon: Tag },
];

const SCHEDULES = ["Manual", "Every 15 min", "Every 30 min", "Hourly", "Every 6 hours", "Daily", "Weekly"];
const CATEGORIES = ["Company Research", "Competitor Intel", "Market Analysis", "Lead Research", "Industry News", "Pricing Intel", "Technology", "Custom"];

export default function CommandScraper() {
  const [keywords, setKeywords] = useState("");
  const [urls, setUrls] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Company Research");
  const [destination, setDestination] = useState("Local");
  const [schedule, setSchedule] = useState("Manual");
  const [mode, setMode] = useState("Single");
  const [jobName, setJobName] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [expandedResult, setExpandedResult] = useState(null);
  const [activeTab, setActiveTab] = useState("scrape"); // scrape, jobs, results
  const [browserUrl, setBrowserUrl] = useState("");
  const [showBrowser, setShowBrowser] = useState(false);

  useEffect(() => { loadJobs(); loadResults(); }, []);

  const loadJobs = async () => {
    const data = await base44.entities.ScrapeJob.list("-created_date", 50);
    setJobs(data);
  };

  const loadResults = async () => {
    const data = await base44.entities.ResearchResult.list("-created_date", 30);
    setResults(data);
  };

  const applyPresetKeywords = (preset) => {
    setKeywords(preset.keywords);
    setIndustry(preset.industry);
  };

  const applyPresetUrl = (preset) => {
    setUrls(preset.url);
  };

  const runScrape = async () => {
    if ((!keywords.trim() && !urls.trim()) || loading) return;
    setLoading(true);
    try {
      await base44.functions.invoke("scheduledScraper", {
        keywords: keywords || undefined,
        urls: urls || undefined,
        industry, location, category, destination, mode,
      });
      await loadResults();
      setActiveTab("results");
    } catch (err) {
      alert("Scrape failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async () => {
    if (!jobName.trim()) { alert("Enter a job name"); return; }
    await base44.entities.ScrapeJob.create({
      name: jobName,
      keywords, urls, industry, location, category, destination, mode, schedule,
      status: schedule === "Manual" ? "Idle" : "Scheduled",
      is_active: true, run_count: 0, results_count: 0,
    });
    setJobName("");
    await loadJobs();
    setActiveTab("jobs");
  };

  const runJob = async (job) => {
    setLoading(true);
    try {
      await base44.functions.invoke("scheduledScraper", { job_id: job.id });
      await loadJobs();
      await loadResults();
    } catch (err) {
      alert("Job failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    await base44.entities.ScrapeJob.delete(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const openInBrowser = (url) => {
    setBrowserUrl(url);
    setShowBrowser(true);
  };

  return (
    <div className="flex h-full">
      {/* Main Panel */}
      <div className={cn("flex flex-col", showBrowser ? "w-1/2" : "w-full")}>
        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/30 flex-shrink-0">
          <Radar className="w-4 h-4 metallic-gold-icon mr-2" />
          <span className="text-xs font-bold text-foreground mr-3">Command Scraper</span>
          {["scrape", "jobs", "results"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all capitalize",
                activeTab === tab ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}>{tab}</button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setShowBrowser(!showBrowser)}
              className={cn("px-2 py-1 rounded-lg text-[10px] font-bold transition-all", showBrowser ? "bg-primary/15 text-primary" : "text-muted-foreground")}>
              <Globe className="w-3 h-3 inline mr-1" />Browser
            </button>
            <button onClick={() => { loadJobs(); loadResults(); }} className="p-1.5 rounded-md hover:bg-secondary/50">
              <RefreshCw className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ===== SCRAPE TAB ===== */}
          {activeTab === "scrape" && (
            <div className="p-4 space-y-4">
              {/* Presets Row */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Presets — Keywords</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_KEYWORDS.map(p => (
                    <button key={p.label} onClick={() => applyPresetKeywords(p)}
                      className="text-[9px] font-semibold px-2.5 py-1 rounded-full bg-secondary/50 border border-border text-foreground/70 hover:border-primary/30 hover:text-primary transition-all">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Presets — URLs</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_URLS.map(p => (
                    <button key={p.label} onClick={() => applyPresetUrl(p)}
                      className="text-[9px] font-semibold px-2.5 py-1 rounded-full bg-secondary/50 border border-border text-foreground/70 hover:border-primary/30 hover:text-primary transition-all">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Keywords (comma-separated)</label>
                  <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={2}
                    placeholder="epoxy flooring, polished concrete..."
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Target URLs (comma-separated)</label>
                  <textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={2}
                    placeholder="https://example.com, https://..."
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> Industry</label>
                  <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Healthcare"
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Phoenix, AZ"
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Mode</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
                    <option value="Single">Single</option>
                    <option value="Bulk">Bulk</option>
                  </select>
                </div>
              </div>

              {/* Destination Buttons */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Route Data To</label>
                <div className="flex flex-wrap gap-1.5">
                  {DESTINATIONS.map(d => {
                    const Icon = d.icon;
                    return (
                      <button key={d.id} onClick={() => setDestination(d.id)}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          destination === d.id ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary/30 text-muted-foreground border-border hover:border-primary/20")}>
                        <Icon className="w-3 h-3" /> {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule + Save Row */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Schedule</label>
                  <select value={schedule} onChange={(e) => setSchedule(e.target.value)}
                    className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
                    {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground">Job Name (to save)</label>
                  <input value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="My Scrape Job..."
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40" />
                </div>
                <button onClick={saveJob} disabled={!jobName.trim()}
                  className="px-4 py-2 rounded-xl bg-secondary border border-border text-xs font-bold text-foreground disabled:opacity-50 flex items-center gap-1.5 hover:border-primary/30">
                  <Save className="w-3 h-3" /> Save Job
                </button>
                <button onClick={runScrape} disabled={loading || (!keywords.trim() && !urls.trim())}
                  className="px-5 py-2 rounded-xl metallic-gold-bg text-background text-xs font-bold disabled:opacity-50 flex items-center gap-1.5">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  {loading ? "Scraping..." : "Run Now"}
                </button>
              </div>
            </div>
          )}

          {/* ===== JOBS TAB ===== */}
          {activeTab === "jobs" && (
            <div className="p-4 space-y-2">
              {jobs.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">No saved jobs. Configure a scrape and save it.</div>
              ) : jobs.map(job => (
                <div key={job.id} className="border border-border rounded-xl bg-card/40 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                      job.status === "Running" ? "bg-yellow-500 animate-pulse" :
                      job.status === "Completed" ? "bg-green-500" :
                      job.status === "Scheduled" ? "bg-blue-500" :
                      job.status === "Failed" ? "bg-red-500" : "bg-gray-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground">{job.name}</div>
                      <div className="text-[9px] text-muted-foreground flex items-center gap-2">
                        <span>{job.schedule}</span>
                        <span>·</span>
                        <span>{job.destination}</span>
                        <span>·</span>
                        <span>{job.run_count || 0} runs</span>
                        <span>·</span>
                        <span>{job.results_count || 0} results</span>
                      </div>
                    </div>
                    <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full",
                      job.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                      job.status === "Running" ? "bg-yellow-500/10 text-yellow-500" :
                      job.status === "Completed" ? "bg-green-500/10 text-green-500" :
                      "bg-gray-500/10 text-gray-500"
                    )}>{job.status}</span>
                    <button onClick={() => runJob(job)} disabled={loading} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary disabled:opacity-50">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteJob(job.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/60">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {job.keywords && <div className="px-3 pb-2 text-[9px] text-muted-foreground"><span className="font-bold">Keywords:</span> {job.keywords}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ===== RESULTS TAB ===== */}
          {activeTab === "results" && (
            <div className="p-4 space-y-2">
              {results.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">No results yet. Run a scrape to see data.</div>
              ) : results.map(r => {
                let keyData = {};
                try { keyData = JSON.parse(r.key_data_points || "{}"); } catch {}
                const isExpanded = expandedResult === r.id;
                return (
                  <div key={r.id} className="border border-border rounded-xl bg-card/40 overflow-hidden">
                    <button onClick={() => setExpandedResult(isExpanded ? null : r.id)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/20 transition-all">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                        r.status === "Complete" ? "bg-green-500" : r.status === "Failed" ? "bg-red-500" : "bg-yellow-500 animate-pulse"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">{r.title || r.query}</div>
                        <div className="text-[9px] text-muted-foreground">{r.category} · {r.stored_to || "Local"} · {moment(r.created_date).fromNow()}</div>
                      </div>
                      {r.source_url && (
                        <button onClick={(e) => { e.stopPropagation(); openInBrowser(r.source_url); }}
                          className="p-1 rounded hover:bg-secondary/50 text-primary">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border p-3 space-y-3">
                        {r.ai_summary && <div><h4 className="text-[9px] font-bold text-primary uppercase mb-1">Summary</h4><p className="text-[11px] text-foreground/80">{r.ai_summary}</p></div>}
                        {r.ai_insights && <div><h4 className="text-[9px] font-bold text-primary uppercase mb-1">Insights</h4><p className="text-[11px] text-foreground/80 whitespace-pre-wrap">{r.ai_insights}</p></div>}
                        {keyData.contacts_found?.length > 0 && (
                          <div>
                            <h4 className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Contacts</h4>
                            {keyData.contacts_found.map((c, i) => (
                              <div key={i} className="text-[10px] text-foreground/70 bg-secondary/30 rounded px-2 py-1 mb-1">
                                <b>{c.name}</b>{c.title && ` — ${c.title}`}{c.email && <span className="text-primary ml-1">{c.email}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {r.tags && <div className="flex flex-wrap gap-1">{r.tags.split(",").map((t, i) => <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">{t.trim()}</span>)}</div>}
                        <button onClick={() => navigator.clipboard.writeText(r.ai_summary + "\n\n" + r.ai_insights)}
                          className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary/50">
                          <Copy className="w-2.5 h-2.5" /> Copy Report
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Browser Panel */}
      {showBrowser && (
        <div className="w-1/2 border-l border-border flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/60 flex-shrink-0">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={browserUrl} onChange={(e) => setBrowserUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setBrowserUrl(browserUrl)}
              placeholder="Enter URL..."
              className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-[10px] text-foreground outline-none focus:border-primary/40" />
            <button onClick={() => setShowBrowser(false)} className="p-1 rounded hover:bg-secondary/50 text-muted-foreground">✕</button>
          </div>
          <div className="flex-1 relative">
            {browserUrl ? (
              <iframe src={browserUrl} className="absolute inset-0 w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" title="Scraper Browser" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Enter a URL or click a result link</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}