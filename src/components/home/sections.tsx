"use client";

import * as React from "react";
import {
  Compass,
  ShieldCheck,
  BadgeIndianRupee,
  LayoutList,
  Server,
  Trophy,
  Video,
  Info,
  Mail,
  Receipt,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Scale,
  ChevronDown,
  Search,
  Heart,
  AlertTriangle,
  MessageCircle,
  Columns3,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText, RevealGroup } from "@/components/visual/reveal-text";
import { GlassPanel, GlassCard } from "@/components/visual/glass-panel";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { AccountCard } from "@/components/visual/account-card";
import { PanelServiceCard, RankPushCard } from "@/components/visual/service-card";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { AccountListing, PanelSellerService, PaidPushService } from "@/data/types";

/* ============================================================
 * FLOATING RAIL — horizontal scroll of featured accounts
 * A different rhythm from the grid: cards float on a rail.
 * ============================================================ */
export function FloatingRail({
  records,
  isSample,
  emptyAction,
}: {
  records: AccountListing[];
  isSample: boolean;
  emptyAction?: React.ReactNode;
}) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title="No real accounts listed yet"
        description="When the owner publishes canonical account records, they will appear here automatically — with full evidence metadata, INR pricing and WhatsApp inquiry."
        action={emptyAction}
      />
    );
  }
  return (
    <div>
      {isSample && (
        <RevealText>
          <div className="mb-6">
            <StatusChip tone="warn">Constitution preview · SAMPLE fixtures (not real inventory)</StatusChip>
          </div>
        </RevealText>
      )}
      <div className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:thin] snap-x snap-mandatory">
        {records.map((a, i) => (
          <RevealText key={a.id} delay={i * 60}>
            <div className="w-[min(80vw,22rem)] shrink-0 snap-center">
              <AccountCard record={a} />
            </div>
          </RevealText>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * SPLIT EDITORIAL — trust philosophy (text left, object right)
 * ============================================================ */
export function SplitEditorial({
  overline,
  title,
  italic,
  support,
  children,
}: {
  overline: string;
  title: string;
  italic: string;
  support: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <SectionHeading
        overline={overline}
        title={title}
        italic={italic}
        support={support}
      />
      <RevealText delay={120}>{children}</RevealText>
    </div>
  );
}

/* ============================================================
 * 3D PROCESS DIAGRAM — how it works (stepped, connected)
 * ============================================================ */
export function ProcessDiagram({
  steps,
}: {
  steps: { key: string; title: string; body: string; iconKey?: string }[];
}) {
  const icons: Record<string, React.ReactNode> = {
    Compass: <Compass className="h-5 w-5" />,
    ShieldCheck: <ShieldCheck className="h-5 w-5" />,
    Video: <Video className="h-5 w-5" />,
    MessageCircle: <MessageCircle className="h-5 w-5" />,
  };
  return (
    <RevealGroup className="relative mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <GlassPanel key={s.key} depth="float" className="relative flex flex-col gap-4 p-6">
          {/* Connector — decorative line to next step */}
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-[var(--accent-cyan)] to-transparent lg:block"
            />
          )}
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-[oklch(0.82_0.1_200/0.14)] text-[var(--accent-azure)]"
            >
              {s.iconKey ? icons[s.iconKey] : null}
            </span>
            <span className="font-mono-label text-[10px] text-[var(--ink-soft)]">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <h3 className="font-heading text-base font-semibold text-[var(--ink)]">{s.title}</h3>
          <p className="text-sm text-[var(--ink-soft)] text-pretty">{s.body}</p>
        </GlassPanel>
      ))}
    </RevealGroup>
  );
}

/* ============================================================
 * SERVICE SHOWROOM — panel + paid push in a split layout
 * ============================================================ */
