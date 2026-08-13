/**
 * FF TRUST — Central Motion System (PROMPT 12).
 *
 * One unified motion system for the entire site. Provides physically believable
 * timing presets, tier-scaled intensity, and hooks for scroll-driven depth.
 *
 * Principles:
 *  - Background moves slowly; hero objects have deeper parallax; foreground UI
 *    has restrained movement.
 *  - Transform/opacity only — no layout shift, no repaint.
 *  - rAF-throttled, interruptible, IntersectionObserver-triggered.
 *  - Three tiers: high (desktop pointer), balanced (mobile/tablet), reduced
 *    (prefers-reduced-motion / save-data / low-power).
 *  - Motion must never obscure data or interfere with navigation.
 *
 * This module is the JS companion to the CSS motion utilities in globals.css.
 */

import type { PerformanceTier } from "./tokens";

/* ============================================================
 * MOTION PRESETS — physically believable timing
 * ============================================================ */

export const MOTION_SYSTEM = {
  /** Page/route entrance — cinematic, slow outExpo. */
  entrance: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] as const },
  },
  /** Section reveal — on scroll into view. */
  reveal: {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] as const },
  },
  /** Text stagger — children reveal in sequence. */
  stagger: {
    container: { staggerChildren: 0.07, delayChildren: 0.05 },
    child: {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
    },
  },
  /** Card reveal — 3D micro-stage entrance. */
  cardReveal: {
    initial: { opacity: 0, y: 18, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Hover — restrained lift. */
  hover: {
    rest: { y: 0 },
    hover: { y: -6 },
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Press — tactile feedback. */
  press: {
    rest: { scale: 1 },
    pressed: { scale: 0.97 },
    transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Magnetic — pointer-tracking translate. */
  magnetic: {
    maxTranslate: 14,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** 3D drift — slow background object movement. */
  drift: {
    duration: 18,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  /** Modal/dialog entrance. */
  modal: {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Drawer (bottom sheet) entrance. */
  drawer: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 24 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Service progression — rank journey path animation. */
  progression: {
    pathDraw: { duration: 1.3, ease: [0.16, 1, 0.3, 1] as const },
    checkpointPulse: { duration: 0.76, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Gallery transition — slide between media. */
  gallery: {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
  /** Neon sweep — controlled edge light. */
  neonSweep: {
    duration: 6.5,
    ease: [0.32, 0.72, 0, 1] as const,
  },
  /** Glass reflection — slow sheen. */
  glassReflection: {
    duration: 6.5,
    delay: 2,
    ease: [0.32, 0.72, 0, 1] as const,
  },
} as const;

/* ============================================================
 * TIER SCALING — high / balanced / reduced
 * ============================================================ */

export interface TierMotionConfig {
  /** Parallax multiplier (0 = off, 0.5 = half, 1 = full). */
  parallaxScale: number;
  /** Particle count cap. */
  particles: number;
  /** Enable pointer parallax (desktop only). */
  pointerParallax: boolean;
  /** Enable drift loops. */
  driftLoops: boolean;
  /** Enable sheen/sweep loops. */
  sheenLoops: boolean;
  /** Enable neon edge sweeps. */
  neonLoops: boolean;
  /** Stagger delay per child (ms). */
  staggerDelay: number;
  /** Reveal transition duration multiplier. */
  revealDurationScale: number;
}

export const TIER_MOTION: Record<PerformanceTier, TierMotionConfig> = {
  // Reduced — minimal motion, no loops, instant reveals
  0: {
    parallaxScale: 0,
    particles: 0,
    pointerParallax: false,
    driftLoops: false,
    sheenLoops: false,
    neonLoops: false,
    staggerDelay: 0,
    revealDurationScale: 0.1,
  },
  // Balanced — reduced effects for mobile/tablet
  1: {
    parallaxScale: 0.5,
    particles: 14,
    pointerParallax: false,
    driftLoops: true,
    sheenLoops: true,
    neonLoops: false,
    staggerDelay: 50,
    revealDurationScale: 0.8,
  },
  // High — full cinematic for capable desktop
  2: {
    parallaxScale: 1,
    particles: 26,
    pointerParallax: true,
    driftLoops: true,
    sheenLoops: true,
    neonLoops: true,
    staggerDelay: 70,
    revealDurationScale: 1,
  },
};

/* ============================================================
 * SCROLL PROGRESS — scroll-depth indicator
 * ============================================================ */

/**
 * Returns a 0-1 scroll progress value (0 = top, 1 = bottom).
 * rAF-throttled, passive listener. Reduced-motion safe (value still updates,
 * but the visual indicator can be styled statically).
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}

// React imports (kept at bottom to avoid circular deps with tokens.ts)
import { useEffect, useState } from "react";
