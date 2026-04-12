import { FlaskConical, CheckCircle2, Loader2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialJobs = [
  { company: "Ace Hardware", url: "https://acehardware.com", results: 42, status: "complete", time: "2 min ago" },
  { company: "Gulf Coast Logistics", url: "https://gulfscoastlogistics.com", results: 28, status: "complete", time: "1 hour ago" },
  { company: "Metro Fitness Chain", url: "https://metrofitness.com", results: 12, status: "running", time: "" },
  { company: "Palm Medical Center", url: "https://palmmedical.org", results: 0, status: "queued", time: "" },
];

export default function ResearchView() {
  const [jobs, setJobs] = useState(initialJobs);
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [geo, setGeo] = useState("");

  const handleStartResearch = () => {
    if (!companyName) return;
    setJobs(prev => [...prev, { company: companyName, url: url || "N/A", results: 0, status: "queued", time: "" }]);
    setCompanyName("");
    setUrl("");
    setGeo("");
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Research Lab</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manual web research and company intelligence discovery</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">New Research Job</h3>
        <div className="flex gap-3">
          <Input placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-9 text-xs bg-secondary/50" />
          <Input placeholder="Website URL" value={url} onChange={(e) => setUrl(e.target.value)} className="h-9 text-xs bg-secondary/50" />
          <Input placeholder="Geography (city, state)" value={geo} onChange={(e) => setGeo(e.target.value)} className="h-9 text-xs bg-secondary/50" />
          <Button onClick={handleStartResearch} className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
            <FlaskConical className="w-3.5 h-3.5" /> Start Research
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Research uses publicly available web data only. All results are from public sources.</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Research Jobs</h3>
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                {job.status === "complete" && <CheckCircle2 className="w-4 h-4 text-xps-green" />}
                {job.status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {job.status === "queued" && <Clock className="w-4 h-4 text-muted-foreground" />}
                <div>
                  <div className="text-xs font-semibold text-foreground">{job.company}</div>
                  <div className="text-[10px] text-primary">{job.url}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-foreground">{job.results} results</div>
                <div className="text-[10px] text-muted-foreground">
                  {job.status === "running" ? "Running..." : job.status === "queued" ? "Queued" : job.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}