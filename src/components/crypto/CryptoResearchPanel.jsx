import { useState } from "react";
import { TrendingUp, TrendingDown, Globe, Newspaper, BarChart3, ChevronDown, ChevronUp, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CryptoResearchPanel({ research }) {
  const [expanded, setExpanded] = useState({ prices: true, narratives: false, news: false, dex: false, catalysts: false, smart: false });
  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  if (!research) return <div className="text-xs text-muted-foreground text-center py-8">Run research to see live crypto data.</div>;

  const mc = research.market_conditions || {};

  return (
    <div className="space-y-3">
      {/* Market Overview */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 metallic-gold-icon" />
          <span className="text-sm font-bold text-foreground">Live Market</span>
          <span className="flex items-center gap-1 text-[8px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full ml-auto"><Wifi className="w-2.5 h-2.5" />LIVE</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px]">
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Total Cap</span><span className="font-bold text-foreground">{mc.total_market_cap || '—'}</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">BTC Dom</span><span className="font-bold text-foreground">{mc.btc_dominance || '—'}</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Fear/Greed</span><span className="font-bold text-foreground">{mc.fear_greed || '—'}</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Sentiment</span><span className="font-bold text-foreground">{mc.sentiment || '—'}</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">Funding</span><span className="font-bold text-foreground">{mc.funding_rates || '—'}</span></div>
          <div className="bg-white/[0.03] rounded-lg p-2"><span className="text-muted-foreground block">24h Liquidations</span><span className="font-bold text-foreground">{mc.liquidations_24h || '—'}</span></div>
        </div>
      </div>

      {/* Top Prices */}
      <div className="glass-card rounded-xl p-4">
        <button onClick={() => toggle('prices')} className="flex items-center justify-between w-full mb-2">
          <span className="text-sm font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Top Crypto Prices</span>
          {expanded.prices ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {expanded.prices && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
            {(research.top_prices || []).map((p, i) => {
              const isUp = !(p.change_24h || '').startsWith('-');
              return (
                <div key={i} className="bg-white/[0.03] rounded-lg p-2 text-[10px]">
                  <div className="font-bold text-foreground">{p.ticker}</div>
                  <div className="text-foreground">{p.price}</div>
                  <div className={`flex items-center gap-0.5 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {p.change_24h}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending Narratives */}
      <div className="glass-card rounded-xl p-4">
        <button onClick={() => toggle('narratives')} className="flex items-center justify-between w-full mb-2">
          <span className="text-sm font-bold text-foreground">🔥 Trending Narratives</span>
          {expanded.narratives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded.narratives && (
          <div className="space-y-2">
            {(research.trending_narratives || []).map((n, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-2.5 text-[10px]">
                <div className="flex items-center justify-between"><span className="font-bold text-foreground">{n.narrative}</span><Badge variant="secondary" className="text-[7px]">{n.momentum}</Badge></div>
                <div className="text-muted-foreground mt-1">Tokens: {n.top_tokens}</div>
                <div className="text-muted-foreground">{n.outlook}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Breaking News */}
      <div className="glass-card rounded-xl p-4">
        <button onClick={() => toggle('news')} className="flex items-center justify-between w-full mb-2">
          <span className="text-sm font-bold text-foreground flex items-center gap-2"><Newspaper className="w-4 h-4 text-red-400" />Breaking News</span>
          {expanded.news ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expanded.news && (
          <div className="space-y-2">
            {(research.breaking_news || []).map((n, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-2.5 text-[10px]">
                <div className="font-bold text-foreground">{n.headline}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[7px]">{n.impact}</Badge>
                  <span className="text-muted-foreground">{n.affected_tokens}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {research.summary && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-bold text-foreground mb-2">AI Summary</h3>
          <p className="text-[10px] text-muted-foreground leading-relaxed">{research.summary}</p>
          <div className="flex gap-3 mt-2 text-[9px]">
            <span className="text-primary">Narrative: {research.recommended_narrative || '—'}</span>
            <span className="text-green-400">Window: {research.optimal_launch_window || '—'}</span>
            <span className="text-red-400">Risk: {research.risk_level || '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
}