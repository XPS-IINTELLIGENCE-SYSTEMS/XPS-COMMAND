import { useState, useEffect, useCallback } from "react";
import { Loader2, Play, Pause, Trash2, RefreshCcw, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import SchedulerForm from "./SchedulerForm";
import SchedulerJobList from "./SchedulerJobList";
import GoogleConnectors from "./GoogleConnectors";

export default function TaskSchedulerView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.ScrapeJob.list("-created_date", 100);
    setJobs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = base44.entities.ScrapeJob.subscribe((event) => {
      if (event.type === "create") setJobs(prev => [event.data, ...prev]);
      else if (event.type === "update") setJobs(prev => prev.map(j => j.id === event.id ? event.data : j));
      else if (event.type === "delete") setJobs(prev => prev.filter(j => j.id !== event.id));
    });
    return unsub;
  }, []);

  const runNow = async (job) => {
    toast({ title: "Scraping...", description: `Running ${job.name}` });
    await base44.entities.ScrapeJob.update(job.id, { status: "Running" });
    const res = await base44.functions.invoke("customScraper", {
      jobId: job.id,
      keywords: job.keywords,
      state: job.location?.split(",")[1]?.trim() || "AZ",
      city: job.location?.split(",")[0]?.trim() || "",
      count: job.results_count || 10,
      industry: job.industry,
      category: job.category,
      urls: job.urls,
    });
    toast({ title: "Done!", description: `Created ${res.data?.leads_created || 0} leads` });
    load();
  };

  const toggleJob = async (job) => {
    await base44.entities.ScrapeJob.update(job.id, { is_active: !job.is_active });
  };

  const deleteJob = async (job) => {
    await base44.entities.ScrapeJob.delete(job.id);
    toast({ title: "Deleted", description: `Removed ${job.name}` });
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="relative z-10 p-5 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              TASK SCHEDULER
            </h1>
            <p className="text-base text-muted-foreground mt-1">Visual scraper control center · Configure, schedule, and connect</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCcw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>

        {/* Google Connectors */}
        <GoogleConnectors />

        {/* New Scrape Job Form */}
        <SchedulerForm onCreated={load} />

        {/* Active Jobs */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <SchedulerJobList jobs={jobs} onRun={runNow} onToggle={toggleJob} onDelete={deleteJob} />
        )}
      </div>
    </div>
  );
}