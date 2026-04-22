import { Clock, Activity, Zap, TrendingUp } from "lucide-react";

export default function SandboxSchedulerStatus() {
  const now = new Date();
  const hour = now.getUTCHours();
  const minutes = now.getUTCMinutes();

  // Determine current trading phase
  let phase = '';
  let nextCycleMin = 0;
  let callsPerDay = 0;

  if (hour >= 13 && hour < 20) {
    phase = 'Market Hours';
    nextCycleMin = 30;
    callsPerDay = 8;
  } else if (hour >= 11 && hour < 13.5) {
    phase = 'Pre-Market';
    nextCycleMin = 60;
    callsPerDay = 3;
  } else if (hour >= 20 || hour < 4) {
    phase = 'After-Hours';
    nextCycleMin = 60;
    callsPerDay = 4;
  } else {
    phase = 'Overnight';
    nextCycleMin = 240;
    callsPerDay = 5;
  }

  const costSavings = ((1440 - 600) / 1440 * 100).toFixed(0);

  return (
    <div className="bg-card border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">24/7 Sandbox Scheduler</h4>
        <div className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Current Phase</div>
            <div className="font-semibold text-foreground">{phase}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Next Cycle</div>
            <div className="font-semibold text-foreground">{nextCycleMin}min</div>
          </div>
        </div>
      </div>

      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Calls/Day</span>
          <span className="font-semibold">{callsPerDay} (peak) → 20 avg</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Est. Monthly</span>
          <span className="font-semibold">~600 calls</span>
        </div>
        <div className="flex justify-between text-[10px] text-green-500">
          <span>Cost Savings</span>
          <span className="font-bold">{costSavings}% vs continuous</span>
        </div>
      </div>

      <div className="bg-primary/10 rounded p-2 mt-2">
        <p className="text-[9px] text-primary/80">
          ✓ Runs every 5min checking if execution window matches. Only executes when conditions align = true cost-optimized automation.
        </p>
      </div>
    </div>
  );
}