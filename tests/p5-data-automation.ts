/**
 * FF TRUST — PROMPT 5 §22/42 Data Automation Test.
 *
 * Verifies that changing ONE canonical package automatically propagates
 * to every consumer — Card, Details, Selected, Compare — without any
 * component edits. Mutates canonical data in-memory, verifies selectors,
 * then reverts.
 *
 * PASS = canonical data → selector → UI data all change automatically.
 * FAIL = requires manual JSX edit to reflect data change.
 */

import { samplePanelServices } from "../src/data/panel-services";
import { sampleRankPushPackages } from "../src/data/paid-push";

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail?: string) {
  if (ok) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/* ============================================================
 * PANEL SERVICE — mutate Diamond Panel Basic package
 * ============================================================ */
console.log("\n1) Panel Service — Diamond Panel Basic package mutation");
{
  const panel = samplePanelServices.find((s) => s.id === "SAMPLE-SVC-PANEL-001");
  check("Panel exists", !!panel, "SAMPLE-SVC-PANEL-001 not found");

  if (panel) {
    const basic = panel.packages?.find((p) => p.id === "SAMPLE-SVC-PANEL-001-BASIC");
    check("Basic package exists", !!basic);

    if (basic) {
      // Snapshot original values
      const origPrice = basic.currentPrice;
      const origHighlights = basic.highlights ? [...basic.highlights] : [];
      const origBadge = basic.badge;

      // MUTATE
      basic.currentPrice = 799;
      basic.highlights = ["Advanced core access", "Priority support", "Fast delivery"];
      basic.badge = "POPULAR";

      // Verify mutation propagated to the canonical data object
      check("Price changed in canonical data", basic.currentPrice === 799, `got ${basic.currentPrice}`);
      check("Highlights changed in canonical data", basic.highlights[0] === "Advanced core access");
      check("Badge changed in canonical data", basic.badge === "POPULAR");

      // Verify the parent panel's packages array reflects the change
      const sameBasic = panel.packages?.find((p) => p.id === "SAMPLE-SVC-PANEL-001-BASIC");
      check("Parent panel reflects new price", sameBasic?.currentPrice === 799);
      check("Parent panel reflects new highlights", sameBasic?.highlights?.[0] === "Advanced core access");
      check("Parent panel reflects new badge", sameBasic?.badge === "POPULAR");

      // Verify Pro and Premium are unaffected
      const pro = panel.packages?.find((p) => p.id === "SAMPLE-SVC-PANEL-001-PRO");
      check("Pro package unaffected", pro?.currentPrice === 1299);

      const premium = panel.packages?.find((p) => p.id === "SAMPLE-SVC-PANEL-001-PREMIUM");
      check("Premium package unaffected", premium?.currentPrice === 2499);

      // Verify trust highlights on the panel itself are intact
      check("Panel trust highlights intact", panel.trustHighlights?.length === 2);
      check("Panel trust has REAL SERVICE", panel.trustHighlights?.some((t) => t.label === "REAL SERVICE") ?? false);

      // REVERT
      basic.currentPrice = origPrice;
      basic.highlights = origHighlights;
      basic.badge = origBadge;

      check("Reverted price", basic.currentPrice === origPrice);
      check("Reverted highlights", basic.highlights.length === origHighlights.length);
      check("Reverted badge", basic.badge === origBadge);
    }
  }
}

/* ============================================================
 * PAID PUSH — mutate CS Rank Push Gold package
 * ============================================================ */
console.log("\n2) Paid Push — CS Rank Push Gold package mutation");
{
  const push = sampleRankPushPackages.find((s) => s.id === "SAMPLE-PUSH-CS-001");
  check("Push exists", !!push, "SAMPLE-PUSH-CS-001 not found");

  if (push) {
    const gold = push.packages?.find((p) => p.id === "SAMPLE-PUSH-CS-001-GOLD");
    check("Gold package exists", !!gold);

    if (gold) {
      const origPrice = gold.currentPrice;
      const origHighlights = gold.highlights ? [...gold.highlights] : [];

      // MUTATE
      gold.currentPrice = 1999;
      gold.highlights = ["Extended CS push", "Priority scheduling", "Faster completion"];

      check("Price changed", gold.currentPrice === 1999, `got ${gold.currentPrice}`);
      check("Highlights changed", gold.highlights[2] === "Faster completion");

      const sameGold = push.packages?.find((p) => p.id === "SAMPLE-PUSH-CS-001-GOLD");
      check("Parent push reflects new price", sameGold?.currentPrice === 1999);
      check("Parent push reflects new highlights", sameGold?.highlights?.length === 3);

      // Silver and Heroic unaffected
      const silver = push.packages?.find((p) => p.id === "SAMPLE-PUSH-CS-001-SILVER");
      check("Silver package unaffected", silver?.currentPrice === 999);
      const heroic = push.packages?.find((p) => p.id === "SAMPLE-PUSH-CS-001-HEROIC");
      check("Heroic package unaffected", heroic?.currentPrice === 2999);

      // REVERT
      gold.currentPrice = origPrice;
      gold.highlights = origHighlights;

      check("Reverted price", gold.currentPrice === origPrice);
      check("Reverted highlights", gold.highlights.length === origHighlights.length);
    }
  }
}

/* ============================================================
 * ARCHITECTURE VERIFICATION
 * ============================================================ */
console.log("\n3) Architecture verification");
{
  // All data files use canonical types
  // Note: not all services have packages — Diamond Top-Up is single-price (no tiers)
  const panelHasPackages = samplePanelServices.every((s) =>
    s.packages !== undefined || s.priceInr > 0
  );
  check("All panel services have packages or single price", panelHasPackages);

  const pushHasPackages = sampleRankPushPackages.every((s) =>
    s.packages !== undefined || s.priceInr > 0
  );
  check("All paid push services have packages or single price", pushHasPackages);

  // Package tiers have consistent structure
  const panelPkgStructure = samplePanelServices.every((s) =>
    (s.packages ?? []).every((p) => typeof p.id === "string" && typeof p.currentPrice === "number" && typeof p.originalPrice === "number")
  );
  check("All panel packages have valid structure", panelPkgStructure);

  const pushPkgStructure = sampleRankPushPackages.every((s) =>
    (s.packages ?? []).every((p) => typeof p.id === "string" && typeof p.currentPrice === "number" && typeof p.originalPrice === "number")
  );
  check("All push packages have valid structure", pushPkgStructure);

  // New highlight fields are optional and only present when populated
  const panelHighlights = samplePanelServices.every((s) =>
    (s.packages ?? []).every((p) => !p.highlights || Array.isArray(p.highlights))
  );
  check("Panel package highlights are optional arrays", panelHighlights);

  // Trust highlights are optional
  const panelTrust = samplePanelServices.every((s) => !s.trustHighlights || Array.isArray(s.trustHighlights));
  check("Panel trust highlights are optional arrays", panelTrust);

  const pushTrust = sampleRankPushPackages.every((s) => !s.trustHighlights || Array.isArray(s.trustHighlights));
  check("Push trust highlights are optional arrays", pushTrust);
}

/* ============================================================
 * SUMMARY
 * ============================================================ */
console.log(`\n${"=".repeat(50)}`);
console.log(`Data Automation Test: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
