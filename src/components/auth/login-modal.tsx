"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { X, ShieldCheck } from "lucide-react";
import { useAuthStore, savePendingAction } from "@/stores/auth";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { z } from "@/lib/design/depth";

export function LoginModal() {
  const show = useAuthStore((s) => s.showLoginModal);
  const closeModal = useAuthStore((s) => s.closeLoginModal);
  const pendingAction = useAuthStore((s) => s.pendingAction);
  const clearPendingAction = useAuthStore((s) => s.clearPendingAction);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!show) return;
    lockBodyScroll(scrollRef);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      cancelAnimationFrame(id);
    };
  }, [show, closeModal]);

  if (!show) return null;

  const callbackUrl = "/";

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (pendingAction) {
        savePendingAction(pendingAction);
      }
      await signIn("google", { callbackUrl, redirect: true });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 flex items-center justify-center p-4"
      style={{ zIndex: z("modal"), height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div
        className="popup-backdrop fixed left-0 right-0 top-0 cursor-pointer"
        onClick={closeModal}
        style={{
          height: "100dvh",
          backdropFilter: "blur(28px) saturate(1.8)",
          WebkitBackdropFilter: "blur(28px) saturate(1.8)",
          animation: "ff-fade-in 200ms ease-out",
        }}
      >
        <div aria-hidden className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.74 0.15 196 / 0.15) 0%, oklch(1 0 0 / 0) 70%)" }} />
        <div aria-hidden className="absolute right-1/3 bottom-1/3 h-72 w-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.12) 0%, oklch(1 0 0 / 0) 70%)" }} />
      </div>

      <div
        ref={panelRef}
        className="popup-panel acrylic-sheen relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        style={{ animation: "ff-popup-in 350ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                  boxShadow: "var(--neon-cyan)",
                }}
              >
                <ShieldCheck className="h-5 w-5 text-white" />
              </span>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-semibold text-[var(--ink)]">
                  FF TRUST
                </span>
                <span className="mt-0.5 text-sm text-[var(--ink-soft)]">
                  Welcome to FF TRUST
                </span>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="popup-close-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--ink)] transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              style={{
                background: "var(--popup-close-bg, oklch(0.92 0.008 245 / 0.95))",
                border: "1px solid var(--glass-border)",
                boxShadow: "0 2px 8px -2px oklch(0 0 0 / 0.15)",
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-2 text-sm text-[var(--ink-soft)]">
            Sign in or create your account with your Google Account.
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="glass-embed mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-50 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
            Secure authentication · No password required
          </p>
        </div>
      </div>
    </div>
  );
}
