"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import type { PerformanceTier } from "@/lib/design/tokens";

/**
 * FF TRUST — Performance tier detector.
 *
 * Uses useSyncExternalStore for client-only detection (avoids the
 * set-state-in-effect anti-pattern and hydration mismatches). Server snapshot
 * is the base tier (1); client snapshot runs detectTier() once and is cached.
 * The `data-tier` attribute on <html> is written as a pure external-system
 * sync in an effect (no setState) so the CSS token system can scale particles,
 * parallax and blur per device.
 *
 * Respects prefers-reduced-motion (forces tier 0 motion-wise) and
 * navigator.connection.saveData.
 */

function detectTier(): PerformanceTier {
  if (typeof window === "undefined") return 1;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const conn = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string; downlink?: number };
  }).connection;
  const saveData = conn?.saveData === true;
  const slowNet =
    !!conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType);
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;

  if (reduce || saveData) return 0;
  if (slowNet || mem <= 4 || cores <= 4 || coarse) return 1;
  return 2;
}

let cachedTier: PerformanceTier | null = null;
function getClientTier(): PerformanceTier {
  if (cachedTier === null) cachedTier = detectTier();
  return cachedTier;
}
const subscribeTier = (cb: () => void) => {
  // Tier is stable per page load; no external changes to subscribe to.
  // Kept as a no-op subscription for useSyncExternalStore contract.
  return () => {};
};

export function usePerformanceTier(): PerformanceTier {
  const tier = useSyncExternalStore(subscribeTier, getClientTier, () => 1 as PerformanceTier);

  useEffect(() => {
    document.documentElement.setAttribute("data-tier", String(tier));
  }, [tier]);

  return tier;
}

/** Client-mounted flag via useSyncExternalStore (no set-state-in-effect). */
const subscribeMounted = (cb: () => void) => {
  window.addEventListener("load", cb);
  return () => window.removeEventListener("load", cb);
};
const getMounted = () => true;
const getServerMounted = () => false;
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeMounted, getMounted, getServerMounted);
}

/**
 * Reduced-motion-aware reveal via IntersectionObserver. setState only happens
 * inside the observer callback (not synchronously in the effect body).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  once?: boolean;
  /** Milliseconds after mount after which content is force-revealed even if
   *  IntersectionObserver never fires. Guarantees cards never stay hidden. */
  fallbackMs?: number;
}) {
  const [ref, setRef] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const once = options?.once !== false;
    const fallbackMs = options?.fallbackMs ?? 1200;

    // PERMANENT VISIBILITY SAFETY NET: no content may stay at opacity:0
    // forever. If the observer does not report the element as intersecting
    // within a short window (throttled tabs, unsupported IO, tall cards near
    // the fold, disabled JS-driven animation), force it visible.
    const timer = setTimeout(() => setVisible(true), fallbackMs);
    if (typeof IntersectionObserver === "undefined") {
      return () => clearTimeout(timer);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            clearTimeout(timer);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      // Gentle, tall-card-friendly threshold so multi-row cards on small
      // screens still intersect instead of hovering just under the fold.
      { threshold: options?.threshold ?? 0.05, rootMargin: "0px 0px -6% 0px" },
    );
    obs.observe(ref);
    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [ref, options?.threshold, options?.once, options?.fallbackMs]);

  return { ref: setRef, visible } as const;
}
