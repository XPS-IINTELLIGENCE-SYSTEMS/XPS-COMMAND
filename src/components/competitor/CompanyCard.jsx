import { Star, MapPin, Users, Award, Globe, Shield } from "lucide-react";

function RatingStars({ rating }) {
  if (!rating) return <span className="text-xs text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-sm font-bold text-foreground ml-1">{rating}</span>
    </div>
  );
}

export default function CompanyCard({ data, label, accentColor }) {
  if (!data) return null;

  const borderColor = accentColor === "gold" ? "border-primary/30" : "border-red-500/30";
  const accentText = accentColor === "gold" ? "text-primary" : "text-red-400";
  const accentBg = accentColor === "gold" ? "bg-primary/10" : "bg-red-500/10";

  return (
    <div className={`glass-card rounded-2xl p-5 border ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center`}>
          <Globe className={`w-5 h-5 ${accentText}`} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <h3 className="text-lg font-extrabold text-foreground">{data.company_name}</h3>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-secondary/30 p-3">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Google Rating</div>
          <RatingStars rating={data.google_rating} />
          <div className="text-[10px] text-muted-foreground mt-0.5">{data.review_count ? `${data.review_count} reviews` : ""}</div>
        </div>
        <div className="rounded-xl bg-secondary/30 p-3">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">BBB Rating</div>
          <div className="text-lg font-bold text-foreground">{data.bbb_rating || "N/A"}</div>
        </div>
        <div className="rounded-xl bg-secondary/30 p-3">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Market Position</div>
          <div className="text-sm font-semibold text-foreground">{data.market_position || "Unknown"}</div>
        </div>
        <div className="rounded-xl bg-secondary/30 p-3">
          <div className="text-[10px] text-muted-foreground uppercase font-semibold">Employees</div>
          <div className="text-sm font-semibold text-foreground">{data.employee_estimate || "Unknown"}</div>
        </div>
      </div>

      {/* Company Info */}
      <div className="space-y-2 mb-4">
        {data.tagline && <p className="text-xs italic text-muted-foreground">"{data.tagline}"</p>}
        {data.service_area && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" /> {data.service_area}
          </div>
        )}
        {data.certifications && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="w-3 h-3 flex-shrink-0" /> {data.certifications}
          </div>
        )}
        {data.social_presence && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3 h-3 flex-shrink-0" /> {data.social_presence}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Products & Services</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {(data.products || []).map((p, i) => (
            <div key={i} className={`rounded-lg p-3 border border-border/50 ${p.is_flagship ? accentBg : "bg-secondary/20"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{p.name}</span>
                {p.is_flagship && <span className={`text-[9px] font-bold ${accentText} uppercase`}>Flagship</span>}
              </div>
              <div className="text-[10px] text-muted-foreground">{p.category}</div>
              {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
              {p.price_range && <div className={`text-xs font-semibold mt-1 ${accentText}`}>{p.price_range}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Pricing</h4>
        <div className="rounded-xl bg-secondary/30 p-3">
          <div className="text-sm text-foreground">{data.pricing_model || "No pricing info"}</div>
          {(data.price_range_low || data.price_range_high) && (
            <div className={`text-sm font-bold ${accentText} mt-1`}>
              {data.price_range_low} — {data.price_range_high}
            </div>
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2">Strengths</h4>
          <ul className="space-y-1">
            {(data.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <Shield className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">Weaknesses</h4>
          <ul className="space-y-1">
            {(data.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <Shield className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" /> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reputation */}
      {data.reputation_summary && (
        <div className="mt-4 rounded-xl bg-secondary/20 p-3 border border-border/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Reputation Summary</h4>
          <p className="text-xs text-foreground">{data.reputation_summary}</p>
        </div>
      )}
    </div>
  );
}