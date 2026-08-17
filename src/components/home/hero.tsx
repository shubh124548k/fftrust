"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, ChevronDown, Compass, Server, Trophy, MessageCircle, Gem, Instagram, Check } from "lucide-react";
import { SculpturalObject } from "@/components/visual/sculptural-object";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import { RevealText } from "@/components/visual/reveal-text";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip } from "@/components/visual/status-chip";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl, buildFreeJoinWhatsAppUrl } from "@/lib/whatsapp";
import { getHomepageCatalogueStats } from "@/lib/selectors";
import { z } from "@/lib/design/depth";

/**
 * FF TRUST — Hero (PROMPT 05 god-level cinematic launch).
 *
 * The strongest visual statement. 10D perceived-depth model:
 *  1 atmosphere (SceneAtmosphere, fixed)   2 light field (volumetric beams)
 *  3 particles (canvas snowfall)             4 distant geometry (rings)
 *  5 midground 3D object (crystalline prism) 6 translucent glass pedestal
 *  7 foreground UI (huge editorial type)     8 reflections/highlights/shadow
 *  9 micro-interactions (magnetic + parallax + floating chips) 
 * 10 camera/scroll relationship (scroll cue + parallax drift)
 *
 * Huge FF TRUST editorial type · primary Explore CTA · secondary Search CTA ·
 * original 3D holographic focal object · floating account/service micro-panels ·
 * atmospheric light · subtle snow · responsive depth.
 *
 * Honest counts: shows the REAL canonical inventory count (0 until owner adds
 * listings) — never faked.
 */
