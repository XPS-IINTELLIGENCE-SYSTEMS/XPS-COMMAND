import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap, Activity, Loader2 } from "lucide-react";
import AgentStatusCard from "./AgentStatusCard";
import AgentActivityFeed from "./AgentActivityFeed";
import AgentJobCreator from "./AgentJobCreator";
import AgentJobDetail from "./AgentJobDetail";

const AGENT_TYPES = [
  "Research", "Outreach", "Scraper", "Proposal", "Call", "Content",
  "Analysis", "SEO", "Social", "Shadow Browser", "Site Builder",
  "Crawler Network", "Property Builder"
];

export default function AgentCommandCenter() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('agentRunner', { action: 'stats' });
      setStats(res.data?.by_agent || {});
      setJobs(res.data?.recent_jobs || []);
    } catch (err) {
      console.error('Failed to load agent stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loadData]);

  const refresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalRunning = jobs.filter(j => j.status === 'running').length;
  const totalQueued = jobs.filter(j => j.status === 'queued').length;
  const totalComplete = jobs.filter(j => j.status === 'complete').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black xps-gold-slow-shimmer tracking-tight">Agent Command Center</h1>
            <p className="text-xs text-muted-foreground mt-1">Autonomous AI agent fleet — parallel execution engine</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-bold">{totalRunning}</span>
                <span className="text-muted-foreground">running</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-bold">{totalQueued}</span>
                <span className="text-muted-foreground">queued</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-foreground/30" />
                <span className="text-foreground/60 font-bold">{totalComplete}</span>
                <span className="text-muted-foreground">done</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={refresh} disabled={refreshing} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Agent Status Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Agent Fleet Status</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {AGENT_TYPES.map(type => (
              <AgentStatusCard
                key={type}
                agentType={type}
                stats={stats?.[type]}
                onAction={() => {
                  const agentJobs = jobs.filter(j => j.agent_type === type);
                  if (agentJobs.length > 0) setSelectedJob(agentJobs[0]);
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job Creator + Queue */}
          <div className="space-y-4">
            <AgentJobCreator onJobCreated={refresh} />
            
            {/* Queued Jobs */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">Job Queue</span>
              </div>
              <ScrollArea className="h-[300px]">
                {jobs.filter(j => j.status === 'queued' || j.status === 'running').length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">No active jobs</div>
                ) : (
                  jobs.filter(j => j.status === 'queued' || j.status === 'running').map(job => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${job.status === 'running' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold uppercase text-primary/70">{job.agent_type}</div>
                        <div className="text-xs text-foreground/70 truncate">{job.job_description}</div>
                      </div>
                      <span className="text-[9px] text-muted-foreground/50">P{job.priority || 5}</span>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Center: Activity Feed */}
          <div>
            <AgentActivityFeed jobs={jobs} maxHeight="h-[600px]" />
          </div>

          {/* Right: Job Detail */}
          <div>
            {selectedJob ? (
              <AgentJobDetail
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onRefresh={refresh}
              />
            ) : (
              <div className="glass-card rounded-xl p-6 text-center h-[400px] flex flex-col items-center justify-center">
                <Zap className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Select a job to view details</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Click any agent card or job in the queue</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}