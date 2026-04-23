import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Search, Globe, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataPageHeader, ScoreBadge, EmptyState } from "../shared/DataPageLayout";
import ConcreteContractorFinder from "./ConcreteContractorFinder";

const VERTICALS = ["All", "Retail", "Food & Bev", "Warehouse", "Automotive", "Healthcare", "Fitness", "Education", "Industrial", "Residential", "Government"];

export default function FindCompaniesView() {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [vertical, setVertical] = useState("All");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!keywords && !location) return;
    setLoading(true);
    const res = await base44.functions.invoke("customScraper", {
      keywords: keywords || "epoxy flooring, concrete polishing",
      state: location || "AZ",
      count: 15,
      industry: vertical === "All" ? "" : vertical,
    });
    setResults(res.data?.leads || []);
    setLoading(false);
  };

  return (
    <div>
      <DataPageHeader title="Find Companies" subtitle="AI-powered company discovery" />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Search</TabsTrigger>
          <TabsTrigger value="concrete">Concrete Contractors</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
      {/* Search bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Input placeholder="Keywords (e.g., epoxy flooring)" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="bg-card border-border" />
        <Input placeholder="State or City, State" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-card border-border" />
        <Select value={vertical} onValueChange={setVertical}>
          <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
          <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Find Companies
        </Button>
      </div>

      {results.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((c, i) => (
                  <tr key={i} className="hover:bg-card/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.company}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {c.website && <Globe className="w-3 h-3" />}
                        {c.website || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{c.contact_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{c.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{c.city}, {c.state}</td>
                    <td className="px-4 py-3"><ScoreBadge score={c.score} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.email && <a href={`mailto:${c.email}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Mail className="w-3.5 h-3.5" /></a>}
                        {c.phone && <a href={`tel:${c.phone}`} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Phone className="w-3.5 h-3.5" /></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !loading ? (
        <EmptyState icon={Building2} message="Search for companies by keyword, location, or industry" />
      ) : null}
        </TabsContent>

        <TabsContent value="concrete">
          <ConcreteContractorFinder />
        </TabsContent>
      </Tabs>
    </div>
  );
}