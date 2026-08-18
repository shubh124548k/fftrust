"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { consumePendingAction } from "@/stores/auth";
import { useFavoritesStore } from "@/stores/favorites";

/**
 * PendingActionExecutor — resumes the original action after Google OAuth.
 *
 * Runs once on mount. If the user just completed Google login and had a
 * pending action (stored in sessionStorage before the redirect), this
 * component executes it and clears it.
 *
 * Also handles wishlist sync: on first authenticated load, merges guest
 * localStorage favorites with the server-side wishlist.
 */
export function PendingActionExecutor() {
  const { data: session, status } = useSession();
  const executedRef = React.useRef(false);

  React.useEffect(() => {
    if (status !== "authenticated" || executedRef.current) return;
    executedRef.current = true;

    const action = consumePendingAction();
    if (!action) {
      syncWishlist();
      return;
    }

    if (action.url) {
      window.open(action.url, "_blank", "noopener,noreferrer");
    }

    syncWishlist();
  }, [status]);

  return null;
}

async function syncWishlist() {
  try {
    const stored = localStorage.getItem("ff-trust-favorites");
    if (!stored) return;
    const parsed = JSON.parse(stored);
    const favorites: string[] = parsed?.state?.favorites ?? [];
    if (favorites.length === 0) return;

    await fetch("/api/wishlist/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingIds: favorites }),
    });
  } catch { /* noop */ }
}
