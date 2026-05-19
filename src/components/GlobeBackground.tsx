"use client";

import { useEffect, useRef } from "react";
import { factories } from "@/data/factories";
import landData from "@/data/land.json";

function project(lat: number, lng: number, cx: number, cy: number, r: number, rot: number) {
  const lonRad = ((lng + rot) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(latRad) * Math.sin(lonRad),
    y: cy - r * Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lonRad),
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

export default function GlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 700 * dpr;
    canvas.height = 700 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = 350, cy = 350, r = 280;
    const polygons = landData as number[][][][];
    let animId: number;

    const siteColors = factories.map((f) => hexToRgb(f.color));

    const draw = () => {
      rotation.current += 0.1;
      ctx.clearRect(0, 0, 700, 700);

      // Globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Land polygons
      for (const polygon of polygons) {
        for (const ring of polygon) {
          ctx.beginPath();
          let penDown = false;
          let visCount = 0;

          for (const [lng, lat] of ring) {
            const p = project(lat, lng, cx, cy, r, rotation.current);
            if (p.z > 0) {
              visCount++;
              if (!penDown) { ctx.moveTo(p.x, p.y); penDown = true; }
              else ctx.lineTo(p.x, p.y);
            } else {
              penDown = false;
            }
          }

          if (visCount > ring.length * 0.6) {
            ctx.closePath();
            ctx.fillStyle = "rgba(0,0,0,0.04)";
            ctx.fill();
          }
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Site dots + names (company-colored)
      ctx.font = "7px system-ui, sans-serif";
      ctx.textAlign = "left";
      for (let i = 0; i < factories.length; i++) {
        const f = factories[i];
        const p = project(f.lat, f.lng, cx, cy, r, rotation.current);
        if (p.z <= 0) continue;
        const { r: cr, g: cg, b: cb } = siteColors[i];

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.15 * p.z})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.85 * p.z})`;
        ctx.fill();

        // Label
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.45 * p.z})`;
        ctx.fillText(f.name, p.x + 5, p.y + 2);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: -1 }}>
      <canvas ref={canvasRef} style={{ width: 700, height: 700, pointerEvents: "none" }} />
    </div>
  );
}
