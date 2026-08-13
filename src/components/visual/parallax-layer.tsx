"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";
import { PARALLAX } from "@/lib/design/tokens";

/**
 * FF TRUST — Parallax Layer.
 *
 * Layered parallax driven by scroll position (rAF-throttled, transform-only).
 * `depth` chooses the pixel offset multiplier. Disabled on tier 0 and reduced
 * motion — degrades to static composition. Mobile uses a reduced multiplier
 * via the tier system.
 */
export function ParallaxLayer({
  children,
  className,
  depth = 2,
  axis = "y",
}: {
  children: React.ReactNode;
  className?: string;
  depth?: 1 | 2 | 3;
  axis?: "x" | "y";
}) {
  const tier = usePerformanceTier();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (tier === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const offset = (depth === 1 ? PARALLAX.layer1 : depth === 2 ? PARALLAX.layer2 : PARALLAX.layer3) * tier;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const winH = window.innerHeight;
        // progress: -1 (below) .. 0 (centered) .. 1 (above)
        const progress = (rect.top + rect.height / 2 - winH / 2) / winH;
        const translate = progress * offset * -1;
        el.style.transform = axis === "y" ? `translate3d(0, ${translate}px, 0)` : `translate3d(${translate}px, 0, 0)`;
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
  }, [tier, depth, axis]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
