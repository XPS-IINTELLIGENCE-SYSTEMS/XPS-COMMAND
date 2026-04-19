import { useState, useEffect, useRef, useCallback } from "react";
import { X, Sun, Moon, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import ChatPanel from "../components/ChatPanel";
import DashboardHub from "../components/dashboard/DashboardHub";
import AppContent from "../components/app/AppContent";
import PageHexGlow from "../components/PageHexGlow";
import GlobalNav from "../components/navigation/GlobalNav";
import PrivacyDisclaimer from "../components/admin/PrivacyDisclaimer";
import MobileBottomBar from "../components/mobile/MobileBottomBar";
import MobileToolHeader from "../components/mobile/MobileToolHeader";
import AnimatedView from "../components/mobile/AnimatedView";
import { DEFAULT_TOOLS } from "../components/dashboard/dashboardDefaults";
import useSystemTheme from "../hooks/useSystemTheme";

export default function Home() {
  const [activeView, setActiveView] = useState(null); // null = show dashboard hub
  const [chatWidth, setChatWidth] = useState(() => parseInt(localStorage.getItem("xps-chat-width")) || 340);
  const [chatOpen, setChatOpen] = useState(true);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("xps-theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useSystemTheme();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [mobileTab, setMobileTab] = useState("home"); // home, chat, tools, settings
  const tabViewMemory = useRef({}); // remembers activeView per tab
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

  // Mobile tab handler — preserves activeView state per tab
  const handleMobileTab = (tab) => {
    // Save current tab's view before leaving
    tabViewMemory.current[mobileTab] = activeView;

    if (tab === "chat") {
      setChatOpen(true);
      setMobileTab("chat");
    } else if (tab === "home") {
      setChatOpen(false);
      // Restore previously saved view for home tab (or null for dashboard)
      setActiveView(tabViewMemory.current["home"] ?? null);
      setMobileTab("home");
    } else if (tab === "tools") {
      setChatOpen(false);
      setActiveView(tabViewMemory.current["tools"] ?? null);
      setMobileTab("tools");
    } else if (tab === "settings") {
      setChatOpen(false);
      setActiveView(tabViewMemory.current["settings"] ?? "settings");
      setMobileTab("settings");
    }
  };

  // When opening a tool, switch mobile tab to home (content view)
  const handleOpenTool = (toolId) => {
    setActiveView(toolId);
    setMobileTab("home");
  };

  // Get active tool label for mobile header
  const activeToolLabel = activeView
    ? (DEFAULT_TOOLS.find(t => t.id === activeView)?.label || "Tool")
    : null;

  // Check if user has accepted privacy policy
  useEffect(() => {
    const checkPrivacy = async () => {
      const me = await base44.auth.me().catch(() => null);
      if (!me) return;
      const profiles = await base44.entities.MemberProfile.filter({ email: me.email }).catch(() => []);
      if (profiles.length === 0 || !profiles[0].privacy_accepted) {
        setShowPrivacy(true);
      }
    };
    checkPrivacy();
  }, []);

  const handlePrivacyAccept = async (privacyAccepted, dataConsent) => {
    const me = await base44.auth.me().catch(() => null);
    if (!me) return;
    const profiles = await base44.entities.MemberProfile.filter({ email: me.email }).catch(() => []);
    if (profiles.length > 0) {
      await base44.entities.MemberProfile.update(profiles[0].id, {
        privacy_accepted: privacyAccepted,
        data_sharing_consent: dataConsent,
        can_download: dataConsent,
        can_export: dataConsent,
      });
    } else {
      await base44.entities.MemberProfile.create({
        email: me.email,
        name: me.full_name || "",
        user_type: "saas",
        status: "active",
        package: "free",
        privacy_accepted: privacyAccepted,
        data_sharing_consent: dataConsent,
        can_download: dataConsent,
        can_export: dataConsent,
      });
    }
    setShowPrivacy(false);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden hex-bg">
      <PageHexGlow />
      {showPrivacy && <PrivacyDisclaimer onAccept={handlePrivacyAccept} />}
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

        {/* Secondary bar: theme toggle + chat toggle (desktop only) */}
        <div className="hidden lg:flex h-10 items-center justify-end px-4 gap-2 flex-shrink-0 border-b border-white/[0.06]"
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
        </div>

        {/* Mobile tool header when inside a tool view */}
        {activeView && (
          <MobileToolHeader
            title={activeToolLabel}
            onBack={() => { setActiveView(null); setMobileTab("home"); }}
          />
        )}

        {/* Content: Dashboard Hub or Tool View with slide animation */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            {activeView === null ? (
              <AnimatedView viewKey="dashboard">
                <DashboardHub onOpenTool={handleOpenTool} />
              </AnimatedView>
            ) : (
              <AnimatedView viewKey={activeView}>
                <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                  <AppContent activeView={activeView} onChatCommand={() => {}} onNavigate={handleOpenTool} />
                </div>
              </AnimatedView>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomBar activeTab={mobileTab} onTabChange={handleMobileTab} />

      {/* Mobile Chat Drawer — triggered by bottom bar "Chat" tab */}
      {chatOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setChatOpen(false); setMobileTab("home"); }} />
          <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-background border-r border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-6 h-6 object-contain" />
                <span className="text-sm font-bold xps-gold-slow-shimmer">XPS Agent</span>
              </div>
              <button onClick={() => { setChatOpen(false); setMobileTab("home"); }} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-hidden pb-14"><ChatPanel ref={chatRef} mobile /></div>
          </div>
        </div>
      )}
    </div>
  );
}