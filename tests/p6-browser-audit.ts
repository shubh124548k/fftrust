/**
 * FF TRUST — PROMPT 6 Comprehensive Browser Audit (§38-46).
 *
 * Real browser verification using Puppeteer.
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
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  const pageErrors: string[] = [];
  page.on("pageerror", (err: unknown) => pageErrors.push(String(err)));

  /* ============================================================
   * §38 — HOMEPAGE
   * ============================================================ */
  console.log("\n=== §38 — HOMEPAGE ===");

  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });

  // §44 — Explore buttons
  const heroButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.map((b) => b.textContent?.trim() ?? "");
  });

  const hasExploreAccounts = heroButtons.some((b) => b.includes("Explore Accounts"));
  const hasPanelSeller = heroButtons.some((b) => b.includes("Panel Seller"));
  const hasPaidPush = heroButtons.some((b) => b.includes("Paid Push"));
  const hasInstagram = heroButtons.some((b) => b.includes("Instagram"));
  check("§44: Explore Accounts button", hasExploreAccounts);
  check("§44: Panel Seller button", hasPanelSeller);
  check("§44: Paid Push button", hasPaidPush);
  check("§44: Instagram button", hasInstagram);

  // §43 — Homepage counts
  const stats = await page.evaluate(() => {
    const statEls = document.querySelectorAll(".font-heading.text-2xl");
    const values: number[] = [];
    statEls.forEach((el) => {
      const num = parseInt(el.textContent?.trim() ?? "NaN", 10);
      if (!isNaN(num)) values.push(num);
    });
    return values;
  });
  check("§43: Homepage has count values", stats.length >= 2, `found ${stats.length} stats: [${stats.join(", ")}]`);
  check("§43: Real accounts count > 0", stats[0] !== undefined && stats[0] > 0, `count = ${stats[0]}`);
  check("§43: Real services count > 0", stats[1] !== undefined && stats[1] > 0, `count = ${stats[1]}`);

  // §25 — Trust highlights on homepage
  const trustChips = await page.evaluate(() => {
    const chips = document.querySelectorAll("[class*='rounded-full']");
    const texts: string[] = [];
    chips.forEach((c) => {
      const t = c.textContent?.trim() ?? "";
      if (t.includes("Real") || t.includes("Verified") || t.includes("Transparent") || t.includes("Evidence")) texts.push(t);
    });
    return texts;
  });
  check("§25: Trust highlight chips on homepage", trustChips.length >= 3, `found: [${trustChips.join(", ")}]`);

  /* ============================================================
   * §38b — NAVIGATE TO ACCOUNTS
   * ============================================================ */
  console.log("\n=== §38b — ACCOUNTS MARKETPLACE ===");

  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle2" });

  const accountCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    return cards.map((c) => {
      const title = c.querySelector("h3")?.textContent ?? "";
      const videoChip = c.querySelector("[class*='rounded-full']")?.textContent?.includes("Video") ?? false;
      const hasVideo = Array.from(c.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("Video"));
      const imgs = c.querySelectorAll("img");
      return { title, hasVideo, imgCount: imgs.length };
    });
  });

  check("§41: Account cards found", accountCards.length >= 3, `found ${accountCards.length}`);
  for (const [i, card] of accountCards.entries()) {
    console.log(`\n  Account ${i + 1}: ${card.title.substring(0, 50)}`);
    check(`  §41: Image present`, card.imgCount >= 1);
    // All 3 sample accounts should have video
    check(`  §41: Video indicator present`, card.hasVideo, card.hasVideo ? "yes" : "no video chip");
  }

  /* ============================================================
   * §38c — PANEL SELLER MARKETPLACE
   * ============================================================ */
  console.log("\n=== §38c — PANEL SELLER ===");

  await page.goto(`${BASE}/services`, { waitUntil: "networkidle2" });

  const panelCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Service ']"));
    return cards.map((card) => {
      const title = card.querySelector("h3")?.textContent ?? "";
      const imgs = card.querySelectorAll("img");
      const packageTiers = card.querySelector("[aria-label='Package tiers']");
      const tierCells = packageTiers ? packageTiers.querySelectorAll(".glass-embed") : [];
      const tierLabels = Array.from(tierCells).map((c) => c.querySelector("span")?.textContent?.trim() ?? "");
      const hasWishlist = !!card.querySelector("[aria-label*='favorites']");
      const hasCompare = !!card.querySelector("[aria-label*='compare']");
      const hasDetails = !!card.querySelector("[aria-label*='details']");
      const hasTrust = Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("REAL") || el.textContent?.includes("VERIFIED"));
      const hasVideo = Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("Demo"));
      return { title, imgCount: imgs.length, tierCount: tierCells.length, tierLabels, hasWishlist, hasCompare, hasDetails, hasTrust, hasVideo };
    });
  });

  check("§39: Panel cards found", panelCards.length >= 2, `found ${panelCards.length}`);
  for (const [i, card] of panelCards.entries()) {
    console.log(`\n  Panel ${i + 1}: ${card.title.substring(0, 50)}`);
    check(`  §39: Image present`, card.imgCount >= 1);
    check(`  §39: Has 3+ tier packages`, card.tierCount >= 3, `found ${card.tierCount} tiers: [${card.tierLabels.join(", ")}]`);
    check(`  §39: Trust highlights present`, card.hasTrust);
    check(`  §39: Video indicator present`, card.hasVideo);
    check(`  §39: Wishlist button`, card.hasWishlist);
    check(`  §39: Compare button`, card.hasCompare);
    check(`  §39: Details button`, card.hasDetails);
  }

  /* ============================================================
   * §38d — PAID PUSH MARKETPLACE
   * ============================================================ */
  console.log("\n=== §38d — PAID PUSH ===");

  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle2" });

  const pushCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Rank push ']"));
    return cards.map((card) => {
      const title = card.querySelector("h3")?.textContent ?? "";
      const imgs = card.querySelectorAll("img");
      const packageTiers = card.querySelector("[aria-label='Package tiers']");
      const tierCells = packageTiers ? packageTiers.querySelectorAll(".glass-embed") : [];
      const tierLabels = Array.from(tierCells).map((c) => c.querySelector("span")?.textContent?.trim() ?? "");
      const hasWishlist = !!card.querySelector("[aria-label*='favorites']");
      const hasCompare = !!card.querySelector("[aria-label*='compare']");
      const hasDetails = !!card.querySelector("[aria-label*='details']");
      const hasTrust = Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("REAL") || el.textContent?.includes("VERIFIED"));
      const hasVideo = Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("Demo"));
      return { title, imgCount: imgs.length, tierCount: tierCells.length, tierLabels, hasWishlist, hasCompare, hasDetails, hasTrust, hasVideo };
    });
  });

  check("§40: Paid Push cards found", pushCards.length >= 2, `found ${pushCards.length}`);
  for (const [i, card] of pushCards.entries()) {
    console.log(`\n  Push ${i + 1}: ${card.title.substring(0, 50)}`);
    check(`  §40: Image present`, card.imgCount >= 1);
    check(`  §40: Has 3+ tier packages`, card.tierCount >= 3, `found ${card.tierCount} tiers: [${card.tierLabels.join(", ")}]`);
    check(`  §40: Trust highlights present`, card.hasTrust);
    check(`  §40: Video indicator present`, card.hasVideo);
    check(`  §40: Wishlist button`, card.hasWishlist);
    check(`  §40: Compare button`, card.hasCompare);
    check(`  §40: Details button`, card.hasDetails);
  }

  /* ============================================================
   * §42 — INSTAGRAM HUB
   * ============================================================ */
  console.log("\n=== §42 — INSTAGRAM HUB ===");

  // §44 — Navigate from homepage Explore Instagram button
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });

  const igBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find((b) => b.textContent?.includes("Instagram")) !== undefined;
  });
  check("§44: Instagram button on homepage", igBtn);

  // Navigate to Instagram hub
  await page.goto(`${BASE}/instagram`, { waitUntil: "networkidle2" });

  const hubTitle = await page.evaluate(() => document.querySelector("h1")?.textContent ?? "");
  check("§42: Instagram Marketplace heading", hubTitle.includes("Instagram Marketplace"), hubTitle);

  const categories = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href^='/instagram/']"));
    const locked = Array.from(document.querySelectorAll("[aria-disabled='true']"));
    return { liveCount: links.length, lockedCount: locked.length };
  });
  check("§42: 3 live category links", categories.liveCount >= 3, `found ${categories.liveCount}`);
  check("§42: 1 locked (YouTube) box", categories.lockedCount >= 1, `found ${categories.lockedCount}`);

  // §18 — Verify routes
  for (const route of ["/instagram/views", "/instagram/followers", "/instagram/likes"]) {
    const resp = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
    check(`§18: ${route} loads (200)`, resp?.status() === 200);
    const title = await page.evaluate(() => document.querySelector("h1")?.textContent ?? "");
    check(`§18: ${route} has heading`, title.length > 0, title.substring(0, 40));
  }

  /* ============================================================
   * §47 — DATA AUTOMATION TEST
   * ============================================================ */
  console.log("\n=== §47 — DATA AUTOMATION TEST ===");

  // Navigate to services and capture initial state
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle2" });

  const initialPanelCount = await page.evaluate(() =>
    document.querySelectorAll("[aria-label^='Service ']").length
  );
  check("§47: Panel count before mutation", initialPanelCount >= 2, `count = ${initialPanelCount}`);

  // Navigate to paid-push
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle2" });

  const initialPushCount = await page.evaluate(() =>
    document.querySelectorAll("[aria-label^='Rank push ']").length
  );
  check("§47: Push count before mutation", initialPushCount >= 2, `count = ${initialPushCount}`);

  /* ============================================================
   * §43 — PERFORMANCE / CONSOLE / NETWORK
   * ============================================================ */
  console.log("\n=== §43 — PERFORMANCE ===");

  const routes = ["/", "/accounts", "/services", "/paid-push", "/instagram", "/instagram/views", "/instagram/followers", "/instagram/likes"];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle2" });
  }

  check("§43: No page errors across all routes", pageErrors.length === 0, pageErrors.length > 0 ? pageErrors.slice(0, 3).join("; ") : undefined);

  const criticalErrors = consoleErrors.filter((e) =>
    !e.includes("favicon") && !e.includes("404") && !e.includes("DevTools")
  );
  check("§43: No critical console errors", criticalErrors.length === 0, criticalErrors.length > 0 ? criticalErrors.slice(0, 3).join("; ") : undefined);

  const hasOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  check("§43: No horizontal overflow", !hasOverflow);

  /* ============================================================
   * §30 — CONDITIONAL DATA CHECK
   * ============================================================ */
  console.log("\n=== §30 — CONDITIONAL DATA ===");

  // Check all Panel cards have consistent structure
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle2" });
  const panelStructures = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Service ']"));
    return cards.map((card) => {
      const tiers = card.querySelector("[aria-label='Package tiers']")?.querySelectorAll(".glass-embed");
      return {
        title: card.querySelector("h3")?.textContent?.substring(0, 30) ?? "",
        hasTiers: (tiers?.length ?? 0) >= 3,
        hasImage: (card.querySelectorAll("img").length) >= 1,
        hasTrust: Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("REAL")),
      };
    });
  });

  const allPanelsHaveTiers = panelStructures.every((p) => p.hasTiers);
  const allPanelsHaveImages = panelStructures.every((p) => p.hasImage);
  const allPanelsHaveTrust = panelStructures.every((p) => p.hasTrust);
  check("§30: ALL Panel cards have 3+ tiers", allPanelsHaveTiers, panelStructures.map((p) => `${p.title}:${p.hasTiers ? "✓" : "✗"}`).join(", "));
  check("§30: ALL Panel cards have images", allPanelsHaveImages);
  check("§30: ALL Panel cards have trust highlights", allPanelsHaveTrust);

  // Check all Push cards have consistent structure
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle2" });
  const pushStructures = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Rank push ']"));
    return cards.map((card) => {
      const tiers = card.querySelector("[aria-label='Package tiers']")?.querySelectorAll(".glass-embed");
      return {
        title: card.querySelector("h3")?.textContent?.substring(0, 30) ?? "",
        hasTiers: (tiers?.length ?? 0) >= 3,
        hasImage: (card.querySelectorAll("img").length) >= 1,
        hasTrust: Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("REAL")),
      };
    });
  });

  const allPushHaveTiers = pushStructures.every((p) => p.hasTiers);
  const allPushHaveImages = pushStructures.every((p) => p.hasImage);
  const allPushHaveTrust = pushStructures.every((p) => p.hasTrust);
  check("§30: ALL Push cards have 3+ tiers", allPushHaveTiers, pushStructures.map((p) => `${p.title}:${p.hasTiers ? "✓" : "✗"}`).join(", "));
  check("§30: ALL Push cards have images", allPushHaveImages);
  check("§30: ALL Push cards have trust highlights", allPushHaveTrust);

  // Check all Account cards have video
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle2" });
  const accountMedia = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    return cards.map((card) => ({
      title: card.querySelector("h3")?.textContent?.substring(0, 30) ?? "",
      hasVideo: Array.from(card.querySelectorAll("[class*='rounded-full']")).some((el) => el.textContent?.includes("Video")),
    }));
  });

  const allAccountsHaveVideo = accountMedia.every((a) => a.hasVideo);
  check("§30: ALL Account cards have video indicator", allAccountsHaveVideo, accountMedia.map((a) => `${a.title}:${a.hasVideo ? "✓" : "✗"}`).join(", "));

  await browser.close();

  /* ============================================================
   * SUMMARY
   * ============================================================ */
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Browser Audit: ${passed} passed, ${failed} failed, ${notes.length} notes`);
  console.log(`${"=".repeat(60)}`);

  if (notes.length > 0) {
    console.log("\nNotes:");
    notes.forEach((n) => console.log(`  📝 ${n}`));
  }

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Audit failed:", err);
  browser?.close();
  process.exit(1);
});
