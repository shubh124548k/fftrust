import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Purchase Policy",
  description:
    "How purchases work on FF TRUST: the website processes no payments and has no checkout. Purchases are agreed off-platform between you and the seller or owner on WhatsApp.",
  path: "/purchase-policy",
});

export default function PurchasePolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Purchase Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Purchase Policy"
        title="How purchases"
        italic="work"
        updated="Last updated: 2026"
        intro={
          <>
            This policy is plain on purpose. {siteConfig.name} never handles money and has no
            checkout. Here is exactly how a purchase happens, and what this website does and does
            not do in that process.
          </>
        }
      >
        <LegalSection heading="No checkout on this website" id="no-checkout">
          <LegalP>
            There is no payment button, no cart, and no price-collection on this website. Money
            never moves through {siteConfig.name}. You cannot &quot;buy&quot; anything here — the
            site connects you with the owner on WhatsApp.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Purchases happen off-platform" id="off-platform">
          <LegalP>
            A purchase is an agreement made directly between you and the seller or owner on
            WhatsApp or another channel. That agreement — not this website — sets the price,
            delivery terms and any refund terms.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Before you pay" id="before-you-pay">
          <LegalP>
            Before you send money to anyone, follow the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/safety">
              Buyer Safety
            </a>{" "}
            guidance: turn on screen recording, verify the listing through the site&apos;s canonical
            buttons, read the evidence shown, confirm the price and what is being delivered, and
            keep the chat history.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Never send credentials" id="credentials">
          <LegalP>
            {siteConfig.safety.neverCollect} If anyone asks you to send a password, OTP or recovery
            code through this website or in chat, treat it as a scam red flag and stop.
          </LegalP>
        </LegalSection>

        <LegalSection heading="What this website does and does not do" id="what-we-do">
          <LegalP>
            {siteConfig.name} publishes canonical records and connects you with the owner on
            WhatsApp. It does not broker transactions, hold funds, guarantee delivery, mediate
            disputes, or process payments.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Refunds and disputes" id="refunds">
          <LegalP>
            Because this website does not process payments, it cannot issue refunds. Refund and
            dispute issues are governed by your off-platform agreement. See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
              Refund Policy
            </a>{" "}
            for details.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Contact" id="contact">
          <LegalP>
            Questions about this policy? Contact the owner on{" "}
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
          { name: "Purchase Policy", path: "/purchase-policy" },
        ]}
      />
    </main>
  );
}
