import * as React from "react";
import { cn } from "@/lib/utils";
import { RevealText } from "./reveal-text";

/**
 * FF TRUST — Section Heading.
 *
 * Editorial typographic system: an overline mono label, an oversized display
 * headline (Instrument Serif for editorial italic moments + Space Grotesk for
 * geometric weight), and an optional supporting paragraph. Establishes the
 * cinematic-whitespace rhythm for every section.
 */
export function SectionHeading({
  overline,
  title,
  italic,
  support,
  align = "left",
  className,
  id,
}: {
  overline?: string;
  title: React.ReactNode;
  /** italic editorial accent word(s) rendered in display serif */
  italic?: string;
  support?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "flex flex-col gap-2.5 sm:gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {overline && (
        <RevealText>
          <span className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">{overline}</span>
        </RevealText>
      )}
      <RevealText delay={80}>
        <h2
          className={cn(
            "font-heading text-balance text-3xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl",
          )}
        >
          {title}
          {italic && (
            <>
              {" "}
              <span className="font-display text-gradient-cyan italic">{italic}</span>
            </>
          )}
        </h2>
      </RevealText>
      {support && (
        <RevealText delay={160}>
          <p
            className={cn(
              "text-pretty text-sm text-[var(--ink-soft)] sm:text-lg",
              align === "center" ? "max-w-2xl" : "max-w-xl",
            )}
          >
            {support}
          </p>
        </RevealText>
      )}
    </div>
  );
}
