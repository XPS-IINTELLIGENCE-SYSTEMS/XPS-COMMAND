import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Zap } from 'lucide-react';
import ScheduledExportManager from './ScheduledExportManager';
import EventTriggerManager from './EventTriggerManager';

export default function AutomationCenter() {
  const [activeTab, setActiveTab] = useState('exports');

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Automation Center</h1>
        <p className="text-muted-foreground text-sm">Schedule automated reports and set up event-driven workflows</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Scheduled Exports
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Event Triggers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exports" className="mt-4">
          <ScheduledExportManager />
        </TabsContent>

        <TabsContent value="triggers" className="mt-4">
          <EventTriggerManager />
        </TabsContent>
      </Tabs>

      {/* Help section */}
      <Card className="p-4 bg-secondary/30 border-0">
        <h3 className="font-semibold mb-2 text-sm">ℹ️ How it works</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p><strong>Scheduled Exports:</strong> Automatically generate and send PDF reports of your daily summary and pipeline status via email or Slack.</p>
          <p><strong>Event Triggers:</strong> Create automated tasks, send alerts, or perform actions when specific events occur in your pipeline.</p>
        </div>
      </Card>
    </div>
  );
}