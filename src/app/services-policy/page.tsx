import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import {
  LegalPage,
  LegalSection,
  LegalP,
  LegalItem,
} from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Paid Push & Services Policy",
  description:
    "FF TRUST paid push, panel and social media service policy — scope and effort are described honestly, with no guaranteed ranks, wins, followers or views promised.",
  path: "/services-policy",
});

export default function ServicesPolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Paid Push & Services Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Service Policy"
        title="Services, described"
        italic="honestly"
        updated="Last updated: 2026"
        intro={
          <>
            This policy covers paid push packages, panel seller services and social media
            services. {siteConfig.name} describes what each service includes — it never promises
            results it cannot control.
          </>
        }
      >
        <LegalSection heading="Scope, not guarantees" id="scope-not-guarantees">
          <LegalP>
            Every service on this website describes scope and effort — what will be attempted, on
            which account, over what period, and what is included or excluded. No service on this
            website guarantees a specific rank, wins, completion, anti-ban or safety. Rank push and
            panel work are performed on live platforms that change at any time and are outside our
            control.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Paid push" id="paid-push">
          <LegalP>
            Paid push packages state a from-rank and to-rank target, the game mode (CS or BR), the
            package tier, scope and schedule. These describe the work the seller intends to do —
            reaching the target is not guaranteed, and anti-ban is never promised.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Panel seller services" id="panel-services">
          <LegalP>
            Panel seller listings state a category, scope, included and excluded features, and any
            requirements. The listing describes the service, not a guaranteed outcome.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Social media services" id="social-media">
          <LegalP>
            Instagram views, followers and likes are listed at very low prices with their stated
            quantity. Delivery of social-media engagement depends on third-party platforms and
            their rules. We do not claim guaranteed delivery, permanence or safety for any
            social-media service.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Seller responsibility" id="seller-responsibility">
          <LegalP>
            Sellers must describe scope honestly, only claim what they can attempt, and never
            promise guaranteed ranks, wins, followers or safety.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Buyer responsibility" id="buyer-responsibility">
          <LegalP>
            Buyers should read the scope and requirements before ordering, keep the order summary
            and chat history, and turn on screen recording during delivery — as described in{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/safety">
              Buyer Safety
            </a>
            .
          </LegalP>
        </LegalSection>

        <LegalSection heading="Payments and refunds" id="payments">
          <LegalP>
            The website has no checkout. Payment happens off-platform under your agreement with the
            seller. See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
              Refund Policy
            </a>{" "}
            for how delivery and refund issues are handled.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Disputes and support" id="disputes">
          <LegalP>
            Report any issue to the owner on{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/contact">
              the Contact page
            </a>
            . The owner may mediate, but the platform cannot force refunds or outcomes.
          </LegalP>
        </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Legal", path: "/#legal" },
          { name: "Paid Push & Services Policy", path: "/services-policy" },
        ]}
      />
    </main>
  );
}
