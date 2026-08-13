/* eslint-disable no-console */
// PROMPT 1 — Homepage catalogue structure + full catalogue routes + Instagram options.
// 1. Home headings renamed: Free Fire Account Listings / Panel & Services / Paid Push — CS / BR.
// 2. Home retains full sorting catalogues (Explore accounts, Panel Seller, Paid Push) with
//    numeric Price High→Low / Low→High sort + Starter Vault VIDEO card (regression for p9).
// 3. View All links route to /accounts, /services, /paid-push; those pages render full
//    catalogues with cards + sort select + back-to-home.
// 4. Instagram Services preview: 3 category cards (Views/Followers/Likes) + More Instagram
//    Options ▾ glass dropdown (opens, lists the 3 pages, Escape closes).
// 5. Scroll-to-top on fresh navigation to / from another route (not anchors / not back-fwd).
// 6. No console errors, no horizontal overflow across widths.
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];

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
  await sleep(600);

  // ---- 1. Home section headings (renamed per PROMPT 1) ----
  const headings = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("h2, h3")).map((h) => (h.innerText || "").replace(/\s+/g, " ").trim());
    const has = (re) => all.some((t) => re.test(t));
    const igSection = document.getElementById("instagram-services");
    const igText = igSection ? (igSection.innerText || "") : "";
    return {
      accounts: has(/Free Fire account/i) && all.some((t) => /Free Fire account listings/i.test(t)),
      panel: has(/Panel & Services/i),
      push: has(/Paid Push — CS \/ BR/i),
      instagramSection: !!igSection,
      instagramServices: /Instagram Services/i.test(igText),
      social: has(/Social growth/i),
    };
  });
  check("Home shows 'Free Fire Account Listings' heading", headings.accounts, JSON.stringify(headings));
  check("Home shows 'Panel & Services' heading", headings.panel, JSON.stringify(headings));
  check("Home shows 'Paid Push — CS / BR' heading", headings.push, JSON.stringify(headings));
  check("Home shows 'Instagram Services' section heading", headings.instagramSection && headings.instagramServices && headings.social, JSON.stringify(headings));

  // ---- 2. Home retains full catalogues + Starter Vault VIDEO card (p9 regression) ----
  const homeState = await page.evaluate(() => ({
    accountCards: document.querySelectorAll("[aria-label^='Account ']").length,
    serviceCards: document.querySelectorAll("[aria-label^='Service ']").length,
    pushCards: document.querySelectorAll("[aria-label^='Rank push ']").length,
    sortAccounts: !!document.querySelector('select[aria-label="Sort accounts"]'),
    sortServices: !!document.querySelector('select[aria-label="Sort services"]'),
    sortPackages: !!document.querySelector('select[aria-label="Sort packages"]'),
    starterVault: Array.from(document.querySelectorAll("[aria-label^='Account ']")).some((c) => /Starter Vault/i.test(c.getAttribute("aria-label") || "")),
    accountsDesc: Array.from(document.querySelectorAll("[aria-label^='Account ']")).map((c) => {
      const m = (c.textContent || "").match(/₹\s*([\d,]+)/);
      return m ? Number(m[1].replace(/,/g, "")) : null;
    }).filter((v) => v !== null),
  }));
  check("Home keeps full Account catalogue (>=3 cards) + Sort accounts select", homeState.accountCards >= 3 && homeState.sortAccounts, JSON.stringify(homeState));
  check("Home keeps full Panel catalogue + Sort services select", homeState.serviceCards >= 2 && homeState.sortServices, JSON.stringify(homeState));
  check("Home keeps full Paid Push catalogue + Sort packages select", homeState.pushCards >= 2 && homeState.sortPackages, JSON.stringify(homeState));
  check("Home accounts default sort is numeric descending (High→Low)", homeState.accountsDesc.length > 1 && homeState.accountsDesc.every((v, i) => i === 0 || homeState.accountsDesc[i - 1] >= v), JSON.stringify(homeState.accountsDesc));
  check("Starter Vault VIDEO card present on home (p9 regression)", homeState.starterVault, JSON.stringify(homeState));

  // Accounts Low→High reorder (numeric)
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-asc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(400);
  const accountsAsc = await page.evaluate(() => Array.from(document.querySelectorAll("[aria-label^='Account ']")).map((c) => {
    const m = (c.textContent || "").match(/₹\s*([\d,]+)/);
    return m ? Number(m[1].replace(/,/g, "")) : null;
  }).filter((v) => v !== null));
  check("Home accounts Low→High reorders numerically ascending", accountsAsc.length > 1 && accountsAsc.every((v, i) => i === 0 || accountsAsc[i - 1] <= v), JSON.stringify(accountsAsc));
  await page.evaluate(() => {
    const s = document.querySelector('select[aria-label="Sort accounts"]');
    if (s) { s.value = "price-desc"; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await sleep(300);

  // ---- 3. View All links + catalogue pages ----
  const viewAll = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).filter((a) => (a.textContent || "").includes("View All")).map((a) => a.getAttribute("href")));
  check("Home has View All links to /accounts, /services, /paid-push",
    ["/accounts", "/services", "/paid-push"].every((h) => viewAll.includes(h)), JSON.stringify(viewAll));

  for (const [route, cardRe] of [["/accounts", /^Account /], ["/services", /^Service /], ["/paid-push", /^Rank push /]]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(500);
    const st = await page.evaluate((re) => {
      const sel = document.querySelectorAll("select");
      const sort = Array.from(sel).some((s) => /sort/i.test(s.getAttribute("aria-label") || ""));
      return { cards: document.querySelectorAll(`[aria-label]`).length, matching: Array.from(document.querySelectorAll("[aria-label^='Account '], [aria-label^='Service '], [aria-label^='Rank push ']")).length, sort, back: Array.from(document.querySelectorAll("a")).some((a) => /Back to home/i.test(a.textContent || "")), scrollY: window.scrollY };
    }, cardRe);
    check(`Full catalogue on ${route} (cards + sort + back link)`, st.matching > 0 && st.sort && st.back, JSON.stringify(st));
    check(`Fresh load of ${route} starts at top`, st.scrollY <= 2, `scrollY=${st.scrollY}`);
  }

  // ---- 4. Instagram Services preview + More Instagram Options dropdown ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const ig = await page.evaluate(() => ({
    cats: Array.from(document.querySelectorAll('a[aria-label^="Browse Instagram"]')).map((a) => ({ label: a.getAttribute("aria-label"), href: a.getAttribute("href") })),
    moreBtn: !!Array.from(document.querySelectorAll("button")).find((b) => /More Instagram Options/i.test(b.textContent || "")),
  }));
  check("Instagram preview has 3 category cards (Views/Followers/Likes)",
    ig.cats.length === 3 &&
    ig.cats.some((c) => /Views/i.test(c.label) && c.href === "/instagram/views") &&
    ig.cats.some((c) => /Followers/i.test(c.label) && c.href === "/instagram/followers") &&
    ig.cats.some((c) => /Likes/i.test(c.label) && c.href === "/instagram/likes"),
    JSON.stringify(ig));
  check("Instagram preview has 'More Instagram Options' button", ig.moreBtn);

  // Dropdown opens, lists 3 routes, Escape closes
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll("button")).find((x) => /More Instagram Options/i.test(x.textContent || ""));
    b && b.click();
  });
  await sleep(250);
  const dd = await page.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    return menu ? { expanded: document.querySelector('button[aria-expanded="true"]') !== null, items: Array.from(menu.querySelectorAll("a")).map((a) => a.getAttribute("href")) } : null;
  });
  check("More Options dropdown opens with Views/Followers/Likes",
    dd !== null && dd.expanded && ["/instagram/views", "/instagram/followers", "/instagram/likes"].every((h) => dd.items.includes(h)),
    JSON.stringify(dd));
  await page.keyboard.press("Escape");
  await sleep(250);
  const ddClosed = await page.evaluate(() => !document.querySelector('[role="menu"]'));
  check("Escape closes More Instagram Options dropdown", ddClosed);

  // Instagram category card navigates to its service page
  await page.evaluate(() => {
    const a = document.querySelector('a[aria-label="Browse Instagram Views"]');
    a && a.click();
  });
  await sleep(1500);
  const igRoute = await page.evaluate(() => location.pathname);
  check("Instagram category card navigates to /instagram/views", igRoute === "/instagram/views", igRoute);

  // ---- 5. Scroll-to-top on fresh navigation to / (not anchor, not back-fwd) ----
  await page.goto(`${BASE}/paid-push`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  await page.evaluate(() => window.scrollTo(0, 800));
  await sleep(300);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(900);
  const topAfterNav = await page.evaluate(() => window.scrollY);
  check("Fresh navigation to / scrolls to top", topAfterNav <= 2, `scrollY=${topAfterNav}`);

  // Anchor navigation preserves the anchor landing (scroll-manager must not clobber it)
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('header a')).find((x) => x.getAttribute("href") === "/#explore");
    a && a.click();
  });
  await sleep(1600);
  const anchorTop = await page.evaluate(() => document.getElementById("explore").getBoundingClientRect().top);
  check("Anchor /#explore still lands with fixed-header offset", anchorTop > 70 && anchorTop < 160, `top=${Math.round(anchorTop)}`);

  // ---- 6. No console errors + no horizontal overflow ----
  const fatal = consoleErrors.filter((e) => !/favicon|websocket|Back-forward|BackForward/i.test(e));
  check("No console/page errors", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  let overflows = 0;
  const overflowDetail = [];
  const routes2 = ["/", "/accounts", "/services", "/paid-push", "/wishlist", "/compare", "/privacy"];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of routes2) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(200);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) { overflows++; overflowDetail.push(`${w}px ${route} over=${over}`); }
    }
  }
  check("No horizontal overflow (11 widths x 7 routes)", overflows === 0, overflowDetail.slice(0, 6).join(" | "));

  await browser.close();
  console.log(failures === 0 ? "\nALL P1 CHECKS PASS" : `\n${failures} P1 CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
