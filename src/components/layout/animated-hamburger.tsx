"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Animated Hamburger.
 *
 * A cinematic three-line → X morph with a subtle stagger. Pure transform/
 * opacity; reduced-motion safe (the lines still toggle, just instantly).
 * Built as a native <button> for full keyboard/focus semantics.
 */
export function AnimatedHamburger({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={() => onToggle(!open)}
      className="glass-embed inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] lg:hidden"
    >
      <span className="relative flex h-4 w-5 flex-col items-center justify-center gap-[5px]">
        <span
          className={cn(
            "block h-0.5 w-5 rounded-full bg-current transition-transform duration-300",
            open && "translate-y-[7px] rotate-45",
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-5 rounded-full bg-current transition-opacity duration-200",
            open && "opacity-0",
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-5 rounded-full bg-current transition-transform duration-300",
            open && "-translate-y-[7px] -rotate-45",
          )}
        />
      </span>
    </button>
  );
}
