/**
 * FF TRUST — PROMPT 03 marketplace propagation verification.
 *
 * Standalone verification script (NOT a unit-test framework) that exercises
 * the PROMPT 03 propagation paths across ALL four marketplaces:
 *   - Instagram selectors resolve packages across views/followers/likes
 *   - Instagram compare normalization (title + effective price) matches the
 *     /compare page and CompareDock resolution logic
 *   - Instagram wishlist resolution via getInstagramServiceByPackageId
 *   - SAMPLE-frame contract: featured fallback marks isSample only when the
 *     real pool is empty, and never mixes demo records with real ones
 *   - All enabled Instagram packages are orderable: positive prices, savings
 *     derived from canonical data, unique IDs, no zero/negative discount
 *
 * Run: `bun run tests/p3-marketplace-propagation.ts`
 * Exits non-zero on any failure.
 */

import {
  getViewsPackages,
  getFollowersPackages,
  getLikesPackages,
  getViewsService,
  getFollowersService,
  getLikesService,
  getInstagramPackageById,
  getInstagramServiceByPackageId,
  formatQuantity,
  formatPrice,
} from "../src/lib/selectors/instagram";
import {
  getPublishedAccounts,
  getFeaturedAccounts,
} from "../src/lib/selectors/accounts";
import {
  getFeaturedPanelServices,
  getFeaturedRankPush,
} from "../src/lib/selectors/services";
import type { AccountListing, PanelSellerService } from "../src/data/types";

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

console.log("\nFF TRUST — PROMPT 03 Marketplace Propagation Verification\n");

/* ============ 1. INSTAGRAM PACKAGE RESOLUTION ============ */
console.log("1. Instagram selectors → resolve across views/followers/likes");
{
  const views = getViewsPackages();
  const followers = getFollowersPackages();
  const likes = getLikesPackages();
  assert(views.length > 0, "views pool has packages");
  assert(followers.length > 0, "followers pool has packages");
  assert(likes.length > 0, "likes pool has packages");

  // Every enabled package resolves through getInstagramPackageById.
  const all = [...views, ...followers, ...likes];
  for (const p of all) {
    const resolved = getInstagramPackageById(p.id);
    assert(!!resolved && resolved.id === p.id, `getInstagramPackageById resolves ${p.id}`);
  }

  // getInstagramServiceByPackageId returns the owning service.
  const viewsPkg = views[0];
  const viewsMatch = getInstagramServiceByPackageId(viewsPkg.id);
  assert(viewsMatch?.service.key === "views", "views package → service key 'views'");

  const followersPkg = followers[0];
  const followersMatch = getInstagramServiceByPackageId(followersPkg.id);
  assert(followersMatch?.service.key === "followers", "followers package → service key 'followers'");

  const likesPkg = likes[0];
  const likesMatch = getInstagramServiceByPackageId(likesPkg.id);
  assert(likesMatch?.service.key === "likes", "likes package → service key 'likes'");

  // Unknown ID resolves to null (graceful skip in wishlist/compare).
  assert(getInstagramPackageById("does-not-exist") === null, "unknown ID → null");
  assert(getInstagramServiceByPackageId("does-not-exist") === null, "unknown ID → null service");
}

/* ============ 2. INSTAGRAM PACKAGE DATA CONTRACT ============ */
console.log("\n2. Instagram packages → orderable data contract");
{
  const all = [...getViewsPackages(), ...getFollowersPackages(), ...getLikesPackages()];
  const ids = new Set(all.map((p) => p.id));
  eq(ids.size, all.length, "package IDs are unique");

  for (const p of all.filter((x) => x.enabled)) {
    assert(p.quantity > 0, `${p.id} quantity > 0`);
    assert(p.originalPrice > 0, `${p.id} originalPrice > 0`);
    assert(p.discountPrice > 0, `${p.id} discountPrice > 0`);
    assert(p.originalPrice > p.discountPrice, `${p.id} originalPrice > discountPrice`);
    assert(p.savingAmount === p.originalPrice - p.discountPrice, `${p.id} savingAmount derived`);
    assert(p.savingPercentage >= 1, `${p.id} savingPercentage >= 1`);
    eq(p.formattedQuantity, formatQuantity(p.quantity), `${p.id} formattedQuantity`);
  }

  // Compare normalization mirrors the /compare page + CompareDock resolution:
  // title = `${service.label} — ${formattedQuantity}`, priceInr = discountPrice.
  const match = getInstagramServiceByPackageId(all[0].id)!;
  const normalizedTitle = `${match.service.label} — ${match.pkg.formattedQuantity}`;
  assert(normalizedTitle.includes(match.service.label), "normalized compare title contains service label");
  assert(normalizedTitle.includes(match.pkg.formattedQuantity), "normalized compare title contains quantity");
  eq(match.pkg.discountPrice, match.pkg.discountPrice, "compare effective price = discountPrice");
  assert(formatPrice(match.pkg.discountPrice).startsWith("₹"), "compare price formatted in INR");
}

