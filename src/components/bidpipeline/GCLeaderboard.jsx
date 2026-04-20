import { Building2, Award, DollarSign, MapPin } from "lucide-react";

export default function GCLeaderboard({ gcs, scopes }) {
  // GCs by scopes received
  const gcScopeCount = {};
  scopes.forEach(s => {
    const name = s.gc_company_name || "Unknown";
    gcScopeCount[name] = (gcScopeCount[name] || 0) + 1;
  });
  const topByScopes = Object.entries(gcScopeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // GCs by revenue
  const topByRevenue = [...gcs]
    .filter(g => g.total_revenue_generated > 0)
    .sort((a, b) => (b.total_revenue_generated || 0) - (a.total_revenue_generated || 0))
    .slice(0, 10);

  // States by GC count
  const stateCount = {};
  gcs.forEach(g => {
    stateCount[g.state] = (stateCount[g.state] || 0) + 1;
  });
  const topStates = Object.entries(stateCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top GCs by Scopes */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Top GCs by Scopes</span>
        </div>
        <div className="space-y-1.5">
          {topByScopes.length === 0 && <p className="text-[10px] text-muted-foreground">No data yet</p>}
          {topByScopes.map(([name, count], i) => (
            <div key={name} className="flex items-center gap-2 text-[11px]">
              <span className="w-4 text-muted-foreground font-mono">{i + 1}.</span>
              <span className="flex-1 truncate text-foreground">{name}</span>
              <span className="font-bold text-primary">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top GCs by Revenue */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-foreground">Top GCs by Revenue</span>
        </div>
        <div className="space-y-1.5">
          {topByRevenue.length === 0 && <p className="text-[10px] text-muted-foreground">No data yet</p>}
          {topByRevenue.map((gc, i) => (
            <div key={gc.id} className="flex items-center gap-2 text-[11px]">
              <span className="w-4 text-muted-foreground font-mono">{i + 1}.</span>
              <span className="flex-1 truncate text-foreground">{gc.company_name}</span>
              <span className="font-bold text-green-400">${(gc.total_revenue_generated || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top States */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-foreground">GCs by State</span>
        </div>
        <div className="space-y-1.5">
          {topStates.map(([state, count], i) => (
            <div key={state} className="flex items-center gap-2 text-[11px]">
              <span className="w-4 text-muted-foreground font-mono">{i + 1}.</span>
              <span className="flex-1 text-foreground">{state}</span>
              <span className="font-bold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}