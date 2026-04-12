import { useEffect, useRef } from "react";

export default function PageHexGlow() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const ripples = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = document.body;
    const ctx = canvas.getContext("2d");
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

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

    const handleMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (ripples.current.length < 3) {
        ripples.current.push({
          x: e.clientX, y: e.clientY,
          radius: 0, maxRadius: 220, speed: 2.5, life: 1,
        });
      }
    };

    const handleClick = (e) => {
      ripples.current.push({
        x: e.clientX, y: e.clientY,
        radius: 0, maxRadius: 350, speed: 3.5, life: 1,
      });
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("click", handleClick);

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cols = Math.ceil(canvas.width / HEX_W) + 2;
      const rows = Math.ceil(canvas.height / (HEX_H * 0.5)) + 2;

      if (mx >= 0 && my >= 0) {
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
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}