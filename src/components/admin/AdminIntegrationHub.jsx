import { CheckCircle2, AlertCircle, ArrowUpRight, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

const integrations = [
  { name: "HubSpot CRM", category: "CRM", status: "connected", lastSync: "2 min ago", records: "12,400" },
  { name: "Google Calendar", category: "Scheduling", status: "connected", lastSync: "5 min ago", records: "847" },
  { name: "Gmail", category: "Email", status: "connected", lastSync: "1 min ago", records: "34,200" },
  { name: "Google Drive", category: "Storage", status: "connected", lastSync: "10 min ago", records: "1,890" },
  { name: "Google Sheets", category: "Data", status: "connected", lastSync: "15 min ago", records: "56" },
  { name: "Google Docs", category: "Documents", status: "connected", lastSync: "1 hr ago", records: "234" },
  { name: "Google Tasks", category: "Tasks", status: "connected", lastSync: "3 min ago", records: "189" },
  { name: "Supabase", category: "Database", status: "connected", lastSync: "Live", records: "2.4M" },
  { name: "GitHub", category: "DevOps", status: "configured", lastSync: "N/A", records: "—" },
  { name: "Slack", category: "Messaging", status: "not_connected", lastSync: "—", records: "—" },
  { name: "Stripe", category: "Payments", status: "not_connected", lastSync: "—", records: "—" },
  { name: "Zapier", category: "Automation", status: "not_connected", lastSync: "—", records: "—" },
];

function StatusBadge({ status }) {
  if (status === "connected") return (
    <div className="flex items-center gap-1 text-[10px] font-medium text-green-400">
      <CheckCircle2 className="w-3 h-3" /> Connected
    </div>
  );
  if (status === "configured") return (
    <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
      <Plug className="w-3 h-3" /> Configured
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
      <AlertCircle className="w-3 h-3" /> Not Connected
    </div>
  );
}

export default function AdminIntegrationHub() {
  const connected = integrations.filter(i => i.status === "connected");
  const others = integrations.filter(i => i.status !== "connected");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <div className="text-xl font-bold text-foreground">{connected.length}</div>
          <div className="text-[11px] text-muted-foreground">Connected</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <div className="text-xl font-bold text-foreground">{others.filter(i => i.status === "configured").length}</div>
          <div className="text-[11px] text-muted-foreground">Configured</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-3 text-center">
          <div className="text-xl font-bold text-foreground">{others.filter(i => i.status === "not_connected").length}</div>
          <div className="text-[11px] text-muted-foreground">Available</div>
        </div>
      </div>

      {/* Connected */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Active Integrations</h3>
        <div className="space-y-2">
          {connected.map((int) => (
            <div key={int.name} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{int.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{int.category}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {int.records} records · Synced {int.lastSync}
                </div>
              </div>
              <StatusBadge status={int.status} />
            </div>
          ))}
        </div>
      </div>

      {/* Others */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Other Connectors</h3>
        <div className="space-y-2">
          {others.map((int) => (
            <div key={int.name} className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{int.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{int.category}</span>
                </div>
              </div>
              <StatusBadge status={int.status} />
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}