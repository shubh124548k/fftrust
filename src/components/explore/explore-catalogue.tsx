"use client";

import * as React from "react";
import { ChevronDown, Heart, Columns3, Search, X } from "lucide-react";
import { AccountCard } from "@/components/visual/account-card";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { RevealText } from "@/components/visual/reveal-text";
import { SampleNoticeBanner } from "@/components/visual/sample-notice-banner";
import {
  getFeaturedAccounts,
  getListingVideos,
  searchAccounts,
  sortAccounts,
  type AccountSortKey,
} from "@/lib/selectors/accounts";
import type { AccountListing } from "@/data/types";
import { buildRotationWindows } from "@/lib/rotation";
import { useAutoRotation } from "@/hooks/use-auto-rotation";
import { useFavoritesStore } from "@/stores/favorites";
import { cn } from "@/lib/utils";
import { PRICE_SORT_OPTIONS } from "@/lib/design/constants";

/**
 * FF TRUST — Explore Catalogue (dark-only, simplified).
 *
 * Clean listing experience:
 *  - lightweight search input (filters the active tab's pool via the canonical
 *    search selector — empty results are honest, never fake)
 *  - NO filter sidebar / filter sheet / filter button
 *  - Data-gated browse tabs (All / Featured / New / Premium / Budget / Video) —
 *    each tab is derived from the real pool and hidden when it has no records
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

const SORT_OPTIONS = PRICE_SORT_OPTIONS as { value: AccountSortKey; label: string }[];

type BrowseTabKey = "all" | "featured" | "new" | "premium" | "budget" | "video";

interface BrowseTab {
  key: BrowseTabKey;
  label: string;
  records: AccountListing[];
}

const NEW_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

/** Derive the data-gated browse tabs from the real pool. Empty tabs are
 *  dropped so the UI never shows a lens with zero listings. */
function buildBrowseTabs(base: AccountListing[]): BrowseTab[] {
  const prices = base.map((a) => a.priceInr).sort((x, y) => x - y);
  const median = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
  const hasVideo = (a: AccountListing) =>
    getListingVideos(a).length > 0 || Boolean(a.videoUrl);
  const tabs: BrowseTab[] = [
    { key: "all", label: "All", records: base },
    { key: "featured", label: "Featured", records: base.filter((a) => a.featured) },
    {
      key: "new",
      label: "New",
      records: base
        .filter((a) => Date.now() - new Date(a.createdAt).getTime() <= NEW_WINDOW_MS)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    },
    { key: "premium", label: "Premium", records: base.filter((a) => a.priceInr >= median) },
    { key: "budget", label: "Budget", records: base.filter((a) => a.priceInr < median) },
    { key: "video", label: "Video", records: base.filter(hasVideo) },
  ];
  return tabs.filter((t) => t.records.length > 0);
}

export function ExploreCatalogue({ rotate = false }: { rotate?: boolean }) {
  const { records: base, isSample } = React.useMemo(() => getFeaturedAccounts(999), []);
  const tabs = React.useMemo(() => buildBrowseTabs(base), [base]);
  const [tab, setTab] = React.useState<BrowseTabKey>("all");
  const [sort, setSort] = React.useState<AccountSortKey>("price-desc");
  const [query, setQuery] = React.useState("");
  const favoritesCount = useFavoritesStore((s) => s.favorites.length);
  const compareCount = useFavoritesStore((s) => s.compare.length);

  // Active tab falls back to the first available tab when the pool changes and
  // the previously active tab is no longer data-gated.
  const activeTab =
    tabs.find((t) => t.key === tab) ?? tabs[0] ?? { key: "all" as const, label: "All", records: [] };

  // Results are the active tab's pool (filtered by search when a query is
  // entered), sorted by the selected key.
  const results = React.useMemo(() => {
    const pool = query.trim()
      ? searchAccounts(query, activeTab.records)
      : activeTab.records;
    return sortAccounts(pool, sort);
  }, [query, activeTab.records, sort]);

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
      {/* SAMPLE frame — honest label when showing demo fixtures */}
      {isSample && <SampleNoticeBanner />}

      {/* Data-gated browse tabs — only tabs with records are rendered */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Browse accounts">
          {tabs.map((t) => {
            const isActive = activeTab.key === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:text-sm",
                  isActive
                    ? "bg-[var(--accent-azure)] text-[var(--ink)] shadow-[var(--neon-soft)]"
                    : "glass-embed text-[var(--ink-soft)] hover:text-[var(--ink)]",
                )}
              >
                {t.label}
                <span className={cn("font-mono-label text-[9px]", isActive ? "text-[var(--ink)]/70" : "text-[var(--ink-soft)]/70")}>
                  {t.records.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Compact controls row — search + sort + favorites/compare counts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Results count */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="neutral">
            {results.length} {results.length === 1 ? "result" : "results"}
          </StatusChip>
        </div>

        {/* Search + favorites/compare counts + sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input — filters the active tab's pool */}
          <div className="relative min-w-[9rem]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings…"
              aria-label="Search accounts"
              className="glass-embed w-full appearance-none rounded-full py-2 pl-8 pr-7 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:py-2.5 sm:pl-9 sm:text-sm"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

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
