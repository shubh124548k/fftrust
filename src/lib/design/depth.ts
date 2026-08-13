/**
 * FF TRUST — Depth API (PROMPT 03).
 *
 * Semantic depth levels so components declare *which layer* they belong to
 * instead of arbitrary z-index numbers. The z() helper resolves a level to a
 * concrete z-index, tier-scaled so reduced/low tiers flatten the stack (less
 * parallax overlap, cheaper compositing).
 *
 * 10D perceived-depth layer model (metaphor, not literal dimensions):
 *   atmosphere · lightField · particles · distantGeometry · midgroundObject
 *   glassPlane · foregroundUI · reflections · microInteractions · camera
 *
 * Usage:
 *   <div style={{ zIndex: z("glass") }}>        // semantic
 *   <GlassPanel depth="pedestal">                // multi-level glass
 *   <section data-light="catalogue">             // lighting preset
 */

import type { PerformanceTier } from "./tokens";

export type DepthLevel =
  | "bg" // fixed background wash
  | "atmosphere" // volumetric atmosphere
  | "lightField" // light beams / volumetric
  | "particles" // snowfall / particles
  | "distantGeometry" // far rings / hex
  | "midgroundObject" // sculptural 3D object
  | "glassPlane" // translucent glass surface
  | "foregroundUI" // primary content
  | "microInteraction" // floating chips / sheens
  | "camera" // scroll/parallax driver overlays
  | "nav" // sticky header / sheets
  | "modal"; // dialogs / overlays

/** Canonical z-index per level (base tier 2). Monotonically increasing. */
const BASE_Z: Record<DepthLevel, number> = {
  bg: -200,
  atmosphere: -100,
  lightField: -80,
  particles: -60,
  distantGeometry: -40,
  midgroundObject: -20,
  glassPlane: 10,
  foregroundUI: 20,
  microInteraction: 40,
  camera: 50,
  nav: 60,
  modal: 100,
};

/**
 * Resolve a semantic depth level to a concrete z-index.
 * Tier 0 (reduced/low) collapses the negative layers toward 0 so there is less
 * parallax overlap and cheaper compositing; foreground/modal stack is kept.
 */
export function z(level: DepthLevel, tier: PerformanceTier = 1): number {
  if (tier >= 2) return BASE_Z[level];
  if (tier === 1) {
    // Balanced: compress negative layers slightly, keep foreground.
    if (BASE_Z[level] < 0) return Math.round(BASE_Z[level] * 0.6);
    return BASE_Z[level];
  }
  // Tier 0 (reduced): flatten negatives to 0; keep foreground/modal stack.
  if (BASE_Z[level] < 0) return 0;
  return BASE_Z[level];
}

/** CSS var form for inline styles: `var(--z-glass)` etc. Prefer z() for JS. */
export function zVar(level: DepthLevel): string {
  return `var(--z-${level})`;
}

/** All levels in render order (for documentation / debug). */
export const DEPTH_LEVELS: DepthLevel[] = [
  "bg",
  "atmosphere",
  "lightField",
  "particles",
  "distantGeometry",
  "midgroundObject",
  "glassPlane",
  "foregroundUI",
  "microInteraction",
  "camera",
  "nav",
  "modal",
];

/** Backward-compat: map the old DEPTH constants to the new API. */
export const DEPTH = {
  bg: BASE_Z.bg,
  atmo: BASE_Z.atmosphere,
  particle: BASE_Z.particles,
  geometry: BASE_Z.distantGeometry,
  object: BASE_Z.midgroundObject,
  glass: BASE_Z.glassPlane,
  ui: BASE_Z.foregroundUI,
  float: BASE_Z.microInteraction,
  nav: BASE_Z.nav,
} as const;
