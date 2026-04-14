import { useState } from "react";
import { Search, Loader2, MapPin, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const INDUSTRIES = [
  "Commercial", "Industrial", "Retail", "Food & Bev", "Healthcare",
  "Automotive", "Warehouse", "Fitness", "Education", "Residential",
  "Government", "Manufacturing", "Hospitality", "Other"
];

const CATEGORIES = [
  "All", "Permits & New Builds", "New Business Filings", "Commercial Real Estate", "Facility Upgrades"
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
  "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export default function LeadScraperTool({ onChatCommand, workflowColor }) {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [industry, setIndustry] = useState("Commercial");
  const [category, setCategory] = useState("All");
  const [leadType, setLeadType] = useState("Businesses");
  const [count, setCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const scrape = async () => {
    if (!city.trim() || !state) {
      setError("City and State are required");
      return;
    }
    setError("");
    setLoading(true);
    setResults([]);

    const targetCount = parseInt(count) || 10;
    const location = `${city.trim()}, ${state}`;
    const signalType = category === "Permits & New Builds" ? "permits"
      : category === "New Business Filings" ? "filings"
      : category === "Commercial Real Estate" ? "real_estate"
      : category === "Facility Upgrades" ? "facilities" : "all";

    const result = await base44.functions.invoke("leadScraper", {
      location,
      industry,
      count: targetCount,
      vertical: industry,
      signal_type: signalType,
      keywords: leadType === "Jobs" ? "contract work, project, RFP, bid" : ""
    });

    const leads = result?.data?.leads || [];
    setResults(leads);

    // If fewer leads returned than requested, show note
    if (leads.length < targetCount) {
      setError(`Found ${leads.length} of ${targetCount} requested. Refine your search or try a different location.`);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Row 1: City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />CITY</label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Tampa" className="bg-white/[0.04] border-white/[0.1] text-white" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">STATE</label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Industry + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium flex items-center gap-1"><Building2 className="w-3 h-3" />INDUSTRY</label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">CATEGORY</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Lead Type + Count */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium flex items-center gap-1"><Briefcase className="w-3 h-3" />TYPE</label>
          <Select value={leadType} onValueChange={setLeadType}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Businesses">Businesses</SelectItem>
              <SelectItem value="Jobs">Jobs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-medium">COUNT</label>
          <Select value={count} onValueChange={setCount}>
            <SelectTrigger className="bg-white/[0.04] border-white/[0.1] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 15, 20, 25, 30, 40, 50].map(n => (
                <SelectItem key={n} value={String(n)}>{n} leads</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <div className="text-xs text-yellow-400 bg-yellow-400/10 rounded-lg px-3 py-2">{error}</div>}

      <Button onClick={scrape} disabled={loading} className="gap-2 w-full" style={{ backgroundColor: workflowColor }}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {loading ? `Scraping ${count} leads...` : `Find ${count} Leads`}
      </Button>

      {results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-xs text-white font-semibold">{results.length} leads found & saved to CRM</div>
          {results.map((r, i) => (
            <div key={i} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white font-medium">{r.company}</div>
                {r.score && <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">{r.score}</div>}
              </div>
              <div className="text-xs text-white/40 mt-0.5">
                {r.signal && <span className="text-primary/80">[{r.signal}] </span>}
                {r.value ? `$${r.value.toLocaleString()} · ` : ""}{r.source || ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}