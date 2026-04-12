import { useState, useEffect } from "react";
import { User, Bell, Palette, Trash2, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    compact_mode: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    // Load saved prefs if they exist
    if (me?.preferences) {
      setPrefs(prev => ({ ...prev, ...me.preferences }));
    }
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

  const theme = document.documentElement.classList.contains("light") ? "Light" : "Dark";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const role = sessionStorage.getItem("xps-role") || user?.role || "operator";

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Account and application preferences</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {/* Profile */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Profile</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Display Name</span>
              <span className="text-sm text-foreground font-medium">{user?.full_name || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm text-foreground font-medium">{user?.email || "Not set"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm text-foreground font-medium capitalize">{role}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: "email_notifications", label: "Email notifications" },
              { key: "sms_notifications", label: "SMS notifications" },
              { key: "push_notifications", label: "Push notifications" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Switch checked={prefs[item.key]} onCheckedChange={() => togglePref(item.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Palette className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Theme</span>
              <span className="text-sm text-foreground font-medium">{theme}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Compact mode</span>
              <Switch checked={prefs.compact_mode} onCheckedChange={() => togglePref("compact_mode")} />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="max-w-2xl bg-card rounded-2xl border border-destructive/30 p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-destructive" />
          </div>
          <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and remove all your data.
              </AlertDialogDescription>
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
  );
}