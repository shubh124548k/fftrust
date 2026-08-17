import * as React from "react";
import { Video } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { proofContent } from "@/config/proof";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Buyer Proof Panel (PROMPT 2).
 *
 * ONE reusable premium buyer-proof component, fed by the single canonical
 * safety-content source (src/config/proof.ts). Used on every Details surface:
 * Account, Panel Seller, Paid Push, Instagram, homepage and the /proof page.
 *
 * Design: glass background, cyan/violet edge glow, warning accent, 3D depth,
 * bold animated heading ("KEEP SCREEN RECORDING ON"), supporting explanation
 * and a subtle moving highlight. Compact on desktop, readable on mobile.
 * Reduced-motion users get a static panel (global CSS kill-switch).
 */
export function BuyerProofPanel({
  variant = "banner",
  className,
}: {
  variant?: "banner" | "card";
  className?: string;
}) {
  return (
    <GlassPanel
      depth="strong"
      holo
      className={cn(
        "relative overflow-hidden",
        variant === "banner" ? "p-6 sm:p-8" : "p-5",
        className,
      )}
    >
      {/* Atmospheric wash + subtle animated highlight */}
      <div aria-hidden className="light-wash absolute inset-0" />
      <div
        aria-hidden
        className="proof-glow pointer-events-none absolute inset-0"
      />

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.3)] text-[oklch(0.45_0.16_45)]"
        >
          <Video className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-mono-label text-[9px] text-[oklch(0.45_0.16_45)]">
            {proofContent.eyebrow}
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold leading-tight text-[var(--ink)] sm:text-xl">
            🎥 <span className="text-gradient-cyan">{proofContent.heading}</span>
          </h3>
          <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">
            {proofContent.core}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
            {proofContent.body}
          </p>
          <p className="mt-2 text-sm text-[oklch(0.5_0.14_45)] text-pretty">
            {proofContent.neverSend}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
