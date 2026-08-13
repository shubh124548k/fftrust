import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LegalPage, LegalSection, LegalP, LegalItem } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How FF TRUST handles your information — frontend-only platform, no credential collection, no analytics, no payments processed on the website.",
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Privacy Policy" }]} />
      </div>
      <LegalPage
      overline="Privacy Policy"
      title="Privacy, handled"
      italic="honestly"
      updated="Last updated: 2026"
      intro={
        <>
          This page describes how {siteConfig.name} handles information. The short version: this
          website is a frontend-only platform. It does not create accounts, does not store your
          messages, does not run analytics and does not process payments.
        </>
      }
    >
      <LegalSection heading="What this website is" id="what-this-is">
        <LegalP>
          {siteConfig.name} is an independent, frontend-only platform that displays canonical
          account-trust records and lets you reach the owner on WhatsApp. The website has no paid
          backend, no user accounts and no payment checkout.
        </LegalP>
        <LegalP>{siteConfig.independence}</LegalP>
      </LegalSection>

      <LegalSection heading="Information you type" id="information-you-type">
        <LegalP>
          When you fill the order or seller-intake forms, the details you enter are used only to
          build a prefilled WhatsApp message in your browser. You review the message and press
          Send yourself — the website never sends automatically and never uploads your input to a
          server.
        </LegalP>
        <LegalP>
          Once the message leaves your browser, it is handled by WhatsApp under WhatsApp&apos;s own
          terms and privacy policy, which we do not control.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Local browser storage" id="local-storage">
        <LegalP>
          Your saved listings (wishlist) and comparison selections are stored only in your own
          browser&apos;s local storage. They are not sent to any server and are cleared when you
          clear your browser data.
        </LegalP>
      </LegalSection>

      <LegalSection heading="What we never collect" id="never-collect">
        <LegalP>{siteConfig.safety.neverCollect}</LegalP>
        <div className="space-y-4">
          <LegalItem term="No credentials">
            Passwords, OTPs and recovery codes are never requested, never stored and never
            transmitted by this website.
          </LegalItem>
          <LegalItem term="No payment details">
            The website has no checkout. Card numbers, UPI PINs or wallet credentials are never
            collected here.
          </LegalItem>
          <LegalItem term="No analytics">
            This website does not load analytics, advertising or tracking scripts and sets no
            tracking cookies.
          </LegalItem>
        </div>
      </LegalSection>

      <LegalSection heading="External links" id="external-links">
        <LegalP>
          WhatsApp, Instagram and Free Fire are external services. When you follow links to them,
          their own terms and privacy policies apply.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Children" id="children">
        <LegalP>
          This website is not directed at children under 13 and is not intended for users under the
          minimum age required to use Free Fire in their region.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Changes to this policy" id="changes">
        <LegalP>
          If this page changes, the &quot;Last updated&quot; date above is revised. Continued use of
          the website after changes means you accept the updated policy.
        </LegalP>
      </LegalSection>

      <LegalSection heading="Contact" id="contact">
        <LegalP>
          For privacy questions, contact the owner on WhatsApp using the site&apos;s canonical
          contact button — it targets {siteConfig.whatsapp.number} and never sends automatically.
        </LegalP>
      </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Legal", path: "/#legal" },
          { name: "Privacy Policy", path: "/privacy" },
        ]}
      />
    </main>
  );
}
