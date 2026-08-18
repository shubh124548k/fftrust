import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { footerGroups } from "@/config/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { GlassPanel } from "@/components/visual/glass-panel";

/**
 * FF TRUST — Site Footer (PROMPT 04 premium shell).
 *
 * Layered glass with editorial spacing:
 *  - top: brand + independence disclosure (stack surface, deepest)
 *  - middle: 3 nav groups (Marketplace / Trust & Safety / Platform) on embed surface
 *  - safety strip + WhatsApp CTA
 *  - bottom: copyright + trust disclaimer
 *
 * Sticky to bottom via root `min-h-screen flex flex-col` + `mt-auto`. Carries
 * the independent-platform disclosure + safety reminder. WhatsApp opens only.
 */
const FOOTER_WA = buildWhatsAppUrl({ inquiry: "Hello FF TRUST, I'd like to know more." });

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/purchase-policy", label: "Purchase Policy" },
  { href: "/account-transfer-policy", label: "Account Transfer Policy" },
  { href: "/listing-policy", label: "Listing Policy" },
  { href: "/content-policy", label: "Content Policy" },
  { href: "/seller-policy", label: "Seller Policy" },
  { href: "/free-fire-policy", label: "Free Fire Account Policy" },
  { href: "/services-policy", label: "Paid Push & Services Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/support", label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      <div className="container-wide">
        {/* Top layered glass — stack surface (deepest) */}
        <GlassPanel
          depth="stack"
          className="relative overflow-hidden rounded-t-[2rem] px-6 py-12 sm:px-10 sm:py-14"
        >
          {/* Atmospheric depth layer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(100% 60% at 0% 0%, oklch(0.82 0.1 200 / 0.1) 0%, oklch(1 0 0 / 0) 55%), radial-gradient(90% 50% at 100% 100%, oklch(0.7 0.12 290 / 0.08) 0%, oklch(1 0 0 / 0) 55%)",
            }}
          />

          <div className="relative grid gap-8 sm:gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* Brand + disclosure */}
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Image
                  src={siteConfig.brandLogo}
                  alt={siteConfig.name}
                  width={1536}
                  height={1024}
                  sizes="72px"
                  className="h-10 w-auto"
                />
              </div>
              <p className="max-w-sm text-sm text-[var(--ink-soft)] text-pretty">
                {siteConfig.shortDescription}
              </p>
              <div className="glass-embed rounded-2xl p-3">
                <p className="text-xs text-[var(--ink-soft)] text-pretty">
                  {siteConfig.independence}
                </p>
              </div>
            </div>

            {/* Nav groups — derived from canonical modules by surface */}
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
                <p className="font-mono-label text-[10px] text-[var(--accent-azure)]">
                  {group.title}
                </p>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Safety reminder strip + WhatsApp */}
          <div className="relative mt-10 flex flex-col gap-3 rounded-2xl border border-[oklch(0.7_0.14_45/0.25)] bg-[oklch(0.86_0.1_80/0.14)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--ink-soft)]">
              <span className="font-mono-label text-[10px] text-[oklch(0.45_0.14_45)]">
                Buyer safety
              </span>
              <br />
              {siteConfig.safety.recordingRemind} {siteConfig.safety.recordingKeep}
              <Link
                href="/proof"
                className="ml-1.5 font-mono-label text-[10px] text-[var(--accent-azure)] underline-offset-2 transition-colors hover:text-[var(--accent-cyan)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                Buyer Proof →
              </Link>
            </p>
            <a
              href={FOOTER_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-shadow hover:shadow-[var(--neon-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Owner
            </a>
          </div>

          {/* Legal links */}
          <nav
            aria-label="Legal"
            className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[var(--border)] pt-6"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono-label text-[10px] text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom bar */}
          <div className="relative mt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">
              © {new Date().getFullYear()} {siteConfig.name} · Independent platform
            </p>
            <p className="font-mono-label text-[9px] text-[var(--ink-soft)]">
              {siteConfig.trustDisclaimer}
            </p>
          </div>

          {/* Editorial signature */}
          <div className="relative mt-6 flex items-center justify-center gap-1.5">
            <Heart className="h-3 w-3 text-[var(--accent-violet)]" aria-hidden />
            <span className="font-mono-label text-[8px] text-[var(--ink-soft)]">
              Crafted with provenance · Pearl-white studio
            </span>
          </div>
        </GlassPanel>
      </div>
    </footer>
  );
}
