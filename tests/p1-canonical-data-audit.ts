/**
 * FF TRUST — PROMPT 1 canonical-data architecture audit.
 *
 * Verifies the permanent canonical-data layer behind every FF TRUST category:
 * Accounts, Panel Seller, Paid Push, Instagram Views/Followers/Likes.
 *
 * Checks:
 *  1. Canonical file structure — services.ts split into panel-services.ts +
 *     paid-push.ts; Instagram types live in @/data/types (not views.ts).
 *  2. No duplicate business objects — stable, unique IDs per category.
 *  3. Propagation — price / media / publish-state changes flow through every
 *     category's selectors (source-parametrized for accounts/panel/push;
 *     derived savings for Instagram).
 *  4. WhatsApp number single-sourced — every Instagram data file reads
 *     siteConfig.whatsapp.number; the deep-link builder uses the same value.
 *  5. Media caps + validation — 30-image cap, http/https-only URLs, shared
 *     toListingMediaList / getListingAllImages helpers.
 *  6. Stable IDs — stores look records up by id, never array index.
 *  7. Numeric sort — price sorting is numeric, never formatted strings.
 *  8. Shared transformers — getListingMedia / getListingPrice /
 *     getListingEvidence / getAccountCardData / getAccountDetailsData.
 *
 * Run: `npx tsx tests/p1-canonical-data-audit.ts` (or `bun run`).
 * Exits non-zero on any failure.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { accounts, sampleAccounts } from "../src/data/accounts";
import { panelServices, samplePanelServices } from "../src/data/panel-services";
import { rankPushPackages, sampleRankPushPackages } from "../src/data/paid-push";
import {
  instagramViewsData,
} from "../src/data/instagram/views";
import { instagramFollowersData } from "../src/data/instagram/followers";
import { instagramLikesData } from "../src/data/instagram/likes";
import type {
  AccountListing,
  InstagramPackage,
  InstagramServiceType,
} from "../src/data/types";
import { siteConfig } from "../src/config/site";
import {
  getPublishedAccounts,
  getAccountById,
  getAccountPriceBounds,
  getAccountCategories,
  getListingImages,
  getEvidenceImages,
  sortAccounts,
} from "../src/lib/selectors/accounts";
import {
  getPublishedPanelServices,
  getPanelServiceById,
  getPanelServicePriceBounds,
  getPublishedRankPushPackages,
  getRankPushById,
  getRankPushPriceBounds,
  getRealServiceCount,
} from "../src/lib/selectors/services";
import {
  getViewsPackages,
  getFollowersPackages,
  getLikesPackages,
  getViewsService,
  getFollowersService,
  getLikesService,
  calculateSavings,
  sortInstagramPackages,
  buildWhatsAppUrl,
} from "../src/lib/selectors/instagram";
import {
  getListingMedia,
  getListingPrice,
  getListingEvidence,
  getAccountCardData,
  getAccountDetailsData,
  toListingMediaList,
  getListingAllImages,
} from "../src/lib/selectors/listing";
import { resolveListingMedia } from "../src/lib/media";
import { validateImageUrl } from "../src/lib/validation";

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

/** Unique-IDs check for any id-bearing records. */
function uniqueIds(records: { id: string }[], name: string) {
  const ids = records.map((r) => r.id);
  assert(new Set(ids).size === ids.length, `${name} have unique IDs`);
}

console.log("\nFF TRUST — PROMPT 1 Canonical-Data Architecture Audit\n");

/* ============ 1. CANONICAL FILE STRUCTURE ============ */
console.log("1. Canonical file structure");
{
  const root = path.resolve(__dirname, "..", "src", "data");
  assert(fs.existsSync(path.join(root, "panel-services.ts")), "panel-services.ts exists");
  assert(fs.existsSync(path.join(root, "paid-push.ts")), "paid-push.ts exists");
  assert(!fs.existsSync(path.join(root, "services.ts")), "merged services.ts is gone");
  assert(fs.existsSync(path.join(root, "instagram", "views.ts")), "instagram/views.ts exists");
  assert(fs.existsSync(path.join(root, "instagram", "followers.ts")), "instagram/followers.ts exists");
  assert(fs.existsSync(path.join(root, "instagram", "likes.ts")), "instagram/likes.ts exists");

  // Types moved to @/data/types — importing them here type-checks the move.
  const pkg: InstagramPackage = { id: "t", quantity: 1, originalPrice: 2, discountPrice: 1, enabled: true };
  const svc: InstagramServiceType = { key: "views", label: "T", emoji: "👁", whatsappNumber: "1", packages: [pkg] };
  assert(svc.key === "views", "InstagramServiceType usable from @/data/types");
}

