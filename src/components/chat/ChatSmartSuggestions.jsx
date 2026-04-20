import { useState, useEffect, useMemo } from "react";
import { Sparkles, TrendingUp, Wrench, Zap, Brain, Search, FileText, Send, BarChart3, Shield, Bot, RefreshCw } from "lucide-react";

// Context-aware smart suggestions — routes through Browserless, Groq/Claude, Twilio
const SUGGESTION_POOLS = {
  general: [
    { text: "Browserless: Scrape 25 leads in Tampa, FL", icon: Search },
    { text: "Show my pipeline status", icon: BarChart3 },
    { text: "Analyze my bid win rate this quarter", icon: Brain },
    { text: "Generate proposals for top 5 leads", icon: FileText },
    { text: "Run system health check", icon: Shield },
    { text: "What can you do?", icon: Sparkles },
  ],
  leads: [
    { text: "Browserless: Find 25 epoxy contractors in Phoenix", icon: Search },
    { text: "Score all unscored leads", icon: TrendingUp },
    { text: "Enrich my top 10 leads", icon: Search },
    { text: "Find GCs in Florida", icon: Search },
    { text: "Run bulk pipeline for FL, OH, AZ", icon: Zap },
    { text: "Scrape SAM.gov for flooring contracts", icon: Search },
  ],
  outreach: [
    { text: "WhatsApp my top lead", icon: Send },
    { text: "Text all stale leads a follow-up", icon: Send },
    { text: "Draft a cold email for new leads", icon: Send },
    { text: "Auto follow-up on pending bids", icon: Bot },
    { text: "SMS my top priority lead", icon: Send },
    { text: "Generate a referral ask message", icon: Send },
  ],
  intelligence: [
    { text: "Deep analyze: bid estimate for 10k sqft warehouse", icon: Brain },
    { text: "Research my top competitor with Claude", icon: Search },
    { text: "Analyze Tampa territory opportunity", icon: TrendingUp },
    { text: "Market trends for epoxy flooring 2026", icon: TrendingUp },
    { text: "Compare polyaspartic vs polyurea", icon: Brain },
    { text: "Sentiment check on my top 5 leads", icon: Brain },
  ],
  bidding: [
    { text: "Generate a bid for my top job", icon: FileText },
    { text: "Dynamic pricing for 5000 sqft warehouse", icon: TrendingUp },
    { text: "AI takeoff from uploaded blueprint", icon: Wrench },
    { text: "Show all bids awaiting response", icon: BarChart3 },
    { text: "Create invoice for latest won bid", icon: FileText },
    { text: "Draft a change order", icon: FileText },
  ],
  system: [
    { text: "Test all API connectors", icon: RefreshCw },
    { text: "Generate executive briefing", icon: FileText },
    { text: "Run overnight pipeline", icon: Zap },
    { text: "Export all qualified leads", icon: BarChart3 },
    { text: "Sync with HubSpot", icon: RefreshCw },
    { text: "Optimize agent configuration", icon: Wrench },
  ],
};

function pickSuggestions(messages, count = 4) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content?.toLowerCase() || "";
  const lastAgentMsg = [...messages].reverse().find(m => m.role === "assistant")?.content?.toLowerCase() || "";
  const combined = lastUserMsg + " " + lastAgentMsg;

  let pool = [];
  if (/lead|scrape|find|pipeline|prospect|browserless|company/.test(combined)) pool = SUGGESTION_POOLS.leads;
  else if (/email|sms|outreach|follow.?up|call|text|whatsapp|twilio|message/.test(combined)) pool = SUGGESTION_POOLS.outreach;
  else if (/research|competitor|territory|knowledge|trend|claude|groq|analyz/.test(combined)) pool = SUGGESTION_POOLS.intelligence;
  else if (/bid|proposal|takeoff|pricing|estimate|invoice|change.?order/.test(combined)) pool = SUGGESTION_POOLS.bidding;
  else if (/system|health|connector|agent|config|optimize|sync|export/.test(combined)) pool = SUGGESTION_POOLS.system;
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