/**
 * FF TRUST — Canonical data propagation verification (PROMPT 02).
 *
 * A standalone verification script (NOT a unit-test framework) that exercises
 * every propagation path required by PROMPT 02:
 *   - add record → counts / categories / price bounds update
 *   - edit price → price bounds + WhatsApp message update
 *   - edit media → media helpers update
 *   - edit level / rank / Prime → filters + discovery update
 *   - edit tags → tag discovery + filter update
 *   - edit category → category discovery update
 *   - unpublish → public selectors stop exposing
 *   - new service → service count + category + WhatsApp update
 *   - WhatsApp config → encoding reflects public fields + safety
 *
 * Run: `bun run tests/propagation-verify.ts`
 * Exits non-zero on any failure. Prints a PASS/FAIL summary.
 *
 * Selectors are source-parametrized so we pass mutated in-memory copies
 * without touching module state — proving the propagation contract.
 */

import {
  getPublishedAccounts,
  getFeaturedAccounts,
  getAccountById,
  getAccountPriceBounds,
  getRealAccountCount,
  getAccountCategories,
  getAccountTags,
  getAccountRanks,
  filterAccounts,
  searchAccounts,
  getRelatedAccounts,
  getEvidenceImages,
  getListingImages,
} from "../src/lib/selectors/accounts";
import {
  getPublishedPanelServices,
  getFeaturedPanelServices,
  getPanelServiceById,
  getPanelServiceCategories,
  getPanelServicePriceBounds,
  getRealServiceCount,
  getPublishedRankPushPackages,
  getFeaturedRankPush,
  getRankPushModes,
  filterRankPushPackages,
} from "../src/lib/selectors/services";
import { buildWhatsAppMessage } from "../src/lib/whatsapp";
import { getHomepageCatalogueStats } from "../src/lib/selectors/catalogue";
import {
  getViewsPackages,
  getFollowersPackages,
  getLikesPackages,
} from "../src/lib/selectors/instagram";
import { siteConfig } from "../src/config/site";
import { z, DEPTH_LEVELS } from "../src/lib/design/depth";
import { LIGHTING_PRESETS, LIGHTING_LABEL } from "../src/lib/design/lighting";
import type {
  AccountListing,
  PanelSellerService,
  PaidPushService,
} from "../src/data/types";

let passed = 0;
let failed = 0;

