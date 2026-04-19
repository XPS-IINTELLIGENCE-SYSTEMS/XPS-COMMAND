import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, Plus, RefreshCcw, Send, Loader2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataSearchBar, StatusBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";
import { toast } from "@/components/ui/use-toast";

const REL_COLORS = {
  New: "bg-blue-500/10 text-blue-400",
  "Intro Sent": "bg-yellow-500/10 text-yellow-400",
  Responded: "bg-cyan-500/10 text-cyan-400",
  "Active Partner": "bg-emerald-500/10 text-emerald-400",
  "Past Partner": "bg-secondary text-muted-foreground",
  Declined: "bg-red-500/10 text-red-400",
  default: "bg-secondary text-muted-foreground",
};

const TYPES = ["All", "General Contractor", "Flooring Sub", "Concrete Sub", "Owner/Developer", "Property Manager", "Government Agency", "Architect"];
const US_STATES_SHORT = ["All","AZ","TX","FL","CA","NV","NY","IL","OH","GA","NC","PA","MI","NJ","VA","WA","CO"];

export default function ContractorDatabaseTab() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [scraping, setScraping] = useState(false);
  const [scrapeStates, setScrapeStates] = useState(["AZ"]);
  const [scrapeType, setScrapeType] = useState("General Contractor");
  const [sending, setSending] = useState({});
  const [showScraper, setShowScraper] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Contractor.list("-created_date", 500);
    setContractors(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const scrapeNow = async () => {
    setScraping(true);
    const res = await base44.functions.invoke("scrapeContractors", { states: scrapeStates, contractor_type: scrapeType, limit: 10 });
    toast({ title: `Found ${res.data?.contractors_found || 0} contractors` });
    setScraping(false);
    setShowScraper(false);
    load();
  };

  const sendIntro = async (id) => {
    setSending(p => ({ ...p, [id]: true }));
    await base44.functions.invoke("sendIntroPackage", { contractor_id: id });
    toast({ title: "Intro package sent!" });
    setSending(p => ({ ...p, [id]: false }));
    load();
  };

  const sendBulkIntros = async () => {
    const unsent = filtered.filter(c => !c.intro_sent && c.email);
    if (unsent.length === 0) { toast({ title: "No contractors to send to" }); return; }
    for (const c of unsent.slice(0, 10)) {
      await sendIntro(c.id);
    }
    toast({ title: `Sent ${Math.min(unsent.length, 10)} intro packages` });
  };

  const filtered = contractors.filter(c => {
    if (typeFilter !== "All" && c.contractor_type !== typeFilter) return false;
    if (stateFilter !== "All" && c.state !== stateFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (c.company_name || "").toLowerCase().includes(s) || (c.city || "").toLowerCase().includes(s) || (c.contact_name || "").toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) return <DataLoading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">Contractor Database</h2>
          <p className="text-xs text-muted-foreground">{contractors.length} total · {contractors.filter(c => c.intro_sent).length} intros sent</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="w-3.5 h-3.5" /></Button>
          <Button variant="outline" size="sm" onClick={sendBulkIntros} className="gap-1"><Send className="w-3.5 h-3.5" /> Bulk Intro</Button>
          <Button size="sm" onClick={() => setShowScraper(!showScraper)} className="gap-1"><Plus className="w-3.5 h-3.5" /> Scrape New</Button>
        </div>
      </div>

      {showScraper && (
        <div className="glass-card rounded-xl p-4 mb-4">
          <div className="mb-3">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">States</label>
            <div className="flex gap-1 flex-wrap">
              {US_STATES_SHORT.slice(1).map(s => (
                <button key={s} onClick={() => setScrapeStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={`px-2 py-0.5 rounded text-[10px] border ${scrapeStates.includes(s) ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Type</label>
            <div className="flex gap-1 flex-wrap">
              {TYPES.slice(1).map(t => (
                <button key={t} onClick={() => setScrapeType(t)}
                  className={`px-2 py-0.5 rounded text-[10px] border ${scrapeType === t ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{t}</button>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={scrapeNow} disabled={scraping} className="gap-1">
            {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {scraping ? "Scraping..." : "Scrape Contractors"}
          </Button>
        </div>
      )}

      <DataSearchBar value={search} onChange={setSearch} placeholder="Search contractors..." />

      <div className="flex gap-1.5 flex-wrap mb-4">
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium border ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {US_STATES_SHORT.map(s => (
          <button key={s} onClick={() => setStateFilter(s)}
            className={`px-2 py-0.5 rounded text-[10px] border ${stateFilter === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border"}`}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon={Users} message="No contractors found" /> : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.company_name}</div>
                      <div className="text-xs text-muted-foreground">{c.contact_name}{c.title ? ` — ${c.title}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{c.contractor_type}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{c.city}, {c.state}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.relationship_status || "New"} colorMap={REL_COLORS} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!c.intro_sent && c.email && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => sendIntro(c.id)} disabled={sending[c.id]}>
                            {sending[c.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Send Intro
                          </Button>
                        )}
                        {c.email && <a href={`mailto:${c.email}`} className="p-1 rounded hover:bg-secondary text-muted-foreground"><Mail className="w-3.5 h-3.5" /></a>}
                        {c.phone && <a href={`tel:${c.phone}`} className="p-1 rounded hover:bg-secondary text-muted-foreground"><Phone className="w-3.5 h-3.5" /></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}