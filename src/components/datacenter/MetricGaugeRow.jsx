import { useEffect, useRef } from "react";

function ArcGauge({ value, max = 100, label, sublabel, color, size = 80 }) {
  const canvasRef = useRef(null);
  const pct = Math.min(value / max, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const sweepAngle = endAngle - startAngle;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = "rgba(0,255,255,0.08)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();

    // Value arc
    if (pct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + sweepAngle * pct);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Center value
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * 0.22}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${value}${max === 100 ? "%" : ""}`, cx, cy - 2);

    // Label below value
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = `${size * 0.1}px monospace`;
    ctx.fillText(label, cx, cy + size * 0.18);
  }, [value, max, color, size, label, pct]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      {sublabel && <span className="text-[8px] font-mono text-white/30 tracking-widest mt-1">{sublabel}</span>}
    </div>
  );
}

function KPICard({ value, label, delta, color = "#00d4ff" }) {
  const formatted = typeof value === "number" && value >= 1000
    ? value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
    : value;

  return (
    <div className="flex flex-col items-center px-3 py-2">
      <span className="font-mono text-xl font-bold" style={{ color }}>{formatted}</span>
      <span className="text-[8px] font-mono text-white/40 tracking-widest mt-0.5 text-center">{label}</span>
      {delta !== undefined && (
        <span className={`text-[9px] font-mono mt-0.5 ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}
        </span>
      )}
    </div>
  );
}

export default function MetricGaugeRow({ stats }) {
  return (
    <div className="px-4 py-4 border-b border-cyan-900/30" style={{ background: "rgba(0,15,30,0.4)" }}>
      <div className="flex items-center gap-1 mb-3">
        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[9px] font-mono text-cyan-400/60 tracking-widest uppercase">System Diagnostics</span>
      </div>

      <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-2">
        {/* Gauges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArcGauge value={stats.systemHealth} label="INTEL" sublabel="DATA HEALTH" color="#06b6d4" size={72} />
          <ArcGauge value={stats.pipelineHealth} label="PIPELINE" sublabel="ACTIVE RATE" color="#d4af37" size={72} />
          <ArcGauge value={stats.conversionRate} label="CVR" sublabel="WIN RATE" color="#22c55e" size={72} />
          <ArcGauge value={stats.enrichmentRate} label="AI" sublabel="ENRICHMENT" color="#8b5cf6" size={72} />
        </div>

        {/* Divider */}
        <div className="w-px h-16 bg-cyan-900/30 flex-shrink-0 hidden md:block" />

        {/* KPI cards */}
        <div className="flex items-center gap-1 flex-shrink-0 overflow-x-auto scrollbar-hide">
          <KPICard value={stats.totalLeads} label="TOTAL LEADS" delta={stats.leadsThisWeek} color="#00d4ff" />
          <KPICard value={stats.hotLeads} label="HOT LEADS" color="#ef4444" />
          <KPICard value={stats.pipelineValue} label="PIPELINE" color="#d4af37" />
          <KPICard value={stats.activeJobs} label="ACTIVE JOBS" color="#22c55e" />
          <KPICard value={stats.activeGCs} label="ACTIVE GCs" color="#8b5cf6" />
        </div>
      </div>
    </div>
  );
}