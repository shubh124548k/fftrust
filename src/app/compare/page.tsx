"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Columns3, X, Trophy, Check } from "lucide-react";
import { useFavoritesStore, type ListingType } from "@/stores/favorites";
import { SectionHeading } from "@/components/visual/section-heading";
import { EmptyState } from "@/components/visual/empty-state";
import { PricePlate } from "@/components/visual/status-chip";
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
import type { AccountListing, PanelSellerService, PaidPushService } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Compare Page.
 *
 * Data-driven comparison page. Resolves selected listing IDs against
 * canonical data and renders a type-specific comparison schema.
 *
 * Architecture:
 *   CANONICAL DATA → LISTING TYPE → COMPARISON SCHEMA → COMPARISON UI
 *
 * Features:
 *  - Type-safe: only same-type listings are compared (enforced by the store)
 *  - Account ↔ Account / Panel ↔ Panel / Paid Push ↔ Paid Push only
 *  - Max 4 listings
 *  - Responsive: side-by-side columns on desktop, stacked rows on mobile
 *  - Winner/best-value system (only when data supports it)
 *  - No fake statistics — "Not provided" for missing fields
 */

// ============================================================
// COMPARISON SCHEMA — data-driven field definitions
// ============================================================

type CompareField = {
  key: string;
  label: string;
  /** Returns the value for this field, or null if not provided. */
  getValue: (record: any) => string | null;
  /** For numeric fields, used to determine the winner. */
  numeric?: boolean;
  /** For numeric fields: "low" means lowest value wins, "high" means highest. */
  winnerDirection?: "low" | "high";
};

const accountFields: CompareField[] = [
  { key: "price", label: "Price (INR)", getValue: (r: AccountListing) => String(r.priceInr), numeric: true, winnerDirection: "low" },
  { key: "level", label: "Level", getValue: (r: AccountListing) => String(r.level), numeric: true, winnerDirection: "high" },
  { key: "rank", label: "Rank", getValue: (r: AccountListing) => r.rank ?? null },
  { key: "prime", label: "Prime", getValue: (r: AccountListing) => r.prime ? "Yes" : "No" },
  { key: "category", label: "Category", getValue: (r: AccountListing) => r.category },
  { key: "region", label: "Region", getValue: (r: AccountListing) => r.region },
  { key: "collections", label: "Collections", getValue: (r: AccountListing) => r.collections?.length ? String(r.collections.length) : null, numeric: true, winnerDirection: "high" },
  { key: "weapons", label: "Weapons", getValue: (r: AccountListing) => r.weapons?.length ? String(r.weapons.length) : null, numeric: true, winnerDirection: "high" },
  { key: "evo", label: "Evo", getValue: (r: AccountListing) => r.evo?.length ? String(r.evo.length) : null, numeric: true, winnerDirection: "high" },
  { key: "boundEmail", label: "Bound Email", getValue: (r: AccountListing) => r.evidence.hasBoundEmail ? "Yes" : "No" },
  { key: "receipt", label: "Original Receipt", getValue: (r: AccountListing) => r.evidence.hasOriginalReceipt ? "Yes" : "No" },
  { key: "recovery", label: "Recovery Access", getValue: (r: AccountListing) => r.evidence.hasRecoveryAccess ? "Yes" : "No" },
  { key: "seller", label: "Seller", getValue: (r: AccountListing) => r.sellerRef },
];

const panelFields: CompareField[] = [
  { key: "price", label: "Price (INR)", getValue: (r: PanelSellerService) => String(r.priceInr), numeric: true, winnerDirection: "low" },
  { key: "category", label: "Category", getValue: (r: PanelSellerService) => r.category },
  { key: "scope", label: "Scope", getValue: (r: PanelSellerService) => r.scope },
  { key: "included", label: "Included Features", getValue: (r: PanelSellerService) => r.included?.length ? String(r.included.length) : null, numeric: true, winnerDirection: "high" },
  { key: "excluded", label: "Excluded", getValue: (r: PanelSellerService) => r.excluded?.length ? String(r.excluded.length) : null },
  { key: "requirements", label: "Requirements", getValue: (r: PanelSellerService) => r.requirements?.length ? String(r.requirements.length) : null },
  { key: "seller", label: "Seller", getValue: (r: PanelSellerService) => r.sellerRef },
  { key: "tags", label: "Tags", getValue: (r: PanelSellerService) => r.tags?.length ? r.tags.join(", ") : null },
];

