import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, TrendingUp, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TradeExplanationModal({ trade, open, onOpenChange }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch explanation when modal opens
  if (open && !explanation && !loading) {
    setLoading(true);
    window.base44?.functions?.invoke('explainTradeDecision', { trade_id: trade?.id })
      .then(res => {
        setExplanation(res.data?.explanation || "No explanation available");
        setLoading(false);
      })
      .catch(() => {
        setExplanation("Failed to generate explanation");
        setLoading(false);
      });
  }

  if (!trade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background pb-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                {trade.action === 'BUY' ? 
                  <TrendingUp className="w-5 h-5 text-green-400" /> : 
                  <TrendingDown className="w-5 h-5 text-red-400" />
                }
                {trade.ticker} {trade.action}
              </DialogTitle>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="p-1 hover:bg-secondary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trade Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Entry Price</div>
              <div className="text-lg font-bold text-foreground">${trade.entry_price.toFixed(2)}</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Position Size</div>
              <div className="text-lg font-bold text-foreground">{trade.shares} shares</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">P&L</div>
              <div className={`text-lg font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="text-lg font-bold text-foreground">{trade.confidence}%</div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-secondary/20 border rounded-lg p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {explanation}
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Executed: {new Date(trade.execution_timestamp).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}