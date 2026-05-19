"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stars, Environment, ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  GeometryKind,
  PartSpec,
  ProductSpec,
} from "@/data/products";
import type * as THREE from "three";

type GeometryProps = { kind: GeometryKind; args: Array<number | boolean> };

function Geometry({ kind, args }: GeometryProps) {
  switch (kind) {
    case "cylinder":
      return (
        <cylinderGeometry
          args={args as unknown as [
            number,
            number,
            number,
            number?,
            number?,
            boolean?,
          ]}
        />
      );
    case "cone":
      return (
        <coneGeometry
          args={args as unknown as [
            number,
            number,
            number?,
            number?,
            boolean?,
          ]}
        />
      );
    case "box":
      return (
        <boxGeometry
          args={args as unknown as [
            number,
            number,
            number,
            number?,
            number?,
            number?,
          ]}
        />
      );
    case "sphere":
      return (
        <sphereGeometry args={args as unknown as [number, number?, number?]} />
      );
    case "torus":
      return (
        <torusGeometry
          args={args as unknown as [
            number,
            number,
            number?,
            number?,
            number?,
          ]}
        />
      );
    case "ring":
      return (
        <ringGeometry
          args={args as unknown as [number, number, number?, number?]}
        />
      );
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

type PartProps = {
  part: PartSpec;
  active: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
};

function Part({ part, active, hovered, onSelect, onHover }: PartProps) {
  const emissiveBoost = active || hovered;
  const baseEmissive = part.emissive ?? "#000000";
  const emissive = emissiveBoost ? "#ffffff" : baseEmissive;
  const emissiveIntensity = emissiveBoost ? (active ? 0.45 : 0.22) : 0.15;

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(part.id);
    document.body.style.cursor = "pointer";
  };
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = "auto";
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(part.id);
  };

  return (
    <mesh
      position={part.position}
      rotation={part.rotation ?? [0, 0, 0]}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <Geometry kind={part.geometry} args={part.args} />
      <meshStandardMaterial
        color={part.color}
        metalness={part.metalness ?? 0.7}
        roughness={part.roughness ?? 0.4}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

type SceneProps = {
  product: ProductSpec;
  selectedId: string | null;
  hoveredId: string | null;
  setSelectedId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  controlsRef: React.MutableRefObject<
    React.ComponentRef<typeof OrbitControls> | null
  >;
};

function Scene({
  product,
  selectedId,
  hoveredId,
  setSelectedId,
  setHoveredId,
  controlsRef,
}: SceneProps) {
  const target = product.cameraTarget ?? [0, 0, 0];
  return (
    <>
      <color attach="background" args={[product.background ?? "#1a1d24"]} />

      <Environment preset="studio" />
      <hemisphereLight args={["#b7c8e1", "#1a1d24", 0.6]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.8}
        color="#ffffff"
        castShadow
      />
      <directionalLight
        position={[-6, 4, -4]}
        intensity={0.8}
        color="#7aa6ff"
      />
      <pointLight position={[4, -2, 4]} intensity={0.6} color="#ffb073" />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffffff" />

      <Stars
        radius={60}
        depth={40}
        count={1200}
        factor={3}
        saturation={0}
        fade
        speed={0.4}
      />

      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.45}
        scale={20}
        blur={2.5}
        far={6}
      />
      <gridHelper
        args={[24, 24, "#5a6e8f", "#2a3340"]}
        position={[0, -2.39, 0]}
      />

      <group onPointerMissed={() => setSelectedId(null)}>
        {product.parts.map((part) => (
          <Part
            key={part.id}
            part={part}
            active={selectedId === part.id}
            hovered={hoveredId === part.id}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        ))}
      </group>

      <OrbitControls
        ref={controlsRef}
        target={target as [number, number, number]}
        enablePan={false}
        minDistance={product.cameraMinDistance ?? 3}
        maxDistance={product.cameraMaxDistance ?? 18}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

export default function Product3DViewer({ product }: { product: ProductSpec }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [coarsePointerWarn, setCoarsePointerWarn] = useState(false);
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls> | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;
    setCoarsePointerWarn(coarse && small);
  }, []);

  const selected = useMemo(
    () => product.parts.find((p) => p.id === selectedId) ?? null,
    [product.parts, selectedId],
  );

  const resetCamera = () => {
    const c = controlsRef.current as unknown as
      | { reset?: () => void }
      | null;
    if (c?.reset) c.reset();
  };

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] min-h-[480px] border border-[#343538] bg-[#0a0a0c] overflow-hidden">
      <Canvas
        camera={{
          position: product.cameraPosition,
          fov: 42,
          near: 0.1,
          far: Math.max(500, (product.cameraMaxDistance ?? 18) * 4),
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene
          product={product}
          selectedId={selectedId}
          hoveredId={hoveredId}
          setSelectedId={setSelectedId}
          setHoveredId={setHoveredId}
          controlsRef={
            controlsRef as React.MutableRefObject<
              React.ComponentRef<typeof OrbitControls> | null
            >
          }
        />
      </Canvas>

      {/* Top-left instruction + reset */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-[#121316]/85 backdrop-blur-md px-3 py-1.5 border border-[#343538] font-mono text-[10px] text-[#b7c8e1] uppercase tracking-widest">
          Click parts to learn how they work
        </div>
        {coarsePointerWarn && (
          <div className="pointer-events-auto bg-[#3a1500]/80 backdrop-blur-md px-3 py-1.5 border border-[#c97a3a]/40 font-mono text-[10px] text-[#ffb073] uppercase tracking-wide max-w-[260px]">
            Touch device — performance may vary. Pinch to zoom, drag to orbit.
          </div>
        )}
      </div>

      {/* Top-right reset */}
      <button
        type="button"
        onClick={resetCamera}
        className="absolute top-3 right-3 bg-[#121316]/85 hover:bg-[#1f1f23] backdrop-blur-md px-3 py-1.5 border border-[#343538] font-mono text-[10px] text-white uppercase tracking-widest transition-colors"
      >
        Reset camera
      </button>

      {/* Hover label */}
      {hoveredId && !selected && (
        <div className="absolute bottom-3 left-3 bg-[#121316]/85 backdrop-blur-md px-3 py-1.5 border border-[#343538] font-mono text-[11px] text-white">
          {product.parts.find((p) => p.id === hoveredId)?.name}
        </div>
      )}

      {/* Side panel — desktop right, mobile bottom drawer */}
      {selected && (
        <div
          role="dialog"
          aria-label={`${selected.name} details`}
          className="
            absolute z-10
            left-0 right-0 bottom-0 max-h-[50vh] overflow-y-auto border-t border-[#343538]
            sm:left-auto sm:top-0 sm:bottom-0 sm:right-0 sm:max-h-none sm:h-full
            sm:w-[40%] sm:border-t-0 sm:border-l sm:border-[#343538]
            bg-[#121316]/95 backdrop-blur-lg p-5 sm:p-6
          "
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa] mb-1">
                Part
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {selected.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close part details"
              className="text-[#8292aa] hover:text-white text-xl leading-none px-2 py-1"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-[#d6dde8] leading-relaxed mb-4">
            {selected.description}
          </p>
          {selected.href && (
            <a
              href={selected.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-[10px] uppercase tracking-widest text-[#7aa6ff] hover:text-white border-b border-[#7aa6ff]/40 hover:border-white pb-0.5"
            >
              Learn more &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}
