import puppeteer from "puppeteer";

const BASE = "http://localhost:1111";
let P = 0, F = 0;
const R: string[] = [];
const ok = (l: string) => { P++; R.push(`  ✅ ${l}`); };
const fail = (l: string, d?: string) => { F++; R.push(`  ❌ ${l}${d ? ` — ${d}` : ""}`); };
async function t(n: string, fn: () => Promise<void>) { try { await fn(); } catch (e: any) { fail(n, e.message?.substring(0, 200)); } }

async function visibleBtn(page: any, label: string): Promise<any> {
  for (const b of await page.$$('button')) {
    const l = await page.evaluate((e: any) => e.getAttribute('aria-label'), b);
    if (l === label) { const box = await b.boundingBox(); if (box && box.width > 0) return b; }
  }
  return null;
}

const MODAL_LABEL = "List Your Account";

async function assertModalOpen(page: any, label: string) {
  await new Promise(r => setTimeout(r, 500));
  const modal = await page.$(`[role="dialog"][aria-label="${MODAL_LABEL}"]`);
  if (modal) { ok(label); return true; }
  fail(label, "No modal with label '" + MODAL_LABEL + "'");
  return false;
}

async function assertModalClosed(page: any, label: string) {
  await new Promise(r => setTimeout(r, 500));
  const modal = await page.$(`[role="dialog"][aria-label="${MODAL_LABEL}"]`);
  if (!modal) { ok(label); return true; }
  fail(label, "Modal still open");
  return false;
}

