import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Crosshair } from "lucide-react";
import SniperMetrics from "./SniperMetrics";
import SniperWorkflow from "./SniperWorkflow";
import SniperControls from "./SniperControls";
import SniperDatabase from "./SniperDatabase";
import SniperOutreachLog from "./SniperOutreachLog";
import SniperForecasting from "./SniperForecasting";
import SniperBidUpload from "./SniperBidUpload";
import SniperCompetitorIntel from "./SniperCompetitorIntel";
import BidPipelineKanban from "../bidpipeline/BidPipelineKanban";
import GCLeaderboard from "../bidpipeline/GCLeaderboard";

export default function LeadSniperSystem() {
  const [loading, setLoading] = useState(true);
  const [gcs, setGcs] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [metrics, setMetrics] = useState({});

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
    const submitted = scopeList.filter(s => ["submitted", "under_review", "won", "lost", "no_response"].includes(s.bid_status));
    const won = scopeList.filter(s => s.bid_status === "won");
    const pipelineScopes = scopeList.filter(s => ["submitted", "under_review"].includes(s.bid_status));

    setMetrics({
      totalGCs: gcList.length,
      contacted: gcList.filter(g => g.bid_list_status !== "not_contacted").length,
      activeGCs: gcList.filter(g => g.bid_list_status === "active").length,
      scopesThisMonth: scopeList.filter(s => s.scope_received_date >= monthStart).length,
      bidsSubmitted: submitted.length,
      bidsWon: won.length,
      winRate: submitted.length > 0 ? (won.length / submitted.length) * 100 : 0,
      contractValue: won.reduce((sum, s) => sum + (s.contract_value || s.total_bid_price || 0), 0),
      pipelineValue: pipelineScopes.reduce((sum, s) => sum + (s.total_bid_price || 0), 0),
    });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl metallic-gold-bg flex items-center justify-center">
          <Crosshair className="w-5 h-5 text-background" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold metallic-gold tracking-tight">Lead Sniper System</h1>
          <p className="text-[11px] text-muted-foreground">Automated national GC discovery → outreach → bid pipeline</p>
        </div>
      </div>

      {/* Metrics */}
      <SniperMetrics metrics={metrics} />

      {/* Workflow visualization */}
      <SniperWorkflow />

      {/* Upload Bid Invitation */}
      <SniperBidUpload onScopeCreated={loadData} />

      {/* Controls + Outreach Log side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SniperControls onRefresh={loadData} />
        <SniperOutreachLog />
      </div>

      {/* Revenue Forecasting */}
      <SniperForecasting gcs={gcs} scopes={scopes} />

      {/* Bid Pipeline Kanban */}
      {scopes.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h2 className="text-xs font-bold metallic-gold mb-3">Bid Pipeline</h2>
          <BidPipelineKanban scopes={scopes} />
        </div>
      )}

      {/* Competitor Intelligence */}
      <SniperCompetitorIntel gcs={gcs} scopes={scopes} />

      {/* Leaderboard */}
      <GCLeaderboard gcs={gcs} scopes={scopes} />

      {/* Full Database */}
      <SniperDatabase gcs={gcs} />
    </div>
  );
}