import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Listing Policy",
  description:
    "Rules for listings on FF TRUST: only accounts and services you genuinely control may be listed, canonical data must be truthful, and submissions are published at the owner's discretion.",
  path: "/listing-policy",
});

export default function ListingPolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Listing Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Listing Policy"
        title="Listing policy,"
        italic="honest"
        updated="Last updated: 2026"
        intro={
          <>
            This policy describes what can be listed on {siteConfig.name} and how listings are
            handled. It applies to every account, service and package published on the site.
          </>
        }
      >
        <LegalSection heading="What can be listed" id="eligible">
          <LegalP>
            Only items that match the site&apos;s categories — Free Fire accounts, panel and
            services listings, paid push packages, and Instagram growth services — and only if you
            genuinely control them or are authorized to sell them.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Accuracy" id="accuracy">
          <LegalP>
            Listing data must be truthful. Stats, evidence, price and mode must reflect reality.
            No fake screenshots, AI-generated proof, edited evidence, or misleading descriptions.
            See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/content-policy">
              Content Policy
            </a>{" "}
            for what content is allowed.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Prohibited listings" id="prohibited">
          <LegalP>
            Stolen or hacked accounts, fraudulent or scam offers, anything that requires sending
            credentials through the website, and misrepresented goods are prohibited. Listing such
            items is grounds for removal.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Verification before publication" id="verification">
          <LegalP>
            Submissions are reviewed by the owner before publication. Verification may include
            live screen sharing and must keep screen recording ON. Publication is at the owner&apos;s
            discretion — not every submission is published, and publication is not an endorsement.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Removal and suspension" id="removal">
          <LegalP>
            The owner may remove or suspend any listing that violates this policy, cannot be
            verified, or is suspected of fraud. Removing a listing does not create any obligation
            or compensation.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Future listings" id="future">
          <LegalP>
            Future listings will follow the same rules: truthful canonical data, real evidence and
            no fabricated proof, sales or verification. See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/seller-policy">
              Seller Policy
            </a>{" "}
            for the full seller requirements.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Contact" id="contact">
          <LegalP>
            Questions about listing rules? Contact the owner on{" "}
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
          { name: "Listing Policy", path: "/listing-policy" },
        ]}
      />
    </main>
  );
}
