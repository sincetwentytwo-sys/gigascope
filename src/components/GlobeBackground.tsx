import { factories } from "@/data/factories";

// Equirectangular projection onto a circle
function projectToGlobe(lat: number, lng: number, cx: number, cy: number, r: number, rotation: number) {
  const lonRad = ((lng + rotation) * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const x = cx + r * Math.cos(latRad) * Math.sin(lonRad);
  const y = cy - r * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lonRad);
  return { x, y, visible: z > 0 };
}

export default function GlobeBackground() {
  const cx = 250;
  const cy = 250;
  const r = 200;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] opacity-[0.06]">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full animate-[spin_120s_linear_infinite]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe outline */}
          <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth="0.8" />

          {/* Latitude lines */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const latR = r * Math.cos((lat * Math.PI) / 180);
            const latY = cy - r * Math.sin((lat * Math.PI) / 180);
            return (
              <ellipse
                key={`lat${lat}`}
                cx={cx}
                cy={latY}
                rx={latR}
                ry={latR * 0.3}
                stroke="currentColor"
                strokeWidth="0.4"
              />
            );
          })}

          {/* Longitude lines */}
          {[0, 30, 60, 90, 120, 150].map((lng) => (
            <ellipse
              key={`lng${lng}`}
              cx={cx}
              cy={cy}
              rx={r * Math.sin((lng * Math.PI) / 180)}
              ry={r}
              stroke="currentColor"
              strokeWidth="0.4"
            />
          ))}

          {/* Factory dots */}
          {factories.map((f) => {
            const { x, y, visible } = projectToGlobe(f.lat, f.lng, cx, cy, r, 0);
            if (!visible) return null;
            return (
              <circle
                key={f.id}
                cx={x}
                cy={y}
                r={4}
                fill="currentColor"
                opacity={0.8}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
