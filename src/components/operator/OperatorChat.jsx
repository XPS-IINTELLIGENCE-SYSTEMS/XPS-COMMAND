import { useState, useEffect, useRef } from "react";
import { Send, Plus, Loader2, Sparkles, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

function MessageBubble({ message, isLatest }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain flex-shrink-0 mt-0.5" />
      )}
      <div className={`max-w-[80%]`}>
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
          isUser ? (
            <div className="rounded-xl px-3 py-2 bg-primary text-primary-foreground">
              <p className="text-xs leading-relaxed">{message.content}</p>
            </div>
          ) : (
            <div className="py-1">
              <ReactMarkdown className="text-xs leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-foreground">
                {message.content}
              </ReactMarkdown>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function OperatorChat({ activePanel }) {
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const initConversation = async () => {
    try {
      const convos = await base44.agents.listConversations({ agent_name: "xps_assistant" });
      let conv;
      if (convos?.length > 0) {
        conv = await base44.agents.getConversation(convos[0].id);
        setMessages(conv.messages || []);
      } else {
        conv = await base44.agents.createConversation({
          agent_name: "xps_assistant",
          metadata: { name: "Operator Session" },
        });
      }
      setConversation(conv);
    } catch (err) {
      console.error("Chat init failed:", err);
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
        metadata: { name: "Operator Session" },
      });
      setConversation(conv);
      setMessages([]);
    } catch (err) {
      console.error("New chat failed:", err);
    } finally {
      setInitializing(false);
    }
  };

  // Context hint based on active panel
  const panelHints = {
    browser: "I can browse any website for you. Paste a URL or tell me what to look up.",
    scraping: "Tell me a website or data source to scrape. I'll extract structured data.",
    leads: "I can find and qualify new leads. What industry, location, or criteria?",
    insights: "Ask me for AI-powered insights on your pipeline, competitors, or market.",
    image: "Describe an image to generate — product shots, marketing visuals, logos.",
    video: "Describe a video concept and I'll help create it.",
    ui: "Tell me what UI component or layout to build.",
    agent: "I can help design a new AI agent. What should it specialize in?",
    workflow: "Describe an automation workflow and I'll help build it.",
    notes: "I'm your notepad. Dictate notes and I'll organize them.",
    proposals: "I can draft proposals, SOWs, and quotes. What's the project?",
    data: "Ask me to query your CRM, leads, or any data source.",
    research: "What company, market, or topic should I research?",
    outreach: "I can draft emails, sequences, and outreach campaigns.",
    analytics: "Ask about performance metrics, trends, or forecasts.",
    automations: "I can set up scheduled tasks, triggers, and automations.",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-10 min-h-[40px] border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-5 h-5 object-contain" />
          <span className="text-xs font-semibold text-foreground">Open Claw Operator</span>
          <span className="text-[9px] text-xps-green flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-xps-green inline-block" /> Live
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewChat}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Context hint */}
      {activePanel && panelHints[activePanel] && (
        <div className="px-3 py-2 bg-primary/5 border-b border-primary/10">
          <p className="text-[10px] text-primary/80 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {panelHints[activePanel]}
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {initializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-12 h-12 object-contain mb-3 opacity-50" />
            <p className="text-xs text-muted-foreground">Ask the operator anything or select a tool below.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} isLatest={msg.role === "assistant" && i === messages.length - 1} />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-lg px-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask the operator..."
              className="flex-1 bg-transparent py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled={loading || initializing}
            />
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button
            size="icon"
            className="h-9 w-9 metallic-gold-bg text-background hover:brightness-110 rounded-lg"
            onClick={handleSend}
            disabled={loading || initializing || !input.trim()}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}