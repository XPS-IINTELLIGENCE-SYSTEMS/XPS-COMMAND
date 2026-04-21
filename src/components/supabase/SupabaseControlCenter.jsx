import { useState } from "react";
import { Database, Table, ArrowRightLeft, Terminal, PlusCircle, Rocket, HardDrive } from "lucide-react";
import SupabaseConnectionStatus from "./SupabaseConnectionStatus";
import SupabaseTableExplorer from "./SupabaseTableExplorer";
import SupabaseSyncPanel from "./SupabaseSyncPanel";
import SupabaseRpcPanel from "./SupabaseRpcPanel";
import SupabaseInsertPanel from "./SupabaseInsertPanel";
import SupabaseProvisionPanel from "./SupabaseProvisionPanel";

const TABS = [
  { id: "provision", label: "Setup & Provision", icon: Rocket },
  { id: "explore", label: "Table Explorer", icon: Table },
  { id: "sync", label: "Sync Engine", icon: ArrowRightLeft },
  { id: "insert", label: "Insert / Upsert", icon: PlusCircle },
  { id: "rpc", label: "RPC / Functions", icon: Terminal },
  { id: "storage", label: "Storage", icon: HardDrive },
];

export default function SupabaseControlCenter() {
  const [tab, setTab] = useState("provision");

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold metallic-gold tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6" /> Supabase Enterprise Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Full enterprise data layer — 24 tables, 8 storage buckets, RPC functions, auto-sync, and provisioning.
        </p>
      </div>

      <SupabaseConnectionStatus />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "metallic-gold-bg text-background"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "provision" && <SupabaseProvisionPanel />}
      {tab === "explore" && <SupabaseTableExplorer />}
      {tab === "sync" && <SupabaseSyncPanel />}
      {tab === "insert" && <SupabaseInsertPanel />}
      {tab === "rpc" && <SupabaseRpcPanel />}
      {tab === "storage" && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary" /> Storage Management
          </h3>
          <p className="text-xs text-muted-foreground">
            Use the "Setup & Provision" tab to create storage buckets. Once created, use the RPC panel or Supabase Dashboard to manage files.
          </p>
          <SupabaseRpcPanel />
        </div>
      )}
    </div>
  );
}