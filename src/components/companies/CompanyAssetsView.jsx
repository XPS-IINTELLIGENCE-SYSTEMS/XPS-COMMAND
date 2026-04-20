import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Globe, Share2, Search, Loader2, Play, RefreshCw, Database, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyDetailView from "./CompanyDetailView";

const COMPANIES = [
  {
    id: "xps",
    name: "Xtreme Polishing Systems",
    abbr: "XPS",
    website: "https://xtremepolishingsystems.com",
    color: "#d4af37",
    gradient: "from-yellow-600 via-amber-500 to-yellow-400",
    desc: "Premium epoxy & polishing equipment, coatings, and training",
    socials: ["facebook.com/xtremepolishingsystems", "instagram.com/xtremepolishingsystems", "youtube.com/@xtremepolishingsystems", "linkedin.com/company/xtreme-polishing-systems"],
  },
  {
    id: "ncp",
    name: "National Concrete Polishing",
    abbr: "NCP",
    website: "https://nationalconcretepolishing.com",
    color: "#6366f1",
    gradient: "from-indigo-600 via-violet-500 to-indigo-400",
    desc: "Commercial concrete polishing contractor — nationwide",
    socials: ["facebook.com/nationalconcretepolishing", "instagram.com/nationalconcretepolishing", "linkedin.com/company/national-concrete-polishing"],
  },
  {
    id: "xpress",
    name: "XPS Xpress",
    abbr: "XPRESS",
    website: "https://xpsxpress.com",
    color: "#22c55e",
    gradient: "from-green-600 via-emerald-500 to-green-400",
    desc: "E-commerce & distribution arm of XPS product line",
    socials: ["facebook.com/xpsxpress", "instagram.com/xpsxpress"],
  },
  {
    id: "cpu",
    name: "Concrete Polishing University",
    abbr: "CPU",
    website: "https://concretepolishinguniversity.com",
    color: "#f59e0b",
    gradient: "from-amber-600 via-orange-500 to-amber-400",
    desc: "Training, certification & education platform",
    socials: ["facebook.com/concretepolishinguniversity", "youtube.com/@concretepolishinguniversity"],
  },
];

export default function CompanyAssetsView() {
  const [selected, setSelected] = useState(null);
  const [scraping, setScraping] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const all = await base44.entities.IntelRecord.list("-created_date", 200);
    const c = {};
    COMPANIES.forEach(co => {
      c[co.id] = all.filter(r => r.source_company === co.abbr || r.source_company === co.name).length;
    });
    setCounts(c);
  };

  const runScrape = async (company) => {
    setScraping(company.id);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Research the company "${company.name}" (${company.website}). Find their latest products, services, pricing info, recent news, social media presence, reviews, team info, and any public business data. Also search: ${company.socials.join(", ")}. Return structured intelligence.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            findings: { type: "array", items: { type: "object", properties: {
              title: { type: "string" },
              category: { type: "string" },
              content: { type: "string" },
              source_url: { type: "string" },
              tags: { type: "string" }
            }}}
          }
        },
        model: "gemini_3_flash"
      });
      if (result?.findings?.length) {
        await base44.entities.IntelRecord.bulkCreate(
          result.findings.map(f => ({
            source_company: company.abbr,
            category: f.category === "social" ? "social_media" : f.category || "custom",
            title: f.title,
            content: f.content,
            source_url: f.source_url || company.website,
            source_type: "scraper",
            tags: f.tags || company.name,
            confidence_score: 80,
            scraped_at: new Date().toISOString(),
            is_indexed: true,
          }))
        );
      }
      loadCounts();
    } catch (e) {
      console.error(e);
    }
    setScraping(null);
  };

  if (selected) {
    return <CompanyDetailView company={selected} onBack={() => { setSelected(null); loadCounts(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 metallic-gold-icon" />
        <div>
          <h2 className="text-xl font-bold metallic-gold">Company Assets</h2>
          <p className="text-xs text-muted-foreground">Branded intelligence hubs for each XPS company</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMPANIES.map(co => (
          <div key={co.id} className="glass-card rounded-2xl overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]" onClick={() => setSelected(co)}>
            <div className={`h-2 bg-gradient-to-r ${co.gradient}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm" style={{ backgroundColor: `${co.color}20`, color: co.color }}>
                    {co.abbr}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{co.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{co.desc}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-primary truncate">{co.website}</span>
                <Share2 className="w-3 h-3 text-muted-foreground ml-auto" />
                <span className="text-[10px] text-muted-foreground">{co.socials.length} socials</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{counts[co.id] || 0} records</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px]"
                  onClick={(e) => { e.stopPropagation(); runScrape(co); }}
                  disabled={scraping === co.id}
                >
                  {scraping === co.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {scraping === co.id ? "Scraping..." : "Scrape Now"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}