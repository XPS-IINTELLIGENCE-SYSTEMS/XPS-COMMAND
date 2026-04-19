import { useState, useEffect } from "react";
import useXpsRole from "@/hooks/useXpsRole";
import { base44 } from "@/api/base44Client";
import { Sun, Moon, Loader2, Play, Download, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import HexGlow from "@/components/HexGlow";
import OwnerKPIBar from "@/components/owner/OwnerKPIBar";
import MarketSimulator from "@/components/owner/MarketSimulator";
import ProductionSimulator from "@/components/owner/ProductionSimulator";
import CompetitiveIntelCenter from "@/components/owner/CompetitiveIntelCenter";
import StrategicAnalytics from "@/components/owner/StrategicAnalytics";
import AIAssistantButton from "@/components/ai/AIAssistantButton";

export default function OwnerDashboard() {
  const { xpsRole, loading: roleLoading, user } = useXpsRole();
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  useEffect(() => { if (!roleLoading) loadKPIs(); }, [roleLoading]);

  if (roleLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  if (!user || (xpsRole !== "owner" && user?.role !== "admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-8">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">This page is for owners only.</p>
          <a href="/dashboard" className="text-primary hover:underline">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  const loadKPIs = async () => {
    setLoading(true);
    const [leads, proposals, invoices, emails] = await Promise.all([
      base44.entities.Lead.list("-created_date", 1000),
      base44.entities.Proposal.list("-created_date", 500),
      base44.entities.Invoice.list("-created_date", 500),
      base44.entities.OutreachEmail.list("-created_date", 500),
    ]);
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisYear = new Date().getFullYear().toString();
    setKpiData({
      pipeline: leads.filter(l => !["Won", "Lost"].includes(l.stage)).reduce((s, l) => s + (l.estimated_value || 0), 0),
      leads_today: leads.filter(l => l.created_date?.startsWith(today)).length,
      emails_today: emails.filter(e => e.created_date?.startsWith(today) && e.status === "Sent").length,
      proposals_open: proposals.filter(p => p.status === "Sent" || p.status === "Viewed").length,
      revenue_month: invoices.filter(i => i.status === "Paid" && i.created_date?.startsWith(thisMonth)).reduce((s, i) => s + (i.total || 0), 0),
      revenue_year: invoices.filter(i => i.status === "Paid" && i.created_date?.startsWith(thisYear)).reduce((s, i) => s + (i.total || 0), 0),
    });
    setLoading(false);
  };

  const generateBrief = async () => {
    setBriefLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a morning executive brief for Chris Lavin, Owner of Xtreme Polishing Systems. Cover: overnight agent results, top 3 opportunities, key risks, competitor movements, and market signals. Keep it concise and actionable. Format with headers and bullet points.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
      });
      setBrief(res);
    } catch {}
    setBriefLoading(false);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "market", label: "Market Sim" },
    { id: "production", label: "Production Sim" },
    { id: "competitive", label: "Competitive Intel" },
    { id: "analytics", label: "Strategic Analytics" },
  ];

  return (
    <div className="h-[100dvh] w-screen overflow-hidden hex-bg relative">
      <HexGlow />
      <div className="relative z-[2] h-full flex flex-col">
        {/* Top Bar */}
        <div className="h-12 min-h-[48px] border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80">
              <img src="https://media.base44.com/images/public/69db3269c791af3f48cfaee9/583965fcb_IMAGEWITHWHITEOUTLINE.jpg" alt="XPS" className="w-7 h-7 object-contain" />
              <span className="text-xs font-extrabold metallic-gold tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif" }}>EXECUTIVE COMMAND</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-md hover:bg-secondary">
              {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <a href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary">Dashboard</a>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <>
                {activeTab === "overview" && (
                  <>
                    <OwnerKPIBar data={kpiData} />
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={async () => { try { await base44.functions.invoke("overnightRunner", { action: "run", market: "Florida" }); } catch {} }}>
                        <Play className="w-5 h-5" /> Run Overnight Intel
                      </Button>
                      <Button variant="outline" className="gap-2 h-auto py-3 flex-col"><Download className="w-5 h-5" /> Export Pipeline</Button>
                      <Button variant="outline" className="gap-2 h-auto py-3 flex-col"><Send className="w-5 h-5" /> Broadcast Message</Button>
                      <Button variant="outline" className="gap-2 h-auto py-3 flex-col" onClick={loadKPIs}><RefreshCw className="w-5 h-5" /> System Audit</Button>
                    </div>
                    {/* Executive Brief */}
                    <div className="glass-card rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground">AI Executive Brief</h3>
                        <Button size="sm" onClick={generateBrief} disabled={briefLoading} className="gap-1">
                          {briefLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Generate
                        </Button>
                      </div>
                      {brief ? (
                        <div className="text-sm text-muted-foreground whitespace-pre-line">{brief}</div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Click Generate to create today's executive intelligence brief.</p>
                      )}
                    </div>
                  </>
                )}
                {activeTab === "market" && <MarketSimulator />}
                {activeTab === "production" && <ProductionSimulator />}
                {activeTab === "competitive" && <CompetitiveIntelCenter />}
                {activeTab === "analytics" && <StrategicAnalytics />}
              </>
            )}
          </div>
        </div>
      </div>
      <AIAssistantButton pageContext={`Owner Dashboard - ${activeTab}`} />
    </div>
  );
}