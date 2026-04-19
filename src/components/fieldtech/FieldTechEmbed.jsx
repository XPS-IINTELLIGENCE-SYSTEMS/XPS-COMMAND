import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wrench, Loader2, RefreshCw } from "lucide-react";
import WorkOrderCard from "./WorkOrderCard";
import JobDetailView from "./JobDetailView";

export default function FieldTechEmbed() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filter, setFilter] = useState("active");

  const loadJobs = async () => {
    setLoading(true);
    const data = await base44.entities.CommercialJob.list('-created_date', 100);
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const filtered = jobs.filter(j => {
    if (filter === "active") return ["awarded", "under_construction", "pre_bid", "bidding", "bid_submitted"].includes(j.project_phase);
    if (filter === "complete") return j.project_phase === "complete";
    return true;
  });

  if (selectedJob) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <JobDetailView
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onUpdated={() => {
            loadJobs();
            base44.entities.CommercialJob.list('-created_date', 100).then(data => {
              const updated = data.find(j => j.id === selectedJob.id);
              if (updated) setSelectedJob(updated);
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold metallic-gold">Field Tech</h1>
            <p className="text-xs text-white/40">Daily work orders</p>
          </div>
        </div>
        <button onClick={loadJobs} className="p-2 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors">
          <RefreshCw className={`w-5 h-5 text-white/40 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-white/5">
        {[
          { key: "active", label: "Active" },
          { key: "complete", label: "Complete" },
          { key: "all", label: "All" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
              filter === tab.key ? "bg-primary/15 text-primary" : "text-white/40 active:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
          <p className="text-lg font-bold text-white">{jobs.filter(j => j.project_phase === "under_construction").length}</p>
          <p className="text-[10px] text-white/40">In Progress</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
          <p className="text-lg font-bold text-white">{jobs.filter(j => j.project_phase === "awarded").length}</p>
          <p className="text-[10px] text-white/40">Awarded</p>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
          <p className="text-lg font-bold text-green-400">{jobs.filter(j => j.project_phase === "complete").length}</p>
          <p className="text-[10px] text-white/40">Complete</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-white/30">No work orders found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(job => (
            <WorkOrderCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </div>
      )}
    </div>
  );
}