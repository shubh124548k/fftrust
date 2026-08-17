import {
  Compass,
  Zap,
  Instagram as InstagramIcon,
  Server,
  Trophy,
  Eye,
  Users,
  Heart,
  Play,
} from "lucide-react";
import { SectionHeading } from "@/components/visual/section-heading";
import { CategoryCard } from "@/components/visual/category-card";
import { getHomepageCatalogueStats } from "@/lib/selectors/catalogue";
import {
  getViewsService,
  getFollowersService,
  getLikesService,
  getViewsPackages,
  getFollowersPackages,
  getLikesPackages,
  formatPrice,
} from "@/lib/selectors/instagram";

/**
 * FF TRUST — Homepage Category Hub (PROMPT 2).
 *
 * Three clearly separated primary marketplaces, built on ONE reusable
 * CategoryCard:
 *   🎮 FREE FIRE          → account marketplace (/accounts)
 *   ⚡ PANELS & SERVICES   → first layer separates PANEL SELLER (/services)
 *                            and PAID PUSH (/paid-push) — no invented
 *                            subcategories
 *   📱 SOCIAL MEDIA        → real Instagram service types (Views / Followers /
 *                            Likes) from canonical data + 🔒 YouTube
 *                            COMING SOON (locked, never a fake link)
 *
 * Every count is data-driven via `getHomepageCatalogueStats()` and the
 * canonical Instagram selectors — never hardcoded. Adding/removing a canonical
 * record updates every card automatically. YouTube renders as a transparent
 * locked row so the gateway never implies a product that does not exist.
 */

export function CategoryHub() {
  const stats = getHomepageCatalogueStats();

  const viewsLabel = getViewsService().label;
  const followersLabel = getFollowersService().label;
  const likesLabel = getLikesService().label;

  const cheapest = (packages: { discountPrice: number }[]) =>
    packages.length > 0 ? `From ${formatPrice(Math.min(...packages.map((p) => p.discountPrice)))}` : "Browse";

  return (
    <section id="category-hub" aria-labelledby="category-hub-title" className="section-ff relative">
      <div className="container-wide">
        <SectionHeading
          overline="01 — Browse"
          title="Three marketplaces,"
          italic="one trust standard"
          support="Free Fire accounts, panels & services, and social media — cleanly separated so you always know where you are. Every count below is derived from the canonical production catalogue — never hardcoded."
          id="category-hub-title"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* 🎮 FREE FIRE — whole-card link to the account marketplace */}
          <CategoryCard
            icon={<Compass className="h-5 w-5" />}
            tone="azure"
            title="Free Fire Accounts"
            description="Real account listings with honest evidence metadata — browse, compare and inquire."
            count={stats.realAccounts}
            countLabel="real accounts"
            href="/accounts"
            ctaLabel="Browse Accounts"
            ariaLabel="Browse the Free Fire accounts marketplace"
          />

          {/* ⚡ PANELS & SERVICES — first layer separates Panel Seller + Paid Push */}
          <CategoryCard
            icon={<Zap className="h-5 w-5" />}
            tone="violet"
            title="Panels & Services"
            description="Panel-seller services and paid-push rank packages — two dedicated marketplaces, clearly separated."
            count={stats.realServices}
            countLabel="real services"
            href="/services"
            ctaLabel="Open Marketplace"
            ariaLabel="Open the panels and services marketplace"
            subItems={[
              {
                key: "panel-seller",
                label: "PANEL SELLER",
                href: "/services",
                icon: <Server className="h-3.5 w-3.5" />,
                hint: `${stats.realPanelServices} real services`,
              },
              {
                key: "paid-push",
                label: "PAID PUSH",
                href: "/paid-push",
                icon: <Trophy className="h-3.5 w-3.5" />,
                hint: `${stats.realPaidPushPackages} real packages`,
              },
            ]}
          />

          {/* 📱 SOCIAL MEDIA — real Instagram service types + YouTube locked */}
          <CategoryCard
            icon={<InstagramIcon className="h-5 w-5" />}
            tone="cyan"
            title="Social Media"
            description="Instagram growth at very low cost — with YouTube arriving soon."
            count={stats.realInstagramPackages}
            countLabel="packages live"
            href="/instagram"
            ctaLabel="Browse Instagram"
            ariaLabel="Open the social media marketplace"
            subItems={[
              {
                key: "instagram-views",
                label: viewsLabel,
                href: "/instagram/views",
                icon: <Eye className="h-3.5 w-3.5" />,
                hint: cheapest(getViewsPackages()),
              },
              {
                key: "instagram-followers",
                label: followersLabel,
                href: "/instagram/followers",
                icon: <Users className="h-3.5 w-3.5" />,
                hint: cheapest(getFollowersPackages()),
              },
              {
                key: "instagram-likes",
                label: likesLabel,
                href: "/instagram/likes",
                icon: <Heart className="h-3.5 w-3.5" />,
                hint: cheapest(getLikesPackages()),
              },
              {
                key: "youtube",
                label: "YouTube",
                icon: <Play className="h-3.5 w-3.5" />,
                comingSoon: true,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
