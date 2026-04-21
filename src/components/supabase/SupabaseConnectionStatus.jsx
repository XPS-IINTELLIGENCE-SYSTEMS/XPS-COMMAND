import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Database, HardDrive, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupabaseConnectionStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const check = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('supabaseSetup', { action: 'check_connection' });
    setStatus(res.data);
    setLoading(false);
  };

  useEffect(() => { check(); }, []);

  if (loading) return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Checking Supabase connection...</span>
    </div>
  );

  if (!status?.connected) return (
    <div className="glass-card rounded-xl p-4 border border-destructive/30">
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5 text-destructive" />
        <span className="text-sm font-bold text-destructive">Supabase Not Connected</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{status?.error || 'Check your SUPABASE_URL and SUPABASE_SERVICE_KEY secrets.'}</p>
    </div>
  );

  return (
    <div className="glass-card rounded-xl p-4 border border-green-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-bold text-foreground">Supabase Connected</span>
        </div>
        <Button variant="ghost" size="icon" onClick={check} className="h-7 w-7"><RefreshCw className="w-3.5 h-3.5" /></Button>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <Database className="w-4 h-4 mx-auto text-primary mb-1" />
          <div className="text-lg font-bold metallic-gold">{status.table_count}</div>
          <div className="text-[9px] text-muted-foreground">Tables</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <HardDrive className="w-4 h-4 mx-auto text-primary mb-1" />
          <div className="text-lg font-bold metallic-gold">{status.buckets?.length || 0}</div>
          <div className="text-[9px] text-muted-foreground">Buckets</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <CheckCircle2 className="w-4 h-4 mx-auto text-green-500 mb-1" />
          <div className="text-lg font-bold text-green-500">{status.storage_accessible ? 'Yes' : 'No'}</div>
          <div className="text-[9px] text-muted-foreground">Storage</div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-2 truncate">URL: {status.url}</div>
      {status.tables?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {status.tables.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-medium">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}