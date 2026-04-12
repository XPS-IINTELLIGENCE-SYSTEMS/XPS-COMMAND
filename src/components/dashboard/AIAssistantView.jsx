import { Bot, Sparkles } from "lucide-react";

const capabilities = [
  "Generate lead research reports from web data",
  "Draft proposals and outreach emails",
  "Analyze pipeline metrics and suggest optimizations",
  "Research competitors and market intelligence",
  "Create meeting agendas and follow-up summaries",
  "Query CRM data and generate insights",
];

export default function AIAssistantView() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-xs text-muted-foreground mt-2">
          Your autonomous AI agent is available in the chat panel on the right. 
          It can research the web, manage your data, and help with any sales intelligence task.
        </p>

        <div className="mt-6 bg-card rounded-lg border border-border p-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Capabilities</h3>
          </div>
          <div className="space-y-2">
            {capabilities.map((cap) => (
              <div key={cap} className="flex items-start gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {cap}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}