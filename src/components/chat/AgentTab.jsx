import { Shield, X, Loader2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentTab({ agent, isActive, onClick, onClose }) {
  const isMain = agent.type === "main";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap min-w-0",
        isActive
          ? "metallic-gold-bg text-background"
          : "bg-secondary/50 text-muted-foreground hover-metallic"
      )}
    >
      {isMain ? (
        <Shield className="w-2.5 h-2.5 flex-shrink-0" />
      ) : (
        <GitBranch className="w-2.5 h-2.5 flex-shrink-0" />
      )}
      <span className="truncate max-w-[70px]">{agent.name}</span>
      {agent.loading && <Loader2 className="w-2.5 h-2.5 animate-spin flex-shrink-0" />}
      {!isMain && (
        <span
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="ml-0.5 hover:text-destructive flex-shrink-0 cursor-pointer"
        >
          <X className="w-2.5 h-2.5" />
        </span>
      )}
    </button>
  );
}