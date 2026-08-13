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
  title: "Disclaimer",
  description:
    "FF TRUST is an independent platform, not affiliated with Garena or Free Fire. Trust labels are not guarantees, the website processes no payments, and transactions happen off-platform.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Disclaimer" }]} />
      </div>
      <LegalPage
        overline="Legal · Disclaimer"
        title="Plain, honest"
        italic="disclaimers"
        updated="Last updated: 2026"
        intro={
          <>
            These disclaimers are short and plain on purpose. {siteConfig.name} is an independent
            platform that publishes canonical records and connects you with the owner on WhatsApp.
            It does not broker, guarantee or complete transactions.
          </>
        }
      >
        <LegalSection heading="Independent platform" id="independent">
          <LegalP>{siteConfig.independence}</LegalP>
          <LegalP>
            Garena, Free Fire, Instagram and any other game or service names belong to their
            respective owners and are used only to describe the subject matter of listings.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Trust labels are not guarantees" id="not-guarantees">
          <LegalP>{siteConfig.trustDisclaimer}</LegalP>
          <div className="space-y-2">
            <LegalItem term="Provenance, not promise">
              Evidence labels reflect the real canonical evidence state on file — nothing more.
            </LegalItem>
            <LegalItem term="Paid Push is scope and effort">
              Rank-push and panel packages never guarantee a specific rank, wins, completion,
              anti-ban or safety.
            </LegalItem>
          </div>
        </LegalSection>

        <LegalSection heading="No payments or refunds on this website" id="no-payments">
          <LegalP>
            The website has no checkout and never collects payment. Any payment happens off-platform
            under the agreement between you and the seller or owner. See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
              Refund Policy
            </a>{" "}
            for how refund issues are handled.
          </LegalP>
        </LegalSection>

        <LegalSection heading="No professional advice" id="no-advice">
          <LegalP>
            Nothing on this website is financial, investment, legal or tax advice. Make your own
            decisions and verify every listing before paying.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Your responsibility" id="responsibility">
          <LegalP>
            You are responsible for protecting yourself during a trade — follow the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/safety">
              Buyer Safety
            </a>{" "}
            guidance, keep screen recording ON and never share passwords, OTPs or recovery codes.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Availability and accuracy" id="availability">
          <LegalP>
            The website is provided &quot;as is&quot;. Listings and prices may change at any time,
            and Free Fire itself may change in ways this platform cannot control.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Contact" id="contact">
          <LegalP>
            Questions about this disclaimer? Contact the owner on{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/contact">
              the Contact page
            </a>
            .
          </LegalP>
        </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Legal", path: "/#legal" },
          { name: "Disclaimer", path: "/disclaimer" },
        ]}
      />
    </main>
  );
}
