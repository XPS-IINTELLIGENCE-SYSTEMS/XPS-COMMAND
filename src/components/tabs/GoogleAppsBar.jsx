import { Mail, FileText, Table2, Calendar, HardDrive, StickyNote, Globe } from "lucide-react";

const GOOGLE_APPS = [
  { id: "gmail", label: "Gmail", icon: Mail, color: "#ea4335", url: "https://mail.google.com" },
  { id: "docs", label: "Docs", icon: FileText, color: "#4285f4", url: "https://docs.google.com" },
  { id: "sheets", label: "Sheets", icon: Table2, color: "#0f9d58", url: "https://sheets.google.com" },
  { id: "calendar", label: "Calendar", icon: Calendar, color: "#4285f4", url: "https://calendar.google.com" },
  { id: "drive", label: "Drive", icon: HardDrive, color: "#f4b400", url: "https://drive.google.com" },
  { id: "keep", label: "Keep", icon: StickyNote, color: "#fbbc04", url: "https://keep.google.com" },
  { id: "browser", label: "Web Browser", icon: Globe, color: "#8b5cf6", url: null },
];

export default function GoogleAppsBar({ activeApp, onSelectApp }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
      {GOOGLE_APPS.map((app) => {
        const Icon = app.icon;
        const isActive = activeApp === app.id;
        return (
          <button
            key={app.id}
            onClick={() => onSelectApp(app.id === activeApp ? null : app.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              isActive
                ? "bg-white/10 border-white/20 text-foreground scale-105"
                : "glass-card text-muted-foreground hover:text-foreground hover:scale-105"
            }`}
          >
            <Icon className="w-4 h-4" style={{ color: app.color }} />
            {app.label}
          </button>
        );
      })}
    </div>
  );
}

export { GOOGLE_APPS };