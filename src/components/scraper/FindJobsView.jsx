import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Briefcase, Search, MapPin, Building2, Loader2, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PROJECT_TYPES = [
  "All Types", "Warehouse", "Retail", "Restaurant", "Fitness", "Healthcare",
  "Industrial", "Data Center", "Hotel", "Automotive", "Brewery", "Food Processing", "Office", "Education"
];

export default function FindJobsView() {
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState("All Types");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!location) return;
    setLoading(true);
    const res = await base44.functions.invoke("jobsLeadScraper", { count: 15 });
    setResults(res.data?.leads || []);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Jobs</h1>
          <p className="text-sm text-muted-foreground">Discover commercial flooring projects and construction opportunities</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">New Job Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="City, State or ZIP"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Min sqft (optional)" className="pl-10 bg-secondary/50" />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search Jobs
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-sm font-semibold">{results.length} Jobs Found</span>
          </div>
          <div className="divide-y divide-border">
            {results.map((job, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{job.company}</div>
                  <div className="text-xs text-muted-foreground">{job.buyer_type || "Commercial"} • {job.value ? `$${job.value.toLocaleString()}` : ""}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>Score: {job.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a location and search to find commercial flooring jobs</p>
        </div>
      )}
    </div>
  );
}