import { useState, useEffect } from "react";
import { Shield, Wifi, Cpu, HardDrive, Activity, Zap } from "lucide-react";

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-[11px] text-cyan-300 tracking-wider">
      {time.toLocaleTimeString("en-US", { hour12: false })}
      <span className="text-cyan-500/50 ml-1">.{String(time.getMilliseconds()).padStart(3, "0").slice(0, 2)}</span>
    </span>
  );
}

const STATUS_ITEMS = [
  { icon: Shield, label: "FIREWALL", status: "ACTIVE", color: "#22c55e" },
  { icon: Wifi, label: "NETWORK", status: "ONLINE", color: "#22c55e" },
  { icon: Cpu, label: "AI ENGINE", status: "RUNNING", color: "#06b6d4" },
  { icon: HardDrive, label: "DATA BANKS", status: "SYNCED", color: "#22c55e" },
  { icon: Activity, label: "PIPELINE", status: "ACTIVE", color: "#d4af37" },
];

export default function SystemStatusBar({ stats }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-900/30" style={{ background: "rgba(0,20,40,0.6)" }}>
      {/* Left: system identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-[13px] font-bold tracking-wider" style={{ color: "#00d4ff" }}>XPS COMMAND CENTER</span>
        </div>
        <div className="hidden sm:flex items-center gap-0.5 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-green-400 font-mono tracking-widest">OPERATIONAL</span>
        </div>
      </div>

      {/* Center: status indicators */}
      <div className="hidden md:flex items-center gap-4">
        {STATUS_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-1.5">
              <Icon className="w-3 h-3" style={{ color: item.color }} />
              <span className="text-[8px] font-mono text-white/40 tracking-widest">{item.label}</span>
              <span className="text-[8px] font-mono tracking-widest" style={{ color: item.color }}>{item.status}</span>
            </div>
          );
        })}
      </div>

      {/* Right: clock */}
      <div className="flex items-center gap-3">
        <LiveClock />
        <div className="text-[9px] font-mono text-white/30 tracking-widest hidden sm:block">
          {stats.totalLeads + stats.totalJobs + stats.totalIntel} RECORDS
        </div>
      </div>
    </div>
  );
}