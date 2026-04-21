import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Terminal, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SupabaseRpcPanel() {
  const [fnName, setFnName] = useState('');
  const [params, setParams] = useState('{}');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResult(null);
    let parsed = {};
    try { parsed = JSON.parse(params); } catch {}
    const res = await base44.functions.invoke('supabaseAdmin', {
      action: 'rpc', function_name: fnName, params: parsed
    });
    setResult(res.data);
    setLoading(false);
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" /> Supabase RPC / Stored Procedures
      </h3>
      <p className="text-[10px] text-muted-foreground">Call any Supabase Edge Function or stored procedure by name.</p>

      <div className="flex gap-2">
        <Input placeholder="function_name" value={fnName} onChange={e => setFnName(e.target.value)} className="glass-input text-xs max-w-[200px]" />
        <Button onClick={run} disabled={!fnName || loading} size="sm" className="metallic-gold-bg text-background">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Execute
        </Button>
      </div>

      <Textarea
        placeholder='{"key": "value"}'
        value={params}
        onChange={e => setParams(e.target.value)}
        className="glass-input text-xs font-mono h-20"
      />

      {result && (
        <pre className="bg-secondary/50 rounded-lg p-3 text-[10px] text-foreground overflow-auto max-h-60 font-mono">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}