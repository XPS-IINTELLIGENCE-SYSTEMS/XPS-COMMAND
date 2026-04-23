import { useState } from "react";
import { History, RotateCcw, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function PromptVersionHistory({ prompt, onReverted }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [reverting, setReverting] = useState(null);

  const history = (() => {
    try { return JSON.parse(prompt.version_history || '[]'); } catch { return []; }
  })();

  const currentVersion = prompt.version || 1;

  const handleRevert = async (historyEntry) => {
    if (!confirm(`Revert to version ${historyEntry.version}? Current version will be saved to history.`)) return;
    setReverting(historyEntry.version);

    // Save current version into history before reverting
    const newHistoryEntry = {
      version: currentVersion,
      prompt_text: prompt.prompt_text,
      title: prompt.title,
      edited_at: new Date().toISOString(),
      edited_by: "user",
      change_note: `Reverted to v${historyEntry.version} — auto-saved current state`
    };
    const updatedHistory = history.filter(h => h.version !== historyEntry.version);
    updatedHistory.unshift(newHistoryEntry);

    await base44.entities.PromptLibrary.update(prompt.id, {
      prompt_text: historyEntry.prompt_text,
      title: historyEntry.title || prompt.title,
      version: historyEntry.version,
      version_history: JSON.stringify(updatedHistory)
    });

    setReverting(null);
    onReverted?.();
  };

  if (history.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Version History</h3>
          <span className="text-xs text-muted-foreground ml-auto">v{currentVersion} (current)</span>
        </div>
        <p className="text-xs text-muted-foreground">No previous versions. Edit and save to create history.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-2 p-4 hover:bg-secondary/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <History className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Version History</span>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{history.length} versions</span>
        <span className="text-xs text-muted-foreground ml-auto mr-2">v{currentVersion} current</span>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {history.map((entry, i) => (
            <div key={i} className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">v{entry.version}</span>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.edited_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                    onClick={() => setExpandedVersion(expandedVersion === i ? null : i)}
                  >
                    {expandedVersion === i ? "Hide" : "Preview"}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs gap-1"
                    disabled={reverting === entry.version}
                    onClick={() => handleRevert(entry)}
                  >
                    <RotateCcw className="w-3 h-3" />
                    {reverting === entry.version ? "Reverting..." : "Revert"}
                  </Button>
                </div>
              </div>
              {entry.change_note && (
                <p className="text-xs text-muted-foreground italic">{entry.change_note}</p>
              )}
              {expandedVersion === i && (
                <div className="bg-secondary/30 rounded p-2 font-mono text-xs max-h-32 overflow-y-auto whitespace-pre-wrap text-foreground/80">
                  {entry.prompt_text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}