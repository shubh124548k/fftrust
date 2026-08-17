"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Zap, ShieldCheck, PackageSearch } from "lucide-react";
import { RevealText } from "@/components/visual/reveal-text";
import { InstagramOrderModal } from "@/components/instagram/order-modal";
import { InstagramPackageCard } from "@/components/instagram/instagram-package-card";
import { EmptyState } from "@/components/visual/empty-state";
import {
  sortInstagramPackages,
  type InstagramPackageWithSavings,
  type InstagramSortKey,
} from "@/lib/selectors/instagram";
import type { InstagramServiceType } from "@/data/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PRICE_SORT_OPTIONS } from "@/lib/design/constants";

/**
 * FF TRUST — Shared Instagram service page (Views / Followers / Likes).
 *
 * One template drives every Instagram pricing page so each service is a true
 * clone: same navbar, dropdown, hamburger, background, typography, Holo-Chrome
 * cards, animations, spacing, order button, order modal, WhatsApp flow,
 * validation and responsive behavior. Only the data and per-service labels
 * change (hero word, hero icon, canonical packages).
 */
const SORT_OPTIONS = PRICE_SORT_OPTIONS as { value: InstagramSortKey; label: string }[];

export function InstagramServicePage({
  service,
  packages,
  heroIcon,
  heroWord,
}: {
  service: InstagramServiceType;
  packages: InstagramPackageWithSavings[];
  heroIcon: React.ReactNode;
  heroWord: string;
}) {
  const [selectedPkg, setSelectedPkg] = React.useState<InstagramPackageWithSavings | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sort, setSort] = React.useState<InstagramSortKey>("price-desc");

  const sortedPackages = React.useMemo(
    () => sortInstagramPackages(packages, sort),
    [packages, sort],
  );

  const handleOrder = (pkg: InstagramPackageWithSavings) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Instagram", href: "/instagram" },
            {
              label:
                service.key === "followers"
                  ? "Followers"
                  : service.key === "likes"
                    ? "Likes"
                    : "Views",
            },
          ]}
        />

        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
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
              {heroIcon}
            </span>
            <span className="font-mono-label text-xs text-[var(--accent-azure)]">INSTAGRAM</span>
          </div>
          <h1 className="font-heading text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
            Very Low Price —{" "}
            <span className="font-display text-gradient-cyan italic">{heroWord}</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
            Fast • Affordable • Transparent
          </p>
        </div>

        {/* Sort + count — Price High→Low / Low→High (numeric, canonical data) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="glass-embed inline-flex items-center rounded-full px-3 py-1.5 text-xs text-[var(--ink-soft)]">
              {sortedPackages.length} {sortedPackages.length === 1 ? "package" : "packages"}
            </span>
          </div>
          <div className="relative min-w-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as InstagramSortKey)}
              aria-label={`Sort ${heroWord.toLowerCase()} packages by price`}
              className="glass-embed w-full appearance-none rounded-full py-2 pl-3 pr-8 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] sm:py-2.5 sm:pl-4 sm:pr-9 sm:text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)] sm:right-3" />
          </div>
        </div>

        {/* Pricing cards grid */}
        {sortedPackages.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedPackages.map((pkg, i) => (
              <RevealText key={pkg.id} delay={Math.min(i * 40, 300)}>
                <InstagramPackageCard
                  service={service}
                  pkg={pkg}
                  onOpen={() => handleOrder(pkg)}
                />
              </RevealText>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<PackageSearch className="h-6 w-6" />}
            title={`No ${heroWord.toLowerCase()} packages available yet`}
            description="When the owner publishes real Instagram packages, they will appear here automatically. FF TRUST never displays fake inventory."
          />
        )}

        {/* Trust / Safety banner */}
        <div className="mt-16">
          <div
            className="glass-stack acrylic-sheen flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-start sm:gap-6"
            style={{ boxShadow: "var(--glass-shadow)" }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.2), oklch(0.7 0.12 290 / 0.16))",
              }}
            >
              <Zap className="h-6 w-6 text-[var(--accent-azure)]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">Service Information</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-[var(--ink)]">
                Transparent Pricing. Real Service.
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)] text-pretty">
                Prices and availability are based on the currently published catalogue.
                Please review the Terms and Refund Policy before ordering.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--ink-soft)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  No password required
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--ink-soft)]">
                  <Zap className="h-3.5 w-3.5" />
                  Fast delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <InstagramOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={service}
        pkg={selectedPkg}
      />
    </main>
  );
}
