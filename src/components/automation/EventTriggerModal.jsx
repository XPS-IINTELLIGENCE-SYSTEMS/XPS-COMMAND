import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function EventTriggerModal({ trigger: initialTrigger, onSave, onClose }) {
  const [data, setData] = useState(initialTrigger || {
    name: '',
    trigger_type: 'lead_created',
    action_type: 'create_task',
    task_title: '',
    task_template: JSON.stringify({ description: '', priority: 'medium', due_date_offset: 0 }),
    alert_message: '',
    alert_recipients: JSON.stringify([]),
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {initialTrigger ? 'Edit Trigger' : 'New Event Trigger'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold block mb-1">Trigger Name</label>
              <Input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="e.g., Create task when deal won"
                required
              />
            </div>

            {/* Trigger Type */}
            <div>
              <label className="text-xs font-semibold block mb-2">Event Type</label>
              <select
                value={data.trigger_type}
                onChange={(e) => setData({ ...data, trigger_type: e.target.value })}
                className="w-full px-3 py-2 rounded border border-border bg-background text-sm"
              >
                <option value="lead_created">Lead Created</option>
                <option value="lead_qualified">Lead Qualified</option>
                <option value="lead_won">Lead Won</option>
                <option value="lead_lost">Lead Lost</option>
                <option value="activity_added">Activity Added</option>
                <option value="deal_value_threshold">Deal Value Threshold</option>
                <option value="custom_condition">Custom Condition</option>
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="text-xs font-semibold block mb-2">Action</label>
              <div className="grid grid-cols-3 gap-2">
                {['create_task', 'send_alert', 'update_field'].map(action => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setData({ ...data, action_type: action })}
                    className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                      data.action_type === action
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {action === 'create_task' ? 'Task' : action === 'send_alert' ? 'Alert' : 'Update'}
                  </button>
                ))}
              </div>
            </div>

            {/* Task config */}
            {data.action_type === 'create_task' && (
              <div className="p-3 bg-secondary/30 rounded space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Task Title</label>
                  <Input
                    value={data.task_title}
                    onChange={(e) => setData({ ...data, task_title: e.target.value })}
                    placeholder="e.g., Follow up with client"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Task Description</label>
                  <textarea
                    className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs resize-none"
                    rows="2"
                    placeholder="Task description"
                    value={JSON.parse(data.task_template).description}
                    onChange={(e) => {
                      const template = JSON.parse(data.task_template);
                      template.description = e.target.value;
                      setData({ ...data, task_template: JSON.stringify(template) });
                    }}
                  />
                </div>
              </div>
            )}

            {/* Alert config */}
            {data.action_type === 'send_alert' && (
              <div className="p-3 bg-secondary/30 rounded space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Alert Message</label>
                  <textarea
                    className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs resize-none"
                    rows="2"
                    placeholder="Alert message"
                    value={data.alert_message}
                    onChange={(e) => setData({ ...data, alert_message: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Recipients (comma-separated emails)</label>
                  <Input
                    value={JSON.parse(data.alert_recipients).join(',')}
                    onChange={(e) => setData({
                      ...data,
                      alert_recipients: JSON.stringify(e.target.value.split(',').map(s => s.trim()).filter(Boolean))
                    })}
                    placeholder="user@example.com, admin@example.com"
                  />
                </div>
              </div>
            )}

            {/* Active toggle */}
            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-secondary/30 rounded">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData({ ...data, is_active: e.target.checked })}
                className="rounded"
              />
              Active
            </label>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Save</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}