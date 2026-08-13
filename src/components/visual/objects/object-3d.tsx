"use client";

import * as React from "react";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Object3D base (PROMPT 03).
 *
 * Shared infrastructure for the original 3D object library. Each concrete
 * object (HolographicShield, DataCube, …) provides its SVG art as children;
 * this base provides:
 *  - tier-aware pointer parallax (disabled on tier 0 / coarse / reduced-motion)
 *  - slow drift-float (disabled on tier 0 / reduced-motion)
 *  - perspective stage + preserve-3d
 *  - a beautiful static fallback (the SVG renders its final frame, no motion)
 *  - pointer-events-none (decorative, never blocks content)
 *
 * Decorative only — never presented as account/service evidence.
 */
export function Object3D({
  children,
  className,
  drift = true,
  tiltStrength = 12,
  perspective = 1000,
}: {
  children: React.ReactNode;
  className?: string;
  /** Enable slow drift-float. Set false for objects that should stay still. */
  drift?: boolean;
  /** Max pointer-tilt in degrees. */
  tiltStrength?: number;
  /** CSS perspective in px. */
  perspective?: number;
}) {
  const tier = usePerformanceTier();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (tier === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    const el = wrapRef.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setTilt({ x: dy * -tiltStrength * 0.8, y: dx * tiltStrength }),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [tier, tiltStrength]);

  const showDrift = drift && tier >= 1;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn("relative pointer-events-none", className)}
      style={{ perspective }}
    >
      <div
        className={cn("absolute inset-0 preserve-3d", showDrift && "drift-float")}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 220ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Shared SVG gradient defs used across the object library. Keeps SVGs DRY. */
export function ObjectGradients({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-facetA`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="oklch(0.95 0.04 200)" stopOpacity="0.85" />
        <stop offset="55%" stopColor="oklch(0.82 0.1 200)" stopOpacity="0.55" />
        <stop offset="100%" stopColor="oklch(0.6 0.16 290)" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-facetB`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.7" />
        <stop offset="60%" stopColor="oklch(0.74 0.15 196)" stopOpacity="0.4" />
        <stop offset="100%" stopColor="oklch(0.62 0.16 258)" stopOpacity="0.25" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-core`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="oklch(1 0 0)" />
        <stop offset="50%" stopColor="oklch(0.82 0.12 200)" />
        <stop offset="100%" stopColor="oklch(0.6 0.19 290)" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.95" />
        <stop offset="45%" stopColor="oklch(0.82 0.12 200)" stopOpacity="0.5" />
        <stop offset="100%" stopColor="oklch(0.6 0.19 290)" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}
