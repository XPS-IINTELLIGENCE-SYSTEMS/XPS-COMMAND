import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Database, Search, Loader2, Building2, Users, Briefcase, RefreshCw, Filter, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProfileCard from "./ProfileCard";

const TABS = [
  { id: "all", label: "All Records", icon: Database },
  { id: "Lead", label: "Companies", icon: Building2 },
  { id: "ContractorCompany", label: "Contractors", icon: Users },
  { id: "CommercialJob", label: "Jobs", icon: Briefcase },
];

export default function MasterDatabaseView() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterProfiled, setFilterProfiled] = useState("all");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [refreshingId, setRefreshingId] = useState(null);
  const [bulkProfileRunning, setBulkProfileRunning] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [l, c, j] = await Promise.all([
      base44.entities.Lead.list("-created_date", 200),
      base44.entities.ContractorCompany.list("-created_date", 200),
      base44.entities.CommercialJob.list("-created_date", 200),
    ]);
    setLeads(l);
    setContractors(c);
    setJobs(j);
    setLoading(false);
  };

  const refreshProfile = async (entityType, entityId) => {
    setRefreshingId(entityId);
    try {
      await base44.functions.invoke("autoProfileBuilder", { entity_type: entityType, entity_id: entityId });
      await loadAll();
    } catch (e) { console.error(e); }
    setRefreshingId(null);
  };

  const bulkProfile = async () => {
    setBulkProfileRunning(true);
    // Profile unprocessed records (those without profile data)
    const unprofiledLeads = leads.filter(l => !l.profile_data).slice(0, 5);
    const unprofiledContractors = contractors.filter(c => !c.notes?.startsWith("PROFILE:")).slice(0, 5);
    const unprofiledJobs = jobs.filter(j => !j.notes?.startsWith("FULL PROFILE:")).slice(0, 5);

    for (const l of unprofiledLeads) {
      await base44.functions.invoke("autoProfileBuilder", { entity_type: "Lead", entity_id: l.id }).catch(() => {});
    }
    for (const c of unprofiledContractors) {
      await base44.functions.invoke("autoProfileBuilder", { entity_type: "ContractorCompany", entity_id: c.id }).catch(() => {});
    }
    for (const j of unprofiledJobs) {
      await base44.functions.invoke("autoProfileBuilder", { entity_type: "CommercialJob", entity_id: j.id }).catch(() => {});
    }
    await loadAll();
    setBulkProfileRunning(false);
  };

  // Build unified list
  const allRecords = [
    ...leads.map(r => ({ ...r, _type: "Lead" })),
    ...contractors.map(r => ({ ...r, _type: "ContractorCompany" })),
    ...jobs.map(r => ({ ...r, _type: "CommercialJob" })),
  ];

  // Filter by tab
  const tabFiltered = activeTab === "all" ? allRecords : allRecords.filter(r => r._type === activeTab);

  // Filter by search
  const searchFiltered = tabFiltered.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = (r.company || r.company_name || r.job_name || "").toLowerCase();
    const loc = `${r.city || ""} ${r.state || ""}`.toLowerCase();
    const email = (r.email || r.gc_email || r.owner_email || "").toLowerCase();
    const contact = (r.contact_name || r.preconstruction_contact_name || r.gc_contact || "").toLowerCase();
    return name.includes(s) || loc.includes(s) || email.includes(s) || contact.includes(s);
  });

  // Filter by profile status
  const profileFiltered = searchFiltered.filter(r => {
    if (filterProfiled === "all") return true;
    const hasProfile = r._type === "Lead" ? !!r.profile_data : r._type === "CommercialJob" ? r.notes?.startsWith("FULL PROFILE:") : r.notes?.startsWith("PROFILE:");
    return filterProfiled === "profiled" ? hasProfile : !hasProfile;
  });

  // Sort
  const sorted = [...profileFiltered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
    if (sortBy === "score") return (b.score || b.lead_score || 0) - (a.score || a.lead_score || 0);
    if (sortBy === "name") return (a.company || a.company_name || a.job_name || "").localeCompare(b.company || b.company_name || b.job_name || "");
    return 0;
  });

  const totalProfiled = allRecords.filter(r =>
    r._type === "Lead" ? !!r.profile_data :
    r._type === "CommercialJob" ? r.notes?.startsWith("FULL PROFILE:") :
    r.notes?.startsWith("PROFILE:")
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 metallic-gold-icon" />
          <div>
            <h2 className="text-xl font-bold metallic-gold">Master Database</h2>
            <p className="text-[10px] text-muted-foreground">
              {allRecords.length} total records — {totalProfiled} profiled — {leads.length} companies, {contractors.length} contractors, {jobs.length} jobs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1.5" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Reload
          </Button>
          <Button size="sm" className="text-[10px] h-7 gap-1.5 metallic-gold-bg text-background" onClick={bulkProfile} disabled={bulkProfileRunning}>
            {bulkProfileRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {bulkProfileRunning ? "Profiling..." : "Bulk Profile"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === "all" ? allRecords.length : allRecords.filter(r => r._type === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? "metallic-gold-bg text-background" : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
              <span className="text-[9px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, location, email, contact..." className="h-8 text-xs pl-8" />
          </div>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-32 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-xs">Newest First</SelectItem>
            <SelectItem value="oldest" className="text-xs">Oldest First</SelectItem>
            <SelectItem value="score" className="text-xs">Highest Score</SelectItem>
            <SelectItem value="name" className="text-xs">A → Z</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterProfiled} onValueChange={setFilterProfiled}>
          <SelectTrigger className="h-8 w-32 text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Status</SelectItem>
            <SelectItem value="profiled" className="text-xs">Profiled</SelectItem>
            <SelectItem value="unprofiled" className="text-xs">Needs Profile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count bar */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>Showing {sorted.length} of {allRecords.length}</span>
        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full metallic-gold-bg transition-all" style={{ width: `${allRecords.length > 0 ? (totalProfiled / allRecords.length) * 100 : 0}%` }} />
        </div>
        <span>{totalProfiled} profiled ({allRecords.length > 0 ? Math.round((totalProfiled / allRecords.length) * 100) : 0}%)</span>
      </div>

      {/* Records */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <Database className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No records match your filters</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
          {sorted.map(record => (
            <ProfileCard
              key={`${record._type}-${record.id}`}
              record={record}
              entityType={record._type}
              onRefresh={() => refreshProfile(record._type, record.id)}
              refreshing={refreshingId === record.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}