function assert(cond: boolean, name: string, detail?: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`);
  }
}

function eq<T>(actual: T, expected: T, name: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  assert(ok, name, ok ? undefined : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

/** Clone a record with partial overrides (simulates owner edit). */
function patch<T extends object>(base: T, over: Partial<T>): T {
  return { ...base, ...over };
}

// Seed fixtures for mutation scenarios (real, non-demo).
const accA: AccountListing = {
  id: "ACC-1001",
  title: "Heroic Account — Full Collection",
  category: "battleground",
  level: 78,
  rank: "Heroic",
  region: "India",
  priceInr: 4200,
  prime: true,
  collections: ["Anime Bundle"],
  weapons: ["AK — Dragon"],
  evo: ["M1014 — Dragon"],
  emotes: ["Top Up"],
  bundles: ["Anime Bundle"],
  pets: ["Falcon"],
  vehicles: ["Sports Car"],
  badges: ["Elite"],
  description: "Heroic-tier account.",
  tags: ["heroic", "anime-bundle"],
  sellerRef: "SELLER-001",
  evidence: { hasBoundEmail: true, hasOriginalReceipt: true, hasRecoveryAccess: false },
  media: [
    { kind: "image", url: "/evidence/acc-1001/1.jpg", evidence: true, alt: "Inventory 1" },
    { kind: "image", url: "/evidence/acc-1001/2.jpg", evidence: true, alt: "Inventory 2" },
    { kind: "video", url: "/evidence/acc-1001/walkthrough.mp4" },
  ],
  terms: "Transfer terms apply.",
  published: true,
  featured: true,
  createdAt: "2025-02-01T00:00:00Z",
  updatedAt: "2025-02-01T00:00:00Z",
};

const accB: AccountListing = {
  id: "ACC-1002",
  title: "Starter Account",
  category: "starter",
  level: 40,
  rank: "Diamond",
  region: "India",
  priceInr: 1200,
  prime: false,
  collections: [],
  weapons: ["M1887 — Default"],
  evo: [],
  emotes: [],
  bundles: [],
  pets: [],
  vehicles: [],
  badges: ["Diamond"],
  description: "Clean starter account at an entry price.",
  tags: ["diamond", "starter"],
  sellerRef: "SELLER-001",
  evidence: { hasBoundEmail: true, hasOriginalReceipt: false, hasRecoveryAccess: false },
  media: [],
  terms: "Starter transfer terms.",
  published: true,
  featured: false,
  createdAt: "2025-02-02T00:00:00Z",
  updatedAt: "2025-02-02T00:00:00Z",
};

const svcPanel: PanelSellerService = {
  id: "SVC-PANEL-001",
  title: "Diamond Panel (Streaming)",
  category: "panel",
  scope: "Read-only streaming panel access.",
  requirements: ["Screen recording ON"],
  included: ["Temporary view access"],
  excluded: ["Credential sharing"],
  priceInr: 900,
  tags: ["panel", "streaming"],
  sellerRef: "SELLER-001",
  media: [],
  published: true,
  featured: true,
  createdAt: "2025-02-01T00:00:00Z",
  updatedAt: "2025-02-01T00:00:00Z",
};

const pushCS: PaidPushService = {
  id: "PUSH-CS-001",
  mode: "CS",
  title: "CS Rank Push · Gold IV → Heroic",
  fromRank: "Gold IV",
  toRank: "Heroic",
  packageTier: "Standard",
  scope: "Scope & effort only.",
  requirements: ["Screen recording ON"],
  priceInr: 1200,
  tags: ["cs", "rank-push"],
  sellerRef: "SELLER-001",
  media: [],
  published: true,
  featured: true,
  createdAt: "2025-02-01T00:00:00Z",
  updatedAt: "2025-02-01T00:00:00Z",
};

const pushBR: PaidPushService = {
  ...pushCS,
  id: "PUSH-BR-001",
  mode: "BR",
  title: "BR Rank Push · Diamond → Grandmaster",
  fromRank: "Diamond",
  toRank: "Grandmaster",
  priceInr: 2100,
  tags: ["br", "rank-push"],
  featured: false,
};

console.log("\nFF TRUST — Canonical Propagation Verification (PROMPT 02)\n");

/* ============ 1. ADD RECORD ============ */
console.log("1. Add record → counts / categories / price bounds");
{
  const empty: AccountListing[] = [];
  eq(getRealAccountCount(empty), 0, "empty source → 0 real accounts");
  eq(getAccountPriceBounds(empty).count, 0, "empty source → 0 price count");

  const withOne = [accA];
  eq(getRealAccountCount(withOne), 1, "1 record → count 1");
  eq(getAccountPriceBounds(withOne).min, 4200, "price bounds min = 4200");
  eq(getAccountPriceBounds(withOne).max, 4200, "price bounds max = 4200");
  eq(getAccountCategories(withOne).length, 1, "1 category discovered");
  assert(getAccountCategories(withOne).includes("battleground"), "category = battleground");

  const withTwo = [accA, accB];
  eq(getRealAccountCount(withTwo), 2, "2 records → count 2");
  eq(getAccountPriceBounds(withTwo).min, 1200, "min = 1200 (accB)");
  eq(getAccountPriceBounds(withTwo).max, 4200, "max = 4200 (accA)");
  eq(getAccountCategories(withTwo).length, 2, "2 categories discovered");
}

/* ============ 2. EDIT PRICE ============ */
console.log("\n2. Edit price → price bounds + WhatsApp update");
{
  const edited = [patch(accA, { priceInr: 5000 })];
  eq(getAccountPriceBounds(edited).min, 5000, "edited price → bounds update");
  const wa = buildWhatsAppMessage({
    id: accA.id,
    title: accA.title,
    price: 5000,
    buyer: true,
  });
  assert(wa.includes("₹5000 INR"), "WhatsApp message reflects new price");
  assert(wa.includes("TURN ON SCREEN RECORDING"), "buyer WhatsApp has recording reminder");
}

/* ============ 3. EDIT MEDIA ============ */
console.log("\n3. Edit media → media helpers update");
{
  const a = getAccountById("ACC-1001", [accA])!;
  eq(getEvidenceImages(a).length, 2, "2 evidence images");
  eq(getListingImages(a).length, 2, "2 listing images (video excluded)");
  const edited = patch(accA, {
    media: [...accA.media, { kind: "image", url: "/evidence/acc-1001/3.jpg", evidence: true }],
  });
  const a2 = getAccountById("ACC-1001", [edited])!;
  eq(getEvidenceImages(a2).length, 3, "added media → 3 evidence images");
}

/* ============ 4. EDIT LEVEL / RANK / PRIME ============ */
console.log("\n4. Edit level / rank / Prime → filters + discovery update");
{
  const edited = [patch(accA, { level: 60, rank: "Diamond", prime: false })];
  eq(getAccountRanks(edited).length, 1, "1 rank discovered");
  assert(getAccountRanks(edited).includes("Diamond"), "rank = Diamond");
  const primeFilter = filterAccounts({ prime: true }, edited);
  eq(primeFilter.length, 0, "prime=true filter excludes non-prime");
  const levelFilter = filterAccounts({ minLevel: 70 }, [accA, accB]);
  eq(levelFilter.length, 1, "minLevel 70 → 1 result (accA)");
}

/* ============ 5. EDIT TAGS ============ */
console.log("\n5. Edit tags → tag discovery + filter update");
{
  const edited = [patch(accA, { tags: ["heroic", "rare-evo"] })];
  const tags = getAccountTags(edited);
  assert(tags.includes("rare-evo"), "new tag discovered");
  assert(!tags.includes("anime-bundle"), "removed tag gone");
  const byTag = filterAccounts({ tag: "rare-evo" }, edited);
  eq(byTag.length, 1, "tag filter finds edited record");
}

/* ============ 6. EDIT CATEGORY ============ */
console.log("\n6. Edit category → category discovery update");
{
  const edited = [patch(accA, { category: "collection" })];
  const cats = getAccountCategories(edited);
  assert(cats.includes("collection") && !cats.includes("battleground"), "category swap discovered");
}

/* ============ 7. UNPUBLISH ============ */
console.log("\n7. Unpublish → public selectors stop exposing");
{
  const unpublished = [patch(accA, { published: false }), accB];
  eq(getRealAccountCount(unpublished), 1, "unpublished → count drops to 1");
  eq(getPublishedAccounts(unpublished).length, 1, "getPublished excludes unpublished");
  const featured = getFeaturedAccounts(6, unpublished);
  eq(featured.records.length, 1, "featured excludes unpublished");
  assert(!featured.records.find((r) => r.id === "ACC-1001"), "ACC-1001 not in featured");
}

/* ============ 8. SEARCH ============ */
console.log("\n8. Search → multi-field");
{
  const pool = [accA, accB];
  eq(searchAccounts("heroic", pool).length, 1, "search 'heroic' → 1");
  eq(searchAccounts("dragon", pool).length, 1, "search 'dragon' (weapon) → 1");
  eq(searchAccounts("", pool).length, 2, "empty search → all");
}

/* ============ 9. RELATED ============ */
console.log("\n9. Related content → shared category/tags");
{
  const pool = [accA, accB, { ...accA, id: "ACC-1003", title: "Another Heroic", featured: false }];
  const rel = getRelatedAccounts("ACC-1001", 4, pool);
  assert(rel.length > 0, "related accounts found");
  assert(rel.every((r) => r.id !== "ACC-1001"), "related excludes source");
}

/* ============ 10. NEW SERVICE (Panel Seller) ============ */
console.log("\n10. New Panel Seller service → count + category + price bounds");
{
  const empty: PanelSellerService[] = [];
  eq(getPublishedPanelServices(empty).length, 0, "empty → 0 services");
  const withOne = [svcPanel];
  eq(getPanelServicePriceBounds(withOne).count, 1, "1 service → price count 1");
  assert(getPanelServiceCategories(withOne).includes("panel"), "service category discovered");
  const featured = getFeaturedPanelServices(4, withOne);
  assert(!featured.isSample, "real service → not sample");
}

/* ============ 11. NEW SERVICE (Paid Push) + MODE DISCOVERY ============ */
console.log("\n11. New Paid Push service → mode discovery + filter");
{
  const pool = [pushCS, pushBR];
  const modes = getRankPushModes(pool);
  eq(modes.length, 2, "2 modes discovered (CS + BR)");
  assert(modes.includes("CS") && modes.includes("BR"), "CS + BR modes present");
  const csOnly = filterRankPushPackages({ mode: "CS" }, pool);
  eq(csOnly.length, 1, "CS filter → 1");
  eq(getRealServiceCount([svcPanel], pool), 3, "total services = 1 panel + 2 push");
}

/* ============ 11b. HOMEPAGE CATALOGUE STATS (shared calculation) ============ */
console.log("\n11b. Homepage catalogue stats → one shared calculation");
{
  const igPackages =
    getViewsPackages().length +
    getFollowersPackages().length +
    getLikesPackages().length;
  const stats = getHomepageCatalogueStats([accA, accB], [svcPanel], [pushCS, pushBR]);
  eq(stats.realAccounts, 2, "realAccounts = 2");
  eq(stats.realPanelServices, 1, "realPanelServices = 1");
  eq(stats.realPaidPushPackages, 2, "realPaidPushPackages = 2");
  eq(stats.realServices, 3, "realServices = panel + push = 3");
  eq(stats.totalLive, 5 + igPackages, "totalLive = 2 + 1 + 2 + instagram packages");

  const unpublish = getHomepageCatalogueStats(
    [patch(accA, { published: false }), accB],
    [svcPanel],
    [pushCS, pushBR],
  );
  eq(unpublish.realAccounts, 1, "unpublish account → realAccounts drops to 1");
  eq(unpublish.realServices, 3, "unpublish account → services unchanged");
  eq(unpublish.totalLive, 4 + igPackages, "unpublish account → totalLive = 4 + instagram");

  const empty = getHomepageCatalogueStats();
  eq(empty.realAccounts, 0, "canonical pools empty → realAccounts 0");
  eq(empty.realServices, 0, "canonical pools empty → realServices 0");
  eq(empty.totalLive, igPackages, "canonical pools empty → totalLive = instagram only");
}

/* ============ 12. WHATSAPP CONFIG ============ */
console.log("\n12. WhatsApp config → public fields + safety");
{
  const wa = buildWhatsAppMessage({
    id: "ACC-1001",
    title: "Heroic Account",
    price: 4200,
    mode: "CS Rank Push · Gold IV → Heroic",
    sellerRef: "SELLER-001",
    inquiry: "Interested.",
    buyer: true,
  });
  assert(wa.includes("Ref: ACC-1001"), "WhatsApp has ref");
  assert(wa.includes("Item: Heroic Account"), "WhatsApp has title");
  assert(wa.includes("₹4200 INR"), "WhatsApp has price");
  assert(wa.includes("Seller ref: SELLER-001"), "WhatsApp has seller ref");
  assert(wa.includes("Package: CS Rank Push"), "WhatsApp has package/mode");
  assert(wa.includes("TURN ON SCREEN RECORDING"), "WhatsApp has buyer safety");
  assert(wa.includes("independent platform"), "WhatsApp has independence note");
  assert(siteConfig.whatsapp.autoSendClaim === false, "autoSendClaim is false (never auto-send)");
}

/* ============ 13. FEATURED FLAG INDEPENDENCE ============ */
console.log("\n13. Featured flag independent of published");
{
  const pool = [patch(accA, { featured: false }), accB];
  const featured = getFeaturedAccounts(6, pool);
  // featured empty → falls back to all published
  eq(featured.records.length, 2, "no featured → falls back to all published");
}

/* ============ 14. RENDERING ENGINE (Depth API + Lighting) ============ */
console.log("\n14. Rendering engine — depth API + lighting presets");
{
  // Depth API resolves every semantic level to a number.
  eq(DEPTH_LEVELS.length, 12, "12 depth levels defined");

  // Monotonic ordering: background < atmosphere < … < foreground < nav < modal.
  assert(z("bg") < z("atmosphere"), "bg < atmosphere");
  assert(z("atmosphere") < z("particles"), "atmosphere < particles");
  assert(z("particles") < z("midgroundObject"), "particles < midgroundObject");
  assert(z("midgroundObject") < z("glassPlane"), "midgroundObject < glassPlane");
  assert(z("glassPlane") < z("foregroundUI"), "glassPlane < foregroundUI");
  assert(z("foregroundUI") < z("nav"), "foregroundUI < nav");
  assert(z("nav") < z("modal"), "nav < modal");

  // Tier 0 flattens negative layers toward 0 (cheaper compositing, less overlap).
  assert(z("atmosphere", 0) === 0, "tier 0 flattens atmosphere to 0");
  assert(z("particles", 0) === 0, "tier 0 flattens particles to 0");
  assert(z("foregroundUI", 0) === z("foregroundUI", 2), "tier 0 keeps foreground stack");

  // Lighting presets: all required presets exist with labels.
  const required = ["hero", "catalogue", "showroom", "dossier", "trust", "safety", "legal", "default"] as const;
  for (const p of required) {
    assert(LIGHTING_PRESETS.includes(p), `lighting preset "${p}" exists`);
    assert(typeof LIGHTING_LABEL[p] === "string", `lighting preset "${p}" has label`);
  }
}

/* ============ SUMMARY ============ */
console.log(`\n${"=".repeat(56)}`);
console.log(`  Propagation verification: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(56)}\n`);

if (failed > 0) {
  process.exit(1);
}
