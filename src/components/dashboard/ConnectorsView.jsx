import { Link2, Plus, CheckCircle2, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const connectors = [
  { name: "HubSpot CRM", description: "Sync leads, contacts, and deals with HubSpot", category: "CRM", status: "Connected" },
  { name: "Gmail / Google Workspace", description: "Email sending, tracking, and calendar sync", category: "EMAIL", status: "Connected" },
  { name: "Twilio SMS", description: "SMS outreach and automated messaging", category: "SMS", status: "Configured" },
  { name: "Google Calendar", description: "Schedule meetings, reminders, and follow-ups", category: "CALENDAR", status: "Connected" },
  { name: "Firecrawl", description: "Web scraping and company research automation", category: "RESEARCH", status: "Configured" },
  { name: "Steel Browser", description: "Advanced headful browser automation", category: "RESEARCH", status: "Not Connected" },
  { name: "Square Payments", description: "Payment processing for proposals and invoices", category: "PAYMENTS", status: "Not Connected" },
  { name: "Playwright Workflows", description: "Automated testing and research task runners", category: "DEVOPS", status: "Not Connected" },
  { name: "GitHub", description: "Repository management and CI/CD", category: "DEVOPS", status: "Not Connected" },
];

export default function ConnectorsView() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Connector Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage integrations and external service connections</p>
        </div>
        <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-3 h-3" /> Add Connector
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {connectors.map((conn) => (
          <div key={conn.name} className="bg-card rounded-lg border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Link2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {conn.status === "Connected" && <CheckCircle2 className="w-3 h-3 text-xps-green" />}
                {conn.status === "Configured" && <Settings className="w-3 h-3 text-primary" />}
                {conn.status === "Not Connected" && <AlertCircle className="w-3 h-3 text-muted-foreground" />}
                <span className={`text-[10px] font-medium ${
                  conn.status === "Connected" ? "text-xps-green" : conn.status === "Configured" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {conn.status}
                </span>
              </div>
            </div>
            <div className="text-xs font-semibold text-foreground">{conn.name}</div>
            <p className="text-[10px] text-muted-foreground mt-1">{conn.description}</p>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-2">{conn.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}