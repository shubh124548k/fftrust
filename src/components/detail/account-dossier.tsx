"use client";

import * as React from "react";
import {
  ShieldCheck,
  Mail,
  Receipt,
  KeyRound,
  Crown,
  Sword,
  Sparkles,
  Check,
  X,
  AlertCircle,
  User,
  FileText,
  Heart,
  Columns3,
} from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip, EvidenceChip } from "@/components/visual/status-chip";
import { TrustHighlights } from "@/components/visual/trust-highlights";
import { PriceDisplay } from "@/components/visual/price-display";
import { SellerBadge } from "@/components/visual/seller-badge";
import { MediaGallery } from "./media-gallery";
import { MobileStickyCTA } from "./mobile-sticky-cta";
import { AccountCard } from "@/components/visual/account-card";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { RevealText } from "@/components/visual/reveal-text";
import { BuyerProofPanel } from "@/components/proof/buyer-proof-panel";
import { useFavoritesStore } from "@/stores/favorites";
import type { AccountListing } from "@/data/types";
import { buildWhatsAppUrl, accountWhatsAppContext } from "@/lib/whatsapp";
import { toListingMediaList } from "@/lib/media";
import { getRelatedAccounts } from "@/lib/selectors/accounts";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";

/**
 * FF TRUST — Account Detail Dossier (PROMPT 07).
 *
 * A deeply immersive account detail view arranged as a visual dossier:
 *  - large media stage (MediaGallery: up to 30 images, video, lightbox, swipe)
 *  - identity + price + level + rank + Prime + collections + weapons + Evo +
 *    emotes + bundles + pets + vehicles + badges + description + terms
 *  - Trust Passport (Known / Seller-provided / Not verified)
 *  - buyer-safety banner (bold 3D/glass typography)
 *  - similar listings (from getRelatedAccounts)
 *  - Contact Owner (WhatsApp prefill from current public data — user presses Send)
 */

