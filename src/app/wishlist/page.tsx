"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites";
import { AccountCard } from "@/components/visual/account-card";
import { PanelServiceCard, RankPushCard } from "@/components/visual/service-card";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { SectionHeading } from "@/components/visual/section-heading";
import { useDetailStore } from "@/stores/detail";
import { useServiceDetailStore } from "@/stores/service-detail";
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

/**
 * FF TRUST — Wishlist Page.
 *
 * Displays all listings the user has favorited (heart icon). Uses the SAME
 * universal card system as Explore/Panel Seller/Paid Push — no separate
 * wishlist card design.
 *
 * Data propagation: wishlist stores only the listing ID. On render, the ID
 * is resolved against ALL canonical data sources (accounts, panel services,
 * rank push packages). If a listing has been removed from canonical data,
 * it is gracefully skipped (no broken cards).
 *
 * Persistence: localStorage via Zustand persist middleware. Survives page
 * navigation, refresh, and returning to the page.
 */
export default function WishlistPage() {
  const favorites = useFavoritesStore((s) => s.favorites);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

  // Resolve all favorited IDs against canonical data sources.
  // If a listing has been removed from canonical data, it is gracefully skipped.
  const wishlistListings = React.useMemo(() => {
    const accounts = getFeaturedAccounts(999).records;
    const panelServices = getFeaturedPanelServices(999).records;
    const rankPush = getFeaturedRankPush(999).records;

    return favorites
      .map((id) => {
        const account = getAccountById(id, accounts);
        if (account) return { type: "account" as const, record: account };

        const panel = getPanelServiceById(id, panelServices);
        if (panel) return { type: "panel" as const, record: panel };

        const push = getRankPushById(id, rankPush);
        if (push) return { type: "paid-push" as const, record: push };

        return null; // listing removed from canonical data — skip gracefully
      })
      .filter((x): x is { type: "account"; record: AccountListing } | { type: "panel"; record: PanelSellerService } | { type: "paid-push"; record: PaidPushService } => x !== null);
  }, [favorites]);

  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
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
          overline="Your saved listings"
          title="Your"
          italic="wishlist"
          support="Every listing you've hearted — accounts, panel services, and rank push packages — in one place. Wishlist is saved on this device and survives page refresh."
          id="wishlist-title"
        />

        {/* Count + clear */}
        {wishlistListings.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone="violet" icon={<Heart className="h-3 w-3" />}>
                {wishlistListings.length} {wishlistListings.length === 1 ? "listing" : "listings"}
              </StatusChip>
            </div>
            <button
              type="button"
              onClick={() => clearFavorites()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:text-[oklch(0.68_0.2_24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Cards or empty state */}
        {wishlistListings.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {wishlistListings.map(({ type, record }) => {
              if (type === "account") {
                return (
                  <AccountCard
                    key={record.id}
                    record={record}
                    variant={record.featured ? "featured" : "default"}
                  />
                );
              }
              if (type === "panel") {
                return (
                  <PanelServiceCard
                    key={record.id}
                    record={record}
                    onDetails={() => useServiceDetailStore.getState().open(record.id)}
                  />
                );
              }
              return (
                <RankPushCard
                  key={record.id}
                  record={record}
                  onDetails={() => useServiceDetailStore.getState().open(record.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="Your wishlist is empty"
              description="Tap the heart icon on any listing — account, panel service, or rank push package — to save it here. Your wishlist is saved on this device."
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
