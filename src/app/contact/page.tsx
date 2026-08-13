import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Video, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { pageMetadata } from "@/lib/seo";
import { GlassPanel } from "@/components/visual/glass-panel";
import { StatusChip } from "@/components/visual/status-chip";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact the FF TRUST owner on WhatsApp. The website opens a prefilled message — you press Send. FF TRUST never collects passwords, OTPs or recovery codes.",
  path: "/contact",
});

const RELATED = [
  { href: "/proof", label: "Buyer Proof", detail: "Keep screen recording ON" },
  { href: "/refund-policy", label: "Refund Policy", detail: "How refund issues are handled" },
  { href: "/privacy", label: "Privacy Policy", detail: "How your information is handled" },
  { href: "/terms", label: "Terms of Service", detail: "Plain terms for using the site" },
];

export default function ContactPage() {
  const wa = buildWhatsAppUrl({ inquiry: "Hello FF TRUST, I'd like to know more." });
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Platform" }, { label: "Contact" }]} />

        <div className="max-w-2xl">
          <p className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">Contact</p>
          <h1 className="mt-2 font-heading text-balance text-3xl font-semibold leading-[1.02] tracking-tight text-[var(--ink)] sm:text-5xl">
            Reach the owner on{" "}
            <span className="font-display text-gradient-cyan italic">WhatsApp</span>
          </h1>
          <p className="mt-4 text-pretty text-sm text-[var(--ink-soft)] sm:text-base">
            The website opens WhatsApp with a prefilled message addressed to the canonical owner
            number ({siteConfig.whatsapp.number}). You review it and press Send yourself — the
            website never sends messages automatically.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="mt-10 max-w-2xl">
          <GlassPanel depth="pedestal" holo className="relative overflow-hidden p-8">
            <div aria-hidden className="light-wash absolute inset-0" />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip tone="cyan" icon={<MessageCircle className="h-3 w-3" />}>
                  WhatsApp
                </StatusChip>
                <StatusChip tone="neutral">You press Send</StatusChip>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-mono-label text-[10px] text-[var(--ink-soft)]">
                  Canonical owner number
                </p>
                <p className="font-heading text-2xl font-semibold text-[var(--ink)]">
                  +{siteConfig.whatsapp.number}
                </p>
              </div>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open WhatsApp to contact the FF TRUST owner"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <MessageCircle className="h-4 w-4" />
                Start a WhatsApp conversation
              </a>
              <p className="text-xs text-[var(--ink-soft)] text-pretty">
                This link is generated from the single canonical owner configuration. Never send a
                message to a forwarded number — start from this page.
              </p>
            </div>
          </GlassPanel>
        </div>

        {/* Trust notes */}
        <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          <GlassPanel depth="thin" className="flex flex-col gap-3 p-5">
            <ShieldCheck className="h-5 w-5 text-[var(--accent-cyan)]" aria-hidden />
            <p className="text-sm font-semibold text-[var(--ink)]">We never collect credentials</p>
            <p className="text-xs leading-relaxed text-[var(--ink-soft)] text-pretty">
              {siteConfig.safety.neverCollect}
            </p>
          </GlassPanel>
          <GlassPanel depth="thin" className="flex flex-col gap-3 p-5">
            <Video className="h-5 w-5 text-[oklch(0.45_0.16_45)]" aria-hidden />
            <p className="text-sm font-semibold text-[var(--ink)]">Keep screen recording ON</p>
            <p className="text-xs leading-relaxed text-[var(--ink-soft)] text-pretty">
              {siteConfig.safety.recordingRemind} {siteConfig.safety.recordingKeep}
            </p>
          </GlassPanel>
        </div>

        {/* Related help */}
        <div className="mt-10 max-w-2xl">
          <p className="font-mono-label text-[10px] text-[var(--accent-azure)] sm:text-xs">
            Related help
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {RELATED.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-embed group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--ink)]">{item.label}</span>
                  <span className="text-xs text-[var(--ink-soft)]">{item.detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--ink-soft)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent-azure)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Platform", path: "/#about" },
          { name: "Contact", path: "/contact" },
        ]}
      />
    </main>
  );
}
