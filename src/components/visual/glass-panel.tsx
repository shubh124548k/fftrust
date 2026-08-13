"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — GlassPanel / GlassCard (PROMPT 03 multi-level).
 *
 * Multi-cue acrylic depth (NOT mere backdrop-blur):
 *  1 translucency (glass-bg)
 *  2 border (glass-border + gradient ring via ::before)
 *  3 inner top highlight (glass-highlight)
 *  4 shadow (glass-shadow / lift)
 *  5 background interaction (acrylic-sheen sweep)
 *
 * `depth` chooses the surface level:
 *  - embed   : nested in another glass surface (low translucency)
 *  - thin    : light glass (chips, small panels)
 *  - base    : standard glass-strong
 *  - strong  : glass-strong + acrylic sheen
 *  - float   : elevated, lift shadow (floating cards)
 *  - stack   : opaque-tinted stack layer (modals, stacked panels)
 *  - pedestal: heavy pedestal for 3D object stages (deepest shadow)
 *
 * `holo` adds a holographic animated border ring (accent only).
 * `interactive` adds a transform-only hover lift (no layout shift).
 * Reduced-motion safe.
 */
export type GlassDepth =
  | "embed"
  | "thin"
  | "base"
  | "strong"
  | "float"
  | "stack"
  | "pedestal";

const depthClass: Record<GlassDepth, string> = {
  embed: "glass-embed",
  thin: "glass",
  base: "glass glass-strong",
  strong: "glass glass-strong acrylic-sheen",
  float: "glass-float acrylic-sheen",
  stack: "glass-stack",
  pedestal: "glass-pedestal acrylic-sheen",
};

export const GlassPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    depth?: GlassDepth;
    interactive?: boolean;
    holo?: boolean;
    as?: keyof React.JSX.IntrinsicElements;
  }
>(({ className, depth = "base", interactive = false, holo = false, as: Tag = "div", ...props }, ref) => {
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      className={cn(
        depthClass[depth],
        "rounded-3xl",
        holo && "holo-border",
        interactive && "card-lift cursor-pointer",
        className,
      )}
      {...props}
    />
  );
});
GlassPanel.displayName = "GlassPanel";

/**
 * GlassCard — composes GlassPanel with a structured stage for account /
 * service cards: background depth layer + media stage + content plane.
 * Card-quality contract: distinct depth, hierarchy, media treatment,
 * price treatment, metadata and interaction states.
 */
export function GlassCard({
  className,
  children,
  interactive = true,
  depth = "base",
  holo = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  depth?: GlassDepth;
  holo?: boolean;
}) {
  return (
    <GlassPanel
      depth={depth}
      interactive={interactive}
      holo={holo}
      className={cn("relative overflow-hidden p-0", className)}
      {...props}
    >
      {/* Background depth layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, oklch(0.82 0.1 200 / 0.16) 0%, oklch(1 0 0 / 0) 55%), radial-gradient(100% 80% at 100% 100%, oklch(0.7 0.12 290 / 0.12) 0%, oklch(1 0 0 / 0) 55%)",
        }}
      />
      {children}
    </GlassPanel>
  );
}
