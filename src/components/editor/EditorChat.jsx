import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Bot, Globe, Code2, Radar, CheckCircle2, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

function ToolCallBubble({ tool }) {
  const [open, setOpen] = useState(false);
  const StatusIcon = tool.status === "running" ? Loader2 : tool.status === "complete" ? CheckCircle2 : CheckCircle2;
  return (
    <div className="my-1">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-xs hover:bg-secondary/60 transition-all">
        <StatusIcon className={`w-3 h-3 ${tool.status === "running" ? "animate-spin text-primary" : "text-green-500"}`} />
        <span className="text-muted-foreground">{tool.name}</span>
        {tool.result && <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />}
      </button>
      {open && tool.result && (
        <pre className="mt-1 ml-3 pl-3 border-l-2 border-border text-xs bg-secondary/20 rounded p-2 max-h-40 overflow-auto text-muted-foreground whitespace-pre-wrap">
          {typeof tool.result === "object" ? JSON.stringify(tool.result, null, 2) : tool.result}
        </pre>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
          <Bot className="w-3 h-3 text-primary" />
        </div>
      )}
      <div className={`max-w-[90%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {msg.content && (
          <div className={`rounded-xl px-3 py-2 text-[13px] ${
            isUser ? "bg-primary/10 border border-primary/20 text-foreground" : "bg-card border border-border text-foreground"
          }`}>
            {isUser ? (
              <p className="leading-relaxed">{msg.content}</p>
            ) : (
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-[13px]">
                {msg.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {msg.tools?.map((tool, i) => <ToolCallBubble key={i} tool={tool} />)}
      </div>
    </div>
  );
}

export default function EditorChat({ onToolCommand, onCanvasUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const prompt = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setLoading(true);

    // Add "thinking" message
    setMessages(prev => [...prev, {
      role: "assistant", content: null,
      tools: [{ name: "Processing command...", status: "running" }]
    }]);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the XPS Editor Agent with full access to all tools. The user said:

"${prompt}"

You can:
- Open any tool by name (scraper, CRM, leads, proposals, etc.)
- Visit/clone websites using Open Claw (site_clone, key_harvest, shadow_scrape)
- Generate UI components (React + Tailwind)
- Create reports, analyze data, research companies
- Browse the web for any URL

If the user wants to visit or clone a URL, output HTML/React code to render.
If the user wants a tool opened, respond with the tool ID.
If the user wants UI created, output the full React JSX.

Respond with structured JSON.`,
      add_context_from_internet: prompt.toLowerCase().includes("http") || prompt.toLowerCase().includes("www") || prompt.toLowerCase().includes("research") || prompt.toLowerCase().includes("find"),
      response_json_schema: {
        type: "object",
        properties: {
          action: { type: "string", description: "tool_open | generate_ui | browse_url | chat_response" },
          tool_id: { type: "string", description: "Tool ID to open if action=tool_open" },
          html_content: { type: "string", description: "HTML/JSX to render on canvas if action=generate_ui or browse_url" },
          message: { type: "string", description: "Response message to the user" },
          tools_used: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Remove thinking message and add result
    setMessages(prev => {
      const cleaned = prev.filter(m => m.tools?.[0]?.name !== "Processing command...");
      const tools = (result.tools_used || []).map(t => ({ name: t, status: "complete" }));
      return [...cleaned, {
        role: "assistant",
        content: result.message || "Done.",
        tools: tools.length > 0 ? tools : [{ name: "Command executed", status: "complete" }]
      }];
    });

    // Handle actions
    if (result.action === "tool_open" && result.tool_id) {
      onToolCommand(result.tool_id);
    }
    if ((result.action === "generate_ui" || result.action === "browse_url") && result.html_content) {
      onCanvasUpdate(result.html_content);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold metallic-gold">Editor Agent</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Ask me to open tools, build UI, clone sites, or research anything.</p>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Command the editor..."
            className="flex-1 bg-transparent text-sm border-0 outline-none placeholder:text-muted-foreground/50"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="h-7 w-7 rounded-full bg-primary flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" /> : <ArrowUp className="w-3.5 h-3.5 text-primary-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}