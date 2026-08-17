"use client";

import * as React from "react";
import { Heart, Columns3 } from "lucide-react";
import { useFavoritesStore, type ListingType } from "@/stores/favorites";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — MobileStickyCTA (PROMPT 03 repair, shared primitive).
 *
 * A sticky bottom action bar shown on mobile inside every detail dossier:
 *  - wishlist + compare toggles (same persisted store as the cards — single
 *    synced state)
 *  - primary "Inquire on WhatsApp" CTA (prefilled, user presses Send)
 *
 * Uses `position: sticky; bottom: 0` inside the scrolling overlay panel — no
 * fixed/z-index fights, no overlap with the global CompareDock. Hidden on
 * sm+ (desktop keeps the header CTAs).
 */
function MobileStickyCTAInner({
  wa,
  id,
  type,
  className,
}: {
  /** Prefilled WhatsApp URL for this listing. */
  wa: string;
  id: string;
  type: ListingType;
  className?: string;
}) {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(id));
  const isComparing = useFavoritesStore((s) => s.compare.some((e) => e.id === id));

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 flex items-center gap-2 border-t border-[var(--border)] px-5 pb-4 pt-3 backdrop-blur-md sm:hidden",
        className,
      )}
      style={{ background: "var(--glass-bg-strong)" }}
    >
      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite}
        onClick={() => toggleFavorite(id)}
        className={cn(
          "glass-embed inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
          isFavorite
            ? "text-[oklch(0.55_0.2_330)]"
            : "text-[var(--ink-soft)] hover:text-[var(--accent-violet)]",
        )}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>
      <button
        type="button"
        aria-label={isComparing ? "Remove from compare" : "Add to compare"}
        aria-pressed={isComparing}
        onClick={() => toggleCompare(id, type)}
        className={cn(
          "glass-embed inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
          isComparing
            ? "text-[var(--accent-azure)]"
            : "text-[var(--ink-soft)] hover:text-[var(--accent-azure)]",
        )}
      >
        <Columns3 className="h-4 w-4" />
      </button>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="magnetic inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
      >
        Inquire on WhatsApp
      </a>
    </div>
  );
}

export const MobileStickyCTA = React.memo(MobileStickyCTAInner);
