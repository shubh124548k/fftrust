"use client";

import * as React from "react";
import { X, Check, Layers, FileText, User, MessageCircle, ShieldCheck, Trophy } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip, PricePlate, EvidenceChip } from "@/components/visual/status-chip";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { MediaGallery } from "@/components/detail/media-gallery";
import { BuyerProofPanel } from "@/components/proof/buyer-proof-panel";
import { useServiceDetailStore } from "@/stores/service-detail";
import { getPanelServiceById, getRankPushById } from "@/lib/selectors/services";
import { toListingMediaList } from "@/lib/media";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { z } from "@/lib/design/depth";
import type { PanelSellerService, PaidPushService } from "@/data/types";

/**
 * FF TRUST — Service Detail Overlay (PROMPT 10).
 *
 * A full-screen glass dialog showing a Panel Seller service in detail:
 * media gallery, scope, requirements, included/excluded, terms, seller
 * reference, evidence, WhatsApp. Focus trap, Escape, body scroll lock.
 */
export function ServiceDetailOverlay() {
  const selectedId = useServiceDetailStore((s) => s.selectedId);
  const close = useServiceDetailStore((s) => s.close);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; cancelAnimationFrame(id); };
  }, [selectedId, close]);

  if (!selectedId) return null;

  const panelRecord = getPanelServiceById(selectedId);
  const pushRecord = getRankPushById(selectedId);
  const record = panelRecord ?? pushRecord;
  const isPush = !!pushRecord && !panelRecord;

  return (
    <div className="fixed inset-0" style={{ zIndex: z("modal") }} role="dialog" aria-modal="true" aria-label="Service detail">
      <div className="absolute inset-0 bg-[oklch(0.12_0.01_255/0.5)] backdrop-blur-md" onClick={close} style={{ animation: "ff-fade-in 220ms ease-out" }} />
      <div ref={panelRef} className="glass-stack absolute inset-x-0 top-0 m-3 max-h-[96vh] overflow-y-auto rounded-[2rem] p-5 sm:m-6 sm:p-8" style={{ animation: "ff-slide-down 360ms cubic-bezier(0.22,1,0.36,1)" }} data-light="showroom">
        <div className="sticky top-0 z-10 -mx-5 mb-6 flex items-center justify-end bg-gradient-to-b from-[var(--glass-bg-strong)] to-transparent px-5 pb-3 pt-1 sm:-mx-8 sm:px-8">
          <button ref={closeRef} type="button" aria-label="Close detail" onClick={close} className="glass-embed inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--ink)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {record ? (
          isPush && pushRecord ? <RankPushDossier record={pushRecord} /> : panelRecord ? <ServiceDossier record={panelRecord} /> : null
        ) : (
          <div className="py-12 text-center">
            <p className="font-heading text-xl font-semibold text-[var(--ink)]">Service not found</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">This service may have been unpublished.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceDossier({ record }: { record: NonNullable<ReturnType<typeof getPanelServiceById>> }) {
  const wa = buildWhatsAppUrl({
    id: record.id,
    title: record.title,
    price: record.priceInr,
    mode: record.category,
    category: record.category,
    sellerRef: record.sellerRef,
    inquiry: "Interested in this service. Please share scope & availability.",
    buyer: true,
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Identity + price */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {record.demo && <StatusChip tone="warn">SAMPLE</StatusChip>}
            {record.featured && !record.demo && <StatusChip tone="cyan">Featured</StatusChip>}
            <StatusChip tone="violet" icon={<Layers className="h-3 w-3" />}>{record.category}</StatusChip>
          </div>
          <h2 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">{record.title}</h2>
          <p className="font-mono-label text-[10px] text-[var(--ink-soft)]">{record.id} · {record.sellerRef}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <PricePlate value={record.priceInr} size="lg" />
          <MagneticButton onClick={() => window.open(wa, "_blank", "noopener,noreferrer")} className="px-6 py-3">
            Contact Owner
          </MagneticButton>
        </div>
      </div>

      {/* Media gallery */}
      <MediaGallery media={toListingMediaList(record, record.title)} title={record.title} />

      {/* Buyer safety */}
      <BuyerProofPanel variant="banner" />

      {/* Dossier grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-6">
          <GlassPanel depth="float" className="p-6">
            <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Scope</p>
            <p className="text-sm text-[var(--ink-soft)] text-pretty">{record.scope}</p>
          </GlassPanel>

          {record.requirements.length > 0 && (
            <GlassPanel depth="float" className="p-6">
              <p className="font-mono-label mb-3 text-[9px] text-[var(--accent-azure)]">Requirements</p>
              <div className="flex flex-wrap gap-2">
                {record.requirements.map((r) => (
                  <StatusChip key={r} tone="neutral">{r}</StatusChip>
                ))}
              </div>
            </GlassPanel>
          )}

          <GlassPanel depth="float" className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Included</p>
                <ul className="space-y-1.5">
                  {record.included.map((i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--ink)]">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.55_0.14_160)]" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono-label mb-2 text-[9px] text-[var(--ink-soft)]">Excluded</p>
                <ul className="space-y-1.5">
                  {record.excluded.map((i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--ink-soft)]">
                      <X className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.6_0.14_45)]" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
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

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {record.evidence && (
            <GlassPanel depth="stack" holo className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-cyan)]" />
                <p className="font-heading text-sm font-semibold text-[var(--ink)]">Evidence</p>
              </div>
              <div className="flex flex-col gap-2">
                <EvidenceChip label="Bound email" present={record.evidence.hasBoundEmail} />
                <EvidenceChip label="Receipt" present={record.evidence.hasOriginalReceipt} />
                <EvidenceChip label="Recovery" present={record.evidence.hasRecoveryAccess} />
              </div>
              <p className="mt-3 font-mono-label text-[8px] leading-relaxed text-[var(--ink-soft)]">
                Provenance ≠ guarantee. Labels reflect the real canonical evidence state.
              </p>
            </GlassPanel>
          )}

          <GlassPanel depth="embed" className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--accent-azure)]" />
              <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Seller reference</p>
            </div>
            <p className="text-sm font-medium text-[var(--ink)]">{record.sellerRef}</p>
            <p className="mt-1 font-mono-label text-[8px] text-[var(--ink-soft)]">{record.id}</p>
          </GlassPanel>

          <GlassPanel depth="embed" className="p-5">
            <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Contact</p>
            <p className="text-sm text-[var(--ink-soft)] text-pretty">
              Opens WhatsApp with a prefilled message. You press Send — never automatic.
            </p>
            <MagneticButton className="mt-3 w-full" onClick={() => window.open(wa, "_blank", "noopener,noreferrer")} strength={6}>
              <MessageCircle className="h-4 w-4" />
              Inquire on WhatsApp
            </MagneticButton>
          </GlassPanel>
        </div>
      </div>

      <p className="mx-auto max-w-2xl text-center font-mono-label text-[9px] leading-relaxed text-[var(--ink-soft)]">
        {siteConfig.trustDisclaimer}
      </p>
    </div>
  );
}

/**
 * Rank Push Dossier — detail view for PaidPushService records.
 * Shows rank journey, scope, requirements, schedule (when real), no-guarantee,
 * terms, seller, evidence, WhatsApp.
 */
function RankPushDossier({ record }: { record: PaidPushService }) {
  const wa = buildWhatsAppUrl({
    id: record.id,
    title: record.title,
    price: record.priceInr,
    mode: `${record.mode} Rank Push · ${record.fromRank} → ${record.toRank}`,
    category: `${record.mode} Rank Push`,
    sellerRef: record.sellerRef,
    inquiry: "Interested in this rank-push package. Please share scope & schedule.",
    buyer: true,
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Identity + price */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {record.demo && <StatusChip tone="warn">SAMPLE</StatusChip>}
            {record.featured && !record.demo && <StatusChip tone="cyan">Featured</StatusChip>}
            <StatusChip tone={record.mode === "CS" ? "cyan" : "violet"} icon={<Trophy className="h-3 w-3" />}>{record.mode} Rank Push</StatusChip>
            <StatusChip tone="azure">{record.packageTier}</StatusChip>
          </div>
          <h2 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">{record.title}</h2>
          <p className="font-mono-label text-[10px] text-[var(--ink-soft)]">{record.id} · {record.sellerRef}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <PricePlate value={record.priceInr} size="lg" />
          <MagneticButton onClick={() => window.open(wa, "_blank", "noopener,noreferrer")} className="px-6 py-3">Contact Owner</MagneticButton>
        </div>
      </div>

      {/* Rank journey visual */}
      <GlassPanel depth="float" className="relative overflow-hidden p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">FROM</p>
            <p className="font-heading text-xl font-semibold text-[var(--ink)]">{record.fromRank}</p>
          </div>
          <svg width="120" height="32" viewBox="0 0 120 32" fill="none" aria-hidden>
            <path d="M2 16 L100 16" stroke="oklch(0.74 0.15 196 / 0.6)" strokeWidth="2" strokeDasharray="4 6" />
            <path d="M92 8 L108 16 L92 24" stroke="oklch(0.6 0.19 290)" strokeWidth="2" fill="none" />
            <circle cx="2" cy="16" r="5" fill="oklch(0.74 0.15 196 / 0.8)" />
            <circle cx="100" cy="16" r="7" fill="oklch(0.6 0.19 290 / 0.8)" />
          </svg>
          <div className="text-center">
            <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">TO</p>
            <p className="font-heading text-xl font-semibold text-gradient-cyan">{record.toRank}</p>
          </div>
        </div>
      </GlassPanel>

      {/* Media gallery */}
      <MediaGallery media={toListingMediaList(record, record.title)} title={record.title} />

      {/* Buyer safety */}
      <BuyerProofPanel variant="banner" />

      {/* Dossier grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-6">
          <GlassPanel depth="float" className="p-6">
            <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Scope</p>
            <p className="text-sm text-[var(--ink-soft)] text-pretty">{record.scope}</p>
          </GlassPanel>

          {record.requirements.length > 0 && (
            <GlassPanel depth="float" className="p-6">
              <p className="font-mono-label mb-3 text-[9px] text-[var(--accent-azure)]">Requirements</p>
              <div className="flex flex-wrap gap-2">
                {record.requirements.map((r) => (<StatusChip key={r} tone="neutral">{r}</StatusChip>))}
              </div>
            </GlassPanel>
          )}

          {record.schedule && (
            <GlassPanel depth="float" className="p-6">
              <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Schedule</p>
              <p className="text-sm text-[var(--ink-soft)] text-pretty">{record.schedule}</p>
            </GlassPanel>
          )}

          {/* No-guarantee — prominent */}
          <div className="rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.18)] p-4">
            <p className="font-mono-label text-[9px] text-[oklch(0.45_0.14_45)]">No guarantee</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
              No guaranteed rank, wins, completion, anti-ban or safety. No cheats, exploits, anti-cheat bypasses, unauthorized account access or credential collection. Scope &amp; effort only.
            </p>
          </div>

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

        <div className="flex flex-col gap-6">
          {record.evidence && (
            <GlassPanel depth="stack" holo className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-cyan)]" />
                <p className="font-heading text-sm font-semibold text-[var(--ink)]">Evidence</p>
              </div>
              <div className="flex flex-col gap-2">
                <EvidenceChip label="Bound email" present={record.evidence.hasBoundEmail} />
                <EvidenceChip label="Receipt" present={record.evidence.hasOriginalReceipt} />
                <EvidenceChip label="Recovery" present={record.evidence.hasRecoveryAccess} />
              </div>
              <p className="mt-3 font-mono-label text-[8px] leading-relaxed text-[var(--ink-soft)]">Provenance ≠ guarantee.</p>
            </GlassPanel>
          )}

          <GlassPanel depth="embed" className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--accent-azure)]" />
              <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Seller reference</p>
            </div>
            <p className="text-sm font-medium text-[var(--ink)]">{record.sellerRef}</p>
            <p className="mt-1 font-mono-label text-[8px] text-[var(--ink-soft)]">{record.id}</p>
          </GlassPanel>

          <GlassPanel depth="embed" className="p-5">
            <p className="font-mono-label mb-2 text-[9px] text-[var(--accent-azure)]">Contact</p>
            <p className="text-sm text-[var(--ink-soft)] text-pretty">Opens WhatsApp with a prefilled message. You press Send — never automatic.</p>
            <MagneticButton className="mt-3 w-full" onClick={() => window.open(wa, "_blank", "noopener,noreferrer")} strength={6}>
              <MessageCircle className="h-4 w-4" /> Inquire on WhatsApp
            </MagneticButton>
          </GlassPanel>
        </div>
      </div>

      <p className="mx-auto max-w-2xl text-center font-mono-label text-[9px] leading-relaxed text-[var(--ink-soft)]">
        {siteConfig.trustDisclaimer}
      </p>
    </div>
  );
}
