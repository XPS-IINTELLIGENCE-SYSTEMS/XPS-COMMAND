import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Globe, Play, Loader2, CheckCircle2, AlertTriangle, Clock,
  Database, FileText, RefreshCw, Zap, BarChart3
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const TIERS = [
  { id: "xps_owned", label: "XPS Properties", icon: Zap, freq: "Daily" },
  { id: "industry_site", label: "Industry Sites", icon: FileText, freq: "Weekly" },
  { id: "ai_tech", label: "AI & Tech", icon: Globe, freq: "Daily" },
  { id: "construction_news", label: "Construction News", icon: BarChart3, freq: "Daily" },
  { id: "government", label: "Government", icon: Database, freq: "Weekly" },
  { id: "financial", label: "Financial", icon: BarChart3, freq: "Weekly" },
  { id: "trends_social", label: "Trends & Social", icon: Globe, freq: "Daily" },
];

function TierRow({ tier, onRun, running }) {
  const Icon = tier.icon;
  return (
    <div className="flex items-center gap-2 py-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />
      <span className="text-xs text-foreground/70 flex-1">{tier.label}</span>
      <span className="text-[9px] text-muted-foreground/40">{tier.freq}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRun(tier.id)}
        disabled={running}
        className="h-6 w-6 p-0"
      >
        {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
      </Button>
    </div>
  );
}

export default function ScrapeMonitor() {
  const [stats, setStats] = useState(null);
  const [mfgStats, setMfgStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningTier, setRunningTier] = useState(null);
  const [profilingMfg, setProfilingMfg] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [scraperStats, mfg] = await Promise.all([
        base44.functions.invoke('knowledgeScraper', { action: 'stats' }),
        base44.functions.invoke('manufacturerProfiler', { action: 'stats' })
      ]);
      setStats(scraperStats.data);
      setMfgStats(mfg.data);
    } catch (e) {
      console.error('Stats load error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const runTier = async (tierId) => {
    setRunningTier(tierId);
    try {
      const res = await base44.functions.invoke('knowledgeScraper', { action: 'scrape_tier', tier: tierId });
      toast({ title: "Scrape Complete", description: `${res.data.succeeded}/${res.data.scraped} sources scraped` });
      loadStats();
    } catch (err) {
      toast({ title: "Scrape Failed", description: err.message, variant: "destructive" });
    }
    setRunningTier(null);
  };

  const profileManufacturers = async () => {
    setProfilingMfg(true);
    try {
      const res = await base44.functions.invoke('manufacturerProfiler', { action: 'profile_batch', batch_size: 3 });
      toast({ title: "Profiling Complete", description: `${res.data.profiled} manufacturers profiled` });
      loadStats();
    } catch (err) {
      toast({ title: "Profile Failed", description: err.message, variant: "destructive" });
    }
    setProfilingMfg(false);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">Knowledge Scraper Network</span>
        </div>
        <Button size="sm" variant="ghost" onClick={loadStats} className="h-7 w-7 p-0">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {loading ? (
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{stats?.total_entries || 0}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Entries</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{stats?.ingested_today || 0}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Today</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{stats?.total_failed || 0}</div>
              <div className="text-[9px] text-red-400 uppercase">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-foreground">{mfgStats?.total_profiles || 0}/{mfgStats?.total_manufacturers_in_list || 30}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Mfg Profiles</div>
            </div>
          </div>

          {/* Manufacturer profiler */}
          {mfgStats && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground">Manufacturer Coverage</span>
                <span className="text-[10px] text-muted-foreground">{mfgStats.coverage_pct || 0}%</span>
              </div>
              <Progress value={mfgStats.coverage_pct || 0} className="h-1.5" />
              <Button
                size="sm"
                variant="outline"
                onClick={profileManufacturers}
                disabled={profilingMfg}
                className="h-6 gap-1 text-[9px] mt-2"
              >
                {profilingMfg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                Profile Next 3 Manufacturers
              </Button>
            </div>
          )}

          {/* Tier controls */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5">Scrape Tiers</div>
            <div className="space-y-0.5">
              {TIERS.map(tier => (
                <TierRow
                  key={tier.id}
                  tier={tier}
                  onRun={runTier}
                  running={runningTier === tier.id}
                />
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          {stats?.category_breakdown && Object.keys(stats.category_breakdown).length > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5">By Category</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(stats.category_breakdown).map(([cat, count]) => (
                  <span key={cat} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.05] text-muted-foreground">
                    {cat}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}