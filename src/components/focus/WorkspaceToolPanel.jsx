import { useState } from "react";
import { X, ChevronDown, ChevronUp, ExternalLink, Mail, FileText, Calendar as CalendarIcon, Database, Search, Send, Bot, Globe, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TOOL_DEFS = {
  notes: { label: "Quick Notes", icon: FileText, color: "#d4af37" },
  email: { label: "Email Tool", icon: Mail, color: "#ec4899" },
  proposal: { label: "Proposal Writer", icon: FileText, color: "#22c55e" },
  calendar: { label: "Calendar", icon: CalendarIcon, color: "#6366f1" },
  scraper: { label: "Web Scraper", icon: Globe, color: "#ef4444" },
  database: { label: "Database Pull", icon: Database, color: "#06b6d4" },
  research: { label: "AI Research", icon: Search, color: "#8b5cf6" },
  ai_assistant: { label: "AI Assistant", icon: Bot, color: "#d4af37" },
  outreach: { label: "Outreach", icon: Send, color: "#f97316" },
};

function EmailTool() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to || !subject) { toast.error("Fill in recipient and subject"); return; }
    setSending(true);
    await base44.integrations.Core.SendEmail({ to, subject, body }).catch(() => toast.error("Failed"));
    toast.success("Email sent");
    setSending(false);
  };

  return (
    <div className="space-y-2">
      <Input value={to} onChange={e => setTo(e.target.value)} placeholder="To (email)" className="h-8 text-xs" />
      <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="h-8 text-xs" />
      <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Body..." className="text-xs min-h-[80px]" />
      <Button size="sm" onClick={handleSend} disabled={sending} className="w-full text-xs">{sending ? "Sending..." : "Send Email"}</Button>
    </div>
  );
}

function ProposalTool() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a professional business proposal for the following:\n\n${prompt}\n\nInclude executive summary, scope of work, pricing section, timeline, and terms.`,
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the project or job..." className="text-xs min-h-[60px]" />
      <Button size="sm" onClick={generate} disabled={loading} className="w-full text-xs">{loading ? "Generating..." : "Generate Proposal"}</Button>
      {result && <div className="text-xs text-foreground bg-white/5 rounded-lg p-3 max-h-[200px] overflow-y-auto whitespace-pre-wrap">{result}</div>}
    </div>
  );
}

function CalendarTool() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const items = await base44.entities.CalendarEvent.filter({ date: today }).catch(() => []);
    setEvents(items);
    setLoaded(true);
  };

  if (!loaded) return <Button size="sm" onClick={loadEvents} variant="outline" className="w-full text-xs">Load Today's Events</Button>;

  return (
    <div className="space-y-1.5">
      {events.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-2">No events today</p>}
      {events.map(e => (
        <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 text-xs">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color || "#d4af37" }} />
          <span className="text-white/80 font-medium">{e.start_time}</span>
          <span className="text-white truncate flex-1">{e.title}</span>
        </div>
      ))}
    </div>
  );
}

function ScraperTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const scrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Scrape and summarize the key information from this URL: ${url}. Extract main content, contact info, pricing, and any key data points.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL to scrape..." className="h-8 text-xs" />
      <Button size="sm" onClick={scrape} disabled={loading} className="w-full text-xs">{loading ? "Scraping..." : "Scrape URL"}</Button>
      {result && <div className="text-xs text-foreground bg-white/5 rounded-lg p-3 max-h-[200px] overflow-y-auto whitespace-pre-wrap">{result}</div>}
    </div>
  );
}

function DatabaseTool() {
  const [entity, setEntity] = useState("Lead");
  const [results, setResults] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const entities = ["Lead", "CommercialJob", "Contractor", "IntelRecord", "AgentJob"];

  const pull = async () => {
    const items = await base44.entities[entity]?.list("-created_date", 10).catch(() => []);
    setResults(items || []);
    setLoaded(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <select value={entity} onChange={e => setEntity(e.target.value)} className="flex-1 h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground">
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <Button size="sm" onClick={pull} className="text-xs h-8">Pull</Button>
      </div>
      {loaded && (
        <div className="text-xs bg-white/5 rounded-lg p-2 max-h-[200px] overflow-y-auto space-y-1">
          {results.length === 0 && <p className="text-muted-foreground text-center py-2">No records</p>}
          {results.map(r => (
            <div key={r.id} className="flex items-center gap-2 px-2 py-1 rounded bg-white/5">
              <span className="text-white truncate">{r.company || r.job_name || r.title || r.agent_type || r.id}</span>
              <span className="text-muted-foreground text-[10px] ml-auto flex-shrink-0">{new Date(r.created_date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResearchTool() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const research = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Research the following topic thoroughly and provide a comprehensive summary with key findings, data points, and actionable insights:\n\n${query}`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="What do you want to research?" className="h-8 text-xs" />
      <Button size="sm" onClick={research} disabled={loading} className="w-full text-xs">{loading ? "Researching..." : "Research"}</Button>
      {result && <div className="text-xs text-foreground bg-white/5 rounded-lg p-3 max-h-[200px] overflow-y-auto whitespace-pre-wrap">{result}</div>}
    </div>
  );
}

function AiAssistantTool() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask anything..." className="text-xs min-h-[50px]" />
      <Button size="sm" onClick={ask} disabled={loading} className="w-full text-xs">{loading ? "Thinking..." : "Ask AI"}</Button>
      {result && <div className="text-xs text-foreground bg-white/5 rounded-lg p-3 max-h-[200px] overflow-y-auto whitespace-pre-wrap">{result}</div>}
    </div>
  );
}

const TOOL_RENDERERS = {
  email: EmailTool,
  proposal: ProposalTool,
  calendar: CalendarTool,
  scraper: ScraperTool,
  database: DatabaseTool,
  research: ResearchTool,
  ai_assistant: AiAssistantTool,
};

export default function WorkspaceToolPanel({ toolId, onRemove }) {
  const [collapsed, setCollapsed] = useState(false);
  const def = TOOL_DEFS[toolId] || { label: toolId, icon: Wrench, color: "#64748b" };
  const Icon = def.icon;
  const Renderer = TOOL_RENDERERS[toolId];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${def.color}20` }}>
          <Icon className="w-3 h-3" style={{ color: def.color }} />
        </div>
        <span className="text-xs font-bold text-white flex-1">{def.label}</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-0.5 rounded hover:bg-red-500/20">
          <X className="w-3 h-3 text-red-400/60" />
        </button>
        {collapsed ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
      </div>
      {!collapsed && (
        <div className="px-3 pb-3">
          {Renderer ? <Renderer /> : (
            <p className="text-[11px] text-muted-foreground py-2 text-center">Tool panel — open full view for more</p>
          )}
        </div>
      )}
    </div>
  );
}