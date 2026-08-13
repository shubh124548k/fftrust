/**
 * FF TRUST — Typed design tokens (JS mirror of the CSS constitution).
 *
 * Source of truth for color/motion/depth lives in `src/app/globals.css`.
 * This module exposes strongly-typed values for JS consumers (framer-motion
 * variants, canvas particle config, parallax drivers, selector logic) so we
 * never sprinkle magic numbers across components.
 *
 * PROMPT 01 — visual constitution.
 */

export const MOTION = {
  ease: {
    spring: [0.22, 1, 0.36, 1] as const,
    outExpo: [0.16, 1, 0.3, 1] as const,
    inOutSoft: [0.65, 0, 0.35, 1] as const,
    camera: [0.32, 0.72, 0, 1] as const,
  },
  duration: {
    micro: 0.14,
    fast: 0.22,
    base: 0.42,
    slow: 0.76,
    cinema: 1.3,
    drift: 18,
  },
} as const;

export const DEPTH = {
  bg: -200,
  atmo: -100,
  particle: -60,
  geometry: -40,
  object: -20,
  glass: 10,
  ui: 20,
  float: 40,
  nav: 60,
} as const;

export const PERSPECTIVE = {
  near: 900,
  mid: 1400,
  far: 2200,
} as const;

export const PARALLAX = {
  layer1: 8,
  layer2: 18,
  layer3: 34,
} as const;

export type PerformanceTier = 0 | 1 | 2;

export const TIER_DEFAULTS: Record<PerformanceTier, {
  particles: number;
  parallax: number;
  heavyFx: number;
  blur: number;
  blurStrong: number;
}> = {
  0: { particles: 0, parallax: 0, heavyFx: 0, blur: 10, blurStrong: 16 },
  1: { particles: 14, parallax: 0.5, heavyFx: 0.5, blur: 14, blurStrong: 22 },
  2: { particles: 26, parallax: 1, heavyFx: 1, blur: 18, blurStrong: 30 },
};

/** Brand accent palette (mirrors --accent-* CSS tokens). */
export const BRAND = {
  cyan: "var(--accent-cyan)",
  azure: "var(--accent-azure)",
  violet: "var(--accent-violet)",
  ice: "var(--accent-ice)",
  ink: "var(--ink)",
  inkSoft: "var(--ink-soft)",
} as const;

/** Framer Motion variants reused across reveals / page transitions. */
export const VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: Math.min(i * 0.06, 0.6),
        duration: MOTION.duration.slow,
        ease: MOTION.ease.outExpo,
      },
    }),
  },
  stagger: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: MOTION.duration.base, ease: MOTION.ease.spring },
    },
  },
} as const;
