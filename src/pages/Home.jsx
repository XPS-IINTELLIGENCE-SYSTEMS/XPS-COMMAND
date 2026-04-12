import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Menu, X, MessageSquare, Sun, Moon } from "lucide-react";
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
    <div className="h-[100dvh] w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* ========== MOBILE LAYOUT ========== */}
      {/* Mobile Header - iPhone safe area aware */}
      <div className="flex md:hidden items-center justify-between h-12 min-h-[48px] border-b border-border bg-card/80 backdrop-blur-md px-4 safe-top">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-2 -ml-1 rounded-lg active:bg-secondary/50 transition-colors">
          {mobileSidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 metallic-silver-icon" />}
        </button>
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold metallic-gold tracking-wider">XPS</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg active:bg-secondary/50 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4 metallic-silver-icon" /> : <Moon className="w-4 h-4 metallic-silver-icon" />}
          </button>
          <button onClick={() => setMobileChatOpen(!mobileChatOpen)} className="p-2 -mr-1 rounded-lg active:bg-secondary/50 transition-colors relative">
            <MessageSquare className={`w-5 h-5 ${mobileChatOpen ? 'metallic-gold-icon' : 'metallic-silver-icon'}`} />
            {!mobileChatOpen && <span className="absolute top-1.5 right-1.5 w-2 h-2 metallic-gold-bg rounded-full" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 top-12">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-[260px] h-full bg-sidebar shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar activeView={activeView} onViewChange={handleMobileViewChange} />
          </div>
        </div>
      )}

      {/* Mobile Content + Chat Split */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        {/* Content area - takes full height or top portion when chat is open */}
        <div className={`${mobileChatOpen ? 'h-[45%] min-h-[200px]' : 'flex-1'} overflow-hidden transition-all duration-300`}>
          <ContentArea activeView={activeView} />
        </div>
        {/* Chat panel - slides up from bottom */}
        {mobileChatOpen && (
          <div className="flex-1 border-t border-border overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <ChatPanel mobile />
          </div>
        )}
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      {/* Desktop Sidebar */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[200px] min-w-[200px]' : 'w-0 min-w-0'} overflow-hidden`}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Desktop Center */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        <TopBar activeView={activeView} theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors" title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors" title={chatOpen ? 'Collapse chat' : 'Expand chat'}>
            {chatOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </TopBar>
        <ContentArea activeView={activeView} />
      </div>

      {/* Desktop Chat Panel */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${chatOpen ? 'w-[320px] min-w-[320px]' : 'w-0 min-w-0'} overflow-hidden`}>
        <ChatPanel />
      </div>
    </div>
  );
}