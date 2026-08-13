"use client";

import * as React from "react";
import { ChevronDown, Heart, Columns3 } from "lucide-react";
import { AccountCard } from "@/components/visual/account-card";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { RevealText } from "@/components/visual/reveal-text";
import {
  getFeaturedAccounts,
  sortAccounts,
  type AccountSortKey,
} from "@/lib/selectors/accounts";
import { buildRotationWindows } from "@/lib/rotation";
import { useAutoRotation } from "@/hooks/use-auto-rotation";
import { useFavoritesStore } from "@/stores/favorites";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Explore Catalogue (dark-only, simplified).
 *
 * Clean listing experience:
 *  - NO search bar
 *  - NO filter sidebar / filter sheet / filter button
 *  - Only two sort options: Price High→Low, Price Low→High
 *  - Gallery grid with controlled depth variation
 *  - Results count (honest, derived)
 *  - Empty state when no real data
 *  - SAMPLE frame when showing demo fixtures
 *
 * All data comes from canonical selectors. No fake popularity, ratings or
 * reviews. Adding a new account record to the canonical data source
 * automatically updates this listing — no manual page editing required.
 */

const SORT_OPTIONS: { value: AccountSortKey; label: string }[] = [
  { value: "price-desc", label: "Price · High to Low" },
  { value: "price-asc", label: "Price · Low to High" },
];

export function ExploreCatalogue({ rotate = false }: { rotate?: boolean }) {
  const featured = getFeaturedAccounts(24);
  const [sort, setSort] = React.useState<AccountSortKey>("price-desc");
  const favoritesCount = useFavoritesStore((s) => s.favorites.length);
  const compareCount = useFavoritesStore((s) => s.compare.length);

  // Results are always the featured pool, sorted by the selected key.
  // No filter logic — all published records are shown.
  const results = React.useMemo(
    () => sortAccounts(featured.records, sort),
    [featured.records, sort],
  );

  // PROMPT 3 — homepage rotation: a sliding window (size 3, step 1, wrap)
  // over the FULL sorted pool. window count == pool length, so the section
  // visibly rotates every 5 seconds even with the current 3-record sample
  // pool, and added/removed records automatically join/leave the windows.
  const pages = React.useMemo(() => buildRotationWindows(results), [results]);
  const rotor = useAutoRotation(pages.length, {
    enabled: rotate,
    // Stable key: the id-list string only changes when the pool/order changes
    // (sort, data edit) — NOT on every render. A changing identity would reset
    // the rotor to window 0 after every render and block visible rotation.
    resetKey: results.map((r) => r.id).join("|"),
  });
  const stageRef = React.useRef<HTMLDivElement>(null);
  const visible = rotate
    ? pages[Math.min(rotor.index, pages.length - 1)] ?? []
    : results;
  const showRotor = rotate && results.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Compact controls row — sort + favorites/compare counts only */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Results count */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="neutral">
            {results.length} {results.length === 1 ? "result" : "results"}
          </StatusChip>
        </div>

        {/* Favorites + compare counts + sort */}
        <div className="flex items-center gap-2">
          {/* Favorites + compare counts — hidden on mobile to save space */}
          <span className="glass-embed hidden items-center gap-1 rounded-full px-2.5 py-1.5 text-[var(--ink-soft)] sm:inline-flex">
            <Heart className="h-3 w-3" />
            <span className="font-mono-label text-[9px]">{favoritesCount}</span>
          </span>
          <span className="glass-embed hidden items-center gap-1 rounded-full px-2.5 py-1.5 text-[var(--ink-soft)] sm:inline-flex">
            <Columns3 className="h-3 w-3" />
            <span className="font-mono-label text-[9px]">{compareCount}</span>
          </span>
          {/* Sort — only Price High→Low / Low→High */}
          <div className="relative min-w-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as AccountSortKey)}
              aria-label="Sort accounts"
              className="glass-embed w-full appearance-none rounded-full py-2 pl-3 pr-8 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:py-2.5 sm:pl-4 sm:pr-9 sm:text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)] sm:right-3" />
          </div>
        </div>
      </div>

      {/* Grid or empty state */}
      {results.length > 0 ? (
        showRotor ? (
          <div
            ref={stageRef}
            className="rotor-stage"
            data-rotor-page={rotor.index}
            data-rotor-total={pages.length}
            data-rotor-paused={rotor.paused}
            data-rotor-rotate="true"
            onPointerEnter={rotor.hold}
            onPointerLeave={rotor.release}
            onFocusCapture={rotor.hold}
            onBlurCapture={rotor.release}
            onPointerDownCapture={rotor.hold}
          >
            <div
              key={rotor.index}
              className={cn("rotor-page", rotor.phase === "exit" && "rotor-leave")}
            >
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((a) => (
                  <AccountCard
                    key={a.id}
                    record={a}
                    variant={a.featured ? "featured" : "default"}
                  />
                ))}
              </div>
            </div>
            {pages.length > 1 && (
              <div className="rotor-dots" aria-label="Accounts rotation position">
                {pages.map((_, i) => (
                  <span
                    key={i}
                    className={cn("rotor-dot", i === rotor.index && "is-active")}
                    aria-hidden={i !== rotor.index}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((a, i) => (
              <RevealText key={a.id} delay={Math.min(i * 50, 300)}>
                <AccountCard
                  record={a}
                  variant={a.featured ? "featured" : "default"}
                />
              </RevealText>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="No accounts available yet"
          description="When the owner publishes real Free Fire account listings, they will appear here automatically. FF TRUST never displays fake inventory."
        />
      )}
    </div>
  );
}
