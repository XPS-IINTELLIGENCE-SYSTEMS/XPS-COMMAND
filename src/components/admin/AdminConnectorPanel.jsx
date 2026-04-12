import { useState } from "react";
import { HardDrive, Database, GitBranch, Loader2, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CONNECTORS = {
  drive: {
    name: "Google Drive",
    icon: HardDrive,
    connectorId: "69db1e5e75a5f8c15c80cf34",
    color: "text-green-400",
    desc: "Connect your Google Drive to upload, browse, and manage files directly from the admin panel.",
  },
  supabase: {
    name: "Supabase",
    icon: Database,
    connectorId: null,
    color: "text-emerald-400",
    desc: "Supabase is connected via API key. Use the admin chat to query your Supabase database directly.",
    apiConnected: true,
  },
  github: {
    name: "GitHub",
    icon: GitBranch,
    connectorId: null,
    color: "text-white/70",
    desc: "GitHub is connected via API token. Use the admin chat to browse repos, create issues, and deploy.",
    apiConnected: true,
  },
};

export default function AdminConnectorPanel({ type }) {
  const connector = CONNECTORS[type];
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(connector.apiConnected || false);
  const Icon = connector.icon;

  const handleConnect = async () => {
    if (!connector.connectorId) return;
    setConnecting(true);
    try {
      const url = await base44.connectors.connectAppUser(connector.connectorId);
      const popup = window.open(url, "_blank", "width=600,height=700");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnected(true);
          setConnecting(false);
        }
      }, 500);
    } catch {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connector.connectorId) return;
    await base44.connectors.disconnectAppUser(connector.connectorId);
    setConnected(false);
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-5 max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <Icon className={`w-8 h-8 ${connector.color}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{connector.name}</h2>
          <p className="text-xs text-white/40 mt-2 leading-relaxed">{connector.desc}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {connected || connector.apiConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold text-green-400">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <AlertCircle className="w-4 h-4 text-white/40" />
              <span className="text-xs font-medium text-white/40">Not Connected</span>
            </div>
          )}
        </div>

        {connector.connectorId && (
          <div className="flex items-center justify-center gap-3">
            {connected ? (
              <button onClick={handleDisconnect} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                Disconnect
              </button>
            ) : (
              <button onClick={handleConnect} disabled={connecting} className="px-5 py-2.5 rounded-xl metallic-gold-bg text-background text-xs font-bold disabled:opacity-50 flex items-center gap-2">
                {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {connecting ? "Connecting..." : `Connect ${connector.name}`}
              </button>
            )}
          </div>
        )}

        {(connected || connector.apiConnected) && (
          <p className="text-[10px] text-white/30 mt-4">
            Use the Admin Operator chat to interact with {connector.name}. Example: "List my {type === 'drive' ? 'Drive files' : type === 'github' ? 'GitHub repos' : 'Supabase tables'}"
          </p>
        )}
      </div>
    </div>
  );
}