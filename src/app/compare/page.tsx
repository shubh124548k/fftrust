"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Columns3,
  X,
  Trophy,
  Check,
  Heart,
  Play,
  MessageCircle,
  Info,
  Plus,
} from "lucide-react";
import {
  COMPARE_TYPE_LABELS,
  useFavoritesStore,
  type ListingType,
} from "@/stores/favorites";
import { SectionHeading } from "@/components/visual/section-heading";
import { EmptyState } from "@/components/visual/empty-state";
import { PricePlate } from "@/components/visual/status-chip";
import { PriceDisplay } from "@/components/visual/price-display";
import { PackageTierStrip } from "@/components/visual/package-tier-strip";
import { SafeVideo } from "@/components/visual/safe-video";
import { getAccountById } from "@/lib/selectors/accounts";
import { getPanelServiceById, getRankPushById } from "@/lib/selectors/services";
import { getSellerById } from "@/lib/selectors/sellers";
import { formatPrice as formatInr } from "@/lib/pricing";
import {
  getInstagramServiceByPackageId,
  formatQuantity,
  formatPrice,
  unitLabelForService,
  type InstagramPackageWithSavings,
} from "@/lib/selectors/instagram";
import { resolveListingMedia } from "@/lib/media";
import { accountWhatsAppContext, buildWhatsAppUrl } from "@/lib/whatsapp";
import { useDetailStore } from "@/stores/detail";
import { useServiceDetailStore } from "@/stores/service-detail";
import type { AccountListing, PanelSellerService, PaidPushService, InstagramServiceType } from "@/data/types";
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
 *  - Max 2 listings ("Compare up to 2 X")
 *  - Media per listing: cover, gallery thumbnails + opt-in video player
 *  - Actions per listing: Wishlist, View Details, WhatsApp inquiry CTA
 *  - Meaningful difference highlighting (fields that differ between the two)
 *  - Graceful 1-item state: removing one returns to a single-card state
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

/** Resolve the human-readable seller display name (falls back to the ref id). */
function sellerName(ref: string): string {
  return getSellerById(ref)?.displayName ?? ref;
}

/** Honest "You Save" text — only when a genuine discount exists in canonical data. */
function youSaveText(current: number, original?: number): string | null {
  if (typeof original !== "number" || original <= current) return null;
  const pct = Math.round((1 - current / original) * 100);
  return `${formatInr(original - current)} (${pct}% off)`;
}

const accountFields: CompareField[] = [
  { key: "price", label: "Price (INR)", getValue: (r: AccountListing) => String(r.priceInr), numeric: true, winnerDirection: "low" },
  {
    key: "youSave",
    label: "You Save",
    getValue: (r: AccountListing) => youSaveText(r.priceInr, r.originalPrice),
  },
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
  { key: "trust", label: "Trust Highlights", getValue: (r: AccountListing) => r.trustHighlights?.length ? r.trustHighlights.map((t) => t.label).join(", ") : null },
  { key: "seller", label: "Seller", getValue: (r: AccountListing) => sellerName(r.sellerRef) },
];

const panelFields: CompareField[] = [
  { key: "price", label: "Price (INR)", getValue: (r: PanelSellerService) => String(r.priceInr), numeric: true, winnerDirection: "low" },
  { key: "category", label: "Category", getValue: (r: PanelSellerService) => r.category },
  { key: "scope", label: "Scope", getValue: (r: PanelSellerService) => r.scope },
  { key: "included", label: "Included Features", getValue: (r: PanelSellerService) => r.included?.length ? String(r.included.length) : null, numeric: true, winnerDirection: "high" },
  { key: "excluded", label: "Excluded", getValue: (r: PanelSellerService) => r.excluded?.length ? String(r.excluded.length) : null },
  { key: "requirements", label: "Requirements", getValue: (r: PanelSellerService) => r.requirements?.length ? String(r.requirements.length) : null },
  { key: "trust", label: "Trust Highlights", getValue: (r: PanelSellerService) => r.trustHighlights?.length ? r.trustHighlights.map((t) => t.label).join(", ") : null },
  { key: "seller", label: "Seller", getValue: (r: PanelSellerService) => sellerName(r.sellerRef) },
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
  { key: "trust", label: "Trust Highlights", getValue: (r: PaidPushService) => r.trustHighlights?.length ? r.trustHighlights.map((t) => t.label).join(", ") : null },
  { key: "seller", label: "Seller", getValue: (r: PaidPushService) => sellerName(r.sellerRef) },
];

