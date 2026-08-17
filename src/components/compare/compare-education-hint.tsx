"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Columns3, ArrowDown } from "lucide-react";
import { COMPARE_TYPE_LABELS, useFavoritesStore } from "@/stores/favorites";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";
import type { ListingType } from "@/stores/favorites";

/**
 * FF TRUST — Compare Education Hint (PROMPT 4 Part 2 §37–§40).
 *
 * A small, elegant, non-annoying animated hint that teaches visitors about
 * Compare on marketplace routes. Text is generated from the listing type of
 * the current route ("Compare 2 FF IDs" / "Compare 2 Panels" /
 * "Compare 2 Paid Push services" / "Compare 2 Instagram packages").
 *
 * Behaviour contract:
 *  - one single global timer (never per-card), ~5s cycle with ~2.5s visible
 *  - stops permanently after a few cycles, or instantly once the visitor has
 *    actually used compare (store has ≥1 selected) — never nags a user who
 *    already knows
 *  - pointer-events-none (never blocks clicks), fixed position (never causes
 *    layout shift), never covers content on any breakpoint
 *  - respects prefers-reduced-motion (via performance tier) — renders nothing
 *  - timer cleaned up on unmount and when the tab is hidden
 */
export const COMPARE_HINT_CYCLE_MS = 5000;
export const COMPARE_HINT_SHOW_MS = 2600;
export const COMPARE_HINT_MAX_CYCLES = 4;

const HINT_TEXT: Record<ListingType, string> = {
  account: "Compare 2 FF IDs",
  panel: `Compare 2 ${COMPARE_TYPE_LABELS.panel}s`,
  "paid-push": `Compare 2 ${COMPARE_TYPE_LABELS["paid-push"]} services`,
  instagram: `Compare 2 ${COMPARE_TYPE_LABELS.instagram}s`,
};

/** Marketplace routes → listing type. Any other route shows no hint. */
const ROUTE_TYPE: Record<string, ListingType> = {
  "/accounts": "account",
  "/services": "panel",
  "/paid-push": "paid-push",
  "/instagram/views": "instagram",
  "/instagram/followers": "instagram",
  "/instagram/likes": "instagram",
};

export function CompareEducationHint() {
  const pathname = usePathname();
  const type = ROUTE_TYPE[pathname];
  const compareCount = useFavoritesStore((s) => s.compare.length);
  const tier = usePerformanceTier();

  const [visible, setVisible] = React.useState(false);
  const cyclesRef = React.useRef(0);

  const enabled = tier >= 1 && !!type;
  const alreadyUsing = compareCount > 0;

  React.useEffect(() => {
    if (!enabled || alreadyUsing) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const stop = () => {
      if (interval) clearInterval(interval);
      if (showTimer) clearTimeout(showTimer);
      interval = null;
      showTimer = null;
    };

    const show = () => {
      if (cyclesRef.current >= COMPARE_HINT_MAX_CYCLES) return;
      cyclesRef.current += 1;
      setVisible(true);
      if (showTimer) clearTimeout(showTimer);
      showTimer = setTimeout(() => setVisible(false), COMPARE_HINT_SHOW_MS);
    };

    const start = () => {
      stop();
      showTimer = setTimeout(show, COMPARE_HINT_CYCLE_MS);
      interval = setInterval(show, COMPARE_HINT_CYCLE_MS);
    };

    start();

    // Pause the whole cycle while the tab is hidden — no invisible timers.
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (cyclesRef.current < COMPARE_HINT_MAX_CYCLES) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [enabled, alreadyUsing]);

  if (!enabled || alreadyUsing || !visible) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-[54] -translate-x-1/2 sm:bottom-28 sm:left-auto sm:right-8 sm:translate-x-0"
      role="status"
      aria-live="polite"
    >
      <div
        className="compare-hint-chrome flex items-center gap-2 rounded-full px-3.5 py-2"
        style={{ boxShadow: "var(--glass-shadow-lift)" }}
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
          }}
        >
          <Columns3 className="h-3 w-3 text-white" />
        </span>
        <span className="whitespace-nowrap font-heading text-xs font-semibold text-[var(--ink)]">
          {HINT_TEXT[type]}
        </span>
        <span className="compare-hint-pulse flex h-4 w-4 shrink-0 items-center justify-center text-[var(--accent-azure)]">
          <ArrowDown className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}
