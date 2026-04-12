import { Settings, User, Bell, Palette, Globe, Key, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your account and application preferences</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.name} className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{section.name}</h3>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    {item.toggle ? (
                      <Switch defaultChecked={item.enabled} />
                    ) : (
                      <span className="text-xs text-foreground font-medium">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}