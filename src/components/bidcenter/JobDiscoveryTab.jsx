import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const US_STATES = ["AZ","TX","FL","CA","NV","NY","IL","OH","GA","NC","PA","MI","NJ","VA","WA","CO","MA","TN","IN","MO"];
const SECTORS = ["all", "Government Federal", "Government State", "Government Municipal", "Commercial Private"];
const PROJECT_TYPES = ["warehouse","retail","restaurant","office","government","industrial","healthcare","education","hotel","data_center","military","airport","parking_garage"];

export default function JobDiscoveryTab({ onRefreshPipeline }) {
  const [selectedStates, setSelectedStates] = useState(["AZ"]);
  const [sector, setSector] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState(["warehouse", "retail", "government", "industrial"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const toggleState = (s) => setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleType = (t) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const discover = async () => {
    if (selectedStates.length === 0) { toast({ title: "Select at least one state" }); return; }
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke("discoverBidJobs", {
      states: selectedStates,
      project_types: selectedTypes,
      sector
    });
    setResult(res.data);
    setLoading(false);
    toast({ title: `Found ${res.data?.jobs_found || 0} new bid opportunities` });
    if (onRefreshPipeline) onRefreshPipeline();
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Job Discovery Engine</h2>
      <p className="text-xs text-muted-foreground mb-4">Scrapes government bid boards, permit databases, and construction project listings to find opportunities before anyone else.</p>

      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="mb-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Target States</label>
          <div className="flex gap-1.5 flex-wrap">
            {US_STATES.map(s => (
              <button key={s} onClick={() => toggleState(s)}
                className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${selectedStates.includes(s) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Sector</label>
          <div className="flex gap-1.5 flex-wrap">
            {SECTORS.map(s => (
              <button key={s} onClick={() => setSector(s)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${sector === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>
                {s === "all" ? "All Sectors" : s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Project Types</label>
          <div className="flex gap-1.5 flex-wrap">
            {PROJECT_TYPES.map(t => (
              <button key={t} onClick={() => toggleType(t)}
                className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${selectedTypes.includes(t) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={discover} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? "Searching bid boards..." : "Discover Jobs Now"}
        </Button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{result.jobs_found} Opportunities Found</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{result.summary}</p>
          <div className="space-y-2">
            {(result.jobs || []).map((job, i) => (
              <div key={i} className="p-3 rounded-lg bg-card/50 border border-border">
                <div className="font-medium text-sm text-foreground">{job.job_name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" /> {job.city}, {job.state} · {job.project_type}
                  {job.estimated_flooring_value > 0 && <span className="ml-2 text-primary font-semibold">${job.estimated_flooring_value?.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}