import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowLeft, Sun, Moon, MessageSquare, User, LogOut, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ChatPanel from "../components/ChatPanel";
import DashboardHub from "../components/dashboard/DashboardHub";
import AppContent from "../components/app/AppContent";

export default function Home() {
  const [activeView, setActiveView] = useState(null); // null = show dashboard hub
  const [chatWidth, setChatWidth] = useState(() => parseInt(localStorage.getItem("xps-chat-width")) || 340);
  const [chatOpen, setChatOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const chatRef = useRef(null);
  const resizing = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startW = chatWidth;
    const onMove = (e) => {
      if (!resizing.current) return;
      setChatWidth(Math.max(260, Math.min(520, startW + (e.clientX - startX))));
    };
    const onUp = () => {
      resizing.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      localStorage.setItem("xps-chat-width", chatWidth.toString());
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [chatWidth]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Chat Panel — left side (desktop) */}
      {chatOpen && (
        <div className="hidden lg:flex flex-shrink-0 border-r border-border flex-col relative" style={{ width: chatWidth }}>
          <ChatPanel ref={chatRef} chatWidth={chatWidth} />
          <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-10 group hover:bg-primary/20 active:bg-primary/30 transition-colors"
          >
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-8 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 gap-3 flex-shrink-0">
          {/* Back button when viewing a tool */}
          {activeView && (
            <button
              onClick={() => setActiveView(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain" />
            {!activeView && (
              <span className="text-sm font-extrabold metallic-gold tracking-wider hidden sm:inline">XPS INTELLIGENCE</span>
            )}
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-1.5 rounded-lg transition-colors lg:hidden ${chatOpen ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Account */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              XP
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-xl z-50 py-1">
                  <button onClick={() => { setMenuOpen(false); setActiveView("settings"); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary/60">
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Settings
                  </button>
                  <div className="border-t border-border my-1" />
                  <button onClick={() => base44.auth.logout()} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-secondary/60">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content: Dashboard Hub or Tool View */}
        <main className="flex-1 overflow-y-auto">
          {activeView === null ? (
            <DashboardHub onOpenTool={setActiveView} />
          ) : (
            <div className="w-full max-w-7xl mx-auto px-4 py-4">
              <AppContent activeView={activeView} onChatCommand={() => {}} onNavigate={setActiveView} />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Chat Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-background border-r border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain" />
                <span className="text-sm font-bold xps-gold-slow-shimmer">XPS Agent</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-hidden"><ChatPanel ref={chatRef} mobile /></div>
          </div>
        </div>
      )}
    </div>
  );
}