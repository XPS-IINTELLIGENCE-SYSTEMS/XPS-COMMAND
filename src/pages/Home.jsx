import { useState, useEffect, useRef, useCallback } from "react";
import { X, Sun, Moon, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ChatPanel from "../components/ChatPanel";
import DashboardHub from "../components/dashboard/DashboardHub";
import AppContent from "../components/app/AppContent";
import PageHexGlow from "../components/PageHexGlow";
import GlobalNav from "../components/navigation/GlobalNav";

export default function Home() {
  const [activeView, setActiveView] = useState(null); // null = show dashboard hub
  const [chatWidth, setChatWidth] = useState(() => parseInt(localStorage.getItem("xps-chat-width")) || 340);
  const [chatOpen, setChatOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
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
    <div className="h-screen bg-background flex overflow-hidden hex-bg">
      <PageHexGlow />
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
        {/* Global top nav with hamburger, home, back */}
        <GlobalNav />

        {/* Secondary bar: theme toggle + chat toggle */}
        <div className="h-10 flex items-center justify-end px-4 gap-2 flex-shrink-0 border-b border-white/[0.06]"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          {activeView && (
            <button
              onClick={() => setActiveView(null)}
              className="mr-auto flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          )}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-1.5 rounded-lg transition-colors lg:hidden ${chatOpen ? "bg-primary/10 text-primary" : "hover:bg-white/10 text-white/50"}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

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