export function ServiceShowroom({
  panelRecords,
  panelIsSample,
  pushRecords,
  pushIsSample,
}: {
  panelRecords: PanelSellerService[];
  panelIsSample: boolean;
  pushRecords: PaidPushService[];
  pushIsSample: boolean;
}) {
  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-2">
      <div>
        <div className="mb-5 flex items-center gap-2">
          <StatusChip tone="violet" icon={<Server className="h-3 w-3" />}>Panel Seller</StatusChip>
          {panelIsSample && <StatusChip tone="warn">SAMPLE</StatusChip>}
        </div>
        {panelRecords.length > 0 ? (
          <div className="flex flex-col gap-6">
            {panelRecords.slice(0, 2).map((s, i) => (
              <RevealText key={s.id} delay={i * 80}>
                <PanelServiceCard record={s} />
              </RevealText>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Server className="h-6 w-6" />} title="No real services yet" description="Canonical panel-seller records appear here automatically." />
        )}
      </div>
      <div>
        <div className="mb-5 flex items-center gap-2">
          <StatusChip tone="cyan" icon={<Trophy className="h-3 w-3" />}>Paid Push</StatusChip>
          {pushIsSample && <StatusChip tone="warn">SAMPLE</StatusChip>}
        </div>
        {pushRecords.length > 0 ? (
          <div className="flex flex-col gap-6">
            {pushRecords.slice(0, 2).map((p, i) => (
              <RevealText key={p.id} delay={i * 80}>
                <RankPushCard record={p} />
              </RevealText>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Trophy className="h-6 w-6" />} title="No real packages yet" description="Canonical CS / BR packages appear here automatically." />
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * EVIDENCE ORBIT — scam center red flags in an orbit layout
 * ============================================================ */
export function EvidenceOrbit({
  redFlags,
  goldenRule,
}: {
  redFlags: { key: string; label: string; body: string }[];
  goldenRule: string;
}) {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {redFlags.map((f, i) => (
        <RevealText key={f.key} delay={i * 70}>
          <GlassPanel depth="base" className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.2)] text-[oklch(0.5_0.16_45)]"
              >
                <AlertTriangle className="h-4 w-4" />
              </span>
              <span className="font-mono-label text-[9px] text-[oklch(0.5_0.16_45)]">Red flag</span>
            </div>
            <h3 className="font-heading text-sm font-semibold text-[var(--ink)]">{f.label}</h3>
            <p className="text-xs text-[var(--ink-soft)] text-pretty">{f.body}</p>
          </GlassPanel>
        </RevealText>
      ))}
      <RevealText delay={redFlags.length * 70}>
        <GlassPanel depth="strong" className="flex h-full flex-col justify-center gap-3 p-5">
          <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Golden rule</p>
          <p className="text-sm font-medium text-[var(--ink)] text-pretty">{goldenRule}</p>
        </GlassPanel>
      </RevealText>
    </div>
  );
}

/* ============================================================
 * COMPARISON STAGE — compare / favorites preview
 * ============================================================ */
export function ComparisonStage({
  intro,
  emptyNote,
  realCount,
}: {
  intro: string;
  emptyNote: string;
  realCount: number;
}) {
  return (
    <RevealText>
      <GlassPanel depth="float" className="relative overflow-hidden p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[oklch(0.82_0.1_200/0.12)] text-[var(--accent-azure)]"
            >
              <Columns3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--ink)]">Side-by-side comparison</h3>
              <p className="mt-1 max-w-md text-sm text-[var(--ink-soft)] text-pretty">{intro}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton variant="glass" strength={6} onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>
              <Search className="h-4 w-4" />
              Find accounts
            </MagneticButton>
            <span className="glass-embed inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--accent-violet)]">
              <Heart className="h-4 w-4" />
            </span>
          </div>
        </div>
        {realCount === 0 && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[oklch(0.96_0.006_245/0.5)] p-4">
            <p className="text-sm text-[var(--ink-soft)] text-pretty">{emptyNote}</p>
          </div>
        )}
      </GlassPanel>
    </RevealText>
  );
}

/* ============================================================
 * CINEMATIC CTA — final contact section
 * ============================================================ */
export function CinematicCTA({ wa }: { wa: string }) {
  return (
    <RevealText>
      <GlassPanel depth="pedestal" holo className="relative overflow-hidden p-10 text-center sm:p-14">
        <div aria-hidden className="light-wash absolute inset-0" />
        <div className="relative flex flex-col items-center gap-6">
          <StatusChip tone="cyan" icon={<MessageCircle className="h-3 w-3" />}>Contact</StatusChip>
          <h2 className="font-heading text-balance text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
            Ready to <span className="font-display text-gradient-cyan italic">begin?</span>
          </h2>
          <p className="max-w-xl text-pretty text-base text-[var(--ink-soft)] sm:text-lg">
            Open WhatsApp with a prefilled, URL-encoded message. You review it and press Send — the website never sends automatically and never collects passwords, OTPs or recovery codes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <MagneticButton onClick={() => window.open(wa, "_blank", "noopener,noreferrer")} className="px-8 py-4 text-base">
              <MessageCircle className="h-4 w-4" />
              Contact Owner
            </MagneticButton>
            <MagneticButton variant="glass" strength={8} onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} className="px-8 py-4 text-base">
              Explore accounts
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
          <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">{siteConfig.trustDisclaimer}</p>
        </div>
      </GlassPanel>
    </RevealText>
  );
}
