import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Send, Plus, Loader2, Sparkles, Globe, Pencil, Database, Code, Search, GitBranch, Layers, Bot, Wrench, TrendingUp } from "lucide-react";
import AgentSwitcher, { AGENTS } from "./chat/AgentSwitcher";
import AgentTab from "./chat/AgentTab";
import SubAgentChat from "./chat/SubAgentChat";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

function TypingText({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    if (text.length < 5) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const speed = Math.max(8, Math.min(25, 1500 / text.length));
    const timer = setInterval(() => {
      i += 1;
      if (i >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(timer);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <ReactMarkdown className="text-[11px] leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-foreground [&_h1]:text-xs [&_h2]:text-[11px] [&_h3]:text-[11px]">
      {done ? text : displayed + "▍"}
    </ReactMarkdown>
  );
}

function MessageBubble({ message, isLatestAssistant }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain flex-shrink-0 mt-0.5" />
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
          isUser ? (
            <div className="rounded-xl px-3 py-2 bg-secondary/80 border border-[#8a8a8a]/30">
              <p className="text-xs leading-relaxed metallic-gold-silver-text font-medium">{message.content}</p>
            </div>
          ) : (
            <div className="py-1">
              {isLatestAssistant ? (
                <TypingText text={message.content} />
              ) : (
                <ReactMarkdown className="text-[11px] leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-foreground">
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

const ChatPanel = forwardRef(function ChatPanel({ mobile = false }, ref) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef(null);
  const [currentAgentName, setCurrentAgentName] = useState("xps_assistant");
  const conversationRef = useRef(null);

  const [agents, setAgents] = useState([
    { id: "main", name: "XPS Agent", type: "main", status: "active" },
  ]);
  const [activeAgentId, setActiveAgentId] = useState("main");
  const [nextSubId, setNextSubId] = useState(1);

  const spawnSubAgent = useCallback((name, task) => {
    const id = `sub_${nextSubId}`;
    const agentName = name || `Sub-Agent ${nextSubId}`;
    setAgents(prev => [...prev, { id, name: agentName, type: "sub", status: "spawning", task: task || "" }]);
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

  // Expose sendCommand to parent via ref
  useImperativeHandle(ref, () => ({
    sendCommand: async (command) => {
      if (!command) return;
      setActiveAgentId("main");
      // Wait for conversation to be ready
      const conv = conversationRef.current;
      if (!conv) {
        // Queue the command for after init
        setInput(command);
        return;
      }
      setLoading(true);
      await base44.agents.addMessage(conv, { role: "user", content: command });
      setLoading(false);
    }
  }));

  useEffect(() => {
    initConversation();
  }, [currentAgentName]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      if (data?.messages) {
        setMessages(data.messages);
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!scrollRef.current || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    const el = scrollRef.current;
    el.scrollTop = el.scrollHeight;
    const interval = setInterval(() => {
      el.scrollTop = el.scrollHeight;
    }, 120);
    return () => clearInterval(interval);
  }, [messages]);

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
    setLoading(false);
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

  const defaultActions = [
    { label: "What can you do?", icon: Search },
    { label: "Show my pipeline status", icon: Database },
    { label: "Research a company", icon: Globe },
    { label: "Help me with a task", icon: Pencil },
  ];

  const agentQuickActions = {
    xps_assistant: [
      { label: "Find me 25 leads in Tampa, FL", icon: Search },
      { label: "Generate a proposal for my top lead", icon: Pencil },
      { label: "Show my pipeline status", icon: Database },
      { label: "Research a company", icon: Globe },
    ],
    seo_marketing: [
      { label: "Write a blog post", icon: Pencil },
      { label: "Analyze a competitor", icon: Search },
      { label: "Generate social content", icon: Globe },
      { label: "Build keyword strategy", icon: TrendingUp },
    ],
    lead_gen: [
      { label: "Find leads in Phoenix, AZ", icon: Search },
      { label: "Analyze Tampa territory", icon: Globe },
      { label: "Enrich my top leads", icon: Database },
      { label: "Score all new leads", icon: TrendingUp },
    ],
    sales_director: [
      { label: "Create a proposal", icon: Pencil },
      { label: "Draft a follow-up email", icon: Search },
      { label: "Show deals in negotiation", icon: Database },
      { label: "Close strategy for top lead", icon: TrendingUp },
    ],
  };

  const quickActions = agentQuickActions[currentAgentName] || defaultActions;

  return (
    <div className={`${mobile ? 'w-full' : 'w-[320px] min-w-[320px]'} h-full ${mobile ? '' : 'border-l border-[#8a8a8a]/30'} flex flex-col bg-background`}>
      {/* Agent Switcher Bar */}
      <div className={`${mobile ? 'min-h-[36px]' : 'min-h-[40px]'} border-b border-border flex items-center gap-1 px-2 py-1`}>
        <div className="flex-1 overflow-hidden">
          <AgentSwitcher activeAgent={currentAgentName} onSwitch={handleAgentSwitch} mobile={mobile} />
        </div>
        <Button variant="ghost" size="icon" className="shimmer-card h-6 w-6 flex-shrink-0" onClick={handleNewChat}>
          <Plus className="w-3 h-3 shimmer-icon metallic-silver-icon" />
        </Button>
      </div>

      {/* Agent tabs bar */}
      {!mobile && (
        <div className="px-2 py-1 border-b border-border flex items-center gap-1 overflow-x-auto min-h-[36px]">
          {agents.map((agent) => (
            <AgentTab
              key={agent.id}
              agent={agent}
              isActive={activeAgentId === agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              onClose={() => removeSubAgent(agent.id)}
            />
          ))}
          <div className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground">
            <Layers className="w-2.5 h-2.5 metallic-silver-icon" />
            {agents.length - 1} helpers
          </div>
        </div>
      )}

      {/* Messages / Sub-agent view */}
      {activeAgentId !== "main" && !mobile ? (
        <div className="flex-1 overflow-hidden">
          <SubAgentChat
            agent={agents.find(a => a.id === activeAgentId)}
            onStatusChange={updateSubAgentStatus}
          />
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
                    {(() => { const AIcon = activeAgentConfig?.icon || Wrench; return <AIcon className={`w-7 h-7 shimmer-icon ${activeAgentConfig?.color || 'metallic-silver-icon'}`} />; })()}
                  </div>
                  <h3 className="text-sm font-bold xps-gold-slow-shimmer mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{activeAgentConfig?.fullName || activeAgentConfig?.name}</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">
                   {activeAgentConfig?.desc}
                  </p>
                </>
              )}
              <div className={`space-y-1.5 w-full ${mobile ? 'grid grid-cols-2 gap-1.5 space-y-0' : ''}`}>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => {
                        setInput(action.label);
                      }}
                      className="shimmer-card w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors text-left"
                    >
                      <Icon className="w-3 h-3 metallic-silver-icon shimmer-icon flex-shrink-0" />
                      <span className="text-[10px] text-foreground">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isLatestAssistant = msg.role === "assistant" && i === messages.length - 1;
              return <MessageBubble key={i} message={msg} isLatestAssistant={isLatestAssistant} />;
            })
          )}
        </div>
      )}

      {/* Input */}
      <div className={`${mobile ? 'p-2 pb-8' : 'p-3'} border-t border-border ${activeAgentId !== "main" && !mobile ? "hidden" : ""}`}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Command ${activeAgentConfig?.name || 'agent'}...`}
            className={`flex-1 bg-card border rounded-lg px-3 chat-input-metallic ${mobile ? 'py-2.5 text-sm' : 'py-2 text-xs'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30`}
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
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Globe className="w-2.5 h-2.5 metallic-silver-icon" /> Web
            </div>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Database className="w-2.5 h-2.5 metallic-silver-icon" /> CRM
            </div>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Code className="w-2.5 h-2.5 metallic-silver-icon" /> UI
            </div>
            <div className="ml-auto">
              <button
                onClick={() => spawnSubAgent()}
                className="shimmer-card flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
              >
                <GitBranch className="w-2.5 h-2.5 metallic-silver-icon shimmer-icon" /> Add Helper
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatPanel;