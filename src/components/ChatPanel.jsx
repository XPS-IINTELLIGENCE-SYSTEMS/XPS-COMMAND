import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Send, Plus, Loader2, Sparkles, Globe, Pencil, Database, Code, Search, GitBranch, TrendingUp, CheckCircle2, AlertCircle, Clock, ChevronDown, MessageCircle, Brain, FileText, Zap, BarChart3, Phone, Wrench, MapPin, ChevronUp } from "lucide-react";
import AgentSwitcher, { AGENTS } from "./chat/AgentSwitcher";
import QuickActionButtons from "./chat/QuickActionButtons";
import ChatSmartSuggestions from "./chat/ChatSmartSuggestions";
import SubAgentChat from "./chat/SubAgentChat";
import ChatAttachmentButton from "./chat/ChatAttachmentButton";
import PromptEnhancer from "./chat/PromptEnhancer";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { useBrowserBridge } from "@/lib/BrowserBridge";

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
  const [pastConversations, setPastConversations] = useState([]);
  const [showPastConversations, setShowPastConversations] = useState(false);
  const [parallelOps, setParallelOps] = useState([]);
  const scrollRef = useRef(null);
  const [currentAgentName, setCurrentAgentName] = useState("xps_assistant");
  const conversationRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const browserBridge = useBrowserBridge();
  const processedToolCallsRef = useRef(new Set());

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

  // Load past conversations on mount
  useEffect(() => {
    loadPastConversations();
  }, []);

  const loadPastConversations = async () => {
    try {
      const convs = await base44.agents.listConversations({
        agent_name: currentAgentName,
      });
      setPastConversations(convs || []);
    } catch (err) {
      console.error("Failed to load past conversations:", err);
    }
  };

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

        // Detect headlessBrowser tool calls and push to browser bridge
        if (browserBridge) {
          for (const msg of data.messages) {
            if (!msg.tool_calls) continue;
            for (const tc of msg.tool_calls) {
              if (!tc.name?.includes("headlessBrowser")) continue;
              if (tc.status !== "completed" && tc.status !== "success") continue;
              const resultsStr = typeof tc.results === "string" ? tc.results : JSON.stringify(tc.results || "");
              const callId = `${msg.role}-${tc.name}-${resultsStr.substring(0, 50)}`;
              if (processedToolCallsRef.current.has(callId)) continue;
              processedToolCallsRef.current.add(callId);
              try {
                const result = typeof tc.results === "string" ? JSON.parse(tc.results) : tc.results;
                if (result?.success && result?.url) {
                  browserBridge.pushBrowserAction({ type: "navigate_result", data: result });
                } else if (result?.success && result?.results) {
                  browserBridge.pushBrowserAction({ type: "search_result", data: result });
                } else if (result?.success && result?.steps) {
                  browserBridge.pushBrowserAction({ type: "agent_result", data: result });
                }
              } catch {}
            }
          }
        }
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [conversation?.id, browserBridge]);

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
    processedToolCallsRef.current = new Set();
    const agentCfg = AGENTS.find(a => a.id === currentAgentName) || AGENTS[0];
    try {
      if (!base44.agents || typeof base44.agents.createConversation !== 'function') {
        throw new Error('Agent API not available on base44 client');
      }
      const conv = await base44.agents.createConversation({
        agent_name: currentAgentName,
        metadata: { name: `${agentCfg.fullName || currentAgentName} Session` },
      });
      setConversation(conv);
      conversationRef.current = conv;
    } catch (err) {
      console.error("Failed to create conversation:", err);
      alert('Agent system unavailable. Please reload the page.');
    }
    setInitializing(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || loading) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    try {
      if (!base44.agents || typeof base44.agents.addMessage !== 'function') {
        throw new Error('Agent API not available');
      }
      await base44.agents.addMessage(conversation, { role: "user", content: msg });
    } catch (err) {
      console.error("Send message error:", err);
      // Suppress Google sync-related errors and let chat continue
      if (err?.message?.includes("google") || err?.message?.includes("Drive") || err?.message?.includes("Calendar") || err?.message?.includes("Task")) {
        console.warn("Google sync error suppressed:", err.message);
        setLoading(false);
        return;
      }
      if (err?.message?.includes("Access denied") || err?.message?.includes("another user")) {
        // Conversation belongs to another user session — create a fresh one
        await initConversation();
        setInput(msg); // restore the message so user can retry
      } else {
        alert(`Error sending message: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    setInitializing(true);
    try {
      const agentCfg = AGENTS.find(a => a.id === currentAgentName) || AGENTS[0];
      if (!base44.agents || typeof base44.agents.createConversation !== 'function') {
        throw new Error('Agent API not available');
      }
      const conv = await base44.agents.createConversation({
        agent_name: currentAgentName,
        metadata: { name: `${agentCfg.fullName || currentAgentName} Session` },
      });
      setConversation(conv);
      conversationRef.current = conv;
      setMessages([]);
      loadPastConversations();
    } catch (err) {
      console.error('Failed to create new chat:', err);
      alert(`Failed to create new chat: ${err.message}`);
    }
    setInitializing(false);
  };

  const loadPastConversation = async (convId) => {
    setInitializing(true);
    try {
      const conv = await base44.agents.getConversation(convId);
      setConversation(conv);
      conversationRef.current = conv;
      setMessages(conv.messages || []);
      setShowPastConversations(false);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
    setInitializing(false);
  };

  const spawnParallelOperation = async (operationName, operationData) => {
    const opId = `op_${Date.now()}`;
    const newOp = { id: opId, name: operationName, status: 'running', data: operationData, startTime: Date.now(), results: null };
    setParallelOps(prev => [...prev, newOp]);

    try {
      const result = await base44.functions.invoke('xpsOpsOrchestratorMaster', {
        command: 'orchestrate',
        operations: [operationData],
        parallelExecute: true,
        persistMemory: true,
      });
      setParallelOps(prev => prev.map(op => op.id === opId ? { ...op, status: 'complete', results: result, endTime: Date.now() } : op));
    } catch (err) {
      setParallelOps(prev => prev.map(op => op.id === opId ? { ...op, status: 'failed', error: err.message, endTime: Date.now() } : op));
    }
  };

  const handleAgentSwitch = (agentName) => {
    if (agentName === currentAgentName) return;
    setCurrentAgentName(agentName);
  };

  const activeAgentConfig = AGENTS.find(a => a.id === currentAgentName) || AGENTS[0];

  const agentQuickActions = {
    xps_ops_master: [
      { label: "🔥 Full system audit & health check", icon: Zap, cat: "system" },
      { label: "🌐 Headless browser scrape URL", icon: Globe, cat: "browser" },
      { label: "📋 Fill & submit form headfully", icon: FileText, cat: "browser" },
      { label: "🔀 Orchestrate multi-agent task", icon: GitBranch, cat: "orchestration" },
      { label: "💾 Retrieve persistent memory", icon: Database, cat: "memory" },
      { label: "📸 Screenshot & extract data", icon: Search, cat: "browser" },
      { label: "⚙️ Execute parallel operations", icon: Wrench, cat: "system" },
      { label: "🔐 Full system admin access", icon: Code, cat: "admin" },
      { label: "🤖 Spawn & coordinate sub-agents", icon: GitBranch, cat: "orchestration" },
    ],
    xps_assistant: [
      { label: "🔍 Scrape 25 leads in Tampa", icon: Search, cat: "leads" },
      { label: "📊 Pipeline status", icon: BarChart3, cat: "analytics" },
      { label: "🧠 Analyze bid for 10k sqft", icon: Brain, cat: "bidding" },
      { label: "📱 WhatsApp my top lead", icon: MessageCircle, cat: "outreach" },
      { label: "💬 SMS follow-up stale leads", icon: Phone, cat: "outreach" },
      { label: "📋 Generate proposal", icon: FileText, cat: "bidding" },
      { label: "🏗️ Find commercial jobs in FL", icon: MapPin, cat: "leads" },
      { label: "⚡ Run system health check", icon: Zap, cat: "system" },
      { label: "🌐 Browse a website for me", icon: Globe, cat: "browser" },
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


  return (
    <div className={`${mobile ? 'w-full' : ''} h-full ${mobile ? '' : 'border-r border-[#8a8a8a]/30'} flex flex-col bg-background`} style={!mobile ? { width: '100%' } : undefined}>
      {/* Agent Switcher + Controls */}
      <div className={`${mobile ? 'min-h-[36px]' : 'min-h-[40px]'} border-b border-border flex items-center gap-1 px-2 py-1`}>
        <div className="flex-1 overflow-hidden">
          <AgentSwitcher activeAgent={currentAgentName} onSwitch={handleAgentSwitch} mobile={mobile} />
        </div>
        <Button variant="ghost" size="icon" className="shimmer-card h-6 w-6 flex-shrink-0" onClick={() => setShowPastConversations(!showPastConversations)} title="Past conversations">
          <MessageCircle className="w-3 h-3 metallic-silver-icon" />
        </Button>
        <Button variant="ghost" size="icon" className="shimmer-card h-6 w-6 flex-shrink-0" onClick={handleNewChat} title="New chat">
          <Plus className="w-3 h-3 shimmer-icon metallic-silver-icon" />
        </Button>
      </div>

      {/* Past Conversations Dropdown */}
      {showPastConversations && !mobile && pastConversations.length > 0 && (
        <div className="border-b border-border bg-secondary/30 max-h-48 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] font-bold text-muted-foreground px-2 py-1">Recent Conversations</div>
          {pastConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadPastConversation(conv.id)}
              className="w-full text-left shimmer-card glass-card rounded px-2 py-1.5 hover:bg-white/10 transition-all"
            >
              <div className="text-[10px] font-medium text-foreground truncate">{conv.metadata?.name || `Conv ${conv.id.slice(0, 8)}`}</div>
              <div className="text-[8px] text-muted-foreground">{new Date(conv.id).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
      )}

      {/* Parallel Operations Status */}
      {parallelOps.length > 0 && !mobile && (
        <div className="border-b border-border bg-secondary/20 p-2 space-y-1 max-h-32 overflow-y-auto">
          <div className="text-[9px] font-bold text-muted-foreground">Parallel Operations ({parallelOps.length})</div>
          {parallelOps.map((op) => (
            <div key={op.id} className="text-[9px] glass-card rounded px-2 py-1 flex items-center justify-between">
              <span className="truncate text-foreground">{op.name}</span>
              {op.status === 'running' && <Loader2 className="w-2.5 h-2.5 animate-spin text-primary flex-shrink-0 ml-1" />}
              {op.status === 'complete' && <CheckCircle2 className="w-2.5 h-2.5 text-green-500 flex-shrink-0 ml-1" />}
              {op.status === 'failed' && <AlertCircle className="w-2.5 h-2.5 text-destructive flex-shrink-0 ml-1" />}
            </div>
          ))}
        </div>
      )}

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
            disabled={loading || initializing || !(input || "").trim()}
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
              <button
              onClick={() => spawnParallelOperation('parallel_scrape', { action: 'multi_scrape', urls: [] })}
              className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
              title="Run parallel operations"
            >
              <Zap className="w-2.5 h-2.5 metallic-silver-icon shimmer-icon" /> Parallel Ops
            </button>
            <button onClick={() => spawnSubAgent()} className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">
              <GitBranch className="w-2.5 h-2.5 metallic-silver-icon shimmer-icon" /> Add Helper
            </button>
            <button onClick={handleNewChat} className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">
              <Plus className="w-2.5 h-2.5 metallic-silver-icon shimmer-icon" /> New Chat
            </button>
          </div>
            <div className="flex gap-1 mt-1.5">
              <button
                onClick={loadPastConversations}
                className="flex-1 shimmer-card flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Clock className="w-3 h-3 metallic-silver-icon" /> Load History
              </button>
              <button
                onClick={() => setShowPastConversations(!showPastConversations)}
                className="flex-1 shimmer-card flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Database className="w-3 h-3 metallic-silver-icon" /> Memory
                </button>
                <button
                  onClick={() => {
                    setMessages([]);
                    setParallelOps([]);
                    setShowPastConversations(false);
                    initConversation();
                  }}
                  className="flex-1 shimmer-card flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  title="Clear all messages and operations, start fresh"
                >
                  <AlertCircle className="w-3 h-3" /> Clear All
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