import { useState } from "react";
import { Sun, Moon, MessageSquare, User, LogOut, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AppTopNav({ tabs, activeView, onViewChange, theme, onThemeToggle, chatOpen, onChatToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-6">
          <img
            src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg"
            alt="XPS" className="w-7 h-7 object-contain"
          />
          <div className="hidden sm:block">
            <span className="text-sm font-extrabold metallic-gold tracking-wider">XPS</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">Intelligence</span>
          </div>
        </div>

        {/* Desktop Tab Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === tab.id
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button
            onClick={onChatToggle}
            className={`p-2 rounded-lg transition-colors relative ${chatOpen ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-muted-foreground'}`}
          >
            <MessageSquare className="w-4 h-4" />
            {!chatOpen && <span className="absolute top-1 right-1 w-2 h-2 metallic-gold-bg rounded-full" />}
          </button>

          {/* Account Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              <User className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-xl z-50 py-1">
                  <button
                    onClick={() => { setMenuOpen(false); onViewChange("settings"); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Account Settings
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => base44.auth.logout()}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-secondary/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}