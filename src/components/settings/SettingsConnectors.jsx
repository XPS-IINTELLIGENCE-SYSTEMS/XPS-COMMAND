import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link2, ExternalLink, Unplug, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CONNECTORS = [
  { id: "69db200274332486fd28dd7e", name: "Gmail", icon: "✉️", desc: "Email & outreach" },
  { id: "69db1fd5b6313fd0b25228dc", name: "Google Calendar", icon: "📅", desc: "Schedule & events" },
  { id: "69db1e5e75a5f8c15c80cf34", name: "Google Drive", icon: "📁", desc: "Files & documents" },
  { id: "69db1fad3c50db37ad0ce8dd", name: "Google Sheets", icon: "📊", desc: "Spreadsheets & data" },
  { id: "69db1fc1c96eac434162b6e2", name: "Google Docs", icon: "📝", desc: "Documents & notes" },
  { id: "69db201897e4e8f9ae073be7", name: "Google Tasks", icon: "✅", desc: "Tasks & to-do" },
  { id: "69db228b2439d854c8587167", name: "HubSpot", icon: "🟠", desc: "CRM & contacts" },
];

export default function SettingsConnectors() {
  const [statuses, setStatuses] = useState({});
  const [connecting, setConnecting] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAll();
  }, []);

  const checkAll = async () => {
    const results = {};
    for (const c of CONNECTORS) {
      try {
        const res = await base44.functions.invoke("checkConnector", { connectorId: c.id });
        results[c.id] = res.data?.connected || false;
      } catch {
        results[c.id] = false;
      }
    }
    setStatuses(results);
  };

  const handleConnect = async (connector) => {
    setConnecting(connector.id);
    try {
      const url = await base44.connectors.connectAppUser(connector.id);
      const popup = window.open(url, "_blank", "width=600,height=700");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnecting(null);
          checkAll();
          toast({ title: "Connection updated", description: `${connector.name} check complete` });
        }
      }, 500);
    } catch (err) {
      setConnecting(null);
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDisconnect = async (connector) => {
    setConnecting(connector.id);
    try {
      await base44.connectors.disconnectAppUser(connector.id);
      setStatuses(prev => ({ ...prev, [connector.id]: false }));
      toast({ title: "Disconnected", description: `${connector.name} disconnected` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setConnecting(null);
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Connect Your Tools</h3>
          <p className="text-[10px] text-muted-foreground">Real integrations powered by Base44 connectors</p>
        </div>
      </div>
      <div className="space-y-2">
        {CONNECTORS.map(c => {
          const isConnected = statuses[c.id];
          const isLoading = connecting === c.id;
          return (
            <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-border/30 hover:border-border/60 transition-all">
              <span className="text-lg flex-shrink-0">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{c.desc}</div>
              </div>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => handleDisconnect(c)}>
                    <Unplug className="w-3 h-3 mr-1" /> Disconnect
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleConnect(c)}>
                  <ExternalLink className="w-3 h-3" /> Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}