import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, Loader2, Play, Database, Download, Search, FileText, Building2, Users, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const HARVEST_SOURCES = [
  { id: "web_intel", label: "Web Intel", desc: "Business websites & directories", icon: Search },
  { id: "gov_contracts", label: "Gov Contracts", desc: "SAM.gov, FPDS, grants.gov", icon: FileText },
  { id: "company_profiles", label: "Company Profiles", desc: "LinkedIn, Crunchbase, D&B", icon: Building2 },
  { id: "contact_mining", label: "Contact Mining", desc: "Find decision-makers", icon: Users },
  { id: "market_trends", label: "Market Trends", desc: "Industry reports & news", icon: TrendingUp },
];

const INDUSTRIES = [
  "Commercial Flooring", "Epoxy Coatings", "Polished Concrete", "Construction General",
  "Industrial Manufacturing", "Restaurant/Food Service", "Healthcare Facilities",
  "Retail/Warehouse", "Government/Military", "Automotive", "Education", "Custom"
];

export default function KeyHarvesterPanel() {
  const [query, setQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState(["web_intel"]);
  const [industry, setIndustry] = useState("Commercial Flooring");
  const [geoFilter, setGeoFilter] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [running, setRunning] = useState(false);
  const [harvested, setHarvested] = useState(null);

  const toggleSource = (id) => {
    setSelectedSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const runHarvest = async () => {
    if (!query.trim()) return;
    setRunning(true);
    setHarvested(null);

    const sourceLabels = selectedSources.map(s => HARVEST_SOURCES.find(h => h.id === s)?.label).join(", ");

    const prompt = `You are a business intelligence harvester. Research and extract key data about:

QUERY: ${query}
INDUSTRY: ${industry}
GEO FILTER: ${geoFilter || "Nationwide USA"}
SOURCES TO PRIORITIZE: ${sourceLabels}
MAX RESULTS: ${maxResults}

Extract and organize:
1. COMPANIES — Name, website, city/state, employee count, revenue estimate, key contacts, specialty
2. CONTACTS — Decision-makers with titles, emails, phone numbers
3. MARKET DATA — Industry size, growth rate, avg deal size, seasonal trends
4. OPPORTUNITIES — Active bids, projects, RFPs, permit filings
5. COMPETITIVE INTELLIGENCE — Who's winning work, pricing intel, market share
6. KEY INSIGHTS — Strategic takeaways and actionable recommendations

Be extremely thorough. Return real, actionable business intelligence.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          companies: { type: "array", items: { type: "object", properties: { name: { type: "string" }, website: { type: "string" }, location: { type: "string" }, employees: { type: "string" }, revenue: { type: "string" }, specialty: { type: "string" }, key_contact: { type: "string" }, contact_email: { type: "string" } } } },
          contacts: { type: "array", items: { type: "object", properties: { name: { type: "string" }, title: { type: "string" }, company: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, linkedin: { type: "string" } } } },
          market_data: { type: "object", properties: { industry_size: { type: "string" }, growth_rate: { type: "string" }, avg_deal_size: { type: "string" }, trends: { type: "array", items: { type: "string" } } } },
          opportunities: { type: "array", items: { type: "object", properties: { title: { type: "string" }, type: { type: "string" }, location: { type: "string" }, value: { type: "string" }, deadline: { type: "string" }, source: { type: "string" } } } },
          competitive_intel: { type: "array", items: { type: "object", properties: { competitor: { type: "string" }, market_share: { type: "string" }, pricing: { type: "string" }, strength: { type: "string" }, weakness: { type: "string" } } } },
          insights: { type: "array", items: { type: "string" } },
          total_records_found: { type: "number" }
        }
      }
    });

    setHarvested(result);

    // Save key findings to IntelRecord
    await base44.entities.IntelRecord.create({
      title: `Key Harvest: ${query}`,
      category: "industry_data",
      source_company: "Custom",
      industry,
      sub_industry: query,
      source_type: "llm",
      summary: result.insights?.join(" | ") || "",
      content: JSON.stringify(result),
      metadata: JSON.stringify({ sources: selectedSources, geo: geoFilter, query }),
      confidence_score: 75,
      is_indexed: true,
      scraped_at: new Date().toISOString()
    });

    // Auto-import companies as leads if found
    if (result.companies?.length > 0) {
      const leadsToCreate = result.companies.slice(0, 10).filter(c => c.name).map(c => ({
        company: c.name,
        contact_name: c.key_contact || "Unknown",
        email: c.contact_email || "",
        website: c.website || "",
        location: c.location || "",
        vertical: "Other",
        stage: "Incoming",
        pipeline_status: "Incoming",
        ingestion_source: "Other",
        source: `Key Harvester: ${query}`,
        ai_insight: `${c.specialty || ""} — ${c.revenue || ""} — ${c.employees || ""} employees`
      }));
      await base44.entities.Lead.bulkCreate(leadsToCreate);
    }

    setRunning(false);
    toast({ title: `Harvested ${result.total_records_found || "multiple"} records! ${result.companies?.length || 0} companies imported as leads.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-foreground">Key Harvester</h3>
        <Badge variant="secondary" className="text-[9px]">Multi-Source Intelligence</Badge>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <Input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="What to harvest... e.g. 'Epoxy flooring contractors in Texas with 10+ employees'"
          className="text-sm" />

        {/* Sources */}
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 block">Intelligence Sources</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {HARVEST_SOURCES.map(s => {
              const Icon = s.icon;
              const active = selectedSources.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSource(s.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${active ? "border-amber-500/40 bg-amber-500/10" : "border-border hover:border-amber-500/20"}`}>
                  <Icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${active ? "text-amber-400" : "text-muted-foreground"}`} />
                  <span className="text-[9px] font-medium text-foreground block">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground">
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Geography</label>
            <Input value={geoFilter} onChange={e => setGeoFilter(e.target.value)}
              placeholder="e.g. Texas, Southeast US" className="text-xs h-8" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Max Results</label>
            <select value={maxResults} onChange={e => setMaxResults(Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground">
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <Button onClick={runHarvest} disabled={running || !query.trim()} className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white h-11">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {running ? "Harvesting intelligence..." : "Run Key Harvest"}
        </Button>
      </div>

      {/* Results */}
      {harvested && (
        <div className="space-y-4">
          {/* Companies */}
          {harvested.companies?.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <label className="text-xs font-bold text-foreground">Companies ({harvested.companies.length})</label>
                <Badge className="text-[8px]">Auto-imported to Leads</Badge>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {harvested.companies.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground">{c.name}</span>
                      {c.location && <span className="text-muted-foreground ml-2">{c.location}</span>}
                    </div>
                    {c.specialty && <span className="text-[10px] text-primary truncate max-w-32">{c.specialty}</span>}
                    {c.revenue && <Badge variant="secondary" className="text-[8px] flex-shrink-0">{c.revenue}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          {harvested.contacts?.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <label className="text-xs font-bold text-foreground">Contacts ({harvested.contacts.length})</label>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {harvested.contacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-card/50 border border-border text-[11px]">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className="text-muted-foreground">{c.title}</span>
                    {c.email && <span className="text-primary font-mono">{c.email}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {harvested.opportunities?.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <label className="text-xs font-bold text-foreground">Opportunities ({harvested.opportunities.length})</label>
              </div>
              <div className="space-y-1.5">
                {harvested.opportunities.map((o, i) => (
                  <div key={i} className="p-2 rounded-lg bg-card/50 border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{o.title}</span>
                      {o.value && <Badge variant="secondary" className="text-[8px]">{o.value}</Badge>}
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                      {o.location && <span>{o.location}</span>}
                      {o.deadline && <span>Due: {o.deadline}</span>}
                      {o.source && <span>Source: {o.source}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {harvested.insights?.length > 0 && (
            <div className="glass-card rounded-xl p-4">
              <label className="text-[10px] font-semibold text-amber-400 uppercase mb-2 block">Strategic Insights</label>
              <ul className="space-y-1">
                {harvested.insights.map((ins, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-2">
                    <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" /> {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}