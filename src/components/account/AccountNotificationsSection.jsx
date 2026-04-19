import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const NOTIFICATION_OPTIONS = [
  { key: "email_notifications", label: "Email Notifications" },
  { key: "sms_notifications", label: "SMS Notifications" },
  { key: "push_notifications", label: "Push Notifications" },
];

const DELIVERY_OPTIONS = ["Email", "SMS", "Both", "None"];
const LEAD_DELIVERY_OPTIONS = ["Email", "SMS", "Dashboard Only", "Email + SMS", "All Channels"];

export default function AccountNotificationsSection({ profile, saveField }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>NOTIFICATIONS & DELIVERY</h3>
          <p className="text-[11px] text-white/50">How you receive alerts and leads</p>
        </div>
      </div>

      <div className="space-y-3">
        {NOTIFICATION_OPTIONS.map(opt => (
          <div key={opt.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
            <span className="text-sm text-white">{opt.label}</span>
            <Switch
              checked={!!profile?.[opt.key]}
              onCheckedChange={(val) => saveField(opt.key, val)}
            />
          </div>
        ))}

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-sm text-white">Agent Notifications</span>
          <select
            value={profile?.notification_method || "Email"}
            onChange={e => saveField("notification_method", e.target.value)}
            className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 text-white"
          >
            {DELIVERY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-sm text-white">Lead Delivery</span>
          <select
            value={profile?.lead_delivery || "Dashboard Only"}
            onChange={e => saveField("lead_delivery", e.target.value)}
            className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 text-white"
          >
            {LEAD_DELIVERY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}