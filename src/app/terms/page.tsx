import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using FF TRUST — an independent account-trust platform. No affiliation with Garena or Free Fire, trust labels are not guarantees, and the site processes no payments.",
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Terms of Service" }]} />
      </div>
      <LegalPage
      overline="Terms of Service"
      title="Terms of"
      italic="use"
      updated="Last updated: 2026"
      intro={
        <>
          By using {siteConfig.name} you agree to the terms below. They are kept short and plain —
          this is a frontend-only platform that connects you with the owner on WhatsApp.
        </>
      }
    >
      <LegalSection heading="Acceptance" id="acceptance">
        <LegalP>
          Accessing or using this website means you accept these terms. If you do not agree, do not
          use the website.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Independent platform" id="independent">
        <LegalP>{siteConfig.independence}</LegalP>
        <LegalP>
          {siteConfig.name} is not a publisher of user-created content, an agent, or a broker in
          any transaction. Transactions happen directly between you and the seller or owner.
        </LegalP>
      </LegalSection>

      <LegalSection heading="What the website does" id="what-the-site-does">
        <LegalP>
          The website displays canonical records — listings, evidence metadata and INR prices — and
          opens a prefilled WhatsApp message for inquiries. It does not complete purchases, process
          payments, or guarantee the outcome of any trade.
        </LegalP>
        <LegalP>
          WhatsApp messages are sent only when you press Send. The website never sends messages
          automatically.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Trust labels are not guarantees" id="trust-labels">
        <LegalP>{siteConfig.trustDisclaimer}</LegalP>
      </LegalSection>

      <LegalSection heading="Buyer responsibilities" id="buyer-responsibilities">
        <LegalP>
          You are responsible for protecting yourself during a trade. Before paying, follow the
          site&apos;s buyer-safety guidance: turn on screen recording, verify listings through the
          canonical buttons, and never share your password, OTP or recovery codes.
        </LegalP>
        <LegalP>{siteConfig.safety.neverCollect}</LegalP>
      </LegalSection>

      <LegalSection heading="Seller submissions" id="seller-submissions">
        <LegalP>
          Submitting a listing through the seller-intake form is not verification and not
          publication. The owner reviews submissions manually and publishes approved canonical
          records.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Paid Push scope" id="paid-push">
        <LegalP>
          Rank-push and panel packages describe scope and effort only. No service on this website
          guarantees a specific rank, wins, anti-ban, or safety. Free Fire itself may change at any
          time.
        </LegalP>
      </LegalSection>

      <LegalSection heading="No payments or refunds on this website" id="payments">
        <LegalP>
          The website has no checkout and does not collect payment. Any payment happens
          off-platform under the agreement you make with the seller or owner. See the{" "}
          <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
            Refund Policy
          </a>{" "}
          for how refund issues are handled.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Prohibited conduct" id="prohibited">
        <LegalP>
          Do not use the website to impersonate others, scrape content at scale, misrepresent
          listings, or attempt to compromise the website.
        </LegalP>
      </LegalSection>

      <LegalSection heading="No warranty" id="no-warranty">
        <LegalP>
          The website is provided &quot;as is&quot;. To the maximum extent permitted by law,{" "}
          {siteConfig.name} makes no warranties about availability, accuracy, or results of any
          off-platform transaction.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Changes" id="changes">
        <LegalP>
          These terms may be updated. The &quot;Last updated&quot; date above is revised on every
          change; continued use means acceptance.
        </LegalP>
      </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Legal", path: "/#legal" },
          { name: "Terms of Service", path: "/terms" },
        ]}
      />
    </main>
  );
}