export function Hero() {
  const router = useRouter();
  const wa = buildWhatsAppUrl({ inquiry: "Hello FF TRUST, I'd like to know more." });
  const stats = getHomepageCatalogueStats();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      data-light="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-36 pb-24 sm:pt-32"
    >
      {/* Parallax distant glow accents — layered light field */}
      <ParallaxLayer depth={3} className="pointer-events-none absolute inset-0">
        <div
          aria-hidden
          className="absolute left-[6%] top-[14%] h-80 w-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.1 200 / 0.42) 0%, oklch(1 0 0 / 0) 70%)" }}
        />
        <div
          aria-hidden
          className="absolute right-[6%] bottom-[12%] h-96 w-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.12 290 / 0.34) 0%, oklch(1 0 0 / 0) 70%)" }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] max-w-[100vw] max-h-[100vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl overflow-hidden"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.12 255 / 0.16) 0%, oklch(1 0 0 / 0) 60%)" }}
        />
      </ParallaxLayer>

      {/* Light wash — local hero lighting */}
      <div aria-hidden className="light-wash absolute inset-0" />

      <div className="container-wide relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left — huge editorial type + dual CTAs */}
        <div className="relative flex min-w-0 flex-col gap-8" style={{ zIndex: z("foregroundUI") }}>
          <RevealText>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>
                Independent platform
              </StatusChip>
              <StatusChip tone="violet" icon={<Sparkles className="h-3 w-3" />}>
                Pearl-white studio
              </StatusChip>
            </div>
          </RevealText>

          <div className="flex flex-col gap-5">
            <RevealText delay={80}>
              <h1
                id="hero-title"
                className="font-heading text-balance text-6xl font-semibold leading-[0.94] tracking-tight text-[var(--ink)] sm:text-7xl lg:text-8xl xl:text-[7rem]"
              >
                Trusted marketplace
                <br />
                for gaming accounts
                <br />
                <span className="font-display text-gradient-cyan italic">&amp; digital services</span>
              </h1>
            </RevealText>
            <RevealText delay={180}>
              <p className="max-w-xl text-pretty text-lg text-[var(--ink-soft)] sm:text-xl">
                {siteConfig.shortDescription}
              </p>
            </RevealText>
          </div>

          <RevealText delay={260}>
            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton
                onClick={() => router.push("/accounts")}
                className="px-8 py-4 text-base"
              >
                Explore Accounts
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton
                onClick={() => router.push("/services")}
                variant="glass"
                className="px-6 py-3 text-sm"
              >
                Panel Seller
                <Server className="h-3.5 w-3.5" />
              </MagneticButton>
              <MagneticButton
                onClick={() => router.push("/paid-push")}
                variant="glass"
                className="px-6 py-3 text-sm"
              >
                Paid Push
                <Trophy className="h-3.5 w-3.5" />
              </MagneticButton>
              <MagneticButton
                onClick={() => router.push("/instagram")}
                variant="glass"
                className="px-6 py-3 text-sm"
              >
                Instagram
                <Instagram className="h-3.5 w-3.5" />
              </MagneticButton>
            </div>
          </RevealText>

          <RevealText delay={300}>
            <div className="flex flex-wrap items-center gap-3">
              <FreeJoinHeroCard />
            </div>
          </RevealText>

          {/* Honest counts — never faked */}
          <RevealText delay={340}>
            <GlassPanel depth="thin" className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl px-5 py-4">
              <Stat label="Real accounts listed" value={stats.realAccounts} />
              <span aria-hidden className="hidden h-8 w-px bg-[var(--border)] sm:block" />
              <Stat label="Real services live" value={stats.realServices} />
              <span aria-hidden className="hidden h-8 w-px bg-[var(--border)] sm:block" />
              <Stat label="Instagram packages" value={stats.realInstagramPackages} />
              <span aria-hidden className="hidden h-8 w-px bg-[var(--border)] sm:block" />
              <Stat label="Independent of" value="Garena" sub="not affiliated" />
            </GlassPanel>
          </RevealText>

          {/* Trust highlights — platform promise */}
          <RevealText delay={380}>
            <div className="flex flex-wrap gap-2">
              <StatusChip tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>Real Listings</StatusChip>
              <StatusChip tone="violet" icon={<Sparkles className="h-3 w-3" />}>Verified Details</StatusChip>
              <StatusChip tone="azure" icon={<Check className="h-3 w-3" />}>Transparent Pricing</StatusChip>
              <StatusChip tone="neutral" icon={<ShieldCheck className="h-3 w-3" />}>Evidence-First</StatusChip>
            </div>
          </RevealText>
        </div>

        {/* Right — 3D holographic focal object + floating micro-panels */}
        <div className="relative flex min-w-0 items-center justify-center" style={{ zIndex: z("midgroundObject") }}>
          <ParallaxLayer depth={2}>
            <div className="relative">
              {/* Volumetric light beam behind the object */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, oklch(0.82 0.12 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.2) 40%, oklch(1 0 0 / 0) 70%)",
                }}
              />
              {/* Glass pedestal — the 3D stage with inner illumination */}
              <GlassPanel
                depth="pedestal"
                holo
                className="relative flex aspect-square w-[min(82vw,32rem)] items-center justify-center rounded-[2.5rem]"
              >
                {/* Inner illumination glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-6 rounded-[2rem] blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 45%, oklch(0.82 0.12 200 / 0.22) 0%, oklch(0.7 0.12 290 / 0.12) 50%, oklch(1 0 0 / 0) 75%)",
                  }}
                />
                <SculpturalObject className="!relative h-[82%] w-[82%]" />

                {/* Floating account/service micro-panels — dimensional glass.
                    Hidden on mobile/tablet to prevent overflow; visible on xl+ */}
                <div className="pointer-events-none absolute -left-4 top-4 hidden drift-float xl:block">
                  <MicroPanel icon={<Compass className="h-3 w-3" />} label="Account" tone="cyan" />
                </div>
                <div
                  className="pointer-events-none absolute -right-3 top-1/4 hidden drift-float xl:block"
                  style={{ animationDelay: "1.5s" }}
                >
                  <MicroPanel icon={<Server className="h-3 w-3" />} label="Panel" tone="violet" />
                </div>
                <div
                  className="pointer-events-none absolute -left-2 bottom-12 hidden drift-float xl:block"
                  style={{ animationDelay: "3s" }}
                >
                  <MicroPanel icon={<Trophy className="h-3 w-3" />} label="Rank Push" tone="azure" />
                </div>
                <div
                  className="pointer-events-none absolute -right-2 bottom-8 hidden drift-float xl:block"
                  style={{ animationDelay: "2.5s" }}
                >
                  <StatusChip tone="cyan">evidence-first</StatusChip>
                </div>
              </GlassPanel>

              {/* Floor reflection — stronger */}
              <div
                aria-hidden
                className="reflection-floor"
                style={{ width: "85%", bottom: "-8%", height: "14%", opacity: 0.8 }}
              />
            </div>
          </ParallaxLayer>
        </div>
      </div>

      {/* Scroll cue — camera/scroll relationship */}
      <button
        type="button"
        aria-label="Scroll to browse categories"
        onClick={() => document.getElementById("category-hub")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        style={{ zIndex: z("foregroundUI") }}
      >
        <span className="flex flex-col items-center gap-1">
          <span className="font-mono-label text-[8px]">Browse</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </span>
      </button>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {  return (
    <div className="flex flex-col">
      <span className="font-heading text-2xl font-semibold text-[var(--ink)]">{value}</span>
      <span className="font-mono-label text-[9px] text-[var(--ink-soft)]">
        {label}
        {sub ? ` · ${sub}` : ""}
      </span>
    </div>
  );
}

/** Floating micro-panel — a tiny glass chip representing an account/service type. */
function MicroPanel({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "cyan" | "violet" | "azure";
}) {
  const toneBg =
    tone === "cyan"
      ? "oklch(0.82 0.1 200 / 0.25)"
      : tone === "violet"
        ? "oklch(0.7 0.12 290 / 0.22)"
        : "oklch(0.7 0.12 258 / 0.22)";
  const toneText =
    tone === "cyan"
      ? "oklch(0.35 0.14 200)"
      : tone === "violet"
        ? "oklch(0.4 0.18 290)"
        : "oklch(0.35 0.14 258)";
  return (
    <div
      className="glass-float flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ background: toneBg, boxShadow: "var(--glass-shadow)" }}
    >
      <span style={{ color: toneText }}>{icon}</span>
      <span className="font-mono-label text-[8px]" style={{ color: toneText }}>
        {label}
      </span>
    </div>
  );
}

/**
 * FreeJoinHeroCard — replaces the old hero "Search" button with a compact
 * premium info card. Opens the SAME WhatsApp contact flow as the navbar
 * Contact button (free-join prefill). Never causes layout shift.
 */
function FreeJoinHeroCard() {
  const wa = buildFreeJoinWhatsAppUrl();
  return (
    <button
      type="button"
      onClick={() => window.open(wa, "_blank", "noopener,noreferrer")}
      aria-label="Contact Owner — FREE TO JOIN"
      className="group glass-float inline-flex flex-col items-start gap-0.5 rounded-2xl px-4 py-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)] hover:shadow-[var(--glass-shadow-lift)]"
      style={{ boxShadow: "var(--glass-shadow)" }}
    >
      <span className="flex items-center gap-1.5 font-heading text-sm font-semibold text-[var(--ink)]">
        <Gem className="h-3.5 w-3.5 text-[var(--accent-azure)]" />
        💎 FREE TO JOIN
      </span>
      <span className="max-w-[16rem] text-xs text-[var(--ink-soft)]">
        List your service or offer on FF TRUST
      </span>
      <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">
        Free Fire IDs • Panels • Paid Push • Instagram Services • More
      </span>
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[10px] font-medium text-[var(--primary-foreground)]">
        <MessageCircle className="h-3 w-3" />
        📲 Contact Owner
      </span>
    </button>
  );
}
