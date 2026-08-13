"use client";

import * as React from "react";
import {
  Rocket,
  Sparkles,
  Gem,
  Gamepad2,
  ShieldCheck,
  Trophy,
  Medal,
  Eye,
  Users,
  Heart,
  Star,
  MessageCircle,
  Scale,
  Info,
} from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip } from "@/components/visual/status-chip";
import { RevealText } from "@/components/visual/reveal-text";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * FF TRUST — FREE & PAID PROMOTION info box (PROMPT 3).
 *
 * A reusable Holo-Chrome / glass panel explaining both promotion paths:
 *   ✨ FREE  — your listing rides the homepage rotation, no charge.
 *   💎 PAID — featured highlights for maximum visibility.
 *
 * Every price/listing claim is avoided on purpose: FF TRUST never promises
 * guaranteed results, permanent delivery or fake popularity. The only action
 * is a direct WhatsApp contact to the owner. Rendered on the homepage and on
 * relevant catalogue pages via <PromotionInfoBox />.
 */

const PROMO_MESSAGE = [
  "🚀 FF TRUST — FREE & PAID PROMOTION INQUIRY",
  "",
  "👋 Hello FF TRUST Team!",
  "",
  "I would like to know about FREE & PAID PROMOTION options for my listing / service / offer.",
  "",
  "✨ FREE PROMOTION — list on FF TRUST and appear in the homepage rotation.",
  "💎 PAID PROMOTION — featured highlight for maximum visibility.",
  "",
  "📌 My item:",
  "— Category: (Free Fire ID/Account · Panel Services · CS Rank Push · BR Rank Push · Instagram Views/Followers/Likes · Other)",
  "",
  "📩 Please tell me the promotion options and next steps.",
  "",
  "🔐 FF TRUST — Independent Platform",
  "🛡️ Transparency • Evidence • Buyer Safety",
  "📲 No password / OTP collection.",
].join("\n");

const freeFireCats = [
  { icon: <Gamepad2 className="h-4 w-4" />, label: "ID / Account", tone: "oklch(0.82 0.1 200 / 0.16)" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "Panel Services", tone: "oklch(0.7 0.12 290 / 0.16)" },
  { icon: <Trophy className="h-4 w-4" />, label: "CS Rank Push", tone: "oklch(0.74 0.15 196 / 0.16)" },
  { icon: <Medal className="h-4 w-4" />, label: "BR Rank Push", tone: "oklch(0.6 0.19 290 / 0.16)" },
  { icon: <Star className="h-4 w-4" />, label: "Other", tone: "oklch(0.82 0.1 200 / 0.16)" },
];

const instaCats = [
  { icon: <Eye className="h-4 w-4" />, label: "Views", tone: "oklch(0.82 0.1 200 / 0.16)" },
  { icon: <Users className="h-4 w-4" />, label: "Followers", tone: "oklch(0.7 0.12 290 / 0.16)" },
  { icon: <Heart className="h-4 w-4" />, label: "Likes", tone: "oklch(0.74 0.15 196 / 0.16)" },
  { icon: <Star className="h-4 w-4" />, label: "Other", tone: "oklch(0.6 0.19 290 / 0.16)" },
];

export function PromotionInfoBox() {
  const wa = buildWhatsAppUrl({ inquiry: "FREE & PAID PROMOTION — tell me the options for my listing." });
  return (
    <RevealText>
      <GlassPanel
        depth="pedestal"
        holo
        className="relative overflow-hidden p-8 sm:p-10"
        data-testid="promotion-info-box"
      >
        <div aria-hidden className="light-wash absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.74 0.15 196 / 0.24) 0%, oklch(1 0 0 / 0) 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.2) 0%, oklch(1 0 0 / 0) 70%)" }} />
        <div aria-hidden className="sheen-sweep pointer-events-none absolute inset-0" />

        <div className="relative flex flex-col gap-7">
          {/* Heading */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone="cyan" icon={<Rocket className="h-3 w-3" />}>
                🚀 FREE &amp; PAID PROMOTION
              </StatusChip>
              <StatusChip tone="neutral" icon={<Info className="h-3 w-3" />}>
                Contact FF TRUST directly
              </StatusChip>
            </div>
            <h2 className="font-heading text-2xl font-semibold leading-tight text-[var(--ink)] sm:text-3xl">
              <span className="font-display text-gradient-cyan italic">FREE &amp; paid</span> promotion
            </h2>
            <p className="max-w-2xl text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
              Two honest ways to give a listing more visibility. Contact FF TRUST directly and we will
              guide you to the option that fits your service or offer.
            </p>
          </div>

          {/* Free vs Paid cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-[oklch(0.74_0.15_196/0.35)] bg-[oklch(0.74_0.15_196/0.08)] p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.74_0.15_196/0.16)] text-[var(--accent-cyan)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="font-heading text-base font-semibold text-[var(--ink)]">✨ FREE PROMOTION</p>
              </div>
              <p className="text-xs leading-relaxed text-[var(--ink-soft)] text-pretty">
                Your listing rides the homepage rotation and the full catalogue — no charge. Add or edit
                a record and every section updates automatically.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-[oklch(0.6_0.19_290/0.35)] bg-[oklch(0.6_0.19_290/0.08)] p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.6_0.19_290/0.16)] text-[var(--accent-violet)]">
                  <Gem className="h-4 w-4" />
                </span>
                <p className="font-heading text-base font-semibold text-[var(--ink)]">💎 PAID PROMOTION</p>
              </div>
              <p className="text-xs leading-relaxed text-[var(--ink-soft)] text-pretty">
                Featured highlights and premium placement for sellers who want maximum visibility. Terms
                are agreed directly with the owner — never a fake-popularity promise.
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">🎮 FREE FIRE</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {freeFireCats.map((c) => (
                  <div key={c.label} className="flex items-center gap-2.5 rounded-2xl border border-[var(--border)] px-3 py-2.5" style={{ background: c.tone }}>
                    <span className="shrink-0 text-[var(--accent-azure)]">{c.icon}</span>
                    <span className="text-xs font-medium text-[var(--ink)]">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono-label text-[9px] text-[var(--accent-violet)]">📱 INSTAGRAM</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {instaCats.map((c) => (
                  <div key={c.label} className="flex items-center gap-2.5 rounded-2xl border border-[var(--border)] px-3 py-2.5" style={{ background: c.tone }}>
                    <span className="shrink-0 text-[var(--accent-violet)]">{c.icon}</span>
                    <span className="text-xs font-medium text-[var(--ink)]">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA + disclaimer */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--glass-bg-strong)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.55_0.14_160/0.15)] text-[oklch(0.65_0.14_160)]">
                <Scale className="h-5 w-5" />
              </span>
              <p className="max-w-xl text-xs text-[var(--ink-soft)] text-pretty">
                Independent platform • Transparent information • No password / OTP collection. FF TRUST
                never claims guaranteed results, permanent delivery or fake popularity.
              </p>
            </div>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact FF TRUST directly about FREE & PAID promotion on WhatsApp"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <MessageCircle className="h-4 w-4" />
              💬 Contact FF TRUST directly
            </a>
          </div>
        </div>
      </GlassPanel>
    </RevealText>
  );
}