/* ============ 2. NO DUPLICATE BUSINESS OBJECTS ============ */
console.log("2. No duplicate business objects (unique stable IDs)");
{
  uniqueIds(accounts, "real accounts");
  uniqueIds(sampleAccounts, "sample accounts");
  uniqueIds(panelServices, "real panel services");
  uniqueIds(samplePanelServices, "sample panel services");
  uniqueIds(rankPushPackages, "real paid-push packages");
  uniqueIds(sampleRankPushPackages, "sample paid-push packages");
  uniqueIds(instagramViewsData.packages, "Instagram views packages");
  uniqueIds(instagramFollowersData.packages, "Instagram followers packages");
  uniqueIds(instagramLikesData.packages, "Instagram likes packages");

  // IDs never collide ACROSS categories either.
  const allIds = [
    ...accounts, ...sampleAccounts,
    ...panelServices, ...samplePanelServices,
    ...rankPushPackages, ...sampleRankPushPackages,
    ...instagramViewsData.packages,
    ...instagramFollowersData.packages,
    ...instagramLikesData.packages,
  ].map((r) => r.id);
  assert(new Set(allIds).size === allIds.length, "no ID collision across all categories");
}

/* ============ 3. PROPAGATION PER CATEGORY ============ */
console.log("3. Propagation — price / media / publish-state");
{
  // 3a. Accounts — source-parametrized selectors respond to edits.
  const accA: AccountListing = {
    id: "ACC-1001", title: "Heroic", category: "battleground", level: 78, rank: "Heroic",
    region: "India", priceInr: 4200, prime: true, collections: [], weapons: [], evo: [],
    emotes: [], bundles: [], pets: [], vehicles: [], badges: [], tags: ["heroic"],
    sellerRef: "SELLER-001", evidence: { hasBoundEmail: true, hasOriginalReceipt: true, hasRecoveryAccess: false },
    media: [{ kind: "image", url: "/evidence/a.jpg", evidence: true }],
    published: true, featured: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z",
  };
  eq(getAccountPriceBounds([accA]).min, 4200, "edit price → account price bounds update");
  const unpublished = [{ ...accA, published: false }];
  eq(getPublishedAccounts(unpublished).length, 0, "unpublish → account selectors stop exposing");
  eq(getAccountCategories([accA]).length, 1, "new category discovered for accounts");

  // 3b. Panel services. Selectors expose only published && !demo, so fixtures
  // are de-flagged to simulate real inventory edits.
  const realPanel = samplePanelServices.map((s) => ({ ...s, demo: false }));
  eq(getPanelServicePriceBounds(realPanel).count, 2, "panel price bounds count");
  const panelEdit = realPanel.map((s) => ({ ...s, priceInr: 9999 }));
  eq(getPanelServicePriceBounds(panelEdit).min, 9999, "edit price → panel bounds update");
  eq(getPublishedPanelServices(samplePanelServices.map((s) => ({ ...s, published: false }))).length, 0, "unpublish → panel selectors stop exposing");

  // 3c. Paid push.
  const realPush = sampleRankPushPackages.map((p) => ({ ...p, demo: false }));
  eq(getRankPushPriceBounds(realPush).count, 2, "push price bounds count");
  const pushEdit = realPush.map((p) => ({ ...p, priceInr: 5000 }));
  eq(getRankPushPriceBounds(pushEdit).min, 5000, "edit price → push bounds update");
  eq(getPublishedRankPushPackages(sampleRankPushPackages.map((p) => ({ ...p, published: false }))).length, 0, "unpublish → push selectors stop exposing");

  // 3d. Instagram — derived savings always track canonical prices.
  const views = getViewsPackages();
  eq(views.length, instagramViewsData.packages.filter((p) => p.enabled).length, "views package count = enabled canonical count");
  const firstViews = views[0];
  const expected = calculateSavings(instagramViewsData.packages.find((p) => p.id === firstViews.id)!);
  eq({ s: firstViews.savingAmount, p: firstViews.savingPercentage }, { s: expected.savingAmount, p: expected.savingPercentage }, "savings derived from canonical originalPrice/discountPrice");
  assert(views.every((p) => p.savingAmount === p.originalPrice - p.discountPrice), "every views package: saving = original - discount");
  assert(getFollowersPackages().length === instagramFollowersData.packages.filter((p) => p.enabled).length, "followers count = enabled canonical count");
  assert(getLikesPackages().length === instagramLikesData.packages.filter((p) => p.enabled).length, "likes count = enabled canonical count");
}

