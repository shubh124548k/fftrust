import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "How to get support on FF TRUST: contact the owner on WhatsApp for questions about listings, transactions or the site itself.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Support" }]} />
      </div>
      <LegalPage
        overline="Support"
        title="Get support,"
        italic="directly"
        updated="Last updated: 2026"
        intro={
          <>
            {siteConfig.name} is an independent platform run by its owner. Here is how to get help
            with the site, with a listing, or with a transaction.
          </>
        }
      >
        <LegalSection heading="How to reach us" id="reach">
          <LegalP>
            The fastest way to reach the owner is on{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/contact">
              the Contact page
            </a>
            , which opens WhatsApp with a prefilled message — you press Send. The website never
            sends messages automatically.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Questions about a listing" id="listing">
          <LegalP>
            Use the WhatsApp button on the listing itself. Keep the listing reference, the price
            shown, and the evidence you saw so the owner can look it up quickly.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Transaction issues" id="transaction">
          <LegalP>
            Transactions happen off-platform. If something went wrong, keep screen recording, the
            chat history and the agreed price. See the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/refund-policy">
              Refund Policy
            </a>{" "}
            for how refund issues are handled.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Technical issues with the site" id="site">
          <LegalP>
            If a page fails or behaves unexpectedly, tell us which page you were on and what
            happened. The site processes no payments and holds no account credentials, so no
            sensitive information should ever be sent in a support message.
          </LegalP>
        </LegalSection>

        <LegalSection heading="What we cannot help with" id="no-help">
          <LegalP>
            We cannot intervene in Garena or Free Fire account bans, disputes with third-party
            service providers, or payment-provider disputes. Those are outside the website&apos;s
            control.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Response expectations" id="expectations">
          <LegalP>
            The site is owner-run, so replies may take time. There is no 24/7 or guaranteed
            response time. For common questions, check the{" "}
            <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/#faq">
              FAQ
            </a>{" "}
            on the homepage.
          </LegalP>
        </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Support", path: "/support" },
        ]}
      />
    </main>
  );
}
