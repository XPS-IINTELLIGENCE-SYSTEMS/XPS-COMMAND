import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Send, Plus, Loader2, Sparkles, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    if (text.length < 5) { setDisplayed(text); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const speed = Math.max(8, Math.min(22, 1500 / text.length));
    const timer = setInterval(() => {
      i += 1;
      if (i >= text.length) { setDisplayed(text); setDone(true); clearInterval(timer); }
      else setDisplayed(text.slice(0, i));
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <ReactMarkdown className="text-xs leading-relaxed text-white max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-white [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_table]:text-[10px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-white/20 [&_td]:border [&_td]:border-white/10">
      {done ? text : displayed + "▍"}
    </ReactMarkdown>
  );
}

function Bubble({ message, isLatest }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className={`max-w-[88%] ${isUser ? "order-first" : ""}`}>
        {message.tool_calls?.length > 0 && (
          <div className="mb-1.5 space-y-1">
            {message.tool_calls.map((tc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/50 bg-white/5 rounded-md px-2 py-1">
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
          isUser ? (
            <div className="rounded-xl px-3 py-2 bg-white/10 border border-white/20">
              <p className="text-xs leading-relaxed text-white font-medium">{message.content}</p>
            </div>
          ) : (
            <div className="py-1">
              {isLatest ? <TypingText text={message.content} /> : (
                <ReactMarkdown className="text-xs leading-relaxed text-white max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-white [&_table]:text-[10px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-white/20 [&_td]:border [&_td]:border-white/10">
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

const AdminChat = forwardRef(function AdminChat(_, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef(null);
  const convRef = useRef(null);

  useImperativeHandle(ref, () => ({
    sendCommand: async (cmd) => {
      if (!cmd) return;
      const conv = convRef.current;
      if (!conv) { setInput(cmd); return; }
      setLoading(true);
      await base44.agents.addMessage(conv, { role: "user", content: cmd });
      setLoading(false);
    }
  }));

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      if (data?.messages) setMessages(data.messages);
    });
    return () => { if (unsub) unsub(); };
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last?.role !== "assistant") return;
    const el = scrollRef.current;
    const iv = setInterval(() => { el.scrollTop = el.scrollHeight; }, 120);
    return () => clearInterval(iv);
  }, [messages]);

  const init = async () => {
    setInitializing(true);
    const conv = await base44.agents.createConversation({
      agent_name: "admin_operator",
      metadata: { name: "Admin Command Session" },
    });
    setConversation(conv);
    convRef.current = conv;
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
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="h-10 min-h-[40px] border-b border-white/10 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
            <Bot className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-bold text-white tracking-wider">ADMIN OPERATOR</span>
        </div>
        <button onClick={init} className="p-1 rounded-md hover:bg-white/10">
          <Plus className="w-3.5 h-3.5 text-white/50" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {initializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>ADMIN OPERATOR</h3>
            <p className="text-[10px] text-white/40 mb-4">Full system access. Ask anything about the platform, run any function, edit any data.</p>
            <div className="space-y-1.5 w-full">
              {[
                "Show me a system overview",
                "How do I save on LLM costs?",
                "Run leadScraper for Austin, TX",
                "What integrations are available?",
              ].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-colors text-left">
                  <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-[10px] text-white/70">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isLatest = msg.role === "assistant" && i === messages.length - 1;
            return <Bubble key={i} message={msg} isLatest={isLatest} />;
          })
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Admin command..."
            className="flex-1 bg-white/5 rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
            style={{
              border: '1px solid transparent',
              borderImage: 'linear-gradient(90deg, #6a6a6a, #c0c0c0, #e8e8e8, #c0c0c0, #6a6a6a) 1',
              animation: 'silver-border-anim 3s ease infinite',
            }}
            disabled={loading || initializing}
          />
          <button
            onClick={handleSend}
            disabled={loading || initializing || !input.trim()}
            className="h-[38px] w-[38px] metallic-gold-bg text-background rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
});

export default AdminChat;