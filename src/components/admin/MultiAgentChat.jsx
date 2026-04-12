import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Bot, Crown, Users, TrendingUp, Megaphone, Share2, DollarSign, Brain, BarChart3, CheckSquare, Lightbulb, Code2, Shield, Wrench, Star, ScrollText, Briefcase, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const AGENTS = [
  { id: "ceo_orchestrator", name: "CEO", icon: Crown, color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
  { id: "lead_gen", name: "Lead Gen", icon: Users, color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { id: "sales_director", name: "Sales", icon: TrendingUp, color: "bg-green-500/20 text-green-500 border-green-500/30" },
  { id: "seo_marketing", name: "Marketing", icon: Megaphone, color: "bg-purple-500/20 text-purple-500 border-purple-500/30" },
  { id: "social_media", name: "Social", icon: Share2, color: "bg-pink-500/20 text-pink-500 border-pink-500/30" },
  { id: "billing_controller", name: "Finance", icon: DollarSign, color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" },
  { id: "prediction", name: "Predict", icon: Brain, color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30" },
  { id: "simulation", name: "Simulate", icon: BarChart3, color: "bg-indigo-500/20 text-indigo-500 border-indigo-500/30" },
  { id: "validation", name: "QA", icon: CheckSquare, color: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
  { id: "recommendation", name: "Strategy", icon: Lightbulb, color: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
  { id: "code_agent", name: "Engineer", icon: Code2, color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  { id: "security", name: "Security", icon: Shield, color: "bg-red-500/20 text-red-500 border-red-500/30" },
  { id: "logging", name: "Logging", icon: ScrollText, color: "bg-teal-500/20 text-teal-500 border-teal-500/30" },
  { id: "maintenance", name: "Maint.", icon: Wrench, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  { id: "xps_assistant", name: "Ops Dir", icon: Briefcase, color: "bg-primary/20 text-primary border-primary/30" },
];

export default function MultiAgentChat() {
  const [activeAgents, setActiveAgents] = useState(new Set(["ceo_orchestrator"]));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const toggleAgent = (id) => {
    setActiveAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (activeAgents.size === AGENTS.length) setActiveAgents(new Set());
    else setActiveAgents(new Set(AGENTS.map(a => a.id)));
  };

  const handleSend = async () => {
    if (!input.trim() || loading || activeAgents.size === 0) return;
    const userMsg = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const agentList = AGENTS.filter(a => activeAgents.has(a.id));
    const agentNames = agentList.map(a => a.name).join(", ");

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are moderating a multi-agent discussion. The following agents are in the room: ${agentNames}.

The operator has asked: "${input}"

Simulate a realistic collaborative discussion where each active agent responds from their expertise. Format each agent's response as:

**[Agent Name]:** Their response...

Keep each agent's response to 2-3 sentences max. Agents should reference each other's points when relevant. Make it feel like a real boardroom discussion.

Active agents and their roles:
${agentList.map(a => `- ${a.name}: ${a.id}`).join("\n")}`,
      });

      setMessages(prev => [...prev, {
        role: "agents",
        content: response,
        agents: [...activeAgents],
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "error", content: err.message, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent Toggle Bar */}
      <div className="flex items-center gap-1.5 p-3 border-b border-border overflow-x-auto flex-shrink-0">
        <button
          onClick={selectAll}
          className={cn("px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex-shrink-0",
            activeAgents.size === AGENTS.length ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/20"
          )}
        >
          ALL
        </button>
        {AGENTS.map(agent => {
          const Icon = agent.icon;
          const isActive = activeAgents.has(agent.id);
          return (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex-shrink-0",
                isActive ? agent.color : "bg-secondary/30 text-muted-foreground/50 border-transparent hover:border-border"
              )}
            >
              <Icon className="w-3 h-3" />
              {agent.name}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            Select agents and start a discussion. Toggle agents to include them in the conversation.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("max-w-[90%]", msg.role === "user" ? "ml-auto" : "")}>
            {msg.role === "user" ? (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2.5">
                <p className="text-sm text-foreground">{msg.content}</p>
              </div>
            ) : msg.role === "error" ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-2.5">
                <p className="text-sm text-destructive">{msg.content}</p>
              </div>
            ) : (
              <div className="bg-card/60 border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-3.5 h-3.5 metallic-gold-icon" />
                  <span className="text-[10px] font-bold text-primary">{msg.agents?.length || 0} agents responding</span>
                </div>
                <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Agents discussing...</span>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={activeAgents.size === 0 ? "Select agents first..." : `Ask ${activeAgents.size} agent(s)...`}
          disabled={activeAgents.size === 0}
          className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || activeAgents.size === 0}
          className="px-4 py-2.5 rounded-xl metallic-gold-bg text-background text-sm font-bold disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}