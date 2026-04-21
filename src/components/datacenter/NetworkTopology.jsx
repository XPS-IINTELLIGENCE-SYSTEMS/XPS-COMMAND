import { useEffect, useRef } from "react";

const NODES = [
  { id: "ops", label: "OPS DB", x: 0.5, y: 0.15, size: 20 },
  { id: "intel", label: "INTEL CORE", x: 0.5, y: 0.85, size: 20 },
  { id: "leads", label: "LEADS", x: 0.12, y: 0.35, size: 13 },
  { id: "jobs", label: "JOBS", x: 0.88, y: 0.35, size: 13 },
  { id: "gcs", label: "GCs", x: 0.12, y: 0.65, size: 13 },
  { id: "scraper", label: "SCRAPERS", x: 0.88, y: 0.65, size: 13 },
  { id: "ai", label: "AI ENGINE", x: 0.5, y: 0.5, size: 16 },
  { id: "outreach", label: "OUTREACH", x: 0.3, y: 0.5, size: 11 },
  { id: "bids", label: "BIDS", x: 0.7, y: 0.5, size: 11 },
];

const LINKS = [
  ["ops", "ai"], ["intel", "ai"], ["leads", "ops"], ["jobs", "ops"],
  ["gcs", "ops"], ["scraper", "intel"], ["ai", "leads"], ["ai", "jobs"],
  ["ai", "gcs"], ["ai", "outreach"], ["ai", "bids"], ["intel", "leads"],
  ["outreach", "leads"], ["bids", "jobs"],
];

export default function NetworkTopology({ stats, onOpenTool }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const particles = LINKS.map(() => ({
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
    }));

    const gold = "#d4af37";
    const goldDim = "rgba(212,175,55,";

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Links
      LINKS.forEach(([fid, tid]) => {
        const f = NODES.find(n => n.id === fid);
        const t = NODES.find(n => n.id === tid);
        ctx.beginPath();
        ctx.moveTo(f.x * w, f.y * h);
        ctx.lineTo(t.x * w, t.y * h);
        ctx.strokeStyle = goldDim + "0.06)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Particles
      particles.forEach((p, i) => {
        const [fid, tid] = LINKS[i];
        const f = NODES.find(n => n.id === fid);
        const t = NODES.find(n => n.id === tid);
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const x = f.x * w + (t.x * w - f.x * w) * p.progress;
        const y = f.y * h + (t.y * h - f.y * h) * p.progress;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gold;
        ctx.shadowColor = gold;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Nodes
      NODES.forEach(node => {
        const nx = node.x * w, ny = node.y * h;

        // Hex-shaped node (simplified as circle with glow)
        ctx.beginPath();
        ctx.arc(nx, ny, node.size + 3, 0, Math.PI * 2);
        ctx.strokeStyle = goldDim + "0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = goldDim + "0.04)";
        ctx.fill();
        ctx.strokeStyle = goldDim + "0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gold;
        ctx.shadowColor = gold;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = "center";
        ctx.fillText(node.label, nx, ny + node.size + 11);
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center gap-1 mb-2">
        <div className="w-1 h-1 rounded-full bg-[#d4af37]/60 animate-pulse" />
        <span className="text-[8px] font-mono text-[#d4af37]/40 tracking-[0.3em] uppercase">Network Topology</span>
      </div>
      <div className="dc-inner-panel rounded-xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full" style={{ height: 240 }} />
      </div>
    </div>
  );
}