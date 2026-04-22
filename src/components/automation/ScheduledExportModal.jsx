import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function ScheduledExportModal({ export: initialExport, onSave, onClose }) {
  const [data, setData] = useState(initialExport || {
    name: '',
    export_type: 'daily_summary',
    schedule: 'daily',
    schedule_time: '09:00',
    delivery_method: 'email',
    delivery_target: '',
    include_metrics: true,
    include_charts: true,
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {initialExport ? 'Edit Export Schedule' : 'New Export Schedule'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold block mb-1">Schedule Name</label>
              <Input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="e.g., Daily 9am Summary"
                required
              />
            </div>

            {/* Export Type */}
            <div>
              <label className="text-xs font-semibold block mb-2">What to Export</label>
              <div className="grid grid-cols-3 gap-2">
                {['daily_summary', 'pipeline_status', 'both'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setData({ ...data, export_type: type })}
                    className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                      data.export_type === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type === 'daily_summary' ? 'Summary' : type === 'pipeline_status' ? 'Pipeline' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="text-xs font-semibold block mb-2">Schedule</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['daily', 'weekly', 'custom_cron'].map(sched => (
                  <button
                    key={sched}
                    type="button"
                    onClick={() => setData({ ...data, schedule: sched })}
                    className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                      data.schedule === sched
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sched === 'daily' ? 'Daily' : sched === 'weekly' ? 'Weekly' : 'Custom'}
                  </button>
                ))}
              </div>
              <Input
                type="time"
                value={data.schedule_time}
                onChange={(e) => setData({ ...data, schedule_time: e.target.value })}
              />
            </div>

            {/* Delivery */}
            <div>
              <label className="text-xs font-semibold block mb-2">Delivery Method</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {['email', 'slack'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setData({ ...data, delivery_method: method })}
                    className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                      data.delivery_method === method
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {method === 'email' ? '📧 Email' : '💬 Slack'}
                  </button>
                ))}
              </div>
              <Input
                value={data.delivery_target}
                onChange={(e) => setData({ ...data, delivery_target: e.target.value })}
                placeholder={data.delivery_method === 'email' ? 'user@example.com' : 'Slack webhook or channel'}
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-2 p-2 bg-secondary/30 rounded">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.include_metrics}
                  onChange={(e) => setData({ ...data, include_metrics: e.target.checked })}
                  className="rounded"
                />
                Include metrics
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.include_charts}
                  onChange={(e) => setData({ ...data, include_charts: e.target.checked })}
                  className="rounded"
                />
                Include charts
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData({ ...data, is_active: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>

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