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
  title: "Seller Policy",
  description:
    "FF TRUST seller requirements — accurate listing descriptions, real evidence, honest media, and the manual owner-review process before anything is published.",
  path: "/seller-policy",
});

export default function SellerPolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Seller Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Seller Policy"
        title="Rules for"
        italic="sellers"
        updated="Last updated: 2026"
        intro={
          <>
            This policy describes the requirements and process for listing on {siteConfig.name}.
            It is an independent platform — the owner reviews every submission manually before
            anything is published.
          </>
        }
      >
        <LegalSection heading="Eligibility" id="eligibility">
          <LegalP>
            Anyone can propose a listing, but listing is not automatic. You must be the legitimate
            owner of the account or the provider of the service you are submitting, and you must be
            able to demonstrate that ownership or capability when asked.
          </LegalP>
          <LegalP>{siteConfig.independence}</LegalP>
        </LegalSection>

        <LegalSection heading="How submissions work" id="submissions">
          <LegalP>
            You submit a listing through the site&apos;s seller-intake flow. The message is opened
            in WhatsApp with a prefilled summary — you review it and press Send. Submission is{" "}
            <strong>not verification and not publication</strong>. The owner reviews each proposal
            manually and only publishes approved canonical records.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Listing requirements" id="listing-requirements">
          <div className="space-y-4">
            <LegalItem term="Accurate description">
              Every listing must describe the account or service accurately — level, rank, prime
              status, collections, weapons, region and condition exactly as they are.
            </LegalItem>
            <LegalItem term="Honest media">
              Images and videos must show the actual account or service. Stock, borrowed or
              misleading media is prohibited.
            </LegalItem>
            <LegalItem term="Real evidence">
              Only real evidence states are marked. Do not claim bound email, receipts or recovery
              access unless the account genuinely has them.
            </LegalItem>
            <LegalItem term="Clear pricing">
              Prices must be stated in INR and reflect the real asking price.
            </LegalItem>
          </div>
        </LegalSection>

        <LegalSection heading="Prohibited listings" id="prohibited">
          <div className="space-y-4">
            <LegalItem term="Misrepresentation">
              Listings that fake ownership, status, inventory, prior sales or provenance are
              prohibited.
            </LegalItem>
            <LegalItem term="Credential trading">
              Listings that involve sharing passwords, OTPs or recovery codes as part of the sale
              are prohibited. {siteConfig.safety.neverCollect}
            </LegalItem>
            <LegalItem term="Prohibited items">
              Content that is illegal, abusive, or that violates the rights of others is
              prohibited.
            </LegalItem>
          </div>
        </LegalSection>

        <LegalSection heading="Publishing and review" id="publishing">
          <LegalP>
            Publication is at the owner&apos;s discretion. Approved records are published in the
            canonical data and automatically appear across the marketplace — category pages,
            search, sort, details, wishlist and compare. There is no paid or fast-track
            publication.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Communication" id="communication">
          <LegalP>
            All buyer contact happens directly between you and the buyer on WhatsApp. {siteConfig.name}{" "}
            is not a party to your transactions and does not broker, guarantee or complete them.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Disputes" id="disputes">
          <LegalP>
            The owner may mediate an issue you report, but the platform does not process payments
            and cannot force a refund. Resolve delivery and refund terms with the buyer before the
            trade. See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
              Refund Policy
            </a>{" "}
            for more.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Removal and suspension" id="removal">
          <LegalP>
            Listings that no longer match their description, contain false information, or violate
            this policy may be removed. Repeated violations can lead to suspension from the
            marketplace.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Support" id="support">
          <LegalP>
            Questions about listing, removal or this policy? Contact the owner on{" "}
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
          { name: "Seller Policy", path: "/seller-policy" },
        ]}
      />
    </main>
  );
}
