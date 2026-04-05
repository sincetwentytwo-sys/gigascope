"use client";

import { useEffect, useRef } from "react";
import { factories } from "@/data/factories";

function projectToGlobe(lat: number, lng: number, cx: number, cy: number, r: number, rotY: number) {
  const lonRad = ((lng + rotY) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const x = cx + r * Math.cos(latRad) * Math.sin(lonRad);
  const y = cy - r * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lonRad);
  return { x, y, visible: z > 0 };
}

export default function GlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 700 * dpr;
      canvas.height = 700 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const cx = 350;
    const cy = 350;
    const r = 280;

    let animId: number;

    const draw = () => {
      rotation.current += 0.15;

      ctx.clearRect(0, 0, 700, 700);
      const color = "rgba(0, 0, 0, 0.15)";
      const faintColor = "rgba(0, 0, 0, 0.06)";

      // Globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Latitude lines
      for (const lat of [-60, -30, 0, 30, 60]) {
        const latR = r * Math.cos((lat * Math.PI) / 180);
        const latY = cy - r * Math.sin((lat * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(cx, latY, latR, latR * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = faintColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Longitude lines (rotating)
      for (let lng = 0; lng < 360; lng += 30) {
        const adjustedLng = lng + rotation.current;
        const pts: { x: number; y: number; visible: boolean }[] = [];
        for (let lat = -90; lat <= 90; lat += 5) {
          pts.push(projectToGlobe(lat, adjustedLng, cx, cy, r, 0));
        }
        ctx.beginPath();
        let started = false;
        for (const pt of pts) {
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else ctx.lineTo(pt.x, pt.y);
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = faintColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Factory dots
      for (const f of factories) {
        const { x, y, visible } = projectToGlobe(f.lat, f.lng, cx, cy, r, rotation.current);
        if (!visible) continue;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: -1 }}>
      <canvas
        ref={canvasRef}
        style={{ width: 700, height: 700, pointerEvents: "none" }}
      />
    </div>
  );
}
