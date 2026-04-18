import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Map, Sparkles, Mail, Bot, User } from "lucide-react";
import CRMTopNav from "../components/crm/CRMTopNav";
import LeadsTable from "../components/crm/LeadsTable";
import LeadDetailPanel from "../components/crm/LeadDetailPanel";
import MapView from "../components/crm/MapView";
import AIFindView from "../components/crm/AIFindView";
import EmailComposer from "../components/crm/EmailComposer";
import MyAIView from "../components/crm/MyAIView";
import AccountView from "../components/crm/AccountView";

const NAV_TABS = [
  { id: "leads", label: "Leads", icon: Users },
  { id: "map", label: "Map", icon: Map },
  { id: "ai_find", label: "AI Find", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "my_ai", label: "My AI", icon: Bot },
  { id: "account", label: "Account", icon: User },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("leads");
  const [selectedLead, setSelectedLead] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("xps-theme") || "dark");
  const queryClient = useQueryClient();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("xps-theme", theme);
  }, [theme]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list("-created_date", 500),
  });

  const refreshLeads = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  }, [queryClient]);

  const handleDeleteLead = async (lead) => {
    if (!confirm(`Delete ${lead.company}?`)) return;
    await base44.entities.Lead.delete(lead.id);
    setSelectedLead(null);
    refreshLeads();
  };

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <CRMTopNav tabs={NAV_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-hidden">
        {activeTab === "leads" && (
          <div className="h-full overflow-y-auto px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-foreground">Leads</h1>
                {isLoading && <p className="text-sm text-muted-foreground mt-1">Loading...</p>}
              </div>
              <LeadsTable
                leads={leads}
                onUpdate={refreshLeads}
                onDelete={handleDeleteLead}
                onSelect={setSelectedLead}
              />
            </div>
          </div>
        )}

        {activeTab === "map" && <MapView leads={leads} />}

        {activeTab === "ai_find" && (
          <div className="h-full overflow-y-auto px-6 py-6">
            <AIFindView onRefreshLeads={refreshLeads} />
          </div>
        )}

        {activeTab === "email" && (
          <div className="h-full overflow-y-auto px-6 py-6">
            <EmailComposer leads={leads} />
          </div>
        )}

        {activeTab === "my_ai" && <MyAIView />}

        {activeTab === "account" && (
          <div className="h-full overflow-y-auto px-6 py-6">
            <AccountView theme={theme} onThemeToggle={toggleTheme} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
        <div className="flex">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 flex flex-col items-center gap-0.5 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead Detail Slide-over */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onRefresh={refreshLeads}
        />
      )}
    </div>
  );
}