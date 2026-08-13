"use client";

import { useEffect, useRef, useState } from "react";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";
import { DEPTH } from "@/lib/design/tokens";

/**
 * FF TRUST — Sculptural Object (midground 3D, layer 5).
 *
 * An ORIGINAL anime-inspired futuristic crystalline prism — translucent
 * faceted shards orbiting a holographic core. Built from layered SVG +
 * CSS transforms (no three.js / react-three-fiber) to honor the performance
 * contract: transform/opacity only, capped cost, lazy tilt.
 *
 * Decorative only — never presented as account/service evidence. Pointer
 * parallax is subtle and disabled on coarse pointers + reduced motion +
 * low tiers. The object never blocks content (pointer-events-none).
 */
export function SculpturalObject({
  className = "",
  size,
}: {
  className?: string;
  /** Optional fixed px size. When omitted, the object fills its parent
   *  (use a sized/aspect-square wrapper). */
  size?: number;
}) {
  const tier = usePerformanceTier();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
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
      raf = requestAnimationFrame(() => setTilt({ x: dy * -10, y: dx * 12 }));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [tier]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`relative ${className}`}
      style={{
        width: size ?? "100%",
        height: size ?? "100%",
        perspective: 1000,
        zIndex: DEPTH.object,
      }}
    >
      <div
        className="absolute inset-0 preserve-3d drift-float"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 220ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Holographic glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, oklch(0.82 0.12 200 / 0.55) 0%, oklch(0.7 0.12 290 / 0.28) 38%, oklch(1 0 0 / 0) 68%)",
          }}
        />
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="facetA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.95 0.04 200)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="oklch(0.82 0.1 200)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="oklch(0.6 0.16 290)" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="facetB" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.7" />
              <stop offset="60%" stopColor="oklch(0.74 0.15 196)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="oklch(0.62 0.16 258)" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(1 0 0)" />
              <stop offset="50%" stopColor="oklch(0.82 0.12 200)" />
              <stop offset="100%" stopColor="oklch(0.6 0.19 290)" />
            </linearGradient>
            <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="oklch(1 0 0)" stopOpacity="0.95" />
              <stop offset="45%" stopColor="oklch(0.82 0.12 200)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="oklch(0.6 0.19 290)" stopOpacity="0" />
            </radialGradient>
            <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>

          {/* Outer faceted ring — 6 shards (stronger contrast for static readability) */}
          <g filter="url(#soft)" opacity="0.95">
            {Array.from({ length: 6 }).map((_, i) => {
              // Round to a fixed precision so Node (SSR) and browser (client)
              // produce identical float formatting — avoids React hydration
              // mismatch warnings on SVG attributes.
              const r2 = (n: number) => n.toFixed(2);
              const a = (i / 6) * Math.PI * 2;
              const r1 = 175;
              const r2r = 122;
              const x1 = 200 + Math.cos(a) * r1;
              const y1 = 200 + Math.sin(a) * r1;
              const x2 = 200 + Math.cos(a + 0.5) * r2r;
              const y2 = 200 + Math.sin(a + 0.5) * r2r;
              const x3 = 200 + Math.cos(a + 1.047) * r2r;
              const y3 = 200 + Math.sin(a + 1.047) * r2r;
              return (
                <polygon
                  key={i}
                  points={`${r2(x1)},${r2(y1)} ${r2(x2)},${r2(y2)} ${r2(x3)},${r2(y3)}`}
                  fill={i % 2 === 0 ? "url(#facetA)" : "url(#facetB)"}
                  stroke="oklch(1 0 0 / 0.75)"
                  strokeWidth="1.2"
                />
              );
            })}
          </g>

          {/* Mid ring — translucent hex (stronger strokes) */}
          <polygon
            points="200,110 274,150 274,250 200,290 126,250 126,150"
            fill="url(#facetB)"
            stroke="oklch(1 0 0 / 0.8)"
            strokeWidth="1.2"
            opacity="0.8"
          />
          <polygon
            points="200,135 252,162 252,238 200,265 148,238 148,162"
            fill="none"
            stroke="oklch(0.74 0.15 196 / 0.7)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />

          {/* Inner core — stronger glow for static readability */}
          <circle cx="200" cy="200" r="68" fill="url(#coreGlow)" />
          <circle cx="200" cy="200" r="30" fill="url(#coreGrad)" opacity="0.95" />
          <circle cx="200" cy="200" r="14" fill="oklch(1 0 0)" opacity="0.95" />
          <circle cx="200" cy="200" r="5" fill="oklch(1 0 0)" />

          {/* Light sweep edges */}
          <circle cx="200" cy="200" r="178" fill="none" stroke="oklch(1 0 0 / 0.4)" strokeWidth="0.5" />
        </svg>

        {/* Reflection sheen (acrylic) */}
        <div className="sheen-sweep rounded-full" style={{ mixBlendMode: "screen" }} />
      </div>
    </div>
  );
}
