import { Check, Zap } from "lucide-react";
import { StatusChip } from "./status-chip";
import type { TrustHighlight } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * FF TRUST — Trust Highlights chip row.
 *
 * Renders data-driven trust badges from canonical listing data.
 * Each chip uses a professional ✓/⚡ icon + short label — never
 * spammy, never fabricated. Renders nothing when the data is empty.
 *
 * Icon semantics:
 *  ✓ (check)  → verified / proof / evidence state
 *  ⚡ (zap)    → speed / performance claim
 */

const iconMap: Record<TrustHighlight["icon"], React.ReactNode> = {
  check: <Check className="h-3 w-3" />,
  zap: <Zap className="h-3 w-3" />,
};

export function TrustHighlights({
  items,
  className,
  max = 3,
}: {
  items?: TrustHighlight[];
  className?: string;
  /** Maximum chips to render (card mode). Use Infinity for Details/Compare. */
  max?: number;
}) {
  if (!items || items.length === 0) return null;
  const visible = items.slice(0, max);
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((h, i) => (
        <StatusChip
          key={`${h.label}-${i}`}
          tone="good"
          icon={iconMap[h.icon]}
          className="font-mono-label text-[9px]"
        >
          {h.label}
        </StatusChip>
      ))}
    </div>
  );
}
