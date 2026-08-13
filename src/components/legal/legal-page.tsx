import type { ReactNode } from "react";
import { GlassPanel } from "@/components/visual/glass-panel";

/**
 * FF TRUST — Legal page shell (server-rendered, no client directives).
 *
 * Reuses the canonical visual identity (GlassPanel + editorial typography)
 * so legal pages match the rest of the site without repeating markup.
 * Pure static content — no animation, no JS, indexable by default.
 */
export function LegalPage({
  overline,
  title,
  italic,
  updated,
  intro,
  children,
}: {
  overline: string;
  title: string;
  italic?: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="container-wide py-12 sm:py-16">
      <GlassPanel depth="base" className="relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
        <div className="relative">
          <p className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">{overline}</p>
          <h1 className="mt-2 font-heading text-balance text-3xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-5xl">
            {title}
            {italic && (
              <>
                {" "}
                <span className="font-display text-gradient-cyan italic">{italic}</span>
              </>
            )}
          </h1>
          <p className="mt-4 font-mono-label text-[10px] text-[var(--ink-soft)] sm:text-xs">{updated}</p>
          <div className="container-prose mt-8 space-y-3 text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
            {intro}
          </div>
          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </GlassPanel>
    </div>
  );
}

/** A numbered section within a legal page. */
export function LegalSection({
  heading,
  children,
  id,
}: {
  heading: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="font-heading text-lg font-semibold tracking-tight text-[var(--ink)] sm:text-xl">
        {heading}
      </h2>
      <div className="container-prose space-y-3 text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
        {children}
      </div>
    </section>
  );
}

/** A sub-paragraph styled like the rest of the legal prose. */
export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-pretty">{children}</p>;
}

/** A definition item — used for label → explanation lists. */
export function LegalItem({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h3 className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">{term}</h3>
      <LegalP>{children}</LegalP>
    </div>
  );
}