export function AccountDossier({ record }: { record: AccountListing }) {
  const related = getRelatedAccounts(record.id, 3);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const toggleCompare = useFavoritesStore((s) => s.toggleCompare);
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(record.id));
  const isComparing = useFavoritesStore((s) => s.compare.some((e) => e.id === record.id));
  const requireAuth = useRequireAuth();
  const wa = buildWhatsAppUrl(
    accountWhatsAppContext(
      record,
      "Interested in this account. Please share more detail.",
      true,
    ),
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Top: media-first on mobile, media-left / info-right on desktop */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:w-[min(620px,55%)] lg:shrink-0">
          <MediaGallery media={toListingMediaList(record, record.title)} title={record.title} />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {record.demo && <StatusChip tone="warn">SAMPLE</StatusChip>}
            {record.featured && !record.demo && (
              <StatusChip tone="cyan" icon={<Sparkles className="h-3 w-3" />}>Featured</StatusChip>
            )}
            <StatusChip tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>{record.category}</StatusChip>
          </div>
          <h2 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
            {record.title}
          </h2>
          <p className="font-mono-label text-[10px] text-[var(--ink-soft)]">
            {record.id} · {record.region}
          </p>
          <SellerBadge sellerRef={record.sellerRef} showLabel />
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              onClick={() => toggleFavorite(record.id)}
              className={cn(
                "glass-embed inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
                isFavorite ? "text-[oklch(0.55_0.2_330)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-violet)]",
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
              {isFavorite ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              aria-label={isComparing ? "Remove from compare" : "Add to compare"}
              aria-pressed={isComparing}
              onClick={() => toggleCompare(record.id, "account")}
              className={cn(
                "glass-embed inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
                isComparing ? "text-[var(--accent-azure)]" : "text-[var(--ink-soft)] hover:text-[var(--accent-azure)]",
              )}
            >
              <Columns3 className="h-3.5 w-3.5" />
              {isComparing ? "Comparing" : "Compare"}
            </button>
          </div>
          <div className="mt-2 flex flex-col items-start gap-3">
            <PriceDisplay currentPrice={record.priceInr} originalPrice={record.originalPrice} size="lg" />
            <MagneticButton onClick={() => requireAuth(
              { type: "contact", listingId: record.id, listingType: "account", url: wa },
              () => window.open(wa, "_blank", "noopener,noreferrer"),
            )} className="px-6 py-3">
              Contact Owner
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Buyer proof panel — canonical safety copy */}
      <BuyerProofPanel variant="banner" />

      {/* Dossier grid: identity + attributes */}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Left: description + attributes */}
        <div className="flex flex-col gap-6">
          {record.description && (
            <GlassPanel depth="float" className="p-6">
              <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Description</p>
              <p className="text-sm text-[var(--ink-soft)] text-pretty">{record.description}</p>
            </GlassPanel>
          )}

          <GlassPanel depth="float" className="p-6">
            <p className="font-mono-label mb-3 text-[9px] text-[var(--accent-azure)]">Account attributes</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AttrRow label="Level" value={String(record.level)} />
              {record.rank && <AttrRow label="Rank" value={record.rank} />}
              <AttrRow label="Prime" value={record.prime ? "Yes" : "No"} icon={record.prime ? <Crown className="h-3 w-3" /> : undefined} />
              <AttrRow label="Region" value={record.region} />
              {record.collections && record.collections.length > 0 && (
                <AttrList label="Collections" items={record.collections} />
              )}
              {record.weapons && record.weapons.length > 0 && (
                <AttrList label="Weapons" items={record.weapons} icon={<Sword className="h-3 w-3" />} />
              )}
              {record.evo && record.evo.length > 0 && <AttrList label="Evo" items={record.evo} />}
              {record.emotes && record.emotes.length > 0 && <AttrList label="Emotes" items={record.emotes} />}
              {record.bundles && record.bundles.length > 0 && <AttrList label="Bundles" items={record.bundles} />}
              {record.pets && record.pets.length > 0 && <AttrList label="Pets" items={record.pets} />}
              {record.vehicles && record.vehicles.length > 0 && <AttrList label="Vehicles" items={record.vehicles} />}
              {record.badges && record.badges.length > 0 && <AttrList label="Badges" items={record.badges} />}
            </div>
          </GlassPanel>

          {record.terms && (
            <GlassPanel depth="float" className="p-6">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--accent-azure)]" />
                <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Terms</p>
              </div>
              <p className="text-sm text-[var(--ink-soft)] text-pretty">{record.terms}</p>
            </GlassPanel>
          )}
        </div>

        {/* Right: Trust Passport + seller + WhatsApp */}
        <div className="flex flex-col gap-6">
          <TrustPassport record={record} />

          <GlassPanel depth="embed" className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--accent-azure)]" />
              <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Seller reference</p>
            </div>
            <SellerBadge sellerRef={record.sellerRef} showLabel />
            <p className="mt-1 font-mono-label text-[8px] text-[var(--ink-soft)]">{record.id}</p>
          </GlassPanel>

          <GlassPanel depth="embed" className="p-5">
            <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Contact</p>
            <p className="text-sm text-[var(--ink-soft)] text-pretty">
              Opens WhatsApp with a prefilled, URL-encoded message. You press Send — the website never sends automatically.
            </p>
            <MagneticButton className="mt-3 w-full" onClick={() => requireAuth(
              { type: "inquiry", listingId: record.id, listingType: "account", url: wa },
              () => window.open(wa, "_blank", "noopener,noreferrer"),
            )} strength={6}>
              Inquire on WhatsApp
            </MagneticButton>
          </GlassPanel>
        </div>
      </div>

      {/* Similar listings */}
      {related.length > 0 && (
        <div>
          <h3 className="mb-5 font-heading text-xl font-semibold text-[var(--ink)]">
            Similar <span className="font-display text-gradient-cyan italic">listings</span>
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a, i) => (
              <RevealText key={a.id} delay={i * 80}>
                <AccountCard record={a} variant="default" />
              </RevealText>
            ))}
          </div>
        </div>
      )}

      {/* Trust disclaimer */}
      <p className="mx-auto max-w-2xl text-center font-mono-label text-[9px] leading-relaxed text-[var(--ink-soft)]">
        {siteConfig.trustDisclaimer}
      </p>

      {/* Mobile sticky CTA — wishlist + compare + Inquire (single synced state) */}
      <MobileStickyCTA wa={wa} id={record.id} type="account" />
    </div>
  );
}

