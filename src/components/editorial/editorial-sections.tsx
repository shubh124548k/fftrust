"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Receipt,
  KeyRound,
  AlertTriangle,
  Video,
  Circle,
  Check,
  Columns3,
  ArrowRight,
  X,
  Lightbulb,
} from "lucide-react";
import { GlassPanel, GlassCard } from "@/components/visual/glass-panel";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText, RevealGroup } from "@/components/visual/reveal-text";
import { StatusChip, PricePlate } from "@/components/visual/status-chip";
import { EmptyState } from "@/components/visual/empty-state";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { HolographicShield, LuminousRings } from "@/components/visual/objects";
import { useReveal } from "@/lib/design/use-performance-tier";
import { useFavoritesStore } from "@/stores/favorites";
import { cn } from "@/lib/utils";
import type { TrustContent, ScamCenterContent, SafetyAcademyContent, AccountListing } from "@/data/types";
import { getAccountById, getAccountPriceBounds } from "@/lib/selectors/accounts";

/* ============================================================
 * 1. TRUST CENTER — animated evidence/provenance map
 * 3D shield focal + flowing evidence nodes connected by luminous lines.
 * ============================================================ */
export function TrustCenterMap({ trust }: { trust: TrustContent }) {
  const iconMap: Record<string, React.ReactNode> = {
    Mail: <Mail className="h-5 w-5" />,
    Receipt: <Receipt className="h-5 w-5" />,
    KeyRound: <KeyRound className="h-5 w-5" />,
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
      {/* Left: 3D shield focal + intro */}
      <div className="flex flex-col gap-6">
        <SectionHeading
          overline="01 — Trust Center"
          title="The evidence"
          italic="provenance map"
          support={trust.disclaimer}
        />
        <div className="relative flex aspect-square max-w-sm items-center justify-center">
          <HolographicShield className="h-full w-full" />
        </div>
      </div>

      {/* Right: animated evidence map */}
      <div className="relative">
        <RevealGroup className="flex flex-col gap-4">
          {trust.pillars.map((p, i) => (
            <EvidenceNode
              key={p.key}
              index={i}
              icon={iconMap[p.iconKey ?? ""] ?? <ShieldCheck className="h-5 w-5" />}
              title={p.title}
              body={p.body}
            />
          ))}
        </RevealGroup>
        {/* Luminous connector line (decorative) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-6 top-12 h-[calc(100%-6rem)] w-px"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.74 0.15 196 / 0.4) 0%, oklch(0.6 0.19 290 / 0.3) 50%, oklch(0.74 0.15 196 / 0.4) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function EvidenceNode({
  index,
  icon,
  title,
  body,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "glass-float relative flex items-start gap-4 rounded-2xl p-5 transition-all duration-500",
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
      )}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <span
        aria-hidden
        className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[oklch(0.82_0.1_200/0.14)] text-[var(--accent-azure)]"
      >
        {icon}
      </span>
      <div className="flex-1">
        <h3 className="font-heading text-base font-semibold text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">{body}</p>
      </div>
      <StatusChip tone={index === 0 ? "cyan" : index === 1 ? "azure" : "violet"}>
        {String(index + 1).padStart(2, "0")}
      </StatusChip>
    </div>
  );
}

/* ============================================================
 * 2. SCAM CENTER — interactive red-flag cards (6 types)
 * Tap to expand/collapse; golden rule footer.
 * ============================================================ */
export function ScamCenterInteractive({ scam }: { scam: ScamCenterContent }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        overline="05 — Scam Center"
        title="Interactive"
        italic="red-flag cards"
        support={scam.intro}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scam.redFlags.map((flag, i) => (
          <RedFlagCard key={flag.key} index={i} label={flag.label} body={flag.body} />
        ))}
      </div>
      <RevealText>
        <GlassPanel depth="strong" holo className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:gap-5 sm:text-left">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.2)] text-[oklch(0.5_0.16_45)]"
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono-label text-[9px] text-[oklch(0.5_0.16_45)]">Golden rule</p>
            <p className="mt-1 text-sm font-medium text-[var(--ink)] text-pretty">{scam.goldenRule}</p>
          </div>
        </GlassPanel>
      </RevealText>
    </div>
  );
}

function RedFlagCard({ index, label, body }: { index: number; label: string; body: string }) {
  const [open, setOpen] = React.useState(false);
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible")}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <GlassPanel
        depth="float"
        interactive
        className="flex h-full cursor-pointer flex-col gap-3 p-5"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.7_0.14_45/0.3)] bg-[oklch(0.86_0.1_80/0.2)] text-[oklch(0.5_0.16_45)]"
          >
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="font-mono-label text-[9px] text-[oklch(0.5_0.16_45)]">Red flag {String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="font-heading text-sm font-semibold text-[var(--ink)]">{label}</h3>
        <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
          <p className="text-xs text-[var(--ink-soft)] text-pretty">{body}</p>
        </div>
        <span className="mt-auto font-mono-label text-[8px] text-[var(--accent-azure)]">
          {open ? "Tap to collapse" : "Tap to expand"}
        </span>
      </GlassPanel>
    </div>
  );
}

