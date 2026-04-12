import { CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import ToolIcon from "./ToolIcon";

export default function ToolExecutionResult({ tool, result }) {
  const [expanded, setExpanded] = useState(true);
  const { status, data, error } = result;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all",
      status === "running" ? "border-primary/30 bg-primary/5" :
      status === "success" ? "border-green-500/25 bg-green-500/5" :
      status === "error" ? "border-red-500/25 bg-red-500/5" :
      "border-white/10 bg-card/40"
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
          status === "running" ? "bg-primary/20" :
          status === "success" ? "bg-green-500/20" :
          status === "error" ? "bg-red-500/20" : "bg-white/5"
        )}>
          {status === "running" ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
          ) : status === "success" ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-green-400" />
          ) : status === "error" ? (
            <AlertCircle className="w-4.5 h-4.5 text-red-400" />
          ) : (
            <ToolIcon name={tool.icon} className="w-4.5 h-4.5 text-white/50" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-white">{tool.label}</div>
          <div className="text-[10px] text-white/40">
            {status === "running" ? "Executing..." :
             status === "success" ? "Completed" :
             status === "error" ? "Failed" : "Pending"}
          </div>
        </div>
        {status !== "running" && (
          expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />
        )}
      </button>

      {/* Result body */}
      {expanded && status === "success" && data && (
        <div className="px-4 pb-4 border-t border-white/5">
          <div className="mt-3 text-xs text-white/80 leading-relaxed max-h-80 overflow-y-auto">
            <ResultDisplay data={data} />
          </div>
        </div>
      )}

      {expanded && status === "error" && error && (
        <div className="px-4 pb-4 border-t border-red-500/10">
          <p className="mt-3 text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

function ResultDisplay({ data }) {
  // If it's a string (like from InvokeLLM), render as markdown
  if (typeof data === "string") {
    return (
      <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_code]:text-primary [&_code]:bg-secondary [&_code]:px-1 [&_code]:rounded">
        {data}
      </ReactMarkdown>
    );
  }

  // If it has a summary or message field, show that prominently
  if (data.summary || data.message) {
    return (
      <div className="space-y-2">
        <p className="font-medium text-white">{data.summary || data.message}</p>
        {data.results && <DataTable data={data.results} />}
        {data.leads && <DataTable data={data.leads} />}
        {data.items && <DataTable data={data.items} />}
      </div>
    );
  }

  // If it's an array, show as simple table
  if (Array.isArray(data)) {
    return <DataTable data={data} />;
  }

  // For objects, show key-value pairs
  return (
    <div className="space-y-1.5">
      {Object.entries(data).map(([key, val]) => {
        if (val === null || val === undefined) return null;
        const display = typeof val === "object" ? JSON.stringify(val) : String(val);
        return (
          <div key={key} className="flex gap-2">
            <span className="text-[10px] font-medium text-primary/70 uppercase min-w-[80px] flex-shrink-0">{key.replace(/_/g, " ")}</span>
            <span className="text-xs text-white/70 break-all">{display.slice(0, 300)}</span>
          </div>
        );
      })}
    </div>
  );
}

function DataTable({ data }) {
  if (!data || data.length === 0) return <p className="text-white/40 text-[10px]">No results</p>;
  
  const items = data.slice(0, 10);
  const keys = Object.keys(items[0] || {}).filter(k => !["id", "created_date", "updated_date", "created_by"].includes(k)).slice(0, 5);

  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-white/10">
            {keys.map(k => (
              <th key={k} className="text-left py-1 px-2 text-primary/70 font-semibold uppercase">{k.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-white/5">
              {keys.map(k => (
                <td key={k} className="py-1.5 px-2 text-white/60 max-w-[150px] truncate">
                  {typeof item[k] === "object" ? JSON.stringify(item[k]) : String(item[k] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && <p className="text-[10px] text-white/30 mt-1">...and {data.length - 10} more</p>}
    </div>
  );
}