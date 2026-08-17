/**
 * FF TRUST — Account selectors (PROMPT 02 production).
 *
 * The single bridge between canonical account records and every consumer
 * (Home featured, Explore grid, Search, Filters, Sort, Cards, Detail, Gallery,
 * Video, Compare, Favorites, Price Guide, related content, metadata, WhatsApp).
 *
 * Source-parametrized: every selector accepts an optional `source` array so
 * propagation tests can pass mutated copies without touching module state.
 * Defaults to the canonical `accounts` + `sampleAccounts` pool.
 *
 * REAL-DATA CONTRACT: production consumers see ONLY `published && !demo`.
 * SAMPLE fixtures are accessed via dedicated selectors and always rendered
 * inside a clearly-labeled SAMPLE frame.
 *
 * FUTURE-PROOFING: categories, tags, ranks, regions are discovered dynamically
 * — adding a record with a new value requires no edit to filter UI.
 */

import { accounts, sampleAccounts } from "@/data/accounts";
import type {
  AccountListing,
  AccountCategory,
  SortKey,
  FeaturedResult,
  PriceBounds,
} from "@/data/types";
import {
  searchBy,
  sortByKey,
  withinPrice,
  withinLevel,
  discoverDistinct,
} from "./filter";

export type AccountSortKey = SortKey;

export interface AccountFilter {
  category?: AccountCategory | "all";
  tag?: string;
  prime?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minLevel?: number;
  maxLevel?: number;
  rank?: string;
  search?: string;
  collection?: string;
  weapon?: string;
  evo?: string;
  /** "featured" filter — show only featured records. */
  featured?: boolean;
}

const DEFAULT_POOL: AccountListing[] = [...accounts, ...sampleAccounts];

/* ---------------- Publication gating ---------------- */

/** Production inventory — published, non-demo only. */
export function getPublishedAccounts(source?: AccountListing[]): AccountListing[] {
  const pool = source ?? DEFAULT_POOL;
  return pool.filter((a) => a.published && !a.demo);
}

/** SAMPLE fixtures — constitution demonstration only. */
export function getSampleAccounts(source?: AccountListing[]): AccountListing[] {
  const pool = source ?? DEFAULT_POOL;
  return pool.filter((a) => a.demo && a.published);
}

/** Featured set — real published+featured first; falls back to SAMPLE when real
 *  inventory is empty (so a section never shows a fake-populated grid). */
export function getFeaturedAccounts(
  limit = 6,
  source?: AccountListing[],
): FeaturedResult<AccountListing> {
  const real = getPublishedAccounts(source).filter((a) => a.featured);
  const realPool = real.length > 0 ? real : getPublishedAccounts(source);
  if (realPool.length > 0) {
    return { records: realPool.slice(0, limit), isSample: false };
  }
  return { records: getSampleAccounts(source).slice(0, limit), isSample: true };
}

export function getAccountById(id: string, source?: AccountListing[]): AccountListing | undefined {
  const pool = source ?? DEFAULT_POOL;
  return pool.find((a) => a.id === id);
}

/* ---------------- Search / Filter / Sort ---------------- */

/** Full-text search across title, description, tags, weapons, collections. */
export function searchAccounts(
  query: string,
  source?: AccountListing[],
): AccountListing[] {
  const pool = source ?? getPublishedAccounts();
  return searchBy(pool, query, (a) => [
    a.title,
    a.description ?? "",
    a.rank ?? "",
    a.region,
    ...a.tags,
    ...(a.collections ?? []),
    ...(a.weapons ?? []),
    ...(a.bundles ?? []),
  ]);
}

/** Apply a compound filter to accounts. Uses provided source directly;
 *  falls back to published accounts when no source is given. */
export function filterAccounts(
  f: AccountFilter,
  source?: AccountListing[],
): AccountListing[] {
  let pool = source ?? getPublishedAccounts();
  if (f.category && f.category !== "all") pool = pool.filter((a) => a.category === f.category);
  if (f.tag) pool = pool.filter((a) => a.tags.includes(f.tag!));
  if (typeof f.prime === "boolean") pool = pool.filter((a) => !!a.prime === f.prime);
  if (f.rank) pool = pool.filter((a) => a.rank === f.rank);
  if (f.collection) pool = pool.filter((a) => (a.collections ?? []).includes(f.collection!));
  if (f.weapon) pool = pool.filter((a) => (a.weapons ?? []).includes(f.weapon!));
  if (f.evo) pool = pool.filter((a) => (a.evo ?? []).includes(f.evo!));
  if (f.featured) pool = pool.filter((a) => a.featured);
  pool = withinPrice(pool, { minPrice: f.minPrice, maxPrice: f.maxPrice });
  pool = withinLevel(pool, { minLevel: f.minLevel, maxLevel: f.maxLevel });
  pool = searchBy(pool, f.search, (a) => [
    a.title,
    a.description ?? "",
    ...a.tags,
    ...(a.collections ?? []),
    ...(a.weapons ?? []),
    ...(a.evo ?? []),
  ]);
  return pool;
}

export function sortAccounts(
  records: AccountListing[],
  sort: AccountSortKey,
): AccountListing[] {
  return sortByKey(records, sort);
}

