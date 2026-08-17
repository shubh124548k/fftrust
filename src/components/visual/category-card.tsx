import * as React from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { StatusChip } from "./status-chip";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Category Card (PROMPT 2 universal category system).
 *
 * ONE reusable marketplace-destination card. Drives the homepage category hub
 * (and any future category grid) so there is exactly one implementation of the
 * category-card concept — never per-category hardcoded card variants.
 *
 * Supports:
 *  • icon tile (tone-colored) + optional data-driven count pill
 *  • title + description
 *  • sub-navigation rows (real Links) — the "first layer" of a category
 *  • a locked "coming soon" state (never a fake link) for whole cards OR rows
 *  • hover lift, focus ring, responsive layout
 *  • whole-card click/navigation when there are no sub-items
 *
 * Counts are always passed in from data-driven selectors — never hardcoded.
 */

export type CategoryTone = "azure" | "violet" | "cyan";

export interface CategorySubItem {
  key: string;
  label: string;
  /** Real destination. Omit (or set comingSoon) for a locked row. */
  href?: string;
  icon?: React.ReactNode;
  hint?: string;
  comingSoon?: boolean;
}

export interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: CategoryTone;
  /** Primary destination (required for an active card). */
  href?: string;
  ctaLabel?: string;
  /** Data-driven count — optional (hidden for coming-soon cards). */
  count?: number;
  countLabel?: string;
  subItems?: CategorySubItem[];
  comingSoon?: boolean;
  className?: string;
  ariaLabel?: string;
}

const toneTile: Record<CategoryTone, string> = {
  azure: "bg-[oklch(0.82_0.1_200/0.16)] text-[var(--accent-azure)]",
  violet: "bg-[oklch(0.7_0.12_290/0.16)] text-[var(--accent-violet)]",
  cyan: "bg-[oklch(0.74_0.15_196/0.16)] text-[var(--accent-cyan)]",
};

export function CategoryCard({
  icon,
  title,
  description,
  tone = "azure",
  href,
  ctaLabel,
  count,
  countLabel,
  subItems,
  comingSoon = false,
  className,
  ariaLabel,
}: CategoryCardProps) {
  const active = !comingSoon;
  const hasSubItems = !!subItems && subItems.length > 0;
  // A card with no sub-items becomes a single whole-card Link (click/navigation).
  const clickable = active && !!href && !hasSubItems;

  const body = (
    <>
      {/* Header — icon tile + count or coming-soon chip */}
      <div className="flex items-center justify-between gap-3">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", toneTile[tone])}>
          {icon}
        </span>
        {comingSoon ? (
          <StatusChip tone="neutral" icon={<Lock className="h-3 w-3" />}>
            Coming Soon
          </StatusChip>
        ) : typeof count === "number" ? (
          <CountPill value={count} label={countLabel ?? "items"} />
        ) : null}
      </div>

      {/* Title + description */}
      <div className="min-w-0">
        <h3 className="font-heading text-xl font-semibold leading-tight text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">{description}</p>
      </div>

      {/* Sub-navigation — real Links for active rows, locked rows for coming-soon */}
      {hasSubItems && (
        <div className={cn("grid gap-1.5", subItems.length >= 3 && "sm:grid-cols-2")}>
          {subItems.map((sub) =>
            sub.href && !sub.comingSoon ? (
              <Link
                key={sub.key}
                href={sub.href}
                aria-label={`Open ${sub.label}`}
                className="glass-embed flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                {sub.icon && <span className="shrink-0 text-[var(--accent-azure)]">{sub.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono-label text-[10px] font-semibold text-[var(--ink)]">{sub.label}</span>
                  {sub.hint && <span className="block truncate font-mono-label text-[8px] text-[var(--ink-soft)]">{sub.hint}</span>}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--ink-soft)]" />
              </Link>
            ) : (
              <div
                key={sub.key}
                aria-disabled="true"
                title={`${sub.label} — coming soon`}
                className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[oklch(1_0_0/0.02)] px-3 py-2.5"
              >
                {sub.icon && <span className="shrink-0 text-[var(--ink-soft)] opacity-60">{sub.icon}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono-label text-[10px] font-semibold text-[var(--ink-soft)]">{sub.label}</span>
                  <span className="block truncate font-mono-label text-[8px] text-[var(--ink-soft)] opacity-70">🔒 Coming Soon</span>
                </span>
                <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--ink-soft)] opacity-60" />
              </div>
            ),
          )}
        </div>
      )}

      {/* Footer — primary CTA for active cards, lock note for coming-soon */}
      {active ? (
        href && (
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">Data-driven</span>
            {clickable ? (
              // The whole card is already a link — render a non-link arrow affordance
              // to avoid nesting an <a> inside an <a> (invalid HTML + hydration error).
              <span
                aria-hidden
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)]"
              >
                {ctaLabel ?? "Browse"}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            ) : (
              <Link
                href={href}
                aria-label={ariaLabel ?? `Browse ${title}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                {ctaLabel ?? "Browse"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )
      ) : (
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">Not yet available</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 font-mono-label text-[10px] text-[var(--ink-soft)]">
            <Lock className="h-3 w-3" />
            Coming Soon
          </span>
        </div>
      )}
    </>
  );

  const containerClass = cn(
    "glass-stack acrylic-sheen group relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 transition-all duration-300",
    active && "hover:-translate-y-1 hover:shadow-[var(--glass-shadow-lift)]",
    comingSoon && "opacity-90",
    clickable && "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
    className,
  );

  if (clickable) {
    return (
      <Link href={href!} aria-label={ariaLabel ?? `Browse ${title}`} className={containerClass}>
        {body}
      </Link>
    );
  }
  return <div className={containerClass}>{body}</div>;
}

function CountPill({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[oklch(1_0_0/0.03)] px-3 py-1.5">
      <span className="font-heading text-base font-semibold leading-none text-[var(--ink)]">{value}</span>
      <span className="font-mono-label text-[8px] leading-none text-[var(--ink-soft)]">{label}</span>
    </span>
  );
}
