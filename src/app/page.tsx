import Link from "next/link";
import {
  ShieldCheck,
  BadgeIndianRupee,
  Info,
  ArrowRight,
  Scale,
  ChevronDown,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CategoryHub } from "@/components/home/category-hub";
import { SectionHeading } from "@/components/visual/section-heading";
import { RevealText } from "@/components/visual/reveal-text";
import { GlassPanel, GlassCard } from "@/components/visual/glass-panel";
import { BuyerProofPanel } from "@/components/proof/buyer-proof-panel";
import { ProofCardGrid } from "@/components/proof/proof-card-grid";
import { ParallaxLayer } from "@/components/visual/parallax-layer";
import { StatusChip } from "@/components/visual/status-chip";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
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
import { PromotionInfoBox } from "@/components/promotion/promotion-info-box";
import { FaqJsonLd } from "@/components/seo/structured-data";
import {
  ProcessDiagram,
  CinematicCTA,
} from "@/components/home/sections";
import { FreeJoinPromo, FreeJoinNotice } from "@/components/home/free-join-promo";
import { SellerContactActions } from "@/components/seller/seller-contact-actions";

/**
 * FF TRUST — Home (PROMPT 2 clean marketplace gateway).
 *
 * The homepage is a GATEWAY, not a listing page. No product grids — the
 * marketplace surfaces (accounts, panel seller, paid push, Instagram) live on
 * their dedicated pages and are reached from the category hub:
 *  1 Hero stage — simplified gateway message + honest live counts
 *  2 Category hub — three primary marketplaces (FREE FIRE / PANELS &
 *    SERVICES / SOCIAL MEDIA) built on ONE reusable CategoryCard
 *  3 Free to join — listing onboarding prompt
 *  4 Trust Center — why trust it
 *  5 How it works — the transparent 4-step flow
 *  6 Trust/safety editorial (proof, scam center, price guide, compare)
 *  7 List your account — seller intake workflow
 *  8 FAQ / About / Legal / Contact
 *
 * Data is always canonical: every count comes from the production catalogue.
 * SAMPLE fixtures are used only inside clearly-labeled demonstration frames.
 * No fake counts, no fake inventory.
 */
export default function Home() {
  const trust = getTrustContent();
  const priceGuide = getPriceGuideContent();
  const faqs = getFAQs();
  const legal = getLegalContent();
  const howItWorks = getHowItWorksContent();
  const scamCenter = getScamCenterContent();
  const compare = getCompareContent();
  const safetyAcademy = getSafetyAcademyContent();
  const contactWa = buildWhatsAppUrl({ inquiry: "Hello FF TRUST, I'd like to know more." });

  return (
    <>
      {/* 1 — HERO STAGE */}
      <Hero />

      {/* 1a — CATEGORY HUB (three primary marketplace destinations) */}
      <CategoryHub />

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

      {/* 3 — MARKETPLACE GRIDS removed (PROMPT 2 gateway):
          account listings, panel-seller and paid-push showrooms, and the
          Instagram preview now live on their dedicated marketplace pages.
          The homepage is a clean gateway — no product grids. */}

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

      {/* 6c — PROOF (compact buyer-proof card grid, same design language) */}
      <section id="proof-guide" aria-labelledby="proof-guide-title" className="section-ff relative" data-light="safety">
        <div className="container-wide">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              overline="05 — Proof"
              title="Buyer proof,"
              italic="card by card"
              support="Screen recording preserves clear evidence of the verification and transaction. This compact guide covers verification, evidence, transaction safety, scam prevention and more."
              id="proof-guide-title"
            />
            <Link
              href="/proof"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent-azure)] hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
            >
              Full PROOF guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProofCardGrid limit={6} />
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
              overline="09 — List Your Account"
              title="Seller intake"
              italic="workflow"
              support="A transparent 6-step glass workflow: Contact Owner → Provide Details → Provide Evidence → Live Verification → Owner Review → Publication. Collects only non-secret public information. Submission is not verification and not publication."
              id="list-title"
            />
            <RevealText delay={120}>
              <GlassCard depth="pedestal" holo className="relative overflow-hidden p-8">
                <div aria-hidden className="light-wash absolute inset-0" />
                <div className="relative">
                  <SellerContactActions />
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

      {/* SEO: FAQ structured data */}
      <FaqJsonLd faqs={faqs} />
    </>
  );
}