async function closeModal(page: any) {
  const closeBtn = await page.$(`[role="dialog"][aria-label="${MODAL_LABEL}"] button[aria-label="Close"]`);
  if (closeBtn) await closeBtn.click();
  await new Promise(r => setTimeout(r, 500));
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  // ======= DESKTOP =======
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });

  // 1. Desktop navbar Contact → modal
  await t('1. Desktop: navbar "Contact" → List Your Account modal', async () => {
    await p.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    const btn = await visibleBtn(p, 'Contact to Owner');
    if (!btn) { fail('No Contact button'); return; }
    await btn.click();
    await assertModalOpen(p, 'Modal opened');
  });

  // 2. Close and reopen
  await t('2. Close modal → reopen via Contact', async () => {
    await closeModal(p);
    await assertModalClosed(p, 'Modal closed');
    const btn = await visibleBtn(p, 'Contact to Owner');
    if (!btn) { fail('No Contact button'); return; }
    await btn.click();
    await assertModalOpen(p, 'Modal reopened');
  });

  // 3. Modal has correct sections
  await t('3. Modal has "List Your Account" title', async () => {
    const title = await p.$eval(`[role="dialog"][aria-label="${MODAL_LABEL}"]`, (el: any) => el.textContent || '');
    if (title.includes('List Your Account')) ok('Title found');
    else fail('Title missing');
  });

  await t('4. Modal has "Buyer safety" section', async () => {
    const text = await p.$eval(`[role="dialog"][aria-label="${MODAL_LABEL}"]`, (el: any) => el.textContent || '');
    if (text.includes('Buyer safety') || text.includes('SCREEN RECORDING')) ok('Buyer safety found');
    else fail('Buyer safety missing');
  });

  await t('5. Modal has "Seller requirements"', async () => {
    const text = await p.$eval(`[role="dialog"][aria-label="${MODAL_LABEL}"]`, (el: any) => el.textContent || '');
    if (text.includes('Seller requirements') || text.includes('screen recording')) ok('Requirements found');
    else fail('Requirements missing');
  });

  await t('6. Modal has password/OTP warning', async () => {
    const text = await p.$eval(`[role="dialog"][aria-label="${MODAL_LABEL}"]`, (el: any) => el.textContent || '');
    if (text.includes('password') || text.includes('OTP') || text.includes('recovery codes')) ok('Password warning found');
    else fail('Password warning missing');
  });

  await t('7. Modal has "Contact Owner on WhatsApp" button', async () => {
    const btns = await p.$$eval(`[role="dialog"][aria-label="${MODAL_LABEL}"] button`, (els: any[]) =>
      els.map(e => e.textContent?.trim())
    );
    if (btns.some(t => t?.includes('Contact Owner on WhatsApp'))) ok('WhatsApp CTA found');
    else fail('WhatsApp CTA missing', JSON.stringify(btns));
  });

  await closeModal(p);

  // 8. Homepage "List Your Account" section → same modal
  await t('8. Homepage "List Your Account" section → same modal', async () => {
    await p.goto(`${BASE}/#list-account`, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    // Look for any button with "Contact to Owner" text in the List Your Account section
    const clicked = await p.evaluate(() => {
      for (const btn of document.querySelectorAll('button')) {
        const text = btn.textContent || '';
        if (text.includes('Contact to Owner') && !btn.closest('nav') && !btn.closest('[role="dialog"]')) {
          (btn as HTMLElement).click();
          return true;
        }
      }
      return false;
    });
    if (clicked) await assertModalOpen(p, 'Homepage CTA → same modal');
    else fail('Homepage CTA not found');
  });

  await closeModal(p);

  // 9. Escape key closes modal
  await t('9. Escape key closes modal', async () => {
    const btn = await visibleBtn(p, 'Contact to Owner');
    if (!btn) { fail('No Contact button'); return; }
    await btn.click();
    await new Promise(r => setTimeout(r, 500));
    await p.keyboard.press('Escape');
    await assertModalClosed(p, 'Escape closes modal');
  });

  // 10. No horizontal overflow with modal
  await t('10. Desktop: no horizontal overflow with modal open', async () => {
    const btn = await visibleBtn(p, 'Contact to Owner');
    if (!btn) { fail('No Contact button'); return; }
    await btn.click();
    await new Promise(r => setTimeout(r, 500));
    const hasOverflow = await p.evaluate(() => document.body.scrollWidth > window.innerWidth + 2);
    if (!hasOverflow) ok('No overflow');
    else fail('Has overflow');
    await closeModal(p);
  });

  // ======= MOBILE =======
  const m = await browser.newPage();
  await m.setViewport({ width: 375, height: 812 });

  await t('11. Mobile: hamburger → Contact to Owner → same modal', async () => {
    await m.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    const ham = await visibleBtn(m, 'Open menu');
    if (!ham) { fail('No hamburger'); return; }
    await ham.click();
    await new Promise(r => setTimeout(r, 2000));
    // Find "Contact to Owner" inside the drawer
    const clicked = await m.evaluate(() => {
      for (const btn of document.querySelectorAll('button')) {
        const text = btn.textContent || '';
        if (text.includes('Contact to Owner') && btn.closest('[role="dialog"][aria-label="Command center"]')) {
          (btn as HTMLElement).click();
          return true;
        }
      }
      return false;
    });
    if (clicked) await assertModalOpen(m, 'Mobile drawer → same modal');
    else fail('Mobile Contact to Owner button not found');
  });

  await t('12. Mobile: modal has correct content', async () => {
    const text = await m.$eval(`[role="dialog"][aria-label="${MODAL_LABEL}"]`, (el: any) => el.textContent || '');
    if (text.includes('List Your Account') && text.includes('WhatsApp')) ok('Content verified');
    else fail('Content mismatch');
  });

  await t('13. Mobile: no horizontal overflow with modal', async () => {
    const hasOverflow = await m.evaluate(() => document.body.scrollWidth > window.innerWidth + 2);
    if (!hasOverflow) ok('No overflow');
    else fail('Has overflow');
  });

  await closeModal(m);

  // 14. Close/reopen on mobile
  await t('14. Mobile: close and reopen modal', async () => {
    const ham = await visibleBtn(m, 'Open menu');
    if (!ham) { fail('No hamburger'); return; }
    await ham.click();
    await new Promise(r => setTimeout(r, 2000));
    const clicked = await m.evaluate(() => {
      for (const btn of document.querySelectorAll('button')) {
        const text = btn.textContent || '';
        if (text.includes('Contact to Owner') && btn.closest('[role="dialog"][aria-label="Command center"]')) {
          (btn as HTMLElement).click();
          return true;
        }
      }
      return false;
    });
    if (!clicked) { fail('Could not open from drawer'); return; }
    await assertModalOpen(m, 'Reopened');
    await closeModal(m);
    await assertModalClosed(m, 'Closed again');
  });

  // RESULTS
  console.log('\n' + '='.repeat(70));
  console.log('  FF TRUST — MODAL FLOW VERIFICATION');
  console.log('='.repeat(70));
  R.forEach(r => console.log(r));
  console.log('='.repeat(70));
  console.log(`  PASSED: ${P}  FAILED: ${F}`);
  console.log('='.repeat(70));
  if (F > 0) console.log(`\n⚠️  ${F} test(s) failed`);
  else console.log('\n✅ ALL 14 MODAL TESTS PASSED!');

  await browser.close();
  process.exit(F > 0 ? 1 : 0);
})();
