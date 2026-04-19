import { useState, useEffect, useMemo } from "react";
import { Sparkles, TrendingUp, Wrench, Zap, Brain, Search, FileText, Send, BarChart3, Shield, Bot, RefreshCw } from "lucide-react";

// Context-aware smart suggestions that appear above the chat input
const SUGGESTION_POOLS = {
  general: [
    { text: "Run system health check", icon: Shield },
    { text: "Find 25 new leads in my target markets", icon: Search },
    { text: "Show me my pipeline performance", icon: BarChart3 },
    { text: "Generate proposals for top 5 leads", icon: FileText },
    { text: "What can you do?", icon: Brain },
    { text: "Suggest system enhancements", icon: Sparkles },
  ],
  leads: [
    { text: "Score all unscored leads", icon: TrendingUp },
    { text: "Enrich my top 10 leads with contact info", icon: Search },
    { text: "Find contractors in Arizona", icon: Search },
    { text: "Run bulk pipeline for FL, OH, AZ", icon: Zap },
  ],
  outreach: [
    { text: "Draft follow-up emails for stale leads", icon: Send },
    { text: "Create an email campaign for new leads", icon: Send },
    { text: "Text my top priority lead", icon: Send },
    { text: "Schedule AI calls for today's leads", icon: Bot },
  ],
  intelligence: [
    { text: "Research my top competitor", icon: Search },
    { text: "Analyze Tampa territory opportunity", icon: TrendingUp },
    { text: "Scrape industry trends", icon: TrendingUp },
    { text: "Update knowledge base with latest products", icon: Brain },
  ],
  system: [
    { text: "Optimize my agent configuration", icon: Wrench },
    { text: "Test all API connectors", icon: RefreshCw },
    { text: "Generate executive briefing", icon: FileText },
    { text: "Run overnight pipeline", icon: Zap },
  ],
};

function pickSuggestions(messages, count = 4) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() || "";
  const lastAgentMsg = [...messages].reverse().find(m => m.role === "assistant")?.content?.toLowerCase() || "";
  const combined = lastUserMsg + " " + lastAgentMsg;

  let pool = [];
  if (/lead|scrape|find|pipeline|prospect/.test(combined)) pool = SUGGESTION_POOLS.leads;
  else if (/email|sms|outreach|follow.?up|call|text/.test(combined)) pool = SUGGESTION_POOLS.outreach;
  else if (/research|competitor|territory|knowledge|trend/.test(combined)) pool = SUGGESTION_POOLS.intelligence;
  else if (/system|health|connector|agent|config|optimize/.test(combined)) pool = SUGGESTION_POOLS.system;
  else pool = SUGGESTION_POOLS.general;

  // Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function ChatSmartSuggestions({ messages, onSend, loading, mobile }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setSuggestions(pickSuggestions(messages));
  }, [messages.length]);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className={`flex gap-1 overflow-x-auto scrollbar-hide px-1 pb-1 ${mobile ? 'pt-1' : 'pt-1.5'}`}>
      {suggestions.map((s, i) => {
        const Icon = s.icon;
        return (
          <button
            key={i}
            onClick={() => onSend(s.text)}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] text-muted-foreground hover:text-foreground transition-all glass-card hover:border-primary/30 whitespace-nowrap"
          >
            <Icon className="w-2.5 h-2.5 metallic-gold-icon" />
            {s.text}
          </button>
        );
      })}
    </div>
  );
}