import { useState, useEffect } from "react";
import { Shield, Wifi, Cpu, HardDrive, Activity, Hexagon } from "lucide-react";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = String(time.getMilliseconds()).padStart(3, "0").slice(0, 2);
  return (
    <span className="font-mono text-[11px] tracking-wider">
      <span className="text-[#d4af37]">{time.toLocaleTimeString("en-US", { hour12: false })}</span>
      <span className="text-white/20">.{ms}</span>
    </span>
  );
}

const STATUS_ITEMS = [
  { icon: Shield, label: "FIREWALL", status: "ACTIVE", ok: true },
  { icon: Wifi, label: "NETWORK", status: "ONLINE", ok: true },
  { icon: Cpu, label: "AI ENGINE", status: "RUNNING", ok: true },
  { icon: HardDrive, label: "DATA BANKS", status: "SYNCED", ok: true },
  { icon: Activity, label: "PIPELINE", status: "ACTIVE", ok: true },
];

export default function SystemStatusBar({ stats }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 dc-divider-b" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="flex items-center gap-3">
        <Hexagon className="w-4 h-4 text-[#d4af37]" />
        <span className="font-mono text-[12px] font-bold tracking-[0.2em] text-[#d4af37]">XPS COMMAND CENTER</span>
        <div className="hidden sm:flex items-center gap-1 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[8px] font-mono tracking-[0.25em] text-[#22c55e]/80">OPERATIONAL</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4">
        {STATUS_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-1.5">
              <Icon className="w-3 h-3 text-[#d4af37]/60" />
              <span className="text-[7px] font-mono text-white/25 tracking-[0.2em]">{item.label}</span>
              <span className="text-[7px] font-mono tracking-[0.2em] text-[#22c55e]/70">{item.status}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <LiveClock />
        <div className="text-[8px] font-mono text-white/20 tracking-[0.2em] hidden sm:block">
          {stats.totalLeads + stats.totalJobs + stats.totalIntel} REC
        </div>
      </div>
    </div>
  );
}