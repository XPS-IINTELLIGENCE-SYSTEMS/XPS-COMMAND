import { useState, useEffect } from "react";
import { Calendar, Mail, HardDrive, Sheet, Loader2, CheckCircle2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const CONNECTORS = [
  { id: "69db1fd5b6313fd0b25228dc", name: "Google Calendar", icon: Calendar, color: "text-blue-400", fn: "googleCalendarFiles" },
  { id: "69db200274332486fd28dd7e", name: "Google Gmail", icon: Mail, color: "text-red-400", fn: "gmailMessages" },
  { id: "69db1e5e75a5f8c15c80cf34", name: "Google Drive", icon: HardDrive, color: "text-yellow-400", fn: "googleDriveFiles" },
  { id: "69db1fad3c50db37ad0ce8dd", name: "Google Sheets", icon: Sheet, color: "text-green-400", fn: "googleSheetsData" },
];

export default function GoogleConnectors() {
  const [statuses, setStatuses] = useState({});
  const [connecting, setConnecting] = useState(null);
  const { toast } = useToast();

  // Check connection status — all start as unknown until user connects
  useEffect(() => {
    // We don't auto-check because there's no lightweight "am I connected" API.
    // Status updates happen after connect/disconnect actions.
    setStatuses({});
  }, []);

  const connect = async (connector) => {
    setConnecting(connector.id);
    try {
      const url = await base44.connectors.connectAppUser(connector.id);
      const popup = window.open(url, "_blank", "width=600,height=700");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setStatuses(prev => ({ ...prev, [connector.id]: "connected" }));
          setConnecting(null);
          toast({ title: "Connected!", description: `${connector.name} linked` });
        }
      }, 500);
    } catch (err) {
      setConnecting(null);
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    }
  };

  const disconnect = async (connector) => {
    try {
      await base44.connectors.disconnectAppUser(connector.id);
      setStatuses(prev => ({ ...prev, [connector.id]: "disconnected" }));
      toast({ title: "Disconnected", description: `${connector.name} unlinked` });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.10] animated-silver-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
          <Link2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Google Integrations</h3>
          <p className="text-xs text-muted-foreground">Connect your Google services for data sync</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CONNECTORS.map(c => {
          const Icon = c.icon;
          const status = statuses[c.id];
          const isConnected = status === "connected";
          const isConnecting = connecting === c.id;

          return (
            <div key={c.id} className={cn(
              "rounded-xl p-4 text-center transition-all animated-silver-border",
              isConnected
                ? "bg-white/[0.06] border border-green-500/20"
                : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.2]"
            )}>
              <Icon className={cn("w-8 h-8 mx-auto mb-2", c.color)} />
              <div className="text-sm font-bold text-foreground mb-1">{c.name}</div>

              {isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />Connected
                  </div>
                  <button onClick={() => disconnect(c)} className="text-xs text-muted-foreground hover:text-red-400 transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => connect(c)} disabled={isConnecting} className="mt-1 text-xs w-full">
                  {isConnecting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}