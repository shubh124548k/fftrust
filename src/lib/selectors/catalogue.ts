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
 */

import type {
  AccountListing,
  PanelSellerService,
  PaidPushService,
} from "@/data/types";
import { getPublishedAccounts } from "./accounts";
import {
  getPublishedPanelServices,
  getPublishedRankPushPackages,
} from "./services";

export interface HomepageCatalogueStats {
  /** Real (published, non-demo) Free Fire account listings. */
  realAccounts: number;
  /** Real panel-seller services. */
  realPanelServices: number;
  /** Real paid-push packages. */
  realPaidPushPackages: number;
  /** Real panel + paid-push services combined. */
  realServices: number;
  /** Everything combined (accounts + panel + paid push). */
  totalLive: number;
}

export function getHomepageCatalogueStats(
  accountSource?: AccountListing[],
  panelSource?: PanelSellerService[],
  pushSource?: PaidPushService[],
): HomepageCatalogueStats {
  const realAccounts = getPublishedAccounts(accountSource).length;
  const realPanelServices = getPublishedPanelServices(panelSource).length;
  const realPaidPushPackages = getPublishedRankPushPackages(pushSource).length;
  return {
    realAccounts,
    realPanelServices,
    realPaidPushPackages,
    realServices: realPanelServices + realPaidPushPackages,
    totalLive: realAccounts + realPanelServices + realPaidPushPackages,
  };
}
