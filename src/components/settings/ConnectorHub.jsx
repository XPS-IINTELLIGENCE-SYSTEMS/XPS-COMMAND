import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plug, Trash2, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { CONNECTOR_CATALOG, CATEGORIES, getCatalogEntry } from "../connectors/connectorCatalog";
import ConnectorCatalogCard from "../connectors/ConnectorCatalogCard";
import ConnectorSetupModal from "../connectors/ConnectorSetupModal";
import ConnectorStatusBar from "../connectors/ConnectorStatusBar";

export default function ConnectorHub() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [setupEntry, setSetupEntry] = useState(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [tab, setTab] = useState("catalog"); // "catalog" | "active"

  const load = async () => {
    const data = await base44.entities.APIConnector.list("-created_date", 200);
    setConnectors(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const connectedServiceTypes = new Set(connectors.map(c => c.service_type));

  const getExisting = (serviceType) => connectors.find(c => c.service_type === serviceType);

  const handleConnect = (entry) => {
    setSetupEntry(entry);
  };

  const handleSaved = () => {
    setSetupEntry(null);
    load();
    toast({ title: "Connector saved", description: "Connection has been saved to your hub." });
  };

  const handleDelete = async (conn) => {
    await base44.entities.APIConnector.delete(conn.id);
    load();
  };

  const handleToggle = async (conn) => {
    await base44.entities.APIConnector.update(conn.id, { is_enabled: !conn.is_enabled });
    load();
  };

  const handleHealthCheckAll = async () => {
    setHealthChecking(true);
    try {
      const res = await base44.functions.invoke("testConnector", { action: "health_check_all" });
      toast({ title: "Health Check Complete", description: `Checked ${res.data?.checked || 0} connectors` });
      load();
    } catch {
      toast({ title: "Health Check Failed", variant: "destructive" });
    }
    setHealthChecking(false);
  };

  // Filter catalog
  const filteredCatalog = CONNECTOR_CATALOG.filter(entry => {
    if (activeCategory !== "All" && entry.category !== activeCategory) return false;
    if (search && !entry.name.toLowerCase().includes(search.toLowerCase()) && !entry.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Plug className="w-5 h-5 metallic-gold-icon" />
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Connector Hub</h2>
            <p className="text-[11px] text-muted-foreground">
              {CONNECTOR_CATALOG.length} services available · {connectors.length} configured
            </p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {connectors.length > 0 && (
        <ConnectorStatusBar connectors={connectors} onHealthCheck={handleHealthCheckAll} checking={healthChecking} />
      )}

      {/* Tab Toggle */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "catalog", label: `Service Catalog (${CONNECTOR_CATALOG.length})` },
          { id: "active", label: `My Connectors (${connectors.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
        <>
          {/* Search + Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services..."
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                activeCategory === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({CONNECTOR_CATALOG.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = CONNECTOR_CATALOG.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredCatalog.map(entry => (
              <ConnectorCatalogCard
                key={entry.id}
                entry={entry}
                isConnected={connectedServiceTypes.has(entry.id)}
                onConnect={handleConnect}
              />
            ))}
          </div>

          {filteredCatalog.length === 0 && (
            <div className="text-center py-10 text-xs text-muted-foreground">
              No services match your search.
            </div>
          )}
        </>
      )}

      {tab === "active" && (
        <>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : connectors.length === 0 ? (
            <div className="text-center py-12">
              <Plug className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-1">No connectors yet</h3>
              <p className="text-xs text-muted-foreground mb-3">Browse the catalog and connect your first service.</p>
              <Button size="sm" onClick={() => setTab("catalog")}>Browse Catalog</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {connectors.map(conn => (
                <ActiveConnectorRow
                  key={conn.id}
                  connector={conn}
                  onEdit={() => {
                    const entry = getCatalogEntry(conn.service_type);
                    if (entry) setSetupEntry(entry);
                  }}
                  onToggle={() => handleToggle(conn)}
                  onDelete={() => handleDelete(conn)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Setup Modal */}
      {setupEntry && (
        <ConnectorSetupModal
          entry={setupEntry}
          existingConnector={getExisting(setupEntry.id)}
          onSave={handleSaved}
          onClose={() => setSetupEntry(null)}
        />
      )}
    </div>
  );
}

function ActiveConnectorRow({ connector, onEdit, onToggle, onDelete }) {
  const [showKey, setShowKey] = useState(false);
  const entry = getCatalogEntry(connector.service_type);
  const statusColors = {
    connected: "text-green-400 bg-green-500/10",
    error: "text-red-400 bg-red-500/10",
    expired: "text-amber-400 bg-amber-500/10",
    untested: "text-muted-foreground bg-muted",
  };
  const sc = statusColors[connector.connection_status] || statusColors.untested;

  const maskedKey = connector.api_key
    ? connector.api_key.substring(0, 6) + "••••••••" + connector.api_key.slice(-4)
    : "—";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: `${entry?.color || "#666"}15` }}>
        {entry?.icon || "🔌"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{connector.name}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sc}`}>
            {connector.connection_status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
          <span className="font-mono">{showKey ? connector.api_key : maskedKey}</span>
          {connector.api_key && (
            <button onClick={() => setShowKey(!showKey)} className="hover:text-foreground">
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          )}
          {connector.last_tested && (
            <span>· tested {new Date(connector.last_tested).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Switch checked={connector.is_enabled} onCheckedChange={onToggle} className="scale-75" />
        <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 text-[10px]">Edit</Button>
        {entry?.docsUrl && (
          <a href={entry.docsUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><ExternalLink className="w-3 h-3" /></Button>
          </a>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0">
          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}