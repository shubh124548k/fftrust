"use client";

import * as React from "react";
import {
  ArrowUpRight,
  ShieldCheck,
  Crown,
  Sword,
  Sparkles,
  Play,
  Heart,
  Columns3,
} from "lucide-react";
import { HoloChromeCard } from "./holo-chrome-card";
import { StatusChip } from "./status-chip";
import { TrustHighlights } from "./trust-highlights";
import { PriceDisplay } from "./price-display";
import { CardMediaStage } from "./card-media-stage";
import { SellerBadge } from "./seller-badge";
import { ImageLightbox } from "./image-lightbox";
import type { AccountListing } from "@/data/types";
import { buildWhatsAppUrl, accountWhatsAppContext } from "@/lib/whatsapp";
import { useFavoritesStore } from "@/stores/favorites";
import { useDetailStore } from "@/stores/detail";
import { resolveListingMedia, getListingAllImages } from "@/lib/media";
import { cn } from "@/lib/utils";
import { AuthGate } from "@/components/auth/auth-gate";

/**
 * FF TRUST — Account Card (PROMPT 06 advanced system).
 *
 * A small interactive 3D composition, not a rectangle. Distinct visual states:
 *  • rest        — base glass, calm
 *  • hover       — card-lift (transform-only, no layout shift)
 *  • focus       — cyan focus-visible ring
 *  • active      — press scale-down
 *  • featured    — holo border + Featured chip
 *  • media-rich  — rotating media stage (cover → gallery, 5s crossfade)
 *  • no-media    — decorative crystalline gradient + motif
 *  • unavailable — published=false overlay (archived)
 *
 * PROMPT 03 repair contract:
 *  - WHAT: title · WHO: prominent Seller: badge · KEY HIGHLIGHTS: level/rank/
 *    Prime/counts · VIDEO: stage badge cue · PRICE: 3-part (struck original +
 *    current + SAVE badge, auto-derived) · COMPARE: card toggle · OPEN-BUY:
 *    Inquire + Details.
 *  - Wishlist + compare use the single persisted Zustand store (synced with
 *    details + tray + navbar counts). Child controls never trigger parent nav.
 *  - Evidence/provenance lives in the Detail dossier — not the card.
 */
export type AccountCardVariant = "default" | "featured" | "compact" | "no-media";

const ACCOUNT_FALLBACK_GRADIENT =
  "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.22) 50%, oklch(0.9 0.02 245 / 0.5) 100%)";

