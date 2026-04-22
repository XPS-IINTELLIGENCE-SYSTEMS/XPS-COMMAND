import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Clock, Mail, Send, Loader2, CheckCircle } from 'lucide-react';
import ScheduledExportModal from './ScheduledExportModal';

export default function ScheduledExportManager() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExport, setEditingExport] = useState(null);

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    setLoading(true);
    const data = await base44.entities.ScheduledExport.list('-created_date', 20).catch(() => []);
    setExports(data || []);
    setLoading(false);
  };

  const handleSave = async (exportData) => {
    if (editingExport) {
      await base44.entities.ScheduledExport.update(editingExport.id, exportData);
    } else {
      await base44.entities.ScheduledExport.create(exportData);
    }
    await loadExports();
    setShowModal(false);
    setEditingExport(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this scheduled export?')) {
      await base44.entities.ScheduledExport.delete(id);
      await loadExports();
    }
  };

  const handleTestRun = async (exportData) => {
    await base44.functions.invoke('scheduledExportRunner', {
      export_id: exportData.id,
      delivery_method: exportData.delivery_method,
      delivery_target: exportData.delivery_target,
      export_type: exportData.export_type,
      include_metrics: exportData.include_metrics,
      include_charts: exportData.include_charts
    });
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Scheduled Exports</h2>
        <Button onClick={() => { setEditingExport(null); setShowModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Export Schedule
        </Button>
      </div>

      {exports.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No scheduled exports yet</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {exports.map(exp => (
            <Card key={exp.id} className="p-4 border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{exp.name}</h3>
                    {exp.is_active && <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>📋 {exp.export_type}</div>
                    <div>🔄 {exp.schedule}</div>
                    <div>⏰ {exp.schedule_time}</div>
                    <div>
                      {exp.delivery_method === 'email' ? (
                        <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {exp.delivery_target}</div>
                      ) : (
                        <div className="flex items-center gap-1"><Send className="w-3 h-3" /> Slack</div>
                      )}
                    </div>
                  </div>
                  {exp.last_run && (
                    <div className="text-xs text-muted-foreground">
                      ✓ Last run: {new Date(exp.last_run).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleTestRun(exp)} title="Send test export now">
                    Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditingExport(exp); setShowModal(true); }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(exp.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <ScheduledExportModal
          export={editingExport}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingExport(null); }}
        />
      )}
    </div>
  );
}