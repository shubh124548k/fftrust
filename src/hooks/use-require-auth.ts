"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore, type PendingAction } from "@/stores/auth";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  const requireAuth = useCallback(
    (action: PendingAction, onAuthenticated: () => void) => {
      if (status === "loading") return;
      if (!session) {
        openLoginModal(action);
        return;
      }
      onAuthenticated();
    },
    [session, status, openLoginModal],
  );

  return requireAuth;
}
