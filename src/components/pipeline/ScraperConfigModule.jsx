import { useState } from "react";
import { Plus, Trash2, Play, Loader2, Clock, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_CONFIG = {
  name: "",
  keywords: "epoxy companies, polished concrete, decorative concrete",
  location: "Arizona",
  industry: "Epoxy, Polished Concrete, Decorative Concrete",
  max_years_in_business: 10,
  count: 15,
  sources: "Google Maps, Yelp, State Business Registry",
  urls: "",
};

export default function ScraperConfigModule() {
  const [configs, setConfigs] = useState([{ ...DEFAULT_CONFIG, name: "AZ Epoxy & Concrete 30min" }]);
  const [running, setRunning] = useState(null);
  const { toast } = useToast();

  const addConfig = () => setConfigs(p => [...p, { ...DEFAULT_CONFIG, name: `Scraper ${p.length + 1}` }]);
  const removeConfig = (i) => setConfigs(p => p.filter((_, idx) => idx !== i));
  const updateConfig = (i, key, val) => setConfigs(p => p.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  const runScraper = async (config, index) => {
    setRunning(index);
    const result = await base44.functions.invoke("timedLeadScraper", {
      location: config.location,
      industry: config.industry,
      keywords: config.keywords,
      count: config.count,
      max_years: config.max_years_in_business,
      sources: config.sources,
      urls: config.urls,
    });
    toast({
      title: "Scraper Complete",
      description: `Found ${result.data?.leads_created || 0} leads from ${config.location}`,
    });
    setRunning(null);
  };

  // Save config to ScrapeJob entity for the automation to pick up
  const saveToSchedule = async (config) => {
    await base44.entities.ScrapeJob.create({
      name: config.name,
      keywords: config.keywords,
      urls: config.urls,
      industry: config.industry,
      location: config.location,
      category: "Lead Research",
      destination: "Local",
      mode: "Bulk",
      schedule: "Every 30 min",
      is_active: true,
      status: "Scheduled",
    });
    toast({ title: "Saved", description: `"${config.name}" saved to scheduled jobs` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />Scraper Configuration
          </h3>
          <p className="text-[10px] text-muted-foreground">Configure sources, seeds, and schedule for automated lead ingestion</p>
        </div>
        <Button size="sm" variant="outline" onClick={addConfig} className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" />Add Config</Button>
      </div>

      {configs.map((cfg, i) => (
        <div key={i} className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Input value={cfg.name} onChange={e => updateConfig(i, "name", e.target.value)} className="h-8 text-sm font-bold max-w-xs glass-input rounded-lg" placeholder="Config name" />
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => saveToSchedule(cfg)}><Clock className="w-3 h-3 mr-1" />Save to Schedule</Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => runScraper(cfg, i)} disabled={running === i}>
                {running === i ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}Run Now
              </Button>
              {configs.length > 1 && (
                <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => removeConfig(i)}><Trash2 className="w-3 h-3" /></Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase">Location</label>
              <Input value={cfg.location} onChange={e => updateConfig(i, "location", e.target.value)} className="h-8 text-xs glass-input rounded-lg" />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase">Industry / Types</label>
              <Input value={cfg.industry} onChange={e => updateConfig(i, "industry", e.target.value)} className="h-8 text-xs glass-input rounded-lg" />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-muted-foreground font-semibold uppercase">Keywords (comma-separated)</label>
            <Input value={cfg.keywords} onChange={e => updateConfig(i, "keywords", e.target.value)} className="h-8 text-xs glass-input rounded-lg" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase">Max Years in Business</label>
              <Input type="number" value={cfg.max_years_in_business} onChange={e => updateConfig(i, "max_years_in_business", Number(e.target.value))} className="h-8 text-xs glass-input rounded-lg" />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase">Leads per Run</label>
              <Input type="number" value={cfg.count} onChange={e => updateConfig(i, "count", Number(e.target.value))} className="h-8 text-xs glass-input rounded-lg" />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground font-semibold uppercase">Sources</label>
              <Input value={cfg.sources} onChange={e => updateConfig(i, "sources", e.target.value)} className="h-8 text-xs glass-input rounded-lg" />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-muted-foreground font-semibold uppercase">Target URLs (optional, comma-separated)</label>
            <Input value={cfg.urls} onChange={e => updateConfig(i, "urls", e.target.value)} className="h-8 text-xs glass-input rounded-lg" placeholder="https://..." />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
            <Globe className="w-3 h-3" />
            <span>Checks: Google Maps, Yelp, State Registry for open businesses</span>
          </div>
        </div>
      ))}
    </div>
  );
}