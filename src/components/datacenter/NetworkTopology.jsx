import { useEffect, useRef, useState } from "react";

const NODES = [
  { id: "ops", label: "OPS DB", x: 0.5, y: 0.18, color: "#d4af37", size: 18 },
  { id: "intel", label: "INTEL CORE", x: 0.5, y: 0.82, color: "#06b6d4", size: 18 },
  { id: "leads", label: "LEADS", x: 0.15, y: 0.35, color: "#22c55e", size: 12 },
  { id: "jobs", label: "JOBS", x: 0.85, y: 0.35, color: "#f59e0b", size: 12 },
  { id: "gcs", label: "GCs", x: 0.15, y: 0.65, color: "#8b5cf6", size: 12 },
  { id: "scraper", label: "SCRAPERS", x: 0.85, y: 0.65, color: "#ef4444", size: 12 },
  { id: "ai", label: "AI ENGINE", x: 0.5, y: 0.5, color: "#ec4899", size: 14 },
  { id: "outreach", label: "OUTREACH", x: 0.28, y: 0.5, color: "#14b8a6", size: 10 },
  { id: "bids", label: "BIDS", x: 0.72, y: 0.5, color: "#f97316", size: 10 },
];

const LINKS = [
  { from: "ops", to: "ai" }, { from: "intel", to: "ai" },
  { from: "leads", to: "ops" }, { from: "jobs", to: "ops" },
  { from: "gcs", to: "ops" }, { from: "scraper", to: "intel" },
  { from: "ai", to: "leads" }, { from: "ai", to: "jobs" },
  { from: "ai", to: "gcs" }, { from: "ai", to: "outreach" },
  { from: "ai", to: "bids" }, { from: "intel", to: "leads" },
  { from: "outreach", to: "leads" }, { from: "bids", to: "jobs" },
];

export default function NetworkTopology({ stats, onOpenTool }) {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    let pts = LINKS.map((link, i) => ({
      linkIdx: i,
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      color: NODES.find(n => n.id === link.from)?.color || "#06b6d4",
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw links
      LINKS.forEach(link => {
        const from = NODES.find(n => n.id === link.from);
        const to = NODES.find(n => n.id === link.to);
        if (!from || !to) return;
        ctx.beginPath();
        ctx.moveTo(from.x * w, from.y * h);
        ctx.lineTo(to.x * w, to.y * h);
        ctx.strokeStyle = "rgba(0,180,220,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw particles
      pts.forEach(p => {
        const link = LINKS[p.linkIdx];
        const from = NODES.find(n => n.id === link.from);
        const to = NODES.find(n => n.id === link.to);
        if (!from || !to) return;
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const x = from.x * w + (to.x * w - from.x * w) * p.progress;
        const y = from.y * h + (to.y * h - from.y * h) * p.progress;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw nodes
      NODES.forEach(node => {
        const nx = node.x * w;
        const ny = node.y * h;

        // Glow ring
        ctx.beginPath();
        ctx.arc(nx, ny, node.size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = node.color + "30";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "18";
        ctx.fill();
        ctx.strokeStyle = node.color + "60";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText(node.label, nx, ny + node.size + 12);
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center gap-1 mb-2">
        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[9px] font-mono text-cyan-400/60 tracking-widest uppercase">Network Topology</span>
      </div>
      <div className="relative rounded-xl overflow-hidden" style={{ background: "rgba(0,10,20,0.5)", border: "1px solid rgba(0,180,220,0.1)" }}>
        <canvas ref={canvasRef} className="w-full" style={{ height: 240 }} />
      </div>
    </div>
  );
}