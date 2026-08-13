/**
 * FF TRUST — Navigation map (derived from canonical modules data).
 *
 * `primaryNav`, `servicesNav`, `safetyNav`, `systemNav` and `footerGroups`
 * derive from `src/data/modules.ts` by `surface` so adding a module propagates
 * to header + services dropdown + mobile command center + footer + sitemap
 * automatically — no per-component edits (future-proofing contract).
 */

import { modules } from "@/data/modules";
import type { ModuleDefinition, ModuleStatus } from "@/data/types";

export type NavItem = {
  key: string;
  label: string;
  href: string;
  anchor?: string;
  description?: string;
  status?: ModuleStatus;
  iconKey?: string;
  surface?: ModuleDefinition["surface"];
};

function toNavItem(m: ModuleDefinition): NavItem {
  return {
    key: m.key,
    label: m.label,
    href: m.href,
    anchor: m.anchor,
    description: m.description,
    status: m.status,
    iconKey: m.iconKey,
    surface: m.surface,
  };
}

const liveSorted = modules
  .filter((m) => m.status === "live")
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map(toNavItem);

/** Primary top-level links (desktop bar). */
export const primaryNav: NavItem[] = liveSorted.filter((n) => n.surface === "primary");

/** Wishlist nav item — dedicated page, not in modules.ts (utility route). */
export const wishlistNav: NavItem = {
  key: "wishlist",
  label: "Wishlist",
  href: "/wishlist",
  description: "Your saved listings",
  iconKey: "Heart",
  surface: "primary",
};

/** Instagram nav item — dropdown with Views, Followers, Likes sub-items. */
export const instagramNav: NavItem = {
  key: "instagram",
  label: "Instagram",
  href: "/instagram/views",
  description: "Instagram growth services",
  iconKey: "Instagram",
  surface: "primary",
};

export const instagramSubNav: NavItem[] = [
  {
    key: "instagram-views",
    label: "Views",
    href: "/instagram/views",
    description: "Instagram Views",
    iconKey: "Eye",
    surface: "primary" as ModuleDefinition["surface"],
  },
  {
    key: "instagram-followers",
    label: "Followers",
    href: "/instagram/followers",
    description: "Instagram Followers",
    iconKey: "Users",
    surface: "primary" as ModuleDefinition["surface"],
  },
  {
    key: "instagram-likes",
    label: "Likes",
    href: "/instagram/likes",
    description: "Instagram Likes",
    iconKey: "Heart",
    surface: "primary" as ModuleDefinition["surface"],
  },
];

/** Services/Marketplace dropdown (Panel Seller + Paid Push + future services). */
export const servicesNav: NavItem[] = liveSorted.filter((n) => n.surface === "services");

/** Safety cluster (Trust + Buyer Safety). */
export const safetyNav: NavItem[] = liveSorted.filter((n) => n.surface === "safety");

/** System/utility links (FAQ, About, Legal, Contact). */
export const systemNav: NavItem[] = liveSorted.filter((n) => n.surface === "system");

/** All live nav items (for mobile command center). */
export const allNav: NavItem[] = liveSorted;

/** Footer link groups — derived from the same canonical module map by surface. */
export const footerGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Marketplace",
    items: [...primaryNav.filter((n) => n.key !== "home"), ...servicesNav],
  },
  {
    title: "Trust & Safety",
    items: safetyNav,
  },
  {
    title: "Platform",
    items: systemNav,
  },
];
