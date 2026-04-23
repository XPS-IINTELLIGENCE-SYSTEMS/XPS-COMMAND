import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Zap, Globe, Copy } from "lucide-react";

export default function GroqAgentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send to Groq-powered agent with scraper capability
      const res = await base44.functions.invoke('groqAgentWithScraper', {
        message: input,
        conversation_history: messages,
        enable_scraper: scrapeActive,
      });

      if (res.data?.response) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: res.data.response,
          scrape_data: res.data.scrape_data,
        }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error processing request. Please try again.",
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chat with Groq-powered XPS Agent</p>
              <p className="text-sm mt-2">Ask for lead intelligence, scraping, analysis, or automation</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.scrape_data && (
                <div className="mt-2 text-xs opacity-75 border-t pt-2">
                  <strong>Scraped:</strong> {msg.scrape_data.sources?.length || 0} sources, {msg.scrape_data.records || 0} records
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-foreground px-4 py-2 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 space-y-3">
        {/* Scraper Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScrapeActive(!scrapeActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              scrapeActive
                ? 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-secondary text-muted-foreground border border-border hover:border-primary/50'
            }`}
          >
            <Globe className="w-3 h-3" />
            {scrapeActive ? 'Scraper ON' : 'Scraper OFF'}
          </button>
          <span className="text-[10px] text-muted-foreground">
            {scrapeActive ? 'Agent can scrape web data for queries' : 'Agent uses knowledge only'}
          </span>
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything... (leads, scraping, analysis, automation)"
            className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="gap-2 bg-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setInput("Find 10 flooring contractors in Texas with web scraping")}
            className="text-[11px] px-2 py-1 rounded bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            Find contractors
          </button>
          <button
            onClick={() => setInput("Analyze competitor pricing for epoxy flooring")}
            className="text-[11px] px-2 py-1 rounded bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            Competitor intel
          </button>
          <button
            onClick={() => setInput("Create lead scoring criteria for commercial jobs")}
            className="text-[11px] px-2 py-1 rounded bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            Lead scoring
          </button>
        </div>
      </div>
    </div>
  );
}