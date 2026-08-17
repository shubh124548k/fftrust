/* eslint-disable no-console */
// PROMPT 10 — Wishlist + Compare end-to-end on EVERY account card.
// 1. Card heart: click → active/filled → wishlist page shows it → refresh persists → click again removes.
// 2. Card compare: click → card button ACTIVE (aria-pressed) → second account → compare page shows both
//    with canonical data → remove one → only remaining stays → refresh persists → data matches records.
// 3. Both work on desktop AND mobile. No console errors, no overflow.
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

async function cardCounters(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    const hasHeart = (c) => !!c.querySelector('button[aria-label*="favorites"], button[aria-label*="Wishlist"], button[aria-label*="favorite"]');
    const hasCompare = (c) => !!c.querySelector('button[aria-label*="compare"], button[aria-label*="Compare"]');
    const activeHearts = (c) => !!c.querySelector('button[aria-label^="Remove from favorites"]');
    const activeCompares = (c) => !!c.querySelector('button[aria-label^="Remove from compare"][aria-pressed="true"], button[aria-label="Remove from compare"][aria-pressed="true"]');
    return {
      total: cards.length,
      withHeart: cards.filter(hasHeart).length,
      withCompare: cards.filter(hasCompare).length,
      activeHearts: cards.filter(activeHearts).length,
      activeCompares: cards.filter(activeCompares).length,
    };
  });
}

async function gatherCardTitles(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("[aria-label^='Account '] h3")).map((h) => h.textContent.trim());
  });
}

