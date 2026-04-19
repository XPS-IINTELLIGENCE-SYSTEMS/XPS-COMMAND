import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlobalNav from "../components/navigation/GlobalNav";
import PageHexGlow from "../components/PageHexGlow";
import AccountProfileSection from "../components/account/AccountProfileSection";
import AccountCompanySection from "../components/account/AccountCompanySection";
import AccountNotificationsSection from "../components/account/AccountNotificationsSection";
import AccountAgentSection from "../components/account/AccountAgentSection";
import AccountAutomationSection from "../components/account/AccountAutomationSection";
import AccountConnectorsSection from "../components/account/AccountConnectorsSection";
import { useToast } from "@/components/ui/use-toast";

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
    if (profiles.length > 0) {
      setProfile(profiles[0]);
    } else {
      // Create profile if doesn't exist
      const newProfile = await base44.entities.UserProfile.create({ user_email: me.email, full_name: me.full_name || "" });
      setProfile(newProfile);
    }
    setLoading(false);
  };

  const saveField = async (field, value) => {
    if (!profile) return;
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    await base44.entities.UserProfile.update(profile.id, { [field]: value });
    toast({ title: "Saved", description: `${field.replace(/_/g, " ")} updated` });
  };

  const saveBatch = async (fields) => {
    if (!profile) return;
    const updated = { ...profile, ...fields };
    setProfile(updated);
    await base44.entities.UserProfile.update(profile.id, fields);
    toast({ title: "Saved", description: "Settings updated" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background hex-bg flex flex-col">
        <GlobalNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background hex-bg relative">
      <PageHexGlow />
      <div className="relative z-[1]">
        <GlobalNav />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              ACCOUNT SETTINGS
            </h1>
            <p className="text-sm text-white/50 mt-1">Your profile, preferences, and system configuration</p>
          </div>

          <AccountProfileSection profile={profile} user={user} saveField={saveField} saveBatch={saveBatch} />
          <AccountCompanySection profile={profile} saveField={saveField} saveBatch={saveBatch} />
          <AccountNotificationsSection profile={profile} saveField={saveField} />
          <AccountAgentSection profile={profile} saveField={saveField} saveBatch={saveBatch} />
          <AccountAutomationSection profile={profile} saveField={saveField} />
          <AccountConnectorsSection profile={profile} saveField={saveField} />
        </div>
      </div>
    </div>
  );
}