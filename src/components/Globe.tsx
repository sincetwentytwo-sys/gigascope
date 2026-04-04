"use client";

import { useEffect, useRef } from "react";
import { factories } from "@/data/factories";

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    import("globe.gl").then((mod) => {
      if (!container) return;

      // globe.gl exports a factory function (not a class)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createGlobe = (mod as any).default || mod;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let globe: any;

      try {
        globe = new createGlobe(container);
      } catch {
        // If not a constructor, try as function
        globe = createGlobe(container);
      }

      globe
        .globeImageUrl(
          "//unpkg.com/three-globe/example/img/earth-dark.jpg"
        )
        .bumpImageUrl(
          "//unpkg.com/three-globe/example/img/earth-topology.png"
        )
        .backgroundImageUrl("")
        .backgroundColor("#00000000")
        .atmosphereColor("#3a86ff")
        .atmosphereAltitude(0.2)
        .width(w)
        .height(h)
        .pointOfView({ lat: 25, lng: -40, altitude: 2.2 })
        .htmlElementsData(factories)
        .htmlElement((d: unknown) => {
          const f = d as (typeof factories)[number];
          const el = document.createElement("div");
          el.style.cursor = "pointer";
          el.innerHTML = `
            <div style="position:relative;width:20px;height:20px;">
              <div style="position:absolute;inset:0;background:${f.color};border-radius:50%;opacity:0.2;animation:pulse-ring 2s infinite;"></div>
              <div style="position:absolute;inset:4px;background:${f.color};border-radius:50%;opacity:0.4;"></div>
              <div style="position:absolute;inset:7px;background:${f.color};border-radius:50%;"></div>
            </div>
          `;
          el.onclick = () => {
            window.location.href = `/factory/${f.slug}`;
          };
          return el;
        })
        .htmlLat((d: unknown) => (d as (typeof factories)[number]).lat)
        .htmlLng((d: unknown) => (d as (typeof factories)[number]).lng)
        .htmlAltitude(0.01);

      // Force globe.gl's internal wrapper to not break layout
      // Use MutationObserver since globe.gl creates the div async
      const fixInternalDiv = () => {
        // Fix ALL descendants to not capture events or break layout
        container.querySelectorAll("*").forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.pointerEvents = "none";
        });
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          child.style.position = "absolute";
          child.style.inset = "0";
          child.style.height = "100%";
          child.style.overflow = "hidden";
        }
      };
      fixInternalDiv();
      const observer = new MutationObserver(fixInternalDiv);
      observer.observe(container, { childList: true, subtree: true });

      // Completely dispose OrbitControls to prevent scroll hijacking
      try {
        const controls = globe.controls();
        if (controls) {
          controls.dispose();
        }
      } catch {
        // controls not ready
      }

      // Manual auto-rotation via animation frame
      let angle = 0;
      const autoRotate = () => {
        angle += 0.15;
        globe.pointOfView({ lat: 25, lng: -40 + angle, altitude: 2.2 });
        requestAnimationFrame(autoRotate);
      };
      autoRotate();

      const handleResize = () => {
        if (container) {
          globe.width(container.clientWidth).height(container.clientHeight);
        }
      };
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="globe-container absolute inset-0 overflow-hidden"
      style={{ pointerEvents: "none" }}
    />
  );
}
