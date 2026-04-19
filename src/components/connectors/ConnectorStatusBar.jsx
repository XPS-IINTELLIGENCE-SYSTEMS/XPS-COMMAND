import { CheckCircle2, AlertTriangle, Clock, Plug, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConnectorStatusBar({ connectors, onHealthCheck, checking }) {
  const connected = connectors.filter(c => c.connection_status === "connected").length;
  const errors = connectors.filter(c => c.connection_status === "error").length;
  const untested = connectors.filter(c => c.connection_status === "untested").length;
  const total = connectors.length;

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs">
        <Plug className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">{total} total</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
        <span className="text-green-400 font-medium">{connected} connected</span>
      </div>
      {errors > 0 && (
        <div className="flex items-center gap-1.5 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400 font-medium">{errors} errors</span>
        </div>
      )}
      {untested > 0 && (
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{untested} untested</span>
        </div>
      )}
      <Button size="sm" variant="outline" onClick={onHealthCheck} disabled={checking} className="h-7 gap-1 text-[10px] ml-auto">
        {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
        Test All
      </Button>
    </div>
  );
}