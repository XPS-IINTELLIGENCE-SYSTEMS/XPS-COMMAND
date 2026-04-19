import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Briefcase, MapPin, Star, Mail, Phone, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataPageHeader, DataSearchBar, FilterPills, StatusBadge, DataLoading, EmptyState } from "../shared/DataPageLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileJobCard from "../mobile/MobileJobCard";
import PullToRefresh from "../shared/PullToRefresh";

const PHASES = ["All", "permit_filed", "design", "pre_bid", "bidding", "under_construction", "complete"];
const PHASE_COLORS = {
  permit_filed: "bg-blue-500/10 text-blue-400",
  design: "bg-cyan-500/10 text-cyan-400",
  pre_bid: "bg-yellow-500/10 text-yellow-400",
  bidding: "bg-orange-500/10 text-orange-400",
  under_construction: "bg-green-500/10 text-green-400",
  complete: "bg-emerald-500/10 text-emerald-400",
  default: "bg-secondary text-muted-foreground",
};

export default function FindJobsView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await base44.entities.CommercialJob.list("-created_date", 200);
      setJobs(data || []);
      setLoading(false);
    })();
  }, []);

  const runScraper = async () => {
    setScraping(true);
    await base44.functions.invoke("jobsLeadScraper", { count: 15 });
    const data = await base44.entities.CommercialJob.list("-created_date", 200);
    setJobs(data || []);
    setScraping(false);
  };

  const filtered = jobs.filter(j => {
    if (phaseFilter !== "All" && j.project_phase !== phaseFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (j.job_name || "").toLowerCase().includes(s) || (j.city || "").toLowerCase().includes(s) || (j.gc_name || "").toLowerCase().includes(s);
    }
    return true;
  });

  const isMobile = useIsMobile();

  const reload = async () => {
    setLoading(true);
    const data = await base44.entities.CommercialJob.list("-created_date", 200);
    setJobs(data || []);
    setLoading(false);
  };

  if (loading) return <DataLoading />;

  return (
    <PullToRefresh onRefresh={reload}>
    <div>
      <div className="flex items-center justify-between mb-4">
        <DataPageHeader title="Find Jobs" subtitle="Commercial flooring projects & construction" count={filtered.length} />
        <Button size="sm" onClick={runScraper} disabled={scraping} className="gap-1.5">
          {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Scrape Jobs
        </Button>
      </div>

      <DataSearchBar value={search} onChange={setSearch} placeholder="Search jobs, cities, contractors..." />
      <FilterPills label="Phase" options={PHASES} active={phaseFilter} onChange={setPhaseFilter} />

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} message="No jobs found. Try running the scraper." />
      ) : isMobile ? (
        <div className="space-y-2">
          {filtered.map(job => (
            <MobileJobCard key={job.id} job={job} phaseColors={PHASE_COLORS} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Project</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Sqft</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Value</th>
                  <th className="text-left px-4 py-3 font-semibold">Phase</th>
                  <th className="text-left px-4 py-3 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(job => (
                  <tr key={job.id} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{job.job_name}</div>
                      <div className="text-xs text-muted-foreground">{job.gc_name || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{job.city}, {job.state}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground capitalize">{(job.project_type || "").replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs">{job.total_sqft ? job.total_sqft.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs font-semibold">{job.project_value ? `$${job.project_value.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.project_phase || "—"} colorMap={PHASE_COLORS} /></td>
                    <td className="px-4 py-3 text-xs font-bold">{job.lead_score || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}