import { ChevronRight, HardDrive } from "lucide-react";

export default function DriveBreadcrumb({ path, onNavigate }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 text-sm flex-shrink-0 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => onNavigate(-1)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
          path.length === 0 ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
      >
        <HardDrive className="w-4 h-4" />
        My Drive
      </button>
      {path.map((segment, i) => (
        <div key={segment.id} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <button
            onClick={() => onNavigate(i)}
            className={`px-2 py-1 rounded-lg transition-colors truncate max-w-[140px] ${
              i === path.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {segment.name}
          </button>
        </div>
      ))}
    </div>
  );
}