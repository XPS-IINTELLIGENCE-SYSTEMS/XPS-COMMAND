import { useState, useEffect } from "react";
import { Loader2, Shield, Users, Key, UserPlus, Bell, Eye, BarChart3, Building2, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHexGlow from "../components/PageHexGlow";
import GlobalNav from "../components/navigation/GlobalNav";
import { isAdmin } from "@/lib/accessControl";

// Lazy-loaded tab content
import SystemStatsPanel from "../components/admin/SystemStatsPanel";
import JoinRequestManager from "../components/admin/JoinRequestManager";
import AccessCodeManager from "../components/admin/AccessCodeManager";
import MemberManager from "../components/admin/MemberManager";
import AdminToolsPanel from "../components/admin/AdminToolsPanel";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "requests", label: "Join Requests", icon: Bell },
  { id: "company_users", label: "Company Users", icon: Building2 },
  { id: "saas_users", label: "SaaS Users", icon: Globe },
  { id: "access_codes", label: "Access Codes", icon: Key },
  { id: "admin_tools", label: "Admin Tools", icon: Shield },
];

export default function AdminControl() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      // Get pending request count
      const pending = await base44.entities.JoinRequest.filter({ status: "pending" }).catch(() => []);
      setPendingCount(pending.length);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  // Block non-admin access
  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-background hex-bg relative">
        <PageHexGlow />
        <div className="relative z-[1]"><GlobalNav /></div>
        <div className="relative z-[1] flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-sm text-muted-foreground">This page is restricted to administrators only.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background hex-bg relative">
      <PageHexGlow />
      <div className="relative z-[1]"><GlobalNav /></div>

      <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-extrabold text-white">Admin Control Center</h1>
          </div>
          <p className="text-[11px] text-white/50 ml-8">
            Manage users, access codes, join requests, and admin tools — {user.email}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-border pb-px">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === "requests" && pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500 text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && <SystemStatsPanel />}
          {activeTab === "requests" && <JoinRequestManager />}
          {activeTab === "company_users" && <MemberManager filterType="company" />}
          {activeTab === "saas_users" && <MemberManager filterType="saas" />}
          {activeTab === "access_codes" && <AccessCodeManager />}
          {activeTab === "admin_tools" && <AdminToolsPanel />}
        </div>
      </div>
    </div>
  );
}