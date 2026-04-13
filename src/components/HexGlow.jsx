import { useEffect, useRef } from "react";

export default function HexGlow() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const ripples = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    let running = true;

    const resize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const HEX_W = 56;
    const HEX_H = 100;

    const getHexCenter = (col, row) => ({
      x: col * HEX_W + (row % 2 === 1 ? HEX_W / 2 : 0),
      y: row * (HEX_H * 0.5),
    });

    const drawHex = (cx, cy, alpha, color) => {
      const r = 28;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = cx + r * Math.cos(angle);
        const hy = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const updatePosition = (x, y) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current = { x: x - rect.left, y: y - rect.top };
      if (ripples.current.length < 3) {
        ripples.current.push({
          x: mouseRef.current.x, y: mouseRef.current.y,
          radius: 0, maxRadius: 220, speed: 2.5, life: 1,
        });
      }
    };

    const addRipple = (x, y) => {
      const rect = parent.getBoundingClientRect();
      ripples.current.push({
        x: x - rect.left, y: y - rect.top,
        radius: 0, maxRadius: 350, speed: 3.5, life: 1,
      });
    };

    const handleMove = (e) => updatePosition(e.clientX, e.clientY);
    const handleClick = (e) => addRipple(e.clientX, e.clientY);

    // Touch support for mobile
    const handleTouchMove = (e) => {
      const t = e.touches[0];
      if (t) updatePosition(t.clientX, t.clientY);
    };
    const handleTouchStart = (e) => {
      const t = e.touches[0];
      if (t) {
        updatePosition(t.clientX, t.clientY);
        addRipple(t.clientX, t.clientY);
      }
    };

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("click", handleClick);
    parent.addEventListener("touchmove", handleTouchMove, { passive: true });
    parent.addEventListener("touchstart", handleTouchStart, { passive: true });

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mx >= 0 && my >= 0) {
        const cols = Math.ceil(canvas.width / HEX_W) + 2;
        const rows = Math.ceil(canvas.height / (HEX_H * 0.5)) + 2;
        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            const { x, y } = getHexCenter(col, row);
            const dist = Math.hypot(x - mx, y - my);
            if (dist < 120) {
              const alpha = Math.max(0, 1 - dist / 120) * 0.4;
              drawHex(x, y, alpha, "rgba(192, 192, 192, 1)");
              if (dist < 50) {
                const goldAlpha = Math.max(0, 1 - dist / 50) * 0.35;
                drawHex(x, y, goldAlpha, "rgba(212, 175, 55, 1)");
              }
            }
          }
        }
      }

      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const rip = ripples.current[i];
        rip.radius += rip.speed;
        rip.life = Math.max(0, 1 - rip.radius / rip.maxRadius);
        if (rip.life <= 0) { ripples.current.splice(i, 1); continue; }
        const cols = Math.ceil(canvas.width / HEX_W) + 2;
        const rows = Math.ceil(canvas.height / (HEX_H * 0.5)) + 2;
        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            const { x, y } = getHexCenter(col, row);
            const dist = Math.hypot(x - rip.x, y - rip.y);
            const ringDist = Math.abs(dist - rip.radius);
            if (ringDist < 30) {
              const ringAlpha = Math.max(0, 1 - ringDist / 30) * rip.life * 0.5;
              const goldMix = Math.max(0, 1 - ringDist / 15) * rip.life;
              if (goldMix > 0.1) drawHex(x, y, goldMix * 0.4, "rgba(212, 175, 55, 1)");
              drawHex(x, y, ringAlpha, "rgba(200, 200, 210, 1)");
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("click", handleClick);
      parent.removeEventListener("touchmove", handleTouchMove);
      parent.removeEventListener("touchstart", handleTouchStart);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}