import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Shield, Plus, Loader2, Sparkles, Globe, Pencil, Database, Code, Image, Search, GitBranch, Layers } from "lucide-react";
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
    // If text is short or already seen, show immediately
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
    <ReactMarkdown className="text-xs leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-foreground [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs">
      {done ? text : displayed + "▍"}
    </ReactMarkdown>
  );
}

function MessageBubble({ message, isLatestAssistant }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md metallic-silver-bg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Shield className="w-3.5 h-3.5 text-background" />
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
          isUser ? (
            <div className="rounded-xl px-3 py-2 bg-primary text-primary-foreground">
              <p className="text-xs leading-relaxed">{message.content}</p>
            </div>
          ) : (
            <div className="py-1">
              {isLatestAssistant ? (
                <TypingText text={message.content} />
              ) : (
                <ReactMarkdown className="text-xs leading-relaxed text-foreground/90 max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_strong]:text-foreground">
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

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const scrollRef = useRef(null);

  // Parallel agent instances
  const [agents, setAgents] = useState([
    { id: "main", name: "Open Claw", type: "main", status: "active" },
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
          metadata: { name: "XPS Command Session" },
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
        metadata: { name: "XPS Command Session" },
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
    { label: "Research a company on the web", icon: Globe },
    { label: "Generate a UI component", icon: Code },
    { label: "Create an image", icon: Image },
    { label: "Search the web", icon: Search },
    { label: "Draft a proposal", icon: Pencil },
    { label: "Analyze pipeline data", icon: Database },
  ];

  return (
    <div className="w-[320px] min-w-[320px] h-full border-l border-border flex flex-col bg-background">
      {/* Header */}
      <div className="h-12 min-h-[48px] border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md metallic-silver-bg flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-background" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Open Claw Agent</div>
            <div className="text-[9px] text-xps-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-xps-green inline-block" />
              Autonomous · Web · UI · Code
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewChat}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Agent tabs bar */}
      <div className="px-2 py-1.5 border-b border-border flex items-center gap-1.5 overflow-x-auto">
        {agents.map((agent) => (
          <AgentTab
            key={agent.id}
            agent={agent}
            isActive={activeAgentId === agent.id}
            onClick={() => setActiveAgentId(agent.id)}
            onClose={() => removeSubAgent(agent.id)}
          />
        ))}
        <button
          onClick={() => spawnSubAgent()}
          className="flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] text-muted-foreground hover-metallic whitespace-nowrap"
          title="Spawn sub-agent"
        >
          <GitBranch className="w-2.5 h-2.5" />
          <Plus className="w-2.5 h-2.5" />
        </button>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground">
          <Layers className="w-2.5 h-2.5 text-xps-purple" />
          {agents.length - 1} sub
        </div>
      </div>

      {/* Messages / Sub-agent view */}
      {activeAgentId !== "main" ? (
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
            <div className="w-12 h-12 rounded-xl metallic-silver-bg flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Open Claw Agent</h3>
            <p className="text-[10px] text-muted-foreground mb-4">
              Autonomous AI with web browsing, UI editing, image generation, code execution, and full CRM access.
            </p>
            <div className="space-y-1.5 w-full">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.label)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors text-left"
                  >
                    <Icon className="w-3 h-3 metallic-silver-icon" />
                    <span className="text-[10px] text-foreground">{action.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => spawnSubAgent("Research Agent", "Research competitors in the epoxy flooring market")}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-xps-purple/10 border border-xps-purple/20 hover:border-xps-purple/40 transition-colors text-left w-full"
            >
              <GitBranch className="w-3 h-3 metallic-silver-icon" />
              <span className="text-[10px] text-white">Spawn a parallel sub-agent</span>
            </button>
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
      <div className={`p-3 border-t border-border ${activeAgentId !== "main" ? "hidden" : ""}`}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Command the agent..."
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            disabled={loading || initializing}
          />
          <Button
            size="icon"
            className="h-8 w-8 metallic-gold-bg text-background hover:brightness-110 rounded-lg"
            onClick={handleSend}
            disabled={loading || initializing || !input.trim()}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 text-[9px] text-white/70">
            <Globe className="w-2.5 h-2.5 metallic-silver-icon" /> Web
          </div>
          <div className="flex items-center gap-1 text-[9px] text-white/70">
            <Database className="w-2.5 h-2.5 metallic-silver-icon" /> CRM
          </div>
          <div className="flex items-center gap-1 text-[9px] text-white/70">
            <Code className="w-2.5 h-2.5 metallic-silver-icon" /> UI
          </div>
          <div className="flex items-center gap-1 text-[9px] text-white/70">
            <Image className="w-2.5 h-2.5 metallic-silver-icon" /> Gen
          </div>
          <div className="ml-auto">
            <button
              onClick={() => spawnSubAgent()}
              className="flex items-center gap-1 text-[9px] text-white/70 hover:text-white transition-colors"
            >
              <GitBranch className="w-2.5 h-2.5 metallic-silver-icon" /> Sub-Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}