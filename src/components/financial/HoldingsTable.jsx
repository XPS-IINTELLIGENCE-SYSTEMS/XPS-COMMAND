import { Badge } from "@/components/ui/badge";

const BUCKET_LABELS = { low_risk: 'Low', mid_risk: 'Mid', high_risk: 'High', day_trading: 'Day', business_venture: 'Biz' };
const BUCKET_COLORS = { low_risk: '#22c55e', mid_risk: '#f59e0b', high_risk: '#ef4444', day_trading: '#8b5cf6', business_venture: '#d4af37' };

export default function HoldingsTable({ portfolios, selectedBucket }) {
  const allHoldings = [];
  for (const p of portfolios) {
    if (selectedBucket && p.bucket !== selectedBucket) continue;
    let holdings = [];
    try { holdings = JSON.parse(p.holdings || '[]'); } catch {}
    for (const h of holdings) allHoldings.push({ ...h, bucket: p.bucket });
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">Live Holdings</h3>
      {allHoldings.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground py-6">No active holdings</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 text-muted-foreground font-medium">Asset</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Shares</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Live Price</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Value</th>
                <th className="text-right py-2 text-muted-foreground font-medium">P&L</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Bucket</th>
              </tr>
            </thead>
            <tbody>
              {allHoldings.map((h, i) => {
                const pnl = h.unrealized_pnl || 0;
                return (
                  <tr key={i} className="border-b border-border/20 hover:bg-white/[0.02]">
                    <td className="py-2 font-bold text-foreground">{h.ticker || h.asset || '—'}</td>
                    <td className="py-2 text-right text-foreground">{h.shares?.toLocaleString() || '—'}</td>
                    <td className="py-2 text-right text-muted-foreground">${h.live_price?.toFixed(2) || h.avg_price?.toFixed(2) || '—'}</td>
                    <td className="py-2 text-right font-semibold text-foreground">${h.current_value?.toFixed(2) || '—'}</td>
                    <td className={`py-2 text-right font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      <Badge className="text-[7px] px-1.5 py-0" style={{ backgroundColor: `${BUCKET_COLORS[h.bucket]}20`, color: BUCKET_COLORS[h.bucket] }}>
                        {BUCKET_LABELS[h.bucket] || '—'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}