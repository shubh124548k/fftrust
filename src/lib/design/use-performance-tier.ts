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
}) {
  const [ref, setRef] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: reveal immediately via the observer-callback path by
      // scheduling through rAF (not a synchronous setState in effect body).
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (options?.once !== false) obs.unobserve(e.target);
          } else if (options?.once === false) {
            setVisible(false);
          }
        });
      },
      { threshold: options?.threshold ?? 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref, options?.threshold, options?.once]);

  return { ref: setRef, visible } as const;
}
