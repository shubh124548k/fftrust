"use client";

import * as React from "react";

/**
 * FF TRUST — Single-timer homepage rotation (PROMPT 2).
 *
 * One controlled interval per section. Every interval, the section plays a
 * short exit phase ("old cards float away") then swaps to the next page with an
 * enter phase ("next cards materialize"). Pausing is explicit (`hold`) and
 * resumes after a cooldown (`release`) — hover, focus and touch interactions
 * never have the rotation move away mid-interaction.
 *
 * Performance contract:
 *  - exactly ONE `setInterval` per mounted section
 *  - every timer (interval, exit swap, release cooldown) is cleaned up on
 *    unmount and when paused
 *  - no per-card timers, no layouts, no polling
 */

export const ROTATION_INTERVAL_MS = 5000;
export const ROTATION_EXIT_MS = 300;
export const ROTATION_RELEASE_MS = 1200;

export interface UseAutoRotationOptions {
  /** When false the section renders a stable page (full catalogue pages). */
  enabled?: boolean;
  intervalMs?: number;
  exitMs?: number;
  releaseMs?: number;
  /** When this value changes identity, the rotation resets to page 0. */
  resetKey?: unknown;
}

export interface AutoRotationState {
  index: number;
  phase: "enter" | "exit";
  totalPages: number;
  paused: boolean;
  hold: () => void;
  release: () => void;
}

export function useAutoRotation(
  totalPages: number,
  {
    enabled = true,
    intervalMs = ROTATION_INTERVAL_MS,
    exitMs = ROTATION_EXIT_MS,
    releaseMs = ROTATION_RELEASE_MS,
    resetKey,
  }: UseAutoRotationOptions = {},
): AutoRotationState {
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"enter" | "exit">("enter");
  const [paused, setPaused] = React.useState(false);
  // Respect prefers-reduced-motion: rotation is disabled entirely so the
  // showcase stays static for users who opt out of motion.
  const [motionOk, setMotionOk] = React.useState(() =>
    typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setMotionOk(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pausedRef = React.useRef(false);
  const indexRef = React.useRef(0);
  const exitTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset rotation when `resetKey` changes identity (derived during render, so
  // no synchronous state updates run inside an effect).
  const [prevResetKey, setPrevResetKey] = React.useState<unknown>(resetKey);
  if (resetKey !== prevResetKey && resetKey !== undefined) {
    setPrevResetKey(resetKey);
    setIndex(0);
    setPhase("enter");
  }

  const pause = React.useCallback(() => {
    pausedRef.current = true;
    setPaused(true);
  }, []);

  const resume = React.useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
  }, []);

  /** Pause immediately and cancel any pending resume. */
  const hold = React.useCallback(() => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    pause();
  }, [pause]);

  /** Resume after a short cooldown (cancelled by any new hold). */
  const release = React.useCallback(() => {
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = setTimeout(() => {
      releaseTimerRef.current = null;
      resume();
    }, releaseMs);
  }, [releaseMs, resume]);

  /** Exit -> swap -> enter two-phase advance. */
  const advance = React.useCallback(() => {
    if (totalPages <= 1) return;
    setPhase("exit");
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      exitTimerRef.current = null;
      const next = (indexRef.current + 1) % totalPages;
      indexRef.current = next;
      setIndex(next);
      setPhase("enter");
    }, exitMs);
  }, [totalPages, exitMs]);

  React.useEffect(() => {
    indexRef.current = index;
  }, [index]);

  React.useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  React.useEffect(() => {
    if (!enabled || paused || !motionOk || totalPages <= 1) return;
    const t = setInterval(advance, intervalMs);
    return () => {
      clearInterval(t);
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [enabled, paused, motionOk, totalPages, advance, intervalMs, resetKey]);

  // Pause nonessential rotation while the tab is hidden (backgrounded app or
  // switched away). Browsers throttle timers in hidden tabs, which causes the
  // rotor to freeze mid-exit and resume with a stale phase; pausing here and
  // resuming a fresh 5s cadence on return keeps every section consistent with
  // zero timers running while invisible.
  React.useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      if (document.hidden) {
        hold();
      } else {
        release();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, hold, release]);

  React.useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  return { index, phase, totalPages, paused, hold, release };
}
