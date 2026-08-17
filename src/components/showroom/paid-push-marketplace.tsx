"use client";

import * as React from "react";
import { ChevronDown, Trophy, Sparkles, Search, X } from "lucide-react";
import { RankPushCard } from "@/components/visual/service-card";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { RevealText } from "@/components/visual/reveal-text";
import { SampleNoticeBanner } from "@/components/visual/sample-notice-banner";
import { LuminousRings } from "@/components/visual/objects";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import {
  getFeaturedRankPush,
  filterRankPushPackages,
  sortRankPushPackages,
} from "@/lib/selectors/services";
import { buildRotationWindows } from "@/lib/rotation";
import { useAutoRotation } from "@/hooks/use-auto-rotation";
import { useServiceDetailStore } from "@/stores/service-detail";
import { cn } from "@/lib/utils";
import type { SortKey } from "@/data/types";
import { PRICE_SORT_OPTIONS } from "@/lib/design/constants";

/**
 * FF TRUST — Paid Push Marketplace (dark-only, simplified).
 *
 * Clean listing experience:
 *  - lightweight search input (filters the marketplace pool via the canonical
 *    search selector — empty results are honest, never fake)
 *  - NO filter panel (mode, price, tag filters removed)
 *  - Only two sort options: Price High→Low, Price Low→High
 *  - Gallery grid with premium RankPushCard (CS/BR)
 *  - Results count (honest, derived)
 *  - Empty state when no real data
 *  - SAMPLE frame when showing demo fixtures
 *
 * Never guarantees rank, wins, completion, anti-ban or safety. No cheats,
 * exploits or credential access. Future modes are data-discovered.
 *
 * Adding a new Paid Push record to the canonical data source automatically
 * updates this marketplace — no manual page editing required.
 */

const SORT_OPTIONS = PRICE_SORT_OPTIONS as { value: SortKey; label: string }[];

export function PaidPushMarketplace({ rotate = false }: { rotate?: boolean }) {
  const featured = React.useMemo(() => getFeaturedRankPush(12), []);
  const [sort, setSort] = React.useState<SortKey>("price-desc");
  const [query, setQuery] = React.useState("");
  const openDetail = useServiceDetailStore((s) => s.open);

  // Results are the marketplace pool (search-filtered when a query is entered),
  // sorted by the selected key.
  const results = React.useMemo(() => {
    const pool = query.trim()
      ? filterRankPushPackages({ search: query }, featured.records)
      : featured.records;
    return sortRankPushPackages(pool, sort);
  }, [query, featured.records, sort]);

  // PROMPT 3 — homepage rotation: sliding window (size 3, step 1, wrap).
  const pages = React.useMemo(() => buildRotationWindows(results), [results]);
  const resetKey = React.useMemo(() => results.map((r) => r.id).join("|"), [results]);
  const rotor = useAutoRotation(pages.length, {
    enabled: rotate,
    resetKey,
  });
  const visible = rotate
    ? pages[Math.min(rotor.index, pages.length - 1)] ?? []
    : results;
  const showRotor = rotate && results.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Progression hero */}
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="cyan" icon={<Trophy className="h-3 w-3" />}>Paid Push</StatusChip>
            <StatusChip tone="violet" icon={<Sparkles className="h-3 w-3" />}>Progression Marketplace</StatusChip>
          </div>
          <h3 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
            Paid Push — CS / <span className="font-display text-gradient-cyan italic">BR</span>
          </h3>
          <p className="max-w-xl text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
            CS Rank Push and BR Rank Push packages with explicit scope, requirements and honest evidence. No guaranteed rank, wins, completion, anti-ban or safety. No cheats, exploits or credential access. Scope &amp; effort only.
          </p>
          {/* No-guarantee disclosure — prominent */}
          <div className="rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.16)] p-4">
            <p className="font-mono-label text-[9px] text-[oklch(0.45_0.14_45)]">No guarantee</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)] text-pretty">
              No guaranteed rank, wins, completion, anti-ban or safety. No cheats, exploits, anti-cheat bypasses, unauthorized account access or credential collection. Scope &amp; effort only.
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <ParallaxLayer depth={2} className="relative h-40 w-40 sm:h-48 sm:w-48">
            <LuminousRings className="h-full w-full" />
          </ParallaxLayer>
        </div>
      </div>

      {/* SAMPLE frame — honest label when showing demo fixtures */}
      {featured.isSample && <SampleNoticeBanner />}

      {/* Compact controls — results count + search + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="neutral">{results.length} {results.length === 1 ? "result" : "results"}</StatusChip>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input — filters the marketplace pool */}
          <div className="relative min-w-[9rem]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packages…"
              aria-label="Search packages"
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
          <div className="relative min-w-0">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort packages" className="glass-embed w-full appearance-none rounded-full py-2 pl-3 pr-8 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:py-2.5 sm:pl-4 sm:pr-9 sm:text-sm">
              {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)] sm:right-3" />
          </div>
        </div>
      </div>

      {/* Grid or empty */}
      {results.length > 0 ? (
        showRotor ? (
          <div
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
                {visible.map((p) => (
                  <RankPushCard key={p.id} record={p} onDetails={() => openDetail(p.id)} />
                ))}
              </div>
            </div>
            {pages.length > 1 && (
              <div className="rotor-dots" aria-label="Paid push rotation position">
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
            {results.map((p, i) => (
              <RevealText key={p.id} delay={Math.min(i * 50, 300)}>
                <RankPushCard record={p} onDetails={() => openDetail(p.id)} />
              </RevealText>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No rank push packages available yet"
          description="When the owner publishes real CS/BR Rank Push packages, they will appear here automatically. FF TRUST never displays fake inventory."
        />
      )}
    </div>
  );
}
