import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Moon, Play, Loader2, CheckCircle2, AlertTriangle, Clock,
  Users, Building2, FileText, Mail, RefreshCw, Zap
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const TASK_BLOCKS = [
  { key: "block_1", label: "FL Contractors", target: 800 },
  { key: "block_2", label: "Adjacent Industry", target: 400 },
  { key: "block_3", label: "Future Operators", target: 200 },
  { key: "block_4", label: "Commercial Jobs", target: 300 },
  { key: "block_5", label: "Bid Generation", target: 50 },
  { key: "block_6", label: "Morning Brief", target: 1 },
];

function StatusIcon({ status }) {
  if (status === "running") return <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />;
  if (status === "complete") return <CheckCircle2 className="w-3 h-3 text-green-400" />;
  if (status === "failed") return <AlertTriangle className="w-3 h-3 text-red-400" />;
  return <Clock className="w-3 h-3 text-muted-foreground/40" />;
}

function MetricBox({ icon: Icon, label, value, color }) {
  return (
    <div className="text-center">
      <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
      <div className="text-xl font-black text-foreground">{value}</div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function OvernightMonitor() {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const loadLatest = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('overnightRunner', { action: 'latest' });
      setRun(res.data?.run || null);
    } catch (err) {
      console.error('Failed to load overnight run:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatest();
    const interval = setInterval(loadLatest, 15000);
    return () => clearInterval(interval);
  }, [loadLatest]);

  const startRun = async () => {
    setStarting(true);
    try {
      const res = await base44.functions.invoke('overnightRunner', { action: 'start', target_market: 'Florida' });
      toast({ title: "Overnight run started", description: "Florida intelligence operation is running." });
      loadLatest();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setStarting(false);
    }
  };

  const taskStatus = run?.task_block_status ? JSON.parse(run.task_block_status) : {};
  const isRunning = run?.completion_status === 'running';
  const isComplete = run?.completion_status === 'complete';

  const completedBlocks = Object.values(taskStatus).filter(b => b.status === 'complete').length;
  const totalBlocks = TASK_BLOCKS.length;
  const progressPct = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">Overnight Intelligence Run</span>
          {isRunning && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              RUNNING
            </span>
          )}
          {isComplete && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[9px] font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              COMPLETE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={loadLatest} className="h-7 w-7 p-0">
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            onClick={startRun}
            disabled={starting || isRunning}
            className="h-7 gap-1 text-[10px] bg-primary hover:bg-primary/90"
          >
            {starting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : !run ? (
        <div className="p-6 text-center">
          <Moon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No overnight runs yet</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Click "Run Now" to start a Florida intelligence operation</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricBox icon={Users} label="Leads" value={run.leads_created || 0} color="text-green-400" />
            <MetricBox icon={Building2} label="Jobs" value={run.jobs_found || 0} color="text-blue-400" />
            <MetricBox icon={FileText} label="Bids" value={run.bids_generated || 0} color="text-amber-400" />
            <MetricBox icon={Mail} label="Emails" value={run.emails_sent || 0} color="text-purple-400" />
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Overall Progress</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          {/* Task Blocks */}
          <div className="space-y-1.5">
            {TASK_BLOCKS.map(block => {
              const status = taskStatus[block.key];
              return (
                <div key={block.key} className="flex items-center gap-2 text-xs">
                  <StatusIcon status={status?.status} />
                  <span className={cn(
                    "flex-1",
                    status?.status === 'complete' ? 'text-foreground/60' : 
                    status?.status === 'running' ? 'text-blue-300' : 'text-muted-foreground/40'
                  )}>
                    {block.label}
                  </span>
                  {status?.leads_created > 0 && (
                    <span className="text-[9px] text-green-400/70">{status.leads_created} leads</span>
                  )}
                  {status?.jobs_found > 0 && (
                    <span className="text-[9px] text-blue-400/70">{status.jobs_found} jobs</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 pt-2 border-t border-white/[0.04]">
            <span>Market: {run.target_market}</span>
            <span>Started: {run.start_time ? new Date(run.start_time).toLocaleString() : '—'}</span>
            {run.report_sent_at && <span>Report sent: {new Date(run.report_sent_at).toLocaleTimeString()}</span>}
          </div>
        </div>
      )}
    </div>
  );
}