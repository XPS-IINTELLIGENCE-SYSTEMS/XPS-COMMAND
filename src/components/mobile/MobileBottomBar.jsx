import { useRef, useCallback } from "react";
import { Home, MessageSquare, Grid3X3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "chat", label: "Chat", Icon: MessageSquare },
  { id: "tools", label: "Tools", Icon: Grid3X3 },
  { id: "settings", label: "Settings", Icon: Settings },
];

export default function MobileBottomBar({ activeTab, onTabChange }) {
  // Remember the last activeView for each tab so switching back restores it
  const tabMemory = useRef({});

  const handleTab = useCallback((id) => {
    // Store current tab's state before switching
    tabMemory.current[activeTab] = true;
    onTabChange(id, tabMemory.current);
  }, [activeTab, onTabChange]);

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: "rgba(8, 10, 18, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTab(id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-white/40"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}