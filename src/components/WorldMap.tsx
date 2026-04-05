import { factories } from "@/data/factories";

// Simple equirectangular projection
function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

const W = 800;
const H = 400;

export default function WorldMap() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = (W / 6) * i;
        return (
          <line
            key={`v${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={H}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = (H / 4) * i;
        return (
          <line
            key={`h${i}`}
            x1={0}
            y1={y}
            x2={W}
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Factory dots */}
      {factories.map((f) => {
        const { x, y } = project(f.lat, f.lng, W, H);
        return (
          <a key={f.id} href={`/factory/${f.slug}`}>
            <circle
              cx={x}
              cy={y}
              r={f.featured ? 6 : 4}
              fill={f.color}
              opacity={0.8}
            />
            <circle cx={x} cy={y} r={f.featured ? 10 : 7} fill={f.color} opacity={0.15} />
            <text
              x={x}
              y={y - 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="7"
              fontFamily="monospace"
            >
              {f.name.replace("⚡ ", "")}
            </text>
          </a>
        );
      })}
    </svg>
  );
}
