"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "./glass-panel";

/**
 * FF TRUST — Empty State.
 *
 * REAL-DATA CONTRACT: when real data is missing, show a beautiful designed
 * empty state — never fill the screen with fake content. Used by every
 * data-driven section (featured accounts, panel services, paid push, price
 * guide) so absent inventory is honest and on-brand.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassPanel
      depth="thin"
      className={cn("flex flex-col items-center justify-center gap-4 p-10 text-center", className)}
    >
      {icon && (
        <div
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[oklch(0.82_0.1_200/0.1)] text-[var(--accent-azure)]"
        >
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-heading text-xl font-semibold text-[var(--ink)]">{title}</h3>
        {description && <p className="mt-2 max-w-md text-sm text-[var(--ink-soft)] text-pretty">{description}</p>}
      </div>
      {action}
    </GlassPanel>
  );
}
