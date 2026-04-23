import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send, Loader2, Globe, Link, Layers, Workflow, FolderOpen,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Copy, Download
} from "lucide-react";

const QUICK_COMMANDS = [
  { label: "Search & Scrape", icon: Globe, template: 'search "epoxy contractors in Atlanta GA"' },
  { label: "Scrape URLs", icon: Link, template: 'scrape urls ["https://example.com","https://example2.com"]' },
  { label: "Deep Crawl", icon: Layers, template: 'crawl https://example.com depth:2' },
  { label: "Workflow", icon: Workflow, template: 'workflow: search "flooring companies Texas" → extract {company,email,phone} → save' },
];

function parseCommand(text) {
  const t = text.trim();

  // search "query" [max:N]
  const searchMatch = t.match(/^search\s+"([^"]+)"(?:\s+max:(\d+))?/i);
  if (searchMatch) return {
    action: 'search_and_scrape',
    query: searchMatch[1],
    max_pages: parseInt(searchMatch[2] || 8),
  };

  // scrape urls [...]
  const urlMatch = t.match(/^scrape\s+urls?\s+(\[[\s\S]+\])/i);
  if (urlMatch) {
    try { return { action: 'scrape_urls', urls: JSON.parse(urlMatch[1]) }; }
    catch { return null; }
  }

  // scrape url https://...
  const singleUrl = t.match(/^scrape\s+(https?:\/\/\S+)/i);
  if (singleUrl) return { action: 'scrape_urls', urls: [singleUrl[1]] };

  // crawl https://... [depth:N]
  const crawlMatch = t.match(/^crawl\s+(https?:\/\/\S+)(?:\s+depth:(\d+))?/i);
  if (crawlMatch) return {
    action: 'deep_crawl',
    start_url: crawlMatch[1],
    max_depth: parseInt(crawlMatch[2] || 2),
    max_pages: 12,
  };

  // workflow: ... → ... → save
  if (t.toLowerCase().startsWith('workflow')) {
    const parts = t.split(/→|->/).map(s => s.trim());
    const steps = [];
    for (const part of parts) {
      if (/^workflow/i.test(part)) {
        const qm = part.match(/search\s+"([^"]+)"/i);
        if (qm) steps.push({ action: 'search', query: qm[1], max_results: 8 });
      } else if (/fetch|scrape/i.test(part)) {
        steps.push({ action: 'fetch_urls' });
      } else if (/extract/i.test(part)) {
        const schemaMatch = part.match(/\{([^}]+)\}/);
        const fields = schemaMatch ? schemaMatch[1].split(',').map(f => f.trim()).reduce((o, f) => ({ ...o, [f]: 'string' }), {}) : {};
        steps.push({ action: 'extract', schema: fields });
      } else if (/save/i.test(part)) {
        steps.push({ action: 'save', title: `Workflow Result — ${new Date().toLocaleString()}` });
      }
    }
    if (!steps.length) return null;
    return { action: 'workflow', steps };
  }

  return null;
}