/* ============================================================
 * 3. SAFETY ACADEMY — visual step-by-step journey
 * Vertical timeline with 3D nodes, luminous connectors, staggered reveal.
 * ============================================================ */
export function SafetyAcademyJourney({ academy }: { academy: SafetyAcademyContent }) {
  const iconMap: Record<string, React.ReactNode> = {
    Video: <Video className="h-5 w-5" />,
    ShieldCheck: <ShieldCheck className="h-5 w-5" />,
    KeyRound: <KeyRound className="h-5 w-5" />,
    CircleRecord: <Circle className="h-5 w-5" />,
    Check: <Check className="h-5 w-5" />,
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        overline="Safety Academy"
        title="A visual"
        italic="safety journey"
        support={academy.intro}
      />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-5 top-8 h-[calc(100%-4rem)] w-0.5 sm:left-6"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.74 0.15 196 / 0.5) 0%, oklch(0.6 0.19 290 / 0.4) 50%, oklch(0.74 0.15 196 / 0.5) 100%)",
          }}
        />
        <div className="flex flex-col gap-6">
          {academy.lessons.map((lesson, i) => (
            <SafetyLesson
              key={lesson.key}
              index={i}
              icon={iconMap[lesson.iconKey ?? ""] ?? <ShieldCheck className="h-5 w-5" />}
              title={lesson.title}
              body={lesson.body}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SafetyLesson({
  index,
  icon,
  title,
  body,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-start gap-4 transition-all duration-500 sm:gap-6",
        visible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span
        aria-hidden
        className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--accent-cyan)] bg-[var(--background)] text-[var(--accent-azure)] sm:h-12 sm:w-12"
        style={{ boxShadow: "var(--neon-soft)" }}
      >
        {icon}
      </span>
      <GlassPanel depth="float" className="flex-1 p-5">
        <div className="flex items-center gap-2">
          <span className="font-mono-label text-[9px] text-[var(--accent-azure)]">
            Lesson {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-1 font-heading text-base font-semibold text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">{body}</p>
      </GlassPanel>
    </div>
  );
}

/* ============================================================
 * 4. PRICE GUIDE — derived min/max/range/count from real records
 * No fake averages. Honest empty state.
 * ============================================================ */
export function PriceGuideDerived() {
  const bounds = getAccountPriceBounds();
  const range = bounds.count > 0 ? bounds.max - bounds.min : 0;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        overline="06 — Price Guide"
        title="Observed values, derived from"
        italic="real records"
        support="Price bounds are computed from published canonical records — never hardcoded. No invented market averages. When no real listings exist, the guide says so honestly."
      />
      {bounds.count > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PriceMetric label="Lowest" value={`₹${bounds.min.toLocaleString("en-IN")}`} />
          <PriceMetric label="Highest" value={`₹${bounds.max.toLocaleString("en-IN")}`} />
          <PriceMetric label="Range" value={`₹${range.toLocaleString("en-IN")}`} />
          <PriceMetric label="Listings" value={String(bounds.count)} />
        </div>
      ) : (
        <EmptyState
          icon={<Lightbulb className="h-6 w-6" />}
          title="No real prices to show yet"
          description="The guide recomputes automatically once canonical listings are published. No fake averages — only honest observed values."
          action={<StatusChip tone="warn">Awaiting real inventory</StatusChip>}
        />
      )}
      <RevealText>
        <p className="mx-auto max-w-2xl text-center font-mono-label text-[9px] leading-relaxed text-[var(--ink-soft)]">
          Values derived from getAccountPriceBounds() — computed from published, non-demo records only.
        </p>
      </RevealText>
    </div>
  );
}

