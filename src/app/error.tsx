"use client";

import { useEffect } from "react";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";

/**
 * FF TRUST — Error Boundary (route-level).
 *
 * Premium "glitch in the marketplace" state, rendered inside the root layout so
 * header/footer stay consistent. Honest copy — the error is never hidden.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.22) 0%, oklch(1 0 0 / 0) 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.7 0.14 45 / 0.16) 0%, oklch(1 0 0 / 0) 70%)" }}
          />

          <div className="relative flex flex-col items-center gap-6">
            <span
              aria-hidden
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.6 0.19 290) 0%, oklch(0.55 0.16 255) 100%)",
                boxShadow: "var(--neon-cyan)",
              }}
            >
              <TriangleAlert className="h-7 w-7 text-white" />
            </span>

            <p className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">
              Something went wrong
            </p>
            <h1 className="font-heading text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-6xl">
              A glitch in the{" "}
              <span className="font-display text-gradient-cyan italic">marketplace</span>
            </h1>
            <p className="max-w-lg text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
              This section hit an unexpected error. Your data is safe — retry the page, or head
              back to the live catalogue.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <Home className="h-4 w-4" />
                Back home
              </a>
            </div>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
