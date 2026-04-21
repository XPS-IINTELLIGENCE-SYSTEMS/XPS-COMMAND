import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Send, Plus, Loader2, Sparkles, Globe, Pencil, Database, Code, Search, GitBranch, TrendingUp, CheckCircle2, AlertCircle, Clock, ChevronDown, MessageCircle, Brain, FileText, Zap, BarChart3, Phone, Wrench, MapPin, ChevronUp } from "lucide-react";
import VoiceChat from "./chat/VoiceChat";
import AgentSwitcher, { AGENTS } from "./chat/AgentSwitcher";
import QuickActionButtons from "./chat/QuickActionButtons";
import ChatSmartSuggestions from "./chat/ChatSmartSuggestions";
import SubAgentChat from "./chat/SubAgentChat";
import ChatAttachmentButton from "./chat/ChatAttachmentButton";
import PromptEnhancer from "./chat/PromptEnhancer";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

/* ── Tool call badge ── */
function ToolCallBadge({ tc }) {
  const name = tc.name?.split(".").pop() || "Processing";
  const isRunning = tc.status === "in_progress" || tc.status === "running" || tc.status === "pending";
  const isFailed = tc.status === "failed" || tc.status === "error";
  const isDone = tc.status === "completed" || tc.status === "success";

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-secondary/50 rounded-md px-2 py-1">
      {isRunning ? <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" /> :
       isFailed ? <AlertCircle className="w-2.5 h-2.5 text-destructive" /> :
       isDone ? <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> :
       <Clock className="w-2.5 h-2.5 text-muted-foreground" />}
      <span className="truncate max-w-[180px]">{name}</span>
      {isDone && <span className="text-green-500/70 ml-auto">✓</span>}
    </div>
  );
}

/* ── Markdown renderer ── */
const mdClasses = "text-[11px] leading-relaxed text-foreground/90 max-w-none prose prose-invert prose-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_pre]:bg-secondary/80 [&_pre]:rounded-lg [&_pre]:p-2 [&_pre]:overflow-x-auto [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_h1]:text-xs [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5 [&_table]:text-[10px] [&_th]:px-2 [&_th]:py-1 [&_th]:border [&_th]:border-white/10 [&_td]:px-2 [&_td]:py-1 [&_td]:border [&_td]:border-white/10 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-2 [&_blockquote]:text-foreground/70 [&_hr]:border-white/10";

function MarkdownContent({ text }) {
  if (!text) return null;
  return <ReactMarkdown className={mdClasses}>{text}</ReactMarkdown>;
}

