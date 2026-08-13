"use client";

import * as React from "react";
import { ChevronDown, Server, Sparkles } from "lucide-react";
import { PanelServiceCard } from "@/components/visual/service-card";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { RevealText } from "@/components/visual/reveal-text";
import { DataCube, ControllerGeometry } from "@/components/visual/objects";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import {
  getFeaturedPanelServices,
  sortPanelServices,
} from "@/lib/selectors/services";
import { buildRotationWindows } from "@/lib/rotation";
import { useAutoRotation } from "@/hooks/use-auto-rotation";
import { useServiceDetailStore } from "@/stores/service-detail";
import { cn } from "@/lib/utils";
import type { SortKey } from "@/data/types";

/**
 * FF TRUST — Panel Seller Showroom (dark-only, simplified).
 *
 * Clean listing experience:
 *  - NO search bar
 *  - NO filter panel
 *  - Only two sort options: Price High→Low, Price Low→High
 *  - Gallery grid with premium Holo-Chrome cards
 *  - Results count (honest, derived)
 *  - Empty state when no real data
 *  - SAMPLE frame when showing demo fixtures
 *
 * Adding a new Panel Seller record to the canonical data source
 * automatically updates this showroom — no manual page editing required.
 */

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price-desc", label: "Price · High to Low" },
  { value: "price-asc", label: "Price · Low to High" },
];

export function PanelSellerShowroom({ rotate = false }: { rotate?: boolean }) {
  const featured = getFeaturedPanelServices(12);
  const [sort, setSort] = React.useState<SortKey>("price-desc");
  const openDetail = useServiceDetailStore((s) => s.open);

  // Results are always the featured pool, sorted by the selected key.
  const results = React.useMemo(
    () => sortPanelServices(featured.records, sort),
    [featured.records, sort],
  );

  // PROMPT 3 — homepage rotation: sliding window (size 3, step 1, wrap).
  const pages = React.useMemo(() => buildRotationWindows(results), [results]);
  const rotor = useAutoRotation(pages.length, {
    enabled: rotate,
    // Stable id-list key (see explore-catalogue) — identity-stable across renders.
    resetKey: results.map((r) => r.id).join("|"),
  });
  const visible = rotate
    ? pages[Math.min(rotor.index, pages.length - 1)] ?? []
    : results;
  const showRotor = rotate && results.length > 0;
  const stageRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Showroom hero */}
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="violet" icon={<Server className="h-3 w-3" />}>Panel Seller</StatusChip>
            <StatusChip tone="cyan" icon={<Sparkles className="h-3 w-3" />}>Service Showroom</StatusChip>
          </div>
          <h3 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
            Panel &amp; <span className="font-display text-gradient-cyan italic">Services</span>
          </h3>
          <p className="max-w-xl text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
            A futuristic studio of panel, top-up and care services — each with explicit scope, included/excluded lists and honest evidence. No credential collection, no persistent access. Adding one canonical service updates this catalogue and WhatsApp automatically.
          </p>
        </div>
        <div className="relative flex items-center justify-center gap-4">
          <ParallaxLayer depth={2} className="relative h-32 w-32 sm:h-40 sm:w-40"><DataCube className="h-full w-full" /></ParallaxLayer>
          <ParallaxLayer depth={1} className="relative h-24 w-24 sm:h-32 sm:w-32"><ControllerGeometry className="h-full w-full" /></ParallaxLayer>
        </div>
      </div>

      {/* Compact controls — results count + sort only */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="neutral">{results.length} {results.length === 1 ? "result" : "results"}</StatusChip>
        </div>
        <div className="relative min-w-0">
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort services" className="glass-embed w-full appearance-none rounded-full py-2 pl-3 pr-8 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:py-2.5 sm:pl-4 sm:pr-9 sm:text-sm">
            {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)] sm:right-3" />
        </div>
      </div>

      {/* Grid or empty */}
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
                {visible.map((s) => (
                  <PanelServiceCard key={s.id} record={s} onDetails={() => openDetail(s.id)} />
                ))}
              </div>
            </div>
            {pages.length > 1 && (
              <div className="rotor-dots" aria-label="Panel rotation position">
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
            {results.map((s, i) => (
              <RevealText key={s.id} delay={Math.min(i * 50, 300)}>
                <PanelServiceCard record={s} onDetails={() => openDetail(s.id)} />
              </RevealText>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          icon={<Server className="h-6 w-6" />}
          title="No panel services available yet"
          description="When the owner publishes real Panel Seller services, they will appear here automatically. FF TRUST never displays fake inventory."
        />
      )}
    </div>
  );
}
