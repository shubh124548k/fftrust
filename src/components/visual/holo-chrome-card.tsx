"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — HoloChrome Card (PROMPT 16).
 *
 * A single reusable, world-class 3D card foundation. Thicker, more physical
 * and more dimensional than ordinary glass. Uses the `.holo-chrome-card` CSS
 * class with nested pseudo-elements for:
 *   - outer shell (background + blur + border + shadow)
 *   - edge plane (holographic gradient ring via ::before)
 *   - inner shell (top highlight + inner glow + liquid flow via ::after)
 *   - content plane (children)
 *   - floating plates (passed as props)
 *
 * Variants: default, featured, unavailable, compact.
 * States: hover, focus, pressed, reduced-motion — all CSS-driven.
 * Dark-mode-safe via semantic token overrides.
 *
 * CANONICAL RECORD → selector → view model → HoloChromeCard variant → UI.
 * Never create production business data inside this component.
 */
export type HoloChromeVariant = "default" | "featured" | "unavailable" | "compact";

export function HoloChromeCard({
  children,
  className,
  variant = "default",
  interactive = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: HoloChromeVariant;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "holo-chrome-card",
        variant === "featured" && "is-featured",
        variant === "unavailable" && "is-unavailable",
        interactive && "cursor-pointer",
        className,
      )}
      {...props}
    >
      {/* Background depth layer — subtle radial gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, oklch(0.82 0.1 200 / 0.1) 0%, oklch(1 0 0 / 0) 55%), radial-gradient(100% 80% at 100% 100%, oklch(0.7 0.12 290 / 0.08) 0%, oklch(1 0 0 / 0) 55%)",
        }}
      />
      {/* Content plane */}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

/**
 * FloatingPricePlate — a dimensional glass plate that floats over the
 * card's media stage. Uses glass-float surface + lift shadow.
 */
export function FloatingPricePlate({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("glass-float rounded-2xl px-3 py-2", className)}
      style={{ boxShadow: "var(--chrome-shadow-lift)" }}
    >
      {children}
    </div>
  );
}

/**
 * MediaStage — reserved-aspect media container with lazy loading and
 * graceful broken-media fallback. Used inside HoloChromeCard.
 */
export function MediaStage({
  media,
  title,
  fallbackGradient,
  className,
}: {
  media?: { url: string; alt?: string };
  title: string;
  fallbackGradient?: string;
  className?: string;
}) {
  const [broken, setBroken] = React.useState(false);
  const hasMedia = !!media && !broken;

  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden rounded-t-[var(--chrome-radius)]", className)}>
      {hasMedia ? (
        <img
          src={media!.url}
          alt={media!.alt ?? title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setBroken(true)}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              fallbackGradient ??
              "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.22) 50%, oklch(0.9 0.02 245 / 0.5) 100%)",
          }}
        />
      )}
      {/* Light sweep on hover */}
      <div aria-hidden className="sheen-sweep absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
