import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Status Chip / Evidence Chip / Price Plate (PROMPT 17c).
 *
 * Dark-mode-safe: uses CSS custom properties that adapt per theme.
 * All tones use var(--chip-*) tokens that are overridden in .dark.
 */

type Tone = "cyan" | "violet" | "azure" | "neutral" | "warn" | "good";

const toneMap: Record<Tone, string> = {
  cyan: "text-[var(--chip-cyan-text)] bg-[var(--chip-cyan-bg)] border-[var(--chip-cyan-border)]",
  violet: "text-[var(--chip-violet-text)] bg-[var(--chip-violet-bg)] border-[var(--chip-violet-border)]",
  azure: "text-[var(--chip-azure-text)] bg-[var(--chip-azure-bg)] border-[var(--chip-azure-border)]",
  neutral: "text-[var(--chip-neutral-text)] bg-[var(--chip-neutral-bg)] border-[var(--chip-neutral-border)]",
  warn: "text-[var(--chip-warn-text)] bg-[var(--chip-warn-bg)] border-[var(--chip-warn-border)]",
  good: "text-[var(--chip-good-text)] bg-[var(--chip-good-bg)] border-[var(--chip-good-border)]",
};

export function StatusChip({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-label text-[10px] backdrop-blur-sm",
        toneMap[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Price plate — distinct INR treatment with editorial weight. */
export function PricePlate({
  value,
  currency = "INR",
  className,
  size = "md",
}: {
  value: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "text-3xl sm:text-4xl"
      : size === "sm"
        ? "text-base"
        : "text-xl sm:text-2xl";
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span className="font-mono-label text-[10px] text-[var(--ink-soft)]">{currency}</span>
      <span className={cn("font-heading font-semibold tracking-tight text-[var(--ink)]", sizeCls)}>
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

/** Evidence pill — honest provenance, never a guarantee. */
export function EvidenceChip({
  label,
  present,
  className,
  icon,
}: {
  label: string;
  present: boolean;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <StatusChip tone={present ? "good" : "warn"} className={className}>
      {icon ?? (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: present ? "var(--chip-good-dot)" : "var(--chip-warn-dot)",
          }}
        />
      )}
      {label}
    </StatusChip>
  );
}
