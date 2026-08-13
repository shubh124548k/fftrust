import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { ExploreCatalogue } from "@/components/explore/explore-catalogue";
import { PromotionInfoBox } from "@/components/promotion/promotion-info-box";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Free Fire Account Listings",
  description: `Browse every published Free Fire account listing on ${siteConfig.name}. Sort by price, view details, compare and save favorites. Canonical inventory only — no fake listings.`,
  path: "/accounts",
});

export default function AccountsPage() {
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Catalogue" }, { label: "Accounts" }]} />
        <Link
          href="/#explore"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <SectionHeading
          overline="Full Catalogue — Accounts"
          title="Free Fire account"
          italic="listings"
          support="Every published Free Fire account listing in the canonical catalogue. Values are derived from real published records — no fake popularity, ratings or reviews. Sort by price, compare and heart the ones you like."
          id="accounts-title"
        />

        <div className="mt-10">
          <ExploreCatalogue />
        </div>

        <div className="mt-14">
          <PromotionInfoBox />
        </div>
      </div>
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Catalogue", path: "/#explore" },
          { name: "Accounts", path: "/accounts" },
        ]}
      />
    </main>
  );
}
