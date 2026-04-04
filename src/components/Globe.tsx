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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createGlobe = (mod as any).default || mod;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let globe: any;

      try {
        globe = new createGlobe(container);
      } catch {
        globe = createGlobe(container);
      }

      globe
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
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
          el.style.pointerEvents = "auto";
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

      // Fix layout: globe.gl's internal wrapper must not push content down
      const fixLayout = () => {
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          child.style.position = "absolute";
          child.style.inset = "0";
          child.style.height = "100%";
          child.style.overflow = "hidden";
        }
      };
      fixLayout();
      const observer = new MutationObserver(fixLayout);
      observer.observe(container, { childList: true });

      // Keep OrbitControls alive for drag rotation, but disable zoom (wheel)
      try {
        const controls = globe.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.4;
          controls.enableZoom = false; // disable wheel zoom → wheel events pass to page
          controls.enablePan = false;  // disable right-click pan
          controls.enableRotate = true; // keep drag rotation!
        }
      } catch {
        // fallback
      }

      // Intercept wheel events on the canvas and let them pass through to page scroll
      const canvas = container.querySelector("canvas");
      if (canvas) {
        canvas.addEventListener("wheel", (e) => {
          e.stopPropagation();
          // Re-dispatch the wheel event on the document so the page scrolls
          const newEvent = new WheelEvent("wheel", {
            deltaX: e.deltaX,
            deltaY: e.deltaY,
            deltaMode: e.deltaMode,
            bubbles: true,
          });
          document.documentElement.dispatchEvent(newEvent);
        }, { passive: true });
      }

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
    />
  );
}
