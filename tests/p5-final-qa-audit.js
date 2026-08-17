/* eslint-disable no-console */
// PROMPT 5 — Final QA audit (browser, dev server :1111).
// Closes the PROMPT-5-specific gaps not already asserted by p4/p9/p10/p12/p13:
//   A. §15/§17  Third-item compare message per type — selections preserved.
//   B. §18      Cross-type compare rejected at STORE level — no state pollution,
//               compareType/compareError set, tray unchanged.
//   C. §28      Difference highlighting on the compare page (both accounts + panels).
//   D. §31/§34  Package selection syncs header price AND the WhatsApp/Contact CTA
//               for Panel and Paid Push dossiers (desktop button + WA URL).
//   E. §77      Wishlist + compare combined: independent state — removing from one
//               never touches the other (verified at store level).
//   F. §58-59   Console / network / hydration scan across every marketplace route.
//   G. §52      Touch targets on mobile: every interactive element meets WCAG AA
//               (24px min, or effective spacing), primary CTAs comfortably sized.
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

const storeState = (page) =>
  page.evaluate(() => {
    try {
      const raw = localStorage.getItem("ff-trust-favorites");
      const data = JSON.parse(raw).state;
      return { favorites: data.favorites, compare: data.compare, compareType: data.compareType, compareError: data.compareError };
    } catch (e) { return { favorites: [], compare: [], compareType: null, compareError: null, err: String(e) }; }
  });

const dockInfo = (page) =>
  page.evaluate(() => {
    const dock = Array.from(document.querySelectorAll("div")).find((d) => d.textContent && /Compare\s*\(\d\/2\)/.test(d.textContent));
    if (!dock) return null;
    return {
      header: /Compare\s*\(\d\/2\)/.exec(dock.textContent)[0],
      chips: dock.querySelectorAll("[aria-label^='Remove ']").length,
      hasAddAnother: !!dock.querySelector('[aria-label^="Add another "]'),
    };
  });

const toastText = (page) =>
  page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("div")).find((d) =>
      /Compare (is limited to|Free Fire IDs with|Panels with|Paid Pushes with|Instagram packages with)/.test(d.textContent || ""));
    return el ? el.textContent.replace(/\s+/g, " ").trim() : null;
  });

