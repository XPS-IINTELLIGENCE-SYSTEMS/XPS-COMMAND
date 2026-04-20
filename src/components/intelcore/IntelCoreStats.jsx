import { Database, Building2, MapPin, Youtube, DollarSign, Hash, Globe, Users } from "lucide-react";

const STATS = [
  { key: "total", label: "Total Intel", icon: Database, color: "#d4af37" },
  { key: "brands", label: "Brand Intel", icon: Building2, color: "#6366f1" },
  { key: "pricing", label: "Pricing", icon: DollarSign, color: "#22c55e" },
  { key: "social", label: "Social & Video", icon: Youtube, color: "#ec4899" },
  { key: "locations", label: "Locations", icon: MapPin, color: "#0ea5e9" },
  { key: "keywords", label: "Keywords", icon: Hash, color: "#f59e0b" },
  { key: "team", label: "Team Intel", icon: Users, color: "#a855f7" },
  { key: "fresh", label: "Live / Recent", icon: Globe, color: "#22c55e" },
];

export default function IntelCoreStats({ records }) {
  const s = {
    total: records.length,
    brands: records.filter(r => ["XPS","NCP","CPU","XPS Xpress","Epoxy Network","XPS Intelligence"].includes(r.source_company)).length,
    pricing: records.filter(r => r.category === "pricing" || r.pricing_data).length,
    social: records.filter(r => ["social_media","youtube","video"].includes(r.category)).length,
    locations: records.filter(r => r.category === "location" || r.source_company === "XPS Location").length,
    keywords: records.filter(r => ["keywords","seo"].includes(r.category)).length,
    team: records.filter(r => r.category === "team").length,
    fresh: records.filter(r => r.data_freshness === "live" || r.data_freshness === "recent").length,
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {STATS.map(st => (
        <div key={st.key} className="glass-card rounded-lg p-2 text-center">
          <st.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: st.color }} />
          <div className="text-sm font-bold text-foreground">{s[st.key]}</div>
          <div className="text-[9px] text-muted-foreground leading-tight">{st.label}</div>
        </div>
      ))}
    </div>
  );
}