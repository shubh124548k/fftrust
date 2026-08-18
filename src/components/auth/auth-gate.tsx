"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useAuthStore, type PendingAction } from "@/stores/auth";

interface AuthGateProps {
  children: React.ReactNode;
  action: PendingAction;
  fallback?: React.ReactNode;
}

export function AuthGate({ children, action, fallback }: AuthGateProps) {
  const { data: session, status } = useSession();
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  const handleClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      e.stopPropagation();
      openLoginModal(action);
    }
  };

  if (status === "loading") {
    return fallback ? <>{fallback}</> : <>{children}</>;
  }

  if (session) {
    return <>{children}</>;
  }

  return (
    <span onClick={handleClick} className="contents cursor-pointer">
      {children}
    </span>
  );
}
