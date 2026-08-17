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
  title: "Free Fire Account Policy",
  description:
    "How Free Fire account listings work on FF TRUST — accurate account information, required media, buyer and seller responsibilities, and transfer guidance.",
  path: "/free-fire-policy",
});

export default function FreeFirePolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Free Fire Account Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Marketplace Policy"
        title="Free Fire account"
        italic="policy"
        updated="Last updated: 2026"
        intro={
          <>
            {siteConfig.name} is an independent marketplace for Free Fire account listings. This
            policy explains how account listings are published and what buyers and sellers are
            responsible for.
          </>
        }
      >
        <LegalSection heading="Independent marketplace" id="independent">
          <LegalP>{siteConfig.independence}</LegalP>
          <LegalP>
            This is an independent, third-party listing platform. It is not an official Garena or
            Free Fire marketplace, and it cannot guarantee that any account transfer is permitted
            by Free Fire&apos;s own terms of service.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Listing requirements" id="listing-requirements">
          <div className="space-y-4">
            <LegalItem term="Accurate account information">
              Level, rank, prime status, collections, weapons, evolutions, region and condition
              must be stated exactly as they are.
            </LegalItem>
            <LegalItem term="Required media">
              Listings should include real screenshots or video of the account. Media must show the
              actual account, not stock or borrowed content.
            </LegalItem>
            <LegalItem term="Real evidence state">
              Bound email, original receipt and recovery-access labels are only marked when the
              account genuinely has them. Labels reflect the evidence state on file — they are not
              a guarantee.
            </LegalItem>
          </div>
        </LegalSection>

        <LegalSection heading="Seller responsibility" id="seller-responsibility">
          <LegalP>
            The seller must be the legitimate owner of the account, describe it accurately, show
            real evidence, and hand over the agreed details only after the buyer&apos;s payment is
            confirmed on the terms both parties agreed.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Buyer responsibility" id="buyer-responsibility">
          <LegalP>
            Buyers are responsible for protecting themselves. Before paying, follow the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/safety">
              Buyer Safety
            </a>{" "}
            guidance: turn on screen recording, verify the listing through the canonical buttons,
            and keep the chat history and listing reference. Never share your password, OTP or
            recovery codes.
          </LegalP>
          <LegalP>{siteConfig.safety.neverCollect}</LegalP>
        </LegalSection>

        <LegalSection heading="Account transfer" id="transfer">
          <LegalP>
            Account transfers happen directly between buyer and seller on WhatsApp or another
            channel. {siteConfig.name} does not hold accounts, does not perform transfers and
            cannot verify whether any specific transfer is allowed by Free Fire. Buyers should be
            aware that game-account trading may violate the game&apos;s terms, and the game can
            change at any time.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Prohibited misrepresentation" id="misrepresentation">
          <LegalP>
            Faking ownership, evidence, prior sales, verification status or account details is
            prohibited and leads to listing removal and suspension.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Disputes" id="disputes">
          <LegalP>
            The owner may mediate a reported dispute, but the platform does not process payments
            and cannot issue refunds. Delivery and refund terms are between buyer and seller — see
            the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
              Refund Policy
            </a>
            .
          </LegalP>
        </LegalSection>

        <LegalSection heading="Support" id="support">
          <LegalP>
            Questions about an account listing or this policy? Contact the owner on{" "}
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
          { name: "Free Fire Account Policy", path: "/free-fire-policy" },
        ]}
      />
    </main>
  );
}
