import { useState, useEffect, useRef } from "react";
import { Send, GitBranch, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function SubAgentChat({ agent, onStatusChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    createSubConversation();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const createSubConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "xps_assistant",
        metadata: { name: agent.name, type: "sub_agent", task: agent.task },
      });
      setConversation(conv);

      // Auto-send initial task if present
      if (agent.task) {
        const taskMsg = `[SUB-AGENT TASK] You are a sub-agent named "${agent.name}" spawned for a specific parallel task. Focus ONLY on this task:\n\n${agent.task}`;
        await base44.agents.addMessage(conv, { role: "user", content: taskMsg });
        onStatusChange?.(agent.id, "running");
      }
    } catch (err) {
      console.error("Sub-agent init failed:", err);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      const msgs = data.messages || [];
      setMessages(msgs);
      // Detect completion
      const lastAssistant = [...msgs].reverse().find(m => m.role === "assistant");
      if (lastAssistant?.content && msgs.length > 2) {
        onStatusChange?.(agent.id, "done");
      }
    });
    return () => unsub();
  }, [conversation?.id]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || loading) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: msg });
    } catch (err) {
      console.error("Sub-agent send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-agent header */}
      <div className="px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3 h-3 text-xps-purple" />
          <span className="text-[10px] font-semibold text-foreground">{agent.name}</span>
          {agent.status === "running" && <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />}
          {agent.status === "done" && <CheckCircle2 className="w-2.5 h-2.5 text-xps-green" />}
        </div>
        {agent.task && (
          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{agent.task}</p>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.filter(m => m.content).map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="rounded-xl px-2.5 py-1.5 bg-primary text-primary-foreground max-w-[85%]">
                <p className="text-[10px] leading-relaxed">{msg.content?.replace(/\[SUB-AGENT TASK\].*?task:\n\n/s, "")}</p>
              </div>
            ) : (
              <div className="max-w-[90%] py-0.5">
                <ReactMarkdown className="text-[10px] leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary">
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message sub-agent..."
            className="flex-1 bg-card border border-border rounded-md px-2 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <Button size="icon" className="h-7 w-7 metallic-gold-bg text-background rounded-md" onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}