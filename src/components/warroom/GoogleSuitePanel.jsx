import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, FileText, Mail, StickyNote, Loader2, ExternalLink } from "lucide-react";

const APPS = [
  { id: "gmail", label: "Gmail", icon: Mail, color: "#ea4335", connectorId: "69db200274332486fd28dd7e" },
  { id: "drive", label: "Drive", icon: FileText, color: "#4285f4", connectorId: "69db1e5e75a5f8c15c80cf34" },
  { id: "calendar", label: "Calendar", icon: Calendar, color: "#34a853", connectorId: "69ddcb305a599e0b4a1b3cff" },
  { id: "sheets", label: "Sheets", icon: StickyNote, color: "#0f9d58", connectorId: "69db1fad3c50db37ad0ce8dd" },
];

export default function GoogleSuitePanel() {
  const [connecting, setConnecting] = useState(null);

  const connect = async (app) => {
    setConnecting(app.id);
    const url = await base44.connectors.connectAppUser(app.connectorId);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setConnecting(null);
      }
    }, 500);
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground">Connect your Google workspace to sync emails, calendar events, drive files, and sheets data with the War Room.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {APPS.map(app => {
          const Icon = app.icon;
          const isConnecting = connecting === app.id;
          return (
            <button
              key={app.id}
              onClick={() => connect(app)}
              disabled={isConnecting}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all bg-secondary/20"
            >
              {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" style={{ color: app.color }} /> : <Icon className="w-6 h-6" style={{ color: app.color }} />}
              <span className="text-[10px] font-bold text-foreground">{app.label}</span>
              <span className="text-[8px] text-primary flex items-center gap-0.5">Connect <ExternalLink className="w-2.5 h-2.5" /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}