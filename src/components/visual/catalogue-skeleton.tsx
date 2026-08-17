/**
 * FF TRUST — Catalogue Skeleton (PROMPT 03 Part 30).
 *
 * Lightweight loading state for marketplace routes: a card-grid skeleton
 * rendered with CSS only (no data, no fake content). Shown by Next.js
 * loading.tsx during the initial load / route transition, then replaced by
 * the real catalogue. Reuses the existing glass design tokens.
 */
export function CatalogueSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-hidden role="presentation">
      <div className="flex flex-wrap gap-2">
        <div className="glass-embed skeleton-pulse h-9 w-16 rounded-full" />
        <div className="glass-embed skeleton-pulse h-9 w-20 rounded-full" />
        <div className="glass-embed skeleton-pulse h-9 w-14 rounded-full" />
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="glass-stack skeleton-pulse flex flex-col gap-3 rounded-2xl p-5" style={{ boxShadow: "var(--glass-shadow)" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-2">
                <div className="h-2.5 w-20 rounded-full bg-[var(--ink-soft)]/25" />
                <div className="h-4 w-32 rounded-full bg-[var(--ink-soft)]/25" />
              </div>
              <div className="h-8 w-8 rounded-full bg-[var(--ink-soft)]/25" />
            </div>
            <div className="mt-2 h-28 w-full rounded-xl bg-[var(--ink-soft)]/20" />
            <div className="mt-2 h-3 w-24 rounded-full bg-[var(--ink-soft)]/25" />
            <div className="mt-auto pt-3 h-9 w-full rounded-full bg-[var(--ink-soft)]/25" />
          </div>
        ))}
      </div>
    </div>
  );
}
