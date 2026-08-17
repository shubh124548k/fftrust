import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { getSellerById } from "@/lib/selectors/sellers";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Seller Badge (shared primitive).
 *
 * Honest provenance chip resolved from the canonical sellers registry. Shows
 * the seller's display name, a "verified" shield only when real evidence is on
 * file, and a SAMPLE marker for demo fixtures. Renders nothing when no seller
 * reference resolves — cards stay clean for orphaned records.
 *
 * `showLabel` renders a prominent "Seller:" prefix so listings cards surface
 * the seller at a glance (PROMPT 03 repair).
 */
export function SellerBadge({
  sellerRef,
  className,
  showLabel = false,
}: {
  sellerRef: string;
  className?: string;
  showLabel?: boolean;
}) {
  const seller = getSellerById(sellerRef);
  if (!seller) return null;

  const hasEvidence = seller.verifiedEvidence.length > 0;

  return (
    <span
      title={seller.note ?? seller.displayName}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-label text-[10px] backdrop-blur-sm",
        seller.demo
          ? "border-[var(--chip-warn-border)] bg-[var(--chip-warn-bg)] text-[var(--chip-warn-text)]"
          : hasEvidence
            ? "border-[var(--chip-good-border)] bg-[var(--chip-good-bg)] text-[var(--chip-good-text)]"
            : "border-[var(--chip-neutral-border)] bg-[var(--chip-neutral-bg)] text-[var(--chip-neutral-text)]",
        className,
      )}
    >
      {showLabel && (
        <span className="text-[var(--ink-soft)]">Seller:</span>
      )}
      {hasEvidence && !seller.demo && <ShieldCheck className="h-3 w-3" />}
      {seller.demo && <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--chip-warn-dot)" }} />}
      <span className="font-medium text-[var(--ink)]">{seller.displayName}</span>
      {seller.demo && <span className="uppercase">· Sample</span>}
    </span>
  );
}
