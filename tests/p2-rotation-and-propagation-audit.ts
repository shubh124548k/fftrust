/**
 * FF TRUST — PROMPT 3 rotation logic + data/media propagation audit.
 *
 * Standalone verification (not a unit-test framework), run with:
 *   npx tsx tests/p2-rotation-and-propagation-audit.ts
 *
 * Covers:
 *   - buildRotationWindows determinism + window rules (2/3/4/6/10 pools, no
 *     in-window duplicates, windows wrap, union = pool)
 *   - buildRotationPages back-compat page-slicing helper still works
 *   - data propagation: price edit → sort order, window membership, WhatsApp
 *   - media propagation: image / gallery / video URL edits → helpers everywhere
 *   - id-stability: favorite/compare identity survives rotation windows
 *   - live canonical counts: accounts=3, panel=2, push=2 → MULTIPLE windows,
 *     so every homepage section now visibly rotates every 5s (PROMPT 3)
 */

import {
  getFeaturedAccounts,
  sortAccounts,
  getAccountById,
  getListingImages,
  getListingVideos,
  getEvidenceImages,
} from "../src/lib/selectors/accounts";
import {
  getFeaturedPanelServices,
  getFeaturedRankPush,
} from "../src/lib/selectors/services";
import {
  buildRotationWindows,
  buildRotationPages,
  shouldAutoRotate,
  ROTATION_PAGE_SIZE,
} from "../src/lib/rotation";
import { buildWhatsAppMessage } from "../src/lib/whatsapp";
import type { AccountListing } from "../src/data/types";

let passed = 0;
let failed = 0;

function assert(cond: boolean, name: string, detail?: string) {
  if (cond) {
    passed++;
    console.log(`  \u2713 ${name}`);
  } else {
    failed++;
    console.log(`  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`);
  }
}

