"use client";

import { ShieldCheck, CheckCircle, Video, Eye, BadgeCheck } from "lucide-react";

interface TrustBadge {
  key: string;
  label: string;
  icon: "verified-seller" | "verified-evidence" | "real-service" | "proof-available" | "screen-recording" | "evidence-first";
}

const iconMap = {
  "verified-seller": ShieldCheck,
  "verified-evidence": BadgeCheck,
  "real-service": CheckCircle,
  "proof-available": Eye,
  "screen-recording": Video,
  "evidence-first": ShieldCheck,
} as const;

const toneMap: Record<string, string> = {
  "verified-seller": "cyan",
  "verified-evidence": "violet",
  "real-service": "azure",
  "proof-available": "azure",
  "screen-recording": "neutral",
  "evidence-first": "cyan",
};

interface TrustBadgesProps {
  highlights?: string[];
}

export function TrustBadges({ highlights }: TrustBadgesProps) {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {highlights.map((key) => {
        const Icon = iconMap[key as keyof typeof iconMap] || ShieldCheck;
        const tone = toneMap[key] || "neutral";
        const label = key
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono-label text-[9px] ${
              tone === "cyan"
                ? "bg-[oklch(0.82_0.1_200/0.15)] text-[var(--accent-cyan)]"
                : tone === "violet"
                  ? "bg-[oklch(0.7_0.12_290/0.15)] text-[var(--accent-violet)]"
                  : tone === "azure"
                    ? "bg-[oklch(0.82_0.1_200/0.12)] text-[var(--accent-azure)]"
                    : "bg-[var(--border)] text-[var(--ink-soft)]"
            }`}
          >
            <Icon className="h-2.5 w-2.5" />
            {label}
          </span>
        );
      })}
    </div>
  );
}
