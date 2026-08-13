"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/lib/design/use-performance-tier";

/**
 * FF TRUST — Reveal Text.
 *
 * Staggered editorial typography reveal via IntersectionObserver. Each line /
 * word lifts in with the outExpo curve. Honors prefers-reduced-motion (the
 * `reveal` utility force-shows content). No layout shift (transform/opacity).
 */
export function RevealText({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Comp>
  );
}

/** Stagger container — children should be <RevealText> or .reveal nodes. */
export function RevealGroup({
  children,
  className,
  stagger = 80,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(className)}>
      {React.Children.map(children, (child, i) => (
        <div
          className={cn("reveal", visible && "is-visible")}
          style={{ transitionDelay: `${i * stagger}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
