import { User, Bell, Palette } from "lucide-react";
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 overflow-y-auto h-full">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground">Settings</h1>
        <p className="text-[11px] text-muted-foreground">Account and application preferences</p>
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
    </div>
  );
}