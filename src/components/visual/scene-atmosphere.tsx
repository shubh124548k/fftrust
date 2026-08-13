"use client";

import { useEffect } from "react";
import { usePerformanceTier, useMounted } from "@/lib/design/use-performance-tier";
import { DEPTH } from "@/lib/design/tokens";

/**
 * FF TRUST — Scene Atmosphere (PROMPT 17 — visible rainfall/snowfall).
 *
 * Fixed pearl-white studio environment with:
 *  - layered volumetric washes (cyan / violet / azure / pearl)
 *  - light beams (clipped to viewport)
 *  - distant futuristic geometry (rings + hex)
 *  - 3-layer visible particle rainfall/snowfall
 *  - fine grain texture
 *
 * Particle system: 3 depth layers (background/midground/foreground),
 * varied sizes/speeds/opacity, visible in both light and dark mode,
 * pointer-events-none, reduced-motion aware, canvas-based.
 */
export function SceneAtmosphere() {
  const tier = usePerformanceTier();
  const mounted = useMounted();

  return (
    <>
      <div aria-hidden className="studio-atmosphere" />
      {/* Light beams — volumetric key + rim (clipped to viewport) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: DEPTH.atmo }}
      >
        <div
          aria-hidden
          className="light-beam drift-slow"
          style={{
            top: "-20vh",
            left: "-10vw",
            transform: "rotate(18deg)",
            opacity: tier >= 1 ? 0.7 : 0.35,
          }}
        />
        <div
          aria-hidden
          className="light-beam drift-float"
          style={{
            top: "-30vh",
            right: "-12vw",
            left: "auto",
            transform: "rotate(-22deg)",
            background:
              "linear-gradient(180deg, oklch(0.7 0.1 290 / 0.18) 0%, oklch(0.7 0.1 290 / 0) 70%)",
            opacity: tier >= 1 ? 0.6 : 0.3,
          }}
        />
      </div>

      {/* Distant futuristic geometry — slow drifting rings */}
      {mounted && tier >= 1 && (
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: DEPTH.geometry, maxWidth: "100vw" }}>
          <svg
            className="absolute drift-slow"
            style={{ top: "8%", right: "-6%", width: "38vw", height: "38vw", opacity: 0.5 }}
            viewBox="0 0 400 400"
            fill="none"
          >
            <defs>
              <linearGradient id="ring1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.74 0.15 196)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.6 0.19 290)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="180" stroke="url(#ring1)" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="140" stroke="url(#ring1)" strokeWidth="0.8" strokeDasharray="2 8" />
            <circle cx="200" cy="200" r="100" stroke="url(#ring1)" strokeWidth="0.6" />
          </svg>
          <svg
            className="absolute drift-float"
            style={{ bottom: "6%", left: "-8%", width: "34vw", height: "34vw", opacity: 0.45 }}
            viewBox="0 0 400 400"
            fill="none"
          >
            <defs>
              <linearGradient id="hex1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.16 258)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="oklch(0.74 0.15 196)" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <polygon
              points="200,20 360,120 360,280 200,380 40,280 40,120"
              stroke="url(#hex1)"
              strokeWidth="1"
              fill="none"
            />
            <polygon
              points="200,70 310,140 310,260 200,330 90,260 90,140"
              stroke="url(#hex1)"
              strokeWidth="0.7"
              strokeDasharray="3 7"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* Rainfall/Snowfall — 3 depth layers, visibly present */}
      {mounted && tier >= 1 && (
        <RainfallCanvas count={tier >= 2 ? 80 : 28} tier={tier} />
      )}

      {/* Fine grain */}
      {mounted && tier >= 1 && <div aria-hidden className="grain-ff" />}
    </>
  );
}

/**
 * 3-layer visible rainfall/snowfall canvas.
 * - Background: tiny, slow, low opacity
 * - Midground: slightly larger, moderate speed
 * - Foreground: few larger particles, stronger presence
 * Visible in both light and dark mode via theme-aware colors.
 * Respects reduced-motion (static render, no movement).
 * pointer-events:none, behind interactive content.
 */
