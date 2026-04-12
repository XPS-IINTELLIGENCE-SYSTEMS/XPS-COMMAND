import { Search, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";



export default function TopBar({ children, theme, onThemeToggle }) {
  const toggleButtons = children ? (Array.isArray(children) ? children : [children]) : [];
  return (
    <div className="h-12 min-h-[48px] border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {toggleButtons[0]}
      </div>

      <div className="flex-1 max-w-lg mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 metallic-silver-icon" />
          <input
            placeholder="Search leads, companies, proposals..."
            className="w-full pl-9 h-9 text-xs bg-secondary/30 border border-border/50 rounded-xl focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 chat-input-metallic text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="shimmer-card p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 shimmer-icon metallic-silver-icon" /> : <Moon className="w-4 h-4 shimmer-icon metallic-silver-icon" />}
        </button>
        {toggleButtons[1]}
      </div>
    </div>
  );
}