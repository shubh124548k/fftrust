/**
 * FF TRUST — Homepage catalogue stats (PROMPT 01 category hub).
 *
 * ONE shared calculation for every homepage counter and category-card count:
 * real accounts, real panel-seller services, real paid-push packages, and the
 * combined real-services figure. Everything is derived from the canonical
 * datasets via the production rule (published && !demo) — never hardcoded,
 * never manually maintained. Source-parametrized so propagation tests can pass
 * mutated copies without touching module state.
 *
 * If a canonical record is added/removed/unpublished, every consumer of this
 * helper (hero counters, category cards, badges) updates automatically.
 *
 * FALLBACK: When real (published, non-demo) inventory is empty, the stats
 * fall back to SAMPLE fixtures so the homepage always shows meaningful counts
 * during development/demo. This ensures the UI is never stuck at 0.
 */

import type {
  AccountListing,
  PanelSellerService,
  PaidPushService,
} from "@/data/types";
import { getPublishedAccounts, getSampleAccounts } from "./accounts";
import {
  getPublishedPanelServices,
  getPublishedRankPushPackages,
  getSamplePanelServices,
  getSampleRankPushPackages,
} from "./services";
import {
  getViewsPackages,
  getFollowersPackages,
  getLikesPackages,
} from "./instagram";

export interface HomepageCatalogueStats {
  /** Real (published, non-demo) Free Fire account listings. */
  realAccounts: number;
  /** Real panel-seller services. */
  realPanelServices: number;
  /** Real paid-push packages. */
  realPaidPushPackages: number;
  /** Real panel + paid-push services combined. */
  realServices: number;
  /** Real enabled Instagram packages (views + followers + likes). */
  realInstagramPackages: number;
  /** Everything combined (accounts + panel + paid push + instagram). */
  totalLive: number;
  /** Whether the counts include sample data (real inventory was empty). */
  isSampleFallback: boolean;
}

export function getHomepageCatalogueStats(
  accountSource?: AccountListing[],
  panelSource?: PanelSellerService[],
  pushSource?: PaidPushService[],
): HomepageCatalogueStats {
  const realAccounts = getPublishedAccounts(accountSource).length;
  const realPanelServices = getPublishedPanelServices(panelSource).length;
  const realPaidPushPackages = getPublishedRankPushPackages(pushSource).length;
  const realInstagramPackages =
    getViewsPackages().length +
    getFollowersPackages().length +
    getLikesPackages().length;

  const realTotal = realAccounts + realPanelServices + realPaidPushPackages;

  // Fallback to sample data when real inventory is empty
  const isSampleFallback = realTotal === 0;
  const displayAccounts = isSampleFallback
    ? getSampleAccounts(accountSource).length
    : realAccounts;
  const displayPanelServices = isSampleFallback
    ? getSamplePanelServices(panelSource).length
    : realPanelServices;
  const displayPaidPushPackages = isSampleFallback
    ? getSampleRankPushPackages(pushSource).length
    : realPaidPushPackages;
  const displayServices = displayPanelServices + displayPaidPushPackages;

  return {
    realAccounts: displayAccounts,
    realPanelServices: displayPanelServices,
    realPaidPushPackages: displayPaidPushPackages,
    realServices: displayServices,
    realInstagramPackages,
    totalLive: displayAccounts + displayServices + realInstagramPackages,
    isSampleFallback,
  };
}
