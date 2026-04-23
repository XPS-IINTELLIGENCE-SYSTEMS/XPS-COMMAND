import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function NewsSentimentPanel({ sentiment = {} }) {
  if (!Object.keys(sentiment).length) {
    return <div className="text-xs text-muted-foreground text-center py-4">No sentiment data</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground">News Sentiment</div>
      {Object.entries(sentiment).map(([ticker, data]) => {
        const scoreColor = data.score > 20 ? 'text-green-400' : data.score < -20 ? 'text-red-400' : 'text-yellow-400';
        const sentimentIcon = data.sentiment === 'Bullish' ? 
          <TrendingUp className="w-3 h-3 text-green-400" /> : 
          data.sentiment === 'Bearish' ? 
          <TrendingDown className="w-3 h-3 text-red-400" /> : 
          <Minus className="w-3 h-3 text-yellow-400" />;

        return (
          <div key={ticker} className="bg-secondary/20 rounded-lg p-2 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="font-bold flex items-center gap-1">
                {sentimentIcon}
                {ticker}
              </div>
              <div className={`font-bold ${scoreColor}`}>{data.score > 0 ? '+' : ''}{data.score}</div>
            </div>
            <div className="text-muted-foreground italic truncate">"{data.headline}"</div>
          </div>
        );
      })}
    </div>
  );
}