"use client";

import * as React from "react";
import {
  Rocket,
  Gamepad2,
  ShieldCheck,
  Trophy,
  Eye,
  Users,
  Heart,
  Sparkles,
  MessageCircle,
  Gem,
} from "lucide-react";
import { GlassPanel } from "@/components/visual/glass-panel";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { StatusChip } from "@/components/visual/status-chip";
import { RevealText } from "@/components/visual/reveal-text";
import { buildFreeJoinWhatsAppUrl } from "@/lib/whatsapp";

const categories = [
  { icon: <Gamepad2 className="h-4 w-4" />, label: "Free Fire ID / Account", tone: "oklch(0.82 0.1 200 / 0.16)" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "Panel Sell", tone: "oklch(0.7 0.12 290 / 0.16)" },
  { icon: <Trophy className="h-4 w-4" />, label: "Paid Push — CS / BR", tone: "oklch(0.74 0.15 196 / 0.16)" },
  { icon: <Eye className="h-4 w-4" />, label: "Instagram Views", tone: "oklch(0.82 0.1 200 / 0.16)" },
  { icon: <Users className="h-4 w-4" />, label: "Instagram Followers", tone: "oklch(0.7 0.12 290 / 0.16)" },
  { icon: <Heart className="h-4 w-4" />, label: "Instagram Likes", tone: "oklch(0.74 0.15 196 / 0.16)" },
  { icon: <Sparkles className="h-4 w-4" />, label: "Other services / offers", tone: "oklch(0.6 0.19 290 / 0.16)" },
];

/**
 * FF TRUST — FREE TO JOIN promotional card (PROMPT 11).
 * Premium Holo-Chrome 3D card near the top of the Home page.
 * Opens the SAME WhatsApp contact flow as the navbar Contact button.
 * No layout shift: fixed-width content, no absolute expansion.
 */
export function FreeJoinPromo() {
  const wa = buildFreeJoinWhatsAppUrl();
  return (
    <RevealText>
      <GlassPanel
        depth="pedestal"
        holo
        className="relative overflow-hidden p-8 sm:p-10 lg:p-12"
        data-testid="free-join-promo"
      >
        {/* Ambient light wash + particles — decorative, pointer-events-none */}
        <div aria-hidden className="light-wash absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.74 0.15 196 / 0.25) 0%, oklch(1 0 0 / 0) 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.6 0.19 290 / 0.2) 0%, oklch(1 0 0 / 0) 70%)" }} />

        {/* Floating particles — subtle */}
        {[
          { cls: "left-[8%] top-[18%]", d: "0s" },
          { cls: "right-[12%] top-[24%]", d: "1.2s" },
          { cls: "left-[18%] bottom-[20%]", d: "2s" },
          { cls: "right-[20%] bottom-[16%]", d: "0.6s" },
        ].map((p, i) => (
          <span
            key={i}
            aria-hidden
            className={`drift-float pointer-events-none absolute h-1.5 w-1.5 rounded-full ${p.cls}`}
            style={{ background: "oklch(0.82 0.1 200 / 0.5)", animationDelay: p.d, boxShadow: "0 0 8px oklch(0.74 0.15 196 / 0.5)" }}
          />
        ))}

        {/* Sheen sweep — smooth light pass, reduced on reduced-motion */}
        <div aria-hidden className="sheen-sweep pointer-events-none absolute inset-0" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left — heading + explanation */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone="cyan" icon={<Rocket className="h-3 w-3" />}>
                🚀 FREE TO JOIN
              </StatusChip>
              <StatusChip tone="violet" icon={<Gem className="h-3 w-3" />}>
                Sell / List on FF TRUST
              </StatusChip>
            </div>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl lg:text-5xl">
              <span className="font-display text-gradient-cyan italic">Free to join</span> — sell your service
            </h2>
            <p className="max-w-xl text-pretty text-base text-[var(--ink-soft)] sm:text-lg">
              Want to sell or list something? Contact FF TRUST and discuss your listing for FREE.
            </p>
          </div>

          {/* Right — categories + CTA */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-2.5 rounded-2xl border border-[var(--border)] px-3 py-2.5"
                  style={{ background: c.tone }}
                >
                  <span className="shrink-0 text-[var(--accent-azure)]">{c.icon}</span>
                  <span className="text-xs font-medium text-[var(--ink)]">{c.label}</span>
                </div>
              ))}
            </div>
            <MagneticButton
              onClick={() => window.open(wa, "_blank", "noopener,noreferrer")}
              className="w-full px-6 py-3.5 text-sm sm:w-auto"
              strength={8}
              aria-label="Contact Owner on WhatsApp — free to join"
            >
              <MessageCircle className="h-4 w-4" />
              📲 CONTACT OWNER
            </MagneticButton>
            <p className="font-mono-label text-[8px] text-[var(--ink-soft)]">
              Opens WhatsApp with a prefilled inquiry — you press Send.
            </p>
          </div>
        </div>
      </GlassPanel>
    </RevealText>
  );
}

/**
 * Compact top-of-home promotional notice (PROMPT 11).
 * Same WhatsApp flow, short and consistent with Holo-Chrome cards.
 */
export function FreeJoinNotice() {
  const wa = buildFreeJoinWhatsAppUrl();
  return (
    <RevealText>
      <GlassPanel
        depth="float"
        holo
        className="relative flex flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6"
        data-testid="free-join-notice"
      >
        <div aria-hidden className="light-wash absolute inset-0" />
        <div className="relative flex flex-1 flex-col gap-1.5">
          <p className="font-heading text-base font-semibold text-[var(--ink)]">
            🚀 FREE TO JOIN
          </p>
          <p className="text-sm text-[var(--ink-soft)] text-pretty">
            Want to sell something? List your Free Fire ID, Panel, Paid Push or other service on FF TRUST.
          </p>
        </div>
        <MagneticButton
          onClick={() => window.open(wa, "_blank", "noopener,noreferrer")}
          className="relative px-5 py-2.5 text-xs"
          strength={8}
          aria-label="Contact Owner on WhatsApp — free to join"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          📲 Contact Owner
        </MagneticButton>
      </GlassPanel>
    </RevealText>
  );
}
