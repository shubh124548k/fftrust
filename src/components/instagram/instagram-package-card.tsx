"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Heart, Columns3, Check } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites";
import { formatPrice } from "@/lib/selectors/instagram";
import { TrustHighlights } from "@/components/visual/trust-highlights";
import type { InstagramServiceType } from "@/data/types";
import type { InstagramPackageWithSavings } from "@/lib/selectors/instagram";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Instagram Package Card (PROMPT 03 Parts 21 / 24).
 *
 * One card for every Instagram package (Views / Followers / Likes) used by
 * the service pages AND the wishlist. Everything comes from canonical data:
 *   - quantity, original price (struck), current price, SAVE amount + SAVE %
 *   - ❤️ wishlist (persisted, id-based)  ·  ⚖ compare ("instagram" type)
 *   - primary "Order" action opens the order/details modal (or links to the
 *     service page when no onOpen is supplied, e.g. on the wishlist)
 *   - clicking the card body opens the same order/details experience;
 *     wishlist/compare clicks are isolated (never navigate, never order)
 */
export function InstagramPackageCard({
  service,
  pkg,
  onOpen,
  className,
}: {
  service: InstagramServiceType;
  pkg: InstagramPackageWithSavings;
  onOpen?: () => void;
  className?: string;
}) {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(pkg.id));
  const isComparing = useFavoritesStore((s) => s.compare.some((e) => e.id === pkg.id));

  const hasBadge = !!pkg.badge;
  const badgeTone = pkg.badge === "BEST VALUE" ? "cyan" : pkg.badge === "POPULAR" ? "violet" : "azure";

  const open = () => {
    if (onOpen) onOpen();
  };

  return (
    <div
      className={cn(
        "glass-stack acrylic-sheen group relative flex flex-col overflow-hidden rounded-2xl transition-transform duration-300",
        onOpen && "cursor-pointer hover:-translate-y-1",
      )}
      style={{ boxShadow: "var(--glass-shadow)" }}
      onClick={open}
    >
      {/* Light sweep on hover */}
      <div aria-hidden className="sheen-sweep absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Badge */}
      {hasBadge && (
        <div className="absolute right-0 top-0 z-10">
          <span
            className={cn(
              "rounded-bl-xl rounded-tr-2xl px-3 py-1 text-[9px] font-bold uppercase tracking-wide",
              badgeTone === "cyan" && "bg-[oklch(0.74_0.15_196)] text-[oklch(0.12_0.02_245)]",
              badgeTone === "violet" && "bg-[oklch(0.6_0.19_290)] text-white",
              badgeTone === "azure" && "bg-[oklch(0.62_0.16_258)] text-white",
            )}
          >
            {pkg.badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">{service.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-[var(--ink)]">
              {pkg.formattedQuantity}
            </p>
          </div>
          {/* Wishlist + compare toggles — isolated clicks (never open details) */}
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(pkg.id);
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
                e.stopPropagation();
                toggleCompare(pkg.id, "instagram");
              }}
              className={cn(
                "glass-embed inline-flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
                isComparing ? "text-[var(--accent-azure)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-azure)]",
              )}
            >
              <Columns3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-sm text-[var(--ink-soft)] line-through">{formatPrice(pkg.originalPrice)}</span>
        </div>
        <p className="font-heading text-3xl font-bold text-gradient-cyan">
          {formatPrice(pkg.discountPrice)}
        </p>

        {/* Savings */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[oklch(0.55_0.14_160/0.15)] px-2.5 py-1 text-[10px] font-semibold text-[oklch(0.65_0.14_160)]">
            SAVE {formatPrice(pkg.savingAmount)}
          </span>
          <span className="rounded-full bg-[oklch(0.55_0.14_160/0.15)] px-2.5 py-1 text-[10px] font-semibold text-[oklch(0.65_0.14_160)]">
            {pkg.savingPercentage}% OFF
          </span>
        </div>

        {/* Trust highlights — data-driven, never fabricated */}
        <TrustHighlights items={service.trustHighlights} max={2} className="mt-3" />

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-5">
          {onOpen ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="magnetic inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              Order Now
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={`/instagram/${service.key}`}
              className="magnetic inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <Check className="h-4 w-4" />
              View service
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
