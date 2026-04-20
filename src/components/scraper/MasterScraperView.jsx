import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Play, Clock, Loader2, RefreshCw, Zap, Globe, Building2, Users, Briefcase, Swords, Share2, Database, BookOpen, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const SCRAPE_TARGETS = [
  { id: "company_xps", label: "XPS Website & Social", icon: Building2, color: "#d4af37", group: "Companies", prompt: "Research Xtreme Polishing Systems — products, pricing, news, social media, reviews" },
  { id: "company_ncp", label: "NCP Website & Social", icon: Building2, color: "#6366f1", group: "Companies", prompt: "Research National Concrete Polishing — projects, services, team, news, reviews" },
  { id: "company_xpress", label: "XPS Xpress E-commerce", icon: Building2, color: "#22c55e", group: "Companies", prompt: "Research XPS Xpress — product catalog, pricing, shipping, reviews" },
  { id: "company_cpu", label: "CPU Training Platform", icon: Building2, color: "#f59e0b", group: "Companies", prompt: "Research Concrete Polishing University — courses, certifications, pricing, reviews" },
  { id: "leads_gc", label: "GC Contractors", icon: Users, color: "#ec4899", group: "Leads", prompt: "Find top general contractors in US doing commercial construction over 10,000 sqft" },
  { id: "leads_commercial", label: "Commercial Projects", icon: Briefcase, color: "#14b8a6", group: "Leads", prompt: "Find new commercial construction projects with concrete flooring needs" },
  { id: "leads_gov", label: "Government Bids", icon: Briefcase, color: "#8b5cf6", group: "Leads", prompt: "Find government flooring contracts on SAM.gov and BidNet" },
  { id: "competitors", label: "Competitor Websites", icon: Swords, color: "#ef4444", group: "Intel", prompt: "Scan top 10 epoxy flooring competitors — pricing changes, new products, hiring" },
  { id: "social_media", label: "Social Media Intel", icon: Share2, color: "#ec4899", group: "Intel", prompt: "Scan social media for concrete polishing and epoxy flooring trends, mentions, reviews" },
  { id: "industry_trends", label: "Industry Trends", icon: Globe, color: "#0ea5e9", group: "Intel", prompt: "Find latest concrete flooring industry trends, market data, regulations, innovations" },
  { id: "news", label: "Construction News", icon: Globe, color: "#84cc16", group: "Intel", prompt: "Find latest construction industry news related to commercial flooring" },
  { id: "github_repos", label: "GitHub Open Source", icon: Bot, color: "#64748b", group: "Tech", prompt: "Find useful open source GitHub repos for web scraping, AI agents, CRM, automation" },
  { id: "knowledge_base", label: "Knowledge Ingestion", icon: BookOpen, color: "#06b6d4", group: "System", prompt: "Collect and organize all existing data from IntelRecord, KnowledgeBase, and RawKnowledge entities into structured summaries" },
];

const INTERVALS = [
  { value: "manual", label: "Manual Only" },
  { value: "1min", label: "Every Minute" },
  { value: "5min", label: "Every 5 Min" },
  { value: "15min", label: "Every 15 Min" },
  { value: "1hr", label: "Every Hour" },
  { value: "6hr", label: "Every 6 Hours" },
  { value: "12hr", label: "Every 12 Hours" },
  { value: "24hr", label: "Every 24 Hours" },
  { value: "2day", label: "Every 2 Days" },
  { value: "3day", label: "Every 3 Days" },
  { value: "7day", label: "Weekly" },
];

export default function MasterScraperView() {
  const [running, setRunning] = useState({});
  const [intervals, setIntervals] = useState({});
  const [autoEnabled, setAutoEnabled] = useState({});
  const [results, setResults] = useState({});

  const runScrape = async (target) => {
    setRunning(p => ({ ...p, [target.id]: true }));
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: target.prompt + ". Return structured findings with title, category, content, source_url, and tags.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            findings: { type: "array", items: { type: "object", properties: {
              title: { type: "string" }, category: { type: "string" },
              content: { type: "string" }, source_url: { type: "string" }, tags: { type: "string" }
            }}}
          }
        },
        model: "gemini_3_flash"
      });
      const count = res?.findings?.length || 0;
      if (count > 0) {
        await base44.entities.IntelRecord.bulkCreate(
          res.findings.map(f => ({
            source_company: target.group === "Companies" ? target.label.split(" ")[0] : "Custom",
            category: f.category || "custom", title: f.title, content: f.content,
            source_url: f.source_url || "", source_type: "scraper",
            tags: f.tags || target.label, confidence_score: 75,
            scraped_at: new Date().toISOString(), is_indexed: true,
          }))
        );
      }
      setResults(p => ({ ...p, [target.id]: { count, time: new Date().toLocaleTimeString() } }));
    } catch (e) {
      setResults(p => ({ ...p, [target.id]: { error: e.message, time: new Date().toLocaleTimeString() } }));
    }
    setRunning(p => ({ ...p, [target.id]: false }));
  };

  const runAll = async () => {
    for (const t of SCRAPE_TARGETS) {
      await runScrape(t);
    }
  };

  const groups = [...new Set(SCRAPE_TARGETS.map(t => t.group))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 metallic-gold-icon" />
          <div>
            <h2 className="text-xl font-bold metallic-gold">Master Scraper</h2>
            <p className="text-xs text-muted-foreground">{SCRAPE_TARGETS.length} scrape targets — manual & automated</p>
          </div>
        </div>
        <Button onClick={runAll} size="sm" className="gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Run All
        </Button>
      </div>

      {groups.map(group => (
        <div key={group}>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{group}</h3>
          <div className="space-y-2">
            {SCRAPE_TARGETS.filter(t => t.group === group).map(target => (
              <div key={target.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${target.color}18` }}>
                  <target.icon className="w-4 h-4" style={{ color: target.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-foreground">{target.label}</span>
                  {results[target.id] && (
                    <div className="text-[9px] text-muted-foreground">
                      {results[target.id].error ? <span className="text-destructive">{results[target.id].error}</span> :
                        <span className="text-green-400">{results[target.id].count} records @ {results[target.id].time}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={intervals[target.id] || "manual"} onValueChange={v => setIntervals(p => ({ ...p, [target.id]: v }))}>
                    <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{INTERVALS.map(i => <SelectItem key={i.value} value={i.value} className="text-xs">{i.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Switch checked={autoEnabled[target.id] || false} onCheckedChange={v => setAutoEnabled(p => ({ ...p, [target.id]: v }))} />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => runScrape(target)} disabled={running[target.id]}>
                    {running[target.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}