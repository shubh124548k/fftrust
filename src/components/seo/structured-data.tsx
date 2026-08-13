import { siteConfig } from "@/config/site";

/**
 * FF TRUST — JSON-LD Structured Data (PROMPT 14).
 *
 * Truthful structured data for search engines. Only includes fields that are
 * factually true — no fake ratings, reviews, or verification claims.
 */

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.shortDescription,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.brandLogo}`,
    slogan: siteConfig.tagline,
    knowsAbout: [
      "Free Fire account trading",
      "account trust and provenance",
      "buyer safety",
      "panel seller services",
      "rank push packages",
    ],
    disclaimer: siteConfig.independence,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.shortDescription,
    inLanguage: siteConfig.locale,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function FaqJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Truthful BreadcrumbList — mirrors the visible Breadcrumbs trail. */
export function BreadcrumbListJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${siteConfig.url}${item.path}`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
