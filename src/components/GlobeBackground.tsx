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

      // Factory dots + names
      ctx.font = "7px system-ui, sans-serif";
      ctx.textAlign = "left";
      for (const f of factories) {
        const p = project(f.lat, f.lng, cx, cy, r, rotation.current);
        if (p.z <= 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${0.3 * p.z})`;
        ctx.fill();
        ctx.fillStyle = `rgba(0,0,0,${0.2 * p.z})`;
        ctx.fillText(f.name.replace("\u26a1 ", ""), p.x + 5, p.y + 2);
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
