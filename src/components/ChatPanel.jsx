import { useState, useEffect, useRef } from "react";
import { Send, Bot, Plus, Loader2, Sparkles, Globe, Pencil, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        {message.tool_calls?.length > 0 && (
          <div className="mb-1.5 space-y-1">
            {message.tool_calls.map((tc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-secondary/50 rounded-md px-2 py-1">
                {tc.status === "in_progress" || tc.status === "running" ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                )}
                <span>{tc.name?.split(".").pop() || "Processing"}</span>
              </div>
            ))}
          </div>
        )}
        {message.content && (
          <div className={`rounded-xl px-3 py-2 ${
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-card border border-border"
          }`}>
            {isUser ? (
              <p className="text-xs leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown className="text-xs prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary">
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initConversation = async () => {
    try {
      const convos = await base44.agents.listConversations({ agent_name: "xps_assistant" });
      let conv;
      if (convos && convos.length > 0) {
        conv = await base44.agents.getConversation(convos[0].id);
        setMessages(conv.messages || []);
      } else {
        conv = await base44.agents.createConversation({
          agent_name: "xps_assistant",
          metadata: { name: "XPS Assistant Chat" },
        });
      }
      setConversation(conv);
    } catch (err) {
      console.error("Failed to init conversation:", err);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
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
      console.error("Send failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    setInitializing(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: "xps_assistant",
        metadata: { name: "XPS Assistant Chat" },
      });
      setConversation(conv);
      setMessages([]);
    } catch (err) {
      console.error("New chat failed:", err);
    } finally {
      setInitializing(false);
    }
  };

  const quickActions = [
    { label: "Research a company", icon: Globe },
    { label: "Draft a proposal", icon: Pencil },
    { label: "Analyze pipeline", icon: Database },
  ];

  return (
    <div className="w-[320px] min-w-[320px] h-full border-l border-border flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 min-h-[48px] border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">XPS AI Agent</div>
            <div className="text-[9px] text-xps-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-xps-green inline-block" />
              Autonomous
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewChat}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {initializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">XPS Intelligence Agent</h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              Autonomous AI with web research, CRM access, and proposal generation capabilities.
            </p>
            <div className="space-y-2 w-full">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => { setInput(action.label); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-foreground">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask XPS AI anything..."
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            disabled={loading || initializing}
          />
          <Button
            size="icon"
            className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            onClick={handleSend}
            disabled={loading || initializing || !input.trim()}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
          <Globe className="w-2.5 h-2.5" />
          Web research enabled
          <span className="mx-1">•</span>
          <Database className="w-2.5 h-2.5" />
          CRM access active
        </div>
      </div>
    </div>
  );
}