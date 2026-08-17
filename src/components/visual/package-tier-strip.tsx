"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { ServicePackage } from "@/data/types";

/**
 * FF TRUST — Compact package-tier preview strip (PROMPT 4 + PROMPT 5).
 *
 * A single source for the Basic/Pro/Premium tier summary used on service
 * cards (Panel Seller + Paid Push). Reads straight from the canonical
 * `packages[]` array — adding a tier to src/data automatically shows up
 * here with zero JSX editing.
 *
 * PROMPT 5: each tier now shows up to 2–3 highlights when present in the
 * canonical data. Full feature lists appear in Details, not on the card.
 *
 * Design lock: compact 3-column grid, each cell = tier label + current
 * price + badge + up to 2 highlights, cyan ring on cheapest tier.
 */
export function PackageTierStrip({
  packages,
  className,
}: {
  packages: ServicePackage[];
  className?: string;
}) {
  if (!packages || packages.length === 0) return null;
  const minPrice = Math.min(...packages.map((p) => p.currentPrice));

  return (
    <div className={cn("grid grid-cols-3 gap-1.5", className)} aria-label="Package tiers">
      {packages.map((pkg) => {
        const isCheapest = pkg.currentPrice === minPrice;
        const highlights = (pkg.highlights ?? []).slice(0, 2);
        return (
          <div
            key={pkg.id}
            className={cn(
              "glass-embed flex min-w-0 flex-col gap-0.5 rounded-xl px-2 py-1.5",
              isCheapest && "ring-1 ring-[var(--accent-cyan)/50]",
            )}
          >
            <span className="flex items-center gap-1 font-mono-label text-[8px] uppercase tracking-wide text-[var(--ink-soft)]">
              {pkg.label}
              {pkg.badge && (
                <span className="inline-flex h-2.5 items-center rounded bg-[oklch(0.74_0.15_196/0.2)] px-1 text-[6px] font-bold text-[var(--accent-azure)]">
                  {pkg.badge}
                </span>
              )}
            </span>
            <span
              className={cn(
                "truncate text-[11px] font-semibold sm:text-xs",
                isCheapest ? "text-[var(--accent-azure)]" : "text-[var(--ink)]",
              )}
            >
              {formatPrice(pkg.currentPrice)}
            </span>
            <span className="font-mono-label text-[7px] text-[var(--ink-soft)]">
              {isCheapest ? "Starting" : `was ${formatPrice(pkg.originalPrice)}`}
            </span>
            {highlights.length > 0 && (
              <ul className="mt-0.5 flex flex-col gap-0.5">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-1 text-[7px] leading-tight text-[var(--ink-soft)]">
                    <Check className="h-2 w-2 shrink-0 text-[oklch(0.55_0.14_160)]" aria-hidden />
                    <span className="truncate">{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
