import { useState } from "react";
import {
  Bot, Send, Loader2, Search, Globe, FileText, Mail, Phone,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Sparkles, Zap
} from "lucide-react";

const QUICK_TASKS = [
  { label: "Scrape contacts", icon: Mail, task: "Extract all email addresses and phone numbers from this page", color: "#22c55e" },
  { label: "Scrape all data", icon: FileText, task: "Extract all useful business data from this page — company name, address, services, pricing, contact info", color: "#6366f1" },
  { label: "Find competitors", icon: Search, task: "Search for competitors of the company on this page and gather their websites", color: "#f59e0b" },
  { label: "Map all links", icon: Globe, task: "List and categorize every important link on this page — navigation, resources, social media, contact pages", color: "#06b6d4" },
];

function StepLog({ step, index }) {
  const [open, setOpen] = useState(false);
  const isError = step.status === "error";
  const isDone = step.status === "done";

  return (
    <div className={`border rounded-lg overflow-hidden ${isError ? "border-red-500/30 bg-red-500/5" : "border-[#3c3c3c] bg-[#2a2a2e]"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
        <span className="text-[10px] font-bold text-[#9aa0a6] w-5">{index + 1}</span>
        {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> : isError ? <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /> : <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" />}
        <span className="text-xs text-white/80 flex-1 truncate">
          {step.action === "search" && `Search: "${step.query}"`}
          {step.action === "navigate" && `Navigate: ${step.title || step.url}`}
          {step.action === "submit_form" && `Submit form → ${step.submitted_to || "form"}`}
          {step.action === "extract" && "Extract data"}
          {step.action === "done" && "Complete"}
        </span>
        {open ? <ChevronUp className="w-3 h-3 text-[#9aa0a6]" /> : <ChevronDown className="w-3 h-3 text-[#9aa0a6]" />}
      </button>
      {open && (
        <div className="px-3 pb-2 text-[11px] text-[#bdc1c6] space-y-1 border-t border-[#3c3c3c]">
          {step.results_count != null && <p>Found {step.results_count} results</p>}
          {step.results?.map((r, i) => <p key={i} className="truncate">• <span className="text-blue-400">{r.title}</span></p>)}
          {step.title && <p>Page: {step.title}</p>}
          {step.emails?.length > 0 && <p>📧 {step.emails.join(", ")}</p>}
          {step.phones?.length > 0 && <p>📞 {step.phones.join(", ")}</p>}
          {step.links_count != null && <p>Links: {step.links_count} | Forms: {step.forms_count}</p>}
          {step.extracted && <pre className="text-[10px] bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(step.extracted, null, 2)}</pre>}
          {step.result && <p className="text-green-400">✓ {step.result}</p>}
          {step.error && <p className="text-red-400">✕ {step.error}</p>}
        </div>
      )}
    </div>
  );
}

export default function BrowserAgentPanel({ currentUrl, pageData, onNavigate, onSearch }) {
  const [expanded, setExpanded] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [running, setRunning] = useState(false);
  const [agentLog, setAgentLog] = useState(null);

  const runTask = async (task) => {
    if (!task.trim() || running) return;
    setRunning(true);
    setAgentLog(null);
    setExpanded(true);
    try {
      const { base44 } = await import("@/api/base44Client");
      const res = await base44.functions.invoke("headlessBrowser", {
        action: "agent_task",
        task,
        start_url: currentUrl || "https://www.google.com",
      });
      setAgentLog(res.data);
      // If agent navigated somewhere, update the browser
      if (res.data?.current_page?.url && res.data.current_page.url !== currentUrl) {
        onNavigate(res.data.current_page.url);
      }
    } catch (err) {
      setAgentLog({ error: err.message });
    }
    setRunning(false);
    setTaskInput("");
  };

  return (
    <div className="border-t border-[#3c3c3c] bg-[#202124]">
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#292a2d] transition-colors"
      >
        <Bot className="w-4 h-4 text-[#d4af37]" />
        <span className="text-xs font-medium text-[#d4af37] flex-1 text-left">AI Agent</span>
        {running && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[#9aa0a6]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#9aa0a6]" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Quick tasks */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TASKS.map((qt) => {
              const Icon = qt.icon;
              return (
                <button
                  key={qt.label}
                  onClick={() => runTask(qt.task)}
                  disabled={running}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#292a2d] hover:bg-[#35363a] text-[11px] font-medium text-[#bdc1c6] hover:text-white transition-colors disabled:opacity-40"
                >
                  <Icon className="w-3 h-3" style={{ color: qt.color }} />
                  {qt.label}
                </button>
              );
            })}
          </div>

          {/* Custom task input */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#292a2d] border border-[#3c3c3c] focus-within:border-[#d4af37]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0" />
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runTask(taskInput); }}
                placeholder="Tell the agent what to do... (e.g. 'Find all contractor emails in Florida')"
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#5f6368]"
                disabled={running}
              />
            </div>
            <button
              onClick={() => runTask(taskInput)}
              disabled={running || !taskInput.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 text-xs font-medium transition-colors disabled:opacity-30"
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Run
            </button>
          </div>

          {/* Agent output */}
          {agentLog && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {agentLog.reasoning && (
                <div className="px-3 py-2 rounded-lg bg-[#292a2d] border border-[#3c3c3c]">
                  <p className="text-[10px] text-[#9aa0a6] mb-1 font-medium">AGENT REASONING</p>
                  <p className="text-xs text-[#bdc1c6] leading-relaxed">{agentLog.reasoning}</p>
                </div>
              )}
              {agentLog.steps?.map((step, i) => (
                <StepLog key={i} step={step} index={i} />
              ))}
              {agentLog.final_result && (
                <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-[10px] text-green-400 mb-1 font-medium">RESULT</p>
                  <p className="text-xs text-green-300">{agentLog.final_result}</p>
                </div>
              )}
              {agentLog.current_page && (
                <div className="px-3 py-2 rounded-lg bg-[#292a2d] border border-[#3c3c3c]">
                  <p className="text-[10px] text-[#9aa0a6] mb-1 font-medium">CURRENT PAGE</p>
                  <p className="text-xs text-blue-400 truncate">{agentLog.current_page.title} — {agentLog.current_page.url}</p>
                  {agentLog.current_page.emails?.length > 0 && <p className="text-xs text-[#bdc1c6] mt-1">📧 {agentLog.current_page.emails.join(", ")}</p>}
                  {agentLog.current_page.phones?.length > 0 && <p className="text-xs text-[#bdc1c6]">📞 {agentLog.current_page.phones.join(", ")}</p>}
                </div>
              )}
              {agentLog.error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-xs text-red-400">{agentLog.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}