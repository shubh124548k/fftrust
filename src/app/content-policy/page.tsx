import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, LegalSection, LegalP } from "@/components/legal/legal-page";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Content Policy",
  description:
    "What content is allowed on FF TRUST: honest evidence only, no fake or AI-generated proof, no misleading claims, no impersonation and no credential harvesting.",
  path: "/content-policy",
});

export default function ContentPolicyPage() {
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Legal" }, { label: "Content Policy" }]} />
      </div>
      <LegalPage
        overline="Legal · Content Policy"
        title="Content,"
        italic="kept honest"
        updated="Last updated: 2026"
        intro={
          <>
            {siteConfig.name} publishes canonical records. This policy sets the rules for all
            content shown on the site — text, images, videos and captions.
          </>
        }
      >
        <LegalSection heading="What this policy covers" id="scope">
          <LegalP>
            It applies to listing text, screenshots, recordings, captions, metadata and any other
            content published on this website.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Honest evidence only" id="honest-evidence">
          <LegalP>
            Evidence must be real. No fake screenshots, AI-generated images or videos, edited
            proof, or anything presented as genuine when it is not. Screen recordings must show the
            real state of the account or service.
          </LegalP>
        </LegalSection>

        <LegalSection heading="No misleading claims" id="misleading">
          <LegalP>
            No fabricated stats, fake ratings, invented &quot;verified&quot; labels, or false
            availability. Labels reflect the real canonical evidence state on file — nothing more.
          </LegalP>
        </LegalSection>

        <LegalSection heading="No impersonation" id="impersonation">
          <LegalP>
            Content must not impersonate Garena, Free Fire, Instagram, other brands, or other
            users. Trade names are used only to describe the subject matter of listings.
          </LegalP>
        </LegalSection>

        <LegalSection heading="No credential harvesting" id="credentials">
          <LegalP>
            {siteConfig.safety.neverCollect} Content that asks for passwords, OTPs, recovery codes
            or payment details through this website is prohibited.
          </LegalP>
        </LegalSection>

        <LegalSection heading="No illegal or harmful content" id="illegal">
          <LegalP>
            Illegal, defamatory, harassing, or harmful content is prohibited and may be removed
            without notice.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Moderation" id="moderation">
          <LegalP>
            The owner may remove any content that violates this policy. Removal is at the
            owner&apos;s discretion and does not create any obligation or compensation.
          </LegalP>
        </LegalSection>

        <LegalSection heading="Contact" id="contact">
          <LegalP>
            To report content you believe violates this policy, contact the owner on{" "}
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
          { name: "Content Policy", path: "/content-policy" },
        ]}
      />
    </main>
  );
}
