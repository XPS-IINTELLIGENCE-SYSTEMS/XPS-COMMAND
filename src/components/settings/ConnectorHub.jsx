import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Plug, Plus, TestTube, Loader2, CheckCircle2, AlertTriangle,
  Clock, ExternalLink, RefreshCw, Trash2, Eye, EyeOff, X
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SERVICE_OPTIONS = [
  { value: "construct_connect", label: "ConstructConnect", defaultBase: "https://api.constructconnect.com/v1" },
  { value: "dodge_reports", label: "Dodge Reports", defaultBase: "https://api.construction.com/v1" },
  { value: "hubspot", label: "HubSpot", defaultBase: "https://api.hubapi.com" },
  { value: "airtable", label: "Airtable", defaultBase: "https://api.airtable.com/v0" },
  { value: "openai", label: "OpenAI", defaultBase: "https://api.openai.com/v1" },
  { value: "anthropic", label: "Anthropic", defaultBase: "https://api.anthropic.com/v1" },
  { value: "groq", label: "Groq", defaultBase: "https://api.groq.com/openai/v1" },
  { value: "stripe", label: "Stripe", defaultBase: "https://api.stripe.com/v1" },
  { value: "sendgrid", label: "SendGrid", defaultBase: "https://api.sendgrid.com/v3" },
  { value: "slack", label: "Slack", defaultBase: "https://slack.com/api" },
  { value: "zoominfo", label: "ZoomInfo", defaultBase: "https://api.zoominfo.com" },
  { value: "apolloio", label: "Apollo.io", defaultBase: "https://api.apollo.io/api/v1" },
  { value: "apify", label: "Apify", defaultBase: "https://api.apify.com/v2" },
  { value: "github", label: "GitHub", defaultBase: "https://api.github.com" },
  { value: "vercel", label: "Vercel", defaultBase: "https://api.vercel.com" },
  { value: "custom", label: "Custom API", defaultBase: "" },
];

const STATUS_CONFIG = {
  connected: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20", label: "Connected" },
  error: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20", label: "Error" },
  expired: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/20", label: "Expired" },
  untested: { icon: Clock, color: "text-muted-foreground/40", bg: "bg-white/5", label: "Untested" },
};

