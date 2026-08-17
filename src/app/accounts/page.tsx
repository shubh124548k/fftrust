import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { PromotionInfoBox } from "@/components/promotion/promotion-info-box";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbListJsonLd } from "@/components/seo/structured-data";

const ExploreCatalogue = dynamic(
  () => import("@/components/explore/explore-catalogue").then((m) => m.ExploreCatalogue),
  { loading: () => <div className="animate-pulse rounded-2xl bg-white/5 h-64" /> },
);

export const metadata: Metadata = pageMetadata({
  title: "Free Fire Account Listings",
  description: `Browse every published Free Fire account listing on ${siteConfig.name}. Sort by price, view details, compare and save favorites. Canonical inventory only — no fake listings.`,
  path: "/accounts",
});

export default function AccountsPage() {
  return (
    <main className="relative pt-28 pb-20 sm:pt-32">
      <div className="container-wide">
        <Breadcrumbs items={[{ label: "Marketplace" }, { label: "Accounts" }]} />
        <Link
          href="/#category-hub"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-azure)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-cyan)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <SectionHeading
          overline="Marketplace — Free Fire"
          title="Free Fire"
          italic="Marketplace"
          support="Browse available Free Fire accounts and find the one that fits you."
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
          { name: "Marketplace", path: "/#category-hub" },
          { name: "Accounts", path: "/accounts" },
        ]}
      />
    </main>
  );
}
