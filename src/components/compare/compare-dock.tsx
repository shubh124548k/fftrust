"use client";

import * as React from "react";
import Link from "next/link";
import { X, ArrowRight, Columns3, AlertCircle } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites";
import {
  getAccountById,
  getFeaturedAccounts,
} from "@/lib/selectors/accounts";
import {
  getPanelServiceById,
  getRankPushById,
  getFeaturedPanelServices,
  getFeaturedRankPush,
} from "@/lib/selectors/services";
import { cn } from "@/lib/utils";
import type { AccountListing, PanelSellerService, PaidPushService } from "@/data/types";

/** A compare entry resolved to its canonical record (non-null). */
type ResolvedCompareEntry =
  | { entry: { id: string; type: "account" }; record: AccountListing }
  | { entry: { id: string; type: "panel" }; record: PanelSellerService }
  | { entry: { id: string; type: "paid-push" }; record: PaidPushService };

/**
 * FF TRUST — Compare Dock.
 *
 * A floating glass bar that appears when at least 1 listing is selected for
 * comparison. Shows selected listing names, a "Compare" CTA, and a clear button.
 *
 * Features:
 *  - Type-safe: only same-type listings can be compared (enforced by the store)
 *  - Max 4 selections
 *  - Shows error message when cross-type comparison is attempted
 *  - Responsive: horizontal scroll on mobile, full row on desktop
 *  - Smooth entrance/exit animation
 *  - Links to /compare page
 */
export function CompareDock() {
  const compare = useFavoritesStore((s) => s.compare);
  const compareError = useFavoritesStore((s) => s.compareError);
  const clearCompareError = useFavoritesStore((s) => s.clearCompareError);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const clearCompare = useFavoritesStore((s) => s.clearCompare);
  const compareMax = useFavoritesStore((s) => s.compareMax);

  // Resolve all compare IDs to their records for display
  const resolved = React.useMemo(() => {
    const accounts = getFeaturedAccounts(999).records;
    const panels = getFeaturedPanelServices(999).records;
    const pushes = getFeaturedRankPush(999).records;

    return compare
      .map((entry) => {
        if (entry.type === "account") {
          const r = getAccountById(entry.id, accounts);
          return r ? { entry, record: r } : null;
        }
        if (entry.type === "panel") {
          const r = getPanelServiceById(entry.id, panels);
          return r ? { entry, record: r } : null;
        }
        const r = getRankPushById(entry.id, pushes);
        return r ? { entry, record: r } : null;
      })
      .filter((x): x is ResolvedCompareEntry => x !== null);
  }, [compare]);

  // Auto-clear error after 3 seconds
  React.useEffect(() => {
    if (!compareError) return;
    const t = setTimeout(() => clearCompareError(), 3000);
    return () => clearTimeout(t);
  }, [compareError, clearCompareError]);

  if (resolved.length === 0 && !compareError) return null;

  return (
    <>
      {/* Error toast */}
      {compareError && (
        <div
          className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 px-4"
          style={{ animation: "ff-slide-down 300ms cubic-bezier(0.22,1,0.36,1)" }}
        >
          <div
            className="glass-stack acrylic-sheen flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ boxShadow: "var(--glass-shadow-lift)" }}
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-[oklch(0.7_0.16_45)]" />
            <p className="text-xs font-medium text-[var(--ink)]">{compareError}</p>
            <button
              type="button"
              onClick={clearCompareError}
              aria-label="Dismiss"
              className="ml-1 text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Compare dock */}
      {resolved.length > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-[55] px-3 pb-3 sm:px-4 sm:pb-4"
          style={{ animation: "ff-slide-up 400ms cubic-bezier(0.22,1,0.36,1)" }}
        >
          <div className="container-wide">
            <div
              className="glass-stack acrylic-sheen mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
              style={{ boxShadow: "var(--glass-shadow-lift)" }}
            >
              {/* Header */}
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                  }}
                >
                  <Columns3 className="h-4 w-4 text-white" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xs font-semibold text-[var(--ink)]">
                    Compare ({resolved.length}/{compareMax})
                  </span>
                  <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">
                    {resolved[0]?.entry.type === "account" ? "Account IDs" : resolved[0]?.entry.type === "panel" ? "Panel Sellers" : "Paid Push"}
                  </span>
                </div>
              </div>

              {/* Selected items — horizontal scroll on mobile */}
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {resolved.map(({ entry, record }) => (
                  <div
                    key={entry.id}
                    className="glass-embed flex shrink-0 items-center gap-2 rounded-full py-1 pl-2 pr-1"
                  >
                    <span className="max-w-[120px] truncate text-xs font-medium text-[var(--ink)] sm:max-w-[160px]">
                      {record.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(entry.id, entry.type)}
                      aria-label={`Remove ${record.title} from compare`}
                      className="glass-embed inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[oklch(0.68_0.2_24)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="rounded-full px-3 py-2 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                >
                  Clear
                </button>
                <Link
                  href="/compare"
                  className={cn(
                    "magnetic inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-shadow",
                    resolved.length >= 2
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:shadow-[var(--neon-cyan)]"
                      : "cursor-not-allowed bg-[var(--muted)] text-[var(--ink-soft)]",
                  )}
                  aria-disabled={resolved.length < 2}
                  onClick={(e) => {
                    if (resolved.length < 2) e.preventDefault();
                  }}
                >
                  Compare {resolved.length}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
