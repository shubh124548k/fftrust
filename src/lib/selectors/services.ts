/**
 * FF TRUST — Service selectors (Panel Seller + Paid Push), PROMPT 02.
 *
 * Source-parametrized for propagation testing. Same canonical-propagation
 * contract as account selectors. Paid Push never promises guaranteed rank /
 * wins / safety — those claims are structurally impossible to express through
 * these selectors.
 */

import { panelServices, samplePanelServices } from "@/data/panel-services";
import { rankPushPackages, sampleRankPushPackages } from "@/data/paid-push";
import type {
  PanelSellerService,
  PaidPushService,
  RankPushMode,
  ServiceCategory,
  SortKey,
  FeaturedResult,
  PriceBounds,
} from "@/data/types";
import { searchBy, sortByKey, withinPrice, discoverDistinct } from "./filter";

const PANEL_POOL: PanelSellerService[] = [...panelServices, ...samplePanelServices];
const PUSH_POOL: PaidPushService[] = [...rankPushPackages, ...sampleRankPushPackages];

/* ================ PANEL SELLER ================ */

export function getPublishedPanelServices(
  source?: PanelSellerService[],
): PanelSellerService[] {
  const pool = source ?? PANEL_POOL;
  return pool.filter((s) => s.published && !s.demo);
}

export function getSamplePanelServices(
  source?: PanelSellerService[],
): PanelSellerService[] {
  const pool = source ?? PANEL_POOL;
  return pool.filter((s) => s.demo && s.published);
}

export function getFeaturedPanelServices(
  limit = 4,
  source?: PanelSellerService[],
): FeaturedResult<PanelSellerService> {
  const real = getPublishedPanelServices(source).filter((s) => s.featured);
  const realPool = real.length > 0 ? real : getPublishedPanelServices(source);
  if (realPool.length > 0) return { records: realPool.slice(0, limit), isSample: false };
  return { records: getSamplePanelServices(source).slice(0, limit), isSample: true };
}

export function getPanelServiceById(
  id: string,
  source?: PanelSellerService[],
): PanelSellerService | undefined {
  const pool = source ?? PANEL_POOL;
  return pool.find((s) => s.id === id);
}

export interface PanelServiceFilter {
  category?: ServiceCategory | "all";
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export function filterPanelServices(
  f: PanelServiceFilter,
  source?: PanelSellerService[],
): PanelSellerService[] {
  let pool = getPublishedPanelServices(source);
  if (f.category && f.category !== "all") pool = pool.filter((s) => s.category === f.category);
  if (f.tag) pool = pool.filter((s) => s.tags.includes(f.tag!));
  pool = withinPrice(pool, { minPrice: f.minPrice, maxPrice: f.maxPrice });
  pool = searchBy(pool, f.search, (s) => [s.title, s.scope, ...s.tags]);
  return pool;
}

export function sortPanelServices(
  records: PanelSellerService[],
  sort: SortKey,
): PanelSellerService[] {
  return sortByKey(records as (PanelSellerService & { level: number })[], sort) as PanelSellerService[];
}

export function getPanelServiceCategories(source?: PanelSellerService[]): ServiceCategory[] {
  return discoverDistinct(getPublishedPanelServices(source), (s) => s.category);
}

export function getPanelServiceTags(source?: PanelSellerService[]): string[] {
  return discoverDistinct(getPublishedPanelServices(source), (s) => s.tags);
}

export function getPanelServicePriceBounds(source?: PanelSellerService[]): PriceBounds {
  const prices = getPublishedPanelServices(source).map((s) => s.priceInr);
  if (prices.length === 0) return { min: 0, max: 0, count: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}

/* ================ PAID PUSH ================ */

export function getPublishedRankPushPackages(
  source?: PaidPushService[],
): PaidPushService[] {
  const pool = source ?? PUSH_POOL;
  return pool.filter((p) => p.published && !p.demo);
}

export function getSampleRankPushPackages(
  source?: PaidPushService[],
): PaidPushService[] {
  const pool = source ?? PUSH_POOL;
  return pool.filter((p) => p.demo && p.published);
}

export function getFeaturedRankPush(
  limit = 4,
  source?: PaidPushService[],
): FeaturedResult<PaidPushService> {
  const real = getPublishedRankPushPackages(source).filter((p) => p.featured);
  const realPool = real.length > 0 ? real : getPublishedRankPushPackages(source);
  if (realPool.length > 0) return { records: realPool.slice(0, limit), isSample: false };
  return { records: getSampleRankPushPackages(source).slice(0, limit), isSample: true };
}

export function getRankPushById(
  id: string,
  source?: PaidPushService[],
): PaidPushService | undefined {
  const pool = source ?? PUSH_POOL;
  return pool.find((p) => p.id === id);
}

export interface RankPushFilter {
  mode?: RankPushMode | "all";
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export function filterRankPushPackages(
  f: RankPushFilter,
  source?: PaidPushService[],
): PaidPushService[] {
  let pool = getPublishedRankPushPackages(source);
  if (f.mode && f.mode !== "all") pool = pool.filter((p) => p.mode === f.mode);
  if (f.tag) pool = pool.filter((p) => p.tags.includes(f.tag!));
  pool = withinPrice(pool, { minPrice: f.minPrice, maxPrice: f.maxPrice });
  pool = searchBy(pool, f.search, (p) => [p.title, p.scope, p.fromRank, p.toRank, ...p.tags]);
  return pool;
}

export function sortRankPushPackages(
  records: PaidPushService[],
  sort: SortKey,
): PaidPushService[] {
  return sortByKey(records as (PaidPushService & { level: number })[], sort) as PaidPushService[];
}

/** CS / BR mode filters are derived — new modes appear automatically. */
export function getRankPushModes(source?: PaidPushService[]): RankPushMode[] {
  return discoverDistinct(getPublishedRankPushPackages(source), (p) => p.mode);
}

export function getRankPushTags(source?: PaidPushService[]): string[] {
  return discoverDistinct(getPublishedRankPushPackages(source), (p) => p.tags);
}

export function getRankPushPriceBounds(source?: PaidPushService[]): PriceBounds {
  const prices = getPublishedRankPushPackages(source).map((p) => p.priceInr);
  if (prices.length === 0) return { min: 0, max: 0, count: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}

/* ================ AGGREGATE ================ */

export function getRealServiceCount(
  accSource?: PanelSellerService[],
  pushSource?: PaidPushService[],
): number {
  return (
    getPublishedPanelServices(accSource).length +
    getPublishedRankPushPackages(pushSource).length
  );
}
