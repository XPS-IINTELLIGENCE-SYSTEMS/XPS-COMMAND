import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { PlusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SupabaseInsertPanel() {
  const [table, setTable] = useState('');
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const doInsert = async () => {
    setLoading(true);
    setResult(null);
    let records;
    try { records = JSON.parse(json); } catch { setResult({ error: 'Invalid JSON' }); setLoading(false); return; }
    const res = await base44.functions.invoke('supabaseAdmin', {
      action: 'insert', table, records: Array.isArray(records) ? records : [records]
    });
    setResult(res.data);
    setLoading(false);
  };

  const doUpsert = async () => {
    setLoading(true);
    setResult(null);
    let records;
    try { records = JSON.parse(json); } catch { setResult({ error: 'Invalid JSON' }); setLoading(false); return; }
    const res = await base44.functions.invoke('supabaseAdmin', {
      action: 'upsert', table, records: Array.isArray(records) ? records : [records]
    });
    setResult(res.data);
    setLoading(false);
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <PlusCircle className="w-4 h-4 text-primary" /> Insert / Upsert Records
      </h3>

      <Input placeholder="Table name" value={table} onChange={e => setTable(e.target.value)} className="glass-input text-xs max-w-xs" />

      <Textarea
        placeholder={'[{"name": "Test", "email": "test@example.com"}]'}
        value={json}
        onChange={e => setJson(e.target.value)}
        className="glass-input text-xs font-mono h-32"
      />

      <div className="flex gap-2">
        <Button onClick={doInsert} disabled={!table || !json || loading} size="sm" className="metallic-gold-bg text-background text-xs">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />} Insert
        </Button>
        <Button onClick={doUpsert} disabled={!table || !json || loading} size="sm" variant="outline" className="text-xs">
          Upsert (merge)
        </Button>
      </div>

      {result && (
        <div className="bg-secondary/50 rounded-lg p-3 text-xs">
          {result.error ? (
            <div className="flex items-center gap-2 text-destructive"><AlertCircle className="w-4 h-4" /> {JSON.stringify(result.error)}</div>
          ) : (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-4 h-4" />
              {Array.isArray(result.data) ? `${result.data.length} records written` : 'Done'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}