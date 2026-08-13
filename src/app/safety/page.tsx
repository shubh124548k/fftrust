import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { proofContent } from "@/config/proof";
import { getScamCenterContent } from "@/lib/selectors/content";
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
  title: "Buyer Safety",
  description:
    "Buyer safety on FF TRUST — turn on screen recording before you buy, never share passwords or OTPs, and know the scam red flags. The website can never start recording.",
  path: "/safety",
});

export default function SafetyPage() {
  const scam = getScamCenterContent();
  return (
    <main className="relative">
      <div className="container-wide pt-28 sm:pt-32">
        <Breadcrumbs items={[{ label: "Trust & Safety" }, { label: "Buyer Safety" }]} />
      </div>
      <LegalPage
        overline="Trust & Safety"
        title="Buyer"
        italic="safety"
        updated="Last updated: 2026"
        intro={
          <>
            Screen recording is the strongest evidence in any verification or purchase. Before you
            buy an account or service on {siteConfig.name}, turn on screen recording and keep it on
            throughout the complete process. The website cannot start recording — only you can.
          </>
        }
      >
        <LegalSection heading="Keep screen recording ON" id="keep-recording">
          <LegalP>{proofContent.core}</LegalP>
          <div className="space-y-2">
            {proofContent.keepRecording.map((item) => (
              <LegalItem key={item} term="Record">
                {item}
              </LegalItem>
            ))}
          </div>
        </LegalSection>

        <LegalSection heading="What we never ask for" id="never-ask">
          <LegalP>{siteConfig.safety.neverCollect}</LegalP>
          <LegalP>{proofContent.neverSend}</LegalP>
          <div className="space-y-2">
            {proofContent.dontShare.map((item) => (
              <LegalItem key={item} term="Never share">
                {item}
              </LegalItem>
            ))}
          </div>
        </LegalSection>

        <LegalSection heading="Platform limits" id="platform-limits">
          <LegalP>{proofContent.disclaimer}</LegalP>
          <LegalP>{siteConfig.independence}</LegalP>
        </LegalSection>

        <LegalSection heading="Scam red flags" id="scam-red-flags">
          <LegalP>{scam.intro}</LegalP>
          <div className="space-y-2">
            {scam.redFlags.map((flag) => (
              <LegalItem key={flag.key} term={flag.label}>
                {flag.body}
              </LegalItem>
            ))}
          </div>
          <LegalP>{scam.goldenRule}</LegalP>
        </LegalSection>

        <LegalSection heading="Learn more" id="learn-more">
          <LegalP>
            The <a className="underline decoration-[var(--accent-cyan)] underline-offset-2 hover:text-[var(--ink)]" href="/proof">Buyer Proof</a>{" "}
            page explains every step of the evidence flow in detail.
          </LegalP>
        </LegalSection>
      </LegalPage>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Trust & Safety", path: "/#trust" },
          { name: "Buyer Safety", path: "/safety" },
        ]}
      />
    </main>
  );
}
