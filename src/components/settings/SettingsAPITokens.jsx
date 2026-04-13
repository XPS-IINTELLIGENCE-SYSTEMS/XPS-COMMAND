import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsAPITokens() {
  const [tokens, setTokens] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      if (me?.api_tokens) {
        try { setTokens(JSON.parse(me.api_tokens)); } catch { setTokens([]); }
      }
    })();
  }, []);

  const saveTokens = async (updated) => {
    setSaving(true);
    await base44.auth.updateMe({ api_tokens: JSON.stringify(updated) });
    setTokens(updated);
    setSaving(false);
    toast({ title: "Tokens saved" });
  };

  const addToken = async () => {
    if (!newName.trim() || !newValue.trim()) return;
    const updated = [...tokens, { name: newName.trim(), value: newValue.trim(), created: new Date().toISOString() }];
    await saveTokens(updated);
    setNewName("");
    setNewValue("");
    setAdding(false);
  };

  const removeToken = async (idx) => {
    const updated = tokens.filter((_, i) => i !== idx);
    await saveTokens(updated);
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <Key className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>API TOKENS</h3>
            <p className="text-[10px] text-white/40">Manage external service API keys and tokens</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => setAdding(!adding)}>
          <Plus className="w-3 h-3" /> Add Token
        </Button>
      </div>

      {adding && (
        <div className="mb-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.1] space-y-2">
          <Input
            placeholder="Token name (e.g. OPENAI_API_KEY)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-xs bg-transparent"
          />
          <Input
            placeholder="Token value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            type="password"
            className="h-8 text-xs bg-transparent"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" className="text-xs gap-1" onClick={addToken} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tokens.length === 0 && !adding && (
          <p className="text-xs text-white/40 text-center py-4">No API tokens configured</p>
        )}
        {tokens.map((token, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] border-b border-border/30 last:border-0">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm text-white font-medium">{token.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-mono">
                {showValues[idx] ? token.value : "••••••••••"}
              </span>
              <button onClick={() => setShowValues(prev => ({ ...prev, [idx]: !prev[idx] }))} className="p-1 rounded hover:bg-white/10">
                {showValues[idx] ? <EyeOff className="w-3 h-3 text-muted-foreground" /> : <Eye className="w-3 h-3 text-muted-foreground" />}
              </button>
              <button onClick={() => removeToken(idx)} className="p-1 rounded hover:bg-white/10">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}