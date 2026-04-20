import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Play, Loader2, Database, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const INTERVALS = [
  { value: "manual", label: "Manual" }, { value: "1min", label: "1 Min" },
  { value: "5min", label: "5 Min" }, { value: "1hr", label: "1 Hour" },
  { value: "24hr", label: "Daily" }, { value: "3day", label: "3 Days" },
  { value: "7day", label: "Weekly" }, { value: "custom", label: "Custom" },
];

export default function IndustryDetailView({ industry, onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(null);
  const [intervals, setIntervals] = useState({});
  const [autoEnabled, setAutoEnabled] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    const all = await base44.entities.IntelRecord.list("-created_date", 300);
    setRecords(all.filter(r => r.industry?.toLowerCase() === industry.label.toLowerCase() || r.sub_industry && industry.subs.map(s => s.toLowerCase()).includes(r.sub_industry.toLowerCase())));
    setLoading(false);
  };

  const scrapeSub = async (sub) => {
    setScraping(sub);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Research the ${sub} sub-industry within ${industry.label}. Find: top companies, market size, trends, key players, pricing data, recent news, innovations, regulations. Return detailed structured findings.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            findings: { type: "array", items: { type: "object", properties: {
              title: { type: "string" }, content: { type: "string" },
              source_url: { type: "string" }, tags: { type: "string" }
            }}}
          }
        },
        model: "gemini_3_flash"
      });
      if (res?.findings?.length) {
        await base44.entities.IntelRecord.bulkCreate(
          res.findings.map(f => ({
            source_company: "Industry", category: "industry_data",
            industry: industry.label, sub_industry: sub,
            title: f.title, content: f.content,
            source_url: f.source_url || "", source_type: "scraper",
            tags: f.tags || `${industry.label},${sub}`,
            confidence_score: 70, scraped_at: new Date().toISOString(), is_indexed: true,
          }))
        );
        loadRecords();
      }
    } catch (e) { console.error(e); }
    setScraping(null);
  };

  const scrapeAll = async () => {
    for (const sub of industry.subs) await scrapeSub(sub);
  };

  const filtered = records.filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.content?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{industry.label}</h2>
          <p className="text-[10px] text-muted-foreground">{industry.subs.length} sub-industries — {records.length} records</p>
        </div>
        <Button size="sm" onClick={scrapeAll} disabled={!!scraping} className="gap-1.5">
          <RefreshCw className="w-3 h-3" /> Scrape All
        </Button>
      </div>

      {/* Sub-industry scrape controls */}
      <div className="space-y-2">
        {industry.subs.map(sub => (
          <div key={sub} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground flex-1">{sub}</span>
            <Badge variant="outline" className="text-[8px]">{records.filter(r => r.sub_industry === sub).length} rec</Badge>
            <Select value={intervals[sub] || "manual"} onValueChange={v => setIntervals(p => ({ ...p, [sub]: v }))}>
              <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>{INTERVALS.map(i => <SelectItem key={i.value} value={i.value} className="text-xs">{i.label}</SelectItem>)}</SelectContent>
            </Select>
            <Switch checked={autoEnabled[sub] || false} onCheckedChange={v => setAutoEnabled(p => ({ ...p, [sub]: v }))} />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => scrapeSub(sub)} disabled={scraping === sub}>
              {scraping === sub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
          </div>
        ))}
      </div>

      {/* Records */}
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="h-8 text-xs" />
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-6 text-xs text-muted-foreground">No records — scrape sub-industries to populate</p>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {filtered.map(r => (
            <div key={r.id} className="glass-card rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[8px]">{r.sub_industry || r.category}</Badge>
                <span className="text-[10px] font-semibold text-foreground truncate">{r.title}</span>
              </div>
              <p className="text-[9px] text-muted-foreground line-clamp-2 mt-1">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}