/* ---------------- Dynamic discovery ---------------- */

export function getAccountCategories(source?: AccountListing[]): AccountCategory[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.category);
}

export function getAccountTags(source?: AccountListing[]): string[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.tags);
}

export function getAccountRanks(source?: AccountListing[]): string[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.rank);
}

export function getAccountRegions(source?: AccountListing[]): string[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.region);
}

/** Discover distinct collection names across accounts. */
export function getAccountCollections(source?: AccountListing[]): string[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.collections ?? []);
}

/** Discover distinct weapon names across accounts. */
export function getAccountWeapons(source?: AccountListing[]): string[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.weapons ?? []);
}

/** Discover distinct Evo names across accounts. */
export function getAccountEvo(source?: AccountListing[]): string[] {
  return discoverDistinct(source ?? getPublishedAccounts(), (a) => a.evo ?? []);
}

/* ---------------- Derived aggregates ---------------- */

/** Price bounds for the Price Guide — derived from real published data only. */
export function getAccountPriceBounds(source?: AccountListing[]): PriceBounds {
  const pool = source ?? getPublishedAccounts();
  const prices = pool.map((a) => a.priceInr);
  if (prices.length === 0) return { min: 0, max: 0, count: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}

/** Honest count for nav/badges — real inventory only. */
export function getRealAccountCount(source?: AccountListing[]): number {
  return getPublishedAccounts(source).length;
}

/* ---------------- Related content ---------------- */

/** Related listings by shared category / tags, excluding the source id. */
export function getRelatedAccounts(
  id: string,
  limit = 4,
  source?: AccountListing[],
): AccountListing[] {
  const pool = source ?? getPublishedAccounts();
  const ref = pool.find((a) => a.id === id);
  if (!ref) return [];
  return pool
    .filter((a) => a.id !== id)
    .map((a) => {
      let score = 0;
      if (a.category === ref.category) score += 3;
      score += a.tags.filter((t) => ref.tags.includes(t)).length;
      if (a.rank === ref.rank) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a);
}

/* ---------------- Media helpers ---------------- */

/** Evidence images only (canonical real media, not decorative). */
export function getEvidenceImages(a: AccountListing): string[] {
  return a.media.filter((m) => m.kind === "image" && m.evidence).map((m) => m.url);
}

/** All image URLs (evidence + decorative), capped at MAX_LISTING_IMAGES. */
export function getListingImages(a: AccountListing): string[] {
  return a.media
    .filter((m) => m.kind === "image")
    .slice(0, 30)
    .map((m) => m.url);
}

/** Video URLs (may be empty). */
export function getListingVideos(a: AccountListing): string[] {
  return a.media.filter((m) => m.kind === "video").map((m) => m.url);
}

/* ---------------- Shareable URL state ---------------- */

/**
 * Serialize an AccountFilter + sort to a query string for shareable state on
 * the /accounts catalogue page. Omits undefined/empty values so the URL stays
 * clean. Format:
 * ?q=heroic&cat=battleground&prime=1&sort=price-asc&min=1000&max=5000
 */
export function serializeFilterState(
  f: AccountFilter,
  sort: AccountSortKey,
): string {
  const params = new URLSearchParams();
  if (f.search) params.set("q", f.search);
  if (f.category && f.category !== "all") params.set("cat", f.category);
  if (typeof f.prime === "boolean") params.set("prime", f.prime ? "1" : "0");
  if (f.featured) params.set("featured", "1");
  if (f.rank) params.set("rank", f.rank);
  if (f.tag) params.set("tag", f.tag);
  if (f.collection) params.set("coll", f.collection);
  if (f.weapon) params.set("wpn", f.weapon);
  if (f.evo) params.set("evo", f.evo);
  if (typeof f.minPrice === "number") params.set("min", String(f.minPrice));
  if (typeof f.maxPrice === "number") params.set("max", String(f.maxPrice));
  if (typeof f.minLevel === "number") params.set("lvl", String(f.minLevel));
  if (sort !== "newest") params.set("sort", sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Parse a URL hash back into an AccountFilter + sort. */
export function parseFilterState(hash: string): { filter: AccountFilter; sort: AccountSortKey } {
  const q = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
  const params = new URLSearchParams(q);
  const filter: AccountFilter = {};
  if (params.get("q")) filter.search = params.get("q")!;
  if (params.get("cat")) filter.category = params.get("cat") as AccountCategory;
  if (params.get("prime")) filter.prime = params.get("prime") === "1";
  if (params.get("featured")) filter.featured = params.get("featured") === "1";
  if (params.get("rank")) filter.rank = params.get("rank")!;
  if (params.get("tag")) filter.tag = params.get("tag")!;
  if (params.get("coll")) filter.collection = params.get("coll")!;
  if (params.get("wpn")) filter.weapon = params.get("wpn")!;
  if (params.get("evo")) filter.evo = params.get("evo")!;
  if (params.get("min")) filter.minPrice = Number(params.get("min"));
  if (params.get("max")) filter.maxPrice = Number(params.get("max"));
  if (params.get("lvl")) filter.minLevel = Number(params.get("lvl"));
  const sort = (params.get("sort") as AccountSortKey) || "newest";
  return { filter, sort };
}
