import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabaseClient } from '@/lib/supabaseClient';
import { Download, Upload, Database, AlertTriangle, CheckCircle2, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ENTITIES = [
  'Lead', 'ProspectCompany', 'Contractor', 'CommercialJob', 'CallLog',
  'Proposal', 'Invoice', 'BidDocument', 'OutreachEmail', 'MessageTemplate',
  'FloorScope', 'ScheduledCall', 'Workflow', 'AgentTask', 'OrchestratorLog'
];

export default function MigrationDashboard() {
  const [entities, setEntities] = useState({});
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState({});
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [preview, setPreview] = useState([]);

  // ── STEP 1: SCAN ALL ENTITIES ──
  useEffect(() => {
    const scanAll = async () => {
      setLoading(true);
      const results = {};
      for (const entity of ENTITIES) {
        try {
          const data = await base44.asServiceRole.entities[entity].list('-created_date', 100).catch(() => []);
          results[entity] = data || [];
        } catch (e) {
          results[entity] = [];
        }
      }
      setEntities(results);
      setLoading(false);
    };
    scanAll();
  }, []);

  // ── EXPORT TO CSV ──
  const exportCSV = (entityName) => {
    const data = entities[entityName] || [];
    if (data.length === 0) {
      alert(`No records for ${entityName}`);
      return;
    }
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName}_${new Date().getTime()}.csv`;
    a.click();
  };

  // ── PUSH TO SUPABASE ──
  const pushToSupabase = async (entityName) => {
    const data = entities[entityName] || [];
    if (data.length === 0) {
      alert(`No records for ${entityName}`);
      return;
    }

    setMigrating(true);
    setStatus(prev => ({ ...prev, [entityName]: 'Pushing...' }));

    try {
      // Map entity names to Supabase table names (snake_case)
      const tableMap = {
        'Lead': 'leads',
        'ProspectCompany': 'prospect_companies',
        'Contractor': 'contractors',
        'CommercialJob': 'commercial_jobs',
        'CallLog': 'call_logs',
        'Proposal': 'proposals',
        'Invoice': 'invoices',
        'BidDocument': 'bid_documents',
        'OutreachEmail': 'outreach_emails',
        'MessageTemplate': 'message_templates',
        'FloorScope': 'floor_scopes',
        'ScheduledCall': 'scheduled_calls',
        'Workflow': 'workflows',
        'AgentTask': 'agent_tasks',
        'OrchestratorLog': 'orchestrator_logs',
      };

      const table = tableMap[entityName];
      if (!table) throw new Error(`No table mapping for ${entityName}`);

      // Clean data: remove Base44 metadata, keep only core fields
      const cleanedData = data.map(row => {
        const clean = { ...row };
        delete clean.created_by; // Can't migrate auth ownership
        return clean;
      });

      // Batch insert (Supabase has limits, so chunk if needed)
      const batchSize = 50;
      for (let i = 0; i < cleanedData.length; i += batchSize) {
        const batch = cleanedData.slice(i, i + batchSize);
        const { error } = await supabaseClient.from(table).insert(batch, { returning: 'minimal' });
        if (error) throw error;
      }

      setStatus(prev => ({ ...prev, [entityName]: `✅ Pushed ${data.length} records` }));
    } catch (e) {
      setStatus(prev => ({ ...prev, [entityName]: `❌ ${e.message}` }));
    }
    setMigrating(false);
  };

  // ── PREVIEW ──
  const showPreview = (entityName) => {
    setSelectedEntity(entityName);
    setPreview((entities[entityName] || []).slice(0, 3));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-black text-foreground">Base44 → Supabase Migration</h1>
          </div>
          <p className="text-sm text-muted-foreground">Export all entities and push to Supabase to finalize your migration off Base44.</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="glass-card rounded-lg p-4">
            <div className="text-2xl font-black text-primary">{Object.keys(entities).length}</div>
            <div className="text-xs text-muted-foreground">Total Entities</div>
          </div>
          <div className="glass-card rounded-lg p-4">
            <div className="text-2xl font-black text-accent">{Object.values(entities).flat().length}</div>
            <div className="text-xs text-muted-foreground">Total Records</div>
          </div>
          <div className="glass-card rounded-lg p-4">
            <div className="text-2xl font-black text-green-500">{Object.values(status).filter(s => s?.includes('✅')).length}</div>
            <div className="text-xs text-muted-foreground">Migrated</div>
          </div>
          <div className="glass-card rounded-lg p-4">
            <div className="text-2xl font-black text-destructive">{Object.values(status).filter(s => s?.includes('❌')).length}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>

        {/* Entities Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Entity</th>
                <th className="px-4 py-3 text-left font-bold">Records</th>
                <th className="px-4 py-3 text-left font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ENTITIES.map(entity => (
                <tr key={entity} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{entity}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{(entities[entity] || []).length}</td>
                  <td className="px-4 py-3">
                    {status[entity] ? (
                      <span className={`text-xs font-bold ${status[entity]?.includes('✅') ? 'text-green-500' : status[entity]?.includes('❌') ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {status[entity]}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Ready</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => showPreview(entity)}>
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportCSV(entity)}>
                      <Download className="w-3.5 h-3.5" /> CSV
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => pushToSupabase(entity)} 
                      disabled={migrating || (entities[entity] || []).length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {migrating && status[entity]?.includes('Pushing') ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      Push
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Preview Modal */}
        {selectedEntity && preview.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-auto">
              <h3 className="text-lg font-bold text-foreground mb-4">{selectedEntity} — Preview (First 3)</h3>
              <pre className="bg-secondary p-4 rounded-lg text-xs text-muted-foreground overflow-auto max-h-96">
                {JSON.stringify(preview, null, 2)}
              </pre>
              <Button variant="outline" className="mt-4" onClick={() => setSelectedEntity(null)}>Close</Button>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="mt-8 glass-card rounded-xl p-6 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-foreground mb-2">Before You Push:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Ensure Supabase tables are created with matching schema (see requirements below)</li>
                <li>Check that table names are in snake_case (e.g., 'lead' → 'leads')</li>
                <li>Remove primary keys from exports to let Supabase generate new ones</li>
                <li>Test with one small entity first (CallLog, MessageTemplate)</li>
                <li>After migration, update app to use Supabase client (see abstraction layer)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}