/** Normalized Instagram record for the comparison table. */
type InstagramCompareRecord = {
  id: string;
  title: string;
  priceInr: number;
  service: InstagramServiceType;
  pkg: InstagramPackageWithSavings;
};

const instagramFields: CompareField[] = [
  { key: "price", label: "Price (INR)", getValue: (r: InstagramCompareRecord) => String(r.priceInr), numeric: true, winnerDirection: "low" },
  { key: "service", label: "Service", getValue: (r: InstagramCompareRecord) => r.service.label },
  { key: "quantity", label: "Quantity", getValue: (r: InstagramCompareRecord) => formatQuantity(r.pkg.quantity) },
  { key: "original", label: "Original Price", getValue: (r: InstagramCompareRecord) => formatPrice(r.pkg.originalPrice) },
  { key: "saving", label: "You Save", getValue: (r: InstagramCompareRecord) => `${formatPrice(r.pkg.savingAmount)} (${r.pkg.savingPercentage}%)` },
  { key: "badge", label: "Badge", getValue: (r: InstagramCompareRecord) => r.pkg.badge ?? null },
];

const FIELDS_BY_TYPE: Record<ListingType, CompareField[]> = {
  account: accountFields,
  panel: panelFields,
  "paid-push": paidPushFields,
  instagram: instagramFields,
};

/** Marketplace route per compare type ("Add another X" target). */
const TYPE_HREF: Record<ListingType, string> = {
  account: "/accounts",
  panel: "/services",
  "paid-push": "/paid-push",
  instagram: "/instagram/views",
};

/** Compare records (canonical + normalized Instagram). */
type CompareRecord =
  | AccountListing
  | PanelSellerService
  | PaidPushService
  | InstagramCompareRecord;

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

/**
 * Difference highlighting — a field differs when both records provide a value
 * and the values are not equal. Used to visually point out what actually
 * differs between the two compared listings (PROMPT 4 §25).
 */
function computeDiffFields(records: CompareRecord[], fields: CompareField[]): Set<string> {
  const diffs = new Set<string>();
  for (const field of fields) {
    const values = records.map((r) => field.getValue(r));
    const provided = values.filter((v): v is string => v !== null);
    if (provided.length < 2) continue;
    if (new Set(provided).size > 1) diffs.add(field.key);
  }
  return diffs;
}

/** Open the canonical detail dossier for a compare record. */
function viewDetails(type: ListingType, record: CompareRecord) {
  if (type === "account") {
    useDetailStore.getState().open(record.id);
  } else if (type === "panel" || type === "paid-push") {
    useServiceDetailStore.getState().open(record.id);
  }
}

/** True for SAMPLE fixtures — compare labels them honestly (never as real). */
function isDemoRecord(record: CompareRecord): boolean {
  return "demo" in record && record.demo === true;
}

