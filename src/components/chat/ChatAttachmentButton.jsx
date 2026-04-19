import { useState, useRef } from "react";
import { Paperclip, Loader2, CheckCircle2, X, FileText, Users, Swords, DollarSign, Database, Key, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ROUTE_CONFIG = {
  leads: { icon: Users, label: "Leads", color: "text-blue-400", bg: "bg-blue-500/10" },
  knowledge: { icon: BookOpen, label: "Knowledge", color: "text-green-400", bg: "bg-green-500/10" },
  competitor: { icon: Swords, label: "Competitor Intel", color: "text-red-400", bg: "bg-red-500/10" },
  crm: { icon: Database, label: "CRM", color: "text-purple-400", bg: "bg-purple-500/10" },
  pricing: { icon: DollarSign, label: "Pricing", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  api_config: { icon: Key, label: "API Config", color: "text-orange-400", bg: "bg-orange-500/10" },
  general: { icon: FileText, label: "General", color: "text-muted-foreground", bg: "bg-secondary" },
};

export default function ChatAttachmentButton({ onRouteComplete, mobile }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const res = await base44.functions.invoke("autoRouteUpload", {
      file_url,
      file_name: file.name,
    });

    const route = res.data?.route || "general";
    const summary = res.data?.classification?.summary || "File processed";
    setResult({ route, summary, fileName: file.name, data: res.data });
    setUploading(false);

    if (onRouteComplete) {
      onRouteComplete(route, file.name, summary);
    }

    e.target.value = "";
  };

  const dismiss = () => setResult(null);
  const rc = result ? ROUTE_CONFIG[result.route] || ROUTE_CONFIG.general : null;

  return (
    <div className="relative">
      <input ref={inputRef} type="file" className="hidden" onChange={handleUpload}
        accept=".csv,.xlsx,.xls,.json,.pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.html" />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`${mobile ? 'h-10 w-10' : 'h-8 w-8'} flex items-center justify-center rounded-lg transition-all ${uploading ? 'bg-primary/10' : 'hover:bg-secondary/60'}`}
        title="Attach file — auto-routes to the right place"
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        ) : (
          <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Route result toast */}
      {result && rc && (
        <div className="absolute bottom-full left-0 mb-2 w-64 glass-card rounded-xl p-3 shadow-xl z-50 animate-slide-in-right">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${rc.bg} flex items-center justify-center flex-shrink-0`}>
                <rc.icon className={`w-3.5 h-3.5 ${rc.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] font-bold text-foreground">Routed to {rc.label}</span>
                </div>
                <p className="text-[9px] text-muted-foreground truncate max-w-[170px]">{result.fileName}</p>
              </div>
            </div>
            <button onClick={dismiss} className="p-0.5 rounded hover:bg-secondary"><X className="w-3 h-3 text-muted-foreground" /></button>
          </div>
          {result.data?.leads_imported && (
            <div className="text-[9px] text-blue-400 mt-1.5">✓ {result.data.leads_imported} leads imported</div>
          )}
          <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">{result.summary}</p>
        </div>
      )}
    </div>
  );
}