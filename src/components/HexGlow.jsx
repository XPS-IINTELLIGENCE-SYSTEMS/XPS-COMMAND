import { useEffect, useRef } from "react";

export default function HexGlow() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const ripples = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let running = true;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // Hex grid params (match CSS: 56px wide, 100px tall)
    const HEX_W = 56;
    const HEX_H = 100;

    const getHexCenter = (col, row) => {
      const x = col * HEX_W + (row % 2 === 1 ? HEX_W / 2 : 0);
      const y = row * (HEX_H * 0.5);
      return { x, y };
    };

    const drawHex = (cx, cy, alpha, color) => {
      const r = 28;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = cx + r * Math.cos(angle);
        const hy = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      // Spawn a ripple on move (throttled by existing ripples)
      if (ripples.current.length < 3) {
        ripples.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          radius: 0,
          maxRadius: 220,
          speed: 2.5,
          life: 1,
        });
      }
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.current.push({
        x, y,
        radius: 0,
        maxRadius: 350,
        speed: 3.5,
        life: 1,
      });
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("click", handleClick);

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw proximity glow on hex vertices near mouse
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
              // Inner gold glow for very close hexes
              if (dist < 50) {
                const goldAlpha = Math.max(0, 1 - dist / 50) * 0.35;
                drawHex(x, y, goldAlpha, "rgba(212, 175, 55, 1)");
              }
            }
          }
        }
      }

      // Draw ripples (lightning sprawl)
      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const rip = ripples.current[i];
        rip.radius += rip.speed;
        rip.life = Math.max(0, 1 - rip.radius / rip.maxRadius);

        if (rip.life <= 0) {
          ripples.current.splice(i, 1);
          continue;
        }

        const cols = Math.ceil(canvas.width / HEX_W) + 2;
        const rows = Math.ceil(canvas.height / (HEX_H * 0.5)) + 2;

        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            const { x, y } = getHexCenter(col, row);
            const dist = Math.hypot(x - rip.x, y - rip.y);
            // Ring effect: only light up hexes near the ripple edge
            const ringDist = Math.abs(dist - rip.radius);
            if (ringDist < 30) {
              const ringAlpha = Math.max(0, 1 - ringDist / 30) * rip.life * 0.5;
              // Mix silver and gold
              const goldMix = Math.max(0, 1 - ringDist / 15) * rip.life;
              if (goldMix > 0.1) {
                drawHex(x, y, goldMix * 0.4, "rgba(212, 175, 55, 1)");
              }
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
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("click", handleClick);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1] pointer-events-auto"
      style={{ mixBlendMode: "screen" }}
    />
  );
}