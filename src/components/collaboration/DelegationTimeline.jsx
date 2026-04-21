import { ArrowRight, GitBranch, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  queued: { color: "#64748b", label: "Queued" },
  running: { color: "#f59e0b", label: "Running" },
  delegating: { color: "#8b5cf6", label: "Delegating" },
  reflecting: { color: "#06b6d4", label: "Reflecting" },
  complete: { color: "#22c55e", label: "Complete" },
  failed: { color: "#ef4444", label: "Failed" },
};

export default function DelegationTimeline({ delegations }) {
  if (!delegations?.length) {
    return <div className="text-center py-6 text-xs text-muted-foreground">No delegations yet</div>;
  }

  return (
    <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
      {delegations.map(job => {
        const chain = (() => { try { return JSON.parse(job.delegation_chain || '[]'); } catch { return []; } })();
        const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;

        return (
          <div key={job.id} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 border border-border/20">
            <GitBranch className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-bold text-foreground">{job.agent_type}</span>
                <Badge className="text-[7px] px-1 py-0" style={{ backgroundColor: `${statusCfg.color}20`, color: statusCfg.color }}>{statusCfg.label}</Badge>
                {job.quality_score > 0 && <span className="text-[8px] text-muted-foreground">Quality: {job.quality_score}</span>}
              </div>
              <p className="text-[9px] text-muted-foreground truncate mt-0.5">{job.job_description}</p>
              {chain.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {chain.map((hop, i) => (
                    <span key={i} className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                      <span className="text-foreground font-medium">{hop.from}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                      <span className="text-primary font-medium">{hop.to}</span>
                      {i < chain.length - 1 && <span className="mx-0.5">→</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}