function eq<T>(actual: T, expected: T, name: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  assert(ok, name, ok ? undefined : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function patch<T extends object>(base: T, over: Partial<T>): T {
  return { ...base, ...over };
}

function ids(records: readonly { id: string }[]): string[] {
  return records.map((r) => r.id);
}

// Synthetic fixtures (distinct ids) so rotation actually rotates.
const base: AccountListing = {
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
  evo: [],
  emotes: [],
  bundles: [],
  pets: [],
  vehicles: [],
  badges: [],
  description: "Heroic-tier account.",
  tags: ["heroic"],
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

function make(id: string, priceInr: number, over: Partial<AccountListing> = {}): AccountListing {
  return patch({ ...base, id, priceInr }, over);
}

const A = make("ACC-1001", 7800);
const B = make("ACC-1002", 4200);
const C = make("ACC-1003", 1500);
const D = make("ACC-1004", 990);
const E = make("ACC-1005", 640);
const F = make("ACC-1006", 320);

console.log("\nFF TRUST — PROMPT 3 rotation logic + propagation audit\n");

/* ============ 1. buildRotationWindows rules ============ */
console.log("1. buildRotationWindows — deterministic sliding windows (step 1, wrap)");
{
  eq(buildRotationWindows([]), [], "0 records → no windows");
  eq(buildRotationWindows([A]).length, 1, "1 record → 1 window (cannot rotate one card)");
  eq(buildRotationWindows([A, B]).length, 2, "2 records → 2 windows");
  eq(buildRotationWindows([A, B])[0], [A, B], "window 0 = [A,B]");
  eq(buildRotationWindows([A, B])[1], [B, A], "window 1 = [B,A] (visible swap)");

  const three = buildRotationWindows([A, B, C]);
  eq(three.length, 3, "3 records → 3 windows (visible reorder loop)");
  eq(three[0], [A, B, C], "window 0 = [A,B,C]");
  eq(three[1], [B, C, A], "window 1 = [B,C,A]");
  eq(three[2], [C, A, B], "window 2 = [C,A,B]");

  const four = buildRotationWindows([A, B, C, D]);
  eq(four.length, 4, "4 records → 4 windows");
  eq(four[0], [A, B, C], "window 0 = first 3");
  eq(four[1], [B, C, D], "window 1 slides by one (D replaces A)");
  assert(ids(four[0]).every((id) => !ids(four[0]).filter((x) => x === id).slice(1).length), "no duplicate listing inside a window");

  const five = buildRotationWindows([A, B, C, D, E]);
  eq(five.length, 5, "5 records → 5 windows");
  eq(five[0], [A, B, C], "5-window window 0 = [A,B,C]");
  eq(five[4], [E, A, B], "last window wraps [E,A,B]");
  for (const w of five) {
    assert(new Set(ids(w)).size === ids(w).length, `window ${ids(w).join(",")} has unique ids`);
    assert(ids(w).length === 3, `window ${ids(w).join(",")} has 3 cards`);
  }
  const union5 = new Set(five.flat().map((r) => r.id));
  eq(union5.size, 5, "union of all windows = full pool (5)");

  const ten = buildRotationWindows([...Array.from({ length: 10 }, (_, i) => make(`ACC-2${i}`, 1000 + i))]);
  eq(ten.length, 10, "10 records → 10 windows");
  assert(ten.every((w) => w.length === 3), "every window shows 3 cards");
  assert(ten.every((w) => new Set(ids(w)).size === 3), "no in-window duplicate across all 10");

  const r1 = buildRotationWindows([A, B, C, D]);
  const r2 = buildRotationWindows([A, B, C, D]);
  eq(ids(r1[0]), ids(r2[0]), "deterministic — same input, same windows");

  assert(!shouldAutoRotate(1), "1 window → no rotation");
  assert(!shouldAutoRotate(0), "0 windows → no rotation");
  assert(shouldAutoRotate(2), "2 windows → rotation");
  assert(shouldAutoRotate(3), "3 windows → rotation");
  eq(ROTATION_PAGE_SIZE, 3, "window size = 3 (rotation contract)");

  // Back-compat: buildRotationPages still slices strict non-overlapping pages.
  eq(buildRotationPages([A, B, C]).length, 1, "back-compat pages: 3 records → 1 page");
  eq(buildRotationPages([A, B, C, D]).length, 2, "back-compat pages: 4 records → 2 pages");
}

/* ============ 2. New listing auto-enters rotation; removed disappears ============ */
console.log("\n2. Data-driven rotation — add/remove a listing with zero manual editing");
{
  const five = [A, B, C, D, E];
  const windows5 = buildRotationWindows(sortAccounts(five, "price-desc"));
  eq(windows5.length, 5, "5 records → 5 windows");
  assert(ids(windows5.flat()).includes("ACC-1005"), "new listing present in rotation");

  const six = [...five, F];
  const windows6 = buildRotationWindows(sortAccounts(six, "price-desc"));
  eq(windows6.length, 6, "added record → 6 windows");
  const allIds = ids(windows6.flat());
  eq(allIds.filter((id) => id === "ACC-1006").length, 3, "added record appears exactly once per window (3 windows)");

  const removed = [B, C, D, E, F];
  const windowsRem = buildRotationWindows(sortAccounts(removed, "price-desc"));
  assert(!ids(windowsRem.flat()).includes("ACC-1001"), "removed listing disappears from rotation");

  const featured5 = getFeaturedAccounts(24, five);
  eq(featured5.records.length, 5, "featured selector reflects the new pool");
  assert(shouldAutoRotate(buildRotationWindows(featured5.records).length), "any pool >1 record → section rotates");
}

/* ============ 3. Price edit → sort, window membership, WhatsApp ============ */
console.log("\n3. Data propagation — price edit (900 → 799) everywhere");
{
  const edited = [make("ACC-1007", 799, { featured: false }), B, C, D];
  const desc = sortAccounts(edited, "price-desc");
  eq(desc[0].priceInr, 4200, "highest price first (desc)");
  const asc = sortAccounts(edited, "price-asc");
  eq(asc[0].priceInr, 799, "edited price now lowest (asc)");
  const windows = buildRotationWindows(desc);
  assert(ids(windows.flat()).includes("ACC-1007"), "edited record in rotation");
  const wa = buildWhatsAppMessage({ id: "ACC-1007", title: "Edited Account", price: 799, buyer: true });
  assert(wa.includes("\u20b9799 INR"), "WhatsApp message reflects edited price");
  assert(wa.includes("Ref: ACC-1007"), "WhatsApp keeps canonical id");
}

/* ============ 4. Media edit → images / gallery / video propagate ============ */
console.log("\n4. Media propagation — image, gallery and video URL edits");
{
  const orig = getAccountById("ACC-1001", [A])!;
  eq(getListingImages(orig).length, 2, "2 listing images before edit");
  eq(getEvidenceImages(orig).length, 2, "2 evidence images before edit");
  eq(getListingVideos(orig).length, 1, "1 video before edit");

  const imgEdit = patch(A, {
    media: [
      { kind: "image", url: "/evidence/acc-1001/new-1.jpg", evidence: true, alt: "Inventory 1" },
      { kind: "image", url: "/evidence/acc-1001/2.jpg", evidence: true, alt: "Inventory 2" },
      { kind: "video", url: "/evidence/acc-1001/walkthrough.mp4" },
    ],
  });
  const imgs = getListingImages(imgEdit);
  assert(imgs.includes("/evidence/acc-1001/new-1.jpg"), "edited image URL propagated");
  assert(!imgs.includes("/evidence/acc-1001/1.jpg"), "old image URL gone");

  const galleryEdit = patch(A, {
    media: [
      ...A.media,
      { kind: "image", url: "/evidence/acc-1001/3.jpg", evidence: true, alt: "Inventory 3" },
    ],
  });
  eq(getListingImages(galleryEdit).length, 3, "added gallery image propagated");

  const vidEdit = patch(A, {
    media: [
      { kind: "image", url: "/evidence/acc-1001/1.jpg", evidence: true, alt: "Inventory 1" },
      { kind: "image", url: "/evidence/acc-1001/2.jpg", evidence: true, alt: "Inventory 2" },
      { kind: "video", url: "/evidence/acc-1001/walkthrough-v2.mp4" },
    ],
  });
  eq(getListingVideos(vidEdit)[0], "/evidence/acc-1001/walkthrough-v2.mp4", "edited video URL propagated");

  const featured = getFeaturedAccounts(24, [vidEdit, B, C]);
  const vidInRotation = buildRotationWindows(sortAccounts(featured.records, "price-desc"));
  assert(
    vidInRotation.flat().some((r) => r.id === "ACC-1001" && r.media.some((m) => m.url === "/evidence/acc-1001/walkthrough-v2.mp4")),
    "edited media reaches the rotation window",
  );
}

/* ============ 5. id-stability — favorite/compare survive rotation ============ */
console.log("\n5. Id-stability — favorite/compare identity across every window");
{
  const pool = sortAccounts([A, B, C, D, E, F, make("ACC-1007", 540), make("ACC-1008", 230)], "price-desc");
  const favorites = new Set(["ACC-1001", "ACC-1004"]);
  const compare = new Set(["ACC-1002", "ACC-1005"]);
  const windows = buildRotationWindows(pool);
  assert(windows.length === 8, "8 records → 8 windows");
  const flat = ids(windows.flat());
  for (const id of [...favorites, ...compare]) {
    assert(flat.includes(id), `favorite/compare id "${id}" present across rotation windows`);
  }
  for (const w of windows) {
    const pageIds = ids(w);
    assert(new Set(pageIds).size === pageIds.length, "window ids unique (remount-safe by id)");
  }
}

/* ============ 6. Live canonical counts → multiple windows (visible rotation) ============ */
console.log("\n6. Live canonical data — home sections rotate with current sample counts");
{
  const accounts = getFeaturedAccounts(24);
  const accWindows = buildRotationWindows(accounts.records);
  eq(accWindows.length, accounts.records.length, `accounts featured pool → ${accounts.records.length} windows (${accounts.records.length} records)`);
  assert(shouldAutoRotate(accWindows.length), "accounts section auto-rotates with current data (PROMPT 3)");
  assert(ids(accWindows[0]).includes("SAMPLE-ACC-003"), "Starter Vault remains in the first visible window");

  const panel = getFeaturedPanelServices(12);
  eq(buildRotationWindows(panel.records).length, panel.records.length, `panel featured pool → ${panel.records.length} windows (${panel.records.length} records)`);
  assert(shouldAutoRotate(panel.records.length), "panel section auto-rotates with current data");

  const push = getFeaturedRankPush(12);
  eq(buildRotationWindows(push.records).length, push.records.length, `paid push featured pool → ${push.records.length} windows (${push.records.length} records)`);
  assert(shouldAutoRotate(push.records.length), "paid push section auto-rotates with current data");
}

/* ============ SUMMARY ============ */
console.log(`\n${"=".repeat(56)}`);
console.log(`  P2/P3 rotation + propagation audit: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(56)}\n`);

if (failed > 0) {
  process.exit(1);
}
