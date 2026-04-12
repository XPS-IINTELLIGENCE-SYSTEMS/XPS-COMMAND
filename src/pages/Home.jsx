import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Sun, Moon, Menu, X, MessageSquare } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import ContentArea from "../components/ContentArea";
import ChatPanel from "../components/ChatPanel";

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  const handleMobileViewChange = (view) => {
    setActiveView(view);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between h-11 min-h-[44px] border-b border-border bg-card/50 px-3">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-1.5 rounded-md hover:bg-secondary/50">
          {mobileSidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain" />
          <span className="text-xs font-semibold metallic-gold">XPS</span>
        </div>
        <button onClick={() => setMobileChatOpen(!mobileChatOpen)} className="p-1.5 rounded-md hover:bg-secondary/50">
          <MessageSquare className={`w-5 h-5 ${mobileChatOpen ? 'text-primary' : 'text-foreground'}`} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 top-11">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-[220px] h-full">
            <Sidebar activeView={activeView} onViewChange={handleMobileViewChange} />
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[180px] min-w-[180px]' : 'w-0 min-w-0'} overflow-hidden`}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Mobile: split content + chat */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        <div className={`${mobileChatOpen ? 'h-1/2' : 'flex-1'} overflow-hidden`}>
          <ContentArea activeView={activeView} />
        </div>
        {mobileChatOpen && (
          <div className="h-1/2 border-t border-border overflow-hidden">
            <ChatPanel />
          </div>
        )}
      </div>

      {/* Desktop Center: TopBar + Content */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        <TopBar activeView={activeView} theme={theme} onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title={chatOpen ? 'Collapse chat' : 'Expand chat'}
          >
            {chatOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </TopBar>
        <ContentArea activeView={activeView} />
      </div>

      {/* Desktop Right Chat Panel */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${chatOpen ? 'w-[320px] min-w-[320px]' : 'w-0 min-w-0'} overflow-hidden`}>
        <ChatPanel />
      </div>
    </div>
  );
}