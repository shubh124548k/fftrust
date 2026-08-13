/* eslint-disable no-console */
const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:1111";

const EXPECTED = [
  "10,00,000", "5,00,000", "2,00,000", "1,00,000", "75,000",
  "50,000", "25,000", "10,000", "7,500", "5,000", "3,000", "2,000", "1,000", "500", "250",
];

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) console.log(`PASS  ${name}`);
  else { failures++; console.log(`FAIL  ${name} ${extra}`); }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function orderButtons(page) {
  return page.$$("main button").then((hs) =>
    Promise.all(hs.map(async (h) => (await h.evaluate((b) => b.textContent.includes("Order Now")) ? h : null))).then((r) => r.filter(Boolean)),
  );
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(600);

  // 1. Click every Order Now button (in order) and verify the selected package
  for (let i = 0; i < EXPECTED.length; i++) {
    const btns = await orderButtons(page);
    if (i < btns.length) await btns[i].click();
    await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
    await sleep(250);
    const dlg = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const panel = d?.querySelector(".popup-panel");
      return {
        text: d?.innerText || "",
        panelOverflow: panel ? panel.scrollWidth - panel.clientWidth : null,
      };
    });
    const qty = EXPECTED[i];
    check(`Order button ${i + 1} (${qty}): modal shows selected package`, dlg.text.includes(qty) && dlg.text.includes("Followers") && dlg.text.includes("Order via WhatsApp"), dlg.text.split("\n").slice(0, 8).join(" | "));
    check(`Order button ${i + 1}: modal panel no horizontal overflow`, dlg.panelOverflow !== null && dlg.panelOverflow <= 1, `overflow=${dlg.panelOverflow}`);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 4000 });
    await sleep(200);
  }

  // 2. Modal at 320px width — no overflow, no clipping
  await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
  await page.setViewport({ width: 320, height: 700 });
  await sleep(600);
  const b0 = (await orderButtons(page))[0];
  await b0.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 4000 });
  await sleep(400);
  const m320 = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const panel = d?.querySelector(".popup-panel");
    const r = panel ? panel.getBoundingClientRect() : null;
    return {
      panelOverflow: panel ? panel.scrollWidth - panel.clientWidth : null,
      left: r ? Math.round(r.left) : null,
      right: r ? Math.round(r.right) : null,
      width: r ? Math.round(r.width) : null,
      vw: window.innerWidth,
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  check("Modal at 320px: panel fits inside viewport", m320.left !== null && m320.left >= 0 && m320.right !== null && m320.right <= 320, JSON.stringify(m320));
  check("Modal at 320px: no internal horizontal overflow", m320.panelOverflow !== null && m320.panelOverflow <= 1, `overflow=${m320.panelOverflow}`);
  check("Modal at 320px: page has no horizontal overflow", m320.docOverflow <= 1, `docOverflow=${m320.docOverflow}`);

  // 3. Mobile hamburger drawer: opens, shows Instagram + Followers link
  await page.keyboard.press("Escape");
  await sleep(250);
  const drawerOpened = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const b = btns.find((x) => x.querySelectorAll("span").length >= 3);
    if (!b) return false;
    b.click();
    return true;
  });
  await sleep(600);
  const drawerText = await page.evaluate(() => document.body.innerText);
  check("Mobile hamburger opens drawer with Instagram + Followers", drawerOpened && drawerText.includes("Followers") && drawerText.includes("Instagram"), "");

  await browser.close();
  console.log(failures === 0 ? "\nALL DEEP CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error("TEST ERROR:", e); process.exit(2); });
