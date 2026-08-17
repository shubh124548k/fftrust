import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Account Transfer Policy",
  description:
    "How Free Fire account transfers work on FF TRUST: transfers happen between buyer and seller off-platform, and the website does not execute, guarantee or mediate them.",
  path: "/account-transfer-policy",
});

export default function AccountTransferPolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Account Transfer Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Account Transfer Policy"
        title="Account transfer,"
        italic="plainly"
        updated="Last updated: 2026"
        intro={
          <>
            This policy explains how a Free Fire account transfer works. {siteConfig.name} publishes
            canonical records and connects you with the owner on WhatsApp — it never executes,
            guarantees or mediates the transfer itself.
          </>
        }
      >
        <LegalSection heading="Scope" id="scope">
          <LegalP>
            This policy applies to Free Fire account listings on this website. The transfer itself
            happens between you and the seller or owner on WhatsApp or another channel, outside
            this website.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Transfer is between buyer and seller" id="parties">
          <LegalP>
            The website is a directory and trust layer. It does not move accounts, hold login
            details, or take part in delivering the account. Who sends what, when, and how is
            entirely between the two parties.
          </LegalP>
        </LegalSection>

        <LegalSection heading="What a clean transfer looks like" id="clean-transfer">
          <LegalP>
            Before transferring, agree clearly on what is being delivered (for example, the login
            details and any linked email), the price, and the order of actions. Verify the account
            in the official Free Fire client, keep screen recording ON throughout, and never send
            credentials through this website.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Evidence you should keep" id="evidence">
          <LegalP>
            Keep the chat history, the listing reference, any screenshots or recordings shown, and
            the agreed price. If something goes wrong, this evidence is what you can raise with the
            other party.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Risks" id="risks">
          <LegalP>
            {siteConfig.name} does not guarantee transfers. Accounts can be recovered by the
            original holder, Free Fire or Garena may restrict or ban transferred accounts, and
            login details can change after the transfer. Consider these risks before paying.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Never share credentials on the website" id="credentials">
          <LegalP>
            {siteConfig.safety.neverCollect} If a listing or message asks you to send a password,
            OTP or recovery code through the website, stop and report it.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Contact" id="contact">
          <LegalP>
            Questions about account transfers? Contact the owner on{" "}
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
          { name: "Account Transfer Policy", path: "/account-transfer-policy" },
        ]}
      />
    </main>
  );
}
