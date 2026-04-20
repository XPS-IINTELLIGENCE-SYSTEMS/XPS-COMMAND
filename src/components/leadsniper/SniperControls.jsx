import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Play, Loader2, RefreshCw, Zap, Send, Search } from "lucide-react";

export default function SniperControls({ onRefresh }) {
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);

  const runAction = async (action) => {
    setRunning(action);
    setResult(null);
    try {
      let res;
      if (action === "scrape") {
        res = await base44.functions.invoke("scheduledGcScraper", {});
      } else if (action === "outreach") {
        res = await base44.functions.invoke("scheduledBidOutreach", {});
      } else if (action === "scrape_legacy") {
        res = await base44.functions.invoke("gcDatabaseBuilder", { states: ["FL", "TX", "CA", "AZ", "OH"], count_per_state: 20, tier: 1 });
      }
      setResult({ action, data: res?.data || res, ok: true });
    } catch (err) {
      setResult({ action, error: err.message, ok: false });
    }
    setRunning(null);
    onRefresh?.();
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 metallic-gold-icon" />
        <span className="text-xs font-bold metallic-gold">Manual Controls</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onRefresh} variant="outline" className="text-xs h-8">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh Data
        </Button>
        <Button
          size="sm"
          onClick={() => runAction("scrape")}
          disabled={!!running}
          className="text-xs h-8 metallic-gold-bg text-background"
        >
          {running === "scrape" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
          Scrape 3 States Now
        </Button>
        <Button
          size="sm"
          onClick={() => runAction("outreach")}
          disabled={!!running}
          className="text-xs h-8"
        >
          {running === "outreach" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
          Send Outreach Now
        </Button>
        <Button
          size="sm"
          onClick={() => runAction("scrape_legacy")}
          disabled={!!running}
          variant="outline"
          className="text-xs h-8"
        >
          {running === "scrape_legacy" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
          Priority 5-State Scrape
        </Button>
      </div>

      {result && (
        <div className={`mt-3 p-2.5 rounded-lg text-[10px] ${result.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {result.ok ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
          ) : (
            <span>Error: {result.error}</span>
          )}
        </div>
      )}
    </div>
  );
}