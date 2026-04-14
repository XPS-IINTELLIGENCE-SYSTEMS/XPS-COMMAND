import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SystemHealthMonitor() {
  const [connectors, setConnectors] = useState([]);
  const [agentJobs, setAgentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [conns, jobs] = await Promise.all([
      base44.entities.APIConnector.list("-last_tested", 50),
      base44.entities.AgentJob.list("-created_date", 50),
    ]);
    setConnectors(conns);
    setAgentJobs(jobs);
    setLoading(false);
  };

  const statusIcon = (status) => {
    if (status === "connected") return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (status === "error" || status === "expired") return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
  };

  const runningJobs = agentJobs.filter(j => j.status === "running").length;
  const queuedJobs = agentJobs.filter(j => j.status === "queued").length;
  const failedJobs = agentJobs.filter(j => j.status === "failed").length;
  const connectedConns = connectors.filter(c => c.connection_status === "connected").length;

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">System Health</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="text-xs">Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl p-2.5 text-center bg-green-500/10">
          <div className="text-lg font-bold text-green-400">{connectedConns}/{connectors.length}</div>
          <div className="text-[10px] text-muted-foreground">Connectors OK</div>
        </div>
        <div className="rounded-xl p-2.5 text-center bg-blue-500/10">
          <div className="text-lg font-bold text-blue-400">{runningJobs}</div>
          <div className="text-[10px] text-muted-foreground">Running Agents</div>
        </div>
        <div className="rounded-xl p-2.5 text-center bg-yellow-500/10">
          <div className="text-lg font-bold text-yellow-400">{queuedJobs}</div>
          <div className="text-[10px] text-muted-foreground">Queued Jobs</div>
        </div>
        <div className="rounded-xl p-2.5 text-center bg-red-500/10">
          <div className="text-lg font-bold text-red-400">{failedJobs}</div>
          <div className="text-[10px] text-muted-foreground">Failed Jobs</div>
        </div>
      </div>

      {/* Connector list */}
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">API CONNECTORS</h4>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto mb-4">
        {connectors.map(c => (
          <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
            <div className="flex items-center gap-2">
              {statusIcon(c.connection_status)}
              <span className="text-xs font-medium text-foreground">{c.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {c.last_response_ms && <span className="text-[10px] text-muted-foreground">{c.last_response_ms}ms</span>}
              <span className="text-[10px] text-muted-foreground">{c.monthly_calls || 0} calls</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent agent jobs */}
      <h4 className="text-xs font-semibold text-muted-foreground mb-2">RECENT AGENT JOBS</h4>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {agentJobs.slice(0, 10).map(j => (
          <div key={j.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
            <div>
              <div className="text-xs font-medium text-foreground">{j.agent_type}</div>
              <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{j.job_description}</div>
            </div>
            <span className={`text-[10px] font-semibold ${j.status === "complete" ? "text-green-400" : j.status === "failed" ? "text-red-400" : j.status === "running" ? "text-blue-400" : "text-yellow-400"}`}>
              {j.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}