function RainfallCanvas({ count, tier }: { count: number; tier: number }) {
  useEffect(() => {
    const canvas = document.getElementById("ff-rainfall") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Cap device pixel ratio by tier: mobile/coarse gets 1.5 (large fill-rate
    // wins), desktop gets 2. Prevents weak GPUs from overdrawing a full-viewport
    // fixed canvas during scroll.
    const dpr = Math.min(window.devicePixelRatio || 1, tier >= 2 ? 2 : 1.5);
    let raf = 0;
    let w = window.innerWidth;
    let h = window.innerHeight;
    // FPS cap (~30fps): skip frames closer together than 32ms. A rain shower
    // does not need 60fps, and halving draw rate halves mobile jank during scroll.
    let last = 0;
    const FRAME_MS = 32;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Detect dark mode for particle colors
    const isDark = () => document.documentElement.classList.contains("dark");

    // 3 layers: background (60%), midground (30%), foreground (10%)
    const bgCount = Math.floor(count * 0.6);
    const midCount = Math.floor(count * 0.3);
    const fgCount = count - bgCount - midCount;

    type Particle = {
      x: number; y: number; r: number; vy: number; vx: number;
      a: number; layer: 0 | 1 | 2; hue: number; drift: number;
    };

    const makeParticle = (layer: 0 | 1 | 2): Particle => {
      const sizeRange = layer === 0 ? [1, 2.5] : layer === 1 ? [2, 4] : [3, 6];
      const speedRange = layer === 0 ? [0.2, 0.5] : layer === 1 ? [0.4, 0.8] : [0.6, 1.2];
      const opacityRange = layer === 0 ? [0.3, 0.5] : layer === 1 ? [0.4, 0.65] : [0.5, 0.8];
      const r = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r,
        vy: speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]),
        vx: (Math.random() - 0.5) * 0.3,
        a: opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]),
        layer,
        hue: Math.random() > 0.5 ? 196 : 280,
        drift: Math.random() * Math.PI * 2,
      };
    };

    const particles: Particle[] = [
      ...Array.from({ length: bgCount }, () => makeParticle(0)),
      ...Array.from({ length: midCount }, () => makeParticle(1)),
      ...Array.from({ length: fgCount }, () => makeParticle(2)),
    ];

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = (now: number) => {
      if (now - last < FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      ctx.clearRect(0, 0, w, h);
      const dark = isDark();

      for (const p of particles) {
        if (!reduce && !document.hidden) {
          p.y += p.vy;
          p.drift += 0.01;
          p.x += p.vx + Math.sin(p.drift) * 0.3;
          if (p.y > h + 6) { p.y = -6; p.x = Math.random() * w; }
          if (p.x < -6) p.x = w + 6;
          if (p.x > w + 6) p.x = -6;
        }

        // Theme-aware colors — high visibility in both modes
        let color: string;
        if (dark) {
          // Dark mode: bright cyan, cool blue, violet-white
          if (p.hue === 196) {
            color = `hsla(190, 80%, 70%, ${p.a})`;
          } else {
            color = `hsla(260, 70%, 75%, ${p.a * 0.9})`;
          }
        } else {
          // Light mode: visible cyan-blue, soft violet
          if (p.hue === 196) {
            color = `hsla(200, 70%, 50%, ${p.a})`;
          } else {
            color = `hsla(260, 60%, 55%, ${p.a * 0.85})`;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Foreground particles get a visible glow (skipped on tier 1 — saves a
        // full extra fill pass per foreground particle on mobile).
        if (p.layer === 2 && tier >= 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          const glowColor = dark
            ? `hsla(190, 80%, 70%, ${p.a * 0.25})`
            : `hsla(200, 70%, 50%, ${p.a * 0.2})`;
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, tier]);

  return (
    <canvas
      id="ff-rainfall"
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