/* ============ 4. WHATSAPP NUMBER SINGLE-SOURCED ============ */
console.log("4. WhatsApp number single-sourced");
{
  assert(getViewsService().whatsappNumber === siteConfig.whatsapp.number, "views number === siteConfig.whatsapp.number");
  assert(getFollowersService().whatsappNumber === siteConfig.whatsapp.number, "followers number === siteConfig.whatsapp.number");
  assert(getLikesService().whatsappNumber === siteConfig.whatsapp.number, "likes number === siteConfig.whatsapp.number");
  const url = buildWhatsAppUrl(siteConfig.whatsapp.number, "test");
  assert(url.startsWith(`https://api.whatsapp.com/send/?phone=${siteConfig.whatsapp.number}&text=`), "instagram WhatsApp URL uses canonical number");
  assert(siteConfig.whatsapp.autoSendClaim === false, "never auto-send");
}

/* ============ 5. MEDIA CAPS + VALIDATION ============ */
console.log("5. Media caps + validation");
{
  const big = new Array(50).fill(0).map((_, i) => ({ kind: "image" as const, url: `https://img.example/${i}.jpg` }));
  const listing = {
    frontImage: "https://img.example/front.jpg",
    galleryImages: big.map((m) => m.url),
    media: big,
  };
  const resolved = resolveListingMedia(listing, "T");
  assert(resolved.galleryImages.length <= 30, "gallery capped at MAX_LISTING_IMAGES (30)");
  eq(resolved.galleryImages.length, 30, "30 images retained");

  // Validation rejects dangerous schemes.
  const evil = resolveListingMedia({ frontImage: "javascript:alert(1)", media: [] }, "T");
  eq(evil.frontImage, null, "javascript: frontImage rejected");
  eq(validateImageUrl("data:text/html;base64,AAAA"), null, "data: URL rejected");
  eq(validateImageUrl("https://ok.example/a.jpg"), "https://ok.example/a.jpg", "https URL accepted");

  // toListingMediaList reproduces front + gallery + video + legacy order.
  const built = toListingMediaList({
    frontImage: "https://img.example/f.jpg",
    galleryImages: ["https://img.example/g1.jpg", "https://img.example/g2.jpg"],
    videoUrl: "https://youtu.be/abc",
    media: [{ kind: "image", url: "https://img.example/legacy.jpg" }],
  }, "T");
  eq(built.length, 5, "toListingMediaList = front + 2 gallery + video + legacy");
  assert(built[0].kind === "image" && built[0].url === "https://img.example/f.jpg", "front first");
  assert(built[3].kind === "video", "video third");
  assert(built[4].url === "https://img.example/legacy.jpg", "legacy media last");

  // getListingAllImages dedupes + caps.
  const all = getListingAllImages({
    frontImage: "https://img.example/f.jpg",
    galleryImages: ["https://img.example/f.jpg", "https://img.example/g1.jpg", ...big.map((m) => m.url)],
  }, "T");
  assert(all.length <= 30, "getListingAllImages capped at 30");
  eq(all.filter((u) => u === "https://img.example/f.jpg").length, 1, "front image deduplicated");
}

/* ============ 6. STABLE IDS (NO INDEX-BASED IDENTITY) ============ */
console.log("6. Stable IDs — id-keyed lookup everywhere");
{
  assert(getAccountById("SAMPLE-ACC-001")?.id === "SAMPLE-ACC-001", "account lookup by id");
  assert(getPanelServiceById("SAMPLE-SVC-PANEL-001")?.id === "SAMPLE-SVC-PANEL-001", "panel lookup by id");
  assert(getRankPushById("SAMPLE-PUSH-CS-001")?.id === "SAMPLE-PUSH-CS-001", "push lookup by id");
  const v = instagramViewsData.packages[0];
  assert(getViewsPackages().some((p) => p.id === v.id), "instagram package lookup by id");
}

