import { ExternalLink, X, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { GOOGLE_APPS } from "./GoogleAppsBar";

export default function GoogleAppEmbed({ appId, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);
  const app = GOOGLE_APPS.find(a => a.id === appId);
  if (!app || !app.url) return null;

  return (
    <div className={`w-full ${fullscreen ? "fixed inset-0 z-50 bg-background" : "max-w-5xl mx-auto"} flex flex-col`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-t-xl border border-border bg-card/80" style={{ borderColor: app.color + "40" }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: app.color }} />
        <span className="text-xs font-semibold text-foreground">{app.label}</span>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> Open in new tab
        </a>
        <button onClick={() => setFullscreen(!fullscreen)} className="p-1 rounded hover:bg-white/10">
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" /> : <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Iframe — Google apps block iframe embedding, so we show a clean launcher */}
      <div className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-card" style={{ minHeight: fullscreen ? "calc(100vh - 40px)" : 480 }}>
        <div className="flex flex-col items-center justify-center h-full py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: app.color + "15" }}>
            {(() => { const Icon = app.icon; return <Icon className="w-10 h-10" style={{ color: app.color }} />; })()}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Google {app.label}</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Open Google {app.label} in a connected tab. Your Google account will be used automatically.
          </p>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: app.color, color: "#fff" }}
          >
            <ExternalLink className="w-4 h-4" />
            Open {app.label}
          </a>
          <p className="text-[11px] text-muted-foreground/50 mt-4">Opens in a new tab linked to your Google account</p>
        </div>
      </div>
    </div>
  );
}