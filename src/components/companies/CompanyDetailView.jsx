import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Database, RefreshCw, Loader2, Globe, Share2, Search, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CompanyDetailView({ company, onBack }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    const all = await base44.entities.IntelRecord.list("-created_date", 200);
    setRecords(all.filter(r => r.source_company === company.abbr || r.source_company === company.name));
    setLoading(false);
  };

  const runScrape = async () => {
    setScraping(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Deep research "${company.name}" (${company.website}). Get: latest products, pricing, services, recent news, reviews, social posts, team members, job postings, financial info. Also check: ${company.socials.join(", ")}. Be thorough.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            findings: { type: "array", items: { type: "object", properties: {
              title: { type: "string" }, category: { type: "string" }, content: { type: "string" },
              source_url: { type: "string" }, tags: { type: "string" }
            }}}
          }
        },
        model: "gemini_3_flash"
      });
      if (result?.findings?.length) {
        await base44.entities.IntelRecord.bulkCreate(
          result.findings.map(f => ({
            source_company: company.abbr,
            category: f.category || "custom",
            title: f.title, content: f.content,
            source_url: f.source_url || company.website,
            source_type: "scraper", tags: f.tags || company.name,
            confidence_score: 80, scraped_at: new Date().toISOString(), is_indexed: true,
          }))
        );
        loadRecords();
      }
    } catch (e) { console.error(e); }
    setScraping(false);
  };

  const deleteRecord = async (id) => {
    await base44.entities.IntelRecord.delete(id);
    setRecords(records.filter(r => r.id !== id));
  };

  const filtered = records.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.content?.toLowerCase().includes(search.toLowerCase()) ||
    r.tags?.toLowerCase().includes(search.toLowerCase())
  );

  const catCounts = {};
  records.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs" style={{ backgroundColor: `${company.color}20`, color: company.color }}>
          {company.abbr}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{company.name}</h2>
          <p className="text-[10px] text-muted-foreground">{records.length} intel records</p>
        </div>
        <Button size="sm" onClick={runScrape} disabled={scraping} className="gap-1.5">
          {scraping ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {scraping ? "Scraping..." : "Deep Scrape"}
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(catCounts).map(([cat, count]) => (
          <Badge key={cat} variant="outline" className="text-[10px]">{cat}: {count}</Badge>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search intel records..." className="pl-9 h-8 text-xs" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Database className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">No records yet — hit "Deep Scrape" to start</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {filtered.map(r => (
            <div key={r.id} className="glass-card rounded-xl p-3 space-y-1.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px]">{r.category}</Badge>
                    <span className="text-xs font-semibold text-foreground truncate">{r.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{r.content}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {r.source_url && (
                    <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-secondary">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  <button onClick={() => deleteRecord(r.id)} className="p-1 rounded hover:bg-destructive/20">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
              {r.tags && <div className="flex flex-wrap gap-1">{r.tags.split(",").map((t, i) => <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t.trim()}</span>)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}