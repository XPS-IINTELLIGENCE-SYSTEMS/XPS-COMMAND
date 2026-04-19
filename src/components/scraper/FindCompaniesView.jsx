import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Search, MapPin, Loader2, Star, Globe, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VERTICALS = [
  "All Verticals", "Retail", "Food & Bev", "Warehouse", "Automotive", "Healthcare",
  "Fitness", "Education", "Industrial", "Residential", "Government"
];

export default function FindCompaniesView() {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [vertical, setVertical] = useState("All Verticals");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!keywords && !location) return;
    setLoading(true);
    const res = await base44.functions.invoke("customScraper", {
      keywords: keywords || "epoxy flooring, concrete polishing",
      state: location || "AZ",
      count: 15,
      industry: vertical === "All Verticals" ? "" : vertical,
    });
    setResults(res.data?.leads || []);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Companies</h1>
          <p className="text-sm text-muted-foreground">AI-powered company discovery across industries and territories</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3">Company Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keywords (e.g., epoxy flooring)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="State or City, State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          <Select value={vertical} onValueChange={setVertical}>
            <SelectTrigger className="bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            Find Companies
          </Button>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">{results.length} Companies Found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left px-4 py-2.5 font-semibold">COMPANY</th>
                  <th className="text-left px-4 py-2.5 font-semibold">CONTACT</th>
                  <th className="text-left px-4 py-2.5 font-semibold">LOCATION</th>
                  <th className="text-left px-4 py-2.5 font-semibold">SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((c, i) => (
                  <tr key={i} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.company}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {c.website && <Globe className="w-3 h-3" />}
                        {c.website || "No website"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{c.contact_name || "—"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {c.email && <Mail className="w-3 h-3" />}
                        {c.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.city}, {c.state}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${c.score >= 70 ? "text-green-400" : c.score >= 50 ? "text-yellow-400" : "text-muted-foreground"}`}>
                        {c.score || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Search for companies by keyword, location, or industry</p>
        </div>
      )}
    </div>
  );
}