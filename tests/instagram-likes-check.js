/* eslint-disable no-console */
// Headless verification for the Instagram Likes page (true clone of Views/Followers).
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const EXPECTED = [
  "10,00,000", "5,00,000", "2,00,000", "1,00,000", "75,000",
  "50,000", "25,000", "10,000", "7,500", "5,000", "3,000", "2,000", "1,000", "500", "250", "100",
];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function orderButtons(page) {
  const hs = await page.$$("main button");
  const res = [];
  for (const h of hs) {
    if (await h.evaluate((b) => b.textContent.includes("Order Now"))) res.push(h);
  }
  return res;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) failedResponses.push(`${r.status()} ${r.url()}`); });

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/instagram/likes`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);

  // 1. Page core
  const orderCount = (await orderButtons(page)).length;
  check("16 Order Now buttons", orderCount === 16, `got ${orderCount}`);
  const hero = await page.evaluate(() => document.querySelector("h1")?.textContent || "");
  check("Hero 'Very Low Price — Likes'", /Likes/.test(hero), hero);

  // 2. Every Order Now button -> correct selected package in modal
  for (let i = 0; i < EXPECTED.length; i++) {
    const btns = await orderButtons(page);
    await btns[i].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
    await sleep(250);
    const dlg = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const panel = d?.querySelector(".popup-panel");
      return { text: d?.innerText || "", panelOverflow: panel ? panel.scrollWidth - panel.clientWidth : null };
    });
    const qty = EXPECTED[i];
    check(`Likes button ${i + 1} (${qty}): modal shows selected package`, dlg.text.includes(qty) && dlg.text.includes("Likes") && dlg.text.includes("Order via WhatsApp"), dlg.text.split("\n").slice(0, 8).join(" | "));
    check(`Likes button ${i + 1}: modal panel no horizontal overflow`, dlg.panelOverflow !== null && dlg.panelOverflow <= 1, `overflow=${dlg.panelOverflow}`);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 4000 });
    await sleep(200);
  }

  // 3. WhatsApp flow with a selected Likes package
  const btns = await orderButtons(page);
  await btns[0].click(); // 10,00,000 Likes
  await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
  await sleep(200);
  await page.type("#ig-name", "Test Customer");
  await page.type("#ig-username", "testuser");
  await page.type("#ig-whatsapp", "+91 90000 00000");
  const [popup] = await Promise.all([
    new Promise((r) => page.once("popup", (p) => r(p))),
    page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Order via WhatsApp"))?.click(); }),
  ]);
  check("WhatsApp popup opens", !!popup, "");
  if (popup) {
    const waUrl = popup.url();
    check("WhatsApp URL targets 919330564851", waUrl.includes("wa.me/919330564851") || waUrl.includes("phone=919330564851"), waUrl.slice(0, 90));
    const msg = decodeURIComponent(waUrl.split("text=")[1] || "").replace(/\+/g, " ");
    check("WhatsApp message has selected 10,00,000 Likes + ₹5,000", msg.includes("10,00,000 Likes") && msg.includes("₹5,000") && msg.includes("Instagram Likes"), msg.split("\n").slice(0, 6).join(" | "));
    await popup.close();
  }
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 4000 });

  // 4. Desktop dropdown
  await page.setViewport({ width: 1440, height: 900 });
  const igBtn = await page.$('button[aria-label="Instagram menu"]');
  check("Desktop Instagram dropdown button visible", !!igBtn);
  if (igBtn) {
    await igBtn.click();
    await sleep(400);
    const ddText = await page.evaluate(() => document.body.innerText);
    check("Dropdown lists Views/Followers/Likes", /Views/.test(ddText) && /Followers/.test(ddText) && /Likes/.test(ddText));
  }

  // 5. Mobile hamburger
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/instagram/likes`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(500);
  const drawerOpened = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.querySelectorAll("span").length >= 3);
    if (!b) return false;
    b.click();
    return true;
  });
  await sleep(500);
  const drawerText = await page.evaluate(() => document.body.innerText);
  check("Mobile hamburger opens drawer with Likes", drawerOpened && drawerText.includes("Likes") && drawerText.includes("Instagram"), "");

  // 6. Horizontal overflow at all widths (Likes + modal)
  let overflowFailures = 0;
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(`${BASE}/instagram/likes`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(400);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (ov > 1) { overflowFailures++; console.log(`  !! horizontal overflow at ${w}px: ${ov}`); }
  }
  check("No horizontal overflow at all 11 widths", overflowFailures === 0);

  // 7. Views + Followers still intact
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  check("Views page has 13 Order Now buttons", (await orderButtons(page)).length === 13);
  await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
  check("Followers page has 15 Order Now buttons", (await orderButtons(page)).length === 15);

  // 8. Console errors (favicon.ico 404 is pre-existing, site-wide)
  const badResponses = failedResponses.filter((f) => !f.includes("favicon.ico"));
  check("No failing resources (excluding favicon.ico)", badResponses.length === 0, badResponses.slice(0, 5).join("\n"));
  const realErrors = consoleErrors.filter((e) => !e.includes("favicon.ico") && !e.includes("404 (Not Found)"));
  check("No console/page errors", realErrors.length === 0, realErrors.slice(0, 5).join("\n"));

  await browser.close();
  console.log(failures === 0 ? "\nALL LIKES CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(2); });
