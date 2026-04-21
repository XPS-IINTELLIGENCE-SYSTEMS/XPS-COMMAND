import { useState, useRef, useEffect } from "react";
import { ArrowUp, Plus, Globe, Code2, FileText, Monitor, Loader2, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

function ToolCallBubble({ tool }) {
  const [open, setOpen] = useState(false);
  const status = tool.status || "running";
  const icons = {
    running: <Loader2 className="w-3 h-3 animate-spin text-[#666]" />,
    complete: <CheckCircle2 className="w-3 h-3 text-green-600" />,
    failed: <AlertCircle className="w-3 h-3 text-red-500" />,
  };

  return (
    <div className="my-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e0e0e0] bg-[#f7f7f7] text-xs hover:bg-[#eee] transition-all"
      >
        {icons[status] || icons.running}
        <span className="text-[#666]">{tool.name}</span>
        {tool.result && <ChevronRight className={`w-3 h-3 text-[#999] transition-transform ${open ? "rotate-90" : ""}`} />}
      </button>
      {open && tool.result && (
        <pre className="mt-1 ml-3 pl-3 border-l-2 border-[#e0e0e0] text-xs bg-[#f5f5f5] rounded p-2 max-h-40 overflow-auto text-[#666] whitespace-pre-wrap">
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
        <div className="h-7 w-7 rounded-full bg-[#f0f0f0] flex items-center justify-center mt-0.5 shrink-0 border border-[#e5e5e5]">
          <div className="h-2 w-2 rounded-full bg-[#999]" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {msg.content && (
          <div className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? "bg-[#1a1a1a] text-white"
              : "bg-white border border-[#e5e5e5] text-[#1a1a1a]"
          }`}>
            {isUser ? (
              <p className="text-[14px] leading-relaxed">{msg.content}</p>
            ) : (
              <ReactMarkdown className="text-[14px] prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-headings:text-[#1a1a1a] prose-p:text-[#333] prose-a:text-blue-600 prose-code:text-[#333] prose-code:bg-[#f5f5f5]">
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
    <div className="flex flex-col h-full border-l border-[#e5e5e5] bg-white">
      <div className="flex items-center border-b border-[#e5e5e5] px-2 gap-0.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-[#1a1a1a] text-[#1a1a1a]"
                  : "border-transparent text-[#999] hover:text-[#666]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {agentState === "idle" ? (
          <div className="text-center">
            <Monitor className="w-10 h-10 mx-auto mb-3 text-[#ddd]" />
            <p className="text-[13px] text-[#999]">Agent workspace will appear here</p>
            <p className="text-[11px] mt-1 text-[#ccc]">Submit a task to see the agent in action</p>
          </div>
        ) : agentState === "working" ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[#999] animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-[#666] font-medium">Agent is working...</p>
            <p className="text-[11px] text-[#999] mt-1">Browsing, analyzing, and executing</p>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500/50" />
            <p className="text-[13px] text-[#999]">Task completed</p>
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
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 md:px-8 pb-4">
          <div className="rounded-2xl bg-white border border-[#e5e5e5] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Send a message..."
              rows={2}
              className="w-full resize-none border-0 bg-transparent px-5 pt-4 pb-1 text-[14px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] text-[#999] transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-8 w-8 flex items-center justify-center rounded-full transition-all disabled:opacity-20"
                style={{ backgroundColor: input.trim() ? "#1a1a1a" : "#e0e0e0" }}
              >
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
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