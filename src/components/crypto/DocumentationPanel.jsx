import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";

export default function DocumentationPanel({ simulation }) {
  if (!simulation?.documentation) return <div className="text-xs text-muted-foreground text-center py-8">Documentation generates as phases complete.</div>;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />Full Documentation
      </h3>
      <div className="prose prose-sm prose-invert max-w-none text-[11px] leading-relaxed max-h-[600px] overflow-y-auto">
        <ReactMarkdown>{simulation.documentation}</ReactMarkdown>
      </div>
    </div>
  );
}