import { useEffect, useRef } from "react";

function ArcGauge({ value, max = 100, label, sublabel, size = 76 }) {
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

    const cx = size / 2, cy = size / 2, r = size / 2 - 7;
    const startAngle = 0.75 * Math.PI, endAngle = 2.25 * Math.PI;
    const sweep = endAngle - startAngle;

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = "rgba(212,175,55,0.06)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    // Value
    if (pct > 0) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#b8860b");
      grad.addColorStop(0.5, "#d4af37");
      grad.addColorStop(1, "#f5e6a3");
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep * pct);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.shadowColor = "#d4af37";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Center value
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * 0.22}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${value}%`, cx, cy - 1);

    // Label
    ctx.fillStyle = "rgba(212,175,55,0.4)";
    ctx.font = `bold ${size * 0.09}px monospace`;
    ctx.fillText(label, cx, cy + size * 0.18);
  }, [value, max, size, label, pct]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      {sublabel && <span className="text-[7px] font-mono text-white/20 tracking-[0.2em] mt-1">{sublabel}</span>}
    </div>
  );
}

function KPICard({ value, label, delta }) {
  const formatted = typeof value === "number" && value >= 1000
    ? value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `${(value / 1000).toFixed(0)}K`
    : value;

  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.06)" }}>
      <span className="font-mono text-lg font-bold text-[#d4af37]">{formatted}</span>
      <span className="text-[7px] font-mono text-white/25 tracking-[0.2em] mt-0.5 text-center">{label}</span>
      {delta !== undefined && delta > 0 && (
        <span className="text-[8px] font-mono mt-0.5 text-[#22c55e]/70">▲ {delta} this week</span>
      )}
    </div>
  );
}

export default function MetricGaugeRow({ stats }) {
  return (
    <div className="px-4 py-4 dc-divider-b" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="flex items-center gap-1 mb-3">
        <div className="w-1 h-1 rounded-full bg-[#d4af37]/60 animate-pulse" />
        <span className="text-[8px] font-mono text-[#d4af37]/40 tracking-[0.3em] uppercase">System Diagnostics</span>
      </div>

      <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <ArcGauge value={stats.systemHealth} label="INTEL" sublabel="DATA HEALTH" />
          <ArcGauge value={stats.pipelineHealth} label="PIPELINE" sublabel="ACTIVE RATE" />
          <ArcGauge value={stats.conversionRate} label="CVR" sublabel="WIN RATE" />
          <ArcGauge value={stats.enrichmentRate} label="AI" sublabel="ENRICHMENT" />
        </div>

        <div className="w-px h-14 flex-shrink-0 hidden md:block" style={{ background: "rgba(212,175,55,0.1)" }} />

        <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto scrollbar-hide">
          <KPICard value={stats.totalLeads} label="TOTAL LEADS" delta={stats.leadsThisWeek} />
          <KPICard value={stats.hotLeads} label="HOT LEADS" />
          <KPICard value={stats.pipelineValue} label="PIPELINE VALUE" />
          <KPICard value={stats.activeJobs} label="ACTIVE JOBS" />
          <KPICard value={stats.activeGCs} label="ACTIVE GCs" />
        </div>
      </div>
    </div>
  );
}