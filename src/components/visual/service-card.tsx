"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Check,
  X,
  Layers,
  Trophy,
  ImageOff,
  Sparkles,
  ArrowRight,
  Heart,
  Columns3,
} from "lucide-react";
import { GlassCard } from "./glass-panel";
import { HoloChromeCard, FloatingPricePlate } from "./holo-chrome-card";
import { StatusChip, PricePlate } from "./status-chip";
import type { PanelSellerService, PaidPushService } from "@/data/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useFavoritesStore } from "@/stores/favorites";
import { resolveListingMedia, getListingAllImages } from "@/lib/media";
import { ImageLightbox } from "./image-lightbox";
import { cn } from "@/lib/utils";

const DECORATIVE_GRADIENT =
  "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.22) 50%, oklch(0.9 0.02 245 / 0.5) 100%)";

/**
 * FF TRUST — Panel Service Card (PROMPT 10 advanced).
 *
 * A distinct service-card composition, not an account-listing clone:
 *  • background depth layer (in GlassCard)
 *  • media stage (reserved aspect, lazy, broken-media fallback, category glyph)
 *  • glass content plane
 *  • title hierarchy + scope chips
 *  • floating price plate
 *  • included/excluded treatment
 *  • action controls (WhatsApp + Details — user presses Send)
 *  • hover/focus/active + reduced-motion states
 *  • light sweep on hover
 *  • SAMPLE badge when demo
 */
