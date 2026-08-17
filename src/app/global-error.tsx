"use client";

import { useEffect } from "react";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";
import "./globals.css";

/**
 * FF TRUST — Global Error Boundary.
 *
 * Replaces the entire root layout when the layout itself fails. Minimal
 * standalone premium state (own <html>/<body>), honest copy, retry + home.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
          style={{ background: "var(--background)" }}
        >
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

          <p className="font-mono-label text-xs text-[var(--accent-azure)]">
            Something went wrong
          </p>
          <h1 className="font-heading text-balance text-4xl font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-6xl">
            A glitch in the{" "}
            <span className="font-display text-gradient-cyan italic">marketplace</span>
          </h1>
          <p className="max-w-lg text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
            The site hit an unexpected error while loading. Retry, or go back to the homepage.
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
      </body>
    </html>
  );
}
