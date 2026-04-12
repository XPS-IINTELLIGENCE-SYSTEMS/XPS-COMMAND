import { useState } from "react";
import { User, Bell, Palette, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";

const settingSections = [
  {
    name: "Profile", icon: User,
    items: [
      { label: "Display Name", value: "Marcus Reyes" },
      { label: "Email", value: "marcus@xpsxpress.com" },
      { label: "Role", value: "Admin" },
    ]
  },
  {
    name: "Notifications", icon: Bell,
    items: [
      { label: "Email notifications", toggle: true, enabled: true },
      { label: "SMS notifications", toggle: true, enabled: false },
      { label: "Push notifications", toggle: true, enabled: true },
    ]
  },
  {
    name: "Appearance", icon: Palette,
    items: [
      { label: "Theme", value: "Dark" },
      { label: "Compact mode", toggle: true, enabled: false },
    ]
  },
];

export default function SettingsView() {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.logout("/");
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Account and application preferences</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.name} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{section.name}</h3>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    {item.toggle ? (
                      <Switch defaultChecked={item.enabled} />
                    ) : (
                      <span className="text-sm text-foreground font-medium">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
                This will permanently delete your account and remove all your data including leads, proposals, research, and settings. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}