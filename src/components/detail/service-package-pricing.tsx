"use client";

import * as React from "react";
import { BadgeCheck, ArrowRight, Check, X, Clock, Truck, MousePointerClick } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip } from "@/components/visual/status-chip";
import { computeSavings, formatPrice } from "@/lib/pricing";
import type { ServicePackage } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Service Package Pricing (PROMPT 02 Parts 10/12 + PROMPT 5).
 *
 * Renders package-tier pricing from canonical data when a service listing
 * carries `packages[]`. Each tier shows: label, original price (struck),
 * current price, computed savings, badge, and ALL optional fields
 * (highlights, features, duration, delivery, included, excluded) — only
 * rendered when present. Renders nothing when the listing has no packages.
 *
 * PROMPT 5: full per-tier information. Card preview shows only highlights;
 * Details shows everything.
 */
export function ServicePackagePricing({
  packages,
  title = "Packages & pricing",
  selectedId,
  onSelect,
}: {
  packages: ServicePackage[];
  title?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const validPackages = packages.filter((p) => computeSavings(p.originalPrice, p.currentPrice) !== null);
  if (validPackages.length === 0) return null;

  const starting = Math.min(...validPackages.map((p) => p.currentPrice));
  const selectable = typeof onSelect === "function";

  return (
    <GlassPanel depth="float" className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-mono-label text-[9px] text-[var(--accent-azure)]">
          {title}
          {selectable && (
            <span className="inline-flex items-center gap-1 normal-case text-[var(--ink-soft)]">
              <MousePointerClick className="h-3 w-3" />
              tap a tier to select
            </span>
          )}
        </p>
        <span className="rounded-full border border-[var(--border)] px-3 py-1 font-mono-label text-[9px] text-[var(--ink-soft)]">
          Starting at {formatPrice(starting)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {validPackages.map((pkg) => {
          const s = computeSavings(pkg.originalPrice, pkg.currentPrice);
          if (!s) return null;
          const isSelected = selectable && pkg.id === selectedId;
          const inner = (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-heading text-sm font-semibold text-[var(--ink)]">{pkg.label}</span>
                  {pkg.badge && (
                    <StatusChip tone="cyan" icon={<BadgeCheck className="h-3 w-3" />}>{pkg.badge}</StatusChip>
                  )}
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.74_0.15_196/0.15)] px-2 py-0.5 text-[9px] font-semibold text-[var(--accent-azure)]">
                      <Check className="h-3 w-3" />
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-[var(--ink-soft)] line-through">{formatPrice(pkg.originalPrice)}</span>
                  <ArrowRight className="h-3 w-3 text-[var(--ink-soft)]" aria-hidden />
                  <span className={cn("font-heading text-lg font-bold", isSelected ? "text-[var(--accent-azure)]" : "text-gradient-cyan")}>{formatPrice(pkg.currentPrice)}</span>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    "bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.65_0.14_160)]",
                  )}
                >
                  SAVE {formatPrice(s.savingAmount)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    "bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.65_0.14_160)]",
                  )}
                >
                  {s.savingPercentage}% OFF
                </span>
              </div>

              {/* Per-tier details — only render fields that exist */}
              {(pkg.highlights?.length || pkg.features?.length || pkg.duration || pkg.delivery || pkg.included?.length || pkg.excluded?.length) ? (
                <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3">
                  {/* Highlights */}
                  {pkg.highlights && pkg.highlights.length > 0 && (
                    <div>
                      <p className="font-mono-label mb-1 text-[8px] text-[var(--accent-azure)]">Highlights</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {pkg.highlights.map((h, i) => (
                          <li key={i} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--ink)]">
                            <Check className="h-2.5 w-2.5 shrink-0 text-[oklch(0.55_0.14_160)]" /> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div>
                      <p className="font-mono-label mb-1 text-[8px] text-[var(--ink-soft)]">Features</p>
                      <ul className="space-y-0.5">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[10px] text-[var(--ink-soft)]">
                            <Check className="h-2.5 w-2.5 shrink-0 text-[oklch(0.55_0.14_160)]" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duration + Delivery */}
                  {(pkg.duration || pkg.delivery) && (
                    <div className="flex flex-wrap gap-3">
                      {pkg.duration && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--ink-soft)]">
                          <Clock className="h-3 w-3 shrink-0" /> {pkg.duration}
                        </span>
                      )}
                      {pkg.delivery && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--ink-soft)]">
                          <Truck className="h-3 w-3 shrink-0" /> {pkg.delivery}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Included / Excluded */}
                  {(pkg.included?.length || pkg.excluded?.length) ? (
                    <div className="grid grid-cols-2 gap-3">
                      {pkg.included && pkg.included.length > 0 && (
                        <div>
                          <p className="font-mono-label mb-0.5 text-[8px] text-[oklch(0.55_0.14_160)]">Included</p>
                          <ul className="space-y-0.5">
                            {pkg.included.map((inc, i) => (
                              <li key={i} className="flex items-center gap-1 text-[9px] text-[var(--ink)]">
                                <Check className="h-2 w-2 shrink-0 text-[oklch(0.55_0.14_160)]" /> {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {pkg.excluded && pkg.excluded.length > 0 && (
                        <div>
                          <p className="font-mono-label mb-0.5 text-[8px] text-[var(--ink-soft)]">Excluded</p>
                          <ul className="space-y-0.5">
                            {pkg.excluded.map((exc, i) => (
                              <li key={i} className="flex items-center gap-1 text-[9px] text-[var(--ink-soft)]">
                                <X className="h-2 w-2 shrink-0 text-[oklch(0.6_0.14_45)]" /> {exc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          );
          const baseClasses = "relative overflow-hidden rounded-2xl border p-4 transition-all";
          if (!selectable) {
            return (
              <div
                key={pkg.id}
                className={cn(baseClasses, "border-[var(--border)] hover:border-[var(--accent-azure)]")}
              >
                {inner}
              </div>
            );
          }
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onSelect(pkg.id)}
              aria-pressed={isSelected}
              aria-label={`Select ${pkg.label} package — ${formatPrice(pkg.currentPrice)}`}
              className={cn(
                baseClasses,
                "cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
                isSelected
                  ? "border-[var(--accent-cyan)] ring-2 ring-[var(--accent-cyan)/40]"
                  : "border-[var(--border)] hover:border-[var(--accent-azure)]",
              )}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </GlassPanel>
  );
}
