import { useState, useEffect } from "react";
import { User, Bell, Palette, Trash2, Loader2, Plus, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import SettingsConnectors from "../settings/SettingsConnectors";
import SettingsAIMode from "../settings/SettingsAIMode";
import SettingsEditLock from "../settings/SettingsEditLock";

export default function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    compact_mode: false,
  });
  const [addingCard, setAddingCard] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [sugLoading, setSugLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    if (me?.preferences) setPrefs(prev => ({ ...prev, ...me.preferences }));
    setLoading(false);
  };

  const togglePref = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await base44.auth.updateMe({ preferences: next });
    toast({ title: "Saved", description: `${key.replace(/_/g, " ")} ${next[key] ? "enabled" : "disabled"}` });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.logout("/");
  };

  const getAISuggestions = async () => {
    setSugLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "Suggest 3 new settings cards for a CRM/sales intelligence platform. Each should have a title (2-3 words), description (one sentence), and icon name from lucide-react. Return JSON with an array called 'suggestions'.",
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  icon: { type: "string" },
                },
              },
            },
          },
        },
      });
      setAiSuggestions(res.suggestions);
    } catch {
      toast({ title: "Error", description: "Could not get AI suggestions", variant: "destructive" });
    }
    setSugLoading(false);
  };

  const theme = document.documentElement.classList.contains("light") ? "Light" : "Dark";
  const role = sessionStorage.getItem("xps-role") || user?.role || "operator";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-y-auto h-full">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold xps-gold-slow-shimmer tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            SETTINGS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Account, integrations, and app preferences</p>
        </div>

        {/* Edit Lock */}
        <SettingsEditLock />

        {/* Profile */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Profile</h3>
              <p className="text-[10px] text-muted-foreground">Your account details</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Display Name", value: user?.full_name || "Not set" },
              { label: "Email", value: user?.email || "Not set" },
              { label: "Role", value: role },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] border-b border-border/30 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm text-foreground font-medium capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connectors — Real Base44 Technology */}
        <SettingsConnectors />

        {/* AI Autonomy Mode */}
        <SettingsAIMode />

        {/* Notifications */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <p className="text-[10px] text-muted-foreground">Choose how you get alerted</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { key: "email_notifications", label: "Email notifications" },
              { key: "sms_notifications", label: "SMS notifications" },
              { key: "push_notifications", label: "Push notifications" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] border-b border-border/30 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Switch checked={prefs[item.key]} onCheckedChange={() => togglePref(item.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Palette className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
              <p className="text-[10px] text-muted-foreground">Visual preferences</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] border-b border-border/30">
              <span className="text-sm text-muted-foreground">Theme</span>
              <span className="text-sm text-foreground font-medium">{theme}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03]">
              <span className="text-sm text-muted-foreground">Compact mode</span>
              <Switch checked={prefs.compact_mode} onCheckedChange={() => togglePref("compact_mode")} />
            </div>
          </div>
        </div>

        {/* Add New Card */}
        <div className="text-center">
          <Button
            variant="outline"
            className="gap-2 text-xs"
            onClick={() => { setAddingCard(!addingCard); if (!aiSuggestions) getAISuggestions(); }}
          >
            {sugLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add Settings Card
          </Button>
          {addingCard && aiSuggestions && (
            <div className="mt-4 space-y-2 max-w-md mx-auto">
              <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground mb-2">
                <Sparkles className="w-3 h-3 text-primary" /> AI Recommendations
              </div>
              {aiSuggestions.map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-3 text-left">
                  <div className="text-sm font-semibold text-foreground">{s.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl !border-destructive/30 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-[10px] text-muted-foreground">Permanent and irreversible actions</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2 text-xs">
                <Trash2 className="w-3 h-3" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete your account and remove all your data.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting..." : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}