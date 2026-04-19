import { useState } from "react";
import { Plus, Trash2, Key, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AgentBuilderApiKeys({ keys, onChange }) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showValues, setShowValues] = useState({});

  const parsed = (() => {
    try { return typeof keys === "string" ? JSON.parse(keys || "{}") : (keys || {}); }
    catch { return {}; }
  })();

  const addKey = () => {
    if (!newKey.trim()) return;
    const updated = { ...parsed, [newKey.trim()]: newValue };
    onChange(JSON.stringify(updated));
    setNewKey("");
    setNewValue("");
  };

  const removeKey = (k) => {
    const updated = { ...parsed };
    delete updated[k];
    onChange(JSON.stringify(updated));
  };

  const toggleShow = (k) => setShowValues(prev => ({ ...prev, [k]: !prev[k] }));

  const entries = Object.entries(parsed);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Key className="w-4 h-4 text-primary" /> API Keys & Tokens
      </h3>
      <p className="text-[11px] text-muted-foreground">Add agent-specific API keys or tokens this agent can use.</p>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-secondary/30">
              <span className="text-xs font-mono font-semibold text-foreground min-w-[100px]">{k}</span>
              <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
                {showValues[k] ? v : "••••••••••••"}
              </span>
              <button onClick={() => toggleShow(k)} className="p-1 hover:bg-secondary rounded">
                {showValues[k] ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <button onClick={() => removeKey(k)} className="p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          placeholder="Key name (e.g. OPENAI_KEY)"
          className="flex-1 text-xs h-8"
        />
        <Input
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder="Value / Token"
          type="password"
          className="flex-1 text-xs h-8"
        />
        <Button size="sm" variant="outline" onClick={addKey} disabled={!newKey.trim()} className="h-8">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}