import { Link2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AccountConnectorsSection({ profile, saveField }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>CONNECTORS</h3>
          <p className="text-[11px] text-white/50">Email, drive, and third-party integrations</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <div>
            <span className="text-sm text-white block">Email Connector</span>
            <span className="text-[11px] text-white/40">Gmail / Outlook integration for sending</span>
          </div>
          <Switch
            checked={!!profile?.email_connector_enabled}
            onCheckedChange={v => saveField("email_connector_enabled", v)}
          />
        </div>

        <div className="px-3 py-3 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-xs text-white/50 block mb-2">Connected Services</span>
          <div className="flex flex-wrap gap-2">
            {["Google Drive", "Google Sheets", "Gmail", "HubSpot", "Google Calendar", "Google Docs", "Google Tasks"].map(svc => (
              <span key={svc} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{svc}</span>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2">Manage connectors in the Connector Hub dashboard tool</p>
        </div>
      </div>
    </div>
  );
}