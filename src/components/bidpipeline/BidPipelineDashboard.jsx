import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import BidPipelineMetrics from "./BidPipelineMetrics";
import BidPipelineKanban from "./BidPipelineKanban";
import GCLeaderboard from "./GCLeaderboard";

export default function BidPipelineDashboard() {
  const [loading, setLoading] = useState(true);
  const [gcs, setGcs] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [running, setRunning] = useState(null);
  const [tab, setTab] = useState("pipeline");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [gcList, scopeList] = await Promise.all([
      base44.entities.ContractorCompany.list("-created_date", 500).catch(() => []),
      base44.entities.FloorScope.list("-created_date", 200).catch(() => []),
    ]);
    setGcs(gcList);
    setScopes(scopeList);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const scopesThisMonth = scopeList.filter(s => s.scope_received_date >= monthStart).length;
    const submitted = scopeList.filter(s => ["submitted", "under_review", "won", "lost", "no_response"].includes(s.bid_status));
    const won = scopeList.filter(s => s.bid_status === "won");
    const activeGCs = gcList.filter(g => g.bid_list_status === "active").length;
    const pipelineScopes = scopeList.filter(s => ["submitted", "under_review"].includes(s.bid_status));

    setMetrics({
      totalGCs: gcList.length,
      activeGCs,
      scopesThisMonth,
      bidsSubmitted: submitted.length,
      bidsWon: won.length,
      winRate: submitted.length > 0 ? (won.length / submitted.length) * 100 : 0,
      contractValue: won.reduce((sum, s) => sum + (s.contract_value || s.total_bid_price || 0), 0),
      pipelineValue: pipelineScopes.reduce((sum, s) => sum + (s.total_bid_price || 0), 0),
    });
    setLoading(false);
  };

  const runScraper = async () => {
    setRunning("scraper");
    await base44.functions.invoke("gcDatabaseBuilder", {
      states: ["FL", "TX", "CA", "AZ", "OH"],
      count_per_state: 20,
      tier: 1,
    }).catch(() => {});
    setRunning(null);
    loadData();
  };

  const runOutreach = async () => {
    setRunning("outreach");
    await base44.functions.invoke("gcBidListOutreach", {
      action: "send_bid_list_requests",
      batch_size: 50,
    }).catch(() => {});
    setRunning(null);
    loadData();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold metallic-gold">GC Bid Pipeline</h1>
          <p className="text-xs text-muted-foreground">National contractor intelligence & automated bid system</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={loadData} className="text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={runScraper} disabled={!!running} className="text-xs metallic-gold-bg text-background">
            {running === "scraper" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
            Scrape GCs
          </Button>
          <Button size="sm" onClick={runOutreach} disabled={!!running} className="text-xs">
            {running === "outreach" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
            Send Outreach
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <BidPipelineMetrics metrics={metrics} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {["pipeline", "leaderboard", "gc_database"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "pipeline" ? "Bid Pipeline" : t === "leaderboard" ? "Leaderboard" : "GC Database"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "pipeline" && <BidPipelineKanban scopes={scopes} />}
      {tab === "leaderboard" && <GCLeaderboard gcs={gcs} scopes={scopes} />}
      {tab === "gc_database" && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">{gcs.length} contractors in database</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 px-2">Company</th>
                  <th className="py-2 px-2">State</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Revenue Est.</th>
                  <th className="py-2 px-2">Scopes</th>
                  <th className="py-2 px-2">Won</th>
                </tr>
              </thead>
              <tbody>
                {gcs.slice(0, 100).map(gc => (
                  <tr key={gc.id} className="border-b border-border/30 hover:bg-white/[0.02]">
                    <td className="py-1.5 px-2 font-medium text-foreground">{gc.company_name}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{gc.state}</td>
                    <td className="py-1.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        gc.bid_list_status === "active" ? "bg-green-500/20 text-green-400" :
                        gc.bid_list_status === "contacted" ? "bg-blue-500/20 text-blue-400" :
                        gc.bid_list_status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {gc.bid_list_status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">
                      {gc.annual_revenue_estimate ? `$${(gc.annual_revenue_estimate / 1000000).toFixed(0)}M` : "—"}
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">{gc.scopes_received_count || 0}</td>
                    <td className="py-1.5 px-2 text-green-400">{gc.jobs_won_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}