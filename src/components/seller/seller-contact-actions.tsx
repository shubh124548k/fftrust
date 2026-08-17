"use client";

import * as React from "react";
import { Plus, LayoutList, Server, Trophy } from "lucide-react";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { StatusChip } from "@/components/visual/status-chip";
import { useSellerContactStore } from "@/stores/seller-contact";
import type { SellerType } from "@/components/seller/seller-contact-popup";

/**
 * FF TRUST — Seller Contact Actions.
 *
 * The "List Your Account" seller-intake buttons (Account / Panel / Paid Push)
 * plus the primary "Contact to Owner" CTA. Isolated as the only interactive
 * (zustand + magnetic) part of the List Your Account section so the rest of
 * the homepage can render as a Server Component.
 */

const SELLER_TYPES: {
  type: SellerType;
  title: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    type: "account",
    title: "Free Fire Account",
    sub: "List an account for sale",
    icon: <LayoutList className="h-5 w-5" />,
    iconBg: "bg-[oklch(0.82_0.1_200/0.15)]",
    iconColor: "text-[var(--accent-azure)]",
  },
  {
    type: "panel",
    title: "Panel Seller Service",
    sub: "List a panel/top-up service",
    icon: <Server className="h-5 w-5" />,
    iconBg: "bg-[oklch(0.7_0.12_290/0.15)]",
    iconColor: "text-[var(--accent-violet)]",
  },
  {
    type: "paid-push",
    title: "Paid Push Service",
    sub: "List CS/BR rank-push packages",
    icon: <Trophy className="h-5 w-5" />,
    iconBg: "bg-[oklch(0.74_0.15_196/0.15)]",
    iconColor: "text-[var(--accent-cyan)]",
  },
];

export function SellerContactActions() {
  const openSellerPopup = useSellerContactStore((s) => s.openPopup);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <StatusChip tone="cyan" icon={<LayoutList className="h-3 w-3" />}>Seller onboarding</StatusChip>
        <StatusChip tone="violet">3 seller types</StatusChip>
      </div>
      <div className="flex flex-col gap-3">
        {SELLER_TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => openSellerPopup(t.type)}
            className="glass-embed flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBg} ${t.iconColor}`}>
              {t.icon}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--ink)]">{t.title}</p>
              <p className="text-xs text-[var(--ink-soft)]">{t.sub}</p>
            </div>
            <Plus className="h-4 w-4 text-[var(--ink-soft)]" />
          </button>
        ))}
      </div>
      <MagneticButton
        className="w-full"
        onClick={() => openSellerPopup("account")}
        strength={6}
      >
        <Plus className="h-4 w-4" />
        Contact to Owner
      </MagneticButton>
      <p className="font-mono-label text-[9px] leading-relaxed text-[var(--ink-soft)]">
        Once the owner manually publishes an approved canonical record, every public consumer updates automatically.
      </p>
    </div>
  );
}
