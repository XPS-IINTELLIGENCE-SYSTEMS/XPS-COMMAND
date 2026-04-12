import { useState, useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";
import HexGlow from "../components/HexGlow";
import AdminChat from "../components/admin/AdminChat";
import AdminRightToolbar from "../components/admin/AdminRightToolbar";
import AdminBottomToolbar from "../components/admin/AdminBottomToolbar";
import AdminEditorCanvas from "../components/admin/AdminEditorCanvas";

export default function AdminPanel() {
  const [activeTool, setActiveTool] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const chatRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  return (
    <div className="h-[100dvh] w-screen overflow-hidden" style={{ border: '1.5px solid #a0a0a0', animation: 'silver-border-anim 4s ease infinite' }}>
      <div className="h-full w-full flex flex-col bg-black overflow-hidden hex-bg relative">
        {/* Full-screen electric hex glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <HexGlow />
        </div>
        {/* Top bar */}
        <div className="relative z-[1] h-10 min-h-[40px] border-b border-white/10 bg-black/80 backdrop-blur-sm flex items-center justify-between px-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
              <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-5 h-5 object-contain" />
              <span className="text-[10px] font-extrabold metallic-gold tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif" }}>ADMIN OPERATOR</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1.5 rounded-md hover:bg-white/10">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-white/40" /> : <Moon className="w-3.5 h-3.5 text-white/40" />}
            </button>
            <a href="/dashboard" className="text-[9px] text-white/40 hover:text-white/70 px-2 py-1 rounded-md hover:bg-white/5">Dashboard</a>
          </div>
        </div>

        {/* Main area */}
        <div className="relative z-[1] flex-1 flex overflow-hidden">
          {/* Left: Chat Panel */}
          <div className="w-[300px] min-w-[300px] bg-black/60 flex-shrink-0">
            <AdminChat ref={chatRef} />
          </div>

          {/* Vertical silver metallic border line */}
          <div className="w-px min-w-[1px] flex-shrink-0" style={{
            background: 'linear-gradient(180deg, #6a6a6a 0%, #c0c0c0 25%, #e8e8e8 50%, #c0c0c0 75%, #6a6a6a 100%)',
            boxShadow: '0 0 6px rgba(192,192,192,0.3), 0 0 12px rgba(192,192,192,0.15)',
            animation: 'silver-border-anim 4s ease infinite',
          }} />

          {/* Center: Editor Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <div className="relative z-[1] h-full">
              <AdminEditorCanvas activeTool={activeTool} />
            </div>
          </div>

          {/* Right: Designer Corner Toolbar - offset from edge */}
          <AdminRightToolbar activeTool={activeTool} onToolChange={setActiveTool} />
        </div>

        {/* Bottom Toolbar - centered under editor, lifted off bottom */}
        <div className="relative z-[1]">
          <AdminBottomToolbar />
        </div>
      </div>
    </div>
  );
}