function ResultCard({ msg }) {
  const [expanded, setExpanded] = useState(false);
  const r = msg.result;

  const copyJSON = () => navigator.clipboard.writeText(JSON.stringify(r, null, 2));
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `scrape-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground">{msg.label}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={copyJSON} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={downloadJSON} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
        {r.pages_fetched != null && <span className="bg-secondary px-2 py-1 rounded">{r.pages_fetched} pages fetched</span>}
        {r.pages_crawled != null && <span className="bg-secondary px-2 py-1 rounded">{r.pages_crawled} pages crawled</span>}
        {r.items?.length > 0 && <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded">{r.items.length} items extracted</span>}
        {r.saved_asset && !r.saved_asset.error && <span className="bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Saved to project</span>}
      </div>

      {/* Summary */}
      {r.summary && <p className="text-xs text-foreground/80 leading-relaxed">{r.summary}</p>}

      {/* Items preview */}
      {r.items?.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide' : 'Show'} extracted items ({r.items.length})
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {r.items.slice(0, 20).map((item, i) => (
                <div key={i} className="text-xs bg-secondary/50 rounded px-2 py-1.5 font-mono break-all">
                  {JSON.stringify(item)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contacts */}
      {r.page_contacts?.some(p => p.emails?.length || p.phones?.length) && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">Contacts Found</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {r.page_contacts.filter(p => p.emails?.length || p.phones?.length).map((p, i) => (
              <div key={i} className="text-xs bg-secondary/30 rounded px-2 py-1">
                <span className="text-primary truncate block">{p.url?.slice(0, 50)}</span>
                {p.emails?.map((e, j) => <span key={j} className="text-green-400 mr-2">{e}</span>)}
                {p.phones?.map((ph, j) => <span key={j} className="text-blue-400 mr-2">{ph}</span>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow log */}
      {r.workflow_log && (
        <div className="space-y-1">
          {r.workflow_log.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {step.status === 'done'
                ? <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                : <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
              <span className="text-muted-foreground font-mono">{step.step}</span>
              {step.items?.length != null && <span className="text-primary">→ {step.items.length} items</span>}
              {step.results?.length != null && <span className="text-primary">→ {step.results.length} results</span>}
              {step.pages?.length != null && <span className="text-primary">→ {step.pages.length} pages</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScraperChatPanel({ projectId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `👋 **Parallel Web Scraper** — no API integrations needed.\n\nCommands:\n• \`search "query"\` — DDG search + parallel scrape all results\n• \`scrape https://url.com\` — scrape specific URLs\n• \`crawl https://site.com depth:2\` — deep crawl with link following\n• \`workflow: search "X" → extract {field} → save\` — multi-step pipeline\n\nAll results auto-saved to your project folder if a project is selected.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [projects, setProjects] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.entities.Project.list('-created_date', 20).then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const cmd = text || input;
    if (!cmd.trim() || loading) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: cmd }]);
    setLoading(true);

    const parsed = parseCommand(cmd);
    if (!parsed) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `❌ Couldn't parse that command. Try:\n• \`search "query max:10"\`\n• \`scrape https://example.com\`\n• \`crawl https://site.com depth:2\`\n• \`workflow: search "X" → extract {field1,field2} → save\``
      }]);
      setLoading(false);
      return;
    }

    if (selectedProject) parsed.project_id = selectedProject;
    if (parsed.action !== 'workflow') parsed.save_to_project = !!selectedProject;

    try {
      const res = await base44.functions.invoke('parallelScraper', parsed);
      const r = res.data;

      let label = '';
      if (parsed.action === 'search_and_scrape') label = `Search: "${parsed.query}"`;
      else if (parsed.action === 'scrape_urls') label = `Scrape: ${parsed.urls?.length} URL(s)`;
      else if (parsed.action === 'deep_crawl') label = `Crawl: ${parsed.start_url}`;
      else if (parsed.action === 'workflow') label = `Workflow complete`;

      setMessages(prev => [...prev, { role: 'result', label, result: r }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: `❌ Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-background rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Parallel Scraper</span>
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">No integrations</span>
        </div>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="text-xs bg-secondary border border-border rounded-md px-2 py-1 text-foreground max-w-[180px]"
        >
          <option value="">No project (don't save)</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'result' ? (
              <div className="w-full max-w-2xl">
                <ResultCard msg={msg} />
              </div>
            ) : (
              <div className={`max-w-xl rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              }`}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Scraping in parallel…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick commands */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-border/50">
        {QUICK_COMMANDS.map(cmd => (
          <button
            key={cmd.label}
            onClick={() => setInput(cmd.template)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors flex-shrink-0"
          >
            <cmd.icon className="w-3 h-3" /> {cmd.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder='search "query" | scrape https://... | crawl https://... | workflow: ...'
          className="text-sm font-mono"
          disabled={loading}
        />
        <Button onClick={() => send()} disabled={!input.trim() || loading} size="icon" className="flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}