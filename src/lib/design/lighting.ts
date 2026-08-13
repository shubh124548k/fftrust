/**
 * FF TRUST — Lighting presets (PROMPT 03).
 *
 * Controlled key / rim / ambient light relationships per page-type. Applied
 * via `data-light="<preset>"` on a <section> (or any container). The CSS in
 * globals.css reads the attribute and adjusts `--light-key`, `--light-rim`,
 * `--light-ambient` and the atmospheric wash intensity for that subtree.
 *
 * CONTRACT: controlled lighting — never a whole-interface glow. Neon stays an
 * accent. Each preset has a distinct mood but shares the pearl-white base.
 */

export type LightingPreset =
  | "hero" // cinematic — strongest key + violet rim, dramatic
  | "catalogue" // balanced — even key/ambient for card grids
  | "showroom" // service spotlight — rim-forward, cyan-dominant
  | "dossier" // detail focus — warm ambient, soft key
  | "trust" // calm — azure ambient, low rim
  | "safety" // alert-warm — amber-tinted key, restrained
  | "legal" // quiet — minimal light, high readability
  | "default"; // pearl studio base

export const LIGHTING_PRESETS: readonly LightingPreset[] = [
  "hero",
  "catalogue",
  "showroom",
  "dossier",
  "trust",
  "safety",
  "legal",
  "default",
] as const;

/** Human label for the preset (used in debug / docs). */
export const LIGHTING_LABEL: Record<LightingPreset, string> = {
  hero: "Cinematic key + violet rim",
  catalogue: "Balanced catalogue wash",
  showroom: "Service showroom rim",
  dossier: "Detail dossier ambient",
  trust: "Calm trust ambient",
  safety: "Safety warm key",
  legal: "Quiet legal minimal",
  default: "Pearl studio base",
};
