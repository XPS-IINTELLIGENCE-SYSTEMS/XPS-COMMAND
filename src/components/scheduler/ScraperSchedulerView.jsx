import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, Plus, Loader2, Trash2, Play, Pause, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataPageHeader, DataLoading, StatusBadge, EmptyState } from "../shared/DataPageLayout";
import SchedulerFormModal from "./SchedulerFormModal";

const STATUS_COLORS = {
  Idle: "bg-secondary text-muted-foreground",
  Scheduled: "bg-blue-500/10 text-blue-400",
  Running: "bg-yellow-500/10 text-yellow-400",
  Completed: "bg-green-500/10 text-green-400",
  Failed: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

export default function ScraperSchedulerView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ScrapeJob.list("-created_date", 100);
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (job) => {
    await base44.entities.ScrapeJob.update(job.id, { is_active: !job.is_active });
    load();
  };

  const deleteJob = async (id) => {
    await base44.entities.ScrapeJob.delete(id);
    load();
  };

  const runNow = async (job) => {
    await base44.entities.ScrapeJob.update(job.id, { status: "Running" });
    base44.functions.invoke("scheduledScraper", {
      job_id: job.id,
      keywords: job.keywords,
      urls: job.urls,
      industry: job.industry,
      location: job.location,
      category: job.category,
      destination: job.destination,
      mode: job.mode,
    });
    setTimeout(load, 2000);
  };

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <DataPageHeader title="Scraper Scheduler" subtitle="Schedule automated lead scraping runs" count={jobs.length} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
          <Button size="sm" onClick={() => { setEditingJob(null); setShowForm(true); }} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Schedule
          </Button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Clock} message="No scheduled scraper jobs. Create one to get started." />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Job Name</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Schedule</th>
                  <th className="text-left px-4 py-3 font-semibold">Results</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{job.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{job.keywords || "—"}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{job.category || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{job.location || "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{job.schedule || "Manual"}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{job.results_count || 0}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} colorMap={STATUS_COLORS} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => runNow(job)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-green-400" title="Run now">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleActive(job)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-yellow-400" title={job.is_active ? "Pause" : "Resume"}>
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingJob(job); setShowForm(true); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground" title="Edit">
                          <RefreshCcw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteJob(job.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-red-400" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <SchedulerFormModal
          job={editingJob}
          onClose={() => { setShowForm(false); setEditingJob(null); }}
          onSaved={() => { setShowForm(false); setEditingJob(null); load(); }}
        />
      )}
    </div>
  );
}