/** Build the primary WhatsApp inquiry CTA for a compare record. */
function whatsAppUrlFor(type: ListingType, record: CompareRecord): string {
  if (type === "account") {
    const a = record as AccountListing;
    return buildWhatsAppUrl(
      accountWhatsAppContext(a, "Interested in this account from the comparison — can I get more details?", true),
    );
  }
  if (type === "instagram") {
    const ig = record as InstagramCompareRecord;
    return buildWhatsAppUrl({
      id: ig.id,
      title: ig.title,
      price: ig.priceInr,
      category: ig.service.label,
      mode: `${formatQuantity(ig.pkg.quantity)} ${unitLabelForService(ig.service.key)}`,
      inquiry: "Interested in this Instagram package from the comparison — can I get more details?",
      buyer: true,
    });
  }
  const s = record as PanelSellerService | PaidPushService;
  return buildWhatsAppUrl({
    id: s.id,
    title: s.title,
    price: s.priceInr,
    category: type === "panel" ? (s as PanelSellerService).category : (s as PaidPushService).mode,
    sellerRef: s.sellerRef,
    inquiry: "Interested in this listing from the comparison — can I get more details?",
    buyer: true,
  });
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function ComparePage() {
  const compare = useFavoritesStore((s) => s.compare);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const clearCompare = useFavoritesStore((s) => s.clearCompare);
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  // Resolve all compare IDs to their canonical records. By-id lookup against
  // the FULL canonical pool (published + SAMPLE fixtures) — the page must
  // resolve exactly the records users can actually select on cards. The site's
  // current visible inventory is SAMPLE fixtures (always inside a labeled
  // SAMPLE frame); when the owner publishes real inventory the same lookup
  // resolves those records too. Direct by-id lookup, never full list builds.
  const { records, type } = React.useMemo(() => {
    if (compare.length === 0) return { records: [] as CompareRecord[], type: null };

    const firstType = compare[0].type;

    const resolved = compare
      .map((entry) => {
        if (entry.type !== firstType) return null; // type mismatch — skip
        if (entry.type === "account") {
          return getAccountById(entry.id) ?? null;
        }
        if (entry.type === "panel") {
          return getPanelServiceById(entry.id) ?? null;
        }
        if (entry.type === "instagram") {
          const match = getInstagramServiceByPackageId(entry.id);
          if (!match || !match.pkg.enabled) return null;
          return {
            id: match.pkg.id,
            title: `${match.service.label} — ${match.pkg.formattedQuantity}`,
            priceInr: match.pkg.discountPrice,
            service: match.service,
            pkg: match.pkg,
          } satisfies InstagramCompareRecord;
        }
        return getRankPushById(entry.id) ?? null;
      })
      .filter((r): r is CompareRecord => r !== null);

    return { records: resolved, type: firstType };
  }, [compare]);

  const fields = type ? FIELDS_BY_TYPE[type] : [];
  const winners = React.useMemo(() => records.length >= 2 ? computeWinners(records, fields) : {}, [records, fields]);
  const bestValueId = React.useMemo(() => records.length >= 2 ? computeBestValue(records, winners) : null, [records, winners]);
  const diffFields = React.useMemo(() => (records.length >= 2 ? computeDiffFields(records, fields) : new Set<string>()), [records, fields]);

  // WhatsApp CTAs per record (built once per render from canonical data).
  const waByRecord = React.useMemo(() => {
    if (!type) return new Map<string, string>();
    return new Map(records.map((r) => [r.id, whatsAppUrlFor(type, r)]));
  }, [type, records]);

  return (
    <main className="relative pt-28 pb-32 sm:pt-32">
      <div className="container-wide">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>

        {/* Heading */}
        <SectionHeading
          overline="Comparison"
          title="Side-by-side"
          italic="comparison"
          support="Compare listings of the same type — up to 2 at once. All data comes from canonical records — no fake statistics."
          id="compare-title"
        />

        {/* Content */}
        {type && records.length > 0 ? (
          <div className="mt-8 flex flex-col gap-6">
            {records.length >= 2 ? (
              <>
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

                <ComparisonTable
                  records={records}
                  fields={fields}
                  winners={winners}
                  bestValueId={bestValueId}
                  diffFields={diffFields}
                  type={type}
                  favorites={favorites}
                  waByRecord={waByRecord}
                  onRemove={(id) => toggleCompare(id, type)}
                  onToggleFavorite={toggleFavorite}
                  onViewDetails={(record) => viewDetails(type, record)}
                />
              </>
            ) : (
              /* Graceful 1-item state — a single selected listing + add-another prompt */
              <SingleCompareCard
                record={records[0]}
                type={type}
                favorites={favorites}
                waByRecord={waByRecord}
                onRemove={() => toggleCompare(records[0].id, type)}
                onToggleFavorite={toggleFavorite}
                onViewDetails={() => viewDetails(type, records[0])}
              />
            )}

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
              title="No listings selected for comparison"
              description="Use the compare icon (⇅) on any listing card to add it here. Compare up to 2 of the same type — Account IDs with Account IDs, Panel with Panel, Paid Push with Paid Push, or Instagram packages with Instagram packages."
              action={
                <Link
                  href="/accounts"
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
// MEDIA — cover, gallery thumbs + opt-in video player
// ============================================================

function CompareMedia({ record, type }: { record: CompareRecord; type: ListingType }) {
  const [videoOpen, setVideoOpen] = React.useState(false);

  if (type === "instagram") {
    const ig = record as InstagramCompareRecord;
    return (
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[oklch(0.3_0.1_290/0.7)] via-[oklch(0.26_0.11_196/0.6)] to-[oklch(0.2_0.12_24/0.6)]">
        <span className="text-3xl">{ig.service.emoji}</span>
        <span className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 font-mono-label text-[8px] text-white/80">
          {ig.service.label}
        </span>
      </div>
    );
  }

  const media = resolveListingMedia(
    record as AccountListing | PanelSellerService | PaidPushService,
    record.title,
  );
  if (videoOpen && media.videoUrl) {
    return <SafeVideo url={media.videoUrl} title={record.title} className="rounded-xl" />;
  }
  if (!media.frontImage && media.galleryImages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => media.videoUrl && setVideoOpen(true)}
        aria-label={media.videoUrl ? `Play video for ${record.title}` : undefined}
        className={cn(
          "group relative block aspect-video w-full overflow-hidden rounded-xl bg-[var(--elevated)]",
          media.videoUrl && "cursor-pointer",
        )}
      >
        {media.frontImage ? (
          <Image
            src={media.frontImage}
            alt={media.frontImageAlt}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[oklch(0.3_0.1_290/0.7)] to-[oklch(0.25_0.12_196/0.7)] font-heading text-lg font-semibold text-white/70">
            {record.title}
          </span>
        )}
        {media.videoUrl && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="ml-0.5 h-4 w-4 text-black" />
            </span>
          </span>
        )}
      </button>
      {media.galleryImages.length > 0 && (
        <div className="flex gap-1.5 overflow-hidden">
          {media.galleryImages.slice(0, 3).map((src) => (
            <span key={src} className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
              <Image src={src} alt="" fill sizes="56px" className="object-cover" unoptimized />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Per-column price block — one canonical pricing source per listing type:
 *  - Panel/Paid Push with `packages[]` → the same Basic/Pro/Premium tier strip
 *    shown on their cards (identical canonical data, never a manual copy)
 *  - everything else → the shared PriceDisplay (struck original + current +
 *    SAVE badge, auto-derived only when a genuine discount exists). */
function ComparePrice({ type, record }: { type: ListingType; record: CompareRecord }) {
  if (type === "instagram") {
    return <PricePlate value={record.priceInr} size="sm" />;
  }
  const r = record as AccountListing | PanelSellerService | PaidPushService;
  if ((type === "panel" || type === "paid-push") && (r as PanelSellerService | PaidPushService).packages?.length) {
    return (
      <PackageTierStrip
        packages={(r as PanelSellerService | PaidPushService).packages!}
        className="w-full"
      />
    );
  }
  return (
    <PriceDisplay
      currentPrice={r.priceInr}
      originalPrice={(r as AccountListing).originalPrice}
      size="sm"
    />
  );
}

/** Per-column actions: Wishlist, View Details, WhatsApp CTA. */
function CompareActions({
  type,
  record,
  favorites,
  waUrl,
  onToggleFavorite,
  onViewDetails,
}: {
  type: ListingType;
  record: CompareRecord;
  favorites: string[];
  waUrl: string;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (record: CompareRecord) => void;
}) {
  const isFav = favorites.includes(record.id);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onToggleFavorite(record.id)}
        aria-label={isFav ? `Remove ${record.title} from wishlist` : `Add ${record.title} to wishlist`}
        aria-pressed={isFav}
        className={cn(
          "glass-embed inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          isFav ? "text-[oklch(0.72_0.18_8)]" : "text-[var(--ink-soft)] hover:text-[oklch(0.72_0.18_8)]",
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
      </button>
      {type !== "instagram" && (
        <button
          type="button"
          onClick={() => onViewDetails(record)}
          className="glass-embed inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-[var(--ink)] transition-colors hover:text-[var(--accent-azure)]"
        >
          <Info className="h-3 w-3" />
          View Details
        </button>
      )}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="magnetic inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1.5 text-[11px] font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)]"
      >
        <MessageCircle className="h-3 w-3" />
        Inquiry
      </a>
    </div>
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
  diffFields,
  type,
  favorites,
  waByRecord,
  onRemove,
  onToggleFavorite,
  onViewDetails,
}: {
  records: CompareRecord[];
  fields: CompareField[];
  winners: Record<string, string[]>;
  bestValueId: string | null;
  diffFields: Set<string>;
  type: ListingType;
  favorites: string[];
  waByRecord: Map<string, string>;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (record: CompareRecord) => void;
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
                  {isDemoRecord(record) && (
                    <span className="mb-1 inline-flex items-center rounded-full bg-[oklch(0.7_0.14_45/0.18)] px-2 py-0.5 text-[8px] font-semibold text-[oklch(0.78_0.13_45)]">
                      SAMPLE
                    </span>
                  )}
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

              {/* Media */}
              <CompareMedia record={record} type={type} />

              {/* Price — same canonical pricing structure as the listing cards */}
              <div className="border-b border-[var(--border)] pb-3">
                <span className="mb-1.5 block font-mono-label text-[9px] text-[var(--ink-soft)]">Price</span>
                <ComparePrice type={type} record={record} />
              </div>

              {/* Actions */}
              <CompareActions
                type={type}
                record={record}
                favorites={favorites}
                waUrl={waByRecord.get(record.id) ?? ""}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={onViewDetails}
              />

              {/* Fields */}
              {fields.map((field) => {
                const value = field.getValue(record);
                const isWinner = winners[field.key]?.includes(record.id);
                const differs = diffFields.has(field.key);
                return (
                  <div
                    key={field.key}
                    className={cn(
                      "flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-b-0",
                      differs && "bg-[oklch(0.78_0.1_60/0.06)] -mx-2 px-2",
                    )}
                  >
                    <span className="flex shrink-0 items-center gap-1 font-mono-label text-[9px] text-[var(--ink-soft)]">
                      {differs && (
                        <span className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded bg-[oklch(0.78_0.1_60/0.25)] px-1 text-[8px] font-bold text-[oklch(0.82_0.13_55)]" title="Differs">
                          ≠
                        </span>
                      )}
                      {field.label}
                    </span>
                    <span
                      className={cn(
                        "text-right text-sm font-medium",
                        value === null ? "text-[var(--ink-soft)] italic" : "text-[var(--ink)]",
                        isWinner && "text-[var(--accent-azure)] font-semibold",
                        differs && !isWinner && "text-[oklch(0.82_0.13_55)]",
                      )}
                    >
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
          <span className="font-mono-label text-[9px] text-[var(--accent-azure)]">{COMPARE_TYPE_LABELS[type]}</span>
          <div className="flex min-w-0 flex-1 justify-end gap-2">
            {records.map((record) => (
              <div key={record.id} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                {isDemoRecord(record) && (
                  <span className="inline-flex items-center rounded-full bg-[oklch(0.7_0.14_45/0.18)] px-1.5 py-0.5 text-[7px] font-semibold text-[oklch(0.78_0.13_45)]">SAMPLE</span>
                )}
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

        {/* Mobile media strip */}
        <div className="grid grid-cols-2 gap-3">
          {records.map((record) => (
            <CompareMedia key={record.id} record={record} type={type} />
          ))}
        </div>

        {/* Field-by-field comparison */}
        {fields.map((field) => {
          const differs = diffFields.has(field.key);
          return (
            <div key={field.key} className={cn("glass-stack acrylic-sheen rounded-2xl p-4", differs && "ring-1 ring-[oklch(0.78_0.1_60/0.35)]")}>
              <p className="mb-3 flex items-center gap-1.5 font-mono-label text-[9px] text-[var(--accent-azure)]">
                {differs && (
                  <span className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded bg-[oklch(0.78_0.1_60/0.25)] px-1 text-[8px] font-bold text-[oklch(0.82_0.13_55)]">≠</span>
                )}
                {field.label}
                {differs && <span className="text-[8px] normal-case text-[oklch(0.82_0.13_55)]">differs</span>}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {records.map((record) => {
                  const value = field.getValue(record);
                  const isWinner = winners[field.key]?.includes(record.id);
                  return (
                    <div key={record.id} className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs text-[var(--ink-soft)]">
                        {record.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-medium",
                          value === null ? "text-[var(--ink-soft)] italic" : "text-[var(--ink)]",
                          isWinner && "text-[var(--accent-azure)] font-semibold",
                          differs && !isWinner && "text-[oklch(0.82_0.13_55)]",
                        )}
                      >
                        {value === null ? "Not provided" : value}
                        {isWinner && <Check className="ml-1 inline h-3 w-3" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ============================================================
// SINGLE-ITEM STATE — graceful 1-card view + "Add another"
// ============================================================

function SingleCompareCard({
  record,
  type,
  favorites,
  waByRecord,
  onRemove,
  onToggleFavorite,
  onViewDetails,
}: {
  record: CompareRecord;
  type: ListingType;
  favorites: string[];
  waByRecord: Map<string, string>;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onViewDetails: (record: CompareRecord) => void;
}) {
  return (
    <div
      className="glass-stack acrylic-sheen flex flex-col gap-3 rounded-2xl p-5"
      style={{ boxShadow: "var(--glass-shadow-lift)" }}
    >
      <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="min-w-0">
          <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">{COMPARE_TYPE_LABELS[type]} — selected</p>
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

      <CompareMedia record={record} type={type} />

      <div className="border-b border-[var(--border)] pb-3">
        <span className="mb-1.5 block font-mono-label text-[9px] text-[var(--ink-soft)]">Price</span>
        <ComparePrice type={type} record={record} />
      </div>

      <CompareActions
        type={type}
        record={record}
        favorites={favorites}
        waUrl={waByRecord.get(record.id) ?? ""}
        onToggleFavorite={onToggleFavorite}
        onViewDetails={onViewDetails}
      />

      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--accent-cyan)/40] px-4 py-3">
        <p className="text-xs text-[var(--ink-soft)]">
          Add another {COMPARE_TYPE_LABELS[type].toLowerCase()} to unlock the side-by-side comparison.
        </p>
        <Link
          href={TYPE_HREF[type]}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent-cyan)/12] px-3 py-1.5 text-xs font-medium text-[var(--accent-cyan)] transition-colors hover:bg-[var(--accent-cyan)/20]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another {COMPARE_TYPE_LABELS[type]}
        </Link>
      </div>
    </div>
  );
}
