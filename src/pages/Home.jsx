import { useState, useEffect, useRef, useCallback } from "react";
import { PanelLeftClose, PanelLeftOpen, Menu, X, MessageSquare, Sun, Moon } from "lucide-react";
import HexGlow from "../components/HexGlow";
import TopBar from "../components/TopBar";
import ContentArea from "../components/ContentArea";
import ChatPanel from "../components/ChatPanel";
import MobileNav from "../components/MobileNav";
import MobileTabBar from "../components/mobile/MobileTabBar";

export default function Home() {
  const [activeView, setActiveView] = useState("command");
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const chatRef = useRef(null);

  const [chatWidth, setChatWidth] = useState(() => {
    const saved = localStorage.getItem("xps-chat-width");
    return saved ? parseInt(saved) : 340;
  });
  const isChatResizing = useRef(false);

  const startChatResize = useCallback((e) => {
    e.preventDefault();
    isChatResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      if (!isChatResizing.current) return;
      const newW = Math.max(260, Math.min(600, ev.clientX));
      setChatWidth(newW);
    };
    const onUp = () => {
      isChatResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setChatWidth(w => { localStorage.setItem('xps-chat-width', w); return w; });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  const handleMobileViewChange = (view) => {
    setActiveView(view);
    setMobileSidebarOpen(false);
  };

  const handleChatCommand = (command) => {
    setChatOpen(true);
    setMobileChatOpen(true);
    if (chatRef.current?.sendCommand) {
      chatRef.current.sendCommand(command);
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden" style={{ border: '1.5px solid #a0a0a0', animation: 'silver-border-anim 4s ease infinite' }}>
      <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-background">

        {/* ========== MOBILE LAYOUT ========== */}
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

        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 top-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-full h-full bg-background shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto">
              <MobileNav activeView={activeView} onViewChange={handleMobileViewChange} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col md:hidden overflow-hidden">
          <div className={`${mobileChatOpen ? 'h-[45%] min-h-[200px]' : 'flex-1'} overflow-hidden transition-all duration-300`}>
            <ContentArea activeView={activeView} onChatCommand={handleChatCommand} onNavigate={handleMobileViewChange} />
          </div>
          {mobileChatOpen && (
            <div className="flex-1 border-t border-border overflow-hidden">
              <ChatPanel mobile ref={chatRef} />
            </div>
          )}
          {!mobileChatOpen && (
            <MobileTabBar activeView={activeView} onViewChange={handleMobileViewChange} />
          )}
        </div>

        {/* ========== DESKTOP LAYOUT: Chat (left) + Content (right) ========== */}
        {/* Chat panel — LEFT */}
        <div className="hidden md:flex flex-row" style={{ width: chatOpen ? chatWidth : 0, minWidth: chatOpen ? chatWidth : 0, transition: isChatResizing.current ? 'none' : 'width 0.3s, min-width 0.3s' }}>
          <div className="flex-1 overflow-hidden">
            <ChatPanel ref={chatRef} chatWidth={chatWidth} />
          </div>
          {chatOpen && (
            <div
              onMouseDown={startChatResize}
              className="w-1.5 cursor-col-resize flex-shrink-0 group relative hover:bg-primary/20 transition-colors"
              title="Drag to resize chat"
            >
              <div className="absolute inset-y-0 right-0 w-[3px] bg-border group-hover:bg-primary/50 transition-colors" />
            </div>
          )}
        </div>

        {/* Content area — RIGHT */}
        <div className="hex-bg hidden md:flex flex-1 flex-col overflow-hidden relative">
          <HexGlow />
          <div className="relative z-[2] flex flex-col flex-1 overflow-hidden">
            {/* Slim top bar */}
            <div className="h-10 min-h-[40px] relative">
              <TopBar activeView={activeView} theme={theme} onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} height={40}>
                <button onClick={() => setChatOpen(!chatOpen)} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors" title={chatOpen ? 'Collapse chat' : 'Expand chat'}>
                  {chatOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
              </TopBar>
            </div>
            <ContentArea activeView={activeView} onChatCommand={handleChatCommand} onNavigate={setActiveView} />
          </div>
        </div>

      </div>
    </div>
  );
}