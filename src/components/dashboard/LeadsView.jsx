import { Search, Filter, Plus, Phone, Mail, Sparkles, ArrowUpRight, MapPin, Building2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const leads = [
  { company: "Ace Hardware Distribution", contact: "Robert Chen", vertical: "Retail", location: "Tampa, FL", score: 92, stage: "Proposal", value: "$45,000", sqft: "12,000 sq ft", insight: "Viewed pricing 3x this week" },
  { company: "Tampa Bay Brewing Co.", contact: "Sarah Mills", vertical: "Food & Bev", location: "St. Petersburg, FL", score: 87, stage: "Qualified", value: "$28,000", sqft: "4,500 sq ft", insight: "Requested quote via website" },
  { company: "Gulf Coast Logistics", contact: "Diana Patel", vertical: "Warehouse", location: "Jacksonville, FL", score: 84, stage: "Proposal", value: "$120,000", sqft: "45,000 sq ft", insight: "Expansion permit filed" },
  { company: "Sunshine Auto Group", contact: "Mike Torres", vertical: "Automotive", location: "Orlando, FL", score: 79, stage: "Prospecting", value: "$62,000", sqft: "8,000 sq ft", insight: "Competitor contract expiring Q2" },
  { company: "Palm Medical Center", contact: "Dr. James Liu", vertical: "Healthcare", location: "Miami, FL", score: 76, stage: "Contacted", value: "$85,000", sqft: "22,000 sq ft", insight: "Budget approved for Q2 renovations" },
  { company: "Metro Fitness Chain", contact: "Lisa Wang", vertical: "Fitness", location: "Fort Lauderdale, FL", score: 73, stage: "New", value: "$34,000", sqft: "6,000 sq ft", insight: "Opening 3 new locations" },
  { company: "Coastal Warehousing Inc.", contact: "Tom Bradley", vertical: "Warehouse", location: "Clearwater, FL", score: 68, stage: "Qualified", value: "$52,000", sqft: "30,000 sq ft", insight: "Current floors showing damage" },
  { company: "Seminole School District", contact: "Jennifer Adams", vertical: "Education", location: "Sanford, FL", score: 65, stage: "New", value: "$95,000", sqft: "50,000 sq ft", insight: "Summer renovation window" },
];

function ScoreBadge({ score }) {
  const tier = score >= 85 ? "text-primary bg-primary/10" : score >= 70 ? "text-foreground/70 bg-secondary" : "text-muted-foreground bg-secondary/50";
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${tier}`}>{score}</span>;
}

function StageBadge({ stage }) {
  return <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">{stage}</span>;
}

export default function LeadsView() {
  const [search, setSearch] = useState("");
  const filtered = leads.filter(l => l.company.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-3 md:p-6 space-y-3 md:space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Leads</h1>
          <p className="text-[11px] text-muted-foreground">{filtered.length} prospects · Sorted by AI score</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5" /> <span className="hidden md:inline">Filter</span>
          </Button>
          <Button size="sm" className="h-9 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground">
            <Plus className="w-3.5 h-3.5" /> <span className="hidden md:inline">Add Lead</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 text-sm bg-card border-border rounded-xl"
        />
      </div>

      {/* Lead cards — works on both mobile and desktop */}
      <div className="space-y-2">
        {filtered.map((lead) => (
          <div key={lead.company} className="bg-card rounded-2xl border border-border p-3 md:p-4 hover:border-primary/20 transition-colors cursor-pointer">
            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{lead.company}</span>
                  <ScoreBadge score={lead.score} />
                  <StageBadge stage={lead.stage} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {lead.contact} · {lead.location} · {lead.sqft}
                </div>
              </div>
              <span className="text-base font-bold text-foreground flex-shrink-0 ml-3">{lead.value}</span>
            </div>

            {/* AI Insight */}
            <div className="flex items-start gap-2 mb-3 bg-primary/5 rounded-xl px-3 py-2">
              <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-foreground/80">{lead.insight}</span>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.97] transition-transform">
                <Phone className="w-3.5 h-3.5" /> Call
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium border border-border active:scale-[0.97] transition-transform">
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium border border-border active:scale-[0.97] transition-transform">
                <Sparkles className="w-3.5 h-3.5" /> Pitch
              </button>
              <div className="ml-auto">
                <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}