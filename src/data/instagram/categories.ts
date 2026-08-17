/**
 * FF TRUST — Canonical Instagram category metadata (hub tiles).
 *
 * ONE source of truth for the Instagram category hub (/instagram):
 *   • Views, Followers, Likes  → live, link to their real catalogue routes
 *   • YouTube                  → coming-soon, LOCKED (never a fake link)
 *
 * Counts and "from" prices are NOT stored here — the hub derives them from the
 * canonical package data via selectors, so adding/removing a package updates
 * every tile automatically.
 */

import type { InstagramCategoryMeta } from "@/data/types";

export const instagramCategories: InstagramCategoryMeta[] = [
  {
    key: "views",
    label: "Instagram Views",
    shortLabel: "Views",
    emoji: "👁",
    iconKey: "Eye",
    href: "/instagram/views",
    description: "Instagram Views at very low cost — from 500 to 500,000 views with clear INR pricing.",
    status: "live",
    unit: "packages",
  },
  {
    key: "followers",
    label: "Instagram Followers",
    shortLabel: "Followers",
    emoji: "📈",
    iconKey: "Users",
    href: "/instagram/followers",
    description: "Grow your audience with Instagram Followers packages at transparent prices.",
    status: "live",
    unit: "packages",
  },
  {
    key: "likes",
    label: "Instagram Likes",
    shortLabel: "Likes",
    emoji: "❤️",
    iconKey: "Heart",
    href: "/instagram/likes",
    description: "Instagram Likes packages — boost engagement with honest pricing.",
    status: "live",
    unit: "packages",
  },
  {
    key: "youtube",
    label: "YouTube",
    shortLabel: "YouTube",
    emoji: "▶️",
    iconKey: "Play",
    description: "YouTube growth services — locked until real availability is confirmed.",
    status: "coming-soon",
    unit: "videos",
  },
];
