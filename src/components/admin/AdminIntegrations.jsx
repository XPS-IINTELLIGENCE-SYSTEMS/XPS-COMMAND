import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { 
  Link2, CheckCircle2, AlertCircle, Loader2, ExternalLink,
  Database, Mail, Calendar, FileText, HardDrive, ListTodo, 
  GitBranch, Cloud, Cpu, MessageSquare, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CONNECTOR_ID_MAP = {
  hubspot: "69db228b2439d854c8587167",
  googletasks: "69db201897e4e8f9ae073be7",
  gmail: "69db200274332486fd28dd7e",
  googlecalendar: "69db1fd5b6313fd0b25228dc",
  googledocs: "69db1fc1c96eac434162b6e2",
  googlesheets: "69db1fad3c50db37ad0ce8dd",
  googledrive: "69db1e5e75a5f8c15c80cf34",
};

const oauthIntegrations = [
  { key: "hubspot", name: "HubSpot CRM", desc: "Sync leads, contacts, and deals", icon: Users, category: "CRM" },
  { key: "gmail", name: "Gmail", desc: "Email sending, tracking, and inbox sync", icon: Mail, category: "EMAIL" },
  { key: "googlecalendar", name: "Google Calendar", desc: "Schedule meetings and reminders", icon: Calendar, category: "CALENDAR" },
  { key: "googledocs", name: "Google Docs", desc: "Document creation and management", icon: FileText, category: "DOCS" },
  { key: "googlesheets", name: "Google Sheets", desc: "Spreadsheet data sync and reporting", icon: FileText, category: "SHEETS" },
  { key: "googledrive", name: "Google Drive", desc: "File storage and sharing", icon: HardDrive, category: "STORAGE" },
  { key: "googletasks", name: "Google Tasks", desc: "Task management and assignments", icon: ListTodo, category: "TASKS" },
];

const apiIntegrations = [
  { key: "supabase", name: "Supabase", desc: "Database, auth, and storage backend", icon: Database, category: "DATABASE", configured: true },
  { key: "github", name: "GitHub", desc: "Repository management and CI/CD", icon: GitBranch, category: "DEVOPS", configured: true },
  { key: "vercel", name: "Vercel", desc: "Deployment and hosting platform", icon: Cloud, category: "DEVOPS", configured: true },
  { key: "groq", name: "Groq", desc: "Ultra-fast LLM inference engine", icon: Cpu, category: "AI", configured: true },
  { key: "openai", name: "ChatGPT / OpenAI", desc: "GPT-4o advanced reasoning and generation", icon: MessageSquare, category: "AI", configured: true },
];

function IntegrationCard({ integration, isOAuth }) {
  const [status, setStatus] = useState(isOAuth ? "not_checked" : (integration.configured ? "configured" : "not_configured"));
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!isOAuth) return;
    setConnecting(true);
    try {
      const connectorId = CONNECTOR_ID_MAP[integration.key];
      const url = await base44.connectors.connectAppUser(connectorId);
      const popup = window.open(url, "_blank", "width=600,height=700");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setStatus("connected");
          setConnecting(false);
        }
      }, 500);
    } catch (err) {
      console.error("Connect failed:", err);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!isOAuth) return;
    try {
      const connectorId = CONNECTOR_ID_MAP[integration.key];
      await base44.connectors.disconnectAppUser(connectorId);
      setStatus("not_checked");
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  };

  const Icon = integration.icon;
  const isConnected = status === "connected" || (!isOAuth && integration.configured);

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-xps-green" />
              <span className="text-[10px] font-medium text-xps-green">
                {isOAuth ? "Connected" : "Configured"}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Not Connected</span>
            </>
          )}
        </div>
      </div>
      <div className="text-xs font-semibold text-foreground">{integration.name}</div>
      <p className="text-[10px] text-muted-foreground mt-1 mb-3">{integration.desc}</p>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{integration.category}</span>
        {isOAuth && (
          <div>
            {isConnected ? (
              <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-muted-foreground hover:text-xps-red" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button size="sm" className="text-[10px] h-6 px-3 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleConnect} disabled={connecting}>
                {connecting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
                Connect
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminIntegrations() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">OAuth Integrations</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Google Workspace and CRM connections via OAuth</p>
        <div className="grid grid-cols-3 gap-3">
          {oauthIntegrations.map((i) => (
            <IntegrationCard key={i.key} integration={i} isOAuth={true} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">API Integrations</h3>
        <p className="text-[10px] text-muted-foreground mb-3">Services connected via API keys (managed in environment settings)</p>
        <div className="grid grid-cols-3 gap-3">
          {apiIntegrations.map((i) => (
            <IntegrationCard key={i.key} integration={i} isOAuth={false} />
          ))}
        </div>
      </div>
    </div>
  );
}