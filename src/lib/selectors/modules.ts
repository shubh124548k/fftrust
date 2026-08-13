/**
 * FF TRUST — Module selectors (PROMPT 14 future-proofed).
 *
 * Nav, footer, mobile command center, sitemap and SEO discover modules from
 * here. Selectors respect `published` and `status` flags so future modules
 * can be pre-configured and activated without editing unrelated components.
 */

import { modules } from "@/data/modules";
import type { ModuleDefinition } from "@/data/types";

/** Published live modules — sorted by canonical order. */
export function getLiveModules(source?: ModuleDefinition[]): ModuleDefinition[] {
  const pool = source ?? modules;
  return pool
    .filter((m) => m.status === "live" && m.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** "Coming" modules — rendered as honest "Coming Soon" entries. */
export function getComingModules(source?: ModuleDefinition[]): ModuleDefinition[] {
  const pool = source ?? modules;
  return pool
    .filter((m) => m.status === "coming" && m.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** All published modules (live + coming) for the module showcase. */
export function getAllPublishedModules(source?: ModuleDefinition[]): ModuleDefinition[] {
  return [...getLiveModules(source), ...getComingModules(source)];
}

/** Modules by category. */
export function getModulesByCategory(category: ModuleDefinition["category"], source?: ModuleDefinition[]): ModuleDefinition[] {
  return getLiveModules(source).filter((m) => m.category === category);
}

export function getModuleByKey(key: string, source?: ModuleDefinition[]): ModuleDefinition | undefined {
  const pool = source ?? modules;
  return pool.find((m) => m.key === key);
}

/** SEO: build a meta description for a module key (or fallback to site). */
export function getModuleMetaDescription(key: string, fallback: string, source?: ModuleDefinition[]): string {
  const mod = getModuleByKey(key, source);
  return mod?.metaDescription ?? fallback;
}