export function PanelServiceCard({
  record,
  className,
  onDetails,
}: {
  record: PanelSellerService;
  className?: string;
  onDetails?: () => void;
}) {
  const wa = buildWhatsAppUrl({
    id: record.id,
    title: record.title,
    price: record.priceInr,
    mode: record.category,
    sellerRef: record.sellerRef,
    inquiry: "Interested in this service. Please share scope & availability.",
  });

  const { frontImage, frontImageAlt, videoUrl } = resolveListingMedia(record, record.title);
  const hasRealMedia = !!frontImage;
  const isFeatured = !!record.featured && !record.demo;
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(record.id));
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isComparing = useFavoritesStore((s) => s.compare.some((e) => e.id === record.id));
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  // All lightbox images — shared helper (deduplicated, validated, max 30)
  const allImages = getListingAllImages(record, record.title);

  return (
    <>
    <HoloChromeCard
      variant={isFeatured ? "featured" : "default"}
      className={cn("group flex flex-col", className)}
      aria-label={`Service ${record.title}`}
    >
      {/* Media stage — MEDIUM sized, premium product-card proportion */}
      <div
        className="relative w-full overflow-hidden rounded-t-3xl"
        style={{ height: "clamp(120px, 24vw, 180px)" }}
      >
        {hasRealMedia && frontImage ? (
          <button
            type="button"
            aria-label={`View images for ${record.title}`}
            onClick={(e) => { e.preventDefault(); setLightboxOpen(true); }}
            className="absolute inset-0 z-[1] cursor-pointer"
          >
            <img
              src={frontImage}
              alt={frontImageAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ) : (
          <div aria-hidden className="absolute inset-0" style={{ background: DECORATIVE_GRADIENT }}>
            {/* Category glyph — decorative, original abstract */}
            <svg aria-hidden className="absolute right-6 top-1/2 -translate-y-1/2 opacity-60" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="16" y="16" width="48" height="48" rx="8" stroke="oklch(1 0 0 / 0.5)" strokeWidth="1" fill="oklch(1 0 0 / 0.08)" />
              <rect x="26" y="26" width="28" height="28" rx="4" stroke="oklch(0.74 0.15 196 / 0.5)" strokeWidth="0.8" fill="none" />
              <circle cx="40" cy="40" r="6" fill="oklch(0.74 0.15 196 / 0.4)" />
            </svg>
          </div>
        )}

        {/* Light sweep on hover */}
        <div aria-hidden className="sheen-sweep absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
          <StatusChip tone="violet" icon={<Layers className="h-3 w-3" />}>{record.category}</StatusChip>
          {isFeatured && <StatusChip tone="cyan" icon={<Sparkles className="h-3 w-3" />}>Featured</StatusChip>}
        </div>

        {/* Top-right favorite + compare toggles */}
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
              toggleCompare(record.id, "panel");
            }}
            className={cn(
              "glass-embed inline-flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
              isComparing ? "text-[var(--accent-azure)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-azure)]",
            )}
          >
            <Columns3 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Floating price plate — bottom-right, constrained on mobile */}
        <div className="absolute -bottom-px right-3 max-w-[calc(100%-1.5rem)] sm:right-4">
          <div className="glass-float rounded-xl px-2.5 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2" style={{ boxShadow: "var(--glass-shadow-lift)" }}>
            <PricePlate value={record.priceInr} size="sm" />
          </div>
        </div>
      </div>

      {/* Content plane — compact on mobile, full on sm+ */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 pt-5 sm:flex-1 sm:gap-3 sm:p-5 sm:pt-7">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold leading-tight text-[var(--ink)] sm:text-lg">{record.title}</h3>
          <p className="mt-0.5 font-mono-label text-[9px] text-[var(--ink-soft)] sm:mt-1 sm:text-[10px]">{record.id} · {record.sellerRef}</p>
        </div>

        {/* Description — hidden on mobile to save space */}
        <p className="line-clamp-2 hidden text-sm text-[var(--ink-soft)] text-pretty sm:block">{record.scope}</p>

        {/* Scope chips — hidden on mobile (shown in detail view) */}
        {record.requirements.length > 0 && (
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {record.requirements.slice(0, 3).map((r) => (
              <StatusChip key={r} tone="neutral">{r}</StatusChip>
            ))}
          </div>
        )}

        {/* Included / Excluded — hidden on mobile (shown in detail view) */}
        <div className="hidden grid-cols-1 gap-3 border-t border-[var(--border)] pt-3 sm:grid sm:grid-cols-2">
          <div>
            <p className="font-mono-label mb-1.5 text-[9px] text-[var(--accent-azure)]">Included</p>
            <ul className="space-y-1">
              {record.included.slice(0, 3).map((i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--ink)]">
                  <Check className="h-3 w-3 shrink-0 text-[oklch(0.55_0.14_160)]" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono-label mb-1.5 text-[9px] text-[var(--ink-soft)]">Excluded</p>
            <ul className="space-y-1">
              {record.excluded.slice(0, 2).map((i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                  <X className="h-3 w-3 shrink-0 text-[oklch(0.6_0.14_45)]" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1 sm:pt-1">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Inquire on WhatsApp
          </a>
          {onDetails && (
            <button
              type="button"
              aria-label={`View details for ${record.title}`}
              onClick={onDetails}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:h-9"
            >
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </HoloChromeCard>
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

/**
 * FF TRUST — Paid Push Card (CS / BR) — PROMPT 11 advanced.
 *
 * Futuristic progression visual language: luminous paths, holographic
 * checkpoints, glass progression cards, floating rank markers.
 *
 * NEVER promises guaranteed rank/wins/anti-ban/safety. Scope & effort only.
 * Distinct visual states for CS, BR, package, scheduled, media-rich, no-media,
 * unavailable. Mode chip, floating price plate, light sweep, glass depth.
 */
export function RankPushCard({
  record,
  className,
  onDetails,
}: {
  record: PaidPushService;
  className?: string;
  onDetails?: () => void;
}) {
  const wa = buildWhatsAppUrl({
    id: record.id,
    title: record.title,
    price: record.priceInr,
    mode: `${record.mode} Rank Push · ${record.fromRank} → ${record.toRank}`,
    sellerRef: record.sellerRef,
    inquiry: "Interested in this rank-push package. Please share scope & schedule.",
  });

  const { frontImage, frontImageAlt, videoUrl } = resolveListingMedia(record, record.title);
  const hasRealMedia = !!frontImage;
  const isFeatured = !!record.featured && !record.demo;
  const isScheduled = !!record.schedule;
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(record.id));
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  // All lightbox images — shared helper (deduplicated, validated, max 30)
  const allImages = getListingAllImages(record, record.title);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isComparing = useFavoritesStore((s) => s.compare.some((e) => e.id === record.id));
  const isUnavailable = !record.published;
  const modeTone = record.mode === "CS" ? "cyan" : "violet";

  return (
    <>
    <HoloChromeCard
      variant={isFeatured ? "featured" : isUnavailable ? "unavailable" : "default"}
      className={cn("group flex flex-col", className)}
      aria-label={`Rank push ${record.title}`}
    >
      {/* Progression stage — MEDIUM sized, premium product-card proportion */}
      <div
        className="relative w-full overflow-hidden rounded-t-3xl"
        style={{ height: "clamp(120px, 24vw, 180px)" }}
      >
        {hasRealMedia && frontImage ? (
          <button
            type="button"
            aria-label={`View images for ${record.title}`}
            onClick={(e) => { e.preventDefault(); setLightboxOpen(true); }}
            className="absolute inset-0 z-[1] cursor-pointer"
          >
            <img
              src={frontImage}
              alt={frontImageAlt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                record.mode === "CS"
                  ? "linear-gradient(110deg, oklch(0.74 0.15 196 / 0.32) 0%, oklch(0.82 0.1 200 / 0.2) 50%, oklch(0.9 0.02 245 / 0.5) 100%)"
                  : "linear-gradient(110deg, oklch(0.6 0.19 290 / 0.3) 0%, oklch(0.7 0.12 290 / 0.2) 50%, oklch(0.9 0.02 245 / 0.5) 100%)",
            }}
          />
        )}

        {/* Luminous progression path — decorative */}
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`path-${record.id}`} x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="oklch(0.74 0.15 196)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="oklch(0.6 0.19 290)" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <path d="M 40 100 Q 120 60, 200 100 T 360 100" stroke={`url(#path-${record.id})`} strokeWidth="2" strokeDasharray="4 6" fill="none" />
          <circle cx="40" cy="100" r="6" fill="oklch(0.74 0.15 196 / 0.8)" />
          <circle cx="40" cy="100" r="12" fill="none" stroke="oklch(0.74 0.15 196 / 0.3)" strokeWidth="1" />
          <circle cx="200" cy="100" r="5" fill="oklch(1 0 0 / 0.6)" />
          <circle cx="360" cy="100" r="8" fill="oklch(0.6 0.19 290 / 0.8)" />
          <circle cx="360" cy="100" r="14" fill="none" stroke="oklch(0.6 0.19 290 / 0.3)" strokeWidth="1" />
        </svg>

        {/* Floating rank markers — constrained width on mobile */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6">
          <div className="glass-float min-w-0 max-w-[40%] rounded-lg px-2 py-1 text-center sm:rounded-xl sm:px-3 sm:py-1.5 sm:max-w-none" style={{ boxShadow: "var(--glass-shadow)" }}>
            <p className="font-mono-label text-[7px] text-[var(--ink-soft)]">FROM</p>
            <p className="truncate font-heading text-xs font-semibold text-[var(--ink)] sm:text-sm">{record.fromRank}</p>
          </div>
          <div className="glass-float min-w-0 max-w-[40%] rounded-lg px-2 py-1 text-center sm:rounded-xl sm:px-3 sm:py-1.5 sm:max-w-none" style={{ boxShadow: "var(--glass-shadow-lift)" }}>
            <p className="font-mono-label text-[7px] text-[var(--ink-soft)]">TO</p>
            <p className="truncate font-heading text-xs font-semibold text-gradient-cyan sm:text-sm">{record.toRank}</p>
          </div>
        </div>

        {/* Light sweep */}
        <div aria-hidden className="sheen-sweep absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
          <StatusChip tone={modeTone} icon={<Trophy className="h-3 w-3" />}>{record.mode} Rank Push</StatusChip>
          {isFeatured && <StatusChip tone="cyan" icon={<Sparkles className="h-3 w-3" />}>Featured</StatusChip>}
          {isScheduled && <StatusChip tone="azure">Scheduled</StatusChip>}
          {isUnavailable && <StatusChip tone="neutral">Unavailable</StatusChip>}
        </div>

        {/* Top-right favorite + compare toggles */}
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
              toggleCompare(record.id, "paid-push");
            }}
            className={cn(
              "glass-embed inline-flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
              isComparing ? "text-[var(--accent-azure)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-azure)]",
            )}
          >
            <Columns3 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Floating price plate */}
        <div className="absolute -bottom-px right-3 max-w-[calc(100%-1.5rem)] sm:right-4">
          <div className="glass-float rounded-xl px-2.5 py-1.5 sm:rounded-2xl sm:px-3 sm:py-2" style={{ boxShadow: "var(--glass-shadow-lift)" }}>
            <PricePlate value={record.priceInr} size="sm" />
          </div>
        </div>
      </div>

      {/* Content plane — compact on mobile, full on sm+ */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 pt-5 sm:gap-3 sm:p-5 sm:pt-7">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold leading-tight text-[var(--ink)] sm:text-lg">{record.title}</h3>
          <p className="mt-0.5 font-mono-label text-[9px] text-[var(--ink-soft)] sm:mt-1 sm:text-[10px]">{record.id} · {record.packageTier}</p>
        </div>

        {/* Description — hidden on mobile to save space */}
        <p className="line-clamp-2 hidden text-sm text-[var(--ink-soft)] text-pretty sm:block">{record.scope}</p>

        {/* Requirements chips — hidden on mobile (shown in detail view) */}
        {record.requirements.length > 0 && (
          <div className="hidden flex-wrap gap-1.5 sm:flex">
            {record.requirements.slice(0, 3).map((r) => (
              <StatusChip key={r} tone="neutral">{r}</StatusChip>
            ))}
          </div>
        )}

        {/* Schedule (only when real) — hidden on mobile */}
        {isScheduled && (
          <div className="glass-embed hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[oklch(0.55_0.14_160)]" />
            <p className="text-xs text-[var(--ink-soft)]">Schedule: {record.schedule}</p>
          </div>
        )}

        {/* No-guarantee disclosure — hidden on mobile (shown in detail view) */}
        <div className="hidden rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.18)] p-3 sm:block">
          <p className="font-mono-label text-[9px] text-[oklch(0.45_0.14_45)]">No guarantee</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            No guaranteed rank, wins, completion, anti-ban or safety. No cheats, exploits or credential access. Scope &amp; effort only.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1 sm:pt-1">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Inquire on WhatsApp
          </a>
          {onDetails && (
            <button
              type="button"
              aria-label={`View details for ${record.title}`}
              onClick={onDetails}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:h-9"
            >
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </HoloChromeCard>
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
