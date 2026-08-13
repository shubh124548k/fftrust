import Link from "next/link";
import { Compass, Home, Search, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";

/**
 * FF TRUST — 404 (PROMPT 3).
 *
 * Premium "lost in the marketplace" page, rendered inside the root layout so
 * header/footer stay consistent. Fully responsive, no overflow, honest copy.
 */
export default function NotFound() {
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <GlassPanel
          depth="float"
          holo
          className="relative overflow-hidden px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <div aria-hidden className="light-wash absolute inset-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.74 0.15 196 / 0.22) 0%, oklch(1 0 0 / 0) 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.18) 0%, oklch(1 0 0 / 0) 70%)" }}
          />

          <div className="relative flex flex-col items-center gap-6">
            <span
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.74 0.15 196) 0%, oklch(0.6 0.19 290) 100%)",
                boxShadow: "var(--neon-cyan)",
              }}
            >
              <Search className="h-7 w-7 text-white" />
            </span>

            <p className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">
              Error 404 · Page not found
            </p>
            <h1 className="font-heading text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-6xl">
              Lost in the{" "}
              <span className="font-display text-gradient-cyan italic">marketplace</span>
            </h1>
            <p className="max-w-lg text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
              This page does not exist or may have been moved. Every listing is published from
              canonical records — if you followed a link, check the listing reference and explore
              the live catalogue instead.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <Home className="h-4 w-4" />
                Back home
              </Link>
              <Link
                href="/#explore"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <Compass className="h-4 w-4" />
                Explore listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
