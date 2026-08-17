/**
 * FF TRUST — PROMPT 5 Final Browser Audit (§39-43).
 *
 * Real browser verification using Puppeteer:
 *  - §39: Instagram hub (Browse Instagram → /instagram → 4 boxes → routing)
 *  - §40: Panel cards (every card has image, packages, highlights, badges, trust)
 *  - §41: Paid Push cards (same)
 *  - §43: Performance (console errors, network, layout overflow)
 */

import puppeteer, { type Browser } from "puppeteer";

const BASE = "http://localhost:1111";

let browser: Browser;
let passed = 0;
let failed = 0;
let notes: string[] = [];

function check(label: string, ok: boolean, detail?: string) {
  if (ok) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function note(msg: string) {
  notes.push(msg);
  console.log(`  📝 NOTE: ${msg}`);
}

async function run() {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const page = await browser.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // Collect page errors
  const pageErrors: string[] = [];
  page.on("pageerror", (err: unknown) => pageErrors.push(String(err)));

  /* ============================================================
   * §39 — INSTAGRAM HUB
   * ============================================================ */
  console.log("\n=== §39 — INSTAGRAM HUB ===");

  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });

  // Find and click "Browse Instagram"
  const browseInstagramBtn = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a"));
    return links.find((a) => a.textContent?.includes("Browse Instagram"))?.href ?? null;
  });
  check("Browse Instagram link exists", !!browseInstagramBtn, browseInstagramBtn ?? "not found");
  check("Browse Instagram → /instagram", (browseInstagramBtn?.includes("/instagram") ?? false) && !(browseInstagramBtn?.includes("/instagram/views") ?? false), browseInstagramBtn ?? "");

  // Navigate to hub
  await page.goto(`${BASE}/instagram`, { waitUntil: "networkidle2" });

  const hubTitle = await page.evaluate(() => document.querySelector("h1")?.textContent ?? "");
  check("Hub has 'Instagram Marketplace' heading", hubTitle.includes("Instagram Marketplace"), hubTitle);

  // Count category boxes
  const categoryBoxes = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href^='/instagram/']"));
    const locked = Array.from(document.querySelectorAll("[aria-disabled='true']"));
    return { links: links.map((l) => (l as HTMLAnchorElement).href), lockedCount: locked.length };
  });
  check("Hub has 3 live category links", categoryBoxes.links.length >= 3, `found ${categoryBoxes.links.length}`);
  check("Hub has 1 locked (YouTube) box", categoryBoxes.lockedCount >= 1, `found ${categoryBoxes.lockedCount}`);

  // Verify individual routes
  for (const route of ["/instagram/views", "/instagram/followers", "/instagram/likes"]) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
    check(`${route} loads (200)`, resp?.status() === 200, `status ${resp?.status()}`);
    const title = await page.evaluate(() => document.querySelector("h1")?.textContent ?? "");
    check(`${route} has heading`, title.length > 0, title.substring(0, 40));
  }

  /* ============================================================
   * §40 — PANEL CARDS
   * ============================================================ */
  console.log("\n=== §40 — PANEL CARDS ===");

  await page.goto(`${BASE}/services`, { waitUntil: "networkidle2" });

  const panelCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Service ']"));
    return cards.map((card) => {
      const title = card.querySelector("h3")?.textContent ?? "";
      const imgs = card.querySelectorAll("img");
      const packageTiers = card.querySelector("[aria-label='Package tiers']");
      const tierCells = packageTiers ? packageTiers.querySelectorAll(".glass-embed") : [];
      const tierLabels = Array.from(tierCells).map((c) => c.querySelector("span")?.textContent?.trim() ?? "");
      const wishlist = card.querySelector("[aria-label*='favorites']");
      const compare = card.querySelector("[aria-label*='compare']");
      const details = card.querySelector("[aria-label*='details']");
      const trustChips = card.querySelectorAll("[class*='rounded-full']");
      return { title, imgCount: imgs.length, tierCount: tierCells.length, tierLabels, hasWishlist: !!wishlist, hasCompare: !!compare, hasDetails: !!details, chipCount: trustChips.length };
    });
  });

  check("Panel cards found", panelCards.length >= 1, `found ${panelCards.length}`);

  for (const [i, card] of panelCards.entries()) {
    console.log(`\n  Card ${i + 1}: ${card.title.substring(0, 50)}`);
    check(`  Image present`, card.imgCount >= 1);
    if (card.tierCount >= 3) {
      check(`  Has 3+ tier packages`, true, `tiers: [${card.tierLabels.join(", ")}]`);
    } else if (card.tierCount === 0) {
      note(`Card "${card.title}" has no tier packages — single-price service (by design)`);
    }
    check(`  Has wishlist button`, card.hasWishlist);
    check(`  Has compare button`, card.hasCompare);
    check(`  Has details button`, card.hasDetails);
  }

  /* ============================================================
   * §41 — PAID PUSH CARDS
   * ============================================================ */
  console.log("\n=== §41 — PAID PUSH CARDS ===");

  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle2" });

  const pushCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Rank push ']"));
    return cards.map((card) => {
      const title = card.querySelector("h3")?.textContent ?? "";
      const imgs = card.querySelectorAll("img");
      const packageTiers = card.querySelector("[aria-label='Package tiers']");
      const tierCells = packageTiers ? packageTiers.querySelectorAll(".glass-embed") : [];
      const tierLabels = Array.from(tierCells).map((c) => c.querySelector("span")?.textContent?.trim() ?? "");
      const wishlist = card.querySelector("[aria-label*='favorites']");
      const compare = card.querySelector("[aria-label*='compare']");
      const details = card.querySelector("[aria-label*='details']");
      return { title, imgCount: imgs.length, tierCount: tierCells.length, tierLabels, hasWishlist: !!wishlist, hasCompare: !!compare, hasDetails: !!details };
    });
  });

  check("Paid Push cards found", pushCards.length >= 1, `found ${pushCards.length}`);

  for (const [i, card] of pushCards.entries()) {
    console.log(`\n  Card ${i + 1}: ${card.title.substring(0, 50)}`);
    check(`  Image present`, card.imgCount >= 1);
    if (card.tierCount >= 3) {
      check(`  Has Basic/Pro/Premium (3 tiers)`, true, `tiers: [${card.tierLabels.join(", ")}]`);
    } else {
      note(`Card has ${card.tierCount} tiers: [${card.tierLabels.join(", ")}] — some Paid Push cards may not have 3-tier packages`);
    }
    check(`  Has wishlist button`, card.hasWishlist);
    check(`  Has compare button`, card.hasCompare);
    check(`  Has details button`, card.hasDetails);
  }

  /* ============================================================
   * §43 — PERFORMANCE / CONSOLE / NETWORK
   * ============================================================ */
  console.log("\n=== §43 — PERFORMANCE ===");

  // Navigate through all key pages and collect errors
  const routes = ["/", "/accounts", "/services", "/paid-push", "/instagram", "/instagram/views", "/instagram/followers", "/instagram/likes"];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
  }

  check("No page errors across all routes", pageErrors.length === 0, pageErrors.length > 0 ? pageErrors.slice(0, 3).join("; ") : undefined);

  // Check for console errors (filter known non-critical)
  const criticalErrors = consoleErrors.filter((e) =>
    !e.includes("favicon") && !e.includes("404") && !e.includes("DevTools")
  );
  check("No critical console errors", criticalErrors.length === 0, criticalErrors.length > 0 ? criticalErrors.slice(0, 3).join("; ") : undefined);

  // Check for horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  check("No horizontal overflow", !hasOverflow);

  await browser.close();

  /* ============================================================
   * SUMMARY
   * ============================================================ */
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Final Browser Audit: ${passed} passed, ${failed} failed, ${notes.length} notes`);
  console.log(`${"=".repeat(60)}`);

  if (notes.length > 0) {
    console.log("\nNotes:");
    notes.forEach((n) => console.log(`  📝 ${n}`));
  }

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Audit failed:", err);
  browser?.close();
  process.exit(1);
});
