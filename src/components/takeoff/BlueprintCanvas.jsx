import { useRef, useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, MousePointer, RotateCcw, Tag, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ZONE_COLORS = [
  "#d4af37", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899",
  "#8b5cf6", "#14b8a6", "#f97316", "#ef4444", "#84cc16",
];

function polygonArea(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area / 2);
}

function polygonCentroid(pts) {
  let cx = 0, cy = 0;
  pts.forEach(p => { cx += p.x; cy += p.y; });
  return { x: cx / pts.length, y: cy / pts.length };
}

export default function BlueprintCanvas({ imageUrl, scaleFactor, onZonesChange, zones: externalZones }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState("draw"); // draw | select | delete
  const [zones, setZones] = useState(externalZones || []);
  const [currentPoly, setCurrentPoly] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgDimensions({ w: img.width, h: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Sync external zones
  useEffect(() => {
    if (externalZones) setZones(externalZones);
  }, [externalZones]);

  // Notify parent
  useEffect(() => {
    onZonesChange?.(zones);
  }, [zones]);

  // Canvas coordinate helpers
  const getCanvasPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!canvas || !ctx) return;

    const container = containerRef.current;
    canvas.width = container.clientWidth * 2;
    canvas.height = container.clientHeight * 2;
    ctx.scale(2, 2);
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw image
    if (imgRef.current && imgDimensions.w) {
      const scale = Math.min(cw / imgDimensions.w, ch / imgDimensions.h) * 0.95;
      const iw = imgDimensions.w * scale;
      const ih = imgDimensions.h * scale;
      const ix = (cw / zoom - iw) / 2;
      const iy = (ch / zoom - ih) / 2;
      ctx.drawImage(imgRef.current, ix, iy, iw, ih);
    }

    // Draw completed zones
    zones.forEach((zone, i) => {
      const color = ZONE_COLORS[i % ZONE_COLORS.length];
      ctx.beginPath();
      zone.points.forEach((p, j) => {
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = color + "30";
      ctx.fill();
      ctx.strokeStyle = selectedZone === i ? "#ffffff" : color;
      ctx.lineWidth = selectedZone === i ? 2.5 : 1.5;
      ctx.stroke();

      // Draw vertices
      zone.points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Label
      const c = polygonCentroid(zone.points);
      const pxArea = polygonArea(zone.points);
      const sqft = Math.round(pxArea * (scaleFactor || 1));
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText(zone.name || `Zone ${i + 1}`, c.x, c.y - 8);
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(`${sqft.toLocaleString()} sqft`, c.x, c.y + 8);
    });

    // Draw current polygon being drawn
    if (currentPoly.length > 0) {
      ctx.beginPath();
      currentPoly.forEach((p, j) => {
        if (j === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      currentPoly.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#d4af37";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    ctx.restore();
  }, [zones, currentPoly, pan, zoom, imgDimensions, scaleFactor, selectedZone]);

  useEffect(() => {
    const frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [draw]);

  // Click handler
  const handleClick = (e) => {
    if (e.button === 2) return; // ignore right click
    const pos = getCanvasPos(e);

    if (tool === "draw") {
      // Close polygon if clicking near first point
      if (currentPoly.length >= 3) {
        const first = currentPoly[0];
        const dist = Math.hypot(pos.x - first.x, pos.y - first.y);
        if (dist < 15 / zoom) {
          const newZone = {
            name: `Zone ${zones.length + 1}`,
            points: [...currentPoly],
            system: "Epoxy",
          };
          setZones(prev => [...prev, newZone]);
          setCurrentPoly([]);
          return;
        }
      }
      setCurrentPoly(prev => [...prev, pos]);
    } else if (tool === "select") {
      // Find clicked zone
      const clickedIdx = zones.findIndex(zone => {
        const canvas2d = document.createElement("canvas").getContext("2d");
        canvas2d.beginPath();
        zone.points.forEach((p, j) => {
          if (j === 0) canvas2d.moveTo(p.x, p.y);
          else canvas2d.lineTo(p.x, p.y);
        });
        canvas2d.closePath();
        return canvas2d.isPointInPath(pos.x, pos.y);
      });
      setSelectedZone(clickedIdx >= 0 ? clickedIdx : null);
      setEditingName(null);
    } else if (tool === "delete") {
      const clickedIdx = zones.findIndex(zone => {
        const canvas2d = document.createElement("canvas").getContext("2d");
        canvas2d.beginPath();
        zone.points.forEach((p, j) => {
          if (j === 0) canvas2d.moveTo(p.x, p.y);
          else canvas2d.lineTo(p.x, p.y);
        });
        canvas2d.closePath();
        return canvas2d.isPointInPath(pos.x, pos.y);
      });
      if (clickedIdx >= 0) {
        setZones(prev => prev.filter((_, i) => i !== clickedIdx));
        setSelectedZone(null);
      }
    }
  };

  // Pan with middle mouse or when no tool active
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    setPan(prev => ({
      x: prev.x + (e.clientX - lastMouse.current.x),
      y: prev.y + (e.clientY - lastMouse.current.y),
    }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { isDragging.current = false; };

  // Zoom with scroll
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(5, prev * delta)));
  };

  const undoLastPoint = () => {
    setCurrentPoly(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    setZones([]);
    setCurrentPoly([]);
    setSelectedZone(null);
  };

  const renameZone = (idx, name) => {
    setZones(prev => prev.map((z, i) => i === idx ? { ...z, name } : z));
  };

  const setZoneSystem = (idx, system) => {
    setZones(prev => prev.map((z, i) => i === idx ? { ...z, system } : z));
  };

  const totalSqft = zones.reduce((sum, z) => sum + Math.round(polygonArea(z.points) * (scaleFactor || 1)), 0);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {[
            { id: "draw", icon: Pencil, label: "Draw" },
            { id: "select", icon: MousePointer, label: "Select" },
            { id: "delete", icon: Trash2, label: "Delete" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setCurrentPoly([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tool === t.id ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <button onClick={undoLastPoint} disabled={currentPoly.length === 0}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-white/40"
          title="Undo last point"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={clearAll} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40" title="Clear all">
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="ml-auto flex items-center gap-2 text-xs text-white/50">
          <Ruler className="w-3.5 h-3.5" />
          <span className="font-bold text-primary">{totalSqft.toLocaleString()} sqft</span>
          <span>· {zones.length} zones</span>
        </div>
      </div>

      {/* Draw hint */}
      {tool === "draw" && (
        <p className="text-[11px] text-white/30 flex items-center gap-1">
          <Pencil className="w-3 h-3" /> Click to place points. Click first point to close polygon. Alt+drag or scroll to pan/zoom.
        </p>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full rounded-xl border border-white/10 bg-black/40 overflow-hidden"
        style={{ height: "clamp(300px, 55vh, 600px)" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={e => e.preventDefault()}
        />
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm pointer-events-none">
            Upload a blueprint to start drawing
          </div>
        )}
      </div>

      {/* Selected zone editor */}
      {selectedZone !== null && zones[selectedZone] && (
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-3">
          <Tag className="w-4 h-4 text-primary flex-shrink-0" />
          <Input
            value={zones[selectedZone].name}
            onChange={e => renameZone(selectedZone, e.target.value)}
            className="h-8 text-sm bg-white/5 border-white/10 w-40"
            placeholder="Zone name"
          />
          <select
            value={zones[selectedZone].system || "Epoxy"}
            onChange={e => setZoneSystem(selectedZone, e.target.value)}
            className="h-8 text-sm bg-white/5 border border-white/10 rounded-md px-2 text-white"
          >
            {["Epoxy", "Polished Concrete", "Metallic Epoxy", "Polyaspartic", "Polyurea", "Urethane", "Stained Concrete", "Decorative Concrete"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="text-xs text-white/50 ml-auto">
            {Math.round(polygonArea(zones[selectedZone].points) * (scaleFactor || 1)).toLocaleString()} sqft
          </span>
        </div>
      )}

      {/* Zone list */}
      {zones.length > 0 && (
        <div className="space-y-1.5">
          {zones.map((zone, i) => {
            const color = ZONE_COLORS[i % ZONE_COLORS.length];
            const sqft = Math.round(polygonArea(zone.points) * (scaleFactor || 1));
            return (
              <div key={i} onClick={() => { setSelectedZone(i); setTool("select"); }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedZone === i ? "border-white/30 bg-white/[0.06]" : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-white flex-1">{zone.name}</span>
                <span className="text-xs text-white/40">{zone.system}</span>
                <span className="text-xs font-bold text-primary">{sqft.toLocaleString()} sqft</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { polygonArea };