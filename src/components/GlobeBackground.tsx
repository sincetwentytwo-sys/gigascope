"use client";

import { useEffect, useRef } from "react";
import { factories } from "@/data/factories";

// More accurate simplified coastlines (~40pts per continent)
const CONTINENTS: [number, number][][] = [
  // North America (lat, lng)
  [[60,-140],[65,-168],[63,-165],[55,-163],[55,-155],[20,-155],[33,-118],[35,-121],[40,-124],[46,-124],[49,-125],[55,-130],[58,-135],[60,-140]],
  [[49,-125],[49,-67]],
  [[49,-67],[47,-60],[45,-61],[44,-64],[43,-66],[42,-70],[40,-74],[35,-75],[30,-81],[25,-80],[25,-82],[30,-88],[29,-90],[28,-96],[26,-97],[22,-97],[18,-95],[15,-88],[10,-84],[8,-77],[8,-75],[10,-62],[12,-61],[18,-63],[19,-68],[20,-73],[21,-76],[25,-78],[25,-80]],
  [[50,-55],[47,-53],[45,-56],[44,-59],[47,-60],[49,-67],[52,-56],[55,-58],[60,-64],[62,-72],[65,-70],[70,-72],[75,-80],[80,-85],[75,-95],[70,-100],[68,-110],[70,-130],[65,-140],[60,-140]],
  // South America
  [[12,-70],[10,-75],[5,-77],[0,-80],[-5,-81],[-10,-78],[-15,-76],[-20,-70],[-25,-70],[-30,-71],[-35,-72],[-40,-72],[-45,-74],[-50,-74],[-53,-71],[-55,-68],[-55,-65],[-52,-60],[-45,-58],[-40,-55],[-35,-48],[-30,-42],[-25,-35],[-22,-40],[-15,-39],[-10,-37],[-5,-35],[0,-50],[5,-53],[8,-60],[10,-62],[12,-62],[12,-70]],
  // Europe
  [[36,-6],[37,0],[38,5],[41,2],[43,3],[44,8],[44,12],[42,15],[40,18],[38,22],[35,25],[37,27],[39,26],[41,29],[42,28],[43,40],[45,30],[46,15],[48,2],[49,-4],[51,1],[52,5],[54,10],[55,12],[56,10],[58,12],[60,5],[62,5],[64,10],[66,14],[68,16],[70,20],[70,28],[69,30],[65,28],[60,30],[58,28],[55,20],[54,18],[54,14],[53,8],[51,4],[49,0],[47,-2],[44,-2],[43,-8],[37,-9],[36,-6]],
  // Africa
  [[35,-5],[37,10],[33,12],[32,25],[30,32],[22,37],[15,42],[12,44],[10,42],[5,42],[0,42],[-5,40],[-10,40],[-15,35],[-25,33],[-30,31],[-34,27],[-35,20],[-34,18],[-30,15],[-25,15],[-20,12],[-15,12],[-10,14],[-5,10],[0,10],[5,1],[5,-5],[7,-5],[10,0],[8,5],[4,10],[0,10],[-5,12],[-10,8],[-5,5],[5,0],[5,-10],[10,-15],[15,-17],[20,-17],[25,-15],[35,-5]],
  // Asia
  [[42,30],[45,40],[50,53],[55,55],[60,60],[65,70],[70,70],[73,80],[75,100],[70,135],[65,140],[60,145],[55,140],[50,135],[45,140],[40,130],[35,130],[33,126],[35,132],[30,122],[25,120],[22,114],[20,110],[10,106],[5,104],[0,105],[-8,110],[-8,115],[-5,120],[0,118],[5,118],[10,120],[15,110],[18,106],[22,108],[22,114]],
  [[42,30],[40,45],[35,52],[30,50],[25,57],[20,58],[18,55],[15,50],[12,45],[10,42]],
  [[30,48],[25,55],[25,62],[20,63],[15,55],[10,52],[8,45]],
  // India
  [[28,68],[25,72],[22,70],[20,73],[15,74],[10,76],[8,77],[10,80],[13,80],[15,78],[18,73],[22,88],[23,90],[25,90],[28,88],[30,82],[30,78],[28,68]],
  // Australia
  [[-12,130],[-14,127],[-22,114],[-32,115],[-35,117],[-35,137],[-38,145],[-38,148],[-35,151],[-33,152],[-28,153],[-25,152],[-20,149],[-17,146],[-15,145],[-13,136],[-12,130]],
];

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

      // Continent outlines
      for (const coast of CONTINENTS) {
        ctx.beginPath();
        let penDown = false;
        for (const [lat, lng] of coast) {
          const p = project(lat, lng, cx, cy, r, rotation.current);
          if (p.z > 0) {
            if (!penDown) { ctx.moveTo(p.x, p.y); penDown = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            penDown = false;
          }
        }
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Region labels
      const labels: [string, number, number][] = [
        ["N. America", 45, -100],
        ["S. America", -15, -55],
        ["Europe", 50, 15],
        ["Africa", 5, 20],
        ["Asia", 45, 80],
        ["Australia", -25, 135],
      ];

      ctx.font = "9px system-ui, sans-serif";
      ctx.textAlign = "center";
      for (const [name, lat, lng] of labels) {
        const p = project(lat, lng, cx, cy, r, rotation.current);
        if (p.z <= 0.3) continue;
        ctx.fillStyle = `rgba(0,0,0,${0.18 * p.z})`;
        ctx.fillText(name, p.x, p.y);
      }

      // Factory dots + labels
      for (const f of factories) {
        const p = project(f.lat, f.lng, cx, cy, r, rotation.current);
        if (p.z <= 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${0.3 * p.z})`;
        ctx.fill();

        // Factory name
        ctx.font = "7px system-ui, sans-serif";
        ctx.textAlign = "left";
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