/* ============================================================
 * TRUST PASSPORT — Known / Seller-provided / Not verified
 * ============================================================ */
function TrustPassport({ record }: { record: AccountListing }) {
  return (
    <GlassPanel depth="stack" holo className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[var(--accent-cyan)]" />
        <p className="font-heading text-sm font-semibold text-[var(--ink)]">Trust Passport</p>
      </div>

      {/* Known — canonical facts */}
      <PassportSection label="Known" tone="good" icon={<Check className="h-3 w-3" />}>
        <PassportRow label="Listing ID" value={record.id} />
        <PassportRow label="Category" value={record.category} />
        <PassportRow label="Level" value={String(record.level)} />
        <PassportRow label="Region" value={record.region} />
        <PassportRow label="Price" value={`₹${record.priceInr.toLocaleString("en-IN")}`} />
        {record.rank && <PassportRow label="Rank" value={record.rank} />}
      </PassportSection>

      {/* Seller-provided — evidence flags */}
      <PassportSection label="Seller-provided" tone="cyan" icon={<Mail className="h-3 w-3" />}>
        <EvidenceChip label="Bound email" present={record.evidence.hasBoundEmail} icon={<Mail className="h-3 w-3" />} />
        <EvidenceChip label="Receipt" present={record.evidence.hasOriginalReceipt} icon={<Receipt className="h-3 w-3" />} />
        <EvidenceChip label="Recovery" present={record.evidence.hasRecoveryAccess} icon={<KeyRound className="h-3 w-3" />} />
      </PassportSection>

      {/* Trust highlights — data-driven, never fabricated */}
      <TrustHighlights items={record.trustHighlights} max={Infinity} className="mt-2" />

      {/* Not verified — honest gaps */}
      <PassportSection label="Not verified" tone="warn" icon={<AlertCircle className="h-3 w-3" />}>
        <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
          <X className="h-3 w-3 text-[oklch(0.6_0.14_45)]" />
          FF TRUST does not verify account ownership
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
          <X className="h-3 w-3 text-[oklch(0.6_0.14_45)]" />
          No guaranteed outcome or safety
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
          <X className="h-3 w-3 text-[oklch(0.6_0.14_45)]" />
          Screen recording is your responsibility
        </div>
      </PassportSection>

      <p className="mt-4 font-mono-label text-[8px] leading-relaxed text-[var(--ink-soft)]">
        Provenance ≠ guarantee. Labels reflect the real canonical evidence state on file.
      </p>
    </GlassPanel>
  );
}

function PassportSection({
  label,
  tone,
  icon,
  children,
}: {
  label: string;
  tone: "good" | "cyan" | "warn";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "text-[oklch(0.45_0.14_160)]"
      : tone === "cyan"
        ? "text-[var(--accent-azure)]"
        : "text-[oklch(0.5_0.14_45)]";
  return (
    <div className="mb-4 border-t border-[var(--border)] pt-3 first:border-t-0 first:pt-0">
      <div className={cn("mb-2 flex items-center gap-1.5", toneClass)}>
        {icon}
        <p className="font-mono-label text-[9px]">{label}</p>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function PassportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <span className="font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}

/* ============================================================
 * ATTR helpers
 * ============================================================ */
function AttrRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
      <span className="flex items-center gap-1.5 font-mono-label text-[9px] text-[var(--ink-soft)]">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}

function AttrList({ label, items, icon }: { label: string; items: string[]; icon?: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] pb-2">
      <p className="mb-1.5 flex items-center gap-1.5 font-mono-label text-[9px] text-[var(--ink-soft)]">
        {icon}
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span key={item} className="glass-embed rounded-full px-2 py-0.5 text-[10px] text-[var(--ink)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