/* ============ 7. NUMERIC SORT ============ */
console.log("7. Numeric sort (never formatted strings)");
{
  const sorted = sortAccounts([...sampleAccounts], "price-asc");
  for (let i = 1; i < sorted.length; i++) {
    assert(sorted[i - 1].priceInr <= sorted[i].priceInr, `accounts price-asc monotonic at ${i}`);
  }
  const desc = sortAccounts([...sampleAccounts], "price-desc");
  for (let i = 1; i < desc.length; i++) {
    assert(desc[i - 1].priceInr >= desc[i].priceInr, `accounts price-desc monotonic at ${i}`);
  }
  const igAsc = sortInstagramPackages([...getViewsPackages()], "price-asc");
  for (let i = 1; i < igAsc.length; i++) {
    assert(igAsc[i - 1].discountPrice <= igAsc[i].discountPrice, `instagram price-asc monotonic at ${i}`);
  }
  const igDesc = sortInstagramPackages([...getViewsPackages()], "price-desc");
  for (let i = 1; i < igDesc.length; i++) {
    assert(igDesc[i - 1].discountPrice >= igDesc[i].discountPrice, `instagram price-desc monotonic at ${i}`);
  }
}

/* ============ 8. SHARED TRANSFORMERS ============ */
console.log("8. Shared listing transformers");
{
  const rec = sampleAccounts[0];
  const card = getAccountCardData(rec);
  assert(card.price === rec.priceInr, "getAccountCardData price = priceInr");
  assert(card.media.frontImage === rec.frontImage, "getAccountCardData front image resolved");
  assert(card.allImages.length >= 1, "getAccountCardData allImages populated");
  assert(card.evidence === rec.evidence, "getAccountCardData evidence attached");
  assert(card.isFeatured === (!!rec.featured && !rec.demo), "getAccountCardData featured flag");

  const det = getAccountDetailsData(rec);
  assert(det.mediaList.length >= 1, "getAccountDetailsData mediaList built");
  eq(det.price, rec.priceInr, "getAccountDetailsData price");
  assert(det.evidence === rec.evidence, "getAccountDetailsData evidence");

  assert(getListingMedia(rec, rec.title).frontImage === rec.frontImage, "getListingMedia resolves front image");
  assert(getListingPrice(rec) === rec.priceInr, "getListingPrice = priceInr");
  assert(getListingEvidence(rec) === rec.evidence, "getListingEvidence returns account evidence");

  // getListingMedia is generic across listing kinds (panel + push). Both
  // sample fixtures carry canonical media incl. videoUrl (video-below-gallery).
  assert(getListingMedia(samplePanelServices[0], "T").frontImage !== null, "getListingMedia works for panel (media resolved)");
  assert(getListingMedia(sampleRankPushPackages[0], "T").frontImage !== null, "getListingMedia works for push (media resolved)");
  assert(getListingMedia(samplePanelServices[0], "T").videoUrl !== null, "getListingMedia resolves panel videoUrl");
  assert(getListingMedia(sampleRankPushPackages[0], "T").videoUrl !== null, "getListingMedia resolves push videoUrl");

  // Legacy helpers still read evidence images.
  eq(getEvidenceImages(accWithMedia()).length, 1, "getEvidenceImages only evidence images");
  eq(getListingImages(accWithMedia()).length, 2, "getListingImages = all image URLs (evidence + decorative)");
  function accWithMedia(): AccountListing {
    return {
      id: "ACC-M", title: "M", category: "starter", level: 1, region: "India", priceInr: 100,
      tags: [], sellerRef: "S", evidence: { hasBoundEmail: false, hasOriginalReceipt: false, hasRecoveryAccess: false },
      media: [{ kind: "image", url: "/e.jpg", evidence: true }, { kind: "image", url: "/d.jpg" }],
      published: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z",
    };
  }
}

/* ============ 9. REAL / SAMPLE ISOLATION CONTRACT ============ */
console.log("9. REAL/SAMPLE isolation contract");
{
  assert(accounts.length === 0, "real accounts empty (owner publishes)");
  assert(panelServices.length === 0, "real panel services empty");
  assert(rankPushPackages.length === 0, "real push packages empty");
  assert(sampleAccounts.every((a) => a.demo && a.id.startsWith("SAMPLE-")), "sample accounts all demo + SAMPLE- prefixed");
  assert(getRealServiceCount() === 0, "getRealServiceCount = 0 (no real services)");
}

/* ============ SUMMARY ============ */
console.log(`\n${"=".repeat(56)}`);
console.log(`  P1 canonical-data audit: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(56)}\n`);

if (failed > 0) {
  process.exit(1);
}
