import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "FF TRUST processes no payments and cannot issue refunds itself. Refund eligibility is governed by the off-platform agreement between you and the seller or owner.",
  alternates: { canonical: `${siteConfig.url}/refund-policy` },
};

export default function RefundPolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Refund Policy" }]} />
      </div>
      <LegalPage
      overline="Refund Policy"
      title="Refund policy,"
      italic="plainly"
      updated="Last updated: 2026"
      intro={
        <>
          This policy is short on purpose. {siteConfig.name} does not take your money, so it
          cannot return it. Here is exactly how refund issues are handled.
        </>
      }
    >
      <LegalSection heading="This website does not process payments" id="no-payments">
        <LegalP>
          There is no checkout, no payment button and no price-collection on this website. Money
          never moves through {siteConfig.name}.
        </LegalP>
        <LegalP>
          As a result, this website cannot issue, approve, or deny a refund. Any claim of a
          &quot;site refund&quot; is not legitimate — treat it as a scam red flag.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Transactions happen off-platform" id="off-platform">
        <LegalP>
          Purchases are agreed directly between you and the seller or owner on WhatsApp or another
          channel. That agreement — not this website — sets the terms for delivery and refunds.
        </LegalP>
        <LegalP>
          Read and keep the chat history, the listing reference and any evidence you were shown,
          and follow the buyer-safety guidance before paying: turn on screen recording and verify
          the listing through the site&apos;s canonical buttons.
        </LegalP>
      </LegalSection>

      <LegalSection heading="How to raise a refund issue" id="how-to-raise">
        <LegalP>
          Contact the owner on WhatsApp using the site&apos;s canonical contact button. Include the
          listing reference, the agreed price, and a description of what went wrong. Keep screen
          recording as your evidence.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Third-party payment channels" id="third-party">
        <LegalP>
          If you paid through a third-party payment provider, their dispute or chargeback rules may
          also apply. This website has no role in that process.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Honest expectations" id="honest-expectations">
        <LegalP>
          {siteConfig.trustDisclaimer} Read the evidence before paying, never share credentials, and
          prefer recorded, verifiable transactions.
        </LegalP>
      </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Legal", path: "/#legal" },
          { name: "Refund Policy", path: "/refund-policy" },
        ]}
      />
    </main>
  );
}
