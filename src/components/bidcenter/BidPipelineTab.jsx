import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Briefcase, RefreshCcw, Zap, FileText, Send, Loader2, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, ScoreBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";
import { toast } from "@/components/ui/use-toast";

const PHASE_COLORS = {
  discovered: "bg-blue-500/10 text-blue-400",
  permit_filed: "bg-cyan-500/10 text-cyan-400",
  design: "bg-purple-500/10 text-purple-400",
  pre_bid: "bg-yellow-500/10 text-yellow-400",
  bidding: "bg-orange-500/10 text-orange-400",
  bid_submitted: "bg-pink-500/10 text-pink-400",
  awarded: "bg-emerald-500/10 text-emerald-400",
  under_construction: "bg-green-500/10 text-green-400",
  complete: "bg-secondary text-muted-foreground",
  lost: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

const BID_COLORS = {
  not_started: "bg-secondary text-muted-foreground",
  takeoff_complete: "bg-cyan-500/10 text-cyan-400",
  bid_generated: "bg-yellow-500/10 text-yellow-400",
  sent: "bg-blue-500/10 text-blue-400",
  follow_up_1: "bg-purple-500/10 text-purple-400",
  follow_up_2: "bg-pink-500/10 text-pink-400",
  follow_up_3: "bg-orange-500/10 text-orange-400",
  won: "bg-emerald-500/10 text-emerald-400",
  lost: "bg-red-500/10 text-red-400",
  no_response: "bg-secondary text-muted-foreground",
  default: "bg-secondary text-muted-foreground",
};

export default function BidPipelineTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [phaseFilter, setPhaseFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CommercialJob.list("-created_date", 200);
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runTakeoff = async (jobId) => {
    setProcessing(p => ({ ...p, [jobId]: "takeoff" }));
    const res = await base44.functions.invoke("aiTakeoff", { job_id: jobId });
    toast({ title: "Takeoff Complete", description: `Bid value: $${res.data?.takeoff?.total_bid_value?.toLocaleString() || "N/A"}` });
    setProcessing(p => ({ ...p, [jobId]: null }));
    load();
  };

  const generateBid = async (jobId, sendEmail = false) => {
    setProcessing(p => ({ ...p, [jobId]: "bid" }));
    const res = await base44.functions.invoke("generateBidPackage", { job_id: jobId, send_email: sendEmail });
    toast({ title: sendEmail ? "Bid Sent!" : "Bid Generated", description: `Bid #${res.data?.bid_number} — $${res.data?.total_bid_value?.toLocaleString() || "N/A"}` });
    setProcessing(p => ({ ...p, [jobId]: null }));
    load();
  };

  const filtered = jobs.filter(j => phaseFilter === "all" || j.project_phase === phaseFilter);
  const pipelineValue = filtered.reduce((s, j) => s + (j.estimated_flooring_value || 0), 0);

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">Bid Pipeline</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} jobs · ${(pipelineValue / 1000000).toFixed(2)}M pipeline</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {["all", "discovered", "permit_filed", "pre_bid", "bidding", "bid_submitted", "awarded", "won", "lost"].map(p => (
          <button key={p} onClick={() => setPhaseFilter(p)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${phaseFilter === p ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>
            {p === "all" ? "All" : p.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon={Briefcase} message="No jobs in pipeline" /> : (
        <div className="space-y-2">
          {filtered.map(job => (
            <div key={job.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">{job.job_name}</span>
                    <StatusBadge status={job.project_phase?.replace(/_/g, " ") || "discovered"} colorMap={PHASE_COLORS} />
                    <StatusBadge status={job.bid_status?.replace(/_/g, " ") || "not started"} colorMap={BID_COLORS} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {job.city}, {job.state} · {job.project_type} · {job.sector || "Commercial"}
                    {job.gc_name && ` · GC: ${job.gc_name}`}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-muted-foreground">Flooring: <span className="text-foreground font-semibold">{job.flooring_sqft?.toLocaleString() || "—"} sqft</span></span>
                    <span className="text-muted-foreground">Value: <span className="text-foreground font-semibold">${job.estimated_flooring_value?.toLocaleString() || "—"}</span></span>
                    <span className="text-muted-foreground">Score: <span className="text-foreground font-semibold">{job.lead_score || "—"}</span></span>
                    {job.bid_due_date && <span className="text-orange-400 font-semibold">Due: {job.bid_due_date}</span>}
                  </div>
                  {job.ai_insight && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{job.ai_insight}</p>}
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {!job.takeoff_complete && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => runTakeoff(job.id)} disabled={!!processing[job.id]}>
                      {processing[job.id] === "takeoff" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      AI Takeoff
                    </Button>
                  )}
                  {job.takeoff_complete && job.bid_status === "takeoff_complete" && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => generateBid(job.id)} disabled={!!processing[job.id]}>
                      {processing[job.id] === "bid" ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                      Generate Bid
                    </Button>
                  )}
                  {job.bid_status === "bid_generated" && (
                    <Button size="sm" className="gap-1 text-xs" onClick={() => generateBid(job.id, true)} disabled={!!processing[job.id]}>
                      {processing[job.id] === "bid" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Send Bid
                    </Button>
                  )}
                  {job.source_url && (
                    <a href={job.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}