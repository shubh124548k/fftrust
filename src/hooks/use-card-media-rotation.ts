"use client";

import * as React from "react";

/**
 * FF TRUST — Per-card media auto-rotation (PROMPT 03 repair).
 *
 * A single lightweight timer per card that crossfades the card's cover
 * image through its gallery images every 5 seconds (cover → img2 → img3 →
 * cover). The section-level rotor (use-auto-rotation) handles whole-grid
 * pages; THIS hook handles the media INSIDE one card.
 *
 * Contract:
 *  - exactly ONE interval per card with >1 image
 *  - never runs for single-image listings (rotation pool length 1)
 *  - pauses on hover, focus and touch (`hold`), resumes after a cooldown
 *    (`release`) so an interaction never has the image change mid-gesture
 *  - pauses entirely while the tab is hidden (no timers run invisibly)
 *  - disabled under prefers-reduced-motion (static cover remains)
 *  - interval cleaned up on unmount and when paused
 */
export const CARD_MEDIA_INTERVAL_MS = 5000;
export const CARD_MEDIA_RELEASE_MS = 1200;

export interface UseCardMediaRotationOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export interface CardMediaRotationState {
  /** Active image index within the rotation pool. */
  index: number;
  paused: boolean;
  hold: () => void;
  release: () => void;
}

export function useCardMediaRotation(
  total: number,
  { intervalMs = CARD_MEDIA_INTERVAL_MS, enabled = true }: UseCardMediaRotationOptions = {},
): CardMediaRotationState {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  // prefers-reduced-motion disables rotation entirely (static cover).
  const [motionOk, setMotionOk] = React.useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setMotionOk(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const indexRef = React.useRef(0);
  const pausedRef = React.useRef(false);
  const releaseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const hold = React.useCallback(() => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    pausedRef.current = true;
    setPaused(true);
  }, []);

  const release = React.useCallback(() => {
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = setTimeout(() => {
      releaseTimerRef.current = null;
      pausedRef.current = false;
      setPaused(false);
    }, CARD_MEDIA_RELEASE_MS);
  }, []);

  // Single advancing timer — only when rotation is allowed.
  React.useEffect(() => {
    if (!enabled || paused || !motionOk || total <= 1) return;
    const t = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % total;
      setIndex(indexRef.current);
    }, intervalMs);
    return () => clearInterval(t);
  }, [enabled, paused, motionOk, total, intervalMs]);

  // Pause while the tab is hidden — no timer runs invisibly.
  React.useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      if (document.hidden) hold();
      else release();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, hold, release]);

  React.useEffect(() => {
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  return { index, paused, hold, release };
}