const paidPushFields: CompareField[] = [
  { key: "price", label: "Price (INR)", getValue: (r: PaidPushService) => String(r.priceInr), numeric: true, winnerDirection: "low" },
  { key: "mode", label: "Mode", getValue: (r: PaidPushService) => `${r.mode} Rank Push` },
  { key: "fromRank", label: "From Rank", getValue: (r: PaidPushService) => r.fromRank },
  { key: "toRank", label: "To Rank", getValue: (r: PaidPushService) => r.toRank },
  { key: "packageTier", label: "Package Tier", getValue: (r: PaidPushService) => r.packageTier },
  { key: "scope", label: "Scope", getValue: (r: PaidPushService) => r.scope },
  { key: "schedule", label: "Schedule", getValue: (r: PaidPushService) => r.schedule ?? null },
  { key: "requirements", label: "Requirements", getValue: (r: PaidPushService) => r.requirements?.length ? String(r.requirements.length) : null },
  { key: "seller", label: "Seller", getValue: (r: PaidPushService) => r.sellerRef },
  { key: "tags", label: "Tags", getValue: (r: PaidPushService) => r.tags?.length ? r.tags.join(", ") : null },
];

const FIELDS_BY_TYPE: Record<ListingType, CompareField[]> = {
  account: accountFields,
  panel: panelFields,
  "paid-push": paidPushFields,
};

const TYPE_LABELS: Record<ListingType, string> = {
  account: "Account ID",
  panel: "Panel Seller",
  "paid-push": "Paid Push",
};

// ============================================================
// WINNER LOGIC — only when data supports it
// ============================================================

function computeWinners(records: any[], fields: CompareField[]): Record<string, string[]> {
  const winners: Record<string, string[]> = {};
  for (const field of fields) {
    if (!field.numeric || !field.winnerDirection) continue;
    const values = records.map((r) => {
      const v = field.getValue(r);
      return { id: r.id, num: v ? Number(v) : null };
    });
    const valid = values.filter((v) => v.num !== null);
    if (valid.length < 2) continue; // need at least 2 to compare
    const best = field.winnerDirection === "low"
      ? Math.min(...valid.map((v) => v.num!))
      : Math.max(...valid.map((v) => v.num!));
    winners[field.key] = valid.filter((v) => v.num === best).map((v) => v.id);
  }
  return winners;
}

