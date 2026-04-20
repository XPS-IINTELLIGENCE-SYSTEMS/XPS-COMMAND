import { X, Zap, User, Clock, Sparkles, ExternalLink } from "lucide-react";

export default function PipelineStageDetail({ stage, onClose }) {
  if (!stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stage.color + "20" }}>
            <Sparkles className="w-5 h-5" style={{ color: stage.color }} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">{stage.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {stage.type === "automated" ? (
                <span className="flex items-center gap-1 text-[10px] text-yellow-400"><Zap className="w-3 h-3" /> Automated</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-blue-400"><User className="w-3 h-3" /> Manual</span>
              )}
              {stage.frequency && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" /> {stage.frequency}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{stage.description}</p>

        {/* Database link */}
        {stage.database && (
          <div className="glass-card rounded-lg p-3 mb-4">
            <div className="text-[10px] text-muted-foreground mb-1">Connected Database</div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-white">{stage.database}</div>
              <ExternalLink className="w-3 h-3 text-primary" />
            </div>
          </div>
        )}

        {/* Actions */}
        {stage.actions && stage.actions.length > 0 && (
          <div>
            <div className="text-[10px] text-muted-foreground mb-2">Available Actions</div>
            <div className="flex flex-wrap gap-2">
              {stage.actions.map(action => (
                <button key={action} className="px-3 py-1.5 rounded-lg text-xs font-medium glass-card text-white hover:border-primary/30 transition-all">
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation placeholder */}
        <div className="mt-4 p-3 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-primary">AI Recommendation</span>
          </div>
          <p className="text-[11px] text-gray-400">Click any action above to trigger this stage. AI will provide real-time recommendations based on current pipeline data and market conditions.</p>
        </div>
      </div>
    </div>
  );
}