export const AccountCard = React.memo(function AccountCard({
  record,
  className,
  variant = "default",
}: {
  record: AccountListing;
  className?: string;
  variant?: AccountCardVariant;
}) {
  const wa = buildWhatsAppUrl(
    accountWhatsAppContext(
      record,
      "Interested in this account. Please share more detail.",
      true,
    ),
  );
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(record.id));
  const isComparing = useFavoritesStore((s) => s.compare.some((e) => e.id === record.id));
  const openDetail = useDetailStore((s) => s.open);

  const weaponCount = record.weapons?.length ?? 0;
  const collectionCount = record.collections?.length ?? 0;
  const evoCount = record.evo?.length ?? 0;
  const { frontImage, videoUrl } = resolveListingMedia(record, record.title);
  // All lightbox images — shared helper (deduplicated, validated, max 30)
  const allImages = getListingAllImages(record, record.title);
  const isFeatured = !!record.featured && !record.demo;
  const isUnavailable = !record.published;
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const chromeVariant = isFeatured ? "featured" : isUnavailable ? "unavailable" : variant === "compact" ? "compact" : "default";

  return (
    <>
    <HoloChromeCard
      variant={chromeVariant}
      className={cn("group flex flex-col", className)}
      aria-label={`Account ${record.title}`}
    >
      {/* Media stage — MEDIUM sized, premium product-card proportion */}
      <div
        className="relative w-full overflow-hidden rounded-t-3xl"
        style={{ height: "clamp(120px, 24vw, 180px)" }}
      >
        <CardMediaStage
          images={allImages}
          frontImage={frontImage}
          title={record.title}
          fallbackGradient={ACCOUNT_FALLBACK_GRADIENT}
          onOpenLightbox={() => setLightboxOpen(true)}
        />

        {/* Top-left badges — Featured + Unavailable + Video only */}
        <div className="absolute left-3 top-3 z-[2] flex max-w-[calc(100%-5.5rem)] flex-nowrap gap-1.5 overflow-hidden sm:left-4 sm:top-4 sm:max-w-none sm:flex-wrap">
          {isFeatured && <StatusChip tone="cyan" icon={<Sparkles className="h-3 w-3" />}>Featured</StatusChip>}
          {isUnavailable && <StatusChip tone="neutral">Unavailable</StatusChip>}
          {videoUrl && <StatusChip tone="azure" icon={<Play className="h-3 w-3" />}>Video</StatusChip>}
        </div>

        {/* Top-right action toggles — favorite + compare (single persisted state) */}
        <div className="absolute right-2.5 top-2.5 z-[2] flex gap-1.5 sm:right-3 sm:top-3">
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(record.id);
            }}
            className={cn(
              "glass-embed inline-flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
              isFavorite ? "text-[oklch(0.55_0.2_330)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-violet)]",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
          </button>
          <button
            type="button"
            aria-label={isComparing ? "Remove from compare" : "Add to compare"}
            aria-pressed={isComparing}
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(record.id, "account");
            }}
            className={cn(
              "glass-embed inline-flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
              isComparing ? "text-[var(--accent-azure)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-azure)]",
            )}
          >
            <Columns3 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom-left category chip */}
        <div className="absolute bottom-3 left-3 z-[2] sm:bottom-4 sm:left-4">
          <StatusChip tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>
            {record.category}
          </StatusChip>
        </div>

        {/* Floating price plate — 3-part price (struck original + current + SAVE) */}
        <div className="absolute -bottom-px right-3 z-[2] max-w-[calc(100%-1.5rem)] sm:right-4">
          <div
            className="glass-float rounded-xl px-2.5 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2"
            style={{ boxShadow: "var(--glass-shadow-lift)" }}
          >
            <PriceDisplay
              currentPrice={record.priceInr}
              originalPrice={record.originalPrice}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Content plane — compact on mobile, full on sm+ */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-4 sm:gap-3 sm:p-5 sm:pt-7">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold leading-tight text-[var(--ink)] sm:text-lg">
            {record.title}
          </h3>
          <p className="mt-0.5 font-mono-label text-[9px] text-[var(--ink-soft)] sm:mt-1 sm:text-[10px]">
            {record.id} · {record.region}
          </p>
          <SellerBadge sellerRef={record.sellerRef} showLabel className="mt-1.5" />
        </div>

        {/* Key highlights — level/rank always shown, counts only on sm+ */}
        <div className="flex flex-wrap gap-1">
          <StatusChip tone="azure">Lvl {record.level}</StatusChip>
          {record.rank && <StatusChip tone="violet">{record.rank}</StatusChip>}
          {record.prime && (
            <StatusChip tone="cyan" icon={<Crown className="h-3 w-3" />}>Prime</StatusChip>
          )}
          {collectionCount > 0 && (
            <StatusChip tone="neutral"><span className="hidden sm:inline">Collections · </span>{collectionCount}</StatusChip>
          )}
          {weaponCount > 0 && (
            <StatusChip tone="neutral" icon={<Sword className="h-3 w-3" />}><span className="hidden sm:inline">Weapons · </span>{weaponCount}</StatusChip>
          )}
          {evoCount > 0 && (
            <StatusChip tone="neutral"><span className="hidden sm:inline">Evo · </span>{evoCount}</StatusChip>
          )}
        </div>

        {/* Trust highlights — data-driven, never fabricated */}
        <TrustHighlights items={record.trustHighlights} max={3} className="mt-1" />

        {/* Actions — Inquire + View Details */}
        <div className="mt-auto flex items-center gap-1.5 pt-0.5 sm:gap-2 sm:pt-1">
          <AuthGate action={{ type: "inquiry", listingId: record.id, listingType: "account", url: wa }}>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Inquire
            </a>
          </AuthGate>
          <button
            type="button"
            aria-label={`View details for ${record.title}`}
            onClick={() => openDetail(record.id)}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-full border border-[var(--border)] px-3 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:h-9 sm:flex-none"
          >
            Details
            <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>
      </div>
    </HoloChromeCard>

    {/* Media Lightbox — unified gallery viewer (images + video, one sequence) */}
    <ImageLightbox
      images={allImages}
      videoUrl={videoUrl}
      title={record.title}
      open={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
    />
    </>
  );
});
