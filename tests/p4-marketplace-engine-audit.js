/* eslint-disable no-console */
// PROMPT 4 — Part 1 Marketplace Engine audit (browser, dev server :1111).
// 1. Compare max is 2 (store contract): dock shows "Compare (n/2)", a 3rd
//    attempt shows the friendly "Compare is limited to 2 Free Fire IDs at once."
//    toast, and the tray never holds more than 2.
// 2. Tray shows a type-specific "Add another Free Fire ID" slot at 1 item.
// 3. Compare page: 1-item graceful state (not the empty state), media (cover
//    images), wishlist toggle, View Details, WhatsApp Inquiry CTA, and
//    meaningful difference highlighting ("≠" on fields that differ).
// 4. Service cards (Panel + Paid Push) preview Basic/Pro/Premium tier prices
//    straight from canonical data.
// 5. Detail dossiers support package selection: clicking a tier updates the
//    header price and the WhatsApp CTA (selected tier is visually obvious).
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const BASE = "http://localhost:1111";
const CANDIDATE_BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const BROWSER = CANDIDATE_BROWSERS.find((p) => fs.existsSync(p));
if (!BROWSER) { console.error("No browser found for Puppeteer"); process.exit(1); }

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: BROWSER, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  // ============ PART A — Compare max 2, tray slot, compare page ============
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);

  // -- A1. Select one account: dock (1/2) + "Add another Free Fire ID" slot --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  const dock1 = await page.evaluate(() => {
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    if (!dock) return null;
    return {
      header: /Compare\s*\(\d\/2\)/.exec(dock.textContent)[0],
      addAnother: dock.textContent.includes("Add another Free Fire ID"),
      addAnotherSlot: !!dock.querySelector('[aria-label="Add another Free Fire ID"]'),
    };
  });
  check("Dock shows Compare (1/2) after one selection", !!dock1 && dock1.header === "Compare (1/2)", JSON.stringify(dock1));
  check("Tray shows type-specific 'Add another Free Fire ID' slot at 1 item", !!dock1 && dock1.addAnother && dock1.addAnotherSlot, JSON.stringify(dock1));

  // -- A2. Second account: dock (2/2), slot disappears --
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  const dock2 = await page.evaluate(() => {
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    return dock ? { header: /Compare\s*\(\d\/2\)/.exec(dock.textContent)[0], hasSlot: !!dock.querySelector('[aria-label^="Add another "]') } : null;
  });
  check("Dock shows Compare (2/2) after second selection", !!dock2 && dock2.header === "Compare (2/2)", JSON.stringify(dock2));
  check("'Add another' slot hidden when tray is full (2/2)", !!dock2 && dock2.hasSlot === false, JSON.stringify(dock2));

  // -- A3. Third account attempt → friendly max message, tray stays at 2 --
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  const maxState = await page.evaluate(() => {
    const toast = Array.from(document.querySelectorAll("div")).find((d) => /Compare is limited to 2 Free Fire IDs at once/.test(d.textContent || ""));
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    const chips = dock ? dock.querySelectorAll("[aria-label^='Remove ']").length : 0;
    return { toastShown: !!toast, chips };
  });
  check("3rd compare attempt blocked with 'Compare is limited to 2 Free Fire IDs at once.'", maxState.toastShown, JSON.stringify(maxState));
  check("Tray still holds exactly 2 after blocked attempt", maxState.chips === 2, JSON.stringify(maxState));

  // -- A4. Compare page: 2 columns + media + actions + diff highlighting --
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  const cmp2 = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack, .hidden.md\\:flex > .glass-stack"));
    const col = (n) => cols[n];
    const images = cols.filter((c) => c.querySelector("img"));
    const hearts = cols.filter((c) => c.querySelector('button[aria-label*="wishlist"]'));
    const viewDetails = cols.filter((c) => c.querySelector('button:not([type]), button[type="button"]') && c.textContent.includes("View Details"));
    const inquiry = cols.filter((c) => c.textContent.includes("Inquiry"));
    const diffGlyphs = document.querySelectorAll('span[title="Differs"]').length;
    return { cols: cols.length, colWithImage: images.length, colWithHeart: hearts.length, colWithViewDetails: viewDetails.length, colWithInquiry: inquiry.length, diffGlyphs };
  });
  check("Compare page renders 2 side-by-side columns", cmp2.cols === 2, JSON.stringify(cmp2));
  check("Each column shows media (cover image)", cmp2.colWithImage === 2, JSON.stringify(cmp2));
  check("Each column has a wishlist toggle", cmp2.colWithHeart === 2, JSON.stringify(cmp2));
  check("Each column has View Details + Inquiry CTA", cmp2.colWithViewDetails === 2 && cmp2.colWithInquiry === 2, JSON.stringify(cmp2));
  check("Difference highlighting shows '≠' on fields that differ", cmp2.diffGlyphs >= 1, JSON.stringify(cmp2));

  // -- A5. Wishlist toggle on a compare column persists to the wishlist page --
  await page.evaluate(() => {
    const btn = document.querySelector('.hidden.md\\:flex > div.glass-stack button[aria-label*="wishlist"]');
    btn && btn.click();
  });
  await sleep(400);
  const heartOn = await page.evaluate(() => {
    const btn = document.querySelector('.hidden.md\\:flex > div.glass-stack button[aria-label*="wishlist"]');
    return btn ? { pressed: btn.getAttribute("aria-pressed"), label: btn.getAttribute("aria-label") } : null;
  });
  check("Wishlist toggle activates on the compare column (aria-pressed)", !!heartOn && heartOn.pressed === "true", JSON.stringify(heartOn));

  // -- A6. View Details from compare opens the canonical dossier --
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.hidden.md\\:flex > div.glass-stack button')).find((b) => b.textContent.includes("View Details"));
    btn && btn.click();
  });
  await sleep(600);
  const dossier = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    return dlg ? { open: true, h2: (dlg.querySelector("h2") || {}).textContent || "" } : null;
  });
  check("Compare 'View Details' opens the canonical account dossier", !!dossier && dossier.open, JSON.stringify(dossier));
  await page.keyboard.press("Escape");
  await sleep(300);

  // -- A7. Remove one → graceful 1-item state with 'Add another' (not empty) --
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.hidden.md\\:flex > div.glass-stack button[aria-label="Remove from compare"]'));
    btns[0] && btns[0].click();
  });
  await sleep(500);
  const single = await page.evaluate(() => {
    const bodyText = document.body.textContent;
    const hasAddAnother = bodyText.includes("Add another Free Fire ID");
    const emptyState = bodyText.includes("No listings selected for comparison");
    const colCount = document.querySelectorAll('.hidden.md\\:flex > div.glass-stack').length;
    return { hasAddAnother, emptyState, desktopCols: colCount, hasSingleCard: bodyText.includes("selected") };
  });
  check("Removing one returns gracefully to the 1-item state (not empty state)", single.hasAddAnother && !single.emptyState && single.hasSingleCard, JSON.stringify(single));

  // -- A8. Clear → empty state with updated copy --
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => x.textContent.trim() === "Clear all");
    b && b.click();
  });
  await sleep(500);
  const cleared = await page.evaluate(() => document.body.textContent.includes("No listings selected for comparison"));
  check("Clear all returns to the honest empty state", cleared, "");

  // ============ PART B — Card tier preview + dossier selection ============
  // -- B1. Panel service card previews Basic/Pro/Premium from canonical data --
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  const panelCard = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[aria-label^="Service "]'));
    const withTiers = cards.filter((c) => /Basic/.test(c.textContent) && /Pro/.test(c.textContent) && /Premium/.test(c.textContent) && /₹\s*699/.test(c.textContent) && /₹\s*1,299/.test(c.textContent));
    return { cards: cards.length, withTiers: withTiers.length };
  });
  check("Panel service card shows Basic/Pro/Premium tier prices from canonical data", panelCard.withTiers >= 1, JSON.stringify(panelCard));

  // -- B2. Open panel detail: package selection updates header price + CTA --
  // Mobile viewport so the sticky WhatsApp CTA (an <a> with the live wa URL)
  // is visible — desktop dossiers use button CTAs.
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[aria-label^="Service "]'));
    const target = cards.find((c) => /Premium/.test(c.textContent) && /₹\s*699/.test(c.textContent));
    const b = target && target.querySelector('button[aria-label^="View details"]');
    b && b.click();
  });
  await sleep(700);
  const pricing = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
    if (!dlg) return null;
    const big = dlg.querySelector("span.text-3xl");
    const proBtn = Array.from(dlg.querySelectorAll("button")).find((b) => /Select Pro package/.test(b.getAttribute("aria-label") || ""));
    return { hasProButton: !!proBtn, headerPrice: big ? big.textContent.trim() : null };
  });
  check("Detail dossier renders selectable package tiers (Pro present)", !!pricing && pricing.hasProButton, JSON.stringify(pricing));
  check("Header price defaults to the cheapest tier (₹699)", !!pricing && pricing.headerPrice === "₹699", JSON.stringify(pricing));

  const beforeHref = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
    const a = dlg && dlg.querySelector("a[href*='wa.me']");
    return a ? a.getAttribute("href") : null;
  });

  await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
    const proBtn = dlg && Array.from(dlg.querySelectorAll("button")).find((b) => /Select Pro package/.test(b.getAttribute("aria-label") || ""));
    proBtn && proBtn.click();
  });
  await sleep(500);
  const afterSelect = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
    if (!dlg) return null;
    const big = dlg.querySelector("span.text-3xl");
    const proBtn = Array.from(dlg.querySelectorAll("button")).find((b) => /Select Pro package/.test(b.getAttribute("aria-label") || ""));
    const proSelected = proBtn && proBtn.getAttribute("aria-pressed") === "true";
    const a = dlg.querySelector("a[href*='wa.me']");
    return { headerPrice: big ? big.textContent.trim() : null, proSelected, wa: a ? a.getAttribute("href") : null };
  });
  check("Selecting Pro updates the header price to ₹1,299", !!afterSelect && afterSelect.headerPrice === "₹1,299", JSON.stringify(afterSelect));
  check("Selected tier is visually obvious (aria-pressed on Pro)", !!afterSelect && afterSelect.proSelected, JSON.stringify(afterSelect));
  check("WhatsApp CTA reflects the selected tier (1299 in href)", !!afterSelect && !!afterSelect.wa && afterSelect.wa.includes("1299") && (beforeHref !== afterSelect.wa), JSON.stringify({ before: beforeHref, after: afterSelect && afterSelect.wa }));
  await page.keyboard.press("Escape");
  await sleep(300);

  // -- B3. Paid push card previews its canonical tier prices --
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  const pushCard = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[aria-label^="Rank push "]'));
    const withTiers = cards.filter((c) => /Gold IV → Gold I/.test(c.textContent) && /Diamond → Heroic/.test(c.textContent) && /₹\s*999/.test(c.textContent));
    return { cards: cards.length, withTiers: withTiers.length };
  });
  check("Paid push card previews its canonical tier prices", pushCard.withTiers >= 1, JSON.stringify(pushCard));

  // ============ PART C — Type-safe compare across Panel / Paid Push / Instagram ============
  const freshState = async () => {
    await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
    await page.reload({ waitUntil: "networkidle0" });
    await sleep(500);
  };
  const addCompareFirst = async () => {
    const b = await page.$('[aria-label^="Account "], [aria-label^="Service "], [aria-label^="Rank push "], [aria-label^="Instagram package "] button[aria-label="Add to compare"]');
    b && b.click();
    await sleep(500);
  };
  const dockInfo = async () => page.evaluate(() => {
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    if (!dock) return null;
    const addAnother = dock.querySelector('[aria-label^="Add another "]');
    return {
      header: /Compare\s*\(\d\/2\)/.exec(dock.textContent)[0],
      addAnotherLabel: addAnother ? addAnother.getAttribute("aria-label") : null,
      subtitle: dock.textContent.includes("s") ? dock.textContent : "",
    };
  });

  // -- C1. Panel: cross-type block + "Add another Panel" slot + 2-col page --
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Service "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  let d = await dockInfo();
  check("Panel tray shows 'Add another Panel' slot at 1 item", !!d && d.addAnotherLabel === "Add another Panel", JSON.stringify(d));

  // cross-type: trying to add an ACCOUNT to a PANEL tray is blocked with a type message
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  const xType = await page.evaluate(() => {
    const toast = Array.from(document.querySelectorAll("div")).find((x) => /Compare Panels with other Panels only/.test(x.textContent || ""));
    const dock = Array.from(document.querySelectorAll("div")).find((x) => x.textContent && /Compare\s*\(\d\/2\)/.test(x.textContent));
    const chips = dock ? dock.querySelectorAll("[aria-label^='Remove ']").length : 0;
    return { toast: !!toast, chips };
  });
  check("Cross-type (account into Panel tray) blocked with 'Compare Panels with other Panels only.'", xType.toast === true, JSON.stringify(xType));
  check("Panel tray still holds exactly 1 after blocked cross-type attempt", xType.chips === 1, JSON.stringify(xType));

  // add a second panel → full tray + panel compare page
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Service "] button[aria-label="Add to compare"]'));
    btns[0] && btns[0].click();
  });
  await sleep(500);
  d = await dockInfo();
  check("Panel tray reaches Compare (2/2) with the 'Add another' slot hidden", !!d && d.header === "Compare (2/2)" && d.addAnotherLabel === null, JSON.stringify(d));
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const panelCmp = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack"));
    const headers = cols.map((c) => (c.querySelector("h3") || {}).textContent || "");
    return { cols: cols.length, headers };
  });
  check("Compare page renders 2 Panel columns", panelCmp.cols === 2 && panelCmp.headers.every((t) => t.length > 0), JSON.stringify(panelCmp));
  const panelCmpPrice = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack"));
    const colWithTiers = cols.filter((c) => /Basic/.test(c.textContent) && /Pro/.test(c.textContent) && /Premium/.test(c.textContent) && /₹\s*699/.test(c.textContent) && /₹\s*1,299/.test(c.textContent) && /₹\s*2,499/.test(c.textContent));
    return { cols: cols.length, colWithTiers: colWithTiers.length };
  });
  check("Panel compare columns show canonical Basic/Pro/Premium prices (₹699/₹1,299/₹2,499)", panelCmpPrice.colWithTiers >= 1, JSON.stringify(panelCmpPrice));

  // -- C2. Paid Push: "Add another Paid Push" slot + Compare (2/2) --
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Rank push "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  d = await dockInfo();
  check("Paid Push tray shows 'Add another Paid Push' slot at 1 item", !!d && d.addAnotherLabel === "Add another Paid Push", JSON.stringify(d));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Rank push "] button[aria-label="Add to compare"]'));
    btns[0] && btns[0].click();
  });
  await sleep(500);
  d = await dockInfo();
  check("Paid Push tray reaches Compare (2/2)", !!d && d.header === "Compare (2/2)", JSON.stringify(d));
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const pushCmp = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack"));
    const colWithTiers = cols.filter((c) => /Gold IV → Gold I/.test(c.textContent) && /Diamond → Heroic/.test(c.textContent) && /₹\s*999/.test(c.textContent) && /₹\s*1,799/.test(c.textContent) && /₹\s*2,999/.test(c.textContent));
    return { cols: cols.length, colWithTiers: colWithTiers.length };
  });
  check("Paid Push compare columns show canonical tier prices (₹999/₹1,799/₹2,999)", pushCmp.cols === 2 && pushCmp.colWithTiers >= 1, JSON.stringify(pushCmp));

  // -- C3. Instagram: "Add another Instagram package" slot + Compare (2/2) + page --
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  d = await dockInfo();
  check("Instagram tray shows 'Add another Instagram package' slot at 1 item", !!d && d.addAnotherLabel === "Add another Instagram package", JSON.stringify(d));
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(500);
  d = await dockInfo();
  check("Instagram tray reaches Compare (2/2)", !!d && d.header === "Compare (2/2)", JSON.stringify(d));
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const igCmp = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack"));
    const headers = cols.map((c) => (c.querySelector("h3") || {}).textContent || "");
    return { cols: cols.length, headers };
  });
  check("Compare page renders 2 Instagram package columns", igCmp.cols === 2 && igCmp.headers.length === 2 && igCmp.headers.every((t) => t.length > 0), JSON.stringify(igCmp));

  // -- C4. Account compare shows the same canonical pricing as cards (§24):
  //        struck original (₹5,200) + SAVE badge, derived from originalPrice. --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[aria-label^="Account "]'));
    const target = cards.find((c) => /Architect/.test(c.textContent));
    const btns = Array.from(cards.map((c) => c.querySelector('button[aria-label="Add to compare"]')).filter(Boolean));
    const tIdx = cards.indexOf(target);
    const targets = tIdx >= 0 ? [tIdx, (tIdx + 1) % cards.length] : [0, 1];
    targets.forEach((i) => btns[i] && btns[i].click());
  });
  await sleep(500);
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const accCmpPrice = await page.evaluate(() => {
    const body = document.body.textContent;
    return {
      hasSave: /SAVE/.test(body),
      hasStruckOriginal: /₹5,200/.test(body),
      hasYouSaveRow: body.includes("You Save"),
    };
  });
  check("Account compare shows canonical SAVE badge + struck original ₹5,200 (§24)", accCmpPrice.hasSave && accCmpPrice.hasStruckOriginal, JSON.stringify(accCmpPrice));
  check("Account compare shows a 'You Save' row from originalPrice", accCmpPrice.hasYouSaveRow, JSON.stringify(accCmpPrice));
  // -- B4. No console errors / no horizontal overflow on key routes --
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return { scrollW: el.scrollWidth, clientW: el.clientWidth };
  });
  check("No horizontal overflow on paid-push route", overflow.scrollW <= overflow.clientW + 1, JSON.stringify(overflow));
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const overflow2 = await page.evaluate(() => {
    const el = document.documentElement;
    return { scrollW: el.scrollWidth, clientW: el.clientWidth };
  });
  check("No horizontal overflow on compare page", overflow2.scrollW <= overflow2.clientW + 1, JSON.stringify(overflow2));

  const cleanErrors = consoleErrors.filter((e) => !/favicon|Failed to load resource: the server responded with a status of 404/.test(e));
  check("No console errors across the audit", cleanErrors.length === 0, JSON.stringify(cleanErrors.slice(0, 5)));

  // ============ PART D — Compare education hint (§37–§40) ============
  const hintText = (page) =>
    page.evaluate(() => {
      const status = document.querySelector('[role="status"][aria-live="polite"]');
      if (!status) return null;
      return status.textContent.replace(/\s+/g, " ").trim();
    });
  const hintBlocking = (page) =>
    page.evaluate(() => {
      const status = document.querySelector('[role="status"][aria-live="polite"]');
      if (!status) return null;
      return window.getComputedStyle(status).pointerEvents;
    });
  // Poll for a hint state within a deadline (robust against timer drift).
  const waitForHint = async (expected, timeoutMs) => {
    const start = Date.now();
    let last = "TIMEOUT";
    while (Date.now() - start < timeoutMs) {
      last = await hintText(page);
      if (last === expected) return last;
      await sleep(150);
    }
    return last;
  };

  // -- D1. On /accounts the hint appears after ~5s with type-specific text --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await sleep(300);
  check("Hint not shown before the 5s cycle", (await hintText(page)) === null);
  const d1 = await waitForHint("Compare 2 FF IDs", 9000);
  check("Hint appears after ~5s with 'Compare 2 FF IDs'", d1 === "Compare 2 FF IDs", JSON.stringify({ d1 }));

  // -- D2. It never blocks clicks, then disappears naturally after ~2.5s --
  const dBlocking = await hintBlocking(page);
  check("Hint never blocks interaction (pointer-events-none)", dBlocking === "none", JSON.stringify({ dBlocking }));
  const d2 = await waitForHint(null, 5000);
  check("Hint fades out after the ~2.5s show window", d2 === null, JSON.stringify({ d2 }));

  // -- D3. Cycles back in on the next ~5s tick, then stops after a few cycles --
  const d3 = await waitForHint("Compare 2 FF IDs", 9000);
  check("Hint cycles again on the next 5s tick", d3 === "Compare 2 FF IDs", JSON.stringify({ d3 }));
  const d3done = await waitForHint(null, 8000);
  check("Hint hides again between cycles", d3done === null, JSON.stringify({ d3done }));
  await sleep(20000);
  check("Hint stops after the max cycle count (not annoying)", (await hintText(page)) === null);

  // -- D4. Type-specific wording per marketplace route --
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  const dPanel = await waitForHint("Compare 2 Panels", 9000);
  check("Panel route hint says 'Compare 2 Panels'", dPanel === "Compare 2 Panels", JSON.stringify({ dPanel }));
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  const dPush = await waitForHint("Compare 2 Paid Push services", 9000);
  check("Paid Push route hint says 'Compare 2 Paid Push services'", dPush === "Compare 2 Paid Push services", JSON.stringify({ dPush }));

  // -- D5. Hint stops the moment the visitor actually uses compare --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]');
    b && b.click();
  });
  await sleep(300);
  await sleep(7000);
  const d5 = await hintText(page);
  check("Hint never appears once compare is in use", d5 === null, JSON.stringify({ d5 }));

  // -- D6. Reduced-motion: hint never appears --
  await freshState();
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(300);
  await sleep(7000);
  const d6 = await hintText(page);
  check("Reduced motion: no compare hint animation", d6 === null, JSON.stringify({ d6 }));
  await page.emulateMediaFeatures([]);

  // ============ PART E — 5-second card media rotation (§41–§45) ============
  const activeCardMediaSrc = async () =>
    page.evaluate(() => {
      const card = document.querySelector('[aria-label^="Account "]');
      if (!card) return null;
      const stage = card.querySelector('[aria-label^="View media"]');
      if (!stage) return null;
      const active = stage.querySelector("img.opacity-100");
      return active ? active.getAttribute("src") : null;
    });

  // -- E1. Multi-image account card media rotates every ~5s --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  const src1 = await activeCardMediaSrc();
  await sleep(5600);
  const src2 = await activeCardMediaSrc();
  check("Multi-image card media rotates after ~5s (cover → next)", !!src1 && !!src2 && src1 !== src2, JSON.stringify({ src1, src2 }));
  await sleep(5600);
  const src3 = await activeCardMediaSrc();
  check("Rotation continues on the next 5s tick", !!src3 && src3 !== src2, JSON.stringify({ src2, src3 }));

  // -- E2. Hover pauses rotation temporarily --
  const stage = await page.$('[aria-label^="Account "] [aria-label^="View media"]');
  if (stage) {
    await stage.hover();
    await sleep(1200);
    const pausedSrc = await activeCardMediaSrc();
    await sleep(4600);
    const afterHoverSrc = await activeCardMediaSrc();
    check("Hover pauses the card media rotation", !!pausedSrc && !!afterHoverSrc && pausedSrc === afterHoverSrc, JSON.stringify({ pausedSrc, afterHoverSrc }));
    await page.mouse.move(5, 5);
  } else {
    check("Hover pauses the card media rotation", false, "no media stage found");
  }

  // -- E3. Reduced motion: media stays static on the cover image --
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(300);
  const rm1 = await activeCardMediaSrc();
  await sleep(5600);
  const rm2 = await activeCardMediaSrc();
  check("Reduced motion: card media stays on the cover (no rotation)", !!rm1 && !!rm2 && rm1 === rm2, JSON.stringify({ rm1, rm2 }));
  await page.emulateMediaFeatures([]);

  // ============ PART F — Button states + no event propagation (§48–§49) ============
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  await freshState();
  await sleep(400);

  const detailOpen = () =>
    page.evaluate(() => !!document.querySelector('[role="dialog"][aria-label="Account detail"]'));
  const lightboxOpen = () =>
    page.evaluate(() => !!document.querySelector('[role="dialog"][aria-label*="media gallery"]'));

  // -- F1. Favorite toggle: aria-pressed flips, no lightbox/detail opens, no nav --
  const favBefore = await page.evaluate(() => document.querySelector('[aria-label^="Account "] button[aria-label="Add to favorites"]')?.getAttribute("aria-pressed") ?? null);
  await page.evaluate(() => document.querySelector('[aria-label^="Account "] button[aria-label="Add to favorites"]')?.click());
  await sleep(400);
  const favState = await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Remove from favorites"]');
    return { pressed: b ? b.getAttribute("aria-pressed") : null, cardCount: document.querySelectorAll('[aria-label^="Account "]').length };
  });
  const favOpen = await lightboxOpen();
  const favDetail = await detailOpen();
  check("Heart toggles aria-pressed false → true without losing card list", favBefore === "false" && favState.pressed === "true" && favState.cardCount >= 1, JSON.stringify({ favBefore, ...favState }));
  check("Clicking heart does NOT open the media lightbox", favOpen === false, JSON.stringify({ favOpen }));
  check("Clicking heart does NOT open the detail dossier", favDetail === false, JSON.stringify({ favDetail }));

  // -- F2. Compare toggle: aria-pressed flips, no lightbox/detail opens, tray updates --
  await page.evaluate(() => document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]')?.click());
  await sleep(400);
  const cmpToggle = await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Remove from compare"]');
    return b ? b.getAttribute("aria-pressed") : null;
  });
  const cmpOpen = await lightboxOpen();
  const cmpDetail = await detailOpen();
  const dockCount = await page.evaluate(() => {
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    return dock ? /Compare\s*\(\d\/2\)/.exec(dock.textContent)[0] : null;
  });
  check("Compare toggle flips aria-pressed and tray updates to (1/2)", cmpToggle === "true" && dockCount === "Compare (1/2)", JSON.stringify({ cmpToggle, dockCount }));
  check("Clicking compare does NOT open the media lightbox", cmpOpen === false, JSON.stringify({ cmpOpen }));
  check("Clicking compare does NOT open the detail dossier", cmpDetail === false, JSON.stringify({ cmpDetail }));

  // -- F3. Media stage click opens the lightbox only (no toggle, no detail) --
  const stageBtn = await page.$('[aria-label^="Account "] [aria-label^="View media"]');
  if (stageBtn) {
    await stageBtn.scrollIntoView({ block: "center" });
    await sleep(300);
    const bb = await stageBtn.boundingBox();
    const hitProbe = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label^="Account "] [aria-label^="View media"]');
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const el = document.elementFromPoint(cx, cy);
      return {
        hit: el ? (el.getAttribute("aria-label") || el.tagName) : null,
        href: el && el.tagName === "A" ? el.getAttribute("href") : null,
        vw: window.innerWidth,
        btnRect: r.toJSON(),
      };
    });
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
    await page.mouse.down();
    await sleep(80);
    await page.mouse.up();
    await sleep(500);
    const lb = await lightboxOpen();
    const det = await detailOpen();
    const favStill = await page.evaluate(() => document.querySelector('[aria-label^="Account "] button[aria-label="Remove from favorites"]')?.getAttribute("aria-pressed") ?? null);
    check("Clicking the media opens the lightbox", lb === true, JSON.stringify({ lb, bb, hitProbe }));
    check("Media click does NOT open the detail dossier", det === false, JSON.stringify({ det }));
    check("Media click does NOT change favorite state", favStill === "true", JSON.stringify({ favStill }));
    // close lightbox
    await page.evaluate(() => Array.from(document.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "").includes("Close"))?.click());
    await sleep(300);
  } else {
    check("Clicking the media opens the lightbox", false, "no media stage");
    check("Media click does NOT open the detail dossier", false, "no media stage");
    check("Media click does NOT change favorite state", false, "no media stage");
  }

  // -- F4. Video badge is a non-interactive cue: clicking it does nothing harmful --
  const videoCard = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('[aria-label^="Account "]')).find((c) =>
      Array.from(c.querySelectorAll("span")).some((s) => s.textContent.trim() === "Video"),
    );
    if (!card) return null;
    const video = Array.from(card.querySelectorAll("span")).find((s) => s.textContent.trim() === "Video");
    video.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  });
  await sleep(300);
  const vBadgeOpen = await lightboxOpen();
  const vBadgeDetail = await detailOpen();
  check("Video badge is a non-interactive indicator (click → nothing)", videoCard === true && vBadgeOpen === false && vBadgeDetail === false, JSON.stringify({ videoCard, vBadgeOpen, vBadgeDetail }));

  // -- F5. Details button opens the dossier; dossier reflects persisted favorite --
  await page.evaluate(() => document.querySelector('[aria-label^="Account "] button[aria-label^="View details"]')?.click());
  await sleep(600);
  const dossierOpen = await detailOpen();
  const dossierFav = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    if (!d) return null;
    const b = d.querySelector('button[aria-pressed]');
    return b ? { label: b.getAttribute("aria-label"), pressed: b.getAttribute("aria-pressed") } : null;
  });
  check("Details button opens the account dossier", dossierOpen === true, JSON.stringify({ dossierOpen }));
  check("Dossier favorite control reflects the persisted card state", !!dossierFav && dossierFav.pressed === "true", JSON.stringify({ dossierFav }));
  await page.evaluate(() => Array.from(document.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "").includes("Close"))?.click());
  await sleep(300);

  // -- F6. State persists after reload (pressed stays) --
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(500);
  const persisted = await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Remove from favorites"]');
    const c = document.querySelector('[aria-label^="Account "] button[aria-label="Remove from compare"]');
    return { fav: b ? b.getAttribute("aria-pressed") : null, cmp: c ? c.getAttribute("aria-pressed") : null };
  });
  check("Favorite + compare states persist after reload", persisted.fav === "true" && persisted.cmp === "true", JSON.stringify(persisted));

  // ============ PART G — Breakpoint sweep: no horizontal overflow (§69) ============
  const SWEEP_WIDTHS = [1440, 1200, 1024, 768, 480, 390, 360];
  const SWEEP_ROUTES = ["/", "/accounts", "/services", "/paid-push", "/compare", "/wishlist"];
  let sweepFailures = 0;
  const sweepDetail = [];
  for (const w of SWEEP_WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of SWEEP_ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(250);
      const ov = await page.evaluate(() => {
        const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        return { over, vw: window.innerWidth, hasListing: document.querySelectorAll('[aria-label^="Account "], [aria-label^="Service "], [aria-label^="Rank push "], [aria-label^="Instagram package "]').length };
      });
      if (ov.over > 1) { sweepFailures++; sweepDetail.push(`${w}px ${route} over=${ov.over}`); }
      if (route === "/accounts" && [360, 390, 480].includes(w) && ov.hasListing < 1) { sweepFailures++; sweepDetail.push(`${w}px /accounts no cards`); }
    }
  }
  check("No horizontal overflow (7 widths x 6 marketplace routes)", sweepFailures === 0, sweepDetail.slice(0, 8).join(" | "));

  // ============ PART H — Image + video error fallbacks (§66–§67) ============
  // -- H1. Every image broken on /accounts → decorative gradient fallback, no crash --
  await page.setViewport({ width: 1440, height: 900 });
  const cdp = await page.createCDPSession();
  await cdp.send("Network.enable");
  await cdp.send("Network.setBlockedURLs", {
    urls: ["*images.unsplash.com*", "*images.pexels.com*", "*.jpg", "*.jpeg", "*.png", "*.webp", "*unsplash*"],
  });
  await page.setCacheEnabled(false);
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(1500);
  const fallback = await page.evaluate(() => {
    const card = document.querySelector('[aria-label^="Account "]');
    if (!card) return null;
    const imgs = card.querySelectorAll("img").length;
    const mediaSurface = Array.from(card.querySelectorAll("div")).find((d) => /rounded-t-3xl/.test(d.className || "") && d.querySelector("svg.lucide-image-off"));
    const price = card.textContent.includes("Inquire");
    const title = card.querySelector("h3");
    return { imgs, hasGradientFallback: !!mediaSurface, actionsStillThere: !!price, titleVisible: !!title && title.textContent.length > 0 };
  });
  check("All images broken → card renders decorative gradient fallback (no images)", !!fallback && fallback.imgs === 0 && fallback.hasGradientFallback, JSON.stringify(fallback));
  check("Broken media does not break the card layout (title + actions intact)", !!fallback && fallback.titleVisible && fallback.actionsStillThere, JSON.stringify(fallback));
  await cdp.send("Network.setBlockedURLs", { urls: [] });
  await cdp.detach();
  await page.setCacheEnabled(true);

  // -- H2. Lightbox video player: sandboxed embed, muted, no autoplay (§67) --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(1000);
  const videoCardTitle = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('[aria-label^="Account "]')).find((c) =>
      Array.from(c.querySelectorAll("span")).some((s) => s.textContent.trim() === "Video"),
    );
    return card ? card.querySelector("h3").textContent : null;
  });
  if (videoCardTitle) {
    const stage = await page.$(`[aria-label^="Account "] h3`);
    // click the media of the video-bearing card via JS (positional click is covered in Part F)
    await page.evaluate((t) => {
      const card = Array.from(document.querySelectorAll('[aria-label^="Account "]')).find((c) => {
        const h = c.querySelector("h3");
        return h && h.textContent === t;
      });
      const b = card && card.querySelector('[aria-label^="View media"]');
      b && b.click();
    }, videoCardTitle);
    await sleep(700);
    // Navigate to the video tile at the end of the unified image+video sequence.
    await page.evaluate(() => {
      const lb = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      const play = lb && Array.from(lb.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "").includes("Play video"));
      play && play.click();
    });
    await sleep(400);
    const videoState = await page.evaluate(() => {
      const lb = document.querySelector('[role="dialog"][aria-label*="media gallery"]');
      if (!lb) return null;
      const iframe = lb.querySelector("iframe");
      const videoEl = lb.querySelector("video");
      return {
        iframe: iframe ? iframe.getAttribute("src") : null,
        sandbox: iframe ? iframe.getAttribute("sandbox") : null,
        allow: iframe ? iframe.getAttribute("allow") : null,
        nativeVideo: videoEl ? { muted: videoEl.muted, autoplay: videoEl.autoplay, preload: videoEl.getAttribute("preload") } : null,
        imgCount: lb.querySelectorAll("img").length,
      };
    });
    const src = videoState && videoState.iframe ? videoState.iframe : "";
    check("Lightbox shows the canonical video (safe embed)", !!videoState && !!videoState.iframe, JSON.stringify(videoState));
    check("Video embed is sandboxed and never grants microphone", !!videoState && !!videoState.sandbox && !!videoState.allow && !/microphone/i.test(videoState.allow), JSON.stringify(videoState));
    check("Video is muted and never autoplays", (videoState && (/mute=1/.test(src) || /muted=1/.test(src) || (videoState.nativeVideo && videoState.nativeVideo.muted)) && !/autoplay/i.test(src) && !(videoState.nativeVideo && videoState.nativeVideo.autoplay)), JSON.stringify(videoState));
    // close
    await page.evaluate(() => Array.from(document.querySelectorAll("button")).find((b) => (b.getAttribute("aria-label") || "").includes("Close"))?.click());
    await sleep(300);
  } else {
    check("Lightbox shows the canonical video (safe embed)", false, "no video card found");
    check("Video embed is sandboxed and never grants microphone", false, "no video card found");
    check("Video is muted and never autoplays", false, "no video card found");
  }

  // -- H3. Closing the gallery fully closes the player (no lingering dialog) --
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label*="media gallery"]'));
  check("Closing the gallery removes the player dialog", closed === true, JSON.stringify({ closed }));

  await browser.close();
  console.log(failures === 0 ? "\nALL P4 PART 1 CHECKS PASSED" : `\n${failures} P4 PART 1 CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("AUDIT CRASHED", e); process.exit(1); });
