import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Database, Search, Loader2, ArrowLeft, Play, RefreshCw, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import IndustryDetailView from "./IndustryDetailView";

const INDUSTRIES = [
  { id: "construction", label: "Construction", subs: ["Commercial", "Residential", "Industrial", "Government", "Infrastructure", "Renovation"] },
  { id: "flooring", label: "Flooring & Coatings", subs: ["Epoxy", "Polished Concrete", "Urethane", "Polyaspartic", "Stained Concrete", "Decorative", "Industrial Coatings"] },
  { id: "real_estate", label: "Real Estate", subs: ["Commercial", "Residential", "Industrial", "Mixed-Use", "REIT", "Property Management"] },
  { id: "manufacturing", label: "Manufacturing", subs: ["Chemical", "Equipment", "Materials", "Tooling", "Automotive", "Aerospace"] },
  { id: "technology", label: "Technology", subs: ["AI/ML", "SaaS", "Web Development", "Mobile", "Cloud", "Cybersecurity", "IoT"] },
  { id: "healthcare", label: "Healthcare", subs: ["Hospitals", "Clinics", "Pharma", "Medical Devices", "Biotech", "Dental"] },
  { id: "retail", label: "Retail & E-commerce", subs: ["Brick & Mortar", "E-commerce", "Wholesale", "Distribution", "Franchise"] },
  { id: "finance", label: "Finance & Insurance", subs: ["Banking", "Insurance", "Investment", "Crypto", "Fintech", "Accounting"] },
  { id: "energy", label: "Energy & Utilities", subs: ["Solar", "Oil & Gas", "Wind", "Nuclear", "Electric Utility", "Water"] },
  { id: "education", label: "Education", subs: ["K-12", "Higher Ed", "Trade Schools", "Online Learning", "Corporate Training", "Certification"] },
  { id: "food_bev", label: "Food & Beverage", subs: ["Restaurants", "Food Processing", "Breweries", "Catering", "Agriculture", "Distribution"] },
  { id: "logistics", label: "Logistics & Warehousing", subs: ["Trucking", "Shipping", "Warehousing", "3PL", "Supply Chain", "Last Mile"] },
  { id: "automotive", label: "Automotive", subs: ["Dealerships", "Repair", "Parts", "Fleet", "EV", "Racing"] },
  { id: "hospitality", label: "Hospitality & Travel", subs: ["Hotels", "Resorts", "Casinos", "Restaurants", "Entertainment", "Tourism"] },
  { id: "government", label: "Government & Defense", subs: ["Federal", "State", "Municipal", "Military", "Intelligence", "Contractors"] },
  { id: "media", label: "Media & Marketing", subs: ["Digital Marketing", "Advertising", "PR", "Social Media", "Content", "Branding"] },
  { id: "legal", label: "Legal Services", subs: ["Corporate Law", "Real Estate Law", "IP", "Litigation", "Compliance", "Employment"] },
  { id: "fitness", label: "Fitness & Wellness", subs: ["Gyms", "Yoga", "Nutrition", "MedSpa", "Physical Therapy", "Supplements"] },
  { id: "telecom", label: "Telecom", subs: ["Mobile", "ISP", "Cable", "VoIP", "Satellite", "Infrastructure"] },
  { id: "agriculture", label: "Agriculture", subs: ["Farming", "Livestock", "AgTech", "Organic", "Equipment", "Distribution"] },
];

const INTERVALS = [
  { value: "manual", label: "Manual" },
  { value: "1min", label: "1 Min" }, { value: "5min", label: "5 Min" },
  { value: "1hr", label: "1 Hour" }, { value: "24hr", label: "Daily" },
  { value: "3day", label: "3 Days" }, { value: "7day", label: "Weekly" },
  { value: "custom", label: "Custom" },
];

export default function MasterDatabaseView() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    setLoading(true);
    const all = await base44.entities.IntelRecord.list("-created_date", 500);
    setTotalRecords(all.length);
    const c = {};
    INDUSTRIES.forEach(ind => {
      c[ind.id] = all.filter(r => r.industry?.toLowerCase() === ind.label.toLowerCase() || r.tags?.toLowerCase().includes(ind.id)).length;
    });
    setCounts(c);
    setLoading(false);
  };

  if (selected) {
    return <IndustryDetailView industry={selected} onBack={() => { setSelected(null); loadCounts(); }} />;
  }

  const filtered = INDUSTRIES.filter(i => !search || i.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 metallic-gold-icon" />
          <div>
            <h2 className="text-xl font-bold metallic-gold">Master Database</h2>
            <p className="text-xs text-muted-foreground">{INDUSTRIES.length} industries — {totalRecords} total records indexed</p>
          </div>
        </div>
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search industries..." className="h-8 text-xs" />

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(ind => (
            <div key={ind.id} onClick={() => setSelected(ind)} className="glass-card rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-foreground">{ind.label}</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[9px]">{ind.subs.length} sub-industries</Badge>
                <Badge variant="outline" className="text-[9px]">{counts[ind.id] || 0} records</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {ind.subs.slice(0, 4).map(s => <span key={s} className="text-[8px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{s}</span>)}
                {ind.subs.length > 4 && <span className="text-[8px] text-muted-foreground">+{ind.subs.length - 4}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}