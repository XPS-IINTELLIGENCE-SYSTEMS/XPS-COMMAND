import { useState, useEffect, useRef, useCallback } from "react";
import { X, MessageSquare } from "lucide-react";
import AppSidebar from "../components/app/AppSidebar";
import AppHeaderBar from "../components/app/AppHeaderBar";
import AppContent from "../components/app/AppContent";
import ChatPanel from "../components/ChatPanel";

export default function Home() {
  const [activeView, setActiveView] = useState("command");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(() => parseInt(localStorage.getItem("xps-chat-width")) || 340);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const chatRef = useRef(null);
  const resizing = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startWidth = chatWidth;
    const onMouseMove = (e) => {
      if (!resizing.current) return;
      const newWidth = Math.max(260, Math.min(520, startWidth + (e.clientX - startX)));
      setChatWidth(newWidth);
    };
    const onMouseUp = () => {
      resizing.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      localStorage.setItem("xps-chat-width", chatWidth.toString());
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [chatWidth]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  const handleChatCommand = (command) => {
    setChatOpen(true);
    if (chatRef.current?.sendCommand) {
      chatRef.current.sendCommand(command);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar — far left */}
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Chat Panel — left of content, right of sidebar (desktop) */}
      {chatOpen && (
        <div className="hidden lg:flex flex-shrink-0 border-r border-border flex-col relative" style={{ width: chatWidth }}>
          <ChatPanel ref={chatRef} chatWidth={chatWidth} />
          {/* Resize handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize z-10 group hover:bg-primary/20 active:bg-primary/30 transition-colors"
          >
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-8 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
          </div>
        </div>
      )}

      {/* Main area — header + content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AppHeaderBar
          activeView={activeView}
          theme={theme}
          onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(!chatOpen)}
          onViewChange={setActiveView}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-4">
          <AppContent
            activeView={activeView}
            onChatCommand={handleChatCommand}
            onNavigate={setActiveView}
          />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
        <div className="flex">
          {[
            { id: "command", label: "Home" },
            { id: "xpress_leads", label: "Leads" },
            { id: "find_jobs", label: "Jobs" },
            { id: "find_companies", label: "Co." },
            { id: "settings", label: "More" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 py-3 text-center text-[10px] font-medium transition-colors ${
                activeView === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Chat Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain" />
                <span className="text-sm font-bold xps-gold-slow-shimmer">XPS Agent</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel ref={chatRef} mobile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}