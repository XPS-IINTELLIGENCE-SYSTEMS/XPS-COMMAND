import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { hasMinRole } from "@/lib/permissions";
import { AccessDenied } from "@/components/shared/RoleGuard";
import { Sun, Moon } from "lucide-react";
import HexGlow from "@/components/HexGlow";
import TeamScoreboard from "@/components/manager/TeamScoreboard";
import PipelineKanban from "@/components/manager/PipelineKanban";
import AIAssistantButton from "@/components/ai/AIAssistantButton";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const [activeTab, setActiveTab] = useState("team");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  if (!hasMinRole(user, "manager")) return <AccessDenied />;

  const tabs = [
    { id: "team", label: "Team Performance" },
    { id: "pipeline", label: "Pipeline" },
  ];

  return (
    <div className="h-[100dvh] w-screen overflow-hidden hex-bg relative">
      <HexGlow />
      <div className="relative z-[2] h-full flex flex-col">
        <div className="h-12 min-h-[48px] border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
              <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-7 h-7 object-contain" />
              <span className="text-xs font-extrabold metallic-gold tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif" }}>MANAGER CENTER</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-md hover:bg-secondary">
              {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <a href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary">Dashboard</a>
          </div>
        </div>

        <div className="border-b border-border bg-card/50 backdrop-blur-sm flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {activeTab === "team" && <TeamScoreboard />}
            {activeTab === "pipeline" && <PipelineKanban />}
          </div>
        </div>
      </div>
      <AIAssistantButton pageContext={`Manager Dashboard - ${activeTab}`} />
    </div>
  );
}