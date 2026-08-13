"use client";

import Link from "next/link";
import {
  Compass,
  Server,
  Trophy,
  Instagram,
  ArrowRight,
  Eye,
  Users,
  Heart,
} from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { StatusChip } from "@/components/visual/status-chip";
import { getHomepageCatalogueStats } from "@/lib/selectors/catalogue";

/**
 * FF TRUST — Homepage Category Hub (PROMPT 1).
 *
 * Four premium category-navigation cards: Free Fire Accounts, Panel & Services,
 * Paid Push — CS / BR and Instagram Services. Each card is DATA-AWARE — the
 * counts come from the shared `getHomepageCatalogueStats()` helper (canonical
 * production records only), never hardcoded. Adding/removing a canonical
 * record updates every card automatically.
 *
 * The Instagram card uses a semantic three-option control (real Links) instead
 * of a decorative clickable container, so it stays keyboard/touch accessible.
 */

const instagramOptions = [
  { key: "views", label: "Views", href: "/instagram/views", icon: <Eye className="h-3.5 w-3.5" /> },
  { key: "followers", label: "Followers", href: "/instagram/followers", icon: <Users className="h-3.5 w-3.5" /> },
  { key: "likes", label: "Likes", href: "/instagram/likes", icon: <Heart className="h-3.5 w-3.5" /> },
];

const cardClass =
  "glass-stack acrylic-sheen group relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--glass-shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]";

export function CategoryHub() {
  const stats = getHomepageCatalogueStats();

  return (
    <section id="category-hub" aria-labelledby="category-hub-title" className="section-ff relative">
      <div className="container-wide">
        <SectionHeading
          overline="01 — Browse"
          title="Four ways to"
          italic="explore"
          support="Jump straight to a marketplace category. Every count below is derived from the canonical production catalogue — never hardcoded."
          id="category-hub-title"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Free Fire Accounts */}
          <Link
            href="/accounts"
            aria-label="Browse the Free Fire accounts catalogue"
            className={cardClass}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[oklch(0.82_0.1_200/0.16)] text-[var(--accent-azure)]">
                <Compass className="h-5 w-5" />
              </span>
              <CountPill value={stats.realAccounts} label="real accounts" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Free Fire Accounts</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
                Real account listings with honest evidence metadata.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">Data-driven</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent-azure)]">
                View Accounts
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Panel & Services */}
          <Link
            href="/services"
            aria-label="Browse the panel and services catalogue"
            className={cardClass}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[oklch(0.7_0.12_290/0.16)] text-[var(--accent-violet)]">
                <Server className="h-5 w-5" />
              </span>
              <CountPill value={stats.realPanelServices} label="real services" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Panel &amp; Services</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
                Panel, top-up and care services from real sellers.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">Data-driven</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent-azure)]">
                View Services
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Paid Push — CS / BR */}
          <Link
            href="/paid-push"
            aria-label="Browse the paid push packages catalogue"
            className={cardClass}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[oklch(0.74_0.15_196/0.16)] text-[var(--accent-cyan)]">
                <Trophy className="h-5 w-5" />
              </span>
              <CountPill value={stats.realPaidPushPackages} label="real packages" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Paid Push — CS / BR</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
                Rank-push packages — scope and effort, no fake guarantees.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">Data-driven</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent-azure)]">
                View Packages
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Instagram Services — semantic three-option control */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--accent-azure)]"
                style={{
                  background: "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.2), oklch(0.7 0.12 290 / 0.2))",
                }}
              >
                <Instagram className="h-5 w-5" />
              </span>
              <StatusChip tone="neutral">100% Real</StatusChip>
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">Instagram Services</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">
                Views, followers and likes — real engagement, very low cost.
              </p>
            </div>
            <div role="group" aria-label="Choose an Instagram service" className="grid grid-cols-3 gap-1.5">
              {instagramOptions.map((o) => (
                <Link
                  key={o.key}
                  href={o.href}
                  aria-label={`Open Instagram ${o.label}`}
                  className="glass-embed flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                >
                  <span className="text-[var(--accent-azure)]">{o.icon}</span>
                  <span className="font-mono-label text-[8px] text-[var(--ink)]">{o.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-auto rounded-xl border border-[var(--border)] p-3 text-center">
              <span className="block font-mono-label text-[9px] font-semibold text-[var(--accent-azure)]">
                VERY LOW COST
              </span>
              <span className="block font-mono-label text-[8px] text-[var(--ink-soft)]">
                Views • Followers • Likes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CountPill({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[oklch(1_0_0/0.03)] px-3 py-1.5">
      <span className="font-heading text-base font-semibold leading-none text-[var(--ink)]">{value}</span>
      <span className="font-mono-label text-[8px] leading-none text-[var(--ink-soft)]">{label}</span>
    </span>
  );
}
