"use client";

import Link from "next/link";
import { ArrowRight, Lock, Instagram as InstagramIcon, Eye, Users, Heart, Play } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getInstagramCategorySummaries, formatPrice } from "@/lib/selectors/instagram";
import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * FF TRUST — Instagram Marketplace Hub (/instagram).
 *
 * Data-driven category grid: Views, Followers, Likes (live) + YouTube (locked).
 * Counts and "from" prices are derived from canonical package data via selectors
 * — never hardcoded. Adding/removing packages in canonical data files
 * automatically updates every tile.
 */

const iconMap: Record<string, React.ReactNode> = {
  Eye: <Eye className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Play: <Play className="h-5 w-5" />,
  Instagram: <InstagramIcon className="h-5 w-5" />,
};

export function InstagramHubPage() {
  const categories = React.useMemo(() => getInstagramCategorySummaries(), []);

  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Instagram" }]} />

        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          ← Back to home
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                boxShadow: "var(--neon-cyan)",
              }}
            >
              <InstagramIcon className="h-5 w-5 text-white" />
            </span>
            <span className="font-mono-label text-xs text-[var(--accent-azure)]">INSTAGRAM</span>
          </div>
          <h1 className="font-heading text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-5xl">
            Instagram <span className="font-display text-gradient-cyan italic">Marketplace</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
            Views, Followers, and Likes — transparent INR pricing, WhatsApp ordering.
            Every count below is derived from the canonical production catalogue.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => {
            const isLocked = cat.meta.status === "coming-soon";
            const Icon = iconMap[cat.meta.iconKey ?? ""] ?? <InstagramIcon className="h-5 w-5" />;

            const tileContent = (
              <>
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      background: isLocked
                        ? "oklch(0.15 0.01 255 / 0.3)"
                        : "linear-gradient(135deg, oklch(0.74 0.15 196 / 0.16), oklch(0.6 0.19 290 / 0.12))",
                    }}
                  >
                    <span className={isLocked ? "text-[var(--ink-soft)]" : "text-[var(--accent-azure)]"}>
                      {Icon}
                    </span>
                  </span>
                  {isLocked ? (
                    <span className="glass-embed inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-semibold text-[var(--ink-soft)]">
                      <Lock className="h-3 w-3" />
                      Coming Soon
                    </span>
                  ) : typeof cat.count === "number" && cat.count > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[oklch(1_0_0/0.03)] px-3 py-1.5">
                      <span className="font-heading text-base font-semibold leading-none text-[var(--ink)]">
                        {cat.count}
                      </span>
                      <span className="font-mono-label text-[8px] leading-none text-[var(--ink-soft)]">
                        {cat.meta.unit}
                      </span>
                    </span>
                  ) : null}
                </div>

                {/* Title + description */}
                <div className="min-w-0">
                  <h3 className="font-heading text-xl font-semibold leading-tight text-[var(--ink)]">
                    {cat.meta.label}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
                    {cat.meta.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  {isLocked ? (
                    <>
                      <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">
                        Not yet available
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] text-[var(--ink-soft)]">
                        <Lock className="h-3 w-3" />
                        Coming Soon
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">
                        {cat.fromPrice !== null
                          ? `From ${formatPrice(cat.fromPrice)}`
                          : "Browse"}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors group-hover:border-[var(--accent-azure)] group-hover:text-[var(--accent-azure)]">
                        Browse {cat.meta.shortLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </>
                  )}
                </div>
              </>
            );

            const baseClass = cn(
              "glass-stack acrylic-sheen group relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 transition-all duration-300",
              !isLocked && "hover:-translate-y-1 hover:shadow-[var(--glass-shadow-lift)]",
              isLocked && "opacity-90",
            );

            if (!isLocked && cat.meta.href) {
              return (
                <Link
                  key={cat.meta.key}
                  href={cat.meta.href}
                  aria-label={`Browse ${cat.meta.label}`}
                  className={baseClass}
                >
                  {tileContent}
                </Link>
              );
            }

            return (
              <div
                key={cat.meta.key}
                aria-disabled="true"
                title={`${cat.meta.label} — coming soon`}
                className={cn(baseClass, "cursor-not-allowed")}
              >
                {tileContent}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
