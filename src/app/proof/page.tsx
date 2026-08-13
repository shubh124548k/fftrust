import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck, Check, X, Video, Play, Wallet, MessageCircle, FileCheck, Lock, Info, UserCheck, Store, Fingerprint, Scale } from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText } from "@/components/visual/reveal-text";
import { GlassPanel } from "@/components/visual/glass-panel";
import { BuyerProofPanel } from "@/components/proof/buyer-proof-panel";
import { proofContent, type ProofSection } from "@/config/proof";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "PROOF — FF TRUST Buyer Proof",
  description:
    "FF TRUST Buyer Proof — keep screen recording ON throughout verification and transaction. Never share passwords, OTPs or recovery codes.",
  path: "/proof",
});

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

/**
 * FF TRUST — PROOF page (PROMPT 2).
 *
 * The permanent Buyer Proof / Safety destination. Every section comes from the
 * single canonical safety-content source (src/config/proof.ts) — no duplicated
 * copy. Premium 3D glass cards, reveal animations, glowing icons and a moving
 * hero proof panel. Reduced-motion users get a static, fully readable layout.
 */
export default function ProofPage() {
  return (
    <main className="relative pt-28 pb-32 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Trust & Safety" }, { label: "PROOF" }]} />
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <SectionHeading
          overline={proofContent.eyebrow}
          title="Buyer"
          italic="Proof"
          support="Screen recording preserves clear evidence of the verification and transaction. Keep it ON throughout the complete process — and never share sensitive credentials."
          id="proof-title"
        />

        {/* Hero proof panel */}
        <div className="mt-8">
          <RevealText>
            <BuyerProofPanel variant="banner" />
          </RevealText>
        </div>

        {/* Keep recording checklist */}
        <div className="mt-10">
          <RevealText>
            <GlassPanel depth="float" className="p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <Video className="h-4 w-4 text-[oklch(0.45_0.16_45)]" />
                <p className="font-mono-label text-[9px] text-[oklch(0.45_0.16_45)]">
                  When to keep recording
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {proofContent.keepRecording.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 rounded-xl border border-[oklch(0.55_0.14_160/0.2)] bg-[oklch(0.55_0.14_160/0.08)] p-3 text-sm text-[var(--ink)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.55_0.14_160)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </RevealText>
        </div>

        {/* Section grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {proofContent.sections.map((section, i) => (
            <ProofCard key={section.key} section={section} index={i} />
          ))}
        </div>

        {/* Never share + disclaimer */}
        <div className="mt-10 grid gap-5 md:grid-cols-[1fr_1fr]">
          <RevealText>
            <GlassPanel depth="stack" className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-[oklch(0.68_0.2_24)]" />
                <p className="font-mono-label text-[9px] text-[oklch(0.45_0.14_45)]">
                  Never share
                </p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {proofContent.dontShare.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.68_0.2_24)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-[oklch(0.68_0.2_24/0.2)] bg-[oklch(0.86_0.1_80/0.14)] p-3 text-xs text-[var(--ink-soft)] text-pretty">
                {proofContent.neverSend}
              </p>
            </GlassPanel>
          </RevealText>

          <RevealText delay={80}>
            <GlassPanel depth="stack" holo className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent-cyan)]" />
                <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">
                  Independent platform
                </p>
              </div>
              <p className="text-sm text-[var(--ink-soft)] text-pretty">
                {proofContent.disclaimer}
              </p>
              <p className="mt-3 text-sm text-[var(--ink-soft)] text-pretty">
                FF TRUST is not affiliated with, endorsed by, or sponsored by
                Garena or Free Fire. All trademarks belong to their respective
                owners.
              </p>
            </GlassPanel>
          </RevealText>
        </div>
      </div>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Trust & Safety", path: "/#trust" },
          { name: "PROOF", path: "/proof" },
        ]}
      />
    </main>
  );
}

function ProofCard({ section, index }: { section: ProofSection; index: number }) {
  const Icon = section.iconKey ? SECTION_ICONS[section.iconKey] ?? ShieldCheck : ShieldCheck;
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
