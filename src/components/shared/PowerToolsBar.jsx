import { useState } from "react";
import { Loader2, Sparkles, FileText, Globe, GitBranch, FolderPlus, Zap, Mail, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink, Sheet, Calendar, FileSpreadsheet, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TOOLS = [
  { id: "auto_takeoff", label: "Auto Takeoff", icon: Sparkles, color: "#d4af37", desc: "AI cost estimate" },
  { id: "auto_proposal", label: "Auto Proposal", icon: FileText, color: "#22c55e", desc: "Generate bid" },
  { id: "website_share", label: "Share Website", icon: Globe, color: "#3b82f6", desc: "Best pages to send" },
  { id: "auto_workflow", label: "Auto Workflow", icon: GitBranch, color: "#8b5cf6", desc: "Follow-up sequence" },
  { id: "create_project", label: "Create Project", icon: FolderPlus, color: "#f59e0b", desc: "Project folder" },
  { id: "full_pipeline", label: "Run All", icon: Zap, color: "#ef4444", desc: "Full pipeline" },
];

const GOOGLE_LINKS = [
  { label: "Sheets", icon: FileSpreadsheet, url: "https://sheets.google.com", color: "#22c55e" },
  { label: "Docs", icon: BookOpen, url: "https://docs.google.com", color: "#3b82f6" },
  { label: "Calendar", icon: Calendar, url: "https://calendar.google.com", color: "#f59e0b" },
  { label: "Drive", icon: FolderPlus, url: "https://drive.google.com", color: "#8b5cf6" },
];

export default function PowerToolsBar({ contact, adminEmail, compact = false }) {
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const runTool = async (action) => {
    if (!contact) return;
    setRunning(action);
    setResults(null);
    const res = await base44.functions.invoke("crmPowerTools", {
      action,
      contact,
      admin_email: adminEmail || null,
    });
    setResults(res.data);
    setRunning(null);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors">
          <Zap className="w-3 h-3" /> Power Tools {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expanded && <PowerToolsContent contact={contact} adminEmail={adminEmail} running={running} results={results} runTool={runTool} />}
      </div>
    );
  }

  return <PowerToolsContent contact={contact} adminEmail={adminEmail} running={running} results={results} runTool={runTool} />;
}

function PowerToolsContent({ contact, adminEmail, running, results, runTool }) {
  return (
    <div className="space-y-2">
      {/* Tool buttons */}
      <div className="flex flex-wrap gap-1.5">
        {TOOLS.map(t => {
          const Icon = t.icon;
          const isRunning = running === t.id;
          return (
            <button key={t.id} onClick={() => runTool(t.id)} disabled={!!running || !contact}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105 disabled:opacity-40"
              style={{ backgroundColor: `${t.color}12`, color: t.color, border: `1px solid ${t.color}25` }}>
              {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Google Workspace links */}
      <div className="flex gap-1">
        {GOOGLE_LINKS.map(g => {
          const Icon = g.icon;
          return (
            <a key={g.label} href={g.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-secondary/50 text-muted-foreground hover:text-foreground transition-all">
              <Icon className="w-3 h-3" style={{ color: g.color }} /> {g.label}
            </a>
          );
        })}
      </div>

      {/* Results display */}
      {results && <PowerToolsResults results={results} />}
    </div>
  );
}

function PowerToolsResults({ results }) {
  const [showDetail, setShowDetail] = useState(null);

  return (
    <div className="glass-card rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold">
        {results.success ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
        <span className={results.success ? "text-green-400" : "text-red-400"}>
          {results.stages?.length || 0} stages — {results.success ? "All Passed" : `${results.errors?.length || 0} Errors`}
        </span>
      </div>

      {/* Stage summary */}
      <div className="space-y-1">
        {results.stages?.map((s, i) => (
          <div key={i}>
            <button onClick={() => setShowDetail(showDetail === i ? null : i)}
              className="w-full flex items-center gap-2 text-[10px] py-1 hover:bg-secondary/30 rounded px-1 transition-colors">
              {s.status === "success" ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
              <span className="font-bold text-foreground">{s.stage}</span>
              <span className="text-muted-foreground ml-auto">{s.status}</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showDetail === i ? "rotate-180" : ""}`} />
            </button>
            {showDetail === i && s.detail && (
              <div className="ml-5 p-2 bg-secondary/30 rounded-lg text-[9px] text-foreground/70 max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{typeof s.detail === "object" ? JSON.stringify(s.detail, null, 2) : s.detail}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick result highlights */}
      {results.takeoff && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
          <div className="text-[9px] font-bold text-primary">Takeoff: {results.takeoff.estimated_sqft?.toLocaleString()} sqft — ${results.takeoff.total_estimate?.toLocaleString()}</div>
        </div>
      )}
      {results.proposal && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
          <div className="text-[9px] font-bold text-green-400">Proposal: ${results.proposal.pricing_optimal?.toLocaleString()} (optimal)</div>
        </div>
      )}
      {results.website && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
          <div className="text-[9px] font-bold text-blue-400 flex items-center gap-1">
            <a href={results.website.primary_url} target="_blank" rel="noopener noreferrer" className="underline">{results.website.primary_url}</a>
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
          <div className="text-[9px] text-foreground/60 mt-0.5">{results.website.personalized_message}</div>
        </div>
      )}
      {results.workflow && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-2">
          <div className="text-[9px] font-bold text-purple-400">Workflow: {results.workflow.workflow_name} — {results.workflow.steps?.length || 0} steps</div>
        </div>
      )}
      {results.project && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2">
          <div className="text-[9px] font-bold text-yellow-400">Project: {results.project.name} folder created</div>
        </div>
      )}
    </div>
  );
}