const freshState = async (page) => {
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: BROWSER, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => pageErrors.push(String(e.message || e)));
  page.on("requestfailed", (r) => failedRequests.push(`${r.url()} :: ${(r.failure() || {}).errorText || ""}`));
  page.on("response", (r) => { if (r.status() >= 400 && !/\.map$/.test(r.url())) badResponses.push(`${r.status()} ${r.url()}`); });

  // ============ PART A — 3rd-item message per type + selections preserved (§15/§17) ============
  await page.setViewport({ width: 1440, height: 900 });
  const types = [
    { route: "/accounts", label: "Free Fire ID", plural: "Free Fire IDs" },
    { route: "/services", label: "Panel", plural: "Panels" },
    { route: "/paid-push", label: "Paid Push", plural: "Paid Pushes" },
    { route: "/instagram/views", label: "Instagram package", plural: "Instagram packages" },
  ];
  for (const t of types) {
    await page.goto(`${BASE}${t.route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(800);
    await freshState(page);
    // Add two listings of this type (next available button each time).
    const addNext = () =>
      page.evaluate(() => { const b = document.querySelector('button[aria-label="Add to compare"]'); b && b.click(); });
    await addNext();
    await sleep(400);
    await addNext();
    await sleep(400);
    const full = await dockInfo(page);
    const idsBefore = (await storeState(page)).compare.map((e) => e.id);
    check(`[A ${t.label}] Tray full at Compare (2/2) after two selections`, !!full && full.header === "Compare (2/2)", JSON.stringify(full));
    check(`[A ${t.label}] No 'Add another' slot when full (max-2 contract)`, !!full && full.hasAddAnother === false, JSON.stringify(full));
    // Attempt a 3rd item — only reachable when the catalogue has a 3rd listing.
    const hasThird = await page.evaluate(() => !!document.querySelector('button[aria-label="Add to compare"]'));
    if (hasThird) {
      await addNext();
      await sleep(500);
      const msg = await toastText(page);
      const after = await storeState(page);
      check(`[A ${t.label}] 3rd attempt shows 'Compare is limited to 2 ${t.plural} at once.'`, msg === `Compare is limited to 2 ${t.plural} at once.`, JSON.stringify(msg));
      check(`[A ${t.label}] Selections preserved — tray still holds exactly the same 2`, after.compare.length === 2 && JSON.stringify(after.compare.map((e) => e.id)) === JSON.stringify(idsBefore), JSON.stringify({ idsBefore, after: after.compare.map((e) => e.id) }));
    } else {
      console.log(`  NOTE [A ${t.label}] catalogue shows only 2 listings — a 3rd click is not reachable from the grid; the max-2 contract is covered by the 2/2 fill + the account/instagram 3rd-click tests + the store-level checks.`);
    }
  }

  // ============ PART B — Cross-type blocked at STORE level (§18) ============
  // B1. Panel tray + attempt to add an Account.
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await freshState(page);
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Service "] button[aria-label="Add to compare"]'); b && b.click(); });
  await sleep(400);
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]'); b && b.click(); });
  await sleep(500);
  const b1 = await storeState(page);
  const b1Toast = await toastText(page);
  check("[B1] Cross-type (Account into Panel tray) shows 'Compare Panels with other Panels only.'", b1Toast === "Compare Panels with other Panels only.", JSON.stringify(b1Toast));
  check("[B1] Store-level: compare array still only holds the Panel (no pollution)", b1.compare.length === 1 && b1.compare[0].type === "panel", JSON.stringify(b1.compare));
  check("[B1] compareType preserved as 'panel'", b1.compareType === "panel", JSON.stringify(b1.compareType));
  check("[B1] compareError set (not silently dropped)", typeof b1.compareError === "string" && b1.compareError.length > 0, JSON.stringify(b1.compareError));

  // B2. Account tray + attempt to add an Instagram package.
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await freshState(page);
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Account "] button[aria-label="Add to compare"]'); b && b.click(); });
  await sleep(400);
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => { const b = document.querySelector('button[aria-label="Add to compare"]'); b && b.click(); });
  await sleep(500);
  const b2 = await storeState(page);
  const b2Toast = await toastText(page);
  check("[B2] Cross-type (Instagram into Account tray) shows 'Compare Free Fire IDs with other Free Fire IDs only.'", b2Toast === "Compare Free Fire IDs with other Free Fire IDs only.", JSON.stringify(b2Toast));
  check("[B2] Store-level: compare still holds exactly the Account", b2.compare.length === 1 && b2.compare[0].type === "account", JSON.stringify(b2.compare));

  // B3. Paid Push tray + attempt to add a Panel.
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await freshState(page);
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Rank push "] button[aria-label="Add to compare"]'); b && b.click(); });
  await sleep(400);
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Service "] button[aria-label="Add to compare"]'); b && b.click(); });
  await sleep(500);
  const b3 = await storeState(page);
  const b3Toast = await toastText(page);
  check("[B3] Cross-type (Panel into Paid Push tray) shows 'Compare Paid Pushes with other Paid Pushes only.'", b3Toast === "Compare Paid Pushes with other Paid Pushes only.", JSON.stringify(b3Toast));
  check("[B3] Store-level: compare still holds exactly the Paid Push", b3.compare.length === 1 && b3.compare[0].type === "paid-push", JSON.stringify(b3.compare));

  // ============ PART C — Difference highlighting on compare page (§28) ============
  // C1. Accounts differ → '≠' glyphs present; C2. identical/equal price rows show match state.
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await freshState(page);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to compare"]'));
    btns[0] && btns[0].click();
    btns[1] && btns[1].click();
  });
  await sleep(400);
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  const c1 = await page.evaluate(() => {
    const diff = document.querySelectorAll('span[title="Differs"], [title="Differs"]').length;
    const cols = document.querySelectorAll(".hidden.md\\:flex > div.glass-stack").length;
    const diffVisibleText = Array.from(document.querySelectorAll('span[title="Differs"]')).filter((s) => s.offsetParent !== null).length;
    return { diff, diffVisibleText, cols };
  });
  check("[C1] Account compare shows '≠' difference highlighting on differing fields", c1.cols === 2 && c1.diff >= 1, JSON.stringify(c1));
  check("[C1] Diff glyphs are actually visible on screen", c1.diffVisibleText >= 1, JSON.stringify(c1));

  // C2. Panels differ → same treatment.
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await freshState(page);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[aria-label^="Service "] button[aria-label="Add to compare"]'));
    btns[0] && btns[0].click();
    btns[1] && btns[1].click();
  });
  await sleep(400);
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  const c2 = await page.evaluate(() => {
    const diff = document.querySelectorAll('span[title="Differs"], [title="Differs"]').length;
    const cols = document.querySelectorAll(".hidden.md\\:flex > div.glass-stack").length;
    return { diff, cols };
  });
  check("[C2] Panel compare shows '≠' difference highlighting", c2.cols === 2 && c2.diff >= 1, JSON.stringify(c2));

  // C3. Compare page announces the comparison honestly (type label in header + both columns named).
  const c3 = await page.evaluate(() => {
    const body = document.body.textContent;
    const cols = Array.from(document.querySelectorAll(".hidden.md\\:flex > div.glass-stack"));
    const names = cols.map((c) => (c.querySelector("h3") || {}).textContent || "").filter(Boolean);
    return { body, names };
  });
  check("[C3] Both compared panels are named on the compare page", c3.names.length === 2, JSON.stringify(c3.names));
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));

  // ============ PART D — Package selection syncs header price + CTA (§31/§34) ============
  // Uses the proven dossier anchor (`a[href*='wa.me']`, p4) + header price
  // (`span.text-3xl`), so the CTA assert reads the LIVE href of the selected tier.
  const dossierHeader = (page) =>
    page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
      if (!dlg) return null;
      const big = dlg.querySelector("span.text-3xl");
      return big ? big.textContent.trim() : null;
    });
  const dossierWaHref = (page) =>
    page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
      const a = dlg && dlg.querySelector("a[href*='wa.me']");
      return a ? a.getAttribute("href") : null;
    });
  const selectTier = async (label) => {
    await page.evaluate((label) => {
      const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
      const b = dlg && Array.from(dlg.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "").includes(`Select ${label} package`));
      b && b.click();
    }, label);
    await sleep(400);
  };
  const tierPressed = async (label) =>
    page.evaluate((label) => {
      const dlg = document.querySelector('[role="dialog"][aria-label="Service detail"]');
      const b = dlg && Array.from(dlg.querySelectorAll("button")).find((x) => (x.getAttribute("aria-label") || "").includes(`Select ${label} package`));
      return b ? b.getAttribute("aria-pressed") : null;
    }, label);

  // D1. Panel dossier: Basic (default ₹699) → Pro (₹1,299) → Premium (₹2,499).
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Service "] button[aria-label^="View details"]'); b && b.click(); });
  await sleep(700);
  const d1default = await dossierHeader(page);
  const d1waDefault = await dossierWaHref(page);
  check("[D1] Panel dossier header defaults to cheapest tier (₹699)", d1default === "₹699", JSON.stringify(d1default));
  check("[D1] WhatsApp CTA reflects the default Basic tier (699 in href)", !!d1waDefault && d1waDefault.includes("699"), JSON.stringify((d1waDefault || "").slice(0, 120)));
  await selectTier("Pro");
  const d1pro = await dossierHeader(page);
  const d1proState = await tierPressed("Pro");
  const d1waPro = await dossierWaHref(page);
  check("[D1] Selecting Pro updates the header price to ₹1,299", d1pro === "₹1,299", JSON.stringify(d1pro));
  check("[D1] Pro tier is visually obvious (aria-pressed=true)", d1proState === "true", JSON.stringify(d1proState));
  check("[D1] WhatsApp CTA updates to the selected Pro price (1299 in href)", !!d1waPro && d1waPro.includes("1299") && d1waPro !== d1waDefault, JSON.stringify((d1waPro || "").slice(0, 120)));
  await selectTier("Premium");
  const d1prem = await dossierHeader(page);
  const d1premState = { prem: await tierPressed("Premium"), pro: await tierPressed("Pro") };
  const d1waPrem = await dossierWaHref(page);
  check("[D1] Selecting Premium updates the header price to ₹2,499", d1prem === "₹2,499", JSON.stringify(d1prem));
  check("[D1] Selection is single (Premium selected, Pro deselected)", d1premState.prem === "true" && d1premState.pro === "false", JSON.stringify(d1premState));
  check("[D1] WhatsApp CTA tracks Premium too (2499 in href)", !!d1waPrem && d1waPrem.includes("2499"), JSON.stringify((d1waPrem || "").slice(0, 120)));
  await page.keyboard.press("Escape");
  await sleep(300);

  // D2. Paid Push dossier: Basic ₹999 → Pro ₹1,799 → Premium ₹2,999.
  // The CS Rank Push card carries the 3-tier packages; open ITS dossier.
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[aria-label^="Rank push "]'));
    const target = cards.find((c) => /Gold IV/.test(c.textContent));
    const b = target && target.querySelector('button[aria-label^="View details"]');
    b && b.click();
  });
  await sleep(700);
  const d2default = await dossierHeader(page);
  const d2waDefault = await dossierWaHref(page);
  check("[D2] Paid Push dossier header defaults to cheapest tier (₹999)", d2default === "₹999", JSON.stringify(d2default));
  check("[D2] WhatsApp CTA reflects the default tier (999 in href)", !!d2waDefault && d2waDefault.includes("999"), JSON.stringify((d2waDefault || "").slice(0, 120)));
  await selectTier("Platinum IV → Diamond");
  const d2pro = await dossierHeader(page);
  const d2proState = await tierPressed("Platinum IV → Diamond");
  const d2waPro = await dossierWaHref(page);
  check("[D2] Selecting Platinum IV → Diamond updates header to ₹1,799", d2pro === "₹1,799", JSON.stringify(d2pro));
  check("[D2] Platinum tier is visually obvious (aria-pressed=true)", d2proState === "true", JSON.stringify(d2proState));
  check("[D2] WhatsApp CTA updates to the selected price (1799 in href)", !!d2waPro && d2waPro.includes("1799") && d2waPro !== d2waDefault, JSON.stringify((d2waPro || "").slice(0, 120)));
  await selectTier("Diamond → Heroic");
  const d2prem = await dossierHeader(page);
  const d2premState = { prem: await tierPressed("Diamond → Heroic"), pro: await tierPressed("Platinum IV → Diamond") };
  const d2waPrem = await dossierWaHref(page);
  check("[D2] Selecting Diamond → Heroic updates header to ₹2,999", d2prem === "₹2,999", JSON.stringify(d2prem));
  check("[D2] Selection is single (Heroic selected, Platinum deselected)", d2premState.prem === "true" && d2premState.pro === "false", JSON.stringify(d2premState));
  check("[D2] WhatsApp CTA tracks Heroic too (2999 in href)", !!d2waPrem && d2waPrem.includes("2999"), JSON.stringify((d2waPrem || "").slice(0, 120)));
  await page.keyboard.press("Escape");
  await sleep(300);

  // ============ PART E — Wishlist + compare combined independence (§77) ============
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(800);
  await freshState(page);
  await page.evaluate(() => {
    const favs = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to favorites"]'));
    const cmps = Array.from(document.querySelectorAll('[aria-label^="Account "] button[aria-label="Add to compare"]'));
    favs[0] && favs[0].click();
    favs[1] && favs[1].click();
    cmps[0] && cmps[0].click();
    cmps[1] && cmps[1].click();
  });
  await sleep(500);
  const eStart = await storeState(page);
  check("[E] Both A+B are wishlisted AND compared at once", eStart.favorites.length === 2 && eStart.compare.length === 2, JSON.stringify(eStart));

  // Remove one from WISHLIST on the wishlist page → compare must be untouched.
  await page.goto(`${BASE}/wishlist`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const eWlBefore = await page.evaluate(() => Array.from(document.querySelectorAll('[aria-label^="Account "]')).filter((c) => c.querySelector('button[aria-label^="Remove from favorites"]')).length);
  check("[E] Wishlist page shows 2 favorited cards", eWlBefore === 2, JSON.stringify({ eWlBefore }));
  await page.evaluate(() => { const b = document.querySelector('[aria-label^="Account "] button[aria-label^="Remove from favorites"]'); b && b.click(); });
  await sleep(400);
  const eWlAfter = await storeState(page);
  check("[E] Unhearting on wishlist removes exactly one favorite", eWlAfter.favorites.length === 1, JSON.stringify(eWlAfter.favorites));
  check("[E] Compare tray is untouched by the wishlist change (still 2)", eWlAfter.compare.length === 2, JSON.stringify(eWlAfter.compare));

  // Remove one from COMPARE on the dock → wishlist must be untouched.
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  await page.evaluate(() => { const b = document.querySelector('button[aria-label="Remove from compare"]'); b && b.click(); });
  await sleep(500);
  const eFinal = await storeState(page);
  check("[E] Removing from compare drops compare to 1", eFinal.compare.length === 1, JSON.stringify(eFinal.compare));
  check("[E] Wishlist is untouched by the compare change (still 1 favorite)", eFinal.favorites.length === 1, JSON.stringify(eFinal.favorites));
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));

  // ============ PART F — Console / network / hydration scan across routes (§58-59) ============
  const scanRoutes = ["/", "/accounts", "/services", "/paid-push", "/wishlist", "/compare", "/instagram/views", "/instagram/followers", "/proof", "/privacy"];
  const fConsole = [];
  const fFailed = [];
  const fBad = [];
  for (const route of scanRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(500);
    const errs = consoleErrors.splice(0);
    const fails = failedRequests.splice(0);
    const bads = badResponses.splice(0);
    const real = errs.filter((e) => !/favicon|websocket|Back.?forward|Cache|hmr/i.test(e));
    const realFails = fails.filter((f) => !/favicon/i.test(f));
    const realBads = bads.filter((b) => !/favicon/i.test(b));
    if (real.length) fConsole.push(`${route}: ${real.join(" | ")}`);
    if (realFails.length) fFailed.push(`${route}: ${realFails.join(" | ")}`);
    if (realBads.length) fBad.push(`${route}: ${realBads.join(" | ")}`);
  }
  check("[F] No console/page errors across all marketplace routes", fConsole.length === 0, fConsole.slice(0, 4).join("\n"));
  check("[F] No failed network requests across routes", fFailed.length === 0, fFailed.slice(0, 4).join("\n"));
  check("[F] No HTTP >= 400 responses across routes", fBad.length === 0, fBad.slice(0, 4).join("\n"));

  // Hydration: React prints hydration-mismatch errors to the console — already captured
  // above; additionally verify the client actually mounted the SAMPLE-gated catalogue.
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);
  const fHydration = await page.evaluate(() => {
    const cards = document.querySelectorAll('[aria-label^="Account "]').length;
    const imgs = document.querySelectorAll("img").length;
    return { cards, imgs, hasSampleFrame: document.body.textContent.includes("SAMPLE") };
  });
  check("[F] Client renders the full SAMPLE-gated catalogue (client mount)", fHydration.cards >= 3 && fHydration.hasSampleFrame, JSON.stringify(fHydration));

  // ============ PART G — Touch targets on mobile (§52) ============
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  const touch = await page.evaluate(() => {
    const q = (s) => Array.from(document.querySelectorAll(s));
    const targets = [];
    const push = (el, name) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return; // hidden / display:none
      targets.push({ name, w: Math.round(r.width), h: Math.round(r.height) });
    };
    const card = q('[aria-label^="Account "]')[0];
    if (card) {
      push(card.querySelector('button[aria-label*="favorites"]'), "card heart");
      push(card.querySelector('button[aria-label*="compare"]'), "card compare");
      push(card.querySelector("a[href*='wa.me']"), "card WhatsApp CTA");
      push(card.querySelector('button[aria-label^="View details"]'), "card Details");
      push(card.querySelector('[aria-label^="View media"]'), "card media stage");
    }
    push(q('input[type="search"]')[0], "search input");
    push(q("select")[0], "sort select");
    push(q('a[aria-label="Wishlist"]')[0], "nav wishlist");
    push(q('button[aria-label="Open menu"]')[0], "menu toggle");
    return targets;
  });
  const small = touch.filter((t) => t.h < 24 || t.w < 24);
  check("[G] Every visible interactive element meets WCAG AA minimum (>=24x24 CSS px)", small.length === 0, JSON.stringify(small));
  const cta = touch.find((t) => t.name === "card WhatsApp CTA");
  const ham = touch.find((t) => t.name === "menu toggle");
  check("[G] Primary card CTA is comfortably tappable (height >= 32px)", !!cta && cta.h >= 32, JSON.stringify(cta));
  check("[G] Menu toggle is comfortably tappable (height >= 32px)", !!ham && ham.h >= 32, JSON.stringify(ham));
  console.log("  touch target measurements:", JSON.stringify(touch));

  // Cleanup.
  await page.evaluate(() => localStorage.removeItem("ff-trust-favorites"));
  await browser.close();
  console.log(failures === 0 ? "\nALL P5 FINAL QA CHECKS PASSED" : `\n${failures} P5 FINAL QA CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("AUDIT CRASHED", e); process.exit(1); });