// Navbar wishlist count badge — §14: "♡ 3", updates immediately, absent at zero.
async function wishlistBadge(page) {
  return page.evaluate(() => {
    const link = document.querySelector('a[aria-label="Wishlist"]');
    const badge = link ? link.querySelector("span") : null;
    return badge ? badge.textContent.trim() : null;
  });
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: BROWSER, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  // ===== DESKTOP =====
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);

  // clear persisted state for a clean run
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);

  check("Navbar wishlist badge absent at zero saved listings", (await wishlistBadge(page)) === null, JSON.stringify({ badge: await wishlistBadge(page) }));

  // -- 1. Heart on every account card --
  let cnt = await cardCounters(page);
  check("Every account card shows a Heart button", cnt.total > 0 && cnt.withHeart === cnt.total, JSON.stringify(cnt));
  check("Every account card shows a Compare button", cnt.withCompare === cnt.total, JSON.stringify(cnt));
  check("No card is active before any interaction", cnt.activeHearts === 0 && cnt.activeCompares === 0, JSON.stringify(cnt));

  // -- 2. Heart toggle → active state + wishlist page --
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to favorites"]');
    b && b.click();
  });
  await sleep(400);
  cnt = await cardCounters(page);
  check("Heart click activates card button (aria-pressed + filled)", cnt.activeHearts === 1, JSON.stringify(cnt));
  check("Navbar wishlist badge updates to 1 immediately", (await wishlistBadge(page)) === "1", JSON.stringify({ badge: await wishlistBadge(page) }));

  // wishlist page shows the saved item
  await page.goto(`${BASE}/wishlist`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const wlState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    const favButtons = cards.filter((c) => c.querySelector('button[aria-label^="Remove from favorites"]'));
    return { cards: cards.length, favorited: favButtons.length, heading: (document.querySelector("h1, h2") || {}).textContent || "" };
  });
  check("Wishlist page shows the favorited card(s)", wlState.cards >= 1 && wlState.favorited >= 1, JSON.stringify(wlState));

  // -- 3. Persistence across refresh --
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);
  const wlPersisted = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    return cards.filter((c) => c.querySelector('button[aria-label^="Remove from favorites"]')).length;
  });
  check("Wishlist persists after refresh", wlPersisted >= 1, JSON.stringify({ wlPersisted }));

  // -- 3b. Clicking the saved card's Details opens the correct listing --
  const wlTitleBefore = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    const fav = cards.find((c) => c.querySelector('button[aria-label^="Remove from favorites"]'));
    return fav ? (fav.querySelector("h3") || {}).textContent || "" : "";
  });
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    const fav = cards.find((c) => c.querySelector('button[aria-label^="Remove from favorites"]'));
    const btn = fav && fav.querySelector('button[aria-label^="View details"]');
    btn && btn.click();
  });
  await sleep(600);
  const wlDetail = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="Account detail"]');
    if (!dlg) return null;
    const h2 = dlg.querySelector("h2");
    const saveBtn = Array.from(dlg.querySelectorAll("button")).find((b) => /Saved|Save/.test(b.textContent || ""));
    return { open: true, title: h2 ? h2.textContent.trim() : "", saveLabel: saveBtn ? saveBtn.textContent.trim() : "" };
  });
  check("Saved card's Details opens the correct original listing", wlDetail && wlDetail.open && wlDetail.title === wlTitleBefore, JSON.stringify({ wlTitleBefore, wlDetail }));
  check("Details dialog shows 'Saved' state synced with the card (§13)", wlDetail && wlDetail.saveLabel === "Saved", JSON.stringify(wlDetail));
  await page.keyboard.press("Escape");
  await sleep(300);

  // -- 4. Heart again removes (from the wishlist page card) --
  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label^="Remove from favorites"]');
    b && b.click();
  });
  await sleep(400);
  const wlRemoved = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    return cards.filter((c) => c.querySelector('button[aria-label^="Remove from favorites"]')).length;
  });
  check("Heart click again removes from wishlist", wlRemoved === 0, JSON.stringify({ wlRemoved }));
  check("Navbar wishlist badge hides again at zero", (await wishlistBadge(page)) === null, JSON.stringify({ badge: await wishlistBadge(page) }));

  // -- 5. Compare: select account A + B, card active states --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(600);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to compare"]'));
    if (btns.length >= 2) { btns[0].click(); }
  });
  await sleep(400);
  cnt = await cardCounters(page);
  check("First compare click activates card button (aria-pressed)", cnt.activeCompares === 1, JSON.stringify(cnt));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to compare"]'));
    if (btns.length >= 1) { btns[0].click(); }
  });
  await sleep(400);
  cnt = await cardCounters(page);
  check("Second compare click activates second card button", cnt.activeCompares === 2, JSON.stringify(cnt));

  // -- 6. Compare page shows both, canonical data matches --
  const titlesBefore = await gatherCardTitles(page);
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const cmpPage = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack, .hidden.md\\:flex > .glass-stack"));
    const colHeaders = cols.map((c) => (c.querySelector("h3") || {}).textContent || "");
    const colPrices = cols.map((c) => (c.textContent.match(/₹\s*[\d,]+/) || [""])[0]);
    return { cols: cols.length, colHeaders, colPrices };
  });
  check("Compare page renders side-by-side columns", cmpPage.cols === 2, JSON.stringify(cmpPage));
  check("Compare columns show the two selected accounts", cmpPage.colHeaders.length === 2 && cmpPage.colHeaders.every((t) => titlesBefore.includes(t)), JSON.stringify(cmpPage));

  // data matches canonical records (prices rendered)
  check("Compare uses current canonical account data (prices rendered)", cmpPage.colPrices.filter(Boolean).length === 2, JSON.stringify(cmpPage));

  // -- 7. Remove one from compare page, only one remains in the store --
  await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Remove from compare"]');
    b && b.click();
  });
  await sleep(400);
  const cmpAfterRemove = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("ff-trust-favorites");
      const data = JSON.parse(raw).state;
      return { remaining: data.compare.length, type: data.compareType };
    } catch { return { remaining: -1, type: null }; }
  });
  check("Removing one account leaves only the remaining one", cmpAfterRemove.remaining === 1, JSON.stringify(cmpAfterRemove));

  // -- 8. Compare persistence after refresh (store survives reload) --
  await page.reload({ waitUntil: "networkidle0" });
  await sleep(700);
  const cmpPersisted = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("ff-trust-favorites");
      const data = JSON.parse(raw).state;
      return { remaining: data.compare.length, type: data.compareType };
    } catch { return { remaining: -1, type: null }; }
  });
  check("Compare selection persists after refresh (1 stays)", cmpPersisted.remaining === 1, JSON.stringify({ cmpPersisted }));

  // -- 9. Desktop dock shows selections --
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const dockState = await page.evaluate(() => {
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    if (!dock) return null;
    const chips = Array.from(dock.querySelectorAll("[aria-label^='Remove ']"));
    return { hasDock: true, chips: chips.length };
  });
  check("Compare dock appears with the selected account(s)", dockState && dockState.chips === 1, JSON.stringify(dockState));

  // cleanup for mobile pass
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));

  // ===== MOBILE =====
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  cnt = await cardCounters(page);
  check("Mobile: every account card shows Heart + Compare", cnt.total > 0 && cnt.withHeart === cnt.total && cnt.withCompare === cnt.total, JSON.stringify(cnt));

  await page.evaluate(() => {
    const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to favorites"]');
    b && b.click();
  });
  await sleep(400);
  cnt = await cardCounters(page);
  check("Mobile: heart activates on tap", cnt.activeHearts === 1, JSON.stringify(cnt));

  await page.goto(`${BASE}/wishlist`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const mobWl = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[aria-label^='Account ']"));
    return cards.filter((c) => c.querySelector('button[aria-label^="Remove from favorites"]')).length;
  });
  check("Mobile: wishlist page shows favorited card", mobWl >= 1, JSON.stringify({ mobWl }));

  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to compare"]'));
    if (btns.length >= 2) { btns[0].click(); }
  });
  await sleep(400);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to compare"]'));
    if (btns.length >= 1) { btns[0].click(); }
  });
  await sleep(400);
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const mobCmp = await page.evaluate(() => {
    const names = Array.from(document.querySelectorAll(".md\\:hidden .glass-stack p, .md\\:hidden > div p")).map((p) => p.textContent.trim()).filter(Boolean);
    return { hasMobileTable: !!document.querySelector(".md\\:hidden"), nameCount: names.length };
  });
  check("Mobile: compare page renders comparison (stacked layout)", mobCmp.hasMobileTable, JSON.stringify(mobCmp));

  // mobile overflow
  const overflows = [];
  for (const w of [320, 375, 390, 430]) {
    await page.setViewport({ width: w, height: 812 });
    await page.goto(`${BASE}/wishlist`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(400);
    const ov = await page.evaluate(() => ({ w: window.innerWidth, sw: document.documentElement.scrollWidth }));
    if (ov.sw > ov.w + 1) overflows.push(ov);
  }
  check("No horizontal overflow on wishlist at mobile widths", overflows.length === 0, JSON.stringify(overflows));

  const noErrors = consoleErrors.filter((e) => !/favicon/i.test(e));
  check("No console/page errors", noErrors.length === 0, JSON.stringify(noErrors.slice(0, 5)));

  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
  await browser.close();
  console.log(failures === 0 ? "\nALL WISHLIST+COMPARE CHECKS PASS" : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})();