function computeBestValue(records: any[], winners: Record<string, string[]>): string | null {
  // Best Value = lowest price winner (only if there's a clear single winner)
  const priceWinners = winners["price"];
  if (!priceWinners || priceWinners.length !== 1) return null;
  return priceWinners[0];
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function ComparePage() {
  const compare = useFavoritesStore((s) => s.compare);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const clearCompare = useFavoritesStore((s) => s.clearCompare);

  // Resolve all compare IDs to their records
  const { records, type } = React.useMemo(() => {
    if (compare.length === 0) return { records: [], type: null };

    const firstType = compare[0].type;
    const accounts = getFeaturedAccounts(999).records;
    const panels = getFeaturedPanelServices(999).records;
    const pushes = getFeaturedRankPush(999).records;

    const resolved = compare
      .map((entry) => {
        if (entry.type !== firstType) return null; // type mismatch — skip
        if (entry.type === "account") {
          const r = getAccountById(entry.id, accounts);
          return r ? r : null;
        }
        if (entry.type === "panel") {
          const r = getPanelServiceById(entry.id, panels);
          return r ? r : null;
        }
        const r = getRankPushById(entry.id, pushes);
        return r ? r : null;
      })
      .filter((r): r is AccountListing | PanelSellerService | PaidPushService => r !== null);

    return { records: resolved, type: firstType };
  }, [compare]);

  const fields = type ? FIELDS_BY_TYPE[type] : [];
  const winners = React.useMemo(() => records.length >= 2 ? computeWinners(records, fields) : {}, [records, fields]);
  const bestValueId = React.useMemo(() => records.length >= 2 ? computeBestValue(records, winners) : null, [records, winners]);

  return (
    <main className="relative pt-28 pb-32 sm:pt-32">
      <div className="container-wide">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Heading */}
        <SectionHeading
          overline="Comparison"
          title="Side-by-side"
          italic="comparison"
          support="Compare listings of the same type — Account IDs with Account IDs, Panel Sellers with Panel Sellers, Paid Push with Paid Push. All data comes from canonical records — no fake statistics."
          id="compare-title"
        />

        {/* Content */}
        {records.length >= 2 && type ? (
          <div className="mt-8 flex flex-col gap-6">
            {/* Winner banner */}
            {bestValueId && (
              <div
                className="glass-stack acrylic-sheen flex items-center gap-3 rounded-2xl p-4"
                style={{
                  boxShadow: "0 0 24px -4px oklch(0.74 0.15 196 / 0.3), var(--glass-shadow-lift)",
                  animation: "ff-slide-up 500ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                    boxShadow: "var(--neon-cyan)",
                  }}
                >
                  <Trophy className="h-5 w-5 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Best Value — Lowest Price</p>
                  <p className="truncate font-heading text-sm font-semibold text-[var(--ink)]">
                    {records.find((r) => r.id === bestValueId)?.title}
                  </p>
                </div>
              </div>
            )}

            {/* Desktop: side-by-side columns | Mobile: stacked rows */}
            <ComparisonTable
              records={records}
              fields={fields}
              winners={winners}
              bestValueId={bestValueId}
              type={type}
              onRemove={(id) => toggleCompare(id, type)}
            />

            {/* Clear button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={clearCompare}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              icon={<Columns3 className="h-6 w-6" />}
              title={records.length === 0 ? "No listings selected for comparison" : "Add at least 2 listings to compare"}
              description="Use the compare icon (⇅) on any listing card to add it here. You can compare Account IDs with other Account IDs, Panel Sellers with Panel Sellers, or Paid Push with Paid Push — up to 4 at once."
              action={
                <Link
                  href="/#explore"
                  className="magnetic inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                >
                  Browse listings
                </Link>
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// COMPARISON TABLE — responsive (desktop columns / mobile rows)
// ============================================================

function ComparisonTable({
  records,
  fields,
  winners,
  bestValueId,
  type,
  onRemove,
}: {
  records: (AccountListing | PanelSellerService | PaidPushService)[];
  fields: CompareField[];
  winners: Record<string, string[]>;
  bestValueId: string | null;
  type: ListingType;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      {/* Desktop: side-by-side columns (hidden on mobile) */}
      <div className="hidden gap-4 md:flex">
        {records.map((record) => {
          const isBestValue = record.id === bestValueId;
          return (
            <div
              key={record.id}
              className={cn(
                "glass-stack acrylic-sheen flex flex-1 flex-col gap-3 rounded-2xl p-5",
                isBestValue && "ring-2 ring-[oklch(0.74_0.15_196/0.5)]",
              )}
              style={{
                boxShadow: isBestValue
                  ? "0 0 24px -4px oklch(0.74 0.15 196 / 0.3), var(--glass-shadow-lift)"
                  : "var(--glass-shadow)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div className="min-w-0">
                  {isBestValue && (
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[oklch(0.74_0.15_196/0.15)] px-2 py-0.5 text-[8px] font-semibold text-[var(--accent-azure)]">
                      <Trophy className="h-2.5 w-2.5" />
                      Best Value
                    </span>
                  )}
                  <h3 className="truncate font-heading text-sm font-semibold text-[var(--ink)]">{record.title}</h3>
                  <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">{record.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(record.id)}
                  aria-label="Remove from compare"
                  className="glass-embed inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--ink-soft)] hover:text-[oklch(0.68_0.2_24)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Price */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">Price</span>
                <PricePlate value={record.priceInr} size="sm" />
              </div>
              {/* Fields */}
              {fields.map((field) => {
                const value = field.getValue(record);
                const isWinner = winners[field.key]?.includes(record.id);
                return (
                  <div key={field.key} className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-b-0">
                    <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">{field.label}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      value === null ? "text-[var(--ink-soft)] italic" : "text-[var(--ink)]",
                      isWinner && "text-[var(--accent-azure)] font-semibold",
                    )}>
                      {value === null ? "Not provided" : value}
                      {isWinner && <Check className="ml-1 inline h-3 w-3" />}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Mobile: stacked rows (hidden on desktop) */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Listing name row */}
        <div className="glass-stack acrylic-sheen flex items-center justify-between gap-2 rounded-2xl p-4">
          <span className="font-mono-label text-[9px] text-[var(--accent-azure)]">{TYPE_LABELS[type]}</span>
          <div className="flex min-w-0 flex-1 justify-end gap-2">
            {records.map((record) => (
              <div key={record.id} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                {record.id === bestValueId && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[oklch(0.74_0.15_196/0.15)] px-1.5 py-0.5 text-[7px] font-semibold text-[var(--accent-azure)]">
                    <Trophy className="h-2 w-2" />
                    Best
                  </span>
                )}
                <p className="line-clamp-2 text-center text-xs font-semibold text-[var(--ink)]">{record.title}</p>
                <button
                  type="button"
                  onClick={() => onRemove(record.id)}
                  aria-label="Remove from compare"
                  className="text-[var(--ink-soft)] hover:text-[oklch(0.68_0.2_24)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Field-by-field comparison */}
        {fields.map((field) => (
          <div key={field.key} className="glass-stack acrylic-sheen rounded-2xl p-4">
            <p className="mb-3 font-mono-label text-[9px] text-[var(--accent-azure)]">{field.label}</p>
            <div className="grid grid-cols-1 gap-2">
              {records.map((record) => {
                const value = field.getValue(record);
                const isWinner = winners[field.key]?.includes(record.id);
                return (
                  <div key={record.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate text-xs text-[var(--ink-soft)]">
                      {record.title}
                    </span>
                    <span className={cn(
                      "shrink-0 text-sm font-medium",
                      value === null ? "text-[var(--ink-soft)] italic" : "text-[var(--ink)]",
                      isWinner && "text-[var(--accent-azure)] font-semibold",
                    )}>
                      {value === null ? "Not provided" : value}
                      {isWinner && <Check className="ml-1 inline h-3 w-3" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
