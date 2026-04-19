import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Bot, Clock, CheckCircle2, AlertCircle, Loader2, Play, RotateCcw, Square } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(dateStr).toLocaleString();
}

export default function JobDetailModal({ jobId, onClose, onRefresh }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("autonomousEngine", { action: "job_detail", job_id: jobId });
      setJob(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [jobId]);

  const handleControl = async (command) => {
    setActing(true);
    try {
      await base44.functions.invoke("autonomousEngine", { action: "control", job_id: jobId, command });
      onRefresh?.();
      load();
    } catch { /* ignore */ }
    setActing(false);
  };

  const handleExecute = async () => {
    setActing(true);
    try {
      await base44.functions.invoke("autonomousEngine", { action: "execute_job", job_id: jobId });
      onRefresh?.();
      load();
    } catch { /* ignore */ }
    setActing(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) return null;

  const log = job.parsed_log || [];
  const result = job.parsed_result;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">{job.agent_type} Agent</h3>
              <p className="text-[10px] text-muted-foreground">{job.job_description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(job.status === 'queued' || job.status === 'paused') && (
              <button onClick={handleExecute} disabled={acting} className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400"><Play className="w-4 h-4" /></button>
            )}
            {job.status === 'failed' && (
              <button onClick={() => handleControl('retry')} disabled={acting} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-yellow-400"><RotateCcw className="w-4 h-4" /></button>
            )}
            {(job.status === 'running' || job.status === 'retrying') && (
              <button onClick={() => handleControl('cancel')} disabled={acting} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Square className="w-4 h-4" /></button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-border text-[11px]">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${
            job.status === 'complete' ? 'bg-green-500/10 text-green-400' :
            job.status === 'failed' ? 'bg-red-500/10 text-red-400' :
            job.status === 'running' ? 'bg-blue-500/10 text-blue-400' :
            'bg-secondary text-muted-foreground'
          }`}>{job.status}</span>
          {job.step_total > 0 && <span className="text-muted-foreground">Step {job.step_current}/{job.step_total}</span>}
          {job.retry_count > 0 && <span className="text-yellow-400">Retries: {job.retry_count}</span>}
          <span className="text-muted-foreground">Started: {timeAgo(job.started_at)}</span>
          {job.completed_at && <span className="text-muted-foreground">Finished: {timeAgo(job.completed_at)}</span>}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Execution Log */}
          {log.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground mb-2">Execution Log</h4>
              <div className="space-y-1">
                {log.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="text-muted-foreground whitespace-nowrap w-16 flex-shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-mono px-1 py-0.5 rounded text-[10px] ${
                      entry.action === 'completed' ? 'bg-green-500/10 text-green-400' :
                      entry.action === 'retry' ? 'bg-yellow-500/10 text-yellow-400' :
                      entry.action === 'tool_error' ? 'bg-red-500/10 text-red-400' :
                      'bg-secondary text-muted-foreground'
                    }`}>{entry.action}</span>
                    <span className="text-foreground">{entry.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div>
              <h4 className="text-xs font-bold text-foreground mb-2">Result</h4>
              {typeof result === 'object' ? (
                <div className="space-y-2">
                  {result.summary && <p className="text-xs text-foreground">{result.summary}</p>}
                  {result.plan_summary && <p className="text-xs text-foreground">{result.plan_summary}</p>}
                  {result.data && (
                    <pre className="text-[10px] bg-secondary rounded-lg p-2 overflow-x-auto text-muted-foreground max-h-40">
                      {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <pre className="text-[10px] bg-secondary rounded-lg p-2 overflow-x-auto text-muted-foreground max-h-40">{String(result).substring(0, 2000)}</pre>
              )}
            </div>
          )}

          {/* Sub-jobs */}
          {(job.sub_jobs || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-foreground mb-2">Sub-Tasks ({job.sub_jobs.length})</h4>
              <div className="space-y-1">
                {job.sub_jobs.map((sj) => (
                  <div key={sj.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-[11px]">
                    {sj.status === 'complete' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> :
                     sj.status === 'failed' ? <AlertCircle className="w-3 h-3 text-red-400" /> :
                     sj.status === 'running' ? <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> :
                     <Clock className="w-3 h-3 text-muted-foreground" />}
                    <span className="font-semibold text-primary">{sj.agent_type}</span>
                    <span className="text-foreground truncate flex-1">{sj.job_description}</span>
                    <span className="text-muted-foreground">{sj.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {job.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <h4 className="text-xs font-bold text-red-400 mb-1">Error</h4>
              <p className="text-[11px] text-red-300">{job.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}