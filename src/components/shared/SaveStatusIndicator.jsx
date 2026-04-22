import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SaveStatusIndicator({ status = 'idle', lastSaved = null }) {
  const statusConfig = {
    idle: { icon: null, text: '', color: 'text-muted-foreground' },
    saving: { icon: Loader2, text: 'Saving...', color: 'text-blue-500' },
    saved: { icon: Check, text: 'Saved', color: 'text-green-500' },
    error: { icon: AlertCircle, text: 'Save failed', color: 'text-destructive' },
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  if (!Icon && !lastSaved) return null;

  const timeAgo = lastSaved
    ? (() => {
        const diff = Date.now() - lastSaved.getTime();
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return `${Math.floor(diff / 3600000)}h ago`;
      })()
    : '';

  return (
    <div className={cn('flex items-center gap-1.5 text-xs font-medium', config.color)}>
      {Icon && <Icon className={cn('w-3.5 h-3.5', status === 'saving' && 'animate-spin')} />}
      <span>{config.text || `Saved ${timeAgo}`}</span>
    </div>
  );
}