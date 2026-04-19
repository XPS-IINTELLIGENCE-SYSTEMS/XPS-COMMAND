import { Target, DollarSign, Package, Megaphone, AlertTriangle, Trophy } from "lucide-react";

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function RecommendationsPanel({ data }) {
  if (!data) return null;

  const threatColor = data.threat_level >= 7 ? "text-red-400" : data.threat_level >= 4 ? "text-yellow-400" : "text-green-400";
  const threatBg = data.threat_level >= 7 ? "bg-red-500/10" : data.threat_level >= 4 ? "bg-yellow-500/10" : "bg-green-500/10";

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Battle Recommendations</h2>
          <p className="text-xs text-muted-foreground">AI-generated strategy to win against this competitor</p>
        </div>
      </div>

      {/* Threat Level */}
      <div className={`rounded-2xl p-5 mb-6 ${threatBg} border border-border/50`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${threatColor}`} />
            <span className="text-sm font-bold text-foreground">Threat Level</span>
          </div>
          <span className={`text-3xl font-black ${threatColor}`}>{data.threat_level}/10</span>
        </div>
        <p className="text-sm text-foreground">{data.threat_summary}</p>
      </div>

      {/* Overall Summary */}
      {data.overall_summary && (
        <div className="glass-card rounded-2xl p-5 mb-6 border border-primary/20">
          <p className="text-sm text-foreground leading-relaxed">{data.overall_summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sales Recommendations */}
        <Section icon={Trophy} title="Sales Recommendations" color="text-primary">
          <ul className="space-y-2">
            {(data.sales_recommendations || []).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-primary font-bold mt-px">{i + 1}.</span> {r}
              </li>
            ))}
          </ul>
        </Section>

        {/* Win Strategy */}
        <Section icon={Target} title="Win Strategy" color="text-green-400">
          <ol className="space-y-2">
            {(data.win_strategy || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-green-400 font-bold mt-px">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>
        </Section>

        {/* Pricing Strategy */}
        <Section icon={DollarSign} title="Pricing Strategy" color="text-yellow-400">
          <p className="text-xs text-foreground leading-relaxed">{data.pricing_strategy}</p>
        </Section>

        {/* Marketing Opportunities */}
        <Section icon={Megaphone} title="Marketing Opportunities" color="text-purple-400">
          <ul className="space-y-2">
            {(data.marketing_opportunities || []).map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-purple-400">•</span> {m}
              </li>
            ))}
          </ul>
        </Section>

        {/* Your Advantages */}
        <Section icon={Trophy} title="Your Advantages" color="text-green-400">
          <ul className="space-y-1">
            {(data.your_advantages || []).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-green-400">✓</span> {a}
              </li>
            ))}
          </ul>
        </Section>

        {/* Competitor Advantages */}
        <Section icon={AlertTriangle} title="Competitor Advantages" color="text-red-400">
          <ul className="space-y-1">
            {(data.competitor_advantages || []).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-red-400">⚠</span> {a}
              </li>
            ))}
          </ul>
        </Section>

        {/* Product Gaps - What You're Missing */}
        <Section icon={Package} title="Products You Could Add" color="text-cyan-400">
          <ul className="space-y-1">
            {(data.product_gaps_you_miss || []).map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-cyan-400">+</span> {g}
              </li>
            ))}
          </ul>
        </Section>

        {/* Product Gaps - What They're Missing */}
        <Section icon={Package} title="Products They Don't Have" color="text-primary">
          <ul className="space-y-1">
            {(data.product_gaps_they_miss || []).map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="text-primary">★</span> {g}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}