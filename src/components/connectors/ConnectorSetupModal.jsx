import { useState } from "react";
import { X, Loader2, TestTube, Save, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function ConnectorSetupModal({ entry, existingConnector, onSave, onClose, onTest }) {
  const [apiKey, setApiKey] = useState(existingConnector?.api_key || "");
  const [secondaryKey, setSecondaryKey] = useState(existingConnector?.secondary_key || "");
  const [baseUrl, setBaseUrl] = useState(existingConnector?.base_url || entry.baseUrl || "");
  const [notes, setNotes] = useState(existingConnector?.notes || "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: entry.name,
      service_type: entry.id,
      api_key: apiKey,
      secondary_key: secondaryKey,
      base_url: baseUrl,
      docs_url: entry.docsUrl,
      notes,
      is_enabled: true,
      connection_status: testResult === "connected" ? "connected" : "untested",
    };

    if (existingConnector) {
      await base44.entities.APIConnector.update(existingConnector.id, payload);
    } else {
      await base44.entities.APIConnector.create(payload);
    }
    setSaving(false);
    onSave();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke("testConnector", {
        action: "test",
        service_type: entry.id,
        api_key: apiKey,
        base_url: baseUrl,
      });
      setTestResult(res.data?.status || "error");
    } catch {
      setTestResult("error");
    }
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${entry.color}15` }}>
            {entry.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-foreground">{entry.name}</h3>
            <p className="text-[11px] text-muted-foreground">{entry.desc}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* API Key */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {entry.keyLabel || "API Key"}
            </label>
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              type="password"
              placeholder={entry.keyPlaceholder || "Enter API key..."}
              className="font-mono text-xs h-9"
            />
          </div>

          {/* Secondary Key */}
          {entry.secondaryLabel && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                {entry.secondaryLabel}
              </label>
              <Input
                value={secondaryKey}
                onChange={e => setSecondaryKey(e.target.value)}
                type="password"
                placeholder="Enter secondary key..."
                className="font-mono text-xs h-9"
              />
            </div>
          )}

          {/* Base URL */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Base URL</label>
            <Input
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="font-mono text-[11px] h-9"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes (optional)</label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Production key, expires Dec 2026"
              className="text-xs h-9"
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium ${
              testResult === "connected"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {testResult === "connected"
                ? <><CheckCircle2 className="w-4 h-4" /> Connection successful!</>
                : <><AlertTriangle className="w-4 h-4" /> Connection failed — check your credentials</>
              }
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border">
          <div className="flex gap-2">
            {entry.docsUrl && (
              <a href={entry.docsUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                  <ExternalLink className="w-3 h-3" /> Docs
                </Button>
              </a>
            )}
            <Button size="sm" variant="outline" onClick={handleTest} disabled={testing || !apiKey} className="h-8 gap-1 text-xs">
              {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
              Test Connection
            </Button>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 gap-1 text-xs">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {existingConnector ? "Update" : "Connect & Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}