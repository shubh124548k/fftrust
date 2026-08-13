"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  ShieldCheck,
  BadgeIndianRupee,
  LayoutList,
  Server,
  Trophy,
  Info,
  Mail,
  Receipt,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Scale,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText, RevealGroup } from "@/components/visual/reveal-text";
import { GlassPanel, GlassCard } from "@/components/visual/glass-panel";
import { BuyerProofPanel } from "@/components/proof/buyer-proof-panel";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import { MagneticButton } from "@/components/visual/magnetic-button";
import { EmptyState } from "@/components/visual/empty-state";
import { StatusChip } from "@/components/visual/status-chip";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  getFeaturedAccounts,
  getAccountPriceBounds,
  getRealAccountCount,
} from "@/lib/selectors/accounts";
import {
  getFeaturedPanelServices,
  getFeaturedRankPush,
} from "@/lib/selectors/services";
import {
  getTrustContent,
  getPriceGuideContent,
  getFAQs,
  getLegalContent,
  getHowItWorksContent,
  getScamCenterContent,
  getCompareContent,
  getSafetyAcademyContent,
} from "@/lib/selectors/content";
import {
  TrustCenterMap,
  ScamCenterInteractive,
  SafetyAcademyJourney,
  PriceGuideDerived,
  CompareStage,
} from "@/components/editorial/editorial-sections";
import { SellerIntakeOverlay } from "@/components/intake/seller-intake-overlay";
import { PanelSellerShowroom } from "@/components/showroom/panel-seller-showroom";
import { PaidPushMarketplace } from "@/components/showroom/paid-push-marketplace";
import { InstagramServicesPreview } from "@/components/instagram/instagram-services-preview";
import { PromotionInfoBox } from "@/components/promotion/promotion-info-box";
import { FaqJsonLd } from "@/components/seo/structured-data";
import { useSellerContactStore } from "@/stores/seller-contact";
import {
  FloatingRail,
  SplitEditorial,
  ProcessDiagram,
  ServiceShowroom,
  EvidenceOrbit,
  ComparisonStage,
  CinematicCTA,
} from "@/components/home/sections";
import { FreeJoinPromo, FreeJoinNotice } from "@/components/home/free-join-promo";
import { ExploreCatalogue } from "@/components/explore/explore-catalogue";

/**
 * FF TRUST — Home (PROMPT 05 god-level 10D cinematic launch).
 *
 * The strongest visual statement. Varied compositions with different rhythms:
 *  1 Hero stage — huge editorial type + 3D focal object + floating micro-panels
 *  2 Trust philosophy — split editorial with 3D object
 *  3 Featured accounts — horizontal floating rail
 *  4 How it works — 3D process diagram (4 connected steps)
 *  5 Services marketplace — service showroom (Panel Seller + Paid Push split)
 *  6 Evidence/Safety — buyer safety reminder
 *  7 Scam center — evidence orbit (red flags + golden rule)
 *  8 Price guide preview — derived bounds or honest empty state
 *  9 Compare/Favorites — comparison stage
 * 10 List your account — split editorial onboarding
 * 11 3D object showcase — rendering engine proof
 * 12 FAQ — expandable accordions
 * 13 About — split editorial + disclosure
 * 14 Legal — terms + privacy panels
 * 15 Final contact — cinematic CTA
 *
 * Data is always canonical: featured sections show REAL inventory when
 * available, otherwise an honest empty state — SAMPLE fixtures are used only
 * inside clearly-labeled demonstration frames. No fake counts.
 */
