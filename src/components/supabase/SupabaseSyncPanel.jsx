import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowRightLeft, Loader2, CheckCircle2, AlertCircle, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ENTITY_OPTIONS = [
  'Lead', 'CommercialJob', 'ContractorCompany', 'IntelRecord', 'Proposal',
  'Invoice', 'OutreachEmail', 'ScheduledCall', 'AgentTask', 'CalendarEvent',
  'SEOContent', 'SEOKeyword', 'KnowledgeBase', 'Workflow', 'BusinessPlan',
  'ResearchResult', 'CrawlResult', 'ScrapeJob', 'AgentJob',
];

export default function SupabaseSyncPanel() {
  const [direction, setDirection] = useState('to_supabase');
  const [entity, setEntity] = useState('Lead');
  const [targetTable, setTargetTable] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkSyncing, setBulkSyncing] = useState(false);

  const runSync = async () => {
    setSyncing(true);
    setResult(null);
    const tableName = targetTable || entity.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

    if (direction === 'to_supabase') {
      const res = await base44.functions.invoke('supabaseAdmin', {
        action: 'sync_to_supabase', entity_name: entity, target_table: tableName
      });
      setResult(res.data);
    } else {
      const res = await base44.functions.invoke('supabaseAdmin', {
        action: 'sync_from_supabase', source_table: tableName, entity_name: entity
      });
      setResult(res.data);
    }
    setSyncing(false);
  };

  const bulkExport = async () => {
    setBulkSyncing(true);
    setBulkResult(null);
    const res = await base44.functions.invoke('supabaseSetup', { action: 'bulk_export' });
    setBulkResult(res.data?.report);
    setBulkSyncing(false);
  };

  return (
    <div className="space-y-4">
      {/* Individual Sync */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-primary" /> Entity Sync
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger className="glass-input text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="to_supabase">Base44 → Supabase</SelectItem>
              <SelectItem value="from_supabase">Supabase → Base44</SelectItem>
            </SelectContent>
          </Select>

          <Select value={entity} onValueChange={setEntity}>
            <SelectTrigger className="glass-input text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input
            placeholder="Table name (auto)"
            value={targetTable}
            onChange={e => setTargetTable(e.target.value)}
            className="glass-input text-xs"
          />

          <Button onClick={runSync} disabled={syncing} className="metallic-gold-bg text-background text-xs">
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : direction === 'to_supabase' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            Sync
          </Button>
        </div>

        {result && (
          <div className="bg-secondary/50 rounded-lg p-3 text-xs">
            {result.error ? (
              <div className="flex items-center gap-2 text-destructive"><AlertCircle className="w-4 h-4" /> {JSON.stringify(result.error)}</div>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                Synced {result.synced || result.created || 0} records
                {result.errors?.length > 0 && <span className="text-destructive ml-2">({result.errors.length} errors)</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Export */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" /> Bulk Export All Entities → Supabase
          </h3>
          <Button onClick={bulkExport} disabled={bulkSyncing} size="sm" className="metallic-gold-bg text-background text-xs">
            {bulkSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Export All
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Exports Lead, CommercialJob, ContractorCompany, IntelRecord, Proposal, Invoice, OutreachEmail, ScheduledCall, AgentTask, CalendarEvent to matching Supabase tables.</p>

        {bulkResult && (
          <div className="space-y-1">
            {Object.entries(bulkResult).map(([entity, info]) => (
              <div key={entity} className="flex items-center justify-between text-xs px-2 py-1 bg-secondary/30 rounded">
                <span className="font-medium text-foreground">{entity}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{info.count || 0} records</span>
                  {info.status === 'synced' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                  {info.status === 'error' && <AlertCircle className="w-3 h-3 text-destructive" />}
                  {info.status === 'empty' && <span className="text-muted-foreground">—</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}