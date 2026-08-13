/* eslint-disable no-console */
// PROMPT 3 — VISIBLE 5-second rotation lifecycle + FREE & PAID PROMOTION box.
// The PROMPT 3 complaint: rotation "worked internally" but cards never visibly
// disappeared/replaced. Root cause: 3/2/2 records produced a single page so no
// timer ever ran. This audit proves the fix in a REAL browser:
//   1. The account rotor really advances every ~5s (page 0 → 1 → 2 → 0).
//   2. The rotor-exit animation class is actually applied (cards float away).
//   3. The rotor-enter animation plays on the replacement page.
//   4. Visible card content changes between windows (first card title shifts).
//   5. Panel (2 windows) and Paid Push (2 windows) wrap; Instagram (3 frames)
//      advances and its featured package price changes.
//   6. Pause-on-hover still holds a section during the loop.
//   7. Promotion box: present on home + /accounts + /services + /paid-push,
//      correct honest copy, WhatsApp CTA, and responsive at 320/820/1440.
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const WIDTHS = [320, 820, 1440];

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
  await sleep(800);

  // ---- 1. Capture window-0 snapshot of the account rotor ----
  const snap0 = await page.evaluate(() => {
    const stage = document.querySelector('#explore .rotor-stage');
    const first = document.querySelector('#explore .rotor-page [aria-label^="Account "]');
    const ig = (sel) => {
      const el = document.querySelector(`#instagram-services a[aria-label="${sel}"] .text-gradient-cyan`);
      return el ? el.textContent.trim() : null;
    };
    return {
      page: stage ? stage.getAttribute("data-rotor-page") : null,
      total: stage ? stage.getAttribute("data-rotor-total") : null,
      firstCard: first ? first.getAttribute("aria-label") : null,
      igViews: ig("Browse Instagram Views"),
      igFollowers: ig("Browse Instagram Followers"),
      igLikes: ig("Browse Instagram Likes"),
      activeDots: document.querySelectorAll('#explore .rotor-dot.is-active').length,
    };
  });
  check("Account rotor window-0 snapshot (page=0 total=3)", snap0.page === "0" && snap0.total === "3", JSON.stringify(snap0));
  check("Account window-0 shows a first card", !!snap0.firstCard, JSON.stringify(snap0));
  check("Exactly one active dot on the account rotor", snap0.activeDots === 1, JSON.stringify(snap0));

  // ---- 2. Prove the exit animation actually plays in the browser ----
  let sawExit = false;
  let sawEnterAfterAdvance = false;
  const exitDeadline = Date.now() + 6500;
  while (Date.now() < exitDeadline) {
    const st = await page.evaluate(() => {
      const el = document.querySelector('#explore .rotor-page');
      const pageNo = document.querySelector('#explore .rotor-stage').getAttribute("data-rotor-page");
      const anim = el ? getComputedStyle(el).animationName : "";
      return { anim, pageNo };
    });
    if (st.anim === "rotor-exit") sawExit = true;
    if (st.pageNo === "1" && st.anim === "rotor-enter") sawEnterAfterAdvance = true;
    if (sawExit && sawEnterAfterAdvance) break;
    await sleep(60);
  }
  check("rotor-exit animation is actually applied in the browser", sawExit, "exit animation never observed in 6.5s window");
  check("After advancing, the replacement page plays rotor-enter", sawEnterAfterAdvance, "enter animation not observed after page advance");

  // ---- 3. Window 1 visible content differs from window 0 ----
  const snap1 = await page.evaluate(() => {
    const stage = document.querySelector('#explore .rotor-stage');
    const first = document.querySelector('#explore .rotor-page [aria-label^="Account "]');
    return {
      page: stage ? stage.getAttribute("data-rotor-page") : null,
      firstCard: first ? first.getAttribute("aria-label") : null,
    };
  });
  check("Account rotor advanced to window 1", snap1.page === "1", JSON.stringify(snap1));
  check("First visible card CHANGED between window 0 and window 1", snap1.firstCard && snap1.firstCard !== snap0.firstCard, `before=${snap0.firstCard} after=${snap1.firstCard}`);

  // ---- 4. Continue to t≈13s: account reaches window 2, panel/push wrap ----
  const wrapDeadline = Date.now() + 8000;
  let wrapped = false;
  while (Date.now() < wrapDeadline) {
    const p = await page.evaluate(() => document.querySelector('#explore .rotor-stage').getAttribute("data-rotor-page"));
    if (p === "2") { wrapped = true; break; }
    await sleep(80);
  }
  check("Account rotor reaches window 2 (0→1→2)", wrapped, "account rotor did not reach window 2 within 8s");

  const others = await page.evaluate(() => {
    const pg = (sel) => {
      const el = document.querySelector(`${sel} .rotor-stage`);
      return el ? el.getAttribute("data-rotor-page") : null;
    };
    const ig = () => {
      const el = document.querySelector('#instagram-services a[aria-label="Browse Instagram Views"] .text-gradient-cyan');
      return el ? el.textContent.trim() : null;
    };
    return { panel: pg('#panel-seller'), push: pg('#paid-push'), instagram: pg('#instagram-services'), igViewsNow: ig() };
  });
  check("Panel rotor wraps 2 windows (0→1→0)", others.panel === "0", JSON.stringify(others));
  check("Paid push rotor wraps 2 windows (0→1→0)", others.push === "0", JSON.stringify(others));
  check("Instagram rotor reached frame 2 (0→1→2)", others.instagram === "2", JSON.stringify(others));
  check("Instagram featured package price CHANGED across frames", others.igViewsNow && others.igViewsNow !== snap0.igViews, `before=${snap0.igViews} after=${others.igViewsNow}`);

  // ---- 5. Pause-on-hover still freezes a section mid-loop ----
  await page.evaluate(() => document.getElementById("panel-seller").scrollIntoView({ behavior: "instant", block: "start" }));
  // Wait for scroll to fully settle before computing the rotor's on-screen box.
  let stable = false;
  let lastY = -1;
  for (let i = 0; i < 20 && !stable; i++) {
    await sleep(150);
    const y = await page.evaluate(() => window.scrollY);
    stable = y === lastY;
    lastY = y;
  }
  const stageBox = await page.evaluate(() => {
    const r = document.querySelector('#panel-seller .rotor-stage').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(stageBox.x, stageBox.y);
  await sleep(500);
  const pausedNow = await page.evaluate(() => document.querySelector('#panel-seller .rotor-stage').getAttribute("data-rotor-paused"));
  const pageBefore = await page.evaluate(() => document.querySelector('#panel-seller .rotor-stage').getAttribute("data-rotor-page"));
  await sleep(5200);
  const pageDuring = await page.evaluate(() => document.querySelector('#panel-seller .rotor-stage').getAttribute("data-rotor-page"));
  check("Hover pauses the panel rotor", pausedNow === "true", `paused=${pausedNow}`);
  check("Paused rotor does NOT advance during a full interval", pageDuring === pageBefore, `before=${pageBefore} during=${pageDuring}`);
  await page.mouse.move(8, 8);
  await sleep(1800);

  // ---- 6. Promotion box on home + catalogue pages + honest copy ----
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);
  const promoHome = await page.evaluate(() => {
    const box = document.querySelector('[data-testid="promotion-info-box"]');
    const text = box ? box.textContent || "" : "";
    const cta = box ? box.querySelector('a[aria-label^="Contact FF TRUST directly"]') : null;
    return {
      exists: !!box,
      section: !!document.getElementById("promotion"),
      free: /FREE & PAID PROMOTION/.test(text),
      freePromo: /FREE PROMOTION/.test(text),
      paidPromo: /PAID PROMOTION/.test(text),
      instagramCats: /Instagram/i.test(text) && /Views/.test(text) && /Followers/.test(text) && /Likes/.test(text),
      ffCats: /ID \/ Account/.test(text) && /Panel Services/.test(text) && /CS Rank Push/.test(text) && /BR Rank Push/.test(text),
      disclaimer: /Independent platform/.test(text) && /No password \/ OTP collection/.test(text) && /never claims/.test(text),
      cta: cta ? cta.getAttribute("href") || "" : "",
    };
  });
  check("Promotion box present on home inside #promotion section", promoHome.exists && promoHome.section, JSON.stringify(promoHome));
  check("Promotion box has FREE & PAID headings", promoHome.free && promoHome.freePromo && promoHome.paidPromo, JSON.stringify(promoHome));
  check("Promotion box lists Free Fire + Instagram categories", promoHome.instagramCats && promoHome.ffCats, JSON.stringify(promoHome));
  check("Promotion box has honest disclaimer (independent / no OTP / no claims)", promoHome.disclaimer, JSON.stringify(promoHome));
  check("Promotion box WhatsApp CTA links to wa.me", /^https:\/\/wa\.me\//.test(promoHome.cta), promoHome.cta);

  for (const route of ["/accounts", "/services", "/paid-push"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(500);
    const ok = await page.evaluate(() => !!document.querySelector('[data-testid="promotion-info-box"]'));
    check(`Promotion box present on ${route}`, ok);
  }

  // ---- 7. Promotion box responsive (320 / 820 / 1440, no overflow) ----
  const routes4 = ["/", "/accounts", "/services", "/paid-push"];
  let overflowBad = 0;
  const overflowDetail = [];
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    for (const route of routes4) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0", timeout: 60000 });
      await sleep(180);
      const m = await page.evaluate(() => {
        const box = document.querySelector('[data-testid="promotion-info-box"]');
        const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const boxW = box ? box.getBoundingClientRect().width : 0;
        return { over, boxW, vw: window.innerWidth };
      });
      // Decorative blur gradients extend past the card (overflow:hidden clips
      // them), so only page-level overflow and box width matter here.
      if (m.over > 1 || m.boxW > m.vw) {
        overflowBad++;
        overflowDetail.push(`${w}px ${route} ${JSON.stringify(m)}`);
      }
    }
  }
  check("Promotion box + page have zero horizontal overflow (320/820/1440 x 4 routes)", overflowBad === 0, overflowDetail.slice(0, 6).join(" | "));

  // Mobile stacking: promo free/paid cards collapse to one column at 320.
  await page.setViewport({ width: 320, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(400);
  const stack = await page.evaluate(() => {
    const box = document.querySelector('[data-testid="promotion-info-box"]');
    const grid = box ? box.querySelector(".grid") : null;
    const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : -1;
    return cols;
  });
  check("Promotion box stacks to a single column on 320px", stack === 1, `cols=${stack}`);

  // ---- 8. No console/page errors ----
  const fatal = consoleErrors.filter((e) => !/favicon|websocket|Back-forward|BackForward/i.test(e));
  check("No console/page errors", fatal.length === 0, fatal.slice(0, 5).join(" | "));

  await browser.close();
  console.log(failures === 0 ? "\nALL P3 CHECKS PASS" : `\n${failures} P3 CHECKS FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})();
