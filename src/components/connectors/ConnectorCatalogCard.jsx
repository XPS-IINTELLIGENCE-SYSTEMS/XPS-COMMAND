import { CheckCircle2, Plus, ExternalLink } from "lucide-react";

export default function ConnectorCatalogCard({ entry, isConnected, onConnect }) {
  return (
    <button
      onClick={() => onConnect(entry)}
      className={`group relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
        isConnected
          ? "border-green-500/30 bg-green-500/5"
          : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${entry.color}15` }}
      >
        {entry.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-foreground truncate">{entry.name}</span>
          {isConnected && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
          {entry.isOAuth && (
            <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary">OAuth</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{entry.desc}</p>
      </div>

      {/* Hover action */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isConnected ? (
          <span className="text-[9px] text-green-400 font-semibold">Edit</span>
        ) : (
          <Plus className="w-4 h-4 text-primary" />
        )}
      </div>
    </button>
  );
}