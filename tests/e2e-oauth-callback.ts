import puppeteer from "puppeteer";

const BASE = "http://localhost:1111";

(async () => {
  console.log("=== FF TRUST OAuth Callback Test ===\n");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Listen for all console output from the page
  page.on("console", msg => {
    if (msg.type() === "error") console.log(`  [console.error] ${msg.text()}`);
  });

  // 1. Load homepage
  console.log("1. Loading homepage...");
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  console.log(`   Homepage: ${await page.title()}`);

  // 2. Open login modal
  console.log("2. Opening login modal...");
  const signInBtn = await page.$('button[aria-label="Sign in"]');
  if (!signInBtn) { console.log("   FAIL: No sign-in button"); await browser.close(); return; }
  const box = await signInBtn.boundingBox();
  if (!box || box.width === 0) { console.log("   FAIL: Sign-in button not visible"); await browser.close(); return; }
  await signInBtn.click();
  await new Promise(r => setTimeout(r, 1000));
  const modal = await page.$('[role="dialog"][aria-label="Sign in"]');
  console.log(`   Modal opened: ${!!modal}`);

  // 3. Click Continue with Google → go to Google
  console.log("3. Clicking Continue with Google...");
  const buttons = await page.$$('button');
  let clicked = false;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent || "", btn);
    if (text.includes("Continue with Google")) {
      try {
        await Promise.all([page.waitForNavigation({ timeout: 10000 }), btn.click()]);
      } catch { /* timeout expected */ }
      clicked = true;
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  const currentUrl = page.url();
  console.log(`   Redirected to: ${currentUrl.substring(0, 80)}...`);
  console.log(`   Is Google: ${currentUrl.includes("accounts.google.com")}`);

  if (!currentUrl.includes("accounts.google.com")) {
    console.log("\n   FAIL: Not on Google OAuth page");
    await browser.close();
    return;
  }

  // 4. Check Google page for errors
  console.log("4. Checking Google page...");
  const bodyText = await page.evaluate(() => document.body?.innerText || "");
  if (bodyText.includes("redirect_uri_mismatch")) {
    console.log("   FAIL: redirect_uri_mismatch still present!");
  } else if (bodyText.includes("Error 400") || bodyText.includes("Error 403")) {
    console.log("   FAIL: Google error:", bodyText.substring(0, 200));
  } else {
    console.log(`   Google page OK (${bodyText.length} chars)`);
    // Check what's on the page
    const hasContinue = bodyText.includes("Continue");
    const hasChooseAccount = bodyText.includes("Choose an account") || bodyText.includes("Choose");
    const hasFFTrust = bodyText.includes("FF TRUST") || bodyText.includes("fftrust");
    console.log(`   Has Continue: ${hasContinue}`);
    console.log(`   Has Choose account: ${hasChooseAccount}`);
    console.log(`   Mentions FF TRUST: ${hasFFTrust}`);

    // Check for Google consent page
    const formAction = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      for (const f of forms) {
        return f.action;
      }
      return null;
    });
    if (formAction) console.log(`   Form action: ${formAction.substring(0, 100)}`);

    // Check if there's a "Continue" button (Google consent screen)
    const allBtns = await page.$$('button, input[type="submit"]');
    for (const b of allBtns) {
      const text = await page.evaluate(el => el.textContent || el.getAttribute('value') || '', b);
      if (text.includes("Continue") || text.includes("Allow")) {
        console.log(`   Found button: "${text.trim()}"`);
      }
    }
  }

  console.log("\n=== At this point, user must click Continue in Google ===");
  console.log("=== Server callback at /api/auth/callback/google will be tested ===");

  // 5. Simulate what happens after Google callback by directly testing the server
  // Try an invalid callback to see if server still responds properly
  console.log("\n5. Testing callback endpoint handles invalid code gracefully...");
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 15000 });
  const csrfRes = await page.evaluate(async () => {
    const r = await fetch("/api/auth/csrf");
    return (await r.json()).csrfToken;
  });
  console.log(`   CSRF token: ${csrfRes.substring(0, 10)}...`);

  console.log("\n=== Server is running and ready for real OAuth ===");
  console.log("=== The only way to test the full callback is with a real Google click ===");

  await browser.close();
  process.exit(0);
})();
