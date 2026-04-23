import { useMemo } from "react";
import { BarChart3, TrendingUp, Star, Zap, ThumbsUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CATEGORIES = {
  leads_intelligence: "Leads & Intel",
  outreach_campaigns: "Outreach",
  bid_pricing: "Bid & Pricing",
  competitor_research: "Competitor",
  content_creation: "Content",
  agent_building: "Agents",
  automation_workflows: "Automation",
  financial_ai: "Financial AI",
  autonomous_systems: "Autonomous",
  wealth_creation: "Wealth",
  trading_systems: "Trading",
  prediction_systems: "Prediction",
  recommendation_systems: "Recommendations",
  scraping_harvesting: "Scraping",
  system_cloning: "Cloning",
  invention_systems: "Invention",
  meta_systems: "Meta-Systems",
  open_source_integration: "Open Source",
  system_refactoring: "Refactoring",
  recursive_building: "Recursive",
  millionaire_paths: "Millionaire",
  ai_architecture: "AI Arch",
  idea_generation: "Ideas",
  custom: "Custom",
};

const COLORS = ["#d4af37", "#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

export default function PromptAnalyticsDashboard({ prompts }) {
  const stats = useMemo(() => {
    const totalUsage = prompts.reduce((s, p) => s + (p.usage_count || 0), 0);
    const totalFeedback = prompts.reduce((s, p) => s + (p.feedback_count || 0), 0);
    const avgScore = prompts.filter(p => p.feedback_count > 0).length > 0
      ? Math.round(prompts.filter(p => p.feedback_count > 0).reduce((s, p) => s + (p.success_score || 0), 0) / prompts.filter(p => p.feedback_count > 0).length)
      : 0;
    const favorites = prompts.filter(p => p.is_favorite).length;

    // Category usage breakdown
    const categoryUsage = {};
    prompts.forEach(p => {
      const cat = p.category || 'custom';
      if (!categoryUsage[cat]) categoryUsage[cat] = { usage: 0, count: 0, totalScore: 0, scored: 0 };
      categoryUsage[cat].usage += p.usage_count || 0;
      categoryUsage[cat].count += 1;
      if (p.feedback_count > 0) {
        categoryUsage[cat].totalScore += p.success_score || 0;
        categoryUsage[cat].scored += 1;
      }
    });

    const categoryData = Object.entries(categoryUsage)
      .map(([cat, data]) => ({
        name: CATEGORIES[cat] || cat,
        usage: data.usage,
        count: data.count,
        avgScore: data.scored > 0 ? Math.round(data.totalScore / data.scored) : 0
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    // Top prompts by score
    const topByScore = [...prompts]
      .filter(p => p.feedback_count > 0)
      .sort((a, b) => (b.success_score || 0) - (a.success_score || 0))
      .slice(0, 5);

    // Top prompts by usage
    const topByUsage = [...prompts]
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
      .slice(0, 5);

    return { totalUsage, totalFeedback, avgScore, favorites, categoryData, topByScore, topByUsage };
  }, [prompts]);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Uses", value: stats.totalUsage, icon: Zap, color: "text-primary" },
          { label: "Avg Success Score", value: `${stats.avgScore}%`, icon: TrendingUp, color: "text-green-400" },
          { label: "Feedback Received", value: stats.totalFeedback, icon: ThumbsUp, color: "text-blue-400" },
          { label: "Favorited", value: stats.favorites, icon: Star, color: "text-yellow-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Category Usage Chart */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Most Used Categories
        </h3>
        {stats.categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="usage" name="Uses" radius={[4, 4, 0, 0]}>
                {stats.categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">No usage data yet. Copy prompts to track usage.</p>
        )}
      </div>

      {/* Top by Score & Top by Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top by Success Score */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Highest Success Score
          </h3>
          {stats.topByScore.length > 0 ? (
            <div className="space-y-2">
              {stats.topByScore.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-xs flex-1 truncate">{p.title}</span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden w-16">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${p.success_score}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-green-400 w-8">{p.success_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No feedback submitted yet.</p>
          )}
        </div>

        {/* Top by Usage */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Most Used Prompts
          </h3>
          {stats.topByUsage.filter(p => p.usage_count > 0).length > 0 ? (
            <div className="space-y-2">
              {stats.topByUsage.filter(p => p.usage_count > 0).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-xs flex-1 truncate">{p.title}</span>
                  <span className="text-xs font-semibold text-primary">{p.usage_count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No usage tracked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}