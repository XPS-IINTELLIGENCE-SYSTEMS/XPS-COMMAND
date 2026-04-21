import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, Globe, Code2, FileText, Monitor, Loader2, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

function ToolCallBubble({ tool }) {
  const [open, setOpen] = useState(false);
  const status = tool.status || "running";
  const icons = {
    running: <Loader2 className="w-3 h-3 animate-spin text-primary" />,
    complete: <CheckCircle2 className="w-3 h-3 text-green-500" />,
    failed: <AlertCircle className="w-3 h-3 text-red-500" />,
  };

  return (
    <div className="my-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-xs hover:bg-secondary/60 transition-all"
      >
        {icons[status] || icons.running}
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
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mt-0.5 shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {msg.content && (
          <div className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? "bg-primary/10 border border-primary/20 text-foreground"
              : "bg-card border border-border text-foreground"
          }`}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{msg.content}</p>
            ) : (
              <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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

function AgentWorkspace({ activeTab, setActiveTab, agentState }) {
  const tabs = [
    { id: "browser", label: "Browser", icon: Globe },
    { id: "code", label: "Code", icon: Code2 },
    { id: "files", label: "Files", icon: FileText },
    { id: "computer", label: "Computer", icon: Monitor },
  ];

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border px-2 gap-0.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {agentState === "idle" ? (
          <div className="text-center text-muted-foreground">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Agent workspace will appear here</p>
            <p className="text-xs mt-1 opacity-60">Submit a task to see the agent in action</p>
          </div>
        ) : agentState === "working" ? (
          <div className="text-center">
            <div className="relative inline-flex mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
            </div>
            <p className="text-sm text-foreground font-medium">Agent is working...</p>
            <p className="text-xs text-muted-foreground mt-1">Browsing, analyzing, and executing tasks</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/40" />
            <p className="text-sm">Task completed</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentZeroChat({ messages, onSend, agentState }) {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("browser");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 md:px-8 pb-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Send a message..."
              className="min-h-[60px] max-h-[150px] resize-none border-0 bg-transparent p-4 pr-14 text-sm focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                size="icon"
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4 text-primary-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace panel (desktop) */}
      <div className="hidden lg:flex w-[420px]">
        <AgentWorkspace activeTab={activeTab} setActiveTab={setActiveTab} agentState={agentState} />
      </div>
    </div>
  );
}