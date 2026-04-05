"use client";

import { useEffect, useRef } from "react";
import { factories } from "@/data/factories";

// Simplified continent outlines (lat, lng pairs)
const CONTINENTS: [number, number][][] = [
  // North America
  [[-10,80],[-20,70],[-30,60],[-45,55],[-50,60],[-60,65],[-55,72],[-70,75],[-80,70],[-65,60],[-80,50],[-90,48],[-100,50],[-105,40],[-120,35],[-125,40],[-125,50],[-140,60],[-165,62],[-168,55],[-155,20],[-115,30],[-105,25],[-100,28],[-95,18],[-90,15],[-85,10],[-80,8],[-75,10],[-60,10],[-60,15],[-65,18],[-70,20],[-65,45],[-55,47],[-45,50],[-10,80]].map(([lng,lat]) => [lat,lng] as [number,number]),
  // South America
  [[-80,10],[-75,5],[-70,-5],[-75,-15],[-70,-25],[-65,-35],[-68,-45],[-73,-50],[-75,-53],[-70,-55],[-65,-55],[-55,-50],[-50,-30],[-45,-23],[-35,-10],[-35,-3],[-50,0],[-55,5],[-60,8],[-65,10],[-75,10],[-80,10]].map(([lng,lat]) => [lat,lng] as [number,number]),
  // Europe
  [[0,35],[0,40],[-5,43],[0,47],[5,44],[10,45],[15,45],[20,40],[25,37],[28,41],[30,45],[25,48],[15,48],[10,55],[12,57],[20,55],[25,60],[30,60],[30,70],[25,72],[15,68],[5,62],[0,50],[0,35]].map(([lng,lat]) => [lat,lng] as [number,number]),
  // Africa
  [[-15,35],[-5,36],[10,37],[15,32],[25,32],[33,30],[35,12],[42,12],[50,3],[42,-5],[40,-15],[35,-25],[30,-34],[20,-35],[15,-30],[12,-17],[8,-5],[-5,5],[-10,5],[-17,14],[-15,28],[-15,35]].map(([lng,lat]) => [lat,lng] as [number,number]),
  // Asia
  [[30,45],[40,42],[45,40],[50,37],[55,25],[60,25],[70,20],[75,15],[80,10],[85,22],[90,22],[95,16],[100,14],[105,10],[110,20],[120,23],[120,30],[125,35],[130,35],[135,35],[140,40],[145,45],[150,60],[160,65],[170,65],[180,68],[170,70],[140,55],[120,55],[105,55],[90,50],[80,55],[70,55],[60,55],[50,55],[40,50],[30,45]].map(([lng,lat]) => [lat,lng] as [number,number]),
  // Australia
  [[115,-35],[115,-25],[120,-15],[130,-12],[140,-12],[150,-15],[153,-25],[150,-38],[140,-38],[130,-32],[115,-35]].map(([lng,lat]) => [lat,lng] as [number,number]),
];

function project(lat: number, lng: number, cx: number, cy: number, r: number, rot: number) {
  const lonRad = ((lng + rot) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const x = cx + r * Math.cos(latRad) * Math.sin(lonRad);
  const y = cy - r * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lonRad);
  return { x, y, z };
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
    let animId: number;

    const draw = () => {
      rotation.current += 0.12;
      ctx.clearRect(0, 0, 700, 700);

      // Globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Latitude lines
      for (const lat of [-60, -30, 0, 30, 60]) {
        const lr = r * Math.cos((lat * Math.PI) / 180);
        const ly = cy - r * Math.sin((lat * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(cx, ly, lr, lr * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,0.04)";
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Continents
      for (const continent of CONTINENTS) {
        ctx.beginPath();
        let started = false;
        let allHidden = true;
        for (const [lat, lng] of continent) {
          const p = project(lat, lng, cx, cy, r, rotation.current);
          if (p.z > -0.1) {
            allHidden = false;
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            started = false;
          }
        }
        if (!allHidden) {
          ctx.fillStyle = "rgba(0,0,0,0.07)";
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.12)";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Factory dots
      for (const f of factories) {
        const p = project(f.lat, f.lng, cx, cy, r, rotation.current);
        if (p.z <= 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
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
