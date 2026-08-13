/* eslint-disable no-console */
// PROMPT 3 — Homepage auto-rotation + 3D transitions + responsive + performance.
// 1. Home renders 4 rotor stages (Explore accounts / Panel / Paid Push /
//    Instagram Services). Current canonical data (3/2/2 records) produces
//    MULTIPLE windows (PROMPT 3): account=3, panel=2, push=2, instagram=3 —
//    every section visibly rotates every 5 seconds.
// 2. Sort still works through the rotor wrapper; wishlist heart survives a
//    rotation/sort remount by record.id.
// 3. Pause on interaction: hover + focus pause (data-rotor-paused), resume
//    after cooldown. Reduced motion switches to a simple fade.
// 4. Full catalogue pages (/accounts /services /paid-push) render WITHOUT a
//    rotor (full grids, rotation only on home).
// 5. Responsive: 12 widths INCLUDING 820, no horizontal overflow, cards stack
//    to a single column on mobile and 3 columns on desktop.
// 6. Final navigation: home sections + back/forward/refresh without breakage.
// 7. No console/page errors.
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1440, 1920];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(700);

  // ---- 1. Four rotor stages with window markers, p9-safe structure ----
  const rotors = await page.evaluate(() => {
    const stages = Array.from(document.querySelectorAll('[data-rotor-rotate="true"]'));
    const accountStage = document.querySelector('#explore .rotor-stage');
    const panelStage = document.querySelector('#panel-seller .rotor-stage');
    const pushStage = document.querySelector('#paid-push .rotor-stage');
    const igStage = document.querySelector('#instagram-services .rotor-stage');
    const read = (el) => (el ? { page: el.getAttribute("data-rotor-page"), total: el.getAttribute("data-rotor-total"), paused: el.getAttribute("data-rotor-paused") } : null);
    return {
      count: stages.length,
      account: read(accountStage),
      panel: read(panelStage),
      push: read(pushStage),
      instagram: read(igStage),
      accountCards: accountStage ? accountStage.querySelectorAll("[aria-label^='Account ']").length : 0,
      serviceCards: panelStage ? panelStage.querySelectorAll("[aria-label^='Service ']").length : 0,
      pushCards: pushStage ? pushStage.querySelectorAll("[aria-label^='Rank push ']").length : 0,
      igCards: igStage ? igStage.querySelectorAll("[aria-label^='Browse Instagram']").length : 0,
      rotorPages: document.querySelectorAll(".rotor-page").length,
      dots: document.querySelectorAll(".rotor-dots").length,
      starterVault: !!Array.from(document.querySelectorAll("[aria-label^='Account ']")).find((c) => /Starter Vault/i.test(c.getAttribute("aria-label") || "")),
      sortAccountsSelects: document.querySelectorAll('select[aria-label="Sort accounts"]').length,
      accountPage: accountStage ? accountStage.querySelector(".rotor-page") !== null : false,
    };
  });
  check("Home has 4 rotor stages (Explore / Panel / Paid Push / Instagram)", rotors.count === 4, JSON.stringify(rotors));
  check("Rotor stages start at window 0 with multiple windows (3/2/2/3)", rotors.account && rotors.account.page === "0" && rotors.account.total === "3" && rotors.panel.total === "2" && rotors.push.total === "2" && rotors.instagram.total === "3", JSON.stringify(rotors));
  check("Account rotor shows exactly 3 cards at a time", rotors.accountCards === 3, JSON.stringify(rotors));
  check("Panel rotor shows 2 service cards", rotors.serviceCards === 2, JSON.stringify(rotors));
  check("Paid Push rotor shows 2 rank push cards", rotors.pushCards === 2, JSON.stringify(rotors));
  check("Instagram rotor keeps all 3 category cards", rotors.igCards === 3, JSON.stringify(rotors));
  check("Starter Vault stays in the visible account window (p9 regression)", rotors.starterVault, JSON.stringify(rotors));
  check("Exactly one 'Sort accounts' select on home (p9 regression)", rotors.sortAccountsSelects === 1, JSON.stringify(rotors));
  check("All 4 rotors render dots (window count feedback)", rotors.dots === 4, JSON.stringify(rotors));
  check("Account rotor uses .rotor-page wrapper", rotors.accountPage && rotors.rotorPages >= 4, JSON.stringify(rotors));

  // ---- 2. Sort reorders through the rotor wrapper (p9 regression) ----
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-asc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(400);
  const ascPrices = await page.evaluate(() => Array.from(document.querySelectorAll("#explore [aria-label^='Account ']")).map((c) => {
    const m = (c.textContent || "").match(/₹\s*([\d,]+)/);
    return m ? Number(m[1].replace(/,/g, "")) : null;
  }).filter((v) => v !== null));
  check("Account rotor reorders numerically ascending on Low→High", ascPrices.length > 1 && ascPrices.every((v, i) => i === 0 || ascPrices[i - 1] <= v), JSON.stringify(ascPrices));
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-desc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(300);

  // ---- 3. Wishlist heart persists across a rotation remount (by record.id) ----
  const favBefore = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('#explore .glass-embed .font-mono-label'));
    return spans.length >= 2 ? Number(spans[0].textContent.trim()) : -1;
  });
  await page.evaluate(() => {
    const b = document.querySelector('#explore button[aria-label="Add to favorites"]');
    b && b.click();
  });
  await sleep(300);
  const favAfter = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('#explore .glass-embed .font-mono-label'));
    return spans.length >= 2 ? Number(spans[0].textContent.trim()) : -1;
  });
  check("Favorites badge increments on heart click", favAfter === favBefore + 1, `before=${favBefore} after=${favAfter}`);
  // Swap sort twice — each swap resets the rotation (resetKey), re-rendering cards.
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-asc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(300);
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-desc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(300);
  const favSurvived = await page.evaluate(() => Array.from(document.querySelectorAll('#explore button[aria-label="Remove from favorites"]')).length);
  check("Favorited card survives rotation/sort remount (id-keyed)", favSurvived >= 1, `removed-hearts=${favSurvived}`);
  // Clean up — remove the favorite so local state is reset for later audits.
  await page.evaluate(() => {
    const b = document.querySelector('#explore button[aria-label="Remove from favorites"]');
    b && b.click();
  });
  await sleep(250);

  // ---- 4. Pause on interaction (hover + focus), resume after cooldown ----
  await page.hover("#explore .rotor-stage");
  await sleep(350);
  const hoverPaused = await page.evaluate(() => document.querySelector("#explore .rotor-stage").getAttribute("data-rotor-paused"));
  check("Hover pauses the section rotation", hoverPaused === "true", `paused=${hoverPaused}`);
  await page.mouse.move(8, 8);
  await sleep(1800);
  const hoverResumed = await page.evaluate(() => document.querySelector("#explore .rotor-stage").getAttribute("data-rotor-paused"));
  check("Rotation resumes after leaving the section (cooldown)", hoverResumed === "false", `paused=${hoverResumed}`);

  await page.focus('#explore [aria-label^="View details for"]');
  await sleep(300);
  const focusPaused = await page.evaluate(() => document.querySelector("#explore .rotor-stage").getAttribute("data-rotor-paused"));
  check("Keyboard focus pauses the section rotation", focusPaused === "true", `paused=${focusPaused}`);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await sleep(1800);
  const focusResumed = await page.evaluate(() => document.querySelector("#explore .rotor-stage").getAttribute("data-rotor-paused"));
  check("Rotation resumes after blur", focusResumed === "false", `paused=${focusResumed}`);

  // ---- 5. Reduced motion → simple fade (no 3D) ----
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const reducedAnim = await page.evaluate(() => getComputedStyle(document.querySelector("#explore .rotor-page")).animationName);
  check("prefers-reduced-motion → simple fade animation", reducedAnim === "rotor-fade", `animation=${reducedAnim}`);
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const fullAnim = await page.evaluate(() => getComputedStyle(document.querySelector("#explore .rotor-page")).animationName);
  check("Default motion → premium 3D entrance animation", fullAnim === "rotor-enter", `animation=${fullAnim}`);

  // ---- 6. Full catalogue pages render WITHOUT a rotor ----
  for (const route of ["/accounts", "/services", "/paid-push"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(500);
    const st = await page.evaluate(() => ({
      rotors: document.querySelectorAll('[data-rotor-rotate="true"]').length,
      stages: document.querySelectorAll(".rotor-stage").length,
      sort: !!Array.from(document.querySelectorAll("select")).find((s) => /sort/i.test(s.getAttribute("aria-label") || "")),
      back: Array.from(document.querySelectorAll("a")).some((a) => /Back to home/i.test(a.textContent || "")),
      scrollY: window.scrollY,
    }));
    check(`Full catalogue page ${route} has NO rotor (full grid)`, st.rotors === 0 && st.stages === 0, JSON.stringify(st));
    check(`Full catalogue page ${route} keeps sort + back link`, st.sort && st.back, JSON.stringify(st));
    check(`Fresh load of ${route} starts at top`, st.scrollY <= 2, `scrollY=${st.scrollY}`);
  }

  // ---- 7. Responsive: 12 widths (incl. 820) — no overflow, correct stacking ----
  let overflows = 0;
  const overflowDetail = [];
  const routes4 = ["/", "/accounts", "/services", "/paid-push"];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of routes4) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(180);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) { overflows++; overflowDetail.push(`${w}px ${route} over=${over}`); }
    }
  }
  check("No horizontal overflow (12 widths x 4 routes, incl. 820px)", overflows === 0, overflowDetail.slice(0, 6).join(" | "));

  // Card stacking inside the rotor: single column on mobile, 3 columns desktop.
  await page.setViewport({ width: 390, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const mobileCols = await page.evaluate(() => {
    const grid = document.querySelector("#explore .rotor-page .grid");
    const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const stageW = document.querySelector("#explore .rotor-stage").getBoundingClientRect().width;
    return { cols, stageW, vw: window.innerWidth };
  });
  check("Mobile (390px): rotor cards stack in a single column", mobileCols.cols === 1, JSON.stringify(mobileCols));
  check("Mobile (390px): rotor stage fits viewport", mobileCols.stageW <= mobileCols.vw, JSON.stringify(mobileCols));

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const desktopCols = await page.evaluate(() => {
    const grid = document.querySelector("#explore .rotor-page .grid");
    return grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
  });
  check("Desktop (1280px): rotor cards in 3 columns", desktopCols === 3, `cols=${desktopCols}`);

  // 820px spot check (the width previously missing from regression lists)
  await page.setViewport({ width: 820, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const w820 = await page.evaluate(() => {
    const stage = document.querySelector("#explore .rotor-stage");
    const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return { over, stageW: stage.getBoundingClientRect().width, vw: window.innerWidth, rotors: document.querySelectorAll('[data-rotor-rotate="true"]').length };
  });
  check("820px: no overflow and rotor intact", w820.over <= 1 && w820.stageW <= w820.vw && w820.rotors === 4, JSON.stringify(w820));

  // ---- 8. Final navigation: sections + back/forward/refresh ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  const navOk = await page.evaluate(() => {
    const ids = ["explore", "how-it-works", "panel-seller", "paid-push", "instagram-services", "promotion", "price-guide", "compare", "list-account", "contact"];
    const missing = ids.filter((id) => !document.getElementById(id));
    const wishlist = !!document.querySelector('a[href="/wishlist"]');
    return { missing, wishlist };
  });
  check("All final-homepage sections exist (explore/price-guide/list-account/how-it-works/compare/panel/paid-push/instagram/contact)", navOk.missing.length === 0 && navOk.wishlist, JSON.stringify(navOk));

  // Anchor navigation lands each section with header offset (rotation-safe)
  for (const id of ["explore", "panel-seller", "paid-push", "instagram-services", "price-guide", "compare"]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate((targetId) => {
      const el = document.getElementById(targetId);
      el && el.scrollIntoView();
    }, id);
    await sleep(1800);
    const top = await page.evaluate((targetId) => document.getElementById(targetId).getBoundingClientRect().top, id);
    check(`Section #${id} scrolls into view cleanly`, top >= 40 && top < 200, `top=${Math.round(top)}`);
  }

  // back / forward / refresh cycle
  await page.goto(`${BASE}/wishlist`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  await page.goBack({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const backPath = await page.evaluate(() => location.pathname);
  check("Browser back returns to home", backPath === "/", backPath);
  await page.goForward({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const fwdPath = await page.evaluate(() => location.pathname);
  check("Browser forward returns to /wishlist", fwdPath === "/wishlist", fwdPath);
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  const refreshOk = await page.evaluate(() => document.querySelector('[aria-label^="Account "]') !== null || document.body.innerText.includes("Wishlist"));
  check("Refresh keeps the page functional", refreshOk);

  // ---- 9. Console errors ----
  const fatal = consoleErrors.filter((e) => !/favicon|websocket|Back-forward|BackForward/i.test(e));
  check("No console/page errors", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  await browser.close();
  console.log(failures === 0 ? "\nALL P2 CHECKS PASS" : `\n${failures} P2 CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