export default function Home() {
  const featured = getFeaturedAccounts(6);
  const priceBounds = getAccountPriceBounds();
  const panelFeatured = getFeaturedPanelServices(2);
  const pushFeatured = getFeaturedRankPush(2);
  const trust = getTrustContent();
  const priceGuide = getPriceGuideContent();
  const faqs = getFAQs();
  const legal = getLegalContent();
  const howItWorks = getHowItWorksContent();
  const scamCenter = getScamCenterContent();
  const compare = getCompareContent();
  const safetyAcademy = getSafetyAcademyContent();
  const realAccounts = getRealAccountCount();
  const listWa = buildWhatsAppUrl({
    inquiry: "I'd like to list an account on FF TRUST. Please share the seller process.",
  });
  const contactWa = buildWhatsAppUrl({ inquiry: "Hello FF TRUST, I'd like to know more." });
  const [intakeOpen, setIntakeOpen] = React.useState(false);
  const openSellerPopup = useSellerContactStore((s) => s.openPopup);

  return (
    <>
      {/* 1 — HERO STAGE */}
      <Hero />

      {/* 1b — FREE TO JOIN (compact notice + premium promo card, top of home) */}
      <section id="free-join" aria-labelledby="free-join-title" className="section-ff relative" data-light="hero">
        <div className="container-wide flex flex-col gap-6">
          <h2 id="free-join-title" className="sr-only">Free to join — list your service on FF TRUST</h2>
          <FreeJoinNotice />
          <FreeJoinPromo />
        </div>
      </section>

      {/* 2 — TRUST CENTER (animated evidence/provenance map) */}
      <section id="trust" aria-labelledby="trust-title" className="section-ff relative" data-light="trust">
        <ParallaxLayer depth={1} className="pointer-events-none absolute inset-0 -z-10">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 h-64 w-[60%] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.82 0.1 200 / 0.18) 0%, oklch(1 0 0 / 0) 70%)" }}
          />
        </ParallaxLayer>
        <div className="container-wide">
          <TrustCenterMap trust={trust} />
        </div>
      </section>

      {/* 3 — EXPLORE (cinematic catalogue + dynamic search/filters) */}
      <section id="explore" aria-labelledby="explore-title" className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:section-ff" data-light="catalogue">
        <div className="container-wide">
          <div className="mb-4 flex flex-col gap-2 sm:mb-10 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              overline="02 — Explore"
              title="Free Fire account"
              italic="listings"
              support="A high-density but premium catalogue. Search, filter and sort through canonical records — every value below is derived from published listings. No fake popularity, ratings or reviews."
              id="explore-title"
            />
            <Link
              href="/accounts"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              View All Accounts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ExploreCatalogue rotate />
        </div>
      </section>

      {/* 4 — HOW IT WORKS (3D process diagram) */}
      <section id="how-it-works" aria-labelledby="how-title" className="section-ff relative" data-light="dossier">
        <div className="container-wide">
          <SectionHeading
            overline="03 — How It Works"
            title="A transparent"
            italic="four-step flow"
            support={howItWorks.intro}
            id="how-title"
          />
          <ProcessDiagram steps={howItWorks.steps} />
        </div>
      </section>

      {/* 5 — PANEL SELLER (cinematic service showroom) */}
      <section id="panel-seller" aria-labelledby="panel-title" className="relative pt-16 pb-16 sm:section-ff" data-light="showroom">
        <div className="container-wide">
          <PanelSellerShowroom rotate />
          <div className="mt-8 flex justify-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              View All Panel & Services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5b — PAID PUSH (CS/BR progression marketplace) */}
      <section id="paid-push" aria-labelledby="paid-push-title" className="relative pt-16 pb-16 sm:section-ff" data-light="showroom">
        <div className="container-wide">
          <PaidPushMarketplace rotate />
          <div className="mt-8 flex justify-center">
            <Link
              href="/paid-push"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              View All Paid Push — CS / BR
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5c — INSTAGRAM SERVICES (3 category cards + More Options) */}
      <InstagramServicesPreview />

      {/* 5d — FREE & PAID PROMOTION (reusable info box) */}
      <section id="promotion" aria-labelledby="promotion-title" className="section-ff relative" data-light="trust">
        <div className="container-wide">
          <h2 id="promotion-title" className="sr-only">Free and paid promotion on FF TRUST</h2>
          <PromotionInfoBox />
        </div>
      </section>

      {/* 6 — EVIDENCE / SAFETY */}
      <section id="buyer-safety" className="section-ff-tight relative" data-light="safety">
        <div className="container-wide">
          <RevealText>
            <BuyerProofPanel variant="banner" />
          </RevealText>
        </div>
      </section>

      {/* 6b — SAFETY ACADEMY (visual step-by-step journey) */}
      <section id="safety-academy" aria-labelledby="academy-title" className="section-ff relative" data-light="trust">
        <div className="container-wide">
          <SafetyAcademyJourney academy={safetyAcademy} />
        </div>
      </section>

      {/* 7 — SCAM CENTER (interactive red-flag cards) */}
      <section id="scam-center" aria-labelledby="scam-title" className="section-ff relative" data-light="safety">
        <ParallaxLayer depth={2} className="pointer-events-none absolute inset-0 -z-10">
          <div
            aria-hidden
            className="absolute right-1/4 top-10 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.7 0.12 290 / 0.16) 0%, oklch(1 0 0 / 0) 70%)" }}
          />
        </ParallaxLayer>
        <div className="container-wide">
          <ScamCenterInteractive scam={scamCenter} />
        </div>
      </section>

      {/* 8 — PRICE GUIDE (derived from real records) */}
      <section id="price-guide" aria-labelledby="price-title" className="section-ff relative">
        <div className="container-wide">
          <PriceGuideDerived />
        </div>
      </section>

      {/* 9 — COMPARE (2-4 real records, glass columns) */}
      <section id="compare" aria-labelledby="compare-title" className="section-ff relative" data-light="dossier">
        <div className="container-wide">
          <CompareStage intro={compare.intro} emptyNote={compare.emptyNote} />
        </div>
      </section>

      {/* 10 — LIST YOUR ACCOUNT (advanced seller intake) */}
      <section id="list-account" aria-labelledby="list-title" className="section-ff relative" data-light="dossier">
        <div className="container-wide">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionHeading
              overline="08 — List Your Account"
              title="Seller intake"
              italic="workflow"
              support="A transparent 6-step glass workflow: Contact Owner → Provide Details → Provide Evidence → Live Verification → Owner Review → Publication. Collects only non-secret public information. Submission is not verification and not publication."
              id="list-title"
            />
            <RevealText delay={120}>
              <GlassCard depth="pedestal" holo className="relative overflow-hidden p-8">
                <div aria-hidden className="light-wash absolute inset-0" />
                <div className="relative flex flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <StatusChip tone="cyan" icon={<LayoutList className="h-3 w-3" />}>Seller onboarding</StatusChip>
                    <StatusChip tone="violet">3 seller types</StatusChip>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => openSellerPopup("account")}
                      className="glass-embed flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.82_0.1_200/0.15)] text-[var(--accent-azure)]">
                        <LayoutList className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--ink)]">Free Fire Account</p>
                        <p className="text-xs text-[var(--ink-soft)]">List an account for sale</p>
                      </div>
                      <Plus className="h-4 w-4 text-[var(--ink-soft)]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openSellerPopup("panel")}
                      className="glass-embed flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.7_0.12_290/0.15)] text-[var(--accent-violet)]">
                        <Server className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--ink)]">Panel Seller Service</p>
                        <p className="text-xs text-[var(--ink-soft)]">List a panel/top-up service</p>
                      </div>
                      <Plus className="h-4 w-4 text-[var(--ink-soft)]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openSellerPopup("paid-push")}
                      className="glass-embed flex items-center gap-3 rounded-2xl p-4 text-left transition-all hover:shadow-[var(--neon-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.74_0.15_196/0.15)] text-[var(--accent-cyan)]">
                        <Trophy className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--ink)]">Paid Push Service</p>
                        <p className="text-xs text-[var(--ink-soft)]">List CS/BR rank-push packages</p>
                      </div>
                      <Plus className="h-4 w-4 text-[var(--ink-soft)]" />
                    </button>
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
              </GlassCard>
            </RevealText>
          </div>
        </div>
      </section>

      {/* 10b — MOTION SHOWCASE removed (decorative 3D demo — not marketplace content) */}
      {/* 11 — 3D OBJECT SHOWCASE removed (decorative 3D demo — not marketplace content) */}
      {/* 11b — FUTURE MODULES removed (decorative 3D demo — not marketplace content) */}

      {/* 12 — FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="section-ff relative">
        <div className="container-wide">
          <SectionHeading
            overline="10 — FAQ"
            title="Honest answers, no"
            italic="guarantees"
            support="Common questions about the platform, trust and buyer safety — answered directly from canonical content."
            id="faq-title"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {faqs.map((f, i) => (
              <RevealText key={f.q} delay={i * 60}>
                <details className="glass group rounded-2xl p-5 transition-shadow open:shadow-[var(--glass-shadow-lift)]">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[oklch(0.82_0.1_200/0.16)] font-mono-label text-[10px] text-[var(--accent-azure)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-base font-semibold leading-tight text-[var(--ink)]">{f.q}</h3>
                    </div>
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[var(--ink-soft)] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 pl-10 text-sm text-[var(--ink-soft)] text-pretty">{f.a}</p>
                  {f.category && (
                    <p className="mt-2 pl-10 font-mono-label text-[9px] text-[var(--accent-azure)]">{f.category}</p>
                  )}
                </details>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* 13 — ABOUT */}
      <section id="about" aria-labelledby="about-title" className="section-ff relative">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <SectionHeading
              overline="11 — About"
              title="An independent"
              italic="trust studio"
              support={siteConfig.independence}
              id="about-title"
            />
            <RevealText delay={120}>
              <GlassPanel depth="base" className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                  <StatusChip tone="cyan" icon={<Info className="h-3 w-3" />}>Independent platform</StatusChip>
                  <StatusChip tone="neutral" icon={<ShieldCheck className="h-3 w-3" />}>No absolute claims</StatusChip>
                </div>
                <p className="text-sm text-[var(--ink-soft)] text-pretty">
                  FF TRUST never claims “100% safe”, “no scam” or “guaranteed”. Transparency and provenance are not the same as a guarantee.
                </p>
                <p className="text-sm text-[var(--ink-soft)] text-pretty">
                  The website opens WhatsApp with a prefilled, URL-encoded message — you press Send. FF TRUST never collects passwords, OTPs or recovery codes.
                </p>
                <div className="mt-auto pt-2">
                  <StatusChip tone="violet" icon={<BadgeIndianRupee className="h-3 w-3" />}>
                    Currency · {siteConfig.currency}
                  </StatusChip>
                </div>
              </GlassPanel>
            </RevealText>
          </div>
        </div>
      </section>

      {/* 14 — LEGAL */}
      <section id="legal" aria-labelledby="legal-title" className="section-ff relative" data-light="legal">
        <div className="container-wide">
          <SectionHeading
            overline="12 — Legal"
            title="Terms & privacy,"
            italic="honestly"
            support="Frontend-only platform. No paid backend, no credential collection. Canonical legal copy below."
            id="legal-title"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <RevealText>
              <GlassPanel depth="base" className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                  <StatusChip tone="cyan" icon={<Scale className="h-3 w-3" />}>Terms</StatusChip>
                </div>
                <p className="text-sm text-[var(--ink-soft)] text-pretty">{legal.terms.intro}</p>
                <div className="flex flex-col gap-3">
                  {legal.terms.sections.map((s) => (
                    <div key={s.heading} className="border-t border-[var(--border)] pt-3">
                      <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">{s.heading}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">{s.body}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </RevealText>
            <RevealText delay={100}>
              <GlassPanel depth="base" className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                  <StatusChip tone="violet" icon={<ShieldCheck className="h-3 w-3" />}>Privacy</StatusChip>
                </div>
                <p className="text-sm text-[var(--ink-soft)] text-pretty">{legal.privacy.intro}</p>
                <div className="flex flex-col gap-3">
                  {legal.privacy.sections.map((s) => (
                    <div key={s.heading} className="border-t border-[var(--border)] pt-3">
                      <p className="font-mono-label text-[9px] text-[var(--accent-azure)]">{s.heading}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)] text-pretty">{s.body}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </RevealText>
          </div>
        </div>
      </section>

      {/* 15 — FINAL CINEMATIC CTA */}
      <section id="contact" aria-labelledby="contact-title" className="section-ff relative" data-light="hero">
        <div className="container-wide">
          <h2 id="contact-title" className="sr-only">Contact</h2>
          <CinematicCTA wa={contactWa} />
        </div>
      </section>

      {/* Seller intake overlay (opens from List Your Account) */}
      {intakeOpen && <SellerIntakeOverlay onClose={() => setIntakeOpen(false)} />}

      {/* SEO: FAQ structured data */}
      <FaqJsonLd faqs={faqs} />
    </>
  );
}

function PriceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono-label text-[10px] text-[var(--ink-soft)]">{label}</span>
      <span className="font-heading text-3xl font-semibold text-gradient-cyan">{value}</span>
    </div>
  );
}
