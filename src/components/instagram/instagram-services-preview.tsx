"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Eye, Users, Heart, Zap, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { StatusChip } from "@/components/visual/status-chip";
import { buildWhatsAppUrl } from "@/lib/selectors/instagram";
import {
  getViewsPackages,
  getFollowersPackages,
  getLikesPackages,
  getViewsService,
  getFollowersService,
  getLikesService,
  formatPrice,
  formatQuantity,
  type InstagramPackageWithSavings,
} from "@/lib/selectors/instagram";
import { useAutoRotation } from "@/hooks/use-auto-rotation";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Instagram Services Preview (PROMPT 1).
 *
 * Home preview of the three Instagram services (Views / Followers / Likes).
 * Each category card anchors a canonical service page. A "More Instagram
 * Options" glass dropdown exposes the same three pages for keyboard/mouse
 * users. All pricing is derived from canonical Instagram data — quantity and
 * lowest discounted price come straight from the published catalogue.
 */

interface InstagramCategory {
  key: "views" | "followers" | "likes";
  label: string;
  href: string;
  icon: React.ReactNode;
  packages: InstagramPackageWithSavings[];
  blurb: string;
}

export function InstagramServicesPreview() {
  const [open, setOpen] = React.useState(false);
  const catRef = React.useRef<HTMLDivElement>(null);

  // PROMPT 3 — 4th homepage rotor: the three category cards stay in a stable
  // order (so navigation is never surprising) while each card's FEATURED
  // package rotates through the canonical package list every 5 seconds. The
  // frame count (3) matches the cheapest-3 entry-deal cycle per category —
  // packages, quantities and prices all come straight from canonical data.
  const rotor = useAutoRotation(3, { enabled: true });
  const frame = rotor.index % 3;

  // Sort canonical packages ascending by discount price so the category card
  // shows the entry (lowest) price for "starting at".
  const asc = (pkgs: InstagramPackageWithSavings[]) =>
    [...pkgs].sort((a, b) => a.discountPrice - b.discountPrice);

  const categories: InstagramCategory[] = [
    {
      key: "views",
      label: getViewsService().label,
      href: "/instagram/views",
      icon: <Eye className="h-5 w-5" />,
      packages: asc(getViewsPackages()),
      blurb: "Boost your reel and story reach.",
    },
    {
      key: "followers",
      label: getFollowersService().label,
      href: "/instagram/followers",
      icon: <Users className="h-5 w-5" />,
      packages: asc(getFollowersPackages()),
      blurb: "Grow your profile audience.",
    },
    {
      key: "likes",
      label: getLikesService().label,
      href: "/instagram/likes",
      icon: <Heart className="h-5 w-5" />,
      packages: asc(getLikesPackages()),
      blurb: "Add engagement to your posts.",
    },
  ];

  // Close the dropdown on outside click or Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const firstPkg = (c: InstagramCategory) => c.packages[0];
  const wa = buildWhatsAppUrl(getViewsService().whatsappNumber, "Hello FF TRUST! I'd like to order Instagram services.");

  return (
    <section id="instagram-services" aria-labelledby="instagram-services-title" className="section-ff relative">
      <div className="container-wide">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            overline="05 — Instagram Services"
            title="Social growth,"
            italic="very low price"
            support="Canonical Instagram Views, Followers and Likes packages — quantities and discounted prices derived directly from the published catalogue."
            id="instagram-services-title"
          />
          {/* More Instagram Options glass dropdown */}
          <div className="relative" ref={catRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="glass-embed inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              More Instagram Options
              <ChevronDown className={`h-4 w-4 text-[var(--ink-soft)] transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--glass-bg-strong)] shadow-[var(--glass-shadow-lift)] backdrop-blur-xl"
                style={{ animation: "ff-dropdown-in 0.18s ease-out" }}
              >
                {categories.map((c) => {
                  const p = firstPkg(c);
                  return (
                    <Link
                      key={c.key}
                      href={c.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[oklch(0.82_0.1_200/0.12)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent-cyan)]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.82_0.1_200/0.16)] text-[var(--accent-azure)]">
                        {c.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[var(--ink)]">{c.label}</span>
                        <span className="block truncate text-xs text-[var(--ink-soft)]">
                          {p ? `From ${formatPrice(p.discountPrice)}` : "Browse"}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--ink-soft)]" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Three category cards — rotating featured deal, stable order */}
        <div
          className="rotor-stage mt-10"
          data-rotor-page={rotor.index}
          data-rotor-total={3}
          data-rotor-paused={rotor.paused}
          data-rotor-rotate="true"
          onPointerEnter={rotor.hold}
          onPointerLeave={rotor.release}
          onFocusCapture={rotor.hold}
          onBlurCapture={rotor.release}
          onPointerDownCapture={rotor.hold}
        >
          <div
            key={rotor.index}
            className={cn("rotor-page", rotor.phase === "exit" && "rotor-leave")}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => {
                const p = c.packages[frame % c.packages.length] ?? c.packages[0];
                return (
                  <Link
                    key={c.key}
                    href={c.href}
                    aria-label={`Browse ${c.label}`}
                    className="glass-stack acrylic-sheen group relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--glass-shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[oklch(0.82_0.1_200/0.16)] text-[var(--accent-azure)]">
                        {c.icon}
                      </span>
                      <StatusChip tone="neutral">{formatQuantity(p?.quantity ?? 0)} min</StatusChip>
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">{c.label}</h3>
                      <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">{c.blurb}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div>
                        <span className="block font-mono-label text-[9px] text-[var(--ink-soft)]">Featured</span>
                        <span className="font-heading text-2xl font-bold text-gradient-cyan">
                          {p ? formatPrice(p.discountPrice) : "—"}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition-colors group-hover:text-[var(--accent-azure)]">
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="rotor-dots" aria-label="Instagram featured deal position">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn("rotor-dot", i === rotor.index % 3 && "is-active")}
                aria-hidden={i !== rotor.index % 3}
              />
            ))}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.65_0.14_160)]">
              <Zap className="h-5 w-5" />
            </span>
            <p className="text-sm text-[var(--ink-soft)] text-pretty">
              Need a custom mix of views, followers and likes? Message us directly.
            </p>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            Chat on WhatsApp
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
