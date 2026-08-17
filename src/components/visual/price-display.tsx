import * as React from "react";
import { formatPrice, computeSavings } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — PriceDisplay (PROMPT 03 repair, shared primitive).
 *
 * One pricing view-model for every marketplace surface (cards + details):
 *  - fixed      → single current price
 *  - startingFrom → "Starting at ₹X" (package-tier services)
 *  - discounted → original price (struck) + current price (large) +
 *                 "SAVE ₹X • Y% OFF" badge
 *
 * All discount math flows through computeSavings, which returns null unless a
 * genuine discount exists (0 < current < original). A missing/invalid
 * original price never renders a fake SAVE badge or a negative saving.
 */
export interface PriceDisplayProps {
  /** Price the customer pays (INR). */
  currentPrice: number;
  /** Optional pre-discount price (INR). Only shown when it is a real discount. */
  originalPrice?: number;
  /** Prefix with a "Starting at" label (package-tier services). */
  startingFrom?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  currentPrice,
  originalPrice,
  startingFrom = false,
  size = "md",
  className,
}: PriceDisplayProps) {
  const savings =
    typeof originalPrice === "number" && Number.isFinite(originalPrice)
      ? computeSavings(originalPrice, currentPrice)
      : null;

  const priceCls =
    size === "lg"
      ? "text-3xl sm:text-4xl"
      : size === "sm"
        ? "text-lg sm:text-xl"
        : "text-xl sm:text-2xl";
  const struckCls =
    size === "lg" ? "text-sm sm:text-base" : "text-[10px] sm:text-xs";
  const saveCls =
    size === "lg" ? "px-3 py-1 text-[11px]" : "px-2 py-0.5 text-[9px]";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {startingFrom && (
        <span className="font-mono-label text-[9px] leading-none text-[var(--accent-azure)]">
          Starting at
        </span>
      )}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {savings && (
          <span
            className={cn(
              "font-mono-label text-[var(--ink-soft)] line-through",
              struckCls,
            )}
          >
            {formatPrice(savings.originalPrice)}
          </span>
        )}
        <span
          className={cn(
            "font-heading font-semibold tracking-tight text-[var(--ink)]",
            priceCls,
          )}
        >
          {formatPrice(currentPrice)}
        </span>
      </div>
      {savings && (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full font-mono-label font-semibold",
            saveCls,
            "bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.65_0.14_160)]",
          )}
        >
          SAVE {formatPrice(savings.savingAmount)}
          <span aria-hidden>•</span>
          {savings.savingPercentage}% OFF
        </span>
      )}
    </div>
  );
}
