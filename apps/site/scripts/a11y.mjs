// Accessibility check: Playwright + axe on "/" at desktop and mobile, with the hero once its intro has finished, the hero chip, SourceViewer,
// FAQ item, summary dialog, Cite popover, the film player (the film view, the audio description switch on, the text view with its send pill,
// the end card, and a film that will not load), /film-text, the closing section's
// launcher and the conversation sheet (step 1, step 2, step 6, its error summary, the early-access list and its errors) open, plus the three legal pages.
// Prints every violation. Exits 1 on any serious or critical one.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const browser = await chromium.launch();
let failures = 0;
let scans = 0;

async function audit(label, page, exclude) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  if (exclude) builder.exclude(exclude);
  const { violations } = await builder.analyze();
  scans++;
  if (violations.length === 0) {
    console.log(`PASS  ${label}: no violations`);
    return;
  }
  for (const v of violations) {
    const bad = v.impact === 'serious' || v.impact === 'critical';
    if (bad) failures++;
    console.log(`${bad ? 'FAIL' : 'note'}  ${label}: [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})`);
    for (const n of v.nodes.slice(0, 4)) console.log(`        ${n.target.join(' ')}\n        ${(n.failureSummary ?? '').split('\n').slice(0, 3).join(' | ')}`);
  }
}

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }, false],
  ['mobile', { width: 390, height: 844 }, true],
];

