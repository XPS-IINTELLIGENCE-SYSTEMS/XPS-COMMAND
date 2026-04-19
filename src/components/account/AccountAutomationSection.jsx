import { Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const FREQ_OPTIONS = ["Manual", "Daily", "Weekly", "Bi-Weekly"];

export default function AccountAutomationSection({ profile, saveField }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold xps-gold-slow-shimmer" style={{ fontFamily: "'Montserrat', sans-serif" }}>AUTOMATION</h3>
          <p className="text-[11px] text-white/50">Auto-actions and scrape scheduling</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <div>
            <span className="text-sm text-white block">Auto Follow-Up</span>
            <span className="text-[11px] text-white/40">Automatically follow up on qualified leads</span>
          </div>
          <Switch checked={!!profile?.auto_follow_up} onCheckedChange={v => saveField("auto_follow_up", v)} />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <div>
            <span className="text-sm text-white block">Auto Proposals</span>
            <span className="text-[11px] text-white/40">Generate proposals for high-score leads</span>
          </div>
          <Switch checked={!!profile?.auto_proposal} onCheckedChange={v => saveField("auto_proposal", v)} />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <span className="text-sm text-white">Scrape Frequency</span>
          <select
            value={profile?.scrape_frequency || "Manual"}
            onChange={e => saveField("scrape_frequency", e.target.value)}
            className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 text-white"
          >
            {FREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-border/30">
          <div>
            <span className="text-sm text-white block">Compact Mode</span>
            <span className="text-[11px] text-white/40">Denser UI layout</span>
          </div>
          <Switch checked={!!profile?.compact_mode} onCheckedChange={v => saveField("compact_mode", v)} />
        </div>
      </div>
    </div>
  );
}