/* ── Message bubble ── */
function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === "user";
  const hasToolCalls = message.tool_calls?.length > 0;
  const hasContent = !!message.content;

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain flex-shrink-0 mt-0.5" />
      )}
      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        {hasToolCalls && (
          <div className="mb-1.5 space-y-1">
            {message.tool_calls.map((tc, i) => <ToolCallBadge key={i} tc={tc} />)}
          </div>
        )}
        {hasContent && (
          isUser ? (
            <div className="rounded-xl px-3 py-2 bg-secondary/80 border border-[#8a8a8a]/30">
              <p className="text-xs leading-relaxed metallic-gold-silver-text font-medium">{message.content}</p>
            </div>
          ) : (
            <div className="py-1">
              <MarkdownContent text={message.content} />
              {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-primary/70 animate-pulse ml-0.5 align-text-bottom rounded-sm" />}
            </div>
          )
        )}
        {!hasContent && !hasToolCalls && isStreaming && (
          <div className="py-1 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span className="text-[10px] text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main ChatPanel ── */
const ChatPanel = forwardRef(function ChatPanel({ mobile = false, chatWidth }, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef(null);
  const [currentAgentName, setCurrentAgentName] = useState("xps_assistant");
  const conversationRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const [agents, setAgents] = useState([
    { id: "main", name: "XPS Agent", type: "main", status: "active" },
  ]);
  const [activeAgentId, setActiveAgentId] = useState("main");
  const [nextSubId, setNextSubId] = useState(1);

  const spawnSubAgent = useCallback((name, task) => {
    const id = `sub_${nextSubId}`;
    setAgents(prev => [...prev, { id, name: name || `Sub-Agent ${nextSubId}`, type: "sub", status: "spawning", task: task || "" }]);
    setNextSubId(n => n + 1);
    setActiveAgentId(id);
    return id;
  }, [nextSubId]);

  const removeSubAgent = useCallback((id) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    if (activeAgentId === id) setActiveAgentId("main");
  }, [activeAgentId]);

  const updateSubAgentStatus = useCallback((id, status) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, []);

  useImperativeHandle(ref, () => ({
    sendCommand: async (command) => {
      if (!command) return;
      setActiveAgentId("main");
      const conv = conversationRef.current;
      if (!conv) { setInput(command); return; }
      setLoading(true);
      await base44.agents.addMessage(conv, { role: "user", content: command });
      setLoading(false);
    }
  }));

  useEffect(() => { initConversation(); }, [currentAgentName]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      if (data?.messages) {
        setMessages(data.messages);
        // Auto-detect when agent finishes responding
        const last = data.messages[data.messages.length - 1];
        if (last?.role === "assistant" && last?.content && data.messages.length > prevMsgCountRef.current) {
          setLoading(false);
        }
        prevMsgCountRef.current = data.messages.length;
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages]);

  // Keep scrolling while streaming
  useEffect(() => {
    if (!scrollRef.current || !loading) return;
    const el = scrollRef.current;
    const interval = setInterval(() => { el.scrollTop = el.scrollHeight; }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  const initConversation = async () => {
    setInitializing(true);
    setMessages([]);
    setConversation(null);
    conversationRef.current = null;
    const agentCfg = AGENTS.find(a => a.id === currentAgentName) || AGENTS[0];
    const conv = await base44.agents.createConversation({
      agent_name: currentAgentName,
      metadata: { name: `${agentCfg.fullName || currentAgentName} Session` },
    });
    setConversation(conv);
    conversationRef.current = conv;
    setInitializing(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || loading) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
    // Loading will be cleared by subscription when agent responds
  };

  const handleNewChat = async () => {
    setInitializing(true);
    const agentCfg = AGENTS.find(a => a.id === currentAgentName) || AGENTS[0];
    const conv = await base44.agents.createConversation({
      agent_name: currentAgentName,
      metadata: { name: `${agentCfg.fullName || currentAgentName} Session` },
    });
    setConversation(conv);
    conversationRef.current = conv;
    setMessages([]);
    setInitializing(false);
  };

  const handleAgentSwitch = (agentName) => {
    if (agentName === currentAgentName) return;
    setCurrentAgentName(agentName);
  };

  const activeAgentConfig = AGENTS.find(a => a.id === currentAgentName) || AGENTS[0];

  const agentQuickActions = {
    xps_assistant: [
      { label: "🔍 Scrape 25 leads in Tampa", icon: Search, cat: "leads" },
      { label: "📊 Pipeline status", icon: BarChart3, cat: "analytics" },
      { label: "🧠 Analyze bid for 10k sqft", icon: Brain, cat: "bidding" },
      { label: "📱 WhatsApp my top lead", icon: MessageCircle, cat: "outreach" },
      { label: "💬 SMS follow-up stale leads", icon: Phone, cat: "outreach" },
      { label: "📋 Generate proposal", icon: FileText, cat: "bidding" },
      { label: "🏗️ Find commercial jobs in FL", icon: MapPin, cat: "leads" },
      { label: "⚡ Run system health check", icon: Zap, cat: "system" },
    ],
    seo_marketing: [
      { label: "Write a blog post", icon: Pencil },
      { label: "Analyze a competitor", icon: Search },
      { label: "Generate social content", icon: Globe },
      { label: "Build keyword strategy", icon: TrendingUp },
    ],
    lead_gen: [
      { label: "🔍 Browserless: Find 25 leads", icon: Search },
      { label: "📊 Score all new leads", icon: TrendingUp },
      { label: "🏗️ Find GCs in Arizona", icon: MapPin },
      { label: "⚡ Bulk pipeline FL, OH, AZ", icon: Zap },
    ],
    sales_director: [
      { label: "📋 Create a proposal", icon: FileText },
      { label: "📧 Draft follow-up email", icon: Send },
      { label: "📱 WhatsApp a lead", icon: MessageCircle },
      { label: "🧠 Close strategy for top lead", icon: Brain },
    ],
  };
  const quickActions = agentQuickActions[currentAgentName] || agentQuickActions.xps_assistant;

  // Determine if the last message is currently streaming
  const lastMsg = messages[messages.length - 1];
  const isLastStreaming = loading && lastMsg?.role === "assistant";

  // Track last complete assistant message for voice output
  const lastCompleteAssistant = [...messages].reverse().find(m => m.role === "assistant" && m.content && !(loading && m === lastMsg));
  const lastAssistantText = lastCompleteAssistant?.content || "";

  return (
    <div className={`${mobile ? 'w-full' : ''} h-full ${mobile ? '' : 'border-r border-[#8a8a8a]/30'} flex flex-col bg-background`} style={!mobile ? { width: '100%' } : undefined}>
      {/* Agent Switcher */}
      <div className={`${mobile ? 'min-h-[36px]' : 'min-h-[40px]'} border-b border-border flex items-center gap-1 px-2 py-1`}>
        <div className="flex-1 overflow-hidden">
          <AgentSwitcher activeAgent={currentAgentName} onSwitch={handleAgentSwitch} mobile={mobile} />
        </div>
        <Button variant="ghost" size="icon" className="shimmer-card h-6 w-6 flex-shrink-0" onClick={handleNewChat}>
          <Plus className="w-3 h-3 shimmer-icon metallic-silver-icon" />
        </Button>
      </div>

      {/* Messages */}
      {activeAgentId !== "main" && !mobile ? (
        <div className="flex-1 overflow-hidden">
          <SubAgentChat agent={agents.find(a => a.id === activeAgentId)} onStatusChange={updateSubAgentStatus} onBack={() => setActiveAgentId("main")} />
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {initializing ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              {!mobile && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3 shimmer-card">
                    {(() => { const AIcon = activeAgentConfig?.icon || Sparkles; return <AIcon className={`w-7 h-7 shimmer-icon ${activeAgentConfig?.color || 'metallic-silver-icon'}`} />; })()}
                  </div>
                  <h3 className="text-sm font-bold xps-gold-slow-shimmer mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{activeAgentConfig?.fullName || activeAgentConfig?.name}</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">{activeAgentConfig?.desc}</p>
                </>
              )}
              <div className={`space-y-1.5 w-full ${mobile ? 'grid grid-cols-2 gap-1.5 space-y-0' : ''}`}>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} onClick={() => setInput(action.label)} className="shimmer-card glass-card w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left">
                      <Icon className="w-3 h-3 metallic-silver-icon shimmer-icon flex-shrink-0" />
                      <span className="text-[10px] text-foreground">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isStreaming = i === messages.length - 1 && isLastStreaming;
              return <MessageBubble key={`${i}-${msg.content?.length || 0}`} message={msg} isStreaming={isStreaming} />;
            })
          )}
          {/* Show thinking indicator when loading and last message is user */}
          {loading && lastMsg?.role === "user" && (
            <div className="flex gap-2.5 justify-start">
              <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain flex-shrink-0 mt-0.5" />
              <div className="py-1 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className={`${mobile ? 'p-2 pb-8' : 'p-3'} border-t border-border ${activeAgentId !== "main" && !mobile ? "hidden" : ""}`}>
        {/* Smart suggestions above input */}
        <ChatSmartSuggestions
          messages={messages}
          loading={loading}
          mobile={mobile}
          onSend={(cmd) => {
            if (conversation && !loading) {
              setLoading(true);
              base44.agents.addMessage(conversation, { role: "user", content: cmd });
            }
          }}
        />
        <PromptEnhancer
          rawInput={input}
          onAccept={(enhanced) => setInput(enhanced)}
          disabled={loading || initializing}
        />
        <div className="flex gap-1.5 items-center">
          <ChatAttachmentButton
            mobile={mobile}
            onRouteComplete={(route, fileName, summary) => {
              const routeMsg = `📎 Uploaded "${fileName}" → auto-routed to ${route}. ${summary}`;
              if (conversation && !loading) {
                setLoading(true);
                base44.agents.addMessage(conversation, { role: "user", content: routeMsg });
              }
            }}
          />
          <VoiceChat
            mobile={mobile}
            onTranscript={(text) => {
              setInput(text);
              // Auto-send voice input
              if (conversation && !loading && text.trim()) {
                setLoading(true);
                base44.agents.addMessage(conversation, { role: "user", content: text.trim() });
              }
            }}
            lastAssistantMessage={lastAssistantText}
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Command ${activeAgentConfig?.name || 'agent'}...`}
            className={`flex-1 glass-input rounded-lg px-3 chat-input-metallic ${mobile ? 'py-2.5 text-sm' : 'py-2 text-xs'} text-foreground placeholder:text-muted-foreground focus:outline-none`}
            disabled={loading || initializing}
          />
          <Button
            size="icon"
            className={`${mobile ? 'h-10 w-10' : 'h-8 w-8'} metallic-gold-bg text-background hover:brightness-110 rounded-lg`}
            onClick={handleSend}
            disabled={loading || initializing || !input.trim()}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {!mobile && (
          <>
            <QuickActionButtons onSend={(cmd) => {
              if (conversation && !loading) {
                setLoading(true);
                base44.agents.addMessage(conversation, { role: "user", content: cmd });
              }
            }} />
            <div className="flex items-center gap-2 mt-1">
              <button onClick={() => spawnSubAgent()} className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">
                <GitBranch className="w-2.5 h-2.5 metallic-silver-icon shimmer-icon" /> Add Helper
              </button>
              <button onClick={handleNewChat} className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">
                <Plus className="w-2.5 h-2.5 metallic-silver-icon shimmer-icon" /> New Chat
              </button>
            </div>
            <a
              href={base44.agents.getWhatsAppConnectURL('xps_assistant')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 mt-1.5 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-[10px] font-medium transition-colors"
            >
              <MessageCircle className="w-3 h-3" /> Chat on WhatsApp
            </a>
          </>
        )}
      </div>
    </div>
  );
});

export default ChatPanel;