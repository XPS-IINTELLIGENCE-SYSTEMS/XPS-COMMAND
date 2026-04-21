import { Crown, Play, Loader2, Wifi, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CYCLES = [
  { value: 'on_demand', label: 'Run Now — Full Assessment' },
  { value: 'morning_ops', label: 'Morning Ops — Pipeline & Priorities' },
  { value: 'midday_optimize', label: 'Midday — Optimize & Score' },
  { value: 'afternoon_outreach', label: 'Afternoon — Outreach & Bids' },
  { value: 'evening_analysis', label: 'Evening — Analytics & Trading' },
  { value: 'overnight_maintenance', label: 'Overnight — Maintenance & Heal' },
  { value: 'strategic_review', label: 'Strategic Review — Deep Planning' },
];

export default function OrchestratorHeader({ healthScore, lastCycle, running, cycleType, onCycleChange, onRun }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl metallic-gold-bg flex items-center justify-center">
            <Crown className="w-7 h-7 text-background" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold metallic-gold">Orchestrator</h1>
              <Badge className="text-[8px] bg-green-500/20 text-green-400 border-0">
                <Wifi className="w-2.5 h-2.5 mr-0.5" />AUTONOMOUS
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">AI CEO — runs your entire system like a business, delegates to agents, self-schedules, and improves everything</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {healthScore > 0 && (
            <div className="text-right mr-2">
              <div className="text-[9px] text-muted-foreground">System Health</div>
              <div className={`text-2xl font-black ${healthScore >= 80 ? 'text-green-400' : healthScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {healthScore}
              </div>
            </div>
          )}
          <Select value={cycleType} onValueChange={onCycleChange}>
            <SelectTrigger className="w-[220px] text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{CYCLES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={onRun} disabled={running} className="metallic-gold-bg text-background gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Operating...' : 'Run Cycle'}
          </Button>
        </div>
      </div>
      {lastCycle && (
        <div className="mt-3 flex items-center gap-2 text-[9px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Last cycle: {new Date(lastCycle.created_date).toLocaleString()} — {lastCycle.cycle_type} — {lastCycle.status}
        </div>
      )}
    </div>
  );
}