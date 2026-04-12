import { Search, Filter, Plus, Star, MapPin, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const leads = [
  { company: "Ace Hardware Distribution", contact: "Robert Chen", email: "robert@acehw.com", rating: 4.6, reviews: 128, vertical: "Retail", location: "Tampa, FL", score: 92, stage: "Proposal", value: "$45,000", stageColor: "bg-xps-orange/20 text-xps-orange" },
  { company: "Tampa Bay Brewing Co.", contact: "Sarah Mills", email: "sarah@tbbrewing.com", rating: 4.8, reviews: 89, vertical: "Food & Bev", location: "St. Petersburg, FL", score: 87, stage: "Qualified", value: "$28,000", stageColor: "bg-xps-green/20 text-xps-green" },
  { company: "Sunshine Auto Group", contact: "Mike Torres", email: "mike@sunshineauto.com", rating: 4.2, reviews: 256, vertical: "Automotive", location: "Orlando, FL", score: 84, stage: "Prospecting", value: "$62,000", stageColor: "bg-muted-foreground/20 text-muted-foreground" },
  { company: "Gulf Coast Logistics", contact: "Diana Patel", email: "diana@gulfcoast.com", rating: 4.4, reviews: 67, vertical: "Warehouse", location: "Jacksonville, FL", score: 79, stage: "Proposal", value: "$120,000", stageColor: "bg-xps-orange/20 text-xps-orange" },
  { company: "Palm Medical Center", contact: "Dr. James Liu", email: "jliu@palmmed.org", rating: 4.7, reviews: 312, vertical: "Healthcare", location: "Miami, FL", score: 76, stage: "Contacted", value: "$85,000", stageColor: "bg-xps-blue/20 text-xps-blue" },
  { company: "Metro Fitness Chain", contact: "Lisa Wang", email: "lisa@metrofit.com", rating: 4.1, reviews: 145, vertical: "Fitness", location: "Fort Lauderdale, FL", score: 73, stage: "New", value: "$34,000", stageColor: "bg-muted-foreground/20 text-muted-foreground" },
  { company: "Coastal Warehousing Inc.", contact: "Tom Bradley", email: "tom@coastalwh.com", rating: 3.9, reviews: 42, vertical: "Warehouse", location: "Clearwater, FL", score: 68, stage: "Qualified", value: "$52,000", stageColor: "bg-xps-green/20 text-xps-green" },
  { company: "Seminole School District", contact: "Jennifer Adams", email: "jadams@seminoleschools.edu", rating: 4.3, reviews: 78, vertical: "Education", location: "Sanford, FL", score: 65, stage: "New", value: "$95,000", stageColor: "bg-muted-foreground/20 text-muted-foreground" },
];

export default function LeadsView() {
  const [search, setSearch] = useState("");
  const filtered = leads.filter(l => l.company.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-3 md:p-6 space-y-3 md:space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Lead Intelligence</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{filtered.length} active leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Filter className="w-3 h-3" /> <span className="hidden md:inline">Filter</span>
          </Button>
          <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-3 h-3" /> <span className="hidden md:inline">Add Lead</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm bg-secondary/50 border-border"
        />
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-2">
        {filtered.map((lead) => (
          <div key={lead.company} className="bg-card rounded-lg border border-border p-3 active:bg-secondary/30 cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{lead.company}</div>
                  <div className="text-xs text-muted-foreground">{lead.contact}</div>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground flex-shrink-0">{lead.value}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.location}</span>
                <span>·</span>
                <span>{lead.vertical}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Score: {lead.score}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${lead.stageColor}`}>{lead.stage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Company</th>
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Contact</th>
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Vertical</th>
              <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Location</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Score</th>
              <th className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Stage</th>
              <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.company} className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary">{lead.company}</div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star className="w-2.5 h-2.5 fill-primary text-primary" /> {lead.rating} ({lead.reviews})
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-foreground">{lead.contact}</div>
                  <div className="text-[10px] text-muted-foreground">{lead.email}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.vertical}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {lead.location}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-bold text-foreground">{lead.score}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${lead.stageColor}`}>{lead.stage}</span>
                </td>
                <td className="px-4 py-3 text-right text-xs font-semibold text-foreground">{lead.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}