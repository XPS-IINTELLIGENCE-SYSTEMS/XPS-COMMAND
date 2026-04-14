import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getEffectiveRole, getRoleLabel, getRoleColor } from "@/lib/permissions";
import { X, Send, Brain, Trash2, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "What should I do today?", icon: "✅" },
  { label: "Prep my next call", icon: "📞" },
  { label: "Write a follow-up email", icon: "✉️" },
  { label: "Explain this lead", icon: "🔍" },
];

export default function AIAssistantPanel({ open, onClose, pageContext }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [loadingCtx, setLoadingCtx] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && user) loadContext();
  }, [open, user]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadContext = async () => {
    setLoadingCtx(true);
    try {
      const res = await base44.functions.invoke("xpsAssistant", { action: "get_context" });
      setContext(res.data);
      if (res.data.history?.length > 0) {
        setMessages(res.data.history.map(h => ({ role: h.role, content: h.content })));
      }
    } catch {}
    setLoadingCtx(false);
  };

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) return;
    const msg = text.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await base44.functions.invoke("xpsAssistant", {
        action: "chat",
        message: msg,
        page_context: pageContext,
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
      if (res.data.memory) setContext(prev => ({ ...prev, memory: res.data.memory }));
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    }
    setLoading(false);
  };

  const resetMemory = async () => {
    if (!confirm("Reset all AI memory? This cannot be undone.")) return;
    await base44.functions.invoke("xpsAssistant", { action: "reset_memory" });
    setMessages([]);
    setContext(prev => ({ ...prev, memory: {}, history: [] }));
  };

  if (!open) return null;

  const role = getEffectiveRole(user);
  const personaName = context?.persona_name || "XPS Intelligence";
  const memoryKeys = context?.memory ? Object.keys(context.memory).filter(k => context.memory[k]) : [];

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-[100] flex flex-col bg-background border-l border-border shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl metallic-gold-bg flex items-center justify-center">
            <Brain className="w-5 h-5 text-background" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{personaName}</div>
            <div className="text-[10px] font-medium" style={{ color: getRoleColor(role) }}>
              {getRoleLabel(role)} AI · {context?.total_interactions || 0} interactions
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={resetMemory} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Reset memory">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Memory indicators */}
      {memoryKeys.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-primary/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-[10px] text-primary font-medium">Remembers:</span>
            {memoryKeys.slice(0, 4).map(k => (
              <span key={k} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">
                {k.replace(/_/g, " ")}
              </span>
            ))}
            {memoryKeys.length > 4 && (
              <span className="text-[10px] text-primary/60">+{memoryKeys.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loadingCtx ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-3 text-primary/30" />
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {context?.memory?.preferred_name
                  ? `Welcome back, ${context.memory.preferred_name}`
                  : `Hello, ${user?.full_name?.split(" ")[0] || "there"}`}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Your personal {getRoleLabel(role)} AI assistant
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => sendMessage(qa.label)}
                    className="text-left p-2.5 rounded-xl glass-card hover:border-primary/30 transition-all text-xs"
                  >
                    <span className="text-base">{qa.icon}</span>
                    <div className="text-[11px] text-muted-foreground mt-1">{qa.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                )}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card/50">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
            placeholder="Ask your AI assistant..."
            className="flex-1 bg-transparent border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}