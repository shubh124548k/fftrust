"use client";

import * as React from "react";
import {
  ArrowUpRight,
  ShieldCheck,
  Mail,
  Receipt,
  KeyRound,
  Crown,
  Sword,
  Sparkles,
  Heart,
  Columns3,
  ImageOff,
} from "lucide-react";
import { GlassCard } from "./glass-panel";
import { HoloChromeCard, FloatingPricePlate, MediaStage } from "./holo-chrome-card";
import { StatusChip, PricePlate, EvidenceChip } from "./status-chip";
import type { AccountListing } from "@/data/types";
import { buildWhatsAppUrl, accountWhatsAppContext } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useFavoritesStore } from "@/stores/favorites";
import { useDetailStore } from "@/stores/detail";
import { resolveListingMedia, getListingAllImages } from "@/lib/media";
import { ImageLightbox } from "./image-lightbox";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Account Card (PROMPT 06 advanced system).
 *
 * A small interactive 3D composition, not a rectangle. Distinct visual states:
 *  • rest        — base glass, calm
 *  • hover       — card-lift (transform-only, no layout shift)
 *  • focus       — cyan focus-visible ring
 *  • active      — press scale-down
 *  • featured    — holo border + Featured chip
 *  • media-rich  — real image stage with lazy load + reserved aspect
 *  • no-media    — decorative crystalline gradient + motif
 *  • unavailable — published=false overlay (archived)
 *  • archived    — demo badge + SAMPLE frame
 *
 * Controlled depth variation by card role (featured gets pedestal+holo,
 * regular gets base, no-media gets float). Favorite + compare toggles persist
 * via Zustand. View Details link scrolls to the record (future detail route).
 * A premium card remains readable with animation disabled (reduced-motion).
 */
export type AccountCardVariant = "default" | "featured" | "compact" | "no-media";

export function AccountCard({
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
  const { frontImage, frontImageAlt, videoUrl } = resolveListingMedia(record, record.title);
  const hasRealMedia = !!frontImage;
  const isFeatured = !!record.featured && !record.demo;
  const isUnavailable = !record.published;
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  // All lightbox images — shared helper (deduplicated, validated, max 30)
  const allImages = getListingAllImages(record, record.title);

  // Controlled depth variation by role — not identical tilt.
  const chromeVariant = isFeatured ? "featured" : isUnavailable ? "unavailable" : variant === "compact" ? "compact" : "default";

  return (
    <>
    <HoloChromeCard
      variant={chromeVariant}
      className={cn("group flex flex-col", className)}
      aria-label={`Account ${record.title}`}
    >
      {/* Media stage — MEDIUM sized, premium product-card proportion.
          Uses clamp() for fluid responsive sizing without breakpoints.
          Mobile: ~120px, Desktop: ~180px — balanced, premium. */}
      <div
        className="relative w-full overflow-hidden rounded-t-3xl"
        style={{ height: "clamp(120px, 24vw, 180px)" }}
      >
        {hasRealMedia && frontImage ? (
          <button
            type="button"
            aria-label={`View images for ${record.title}`}
            onClick={(e) => {
              e.preventDefault();
              setLightboxOpen(true);
            }}
            className="absolute inset-0 z-[1] cursor-pointer"
          >
            <img
              src={frontImage}
              alt={frontImageAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                const fallback = t.parentElement?.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "block";
              }}
            />
          </button>
        ) : null}
        {/* Decorative fallback (also shown when no media or broken) */}
        <div
          aria-hidden
          className={cn("absolute inset-0", hasRealMedia && "hidden")}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.22) 50%, oklch(0.9 0.02 245 / 0.5) 100%)",
          }}
        >
          {/* Floating crystalline motif (decorative, not evidence) */}
          <svg
            aria-hidden
            className="drift-float absolute right-4 top-4 opacity-70"
            width="84"
            height="84"
            viewBox="0 0 84 84"
            fill="none"
          >
            <polygon
              points="42,8 72,26 72,58 42,76 12,58 12,26"
              stroke="oklch(1 0 0 / 0.7)"
              strokeWidth="1"
              fill="oklch(1 0 0 / 0.12)"
            />
            <polygon
              points="42,22 60,33 60,51 42,62 24,51 24,33"
              stroke="oklch(0.74 0.15 196 / 0.6)"
              strokeWidth="0.8"
              fill="none"
            />
          </svg>
          {!hasRealMedia && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="h-6 w-6 text-[var(--ink-soft)] opacity-40" />
            </div>
          )}
        </div>

        {/* Top-left badges — Featured + Unavailable only (no SAMPLE in production) */}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-5.5rem)] flex-nowrap gap-1.5 overflow-hidden sm:left-4 sm:top-4 sm:max-w-none sm:flex-wrap">
          {isFeatured && <StatusChip tone="cyan" icon={<Sparkles className="h-3 w-3" />}>Featured</StatusChip>}
          {isUnavailable && <StatusChip tone="neutral">Unavailable</StatusChip>}
        </div>

        {/* Top-right action toggles — favorite + compare */}
        <div className="absolute right-2.5 top-2.5 flex gap-1.5 sm:right-3 sm:top-3">
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
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
          <StatusChip tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>
            {record.category}
          </StatusChip>
        </div>

        {/* Floating price plate — bottom-right, constrained width on mobile */}
        <div className="absolute -bottom-px right-3 max-w-[calc(100%-1.5rem)] sm:right-4">
          <div
            className="glass-float rounded-xl px-2.5 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2"
            style={{ boxShadow: "var(--glass-shadow-lift)" }}
          >
            <PricePlate value={record.priceInr} size="sm" />
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
        </div>

        {/* Data chips — level/rank always shown, counts only on sm+ */}
        <div className="flex flex-wrap gap-1">
          <StatusChip tone="azure">Lvl {record.level}</StatusChip>
          {record.rank && <StatusChip tone="violet">{record.rank}</StatusChip>}
          {record.prime && (
            <StatusChip tone="cyan" icon={<Crown className="h-3 w-3" />}>Prime</StatusChip>
          )}
          {/* Counts shown only on sm+ to keep mobile cards compact */}
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

        {/* Evidence treatment — honest provenance, never a guarantee.
            Hidden on mobile (shown in detail view) to keep cards compact. */}
        <div className="hidden flex-wrap gap-1.5 border-t border-[var(--border)] pt-3 sm:flex">
          <EvidenceChip label="Bound email" present={record.evidence.hasBoundEmail} icon={<Mail className="h-3 w-3" />} />
          <EvidenceChip label="Receipt" present={record.evidence.hasOriginalReceipt} icon={<Receipt className="h-3 w-3" />} />
          <EvidenceChip label="Recovery" present={record.evidence.hasRecoveryAccess} icon={<KeyRound className="h-3 w-3" />} />
        </div>
        {/* Disclaimer — hidden on mobile, shown on sm+ */}
        <p className="font-mono-label hidden text-[9px] leading-relaxed text-[var(--ink-soft)] sm:block">
          {siteConfig.trustDisclaimer}
        </p>

        {/* Actions — WhatsApp + View Details */}
        <div className="mt-auto flex items-center gap-1.5 pt-0.5 sm:gap-2 sm:pt-1">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Inquire
          </a>
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

    {/* Image Lightbox — beautiful fullscreen gallery viewer */}
    <ImageLightbox
      images={allImages}
      videoUrl={videoUrl}
      title={record.title}
      open={lightboxOpen}
      onClose={() => setLightboxOpen(false)}
    />
    </>
  );
}
