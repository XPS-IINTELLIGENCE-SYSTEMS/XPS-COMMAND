import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, Cpu } from "lucide-react";
import GoalInput from "./GoalInput";
import AgentStatusCard from "./AgentStatusCard";
import LiveActivityFeed from "./LiveActivityFeed";
import TaskQueue from "./TaskQueue";
import PerformanceBar from "./PerformanceBar";
import JobDetailModal from "./JobDetailModal";

const AGENT_NAMES = ["Coordinator", "Browser", "Research", "Scraper", "Writer", "Analyst", "Coder", "Scheduler"];

export default function AgentCommandCenter() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [lastGoalResult, setLastGoalResult] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("autonomousEngine", { action: "dashboard" });
      setStats(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Initial load + polling every 5 seconds
  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleSubmitGoal = async (goal) => {
    setSubmitting(true);
    setLastGoalResult(null);
    try {
      const res = await base44.functions.invoke("autonomousEngine", { action: "submit_goal", goal });
      setLastGoalResult(res.data);
      
      // Auto-execute all sub-tasks
      if (res.data?.coordinator_job_id) {
        await base44.functions.invoke("autonomousEngine", { action: "run_goal", coordinator_job_id: res.data.coordinator_job_id });
      }
      loadDashboard();
    } catch (err) {
      setLastGoalResult({ error: err.message });
    }
    setSubmitting(false);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Agent Command Center</h2>
            <p className="text-[11px] text-muted-foreground">Autonomous multi-agent execution engine</p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); loadDashboard(); }}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Goal Input */}
      <div className="bg-card border border-border rounded-xl p-4">
        <GoalInput onSubmit={handleSubmitGoal} loading={submitting} />
        {lastGoalResult && !lastGoalResult.error && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs font-semibold text-green-400 mb-1">
              Goal launched — {lastGoalResult.tasks_created} tasks created
            </p>
            <p className="text-[11px] text-green-300/80">{lastGoalResult.plan_summary}</p>
            {lastGoalResult.coordinator_job_id && (
              <button
                onClick={() => setSelectedJob(lastGoalResult.coordinator_job_id)}
                className="mt-2 text-[10px] text-primary hover:underline"
              >
                View execution details →
              </button>
            )}
          </div>
        )}
        {lastGoalResult?.error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">{lastGoalResult.error}</p>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <PerformanceBar stats={stats} />

      {/* Agent Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {AGENT_NAMES.map((name) => (
          <AgentStatusCard key={name} name={name} stats={stats?.by_agent?.[name]} />
        ))}
      </div>

      {/* Main Grid: Activity + Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity Feed — takes 3 cols */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
          <LiveActivityFeed
            activeJobs={stats?.active_jobs}
            recentCompleted={stats?.recent_completed}
            recentFailed={stats?.recent_failed}
          />
        </div>

        {/* Task Queue — takes 2 cols */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <TaskQueue queuedJobs={stats?.queued_jobs} onRefresh={loadDashboard} />
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          jobId={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRefresh={loadDashboard}
        />
      )}
    </div>
  );
}