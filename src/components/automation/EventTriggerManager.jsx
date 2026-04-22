import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Zap, Loader2 } from 'lucide-react';
import EventTriggerModal from './EventTriggerModal';

export default function EventTriggerManager() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);

  useEffect(() => {
    loadTriggers();
  }, []);

  const loadTriggers = async () => {
    setLoading(true);
    const data = await base44.entities.EventTrigger.list('-created_date', 20).catch(() => []);
    setTriggers(data || []);
    setLoading(false);
  };

  const handleSave = async (triggerData) => {
    if (editingTrigger) {
      await base44.entities.EventTrigger.update(editingTrigger.id, triggerData);
    } else {
      await base44.entities.EventTrigger.create(triggerData);
    }
    await loadTriggers();
    setShowModal(false);
    setEditingTrigger(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this trigger?')) {
      await base44.entities.EventTrigger.delete(id);
      await loadTriggers();
    }
  };

  const toggleActive = async (trigger) => {
    await base44.entities.EventTrigger.update(trigger.id, {
      is_active: !trigger.is_active
    });
    await loadTriggers();
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Event Triggers</h2>
        <Button onClick={() => { setEditingTrigger(null); setShowModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Trigger
        </Button>
      </div>

      {triggers.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No event triggers yet</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {triggers.map(trigger => (
            <Card key={trigger.id} className="p-4 border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{trigger.name}</h3>
                    {trigger.is_active ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400">Inactive</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                    <div>📍 {trigger.trigger_type}</div>
                    <div>⚙️ {trigger.action_type}</div>
                    {trigger.action_type === 'create_task' && (
                      <div className="col-span-2">Task: {trigger.task_title}</div>
                    )}
                  </div>
                  {trigger.trigger_count > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Fired {trigger.trigger_count} times {trigger.last_triggered && `• Last: ${new Date(trigger.last_triggered).toLocaleDateString()}`}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(trigger)}
                    className={trigger.is_active ? 'text-green-400' : 'text-gray-400'}
                  >
                    {trigger.is_active ? '✓' : '○'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditingTrigger(trigger); setShowModal(true); }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(trigger.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <EventTriggerModal
          trigger={editingTrigger}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTrigger(null); }}
        />
      )}
    </div>
  );
}