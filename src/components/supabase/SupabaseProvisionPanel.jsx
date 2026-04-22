import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Database, CheckCircle2, AlertCircle, Loader2, Copy, Rocket, HardDrive, RefreshCw, Zap, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SupabaseProvisionPanel() {
  const [verification, setVerification] = useState(null);
  const [schemaSQL, setSchemaSQL] = useState(null);
  const [provisionResult, setProvisionResult] = useState(null);
  const [bucketResult, setBucketResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState({});

  const setLoadingKey = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  const getSchema = async () => {
    setLoadingKey('schema', true);
    try {
      const res = await base44.functions.invoke('supabaseProvision', { action: 'get_schema_sql' });
      setSchemaSQL(res.data);
    } catch (error) {
      toast.error('Failed to generate schema SQL');
    }
    setLoadingKey('schema', false);
  };

  const autoProvision = async () => {
    setLoadingKey('provision', true);
    setProvisionResult(null);
    try {
      const res = await base44.functions.invoke('supabaseProvision', { action: 'auto_provision' });
      setProvisionResult(res.data);
    } catch (error) {
      toast.error('Auto-provision failed: Check function logs');
    }
    setLoadingKey('provision', false);
  };

  const createBuckets = async () => {
    setLoadingKey('buckets', true);
    try {
      const res = await base44.functions.invoke('supabaseProvision', { action: 'create_buckets' });
      setBucketResult(res.data);
    } catch (error) {
      toast.error('Failed to create buckets');
    }
    setLoadingKey('buckets', false);
  };

  const verify = async () => {
    setLoadingKey('verify', true);
    try {
      const res = await base44.functions.invoke('supabaseProvision', { action: 'verify' });
      setVerification(res.data);
    } catch (error) {
      toast.error(error?.data?.message || 'Verification failed: Check your Supabase URL & API key');
      setVerification({ error: error?.data?.message || error.message });
    }
    setLoadingKey('verify', false);
  };

  const fullSync = async () => {
    setLoadingKey('sync', true);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke('supabaseProvision', { action: 'full_sync' });
      setSyncResult(res.data);
    } catch (error) {
      toast.error('Sync failed: Ensure tables exist in Supabase');
    }
    setLoadingKey('sync', false);
  };

  const copySQL = () => {
    if (schemaSQL?.sql) {
      navigator.clipboard.writeText(schemaSQL.sql);
      toast.success('SQL copied to clipboard');
    }
  };

  const readinessColor = { READY: 'text-green-500', PARTIAL: 'text-yellow-500', NOT_SETUP: 'text-destructive' };

  return (
    <div className="space-y-4">
      {/* Verification Status */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> System Readiness
          </h3>
          <Button onClick={verify} disabled={loading.verify} size="sm" variant="outline" className="text-xs">
            {loading.verify ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
            Verify
          </Button>
        </div>

        {verification ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black ${readinessColor[verification.readiness] || 'text-muted-foreground'}`}>
                {verification.readiness}
              </span>
              <span className="text-xs text-muted-foreground">
                {verification.tables?.found}/{verification.tables?.total_expected} tables • {Object.values(verification.rpc_functions || {}).filter(v => v === 'available').length}/3 RPCs
              </span>
            </div>

            {verification.tables?.missing_list?.length > 0 && (
              <div className="bg-destructive/10 rounded-lg p-2">
                <div className="text-[10px] font-bold text-destructive mb-1">Missing Tables:</div>
                <div className="flex flex-wrap gap-1">
                  {verification.tables.missing_list.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-destructive/20 text-destructive text-[9px]">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {Object.entries(verification.rpc_functions || {}).map(([fn, status]) => (
                <div key={fn} className="bg-secondary/50 rounded p-2 text-center">
                  <div className="text-[9px] text-muted-foreground">{fn}</div>
                  <div className={`text-xs font-bold ${status === 'available' ? 'text-green-500' : 'text-destructive'}`}>
                    {status === 'available' ? '✓' : '✗'}
                  </div>
                </div>
              ))}
            </div>

            {verification.storage?.buckets?.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-foreground mb-1">Storage Buckets:</div>
                <div className="flex flex-wrap gap-1">
                  {verification.storage.buckets.map(b => (
                    <span key={b} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px]">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Click Verify to check your Supabase setup.</p>
        )}
      </div>

      {/* Step 1: Get Schema SQL */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-primary" /> Step 1 — Schema SQL (24 Tables)
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          This generates the complete SQL to create all 24 enterprise tables, indexes, triggers, and 3 RPC functions.
        </p>
        <div className="flex gap-2">
          <Button onClick={getSchema} disabled={loading.schema} size="sm" className="metallic-gold-bg text-background text-xs">
            {loading.schema ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Database className="w-3.5 h-3.5 mr-1" />}
            Generate SQL
          </Button>
          {schemaSQL && (
            <Button onClick={copySQL} size="sm" variant="outline" className="text-xs">
              <Copy className="w-3.5 h-3.5 mr-1" /> Copy SQL
            </Button>
          )}
        </div>

        {schemaSQL && (
          <div className="mt-3 space-y-2">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="text-xs font-bold text-green-500 mb-1">Instructions:</div>
              <ol className="text-[10px] text-foreground space-y-1">
                {schemaSQL.instructions?.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 max-h-60 overflow-auto">
              <pre className="text-[9px] text-muted-foreground font-mono whitespace-pre-wrap">{schemaSQL.sql?.slice(0, 3000)}...</pre>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span>📊 {schemaSQL.tables_count} Tables</span>
              <span>⚡ {schemaSQL.rpc_functions?.length} RPC Functions</span>
              <span>📦 {schemaSQL.buckets?.length} Storage Buckets</span>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Auto-Provision (if exec_sql exists) */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-primary" /> Step 2 — Auto-Provision (Requires exec_sql)
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          If you already ran the SQL above (which creates exec_sql), this can auto-create remaining tables.
        </p>
        <Button onClick={autoProvision} disabled={loading.provision} size="sm" className="metallic-gold-bg text-background text-xs">
          {loading.provision ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
          Auto-Provision Tables
        </Button>

        {provisionResult && (
          <div className="mt-3 bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-green-500">✓ {provisionResult.success} succeeded</span>
              {provisionResult.failed > 0 && <span className="text-xs font-bold text-destructive">✗ {provisionResult.failed} failed</span>}
            </div>
            <div className="max-h-40 overflow-auto space-y-0.5">
              {provisionResult.results?.filter(r => r.status === 'error').slice(0, 10).map((r, i) => (
                <div key={i} className="text-[9px] text-destructive">{r.stmt} — {r.error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Create Storage Buckets */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-primary" /> Step 3 — Create Storage Buckets
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Creates 8 storage buckets: proposals, invoices, bid-documents, site-photos, brand-assets, knowledge-files, media, exports.
        </p>
        <Button onClick={createBuckets} disabled={loading.buckets} size="sm" className="metallic-gold-bg text-background text-xs">
          {loading.buckets ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <HardDrive className="w-3.5 h-3.5 mr-1" />}
          Create Buckets
        </Button>

        {bucketResult && (
          <div className="mt-3 space-y-1">
            {bucketResult.results?.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-2 py-1 bg-secondary/30 rounded">
                <span className="font-medium text-foreground">{b.bucket}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">{b.public ? 'public' : 'private'}</span>
                  {b.status === 'created' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-yellow-500" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 4: Full Data Sync */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <ArrowRightLeft className="w-4 h-4 text-primary" /> Step 4 — Full Data Sync (Base44 → Supabase)
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Exports all 20 entity types from Base44 into your Supabase tables. Runs upsert to avoid duplicates.
        </p>
        <Button onClick={fullSync} disabled={loading.sync} size="sm" className="metallic-gold-bg text-background text-xs">
          {loading.sync ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />}
          {loading.sync ? 'Syncing...' : 'Sync All Entities'}
        </Button>

        {syncResult && (
          <div className="mt-3 space-y-1 max-h-60 overflow-auto">
            {Object.entries(syncResult.report || {}).map(([entity, info]) => (
              <div key={entity} className="flex items-center justify-between text-xs px-2 py-1 bg-secondary/30 rounded">
                <span className="font-medium text-foreground">{entity}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{info.count || info.synced || 0} → {info.table}</span>
                  {info.status === 'synced' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                  {info.status === 'empty' && <span className="text-muted-foreground text-[9px]">empty</span>}
                  {info.status === 'error' && <AlertCircle className="w-3 h-3 text-destructive" />}
                  {info.status === 'partial' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}