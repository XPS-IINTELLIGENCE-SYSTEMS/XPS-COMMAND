import { Zap, TrendingUp, Clock } from "lucide-react";

export default function AIRecommendationsPanel({ recommendations }) {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Critical Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h2 className="text-2xl font-bold text-foreground">Critical Recommendations</h2>
          <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-medium">
            Must implement
          </span>
        </div>
        <div className="space-y-4">
          {recommendations.critical.map(rec => (
            <RecommendationCard key={rec.id} rec={rec} severity="critical" />
          ))}
        </div>
      </div>

      {/* High Priority Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">High Priority Recommendations</h2>
          <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-medium">
            Implement soon
          </span>
        </div>
        <div className="space-y-4">
          {recommendations.high.map(rec => (
            <RecommendationCard key={rec.id} rec={rec} severity="high" />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, severity }) {
  const bgColor = severity === "critical" ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30";
  const textColor = severity === "critical" ? "text-red-400" : "text-orange-400";

  return (
    <div className={`border rounded-lg p-6 space-y-4 ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{rec.title}</h3>
          <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/20 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase">Impact Area</div>
          <div className="text-sm font-medium text-foreground mt-1">{rec.impactArea}</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Effort
          </div>
          <div className="text-sm font-medium text-foreground mt-1">{rec.estimatedEffort}</div>
        </div>
        <div className="bg-black/20 rounded p-3">
          <div className="text-xs text-muted-foreground uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ROI
          </div>
          <div className="text-sm font-medium text-green-400 mt-1">{rec.estimatedROI}</div>
        </div>
      </div>

      {rec.implementation && (
        <div>
          <div className="text-sm font-bold text-foreground mb-2">Implementation Steps:</div>
          <ul className="space-y-2">
            {rec.implementation.map((step, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">→</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}