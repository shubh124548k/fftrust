import * as React from "react";
import {
  Video,
  Play,
  ShieldCheck,
  Wallet,
  MessageCircle,
  FileCheck,
  Lock,
  Info,
  UserCheck,
  Store,
  Fingerprint,
  Scale,
  ScanSearch,
  Receipt,
  AlertTriangle,
  ShieldAlert,
  RefreshCcw,
  Gavel,
} from "lucide-react";
import { RevealText } from "@/components/visual/reveal-text";
import { proofContent, type ProofSection } from "@/config/proof";
import { cn } from "@/lib/utils";

export const PROOF_SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Video,
  Play,
  ShieldCheck,
  Wallet,
  MessageCircle,
  FileCheck,
  Lock,
  Info,
  UserCheck,
  Store,
  Fingerprint,
  Scale,
  ScanSearch,
  Receipt,
  AlertTriangle,
  ShieldAlert,
  RefreshCcw,
  Gavel,
};

/**
 * FF TRUST — Reusable Proof card grid (PROMPT 2).
 *
 * Single shared rendering of proofContent.sections used by BOTH the /proof
 * page and the compact Home Proof/Safety section — no duplicated copy or
 * card markup. Every card is a premium glass-stack with a glowing icon chip,
 * sheen sweep and reveal animation (static + fully readable when reduced
 * motion is on).
 */
export function ProofCardGrid({
  sections = proofContent.sections,
  limit,
  className,
}: {
  sections?: ProofSection[];
  limit?: number;
  className?: string;
}) {
  const shown = limit ? sections.slice(0, limit) : sections;
  return (
    <div className={cn("grid gap-5 md:grid-cols-2", className)}>
      {shown.map((section, i) => (
        <ProofCard key={section.key} section={section} index={i} />
      ))}
    </div>
  );
}

export function ProofCard({ section, index }: { section: ProofSection; index: number }) {
  const Icon = section.iconKey ? PROOF_SECTION_ICONS[section.iconKey] ?? ShieldCheck : ShieldCheck;
  return (
    <RevealText delay={Math.min(index * 50, 200)}>
      <div
        className="glass-stack acrylic-sheen group relative h-full overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
        style={{ boxShadow: "var(--glass-shadow)" }}
      >
        <div aria-hidden className="sheen-sweep absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex h-full flex-col">
          <div className="mb-4 flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.74 0.15 196 / 0.2) 0%, oklch(0.6 0.19 290 / 0.16) 100%)",
                border: "1px solid oklch(0.74 0.15 196 / 0.3)",
                boxShadow: "0 0 16px -4px oklch(0.74 0.15 196 / 0.4)",
              }}
            >
              <Icon className="h-5 w-5 text-[var(--accent-azure)]" />
            </span>
            <p className="font-heading text-base font-semibold text-[var(--ink)]">
              {section.title}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ink-soft)] text-pretty">
            {section.body}
          </p>
        </div>
      </div>
    </RevealText>
  );
}
