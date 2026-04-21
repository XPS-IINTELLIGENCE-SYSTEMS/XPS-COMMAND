import { Plus, HardDrive, Star, Clock, Trash2, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { id: "my_drive", label: "My Drive", icon: HardDrive },
  { id: "starred", label: "Starred", icon: Star },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "trash", label: "Trash", icon: Trash2 },
];

export default function DriveSidebar({ activeView, onChangeView, onNewClick }) {
  return (
    <div className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-border bg-card/50 py-4 px-3">
      {/* New button */}
      <button
        onClick={onNewClick}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl mb-4 text-sm font-semibold transition-all glass-card hover:scale-[1.02] text-foreground"
      >
        <Plus className="w-5 h-5 text-primary" />
        New
      </button>

      {/* Nav */}
      <nav className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Back to dashboard link */}
      <div className="mt-auto pt-4 border-t border-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}