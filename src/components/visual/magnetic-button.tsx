"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePerformanceTier } from "@/lib/design/use-performance-tier";

/**
 * FF TRUST — Magnetic Button.
 *
 * A CTA that subtly tracks the pointer (transform-only, rAF-throttled) for a
 * magnetic feel. Disabled on coarse pointers, reduced motion and low tiers —
 * degrades to a normal premium button. Built on the native <button> for full
 * keyboard/focus semantics.
 */
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button";
  /** magnetic pull strength in px */
  strength?: number;
  /** visual variant — primary (cyan) or glass (translucent) */
  variant?: "primary" | "glass";
};

const variantClass: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_10px_30px_-12px_oklch(0.5_0.12_250/0.5)] hover:shadow-[0_18px_44px_-14px_oklch(0.5_0.14_250/0.6)]",
  glass:
    "glass text-[var(--ink)] hover:text-[var(--accent-azure)]",
};

export const MagneticButton = React.memo(React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ className, children, strength = 14, variant = "primary", onMouseMove, onMouseLeave, ...props }, ref) => {
    const tier = usePerformanceTier();
    const innerRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current!);

    const reduceQuery = React.useMemo(
      () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null),
      [],
    );

    const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e);
      if (tier === 0) return;
      if (reduceQuery?.matches) return;
      const el = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
    };
    const reset = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      const el = innerRef.current;
      if (el) el.style.transform = "";
    };

    return (
      <button
        ref={innerRef}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={cn(
          "magnetic group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium",
          "transition-[box-shadow,transform,color] duration-300",
          variantClass[variant],
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: "var(--neon-cyan)" }}
        />
        {children}
      </button>
    );
  },
));
MagneticButton.displayName = "MagneticButton";