for (const [name, vp, mobile] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript(() => { window.__qa = true; });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  // The hero's intro and the film message's snap run for about 4.5 s after load; scan once they have finished, so no piece is mid-fade.
  await page.waitForFunction(() => document.querySelector('.film-tile')?.dataset.snap === 'ended', null, { timeout: 20000 });
  await page.waitForTimeout(3200);
  await audit(`${name} / (hero after the intro)`, page);

  // The section reveals: scan with every heading mid-reveal (words still rising, each heading's name still whole) and once settled. The
  // messages still on their way in (marked data-rv) are left out of the mid-reveal scans, as a half-faded one has no contrast to measure.
  for (const id of ['problem-h', 'how-h', 'privacy-h', 'faq-h']) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'center' }), id);
    await page.waitForTimeout(120);
    await audit(`${name} / (heading #${id} mid-reveal)`, page, '[data-rv]');
    await page.waitForTimeout(1200);
  }
  await audit(`${name} / (headings revealed)`, page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.locator('.hero-chips').getByRole('radio', { name: 'Housing' }).click();
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await audit(`${name} / (Housing chosen)`, page);

  await page.getByRole('button', { name: 'See the page' }).click();
  await page.waitForTimeout(400);
  await audit(`${name} / (SourceViewer open)`, page);
  await page.keyboard.press('Escape');

  // FAQ item open.
  await page.locator('.faq__btn').nth(1).click();
  await page.waitForTimeout(400);
  await audit(`${name} / (FAQ item open)`, page);

  // Summary preview dialog open.
  await page.locator('.get-attach', { hasText: 'Summary for my lawyer' }).click();
  await page.waitForTimeout(400);
  await audit(`${name} / (summary dialog open)`, page);
  await page.keyboard.press('Escape');

  // Cite popover open.
  await page.locator('#ask .cite__btn').nth(1).click();
  await page.waitForTimeout(400);
  await audit(`${name} / (Cite popover open)`, page);
  await page.keyboard.press('Escape');

  // The film player: the film view (playing), the text view, and the end state with its overlay.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.film-tile').click();
  await page.waitForSelector('dialog.film-player[open]');
  await page.waitForFunction(() => document.querySelector('.film-video').currentTime > 1);
  await audit(`${name} / (film player, film view)`, page);
  await page.locator('.film-switch').click();
  await page.waitForTimeout(900);
  await audit(`${name} / (film player, audio description on)`, page);
  await page.locator('.film-switch').click();
  await page.waitForTimeout(500);
  await page.locator('.film-foot__toggle').click();
  await page.waitForTimeout(300);
  await audit(`${name} / (film player, text view)`, page);
  await page.evaluate(() => { const t = document.querySelector('.film-text'); t.scrollTop = t.scrollHeight; });
  await page.waitForTimeout(200);
  await audit(`${name} / (film player, text view scrolled to its send pill)`, page);
  await page.locator('.film-foot__toggle').click();
  await page.evaluate(() => { const v = document.querySelector('.film-video'); v.currentTime = v.duration - 0.5; v.play(); });
  await page.waitForSelector('.film-end', { timeout: 20000 });
  await page.waitForTimeout(600);
  await audit(`${name} / (film player, end card)`, page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // The closing section's launcher (question 1 as the first message), then the conversation sheet: opened from the hero's
  // send pill at step 1, then step 2, step 6, step 6 with its error summary, the early-access list open, and the list with its errors.
  await page.evaluate(() => document.querySelector('#start')?.scrollIntoView());
  await audit(`${name} / (closing section launcher)`, page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#hero-reply-bar').click();
  await page.waitForTimeout(600);
  await audit(`${name} / (conversation sheet open, step 1)`, page);

  const chat = '.convo-sheet .chat';
  const pick = (label) =>
    page
      .locator(`${chat} .opt`)
      .filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) })
      .locator('input')
      .first()
      .click();
  const progress = () => page.locator(`${chat} .chat__progress`).first().innerText().catch(() => '');
  // A pointer click moves on by itself, except where a note holds the step; then Next is used.
  const answer = async (label) => {
    const before = await progress();
    await pick(label);
    await page.waitForTimeout(900);
    if ((await progress()) === before) {
      await page.locator(`.convo-sheet .composer-dock .composer__go`).first().click();
      await page.waitForTimeout(300);
    }
  };
  await answer('Job or workplace');
  await audit(`${name} / (conversation sheet open, step 2)`, page);
  for (const label of ['Ontario', 'In the next 2 weeks', 'Yes', 'A few documents']) await answer(label);
  // Arrival: step 6 exactly as the visitor first sees it (not scrolled), with the target-size rule (wcag22aa) on.
  await audit(`${name} / (conversation sheet, step 6 just arrived)`, page);
  await pick('Phone call');
  await page.locator(`.convo-sheet .composer-dock .composer__go`).click();
  await page.waitForTimeout(400);
  await audit(`${name} / (conversation sheet, step 6 with phone-required error summary)`, page);
  await page.locator('.convo-sheet .wl-toggle').scrollIntoViewIfNeeded();
  await page.locator('.convo-sheet .wl-toggle').click();
  await page.waitForTimeout(300);
  await audit(`${name} / (conversation sheet, waitlist open)`, page);
  await page.locator('.convo-sheet #waitlist button[type="submit"]').click();
  await page.waitForTimeout(400);
  await audit(`${name} / (conversation sheet, waitlist with error summary)`, page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#start')?.scrollIntoView());
  await audit(`${name} / (launcher after closing partway)`, page);
  await ctx.close();
}

// The film that will not load: the message and the text offer.
for (const [name, vp, mobile] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.route('**/film/case-iq-film-30s*.mp4', (r) => r.abort());
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.locator('.film-tile').click();
  await page.waitForSelector('.film-fail', { timeout: 10000 });
  await audit(`${name} / (film player, the film did not load)`, page);
  await ctx.close();
}

// The legal pages, and the film's text version as a page of its own.
for (const [name, vp, mobile] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  for (const path of ['/privacy', '/terms', '/accessibility', '/film-text']) {
    await page.goto(BASE_URL + path, { waitUntil: 'networkidle' });
    await audit(`${name} ${path}`, page);
  }
  await ctx.close();
}

await browser.close();
console.log(`\na11y: ${scans} scans.`);
if (failures > 0) {
  console.error(`a11y: ${failures} serious or critical violation(s).`);
  process.exit(1);
}
console.log('a11y: no serious or critical violations.');