function ConnectorCard({ connector, onTest, onToggle, onDelete, testing }) {
  const [showKey, setShowKey] = useState(false);
  const status = STATUS_CONFIG[connector.connection_status] || STATUS_CONFIG.untested;
  const StatusIcon = status.icon;

  const maskedKey = connector.api_key
    ? connector.api_key.substring(0, 8) + "•••••••••" + connector.api_key.slice(-4)
    : "No key set";

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{connector.name}</span>
          <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", status.bg, status.color)}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={connector.is_enabled}
            onCheckedChange={() => onToggle(connector)}
            className="scale-75"
          />
          <Button size="sm" variant="ghost" onClick={() => onDelete(connector)} className="h-6 w-6 p-0">
            <Trash2 className="w-3 h-3 text-muted-foreground/40" />
          </Button>
        </div>
      </div>

      <div className="text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground w-16">Key:</span>
          <span className="text-foreground/70 font-mono text-[11px] flex-1">{showKey ? connector.api_key : maskedKey}</span>
          <button onClick={() => setShowKey(!showKey)} className="p-0.5">
            {showKey ? <EyeOff className="w-3 h-3 text-muted-foreground" /> : <Eye className="w-3 h-3 text-muted-foreground" />}
          </button>
        </div>
        {connector.base_url && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">URL:</span>
            <span className="text-foreground/50 font-mono text-[10px]">{connector.base_url}</span>
          </div>
        )}
        {connector.last_tested && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-16">Tested:</span>
            <span className="text-foreground/50 text-[10px]">{new Date(connector.last_tested).toLocaleString()}</span>
            {connector.last_response_ms && <span className="text-[9px] text-muted-foreground">{connector.last_response_ms}ms</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onTest(connector)} disabled={testing} className="h-7 gap-1 text-[10px]">
          {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
          Test
        </Button>
        {connector.docs_url && (
          <a href={connector.docs_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-[10px]">
              <ExternalLink className="w-3 h-3" /> Docs
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function AddConnectorForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("custom");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleServiceChange = (type) => {
    setServiceType(type);
    const svc = SERVICE_OPTIONS.find(s => s.value === type);
    if (svc) {
      setBaseUrl(svc.defaultBase);
      if (!name) setName(svc.label);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), service_type: serviceType, api_key: apiKey, base_url: baseUrl, is_enabled: false, connection_status: 'untested' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">Add Connector</span>
        <button onClick={onCancel}><X className="w-4 h-4 text-muted-foreground" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Service</label>
          <select
            value={serviceType}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          >
            {SERVICE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Display Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My API" className="h-9 bg-transparent" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">API Key</label>
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="sk-..." className="h-9 bg-transparent font-mono" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Base URL</label>
          <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.com" className="h-9 bg-transparent font-mono text-[11px]" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()} className="h-7 gap-1 text-[10px]">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Save Connector
        </Button>
      </div>
    </div>
  );
}

export default function ConnectorHub() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [healthChecking, setHealthChecking] = useState(false);

  const load = async () => {
    const data = await base44.entities.APIConnector.list('-created_date', 100);
    setConnectors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleTest = async (connector) => {
    setTestingId(connector.id);
    try {
      const res = await base44.functions.invoke('testConnector', {
        action: 'test',
        connector_id: connector.id,
        service_type: connector.service_type,
        api_key: connector.api_key,
        base_url: connector.base_url
      });
      const result = res.data;
      toast({ title: result.status === 'connected' ? "Connected" : "Connection Failed", description: result.message });
      load();
    } catch (err) {
      toast({ title: "Test Failed", description: err.message, variant: "destructive" });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (connector) => {
    await base44.entities.APIConnector.update(connector.id, { is_enabled: !connector.is_enabled });
    load();
  };

  const handleDelete = async (connector) => {
    await base44.entities.APIConnector.delete(connector.id);
    load();
  };

  const handleSave = async (data) => {
    await base44.entities.APIConnector.create(data);
    setAdding(false);
    load();
  };

  const handleHealthCheckAll = async () => {
    setHealthChecking(true);
    try {
      const res = await base44.functions.invoke('testConnector', { action: 'health_check_all' });
      toast({ title: "Health Check Complete", description: `Checked ${res.data.checked} connectors` });
      load();
    } catch (err) {
      toast({ title: "Health Check Failed", description: err.message, variant: "destructive" });
    } finally {
      setHealthChecking(false);
    }
  };

  const connected = connectors.filter(c => c.connection_status === 'connected').length;
  const errors = connectors.filter(c => c.connection_status === 'error').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plug className="w-5 h-5 metallic-gold-icon" />
          <div>
            <h3 className="text-sm font-bold text-foreground">API Connector Hub</h3>
            <p className="text-[10px] text-muted-foreground">
              {connectors.length} connectors · {connected} active · {errors > 0 ? `${errors} errors` : 'all healthy'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleHealthCheckAll} disabled={healthChecking} className="h-7 gap-1 text-[10px]">
            {healthChecking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Check All
          </Button>
          <Button size="sm" onClick={() => setAdding(true)} className="h-7 gap-1 text-[10px]">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      {adding && <AddConnectorForm onSave={handleSave} onCancel={() => setAdding(false)} />}

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : connectors.length === 0 ? (
        <div className="text-center py-8">
          <Plug className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No connectors configured</p>
          <p className="text-xs text-muted-foreground/50">Add your first API connector to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {connectors.map(conn => (
            <ConnectorCard
              key={conn.id}
              connector={conn}
              onTest={handleTest}
              onToggle={handleToggle}
              onDelete={handleDelete}
              testing={testingId === conn.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}