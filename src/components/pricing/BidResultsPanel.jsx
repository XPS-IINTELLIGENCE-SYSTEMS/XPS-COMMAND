import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

function BidResultCard({ bid }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{bid.project_name}</p>
          <p className="text-[10px] text-white/40">{bid.location} · {bid.project_type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-primary">${bid.price_per_sqft?.toFixed(2)}/sqft</p>
          <p className="text-[10px] text-white/30">${bid.winning_bid?.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
        {bid.sqft > 0 && <span>{bid.sqft.toLocaleString()} sqft</span>}
        <span>{bid.source}</span>
        {bid.date && <span>{bid.date}</span>}
      </div>
    </div>
  );
}

function AdjustmentCard({ adj }) {
  const priorityColor = adj.priority === "high" ? "text-red-400 bg-red-500/10"
    : adj.priority === "medium" ? "text-yellow-400 bg-yellow-500/10"
    : "text-blue-400 bg-blue-500/10";

  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${priorityColor}`}>{adj.priority}</span>
        <span className="text-sm font-medium text-white">{adj.category}</span>
      </div>
      <p className="text-xs text-white/50">{adj.current_approach}</p>
      <p className="text-xs text-green-400 mt-1">{adj.recommended_change}</p>
      <p className="text-[10px] text-white/30 mt-1">{adj.expected_impact}</p>
    </div>
  );
}

export default function BidResultsPanel() {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [projectType, setProjectType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("bidResultsScraper", {
      action: "scrape_and_analyze",
      state, city, project_type: projectType
    });
    if (res.data?.success) {
      setResult(res.data);
      toast({ title: "Market Analysis Complete" });
    }
    setLoading(false);
  };

  const analysis = result?.analysis;
  const ourData = result?.our_data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Search className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Market Bid Results</h3>
          <p className="text-[10px] text-white/40">Scrape public bid data & compare against our pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Input value={state} onChange={e => setState(e.target.value)} placeholder="State (e.g. FL)" className="bg-white/5 border-white/10 text-sm" />
        <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="bg-white/5 border-white/10 text-sm" />
        <Input value={projectType} onChange={e => setProjectType(e.target.value)} placeholder="Type" className="bg-white/5 border-white/10 text-sm" />
      </div>

      <Button onClick={runAnalysis} disabled={loading} size="sm" className="w-full gap-1.5">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        Scrape & Analyze Market
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Our vs Market stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
              <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{ourData?.win_rate || 0}%</p>
              <p className="text-[10px] text-white/40">Win Rate</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
              <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-white">${ourData?.avg_won_price?.toFixed(2) || '—'}</p>
              <p className="text-[10px] text-white/40">Our Avg Win</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
              <BarChart3 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">${analysis?.market_avg_price_per_sqft?.toFixed(2) || '—'}</p>
              <p className="text-[10px] text-white/40">Market Avg</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/8 text-center">
              {(ourData?.avg_won_price || 0) > (analysis?.market_avg_price_per_sqft || 0)
                ? <TrendingUp className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                : <TrendingDown className="w-4 h-4 text-green-400 mx-auto mb-1" />
              }
              <p className="text-lg font-bold text-white">{analysis?.our_position || '—'}</p>
              <p className="text-[10px] text-white/40">Our Position</p>
            </div>
          </div>

          {/* Market range */}
          {analysis?.market_range_low > 0 && (
            <div className="flex gap-2 text-center">
              <div className="flex-1 p-2 rounded-lg bg-white/5">
                <p className="text-[10px] text-white/40">Low</p>
                <p className="text-sm font-bold text-white">${analysis.market_range_low?.toFixed(2)}</p>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-[10px] text-primary/70">Average</p>
                <p className="text-sm font-bold text-primary">${analysis.market_avg_price_per_sqft?.toFixed(2)}</p>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-white/5">
                <p className="text-[10px] text-white/40">High</p>
                <p className="text-sm font-bold text-white">${analysis.market_range_high?.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Bid results */}
          {analysis?.market_bids?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 mb-2">Recent Market Bids ({analysis.market_bids.length})</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-hide">
                {analysis.market_bids.map((bid, i) => <BidResultCard key={i} bid={bid} />)}
              </div>
            </div>
          )}

          {/* Pricing adjustments */}
          {analysis?.pricing_adjustments?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Pricing Adjustments
              </h4>
              <div className="space-y-1.5">
                {analysis.pricing_adjustments.map((adj, i) => <AdjustmentCard key={i} adj={adj} />)}
              </div>
            </div>
          )}

          {/* Summary */}
          {analysis?.summary && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-white/60 leading-relaxed">
              {analysis.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}