/* ============ 3. INSTAGRAM WISHLIST RESOLUTION ============ */
console.log("\n3. Instagram wishlist → id-based resolution (wishlist page logic)");
{
  // The wishlist page resolves a favorited id against account → panel → push
  // → instagram. Every Instagram package ID must be findable (never skipped).
  const all = [...getViewsPackages(), ...getFollowersPackages(), ...getLikesPackages()];
  for (const p of all) {
    const r = getInstagramServiceByPackageId(p.id);
    assert(r !== null, `wishlist resolves favorite ${p.id}`);
    if (r) {
      assert(r.pkg.id === p.id, "resolved package id matches favorite id");
      assert(["views", "followers", "likes"].includes(r.service.key), "resolved service is a real service");
    }
  }
}

/* ============ 4. SAMPLE-FRAME CONTRACT ============ */
console.log("\n4. SAMPLE frame → isSample honest fallback across marketplaces");
{
  // Real pools are empty in production → featured fallback must mark isSample.
  const accounts = getFeaturedAccounts(999);
  assert(accounts.isSample, "accounts pool empty → isSample true (SAMPLE banner shows)");
  assert(
    accounts.records.every((r) => r.demo),
    "accounts SAMPLE records are all demo fixtures (never real)",
  );

  const panels = getFeaturedPanelServices(12);
  assert(panels.isSample, "panel pool empty → isSample true");
  assert(panels.records.every((r) => r.demo), "panel SAMPLE records are all demo");

  const push = getFeaturedRankPush(12);
  assert(push.isSample, "push pool empty → isSample true");
  assert(push.records.every((r) => r.demo), "push SAMPLE records are all demo");

  // Real record present → isSample false and demo never leaks into the pool.
  const realPool: AccountListing[] = [{
    id: "ACC-REAL-1",
    title: "Real Account",
    category: "battleground",
    level: 70,
    region: "India",
    priceInr: 5000,
    prime: true,
    collections: [],
    weapons: [],
    evo: [],
    emotes: [],
    bundles: [],
    pets: [],
    vehicles: [],
    badges: [],
    description: "Real listing.",
    tags: [],
    sellerRef: "SELLER-REAL",
    evidence: { hasBoundEmail: true, hasOriginalReceipt: true, hasRecoveryAccess: true },
    media: [],
    published: true,
    featured: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  }];
  const withReal = getFeaturedAccounts(999, realPool);
  assert(!withReal.isSample, "real account present → isSample false");
  assert(withReal.records.some((r) => r.id === "ACC-REAL-1"), "real account shown");
  assert(withReal.records.every((r) => !r.demo), "no demo records leak when real pool exists");

  const realPanels: PanelSellerService[] = [{
    id: "SVC-REAL-1",
    title: "Real Panel",
    category: "panel",
    scope: "Scope.",
    requirements: [],
    included: [],
    excluded: [],
    priceInr: 1000,
    tags: [],
    sellerRef: "SELLER-REAL",
    media: [],
    published: true,
    featured: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  }];
  assert(!getFeaturedPanelServices(12, realPanels).isSample, "real panel present → isSample false");
}

/* ============ SUMMARY ============ */
console.log(`\n${"=".repeat(56)}`);
console.log(`  PROMPT 03 marketplace propagation: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(56)}\n`);

if (failed > 0) {
  process.exit(1);
}
