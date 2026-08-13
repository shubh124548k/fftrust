"use client";

import * as React from "react";
import { X, ShieldCheck, MessageCircle, AlertCircle, Video, Lock, Check } from "lucide-react";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useSellerContactStore } from "@/stores/seller-contact";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { z } from "@/lib/design/depth";

export type SellerType = "account" | "panel" | "paid-push";

const sellerConfig: Record<SellerType, { title: string; inquiry: string }> = {
  account: {
    title: "List Your Account",
    inquiry: "I'd like to list a Free Fire account for sale. I have read the seller requirements.",
  },
  panel: {
    title: "List Panel Seller Service",
    inquiry: "I'd like to list a Panel Seller service. I have read the seller requirements.",
  },
  "paid-push": {
    title: "List Paid Push Service",
    inquiry: "I'd like to list a Paid Push (CS/BR Rank Push) service. I have read the seller requirements.",
  },
};

const requirements = [
  "Only submit information for an account/service you genuinely control or are authorized to sell.",
  "Do not submit fake screenshots, AI-generated proof, edited evidence or misleading information.",
  "Real verification is required.",
  "Screen recording must remain ON during verification.",
  "Keep screen recording ON during the transaction/verification process for proof.",
  "Never send passwords, OTPs, recovery codes or other sensitive credentials through the website.",
  "Verification may include live screen sharing.",
  "The owner may reject unverifiable or suspicious submissions.",
];

/**
 * FF TRUST — Seller Contact Popup.
 *
 * Reads open/sellerType from the global Zustand store so it can be triggered
 * from the page CTA, navbar, and mobile command center.
 *
 * Scroll lock: overflow:hidden on <html> + <body> + wheel/touchmove/keydown
 * listeners so the background NEVER moves while the popup is open.
 *
 * Layout: the panel uses a flex column with a scrollable content area + a
 * STICKY footer containing the WhatsApp CTA. This means the "Contact Owner
 * on WhatsApp" button is ALWAYS visible at the bottom on every viewport —
 * 320px, 375px, 768px, 1440px — with NO breakpoint. The content scrolls
 * independently above it.
 *
 * Backdrop: transparent blurred acrylic (`.popup-backdrop` class) with an
 * adaptive light/dark tint so the frosted-glass blur is visible at all
 * viewport sizes with no breakpoint.
 */
