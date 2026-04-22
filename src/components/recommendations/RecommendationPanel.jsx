import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Lightbulb, Play, Loader2, CheckCircle2, AlertTriangle, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecommendationPanel({ recommendations = [], onRefresh }) {
  const [implementing, setImplementing] = useState(null);
  const [results, setResults] = useState({});
  const [validating, setValidating] = useState(null);
  const [expandedResult, setExpandedResult] = useState(null);

  const implementRecommendation = async (rec) => {
    setImplementing(rec.id);
    try {
      const res = await base44.functions.invoke('implementRecommendation', {
        recommendation: rec,
      });

      if (res.data?.success) {
        setResults(prev => ({
          ...prev,
          [rec.id]: {
            status: 'success',
            message: res.data.message,
            changes: res.data.changes,
            timestamp: new Date().toLocaleTimeString(),
          },
        }));

        // Auto-validate after implementation
        setValidating(rec.id);
        const validation = await base44.functions.invoke('validateImplementation', {
          recommendation_id: rec.id,
          implementation_result: res.data,
        });

        setResults(prev => ({
          ...prev,
          [rec.id]: {
            ...prev[rec.id],
            validation: validation.data,
          },
        }));
        setValidating(null);
        onRefresh?.();
      } else {
        setResults(prev => ({
          ...prev,
          [rec.id]: {
            status: 'error',
            message: res.data?.error || 'Implementation failed',
            timestamp: new Date().toLocaleTimeString(),
          },
        }));
      }
    } catch (e) {
      setResults(prev => ({
        ...prev,
        [rec.id]: {
          status: 'error',
          message: e.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    }
    setImplementing(null);
  };

  return (
    <div className="space-y-3">
      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recommendations available</p>
        </div>
      ) : (
        recommendations.map(rec => {
          const result = results[rec.id];
          const isImplementing = implementing === rec.id;
          const isValidating = validating === rec.id;

          return (
            <div key={rec.id} className="glass-card rounded-xl p-4 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm">{rec.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                  {rec.impact && (
                    <div className="text-[10px] text-accent mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Impact: {rec.impact}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                    rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              </div>

              {/* Result */}
              {result && (
                <div className={`rounded-lg p-2 text-[10px] ${
                  result.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {result.status === 'success' ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{result.message}</span>
                      {result.validation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedResult(result.validation)}
                          className="ml-auto px-1.5 py-0.5 h-auto text-[9px]"
                        >
                          <Eye className="w-2.5 h-2.5" /> Validation
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{result.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {!result && (
                <Button
                  onClick={() => implementRecommendation(rec)}
                  disabled={isImplementing || isValidating}
                  className="w-full h-8 text-[10px] font-bold bg-primary hover:bg-primary/90"
                >
                  {isImplementing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-1" /> Implementing...
                    </>
                  ) : isValidating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin mr-1" /> Validating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" /> Implement
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })
      )}

      {/* Validation Details Modal */}
      {expandedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold text-foreground mb-4">Validation Report</h3>
            <pre className="bg-secondary p-4 rounded-lg text-xs text-muted-foreground overflow-auto max-h-96">
              {JSON.stringify(expandedResult, null, 2)}
            </pre>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setExpandedResult(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}