function PriceMetric({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel depth="float" className="flex flex-col gap-2 p-5">
      <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">{label}</p>
      <p className="font-heading text-2xl font-semibold text-gradient-cyan">{value}</p>
    </GlassPanel>
  );
}

/* ============================================================
 * 5. COMPARE STAGE — 2-4 real records, glass columns, animated alignment
 * Reads from favorites/compare store. Honest missing values. 3D shield.
 * ============================================================ */
export function CompareStage({ intro, emptyNote }: { intro: string; emptyNote: string }) {
  const compare = useFavoritesStore((s) => s.compare);
  const compareCount = compare.length;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading
        overline="07 — Compare"
        title="Side-by-side"
        italic="comparison"
        support={intro}
      />

      <EmptyState
        icon={<Columns3 className="h-6 w-6" />}
        title={compareCount > 0 ? `${compareCount} listing${compareCount === 1 ? "" : "s"} ready to compare` : "Add 2 or more listings to compare"}
        description={emptyNote}
        action={
          <Link
            href={compareCount >= 2 ? "/compare" : "/accounts"}
            className="magnetic inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            {compareCount >= 2 ? "View comparison" : "Browse listings"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    </div>
  );
}

function CompareColumn({ record, index, onRemove }: { record: AccountListing; index: number; onRemove: () => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-72 shrink-0 flex-col transition-all duration-500",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <GlassPanel depth="stack" holo className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-sm font-semibold text-[var(--ink)]">{record.title}</h3>
            <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">{record.id}</p>
          </div>
          <button
            type="button"
            aria-label="Remove from compare"
            onClick={onRemove}
            className="glass-embed inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--ink-soft)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">Price</span>
          <PricePlate value={record.priceInr} size="sm" />
        </div>
        <CompareRow label="Level" value={String(record.level)} />
        <CompareRow label="Rank" value={record.rank ?? "—"} missing={!record.rank} />
        <CompareRow label="Prime" value={record.prime ? "Yes" : "No"} />
        <CompareRow label="Category" value={record.category} />
        <CompareRow label="Region" value={record.region} />
        <CompareRow label="Collections" value={record.collections?.length ? String(record.collections.length) : "—"} missing={!record.collections?.length} />
        <CompareRow label="Weapons" value={record.weapons?.length ? String(record.weapons.length) : "—"} missing={!record.weapons?.length} />
        <CompareRow label="Bound email" value={record.evidence.hasBoundEmail ? "Yes" : "No"} missing={!record.evidence.hasBoundEmail} />
        <CompareRow label="Receipt" value={record.evidence.hasOriginalReceipt ? "Yes" : "No"} missing={!record.evidence.hasOriginalReceipt} />
        <CompareRow label="Recovery" value={record.evidence.hasRecoveryAccess ? "Yes" : "No"} missing={!record.evidence.hasRecoveryAccess} />
      </GlassPanel>
    </div>
  );
}

function CompareRow({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2 last:border-b-0">
      <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">{label}</span>
      <span className={cn("text-sm font-medium", missing ? "text-[var(--ink-soft)] italic" : "text-[var(--ink)]")}>
        {value}
      </span>
    </div>
  );
}