export function SellerContactPopup() {
  const open = useSellerContactStore((s) => s.open);
  const sellerType = useSellerContactStore((s) => s.sellerType);
  const closePopup = useSellerContactStore((s) => s.closePopup);

  const panelRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  // Scroll lock using the shared counter-based utility. This prevents race
  // conditions when the popup opens from inside the hamburger menu (both
  // would otherwise save/restore "previous" overflow values, causing one
  // to restore "hidden" and permanently lock the page).
  React.useEffect(() => {
    if (!open) return;

    // Lock scroll — pass scrollRef so wheel/touch inside the popup content
    // area is allowed.
    lockBodyScroll(scrollRef);

    // Escape + focus trap (key handling stays local to this component)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopup();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    const id = requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      window.removeEventListener("keydown", onKey);
      unlockBodyScroll();
      cancelAnimationFrame(id);
    };
  }, [open, closePopup]);

  if (!open) return null;

  const config = sellerConfig[sellerType];
  const waUrl = buildWhatsAppUrl({ inquiry: config.inquiry });

  return (
    <div
      className="fixed left-0 right-0 top-0 flex items-center justify-center p-4"
      style={{ zIndex: z("modal"), height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-label={config.title}
    >
      {/* Backdrop — transparent blurred acrylic.
          Adaptive tint (light/dark) via .popup-backdrop class so the blur
          is visible at ALL viewport sizes with no breakpoint. */}
      <div
        className="popup-backdrop fixed left-0 right-0 top-0 cursor-pointer"
        onClick={closePopup}
        style={{
          height: "100dvh",
          backdropFilter: "blur(28px) saturate(1.8)",
          WebkitBackdropFilter: "blur(28px) saturate(1.8)",
          animation: "ff-fade-in 200ms ease-out",
        }}
      >
        {/* Ambient neon lighting on backdrop */}
        <div
          aria-hidden
          className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.74 0.15 196 / 0.15) 0%, oklch(1 0 0 / 0) 70%)" }}
        />
        <div
          aria-hidden
          className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.12) 0%, oklch(1 0 0 / 0) 70%)" }}
        />
      </div>

      {/* Panel — flex column: scrollable content + sticky footer.
          max-h-[92dvh] leaves space around the popup so the backdrop blur
          is visible on all sides. Solid background via .popup-panel so the
          card is fully opaque and readable. No glass-stack (which is only
          72% opaque). No breakpoint — works identically at all sizes. */}
      <div
        ref={panelRef}
        className="popup-panel acrylic-sheen relative flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl"
        style={{ animation: "ff-popup-in 350ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        {/* Scrollable content area */}
        <div ref={scrollRef} className="popup-scroll flex-1 overflow-y-auto p-5">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                  boxShadow: "var(--neon-cyan)",
                }}
              >
                <ShieldCheck className="h-4 w-4 text-white" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="font-heading text-base font-semibold text-[var(--ink)]">
                  {config.title}
                </span>
                <span className="mt-0.5 font-mono-label text-[9px] text-[var(--ink-soft)] text-pretty">
                  Want to sell something? Contact us FREE immediately.
                </span>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={closePopup}
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

          {/* Safety warning */}
          <div className="mb-4 rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.18)] p-3.5">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[oklch(0.45_0.16_45)]" />
              <p className="font-mono-label text-[9px] text-[oklch(0.45_0.16_45)]">Buyer safety</p>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-[var(--ink)]">
              TURN ON SCREEN RECORDING BEFORE VERIFICATION/PURCHASE.
            </p>
          </div>

          {/* Requirements */}
          <div className="mb-4">
            <p className="font-mono-label mb-2.5 text-[9px] text-[var(--accent-azure)]">Seller requirements</p>
            <div className="flex flex-col gap-2">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[oklch(0.82_0.1_200/0.15)]">
                    <Check className="h-2.5 w-2.5 text-[var(--accent-azure)]" />
                  </span>
                  <p className="text-xs text-[var(--ink-soft)] text-pretty">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* No guarantee */}
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-[var(--border)] bg-[oklch(0.96_0.006_245/0.4)] p-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ink-soft)]" />
            <p className="text-xs text-[var(--ink-soft)] text-pretty">
              FF TRUST does not guarantee a transaction. Verification and publication are at the owner's discretion.
            </p>
          </div>

          {/* Lock warning (inside scroll area) */}
          <div className="mb-1 flex items-start gap-2 rounded-2xl border border-[oklch(0.7_0.14_45/0.2)] bg-[oklch(0.86_0.1_80/0.1)] p-2.5">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.45_0.14_45)]" />
            <p className="text-xs text-[var(--ink-soft)]">
              Never send passwords, OTPs or recovery codes through this website.
            </p>
          </div>
        </div>

        {/* Sticky footer — WhatsApp CTA ALWAYS visible at the bottom.
            No breakpoint; works on all viewport sizes (320px → 1920px+). */}
        <div className="popup-footer shrink-0 border-t border-[var(--border)] p-3.5">
          <MagneticButton
            onClick={() => window.open(waUrl, "_blank", "noopener,noreferrer")}
            className="w-full"
            strength={8}
          >
            <MessageCircle className="h-4 w-4" />
            Contact Owner on WhatsApp
          </MagneticButton>
          <p className="mt-2 text-center font-mono-label text-[8px] text-[var(--ink-soft)]">
            WhatsApp opens with a prefilled message — you press Send
          </p>
        </div>
      </div>
    </div>
  );
}
