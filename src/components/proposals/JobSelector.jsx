import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Building2, MapPin, Ruler } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function JobSelector({ onSelect, selectedId }) {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CommercialJob.list('-created_date', 50).then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const filtered = jobs.filter(j =>
    (j.job_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/80">Select Commercial Job</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs…"
          className="pl-9 bg-white/5 border-white/10"
        />
      </div>
      <div className="max-h-52 overflow-y-auto space-y-1.5 scrollbar-hide">
        {loading && <p className="text-xs text-white/30 text-center py-4">Loading jobs…</p>}
        {!loading && filtered.length === 0 && <p className="text-xs text-white/30 text-center py-4">No jobs found</p>}
        {filtered.map(job => (
          <button
            key={job.id}
            onClick={() => onSelect(job)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedId === job.id
                ? "bg-primary/10 border-primary/30"
                : "bg-white/[0.03] border-white/8 hover:border-white/15"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-white truncate">{job.job_name}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city}, {job.state}</span>
              {(job.flooring_sqft || job.total_sqft) && (
                <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{(job.flooring_sqft || job.total_sqft)?.toLocaleString()} sqft</span>
              )}
              {job.takeoff_complete && <span className="text-primary">✓ Takeoff</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}