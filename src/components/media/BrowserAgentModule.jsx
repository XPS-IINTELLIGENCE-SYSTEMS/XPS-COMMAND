import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Globe, Loader2, Bot, Send, MessageSquare, Mail, FileText, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TASK_TYPES = [
  { id: "form_fill", label: "Form Fill", icon: FileText, desc: "Auto-fill web forms" },
  { id: "web_research", label: "Web Research", icon: Globe, desc: "Browse & extract data" },
  { id: "social_post", label: "Social Post", icon: Send, desc: "Post to social media" },
  { id: "social_engage", label: "Social Engage", icon: MessageSquare, desc: "Like, comment, respond" },
  { id: "email_send", label: "Send Email", icon: Mail, desc: "Compose & send email" },
  { id: "sms_send", label: "Send SMS", icon: MessageSquare, desc: "Send text message" },
];

export default function BrowserAgentModule() {
  const [taskType, setTaskType] = useState("web_research");
  const [instructions, setInstructions] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const execute = async () => {
    if (!instructions.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke("browserAgent", {
      task_type: taskType, instructions, target_url: targetUrl, recipient, message_content: messageContent
    });
    setResult(res.data);
    setLoading(false);
    toast({ title: `Agent task complete: ${res.data?.task_summary?.substring(0, 50) || taskType}` });
  };

  const activeTask = TASK_TYPES.find(t => t.id === taskType);
  const needsUrl = ["form_fill", "web_research", "social_post", "social_engage"].includes(taskType);
  const needsRecipient = ["email_send", "sms_send"].includes(taskType);
  const needsMessage = ["social_post", "email_send", "sms_send", "social_engage"].includes(taskType);

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Bot className="w-4 h-4 text-primary" /> Browser Automation Agent
      </h3>

      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {TASK_TYPES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTaskType(t.id)}
                className={`p-2.5 rounded-lg border text-center transition-colors ${taskType === t.id ? "bg-primary/10 border-primary" : "border-border hover:border-primary/30"}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${taskType === t.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-[9px] font-medium text-foreground block">{t.label}</span>
              </button>
            );
          })}
        </div>

        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3}
          placeholder={`Instructions for ${activeTask?.label}... e.g. "${
            taskType === "form_fill" ? "Fill out the contractor registration form with XPS company info" :
            taskType === "social_engage" ? "Find posts about epoxy flooring and leave helpful, human-like comments" :
            taskType === "sms_send" ? "Send follow-up message about our quote from last week" :
            "Browse the site and extract key information"
          }"`}
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 resize-none focus:outline-none focus:border-primary" />

        {needsUrl && (
          <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="Target URL (e.g. https://instagram.com/xps)"
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 focus:outline-none focus:border-primary" />
        )}

        {needsRecipient && (
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)}
            placeholder={taskType === "sms_send" ? "Phone number (e.g. +1234567890)" : "Email address"}
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 focus:outline-none focus:border-primary" />
        )}

        {needsMessage && (
          <textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} rows={2}
            placeholder="Message content (or leave blank for AI to generate)"
            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground mb-3 resize-none focus:outline-none focus:border-primary" />
        )}

        <Button onClick={execute} disabled={loading || !instructions.trim()} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MousePointer className="w-4 h-4" />}
          {loading ? "Agent executing..." : `Execute ${activeTask?.label}`}
        </Button>
      </div>

      {result && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="text-sm font-bold text-foreground">{result.task_summary}</div>
          <div className="flex gap-3 text-[10px] text-muted-foreground">
            <span>Duration: {result.estimated_duration}</span>
            <span>Risk: <span className={result.risk_level === "low" ? "text-green-400" : result.risk_level === "high" ? "text-red-400" : "text-yellow-400"}>{result.risk_level}</span></span>
            {result.sms_sent && <span className="text-green-400">✓ SMS Sent</span>}
            {result.email_sent && <span className="text-green-400">✓ Email Sent</span>}
          </div>

          {result.steps?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Execution Steps</label>
              <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                {result.steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-card/50 border border-border">
                    <span className="text-[10px] font-bold text-primary w-5">{s.step}</span>
                    <div className="flex-1">
                      <span className="text-[10px] font-semibold text-foreground uppercase">{s.action}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">{s.target}</span>
                      {s.value && <p className="text-[10px] text-foreground mt-0.5">{s.value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.social_responses?.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Generated Responses</label>
              <div className="space-y-2 mt-1">
                {result.social_responses.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-card/50 border border-border">
                    <p className="text-[10px] text-muted-foreground">{r.context}</p>
                    <p className="text-xs text-foreground mt-1 font-medium">→ {r.response}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.generated_content && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Generated Content</label>
              <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{result.generated_content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}