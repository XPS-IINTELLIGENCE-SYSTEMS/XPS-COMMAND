import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function AgentChat({ agent, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef(null);
  const Icon = agent.icon;

  useEffect(() => {
    initConversation();
  }, [agent.id]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      if (data?.messages) setMessages(data.messages);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const initConversation = async () => {
    setInitializing(true);
    setMessages([]);
    const conv = await base44.agents.createConversation({
      agent_name: agent.id,
      metadata: { name: `${agent.name} Session` },
    });
    setConversation(conv);
    setInitializing(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || loading) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/30 flex-shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="shimmer-icon-container w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className={`w-4 h-4 ${agent.color || 'metallic-gold-icon'}`} />
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{agent.name}</div>
          <div className="text-[10px] text-muted-foreground">{agent.role} · Live Session</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold text-green-500">ACTIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {initializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <Icon className={`w-7 h-7 ${agent.color || 'metallic-silver-icon'}`} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">{agent.name}</h3>
            <p className="text-[10px] text-muted-foreground max-w-xs">{agent.desc}</p>
            <p className="text-[10px] text-primary mt-3">Type a command to start this agent...</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${agent.color || 'metallic-gold-icon'}`} />}
                <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
                  {msg.tool_calls?.length > 0 && (
                    <div className="mb-1.5 space-y-1">
                      {msg.tool_calls.map((tc, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-secondary/50 rounded-md px-2 py-1">
                          {tc.status === "in_progress" || tc.status === "running" ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                          ) : (
                            <Bot className="w-2.5 h-2.5 text-primary" />
                          )}
                          <span>{tc.name?.split(".").pop() || "Processing"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.content && (
                    isUser ? (
                      <div className="rounded-xl px-3 py-2 bg-secondary/80 border border-border">
                        <p className="text-xs leading-relaxed text-foreground">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        <ReactMarkdown className="text-[11px] leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-foreground">
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Command ${agent.name}...`}
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 chat-input-metallic"
            disabled={loading || initializing}
          />
          <button
            onClick={handleSend}
            disabled={loading || initializing || !input.trim()}
            className="h-9 w-9 flex items-center justify-center metallic-gold-bg text-background rounded-lg hover:brightness-110 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}