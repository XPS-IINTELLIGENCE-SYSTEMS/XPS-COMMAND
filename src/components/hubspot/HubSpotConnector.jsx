import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Link2, Unlink, RefreshCcw, Download, Upload, Users, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONNECTOR_ID = "69db228b2439d854c8587167";

export default function HubSpotConnector({ compact = false, onSyncComplete }) {
  const [user, setUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null); // "fetch" | "sync" | "push" | null
  const [syncResult, setSyncResult] = useState(null);

  // Rule 2: Connection check via data fetch
  const fetchHubSpotData = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("hubspotSync", { action: "fetch" });
      setData(res.data);
      setConnected(true);
      return true;
    } catch {
      setConnected(false);
      setData(null);
      return false;
    }
  }, []);

  // Rule 1: Auth gate + Rule 2: Initial fetch
  useEffect(() => {
    (async () => {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        setUser(me);
        await fetchHubSpotData();
      }
      setLoading(false);
    })();
  }, [fetchHubSpotData]);

  // Rule 3: OAuth popup with poll
  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setLoading(true);
        fetchHubSpotData().then(() => setLoading(false));
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setData(null);
  };

  const handleSync = async (action) => {
    setSyncing(action);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke("hubspotSync", { action });
      setSyncResult({ success: true, action, data: res.data });
      if (action === "sync" && onSyncComplete) onSyncComplete();
      // Refresh data after sync
      await fetchHubSpotData();
    } catch (err) {
      setSyncResult({ success: false, action, error: err.message });
    }
    setSyncing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <button onClick={() => base44.auth.redirectToLogin()} className="text-xs text-primary hover:underline">
        Sign in to connect HubSpot
      </button>
    );
  }

  // Not connected — show connect button
  if (!connected) {
    return (
      <button
        onClick={handleConnect}
        className={`flex items-center gap-2 ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"} rounded-xl border border-[#ff7a59]/40 bg-[#ff7a59]/10 text-[#ff7a59] hover:bg-[#ff7a59]/20 font-semibold transition-all`}
      >
        <Link2 className="w-3.5 h-3.5" />
        Connect HubSpot
      </button>
    );
  }

  // Compact mode — just show status + sync button
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-[#ff7a59] font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          HubSpot
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => handleSync("sync")}
          disabled={!!syncing}
        >
          {syncing === "sync" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          Pull
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => handleSync("push")}
          disabled={!!syncing}
        >
          {syncing === "push" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          Push
        </Button>
      </div>
    );
  }

  // Full mode — stats + actions
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ff7a59]/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#ff7a59]" fill="currentColor">
              <path d="M17.78 14.29c-.53 0-1.01.22-1.35.58l-3.66-2.2c.06-.2.1-.41.1-.63s-.04-.43-.1-.63l3.62-2.17c.35.38.84.62 1.39.62 1.05 0 1.9-.85 1.9-1.9s-.85-1.9-1.9-1.9-1.9.85-1.9 1.9c0 .14.02.28.05.41l-3.64 2.18c-.44-.49-1.08-.8-1.8-.8-1.33 0-2.41 1.08-2.41 2.41s1.08 2.41 2.41 2.41c.72 0 1.36-.31 1.8-.8l3.66 2.2c-.04.14-.07.29-.07.44 0 .99.81 1.8 1.8 1.8s1.8-.81 1.8-1.8-.81-1.82-1.8-1.82z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">HubSpot CRM</h3>
            <div className="flex items-center gap-1 text-[10px] text-[#ff7a59]">
              <CheckCircle2 className="w-2.5 h-2.5" /> Connected
            </div>
          </div>
        </div>
        <button onClick={handleDisconnect} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1">
          <Unlink className="w-3 h-3" /> Disconnect
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
              <Users className="w-3 h-3" /> Contacts
            </div>
            <div className="text-lg font-bold text-foreground">{data.totalContacts}</div>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
              <DollarSign className="w-3 h-3" /> Deals
            </div>
            <div className="text-lg font-bold text-foreground">{data.totalDeals}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => handleSync("fetch")} disabled={!!syncing}>
          {syncing === "fetch" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
          Refresh
        </Button>
        <Button size="sm" className="gap-1.5 text-xs bg-[#ff7a59] hover:bg-[#ff7a59]/90 text-white" onClick={() => handleSync("sync")} disabled={!!syncing}>
          {syncing === "sync" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          Pull to XPS
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => handleSync("push")} disabled={!!syncing}>
          {syncing === "push" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          Push to HubSpot
        </Button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`rounded-xl px-3 py-2 text-xs ${syncResult.success ? "bg-green-500/10 text-green-400" : "bg-destructive/10 text-destructive"}`}>
          {syncResult.success ? (
            syncResult.action === "sync" ? `✓ Pulled ${syncResult.data.created} new leads (${syncResult.data.skipped} skipped)` :
            syncResult.action === "push" ? `✓ Pushed ${syncResult.data.pushed} contacts to HubSpot` :
            `✓ Loaded ${syncResult.data.totalContacts} contacts, ${syncResult.data.totalDeals} deals`
          ) : (
            `✗ ${syncResult.error}`
          )}
        </div>
      )}
    </div>
  );
}