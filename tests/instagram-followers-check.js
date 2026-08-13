/* eslint-disable no-console */
// Headless verification for the Instagram Followers page (true clone of Views).
const puppeteer = require("puppeteer-core");

const BASE = "http://localhost:1111";
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

let failures = 0;
function check(name, ok, extra = "") {
  if (ok) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name} ${extra}`);
  }
}

// Click the first <button> whose textContent contains the given text.
async function clickByText(page, text) {
  const clicked = await page.evaluate((t) => {
    const btns = [...document.querySelectorAll("main button, button")];
    const b = btns.find((x) => x.textContent.includes(t));
    if (b) {
      b.click();
      return true;
    }
    return false;
  }, text);
  if (!clicked) throw new Error("button not found: " + text);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,900"],
  });

  // ---------- 1. Followers page core ----------
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedResponses = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failedResponses.push(`${r.status()} ${r.url()}`);
  });

  await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
  check("Followers page HTTP loads", (await page.content()).length > 0);

  const orderButtons = await page.$$eval("main button", (btns) =>
    btns.filter((b) => b.textContent.includes("Order Now")).length,
  );
  check("15 Order Now buttons", orderButtons === 15, `got ${orderButtons}`);

  const cardLabels = await page.$$eval(".font-mono-label", (els) =>
    els.map((e) => e.textContent.trim()),
  );
  check("Card label FOLLOWERS present", cardLabels.includes("FOLLOWERS"));

  const hero = await page.evaluate(() => document.querySelector("h1")?.textContent || "");
  check("Hero 'Very Low Price — Followers'", /Followers/.test(hero), hero);

  const savedAmounts = await page.$$eval(".grid span", (els) =>
    els.filter((e) => e.textContent.startsWith("SAVE")).map((e) => e.textContent.replace(/\s+/g, " ").trim()),
  );
  check("First savings chips SAVE ₹26,000 + SAVE 58%", savedAmounts[0] === "SAVE ₹26,000" && savedAmounts[1] === "SAVE 58%", savedAmounts.slice(0, 2).join(" | "));

  // ---------- 2. Order modal + selected package ----------
  await clickByText(page, "Order Now");
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  const dialogText = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText || "");
  check("Modal opens on Order Now click", dialogText.length > 0);
  check(
    "Selected package shows 10,00,000 Followers",
    dialogText.includes("10,00,000") && dialogText.includes("Followers"),
    dialogText.split("\n").slice(0, 6).join(" | "),
  );
  check("Modal shows discount ₹19,000", dialogText.includes("₹19,000"));
  check("Modal shows original ₹45,000", dialogText.includes("₹45,000"));
  check("Modal SAVE chip", dialogText.includes("SAVE ₹26,000 (58%)"));

  // ---------- 3. Validation + WhatsApp URL ----------
  await clickByText(page, "Order via WhatsApp");
  await new Promise((r) => setTimeout(r, 300));
  const errs = await page.evaluate(() => document.body.innerText);
  check("Validation blocks empty form", /required/i.test(errs), "");
  const dialogStillOpen = await page.$('[role="dialog"]');
  check("Modal stays open on invalid submit", !!dialogStillOpen);

  await page.type("#ig-name", "Test Customer");
  await page.type("#ig-username", "testuser");
  await page.type("#ig-whatsapp", "+91 90000 00000");
  await page.type("#ig-note", "Deliver fast");
  const [popup] = await Promise.all([
    new Promise((r) => page.once("popup", (p) => r(p))),
    clickByText(page, "Order via WhatsApp"),
  ]);
  check("WhatsApp popup opens", !!popup, "");
  if (popup) {
    let waUrl = popup.url();
    // wa.me redirects to api.whatsapp.com/send/ — both keep the phone number.
    check(
      "WhatsApp URL targets 919330564851",
      waUrl.includes("wa.me/919330564851") || waUrl.includes("phone=919330564851"),
      waUrl.slice(0, 90),
    );
    const raw = waUrl.split("text=")[1] || "";
    const msg = decodeURIComponent(raw).replace(/\+/g, " ");
    check(
      "WhatsApp message includes Followers package + prices",
      msg.includes("10,00,000 Followers") && msg.includes("₹19,000") && msg.includes("Instagram Followers"),
      msg.split("\n").slice(0, 6).join(" | "),
    );
    await popup.close();
  }
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 300));
  check("Modal closes on Escape", !(await page.$('[role="dialog"]')));

  // ---------- 4. Desktop dropdown ----------
  await page.setViewport({ width: 1440, height: 900 });
  const igBtn = await page.$('button[aria-label="Instagram menu"]');
  check("Desktop Instagram dropdown button visible", !!igBtn);
  if (igBtn) {
    await igBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    const ddText = await page.evaluate(() => document.body.innerText);
    check("Dropdown lists Views/Followers/Likes", /Views/.test(ddText) && /Followers/.test(ddText) && /Likes/.test(ddText));
    await page.evaluate(() => {
      const f = [...document.querySelectorAll("a")].find((l) => l.getAttribute("href") === "/instagram/followers");
      f?.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    check("Dropdown Followers link navigates", page.url().endsWith("/instagram/followers"), page.url());
  }

  // ---------- 5. Mobile hamburger presence ----------
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
  const hamburgerExists = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    return btns.some((b) => b.querySelectorAll("span").length >= 3);
  });
  check("Hamburger present on mobile (375px)", hamburgerExists);

  // ---------- 6. Horizontal overflow at all widths ----------
  let overflowFailures = 0;
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(`${BASE}/instagram/followers`, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 400));
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - de.clientWidth;
    });
    if (overflow > 1) {
      overflowFailures++;
      console.log(`  !! horizontal overflow at ${w}px: scrollWidth-clientWidth = ${overflow}`);
    }
  }
  check("No horizontal overflow at all 11 widths", overflowFailures === 0);

  // ---------- 7. Views page still intact ----------
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/instagram/views`, { waitUntil: "networkidle0", timeout: 60000 });
  const viewsOrder = await page.$$eval("main button", (btns) =>
    btns.filter((b) => b.textContent.includes("Order Now")).length,
  );
  check("Views page still has 13 Order Now buttons", viewsOrder === 13, `got ${viewsOrder}`);
  await clickByText(page, "Order Now");
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  const viewsDialog = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText || "");
  check("Views modal still says Views", viewsDialog.includes("Views"), "");

  // ---------- 8. Console errors (favicon.ico 404 is pre-existing, site-wide) ----------
  const badResponses = failedResponses.filter((f) => !f.includes("favicon.ico"));
  check(
    "No failing resources (excluding pre-existing favicon.ico 404)",
    badResponses.length === 0,
    badResponses.slice(0, 5).join("\n"),
  );
  const realConsoleErrors = consoleErrors.filter(
    (e) => !e.includes("favicon.ico") && !e.includes("404 (Not Found)"),
  );
  check(
    "No console/page errors on Followers + Views",
    realConsoleErrors.length === 0,
    realConsoleErrors.slice(0, 5).join("\n"),
  );

  await browser.close();
  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
  console.error("TEST ERROR:", e);
  process.exit(2);
});
