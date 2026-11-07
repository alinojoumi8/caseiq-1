// Screenshot harness for the critique loop (build brief section 10).
// Run against a running site: BASE_URL=http://localhost:3100 RUN_ID=integration-r3b TARGETED=1 npm run shots   (TARGETED=1 runs only the r3b steps; leave it out for the whole set)
// The conversation sheet set: BASE_URL=http://localhost:3100 TARGETED=convo npm run shots   (runs only the steps named "convo ...", saves to .shots/convo-r3/)
// The hero film message, film player and hero intro: BASE_URL=http://localhost:3100 TARGETED=film npm run shots   (steps named "film ...", saves to .shots/film-r1/)
// Every page a check opens is marked window.__qa = true, which turns on the read-only window.__scrollTriggers() count the checks use.
// Output: .shots/<run-id>/ with PNGs and an index.md that says what each file shows,
// plus the console log, horizontal-overflow findings and the behaviour checks.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const here = dirname(fileURLToPath(import.meta.url));
const TARGETED = Boolean(process.env.TARGETED);
const TARGET_PREFIX = process.env.TARGETED === 'convo' ? 'convo' : process.env.TARGETED === 'film' ? 'film' : process.env.TARGETED === 'roll' ? 'p2 roll words' : 'r3b';
const runId = process.env.RUN_ID ?? (process.env.TARGETED === 'convo' ? 'convo-r3' : process.env.TARGETED === 'film' ? 'film-r1' : 'integration-r3b');
const outDir = join(here, '..', '.shots', runId);
mkdirSync(outDir, { recursive: true });

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 700 },
];
const [DESKTOP, TABLET, MOBILE, NARROW] = SIZES;
const SHORT = { name: 'short', width: 1440, height: 800 };

const CHIPS = [
  ['job', 'Job or workplace'],
  ['housing', 'Housing'],
  ['money', 'Money owed'],
  ['family', 'Family & separation'],
];

const index = [];
const consoleLog = [];
const overflowLog = [];
const checks = [];
const failures = [];
let captured = 0;

const note = (file, what) => index.push(`- \`${file}\`: ${what}`);
const check = (name, ok, detail = '') => checks.push(`- ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` (${detail})` : ''}`);

async function settle(page, ms = 450) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

async function openPage(browser, size, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
    hasTouch: size.width <= 430,
    isMobile: size.width <= 430,
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript(() => { window.__qa = true; });
  const page = await ctx.newPage();
  const tag = `${opts.path ?? '/'}@${size.name}${opts.reduced ? '+reduced' : ''}${opts.label ? `:${opts.label}` : ''}`;
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) consoleLog.push(`[${tag}] ${msg.type()}: ${msg.text().slice(0, 300)}`);
  });
  page.on('pageerror', (err) => consoleLog.push(`[${tag}] pageerror: ${String(err).slice(0, 300)}`));
  await page.goto(BASE_URL + (opts.path ?? '/'), { waitUntil: 'networkidle' });
  // The page smooth-scrolls; the harness jumps so a capture never lands mid-scroll.
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await settle(page, opts.settle ?? 700);
  return { ctx, page, tag };
}

async function save(page, file, what, opts = {}) {
  const path = join(outDir, file);
  await page.screenshot({ path, ...opts });
  const bytes = statSync(path).size;
  captured++;
  note(file, what + (bytes < 6000 ? '  **(suspiciously small: check for a blank image)**' : ''));
  if (bytes < 6000) failures.push(`small image: ${file} (${bytes} bytes)`);
}

async function saveEl(locator, file, what) {
  const path = join(outDir, file);
  const page = locator.page();
  // A clip in page coordinates is steadier than an element screenshot for elements taller than the viewport.
  const box = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.left + window.scrollX), y: r.top + window.scrollY, width: r.width, height: r.height };
  });
  // The sticky strip and bar would be stitched into the middle of a tall clip: hide them for the capture.
  await page.addStyleTag({ content: '.safe, .sticky-reply { visibility: hidden !important; }' }).then(async (h) => {
    await page.screenshot({ path, fullPage: true, clip: box });
    await h.evaluate((el) => el.remove());
  });
  const bytes = statSync(path).size;
  captured++;
  note(file, what + (bytes < 3000 ? '  **(suspiciously small)**' : ''));
  if (bytes < 3000) failures.push(`small image: ${file} (${bytes} bytes)`);
}

async function overflowCheck(page, tag, size) {
  const res = await page.evaluate((vw) => {
    const doc = document.documentElement;
    const over = doc.scrollWidth - doc.clientWidth;
    const offenders = [];
    if (over > 0) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed' || cs.visibility === 'hidden') continue;
          offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} [${Math.round(r.left)}..${Math.round(r.right)}]`);
          if (offenders.length >= 8) break;
        }
      }
    }
    return { over, offenders };
  }, size.width);
  overflowLog.push(`- ${res.over > 0 ? 'OVERFLOW' : 'ok'}  ${tag}${res.over > 0 ? `: scrollWidth exceeds viewport by ${res.over}px; ${res.offenders.join(' | ')}` : ''}`);
}

/** Waits (up to 2.5 s) for the section reveals on screen to finish: headings come in at 80% of the way down the screen, messages at 96%. */
const revealsDone = (page) =>
  page
    .waitForFunction(
      () => {
        const shown = (el, at) => el.getBoundingClientRect().top < window.innerHeight * at && el.getBoundingClientRect().bottom > 0;
        return ![...document.querySelectorAll('.rv-word')].some((el) => shown(el, 0.8)) && ![...document.querySelectorAll('[data-rv]')].some((el) => shown(el, 0.96));
      },
      null,
      { timeout: 2500 },
    )
    .catch(() => {});
const jump = (page, y) => page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: 'instant' }), y);
const intoView = (page, sel, block = 'start') =>
  page.evaluate(([s, b]) => document.querySelector(s)?.scrollIntoView({ block: b }), [sel, block]);

/** Wraps one capture routine so a failure is logged and the run goes on. */
async function step(name, fn) {
  if (TARGETED && !name.startsWith(TARGET_PREFIX)) return;
  try {
    await fn();
  } catch (err) {
    failures.push(`${name}: ${String(err).split('\n')[0]}`);
    index.push(`- **FAILED** ${name}: ${String(err).split('\n')[0]}`);
  }
}

// ───────── intake helpers ─────────
// The intake lives in the conversation sheet (a dialog over the page). Every call to action opens it; the harness uses the hero's send pill.
const SHEET = '.convo-sheet';
/** Opens the sheet from the hero's reply bar and waits for its entrance to finish. */
async function openSheet(page, via = '#hero-reply-bar') {
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await page.locator(via).first().click();
  await page.waitForSelector(`${SHEET}[open]`);
  await page.waitForTimeout(500);
}
/** Closes the sheet with Esc and waits for its exit to finish. */
async function closeSheet(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
}
/** Scrolls an element inside the sheet's thread into view. */
const sheetIntoView = (page, sel) => page.locator(sel).first().scrollIntoViewIfNeeded();
const sheetToEnd = (page) => page.evaluate(() => { const el = document.querySelector('.convo-sheet .sheet-scroll'); if (el) el.scrollTop = el.scrollHeight; });
const heroChip = (page, label) => page.locator('.hero-chips').getByRole('radio', { name: label });
async function pickChip(page, label) {
  // The radio input sits over its chip label, so the input is what a pointer actually hits.
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  await page.locator('.convo-sheet .chat .opt').filter({ hasText: new RegExp(`^\\s*${esc}\\s*$`) }).locator('input').first().click();
}
const progressText = (page) => page.locator('.convo-sheet .chat__progress').first().innerText().catch(() => '');
/** Picks an answer. A pointer click moves on by itself (after a short delay) except where a note holds the step: then Next is used. */
async function answer(page, label) {
  const before = await progressText(page);
  await pickChip(page, label);
  await page.waitForTimeout(900);
  if ((await progressText(page)) === before) {
    await page.locator('.convo-sheet .composer-dock .composer__go').first().click();
    await page.waitForTimeout(300);
  }
}
async function toStep6(page, choices = ['Job or workplace', 'Ontario', 'Later, or no date yet', 'No', 'A few documents']) {
  await openSheet(page);
  for (const c of choices) await answer(page, c);
  await page.waitForTimeout(300);
}
async function shotIntake(page, file, what) {
  // The sheet is a fixed panel, so the capture is the viewport: header, thread (as scrolled), composer.
  await settle(page, 600);
  await save(page, file, what);
}
const stubApi = (page) =>
  page.route('**/api/{intake,waitlist}', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));

const browser = await chromium.launch();

// ───────── 1. First viewport and consecutive slices, four sizes ─────────
for (const size of SIZES) {
  await step(`slices ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    await save(page, `${size.name}-first-viewport.png`, `${size.name} (${size.width}x${size.height}) first viewport`);
    const strip = await page.evaluate(() => {
      const s = document.querySelector('.safe');
      const t = document.querySelector('.safe__text');
      return { h: Math.round(s.getBoundingClientRect().height), textShown: t ? getComputedStyle(t).display !== 'none' : false };
    });
    check(`Status strip is one line at ${size.width}`, strip.h <= 44, `height ${strip.h}px, safety text ${strip.textShown ? 'shown' : 'hidden'}`);
    if (size.width < 400) check(`Status text hidden under 400px (${size.width})`, !strip.textShown);
    if (size.width < 400) {
      const dot = await page.evaluate(() => getComputedStyle(document.querySelector('.safe__dot')).display);
      check(`No lone status dot beside Quick exit under 400px (${size.width})`, dot === 'none', `dot display=${dot}`);
    }
    if (size === MOBILE) {
      // The film message follows the headline on a phone (direction.md), so the reply bar and the reassurance line fall below the first
      // screen. What the first screen holds now: the headline, the whole film tile, and the sticky bar that is a way to start.
      const fit = await page.evaluate(() => {
        const r = (s) => document.querySelector(s)?.getBoundingClientRect();
        const sticky = document.querySelector('.sticky-reply');
        return { h1Top: Math.round(r('.hero-h1').top), tileBottom: Math.round(r('.film-tile').bottom), stickyShown: sticky?.dataset.visible, stickyTop: Math.round(r('.sticky-reply__link').top), stickyBottom: Math.round(r('.sticky-reply__link').bottom), vh: window.innerHeight };
      });
      check('Phone first screen (390x844): the headline, the whole film tile and a sticky "Get my case in order" bar are on screen', fit.h1Top >= 0 && fit.tileBottom <= fit.vh && fit.stickyShown === 'true' && fit.stickyBottom <= fit.vh, `headline starts ${fit.h1Top}px, film tile ends ${fit.tileBottom}px, sticky bar ${fit.stickyShown} at ${fit.stickyTop}-${fit.stickyBottom}px, viewport ${fit.vh}px`);
    }
    if (size === DESKTOP) {
      const gap = await page.evaluate(() => {
        const q = document.querySelector('.qx').getBoundingClientRect();
        const status = document.querySelector('.safe__status').getBoundingClientRect();
        return { qLeft: Math.round(q.left), statusRight: Math.round(status.right), margin: getComputedStyle(document.querySelector('.qx')).marginLeft };
      });
      check('Quick exit stands alone on the right with at least 24px clear space', gap.qLeft - gap.statusRight >= 24 || gap.margin === '24px', JSON.stringify(gap));
    }
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const slices = Math.ceil(total / size.height);
    for (let i = 0; i < slices; i++) {
      await jump(page, i * size.height);
      await settle(page, 220);
      await revealsDone(page);
      const n = String(i + 1).padStart(2, '0');
      await save(page, `${size.name}-slice-${n}.png`, `${size.name} full page, slice ${n} of ${slices} (scroll ${i * size.height}px)`);
    }
    await jump(page, 0);
    await overflowCheck(page, `${tag} home, closed`, size);
    await ctx.close();
  });
}

// ───────── 2. Hero: all four chips, desktop and mobile; approved mock for comparison ─────────
for (const size of [DESKTOP, MOBILE]) {
  await step(`hero ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    const chipTops = [];
    for (const [id, label] of CHIPS) {
      await heroChip(page, label).click();
      await settle(page, 3300); // let the send, answer and lift finish
      if (size === DESKTOP) {
        await save(page, `${size.name}-hero-${id}.png`, `hero with the "${label}" chip selected, motion settled`);
      } else {
        await intoView(page, '.hero-chips');
        await settle(page, 250);
        await saveEl(page.locator('.thread'), `${size.name}-hero-${id}-thread.png`, `mobile: the example thread after choosing "${label}"`);
      }
      if (size === DESKTOP) {
        const pos = await page.evaluate(() => {
          const r = (s) => Math.round(document.querySelector(s).getBoundingClientRect().bottom);
          return { chips: Math.round(document.querySelector('.hero-chips').getBoundingClientRect().top), fine: r('.hero-fine'), vh: window.innerHeight };
        });
        chipTops.push(pos.chips);
        check(`1440x900: the not-a-law-firm line ends inside 900px with the "${label}" chip`, pos.fine <= pos.vh, `ends at ${pos.fine}px`);
      }
      const lift = await page.evaluate(() => {
        const tag = document.querySelector('.lift .page-tag');
        const lift = document.querySelector('.lift');
        if (!tag || !lift) return null;
        const r = tag.getBoundingClientRect();
        const l = lift.getBoundingClientRect();
        const walker = document.createTreeWalker(lift, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (tag.contains(n) || !n.textContent.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
        const first = walker.nextNode();
        const range = document.createRange();
        range.selectNodeContents(first);
        const t = range.getBoundingClientRect();
        return { lines: tag.getClientRects().length, h: Math.round(r.height), right: Math.round(r.right), liftRight: Math.round(l.right), w: Math.round(r.width), clear: Math.round(t.top - r.bottom) };
      });
      check(`Lift on the "${label}" chip at ${size.width} (page tag never covers the bubble's text, stays inside it)`, !!lift && lift.clear >= -3 && lift.right <= lift.liftRight + 2, lift ? `tag ${lift.w}x${lift.h}px, gap between tag and first line of text ${lift.clear}px` : 'no lift found');
      const labels = await page.evaluate(() => [...document.querySelectorAll('.thread')].map((t) => t.innerText).join(' '));
      check(`Thread shows "Your words" and "Your papers show" labels (${label}, ${size.width})`, /Your words/i.test(labels) && /Your papers show/i.test(labels));
    }
    if (size === DESKTOP) check('The quick-reply row does not move when the example changes (1440)', new Set(chipTops).size === 1, `top of the chip row for each chip: ${chipTops.join(', ')}px`);
    await overflowCheck(page, `${tag} after chips`, size);
    await ctx.close();
  });
}
await step('mock', async () => {
  const mock = resolve(here, '..', '..', '..', '.impeccable', 'mocks', 'decision', 'phone-roll.html');
  if (!existsSync(mock)) return;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { window.__qa = true; });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(mock).href, { waitUntil: 'load' });
  await settle(page, 700);
  await save(page, 'desktop-approved-mock.png', 'the approved phone-roll sketch at 1440x900, for comparison with desktop-first-viewport.png');
  await ctx.close();
});

// ───────── 3. S4 scroll scene ─────────
async function pileGeo(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.pile');
    const stage = document.querySelector('.pile__stage');
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height, mode: el.getAttribute('data-mode'), stageH: stage.getBoundingClientRect().height, vh: window.innerHeight };
  });
}
const pinY = (g, p) => g.top - 44 + p * Math.round(g.vh * 1.1);
const TILE_FOR_ROW = [4, 2, 3, 1, 6, 5];
const ROW_START = 0.05;
const ROW_STEP = 0.115;
const ROW_DUR = 0.14;

for (const size of [DESKTOP, SHORT]) {
  await step(`s4 scene ${size.height}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    const g = await pileGeo(page);
    check(`S4 pinned at ${size.width}x${size.height}`, g.mode === 'pinned', `data-mode=${g.mode}, track ${Math.round(g.height)}px, stage ${Math.round(g.stageH)}px`);
    check(`S4 stage fits the viewport under the status strip at ${size.height}px height`, g.stageH <= size.height - 44, `stage ${Math.round(g.stageH)}px, room ${size.height - 44}px`);
    const stops = [
      ['before', pinY(g, 0) - 160, 'just before the track: the stage is still in normal flow'],
      ['start', pinY(g, 0), 'start of the track (progress 0): tiles in the camera roll, rail empty'],
      ['25', pinY(g, 0.25), 'about 25% through the pinned scroll'],
      ['mid', pinY(g, 0.5), 'middle of the pinned scroll'],
      ['75', pinY(g, 0.75), 'about 75% through the pinned scroll'],
      ['end', pinY(g, 1), 'end of the track (progress 1): finished timeline, gap, receipt, empty roll slots'],
      ['after1', pinY(g, 1) + 260, 'just after the pin releases: the stage scrolls away and S5 follows'],
      ['after2', pinY(g, 1) + 700, 'further on: S5 should already be filling the screen, no empty band'],
    ];
    for (const [id, y, what] of stops) {
      await jump(page, y);
      await settle(page, 350);
      const fit = await page.evaluate(() => {
        const s = document.querySelector('.pile__stage').getBoundingClientRect();
        const how = document.querySelector('#how .h-section')?.getBoundingClientRect();
        return { top: Math.round(s.top), bottom: Math.round(s.bottom), how: how ? Math.round(how.top) : null };
      });
      note(`(s4 ${size.height} ${id})`, `stage top=${fit.top} bottom=${fit.bottom}; S5 heading top=${fit.how}; viewport ${size.height}`);
      await save(page, `${size.name}-s4-${id}.png`.replace('short-', 'desktop800-'), `S4 scene at ${size.width}x${size.height}, ${what}`);
      if (id === 'end' && size === DESKTOP) {
        const band = await page.evaluate(() => {
          const s = document.querySelector('.pile__stage').getBoundingClientRect();
          const how = document.querySelector('#how .h-section').getBoundingClientRect();
          return Math.round(how.top - s.bottom);
        });
        check('S4 release into S5: distance from stage bottom to the S5 heading', band <= 220, `${band}px`);
      }
    }
    if (size === DESKTOP) {
      // Tile landing: just before each row finishes, the tile should sit on its rail node.
      const landing = [];
      for (let i = 0; i < TILE_FOR_ROW.length; i++) {
        const p = ROW_START + i * ROW_STEP + ROW_DUR * 0.93;
        await jump(page, pinY(g, p));
        await page.waitForTimeout(250);
        const d = await page.evaluate(([tile, row]) => {
          const t = document.querySelector(`.pile-slot[data-slot="${tile}"] .pile-tile`);
          const n = document.querySelector(`[data-row="${row}"] .node`);
          if (!t || !n) return null;
          const a = t.getBoundingClientRect();
          const b = n.getBoundingClientRect();
          return Math.round(Math.hypot(a.left + a.width / 2 - (b.left + b.width / 2), a.top + a.height / 2 - (b.top + b.height / 2)));
        }, [TILE_FOR_ROW[i], i]);
        landing.push(d);
      }
      check('S4 tiles land on their rail nodes (centre distance at 93% of each flight)', landing.every((d) => d !== null && d <= 14), `distances px: ${landing.join(', ')}`);
      const sizes = [];
      for (const frac of [0.2, 0.4, 0.6, 0.68]) {
        const p = ROW_START + 3 * ROW_STEP + ROW_DUR * frac;
        await jump(page, pinY(g, p));
        await page.waitForTimeout(250);
        sizes.push(await page.evaluate(() => {
          const t = document.querySelector('.pile-slot[data-slot="1"] .pile-tile');
          const r = t.getBoundingClientRect();
          return Math.round(r.width);
        }));
      }
      check('S4 desktop: a tile keeps its roll size for the first 70% of its flight (no mid-flight sliver)', sizes.every((w) => w >= 100), `tile 1 width at 20/40/60/68% of the flight: ${sizes.join(', ')}px (roll size 108)`);
      for (const row of [0, 3]) {
        const p = ROW_START + row * ROW_STEP + ROW_DUR * 0.5;
        await jump(page, pinY(g, p));
        await settle(page, 300);
        await save(page, `desktop-s4-fly-row${row}.png`, `S4: the tile for row ${row} half way from the roll to its rail node`);
      }
    }
    await overflowCheck(page, `${tag} S4`, size);
    await ctx.close();
  });
}
await step('s4 short viewport static', async () => {
  const { ctx, page } = await openPage(browser, { name: 'x', width: 1440, height: 799 });
  const g = await pileGeo(page);
  check('S4 does not pin at 799px height (static finished timeline)', g.mode === 'static', `data-mode=${g.mode}`);
  await ctx.close();
});

// Phones: each row's tile lifts onto the node as the row scrolls in.
for (const size of [MOBILE, NARROW]) {
  await step(`s4 mobile ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    const mode = (await pileGeo(page)).mode;
    check(`S4 per-row (inline) mode at ${size.width}`, mode === 'inline', `data-mode=${mode}`);
    const stripAt = async () => page.evaluate(() => [...document.querySelectorAll('.pile-strip__wrap')].map((e) => Number(getComputedStyle(e).opacity)));
    const strip0 = await stripAt();
    check(`Mobile S4 (${size.width}): the compact camera-roll strip shows eight dashed slots above the first row`, (await page.locator('.pile-strip__slot').count()) === 8);
    for (const row of [0, 3]) {
      for (const [id, frac, what] of [['lift', 0.84, 'tile mid-flight at full thumbnail size (row top at 84% of the viewport)'], ['shrink', 0.72, 'tile shrinking onto the node in the last stretch of its flight (row top at 72%)'], ['landed', 0.45, 'tile landed on the node (row top at 45%)']]) {
        await page.evaluate(([r, f]) => {
          const el = document.querySelector(`.pile-row[data-row="${r}"]`);
          const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * f;
          window.scrollTo({ top: y, behavior: 'instant' });
        }, [row, frac]);
        await settle(page, 350);
        if (id === 'lift') {
          const w = await page.evaluate((r) => {
            const t = document.querySelector(`.pile-row[data-row="${r}"] .pile-tile--row`);
            const b = t?.getBoundingClientRect();
            return b ? { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.left) } : null;
          }, row);
          check(`Mobile S4 (${size.width}) row ${row}: the tile is a full thumbnail (about 72px) while it flies`, !!w && w.w >= 60 && w.w <= 80, JSON.stringify(w));
        }
        await save(page, `${size.name}-s4-row${row}-${id}.png`, `${size.name}: S4 row ${row}, ${what}`);
      }
    }
    await page.evaluate(() => {
      const el = document.querySelector('.pile-row[data-row="5"]');
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: 'instant' });
    });
    await settle(page, 400);
    const strip1 = await stripAt();
    check(`Mobile S4 (${size.width}): the strip's tiles empty as the rows land`, strip0.some((o) => o > 0.9) && strip1.filter((o) => o < 0.1).length >= 6, `opacity before: ${strip0.map((o) => o.toFixed(1)).join(' ')}; after the last row: ${strip1.map((o) => o.toFixed(1)).join(' ')}`);
    await save(page, `${size.name}-s4-strip-emptied.png`, `${size.name}: S4 after the last row has landed: the strip's slots are dashed and empty`);
    await jump(page, 0);
    await page.evaluate(() => document.querySelector('.pile-strip').scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -120));
    await settle(page, 300);
    await save(page, `${size.name}-s4-strip-top.png`, `${size.name}: S4 the compact camera-roll strip above the first row`);
    await overflowCheck(page, `${tag} S4 rows`, size);
    await ctx.close();
  });
}

// ───────── 4. SourceViewer open (desktop, mobile, narrow) ─────────
for (const size of [DESKTOP, MOBILE, NARROW]) {
  await step(`source viewer ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    await heroChip(page, 'Housing').click();
    await settle(page, 3300);
    await page.getByRole('button', { name: 'See the page' }).click();
    await settle(page, 500);
    await save(page, `${size.name}-source-viewer-housing.png`, `${size.name}: SourceViewer open on the Housing page, quoted words outlined`);
    await overflowCheck(page, `${tag} SourceViewer open`, size);
    await ctx.close();
  });
}

// ───────── 5. Cite popovers F2 and F9 ─────────
for (const size of [DESKTOP, MOBILE, NARROW]) {
  for (const [i, id] of [[0, 'F2'], [1, 'F9']]) {
    if (size === NARROW && id === 'F2') continue;
    await step(`cite ${id} ${size.name}`, async () => {
      const { ctx, page, tag } = await openPage(browser, size);
      const btn = page.locator('#ask .cite__btn').nth(i);
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await settle(page, 450);
      await save(page, `${size.name}-cite-${id.toLowerCase()}.png`, `${size.name}: Cite popover for ${id} open`);
      await overflowCheck(page, `${tag} cite ${id} open`, size);
      await ctx.close();
    });
  }
}

// ───────── 6. Ask Q&A, desktop and 390 ─────────
for (const size of [DESKTOP, MOBILE]) {
  await step(`ask ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await page.locator('.convo').scrollIntoViewIfNeeded();
    const shotConvo = async (q, what) => {
      await page.evaluate((latest) => {
        const c = document.querySelector('.convo');
        const target = latest ? [...document.querySelectorAll('.convo__log .xchg')].pop() : c;
        const r = target.getBoundingClientRect();
        const room = window.innerHeight - 190; // header strip above, sticky bar below
        const y = r.height < room ? r.bottom + window.scrollY - window.innerHeight + 110 : r.top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: 'instant' });
      }, q !== 'q1');
      await settle(page, 700);
      await save(page, `${size.name}-ask-${q}.png`, `${size.name}: Q&A, ${what}`);
    };
    await shotConvo('q1', 'Q1 answer showing (the default, so the section is never empty); new label above the thread');
    const chips = page.locator('.chip--ask');
    await chips.nth(1).click();
    await settle(page, 1200);
    await shotConvo('q2', 'Q2 asked and answered');
    await chips.nth(2).click();
    await settle(page, 1200);
    await shotConvo('q3', 'Q3 asked: the refusal as one sentence with its redirect inside it');
    check(`Q3 has no leftover chips (${size.width})`, (await page.locator('.demo-chips, .demo-chip').count()) === 0);
    const senders = await page.locator('.ans__sender').allInnerTexts();
    check(`Ask: the sender line sits above every answer bubble (${size.width})`, senders.length === 3 && senders.every((t) => t.trim() === 'The person helping you · example'), `${senders.length} sender lines`);
    await ctx.close();
  });
}

// ───────── 7. FAQ item open with keyboard focus; privacy thread ─────────
for (const size of [DESKTOP, MOBILE]) {
  await step(`faq ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await intoView(page, '#faq');
    await settle(page, 300);
    await save(page, `${size.name}-faq-closed.png`, `${size.name}: the FAQ with every question closed: outlined quick-reply pills`);
    const btn = page.locator('.faq__btn').nth(1);
    await btn.scrollIntoViewIfNeeded();
    await btn.focus();
    await page.keyboard.press('Enter');
    await settle(page, 700);
    await page.evaluate(() => document.querySelector('.faq__item[data-open="true"]')?.scrollIntoView({ block: 'center' }));
    await settle(page, 300);
    const ring = await page.evaluate(() => {
      const b = document.activeElement;
      const cs = getComputedStyle(b);
      const bub = b.querySelector('.faq__bubble');
      const bs = bub ? getComputedStyle(bub) : null;
      return { el: b.className, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, bubbleOutline: bs ? `${bs.outlineStyle} ${bs.outlineWidth}` : '', bubbleShadow: bs ? bs.boxShadow.slice(0, 60) : '' };
    });
    note(`(faq focus ${size.name})`, `${JSON.stringify(ring)}`);
    const kinds = await page.evaluate(() => ({ pills: document.querySelectorAll('.faq__pill').length, bubbles: document.querySelectorAll('.faq__bubble').length, open: document.querySelectorAll('.faq__btn[aria-expanded="true"]').length, total: document.querySelectorAll('.faq__btn').length }));
    check(`FAQ (${size.width}): closed questions are pills, only the open one is a filled bubble`, kinds.bubbles === kinds.open && kinds.pills === kinds.total - kinds.open, JSON.stringify(kinds));
    check(`FAQ (${size.width}): the focused question shows a focus ring`, /^solid 3px/.test(ring.bubbleOutline || '') || /solid 3px/.test(await page.evaluate(() => getComputedStyle(document.activeElement.querySelector('.faq__bubble, .faq__pill')).outline)), JSON.stringify(ring));
    await save(page, `${size.name}-faq-open.png`, `${size.name}: FAQ item 2 opened by keyboard: focus ring on the question bubble, answer in a received bubble`);
    if (size === MOBILE) {
      await saveEl(page.locator('#faq'), 'mobile-faq-section.png', 'mobile: the whole FAQ section (sent-bubble questions, one answer open)');
    }
    await ctx.close();
  });
  await step(`privacy thread ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    await intoView(page, '#privacy');
    await settle(page, 350);
    await save(page, `${size.name}-privacy-thread.png`, `${size.name}: the privacy section as a thread, first screen`);
    if (size === MOBILE) await saveEl(page.locator('#privacy'), 'mobile-privacy-thread-full.png', 'mobile: the whole privacy thread (sent question, received answers, the privilege note)');
    await overflowCheck(page, `${tag} privacy`, size);
    await ctx.close();
  });
}
await step('faq narrow', async () => {
  const { ctx, page, tag } = await openPage(browser, NARROW);
  await page.locator('.faq__btn').nth(2).scrollIntoViewIfNeeded();
  await page.locator('.faq__btn').nth(2).click();
  await settle(page, 600);
  await save(page, 'narrow-faq-open.png', 'narrow 320: FAQ item open');
  await overflowCheck(page, `${tag} FAQ open`, NARROW);
  await ctx.close();
});

// ───────── 8. Summary preview dialog: page 1 and page 3, plus behaviour ─────────
for (const size of [DESKTOP, MOBILE, NARROW]) {
  await step(`summary ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    const opener = page.locator('.get-attach', { hasText: 'Summary for my lawyer' });
    await opener.scrollIntoViewIfNeeded();
    await opener.click();
    await settle(page, 500);
    await save(page, `${size.name}-summary-p1.png`, `${size.name}: Summary preview dialog, page 1`);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await settle(page, 450);
    await save(page, `${size.name}-summary-p3.png`, `${size.name}: Summary preview dialog, page 3 (after two ArrowRight presses)`);
    await overflowCheck(page, `${tag} summary dialog open`, size);
    if (size === DESKTOP) {
      await page.keyboard.press('ArrowLeft');
      const back = await page.locator('.brief__count').innerText();
      check('Summary dialog: ArrowLeft goes back a page', /2\s*\/\s*5/.test(back), back.replace(/\s+/g, ' ').slice(-20));
      await page.keyboard.press('Escape');
      await settle(page, 200);
      const closed = await page.evaluate(() => !document.querySelector('dialog.viewer--brief[open]'));
      const back2 = await page.evaluate(() => document.activeElement?.classList.contains('get-attach') ?? false);
      check('Summary dialog: Esc closes it', closed);
      check('Summary dialog: focus returns to the attachment', back2);
      await opener.click();
      await settle(page, 300);
      await page.getByRole('button', { name: 'Close' }).click();
      await settle(page, 200);
      check('Summary dialog: Close button closes and returns focus', await page.evaluate(() => !document.querySelector('dialog.viewer--brief[open]') && document.activeElement?.classList.contains('get-attach')));
    }
    await ctx.close();
  });
}

// ───────── 9. Intake at 390 ─────────
await step('intake steps', async () => {
  const { ctx, page, tag } = await openPage(browser, MOBILE);
  await openSheet(page);
  await save(page, 'mobile-intake-step1-viewport.png', 'mobile: the conversation sheet opened from the hero, step 1 in the viewport');
  await shotIntake(page, 'mobile-intake-step1.png', 'mobile: intake step 1 of 6 (case type) in the sheet');
  await pickChip(page, 'Housing (landlord and tenant)');
  await settle(page, 1000); // a pointer click moves on by itself
  const f2 = await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent ?? '').slice(0, 30));
  check('Intake: a pointer click on a chip moves on by itself, focus lands on the new question (legend)', /LEGEND/i.test(f2) && /Step 2/.test(await progressText(page)), f2);
  await shotIntake(page, 'mobile-intake-step2.png', 'mobile: intake step 2 of 6 (location), reached by the auto-advance, answer 1 echoed as a sent bubble');
  await answer(page, 'Ontario');
  await shotIntake(page, 'mobile-intake-step3.png', 'mobile: intake step 3 of 6 (date window)');
  await pickChip(page, 'In the next 2 weeks');
  await settle(page, 1000);
  check('Intake: "In the next 2 weeks" holds the step (note shown, no auto-advance)', /Step 3/.test(await progressText(page)));
  await shotIntake(page, 'mobile-intake-step3-soon.png', 'mobile: step 3 with "In the next 2 weeks" and its note linking to free legal help');
  await page.locator('.convo-sheet .composer-dock .composer__go').first().click();
  await settle(page, 300);
  await shotIntake(page, 'mobile-intake-step4.png', 'mobile: intake step 4 of 6 (lawyer or paralegal)');
  await pickChip(page, 'Yes');
  await settle(page, 1000);
  check('Intake: "Yes" on step 4 holds the step (note shown)', /Step 4/.test(await progressText(page)));
  await shotIntake(page, 'mobile-intake-step4-yes.png', 'mobile: step 4 with "Yes" and its note');
  await page.locator('.convo-sheet .composer-dock .composer__go').first().click();
  await settle(page, 300);
  await shotIntake(page, 'mobile-intake-step5.png', 'mobile: intake step 5 of 6 (how much paper)');
  await answer(page, 'A folder or two');
  await shotIntake(page, 'mobile-intake-step6.png', 'mobile: intake step 6 of 6 (contact details), top of the thread');
  await sheetToEnd(page);
  await settle(page, 300);
  await save(page, 'mobile-intake-step6-composer.png', 'mobile: step 6, composer (Back / submit) in the viewport');
  await page.locator('.convo-sheet .composer-dock .composer__go').click();
  await settle(page, 500);
  const focusSum = await page.evaluate(() => document.activeElement?.className);
  check('Intake: error summary receives focus', /err-sum/.test(focusSum ?? ''), focusSum);
  await shotIntake(page, 'mobile-intake-step6-errors.png', 'mobile: step 6 submitted empty: error summary at the top, inline errors');
  await sheetIntoView(page, '.convo-sheet .chat .err-sum');
  await settle(page, 250);
  await save(page, 'mobile-intake-step6-errors-viewport.png', 'mobile: step 6 error summary in the viewport');
  await overflowCheck(page, `${tag} intake step 6 with errors`, MOBILE);
  await ctx.close();
});

await step('intake phone rules', async () => {
  const { ctx, page } = await openPage(browser, MOBILE);
  await stubApi(page);
  await toStep6(page);
  const phoneLabel = () => page.locator('.convo-sheet .chat label[for$="-phone"]').innerText();
  const labelEmail = await phoneLabel();
  check('Phone label says "(optional)" while email is the method', /optional/i.test(labelEmail), labelEmail.trim());
  await pickChip(page, 'Phone call');
  await settle(page, 300);
  const labelCall = await phoneLabel();
  check('Phone label drops "(optional)" when a call is chosen', !/optional/i.test(labelCall), labelCall.trim());
  await shotIntake(page, 'mobile-intake-step6-phone-label.png', 'mobile: step 6 with "Phone call" chosen: the phone field is no longer optional');
  await page.getByLabel('First name').fill('Sam');
  await page.locator('.convo-sheet .chat input[type="email"]').fill('sam@example.com');
  await page.locator('.convo-sheet .chat input[name="consentPrivacy"]').check();
  await page.locator('.convo-sheet .composer-dock .composer__go').click();
  await settle(page, 600);
  await shotIntake(page, 'mobile-intake-step6-phone-required.png', 'mobile: step 6 submitted with Phone call chosen and no number: the phone-required error');
  const summary = await page.locator('.convo-sheet .chat .err-sum').innerText();
  check('Phone-required error is named in the error summary', /phone number, or choose email/i.test(summary), summary.replace(/\s+/g, ' ').slice(0, 90));
  await ctx.close();
});

for (const [method, expect] of [['Email', /by email/i], ['Phone call', /by phone call/i], ['Text message', /by text message/i]]) {
  await step(`intake success ${method}`, async () => {
    const { ctx, page } = await openPage(browser, MOBILE);
    await stubApi(page);
    await toStep6(page);
    await pickChip(page, method);
    await page.getByLabel('First name').fill('Sam');
    await page.locator('.convo-sheet .chat input[type="email"]').fill('sam@example.com');
    if (method !== 'Email') await page.locator('.convo-sheet .chat input[type="tel"]').fill('416-555-0100');
    await page.locator('.convo-sheet .chat input[name="consentPrivacy"]').check();
    await settle(page, 300);
    const vm = await page.locator('.convo-sheet .chat fieldset.sub legend', { hasText: 'voicemail' }).count();
    check(`Voicemail question is asked only for Phone call (${method})`, method === 'Phone call' ? vm === 1 : vm === 0, `voicemail legends: ${vm}`);
    if (method === 'Phone call') {
      const dflt = await page.evaluate(() => document.querySelector('.convo-sheet .chat input[name="voicemail"]:checked')?.value);
      check('Voicemail defaults to No', dflt === 'no', String(dflt));
      const labels = await page.locator('.convo-sheet .chat input[name="voicemail"]').evaluateAll((els) => els.map((e) => e.parentElement.innerText.trim()));
      check('Voicemail options are Yes and No (no "email only")', labels.join('|') === 'Yes|No', labels.join('|'));
    }
    await shotIntake(page, `mobile-intake-step6-${method.split(' ')[0].toLowerCase()}.png`, `mobile: step 6 with ${method} chosen and filled in (test data)${method === 'Phone call' ? ': the voicemail question (default No) is asked' : ': nothing more is asked'}`);
    await page.locator('.convo-sheet .composer-dock .composer__go').click();
    await settle(page, 900);
    const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    const text = await page.locator('.convo-sheet .chat [role="status"]').innerText();
    check(`Intake success (${method}): focus on the success bubble, text names the method; the weekday sentence appears only once a contact email is set`, role === 'status' && expect.test(text) && /Nothing by (Monday|Tuesday|Wednesday|Thursday|Friday)/i.test(text) || !/Nothing by/i.test(text), text.replace(/\s+/g, ' ').slice(0, 130));
    await shotIntake(page, `mobile-intake-success-${method.split(' ')[0].toLowerCase()}.png`, `mobile: intake success with ${method} (API intercepted with a 200)`);
    await ctx.close();
  });
}

await step('intake narrow', async () => {
  const { ctx, page, tag } = await openPage(browser, NARROW);
  await toStep6(page);
  await pickChip(page, 'Phone call');
  await settle(page, 250);
  await overflowCheck(page, `${tag} intake step 6 (Phone call)`, NARROW);
  await page.locator('.convo-sheet .composer-dock .composer__go').click();
  await settle(page, 400);
  await overflowCheck(page, `${tag} intake step 6 with errors`, NARROW);
  await shotIntake(page, 'narrow-intake-step6-errors.png', 'narrow 320: step 6 with Phone call chosen and the error summary, whole chat');
  await ctx.close();
});
await step('intake narrow notes', async () => {
  const { ctx, page, tag } = await openPage(browser, NARROW);
  await openSheet(page);
  await answer(page, 'Housing (landlord and tenant)');
  await answer(page, 'Ontario');
  await pickChip(page, 'In the next 2 weeks');
  await settle(page, 700);
  await overflowCheck(page, `${tag} intake note (next 2 weeks)`, NARROW);
  await ctx.close();
});

// ───────── 10. Waitlist behind its toggle ─────────
for (const size of [DESKTOP, MOBILE, NARROW]) {
  await step(`waitlist collapsed ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    await openSheet(page);
    await sheetToEnd(page);
    await settle(page, 350);
    const hidden = await page.evaluate(() => document.querySelector('.convo-sheet #waitlist [hidden]') !== null);
    check(`Waitlist form is collapsed behind its toggle at load (${size.name})`, hidden);
    await save(page, `${size.name}-waitlist-collapsed.png`, `${size.name}: the early-access list collapsed: only the toggle shows`);
    await page.locator('.convo-sheet .wl-toggle').click();
    await settle(page, 400);
    check(`Waitlist toggle sets aria-expanded (${size.name})`, (await page.locator('.convo-sheet .wl-toggle').getAttribute('aria-expanded')) === 'true');
    await sheetIntoView(page, '.convo-sheet .wl-toggle');
    await settle(page, 250);
    await save(page, `${size.name}-waitlist-open-toggle.png`, `${size.name}: the early-access list opened from the toggle`);
    await overflowCheck(page, `${tag} waitlist open`, size);
    await ctx.close();
  });
}
for (const size of [DESKTOP, MOBILE]) {
  await step(`waitlist filled ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await stubApi(page);
    await openSheet(page);
    await page.locator('.convo-sheet .wl-toggle').scrollIntoViewIfNeeded();
    await page.locator('.convo-sheet .wl-toggle').click();
    await page.locator('.convo-sheet #waitlist input[type="email"]').fill('sam@example.com');
    await page.locator('.convo-sheet #waitlist select').selectOption('BC');
    await page.locator('.convo-sheet #waitlist input[name="language"]').fill('English');
    await page.locator('.convo-sheet #waitlist input[name="consentLaunchEmails"]').check();
    await sheetIntoView(page, '.convo-sheet .wl-toggle');
    await settle(page, 350);
    await save(page, `${size.name}-waitlist-filled.png`, `${size.name}: early-access list filled in (test data), consent ticked`);
    await page.locator('.convo-sheet #waitlist button[type="submit"]').click();
    await settle(page, 700);
    await sheetIntoView(page, '.convo-sheet .wl-toggle');
    await settle(page, 250);
    await save(page, `${size.name}-waitlist-success.png`, `${size.name}: early-access list success (API intercepted with a 200)`);
    await ctx.close();
  });
}
await step('waitlist errors mobile', async () => {
  const { ctx, page } = await openPage(browser, MOBILE);
  await openSheet(page);
  await page.locator('.convo-sheet .wl-toggle').scrollIntoViewIfNeeded();
  await page.locator('.convo-sheet .wl-toggle').click();
  await page.locator('.convo-sheet #waitlist button[type="submit"]').click();
  await settle(page, 500);
  await sheetIntoView(page, '.convo-sheet .wl-toggle');
  await settle(page, 250);
  await save(page, 'mobile-waitlist-errors.png', 'mobile: early-access list submitted empty: error summary');
  await ctx.close();
});
await step('intake elsewhere', async () => {
  const { ctx, page } = await openPage(browser, MOBILE);
  await openSheet(page);
  await answer(page, 'Housing (landlord and tenant)');
  await pickChip(page, 'Somewhere else in Canada');
  await settle(page, 1000);
  check('Intake: "Somewhere else in Canada" holds the step (no auto-advance)', /Step 2/.test(await progressText(page)));
  await shotIntake(page, 'mobile-intake-step2-elsewhere.png', 'mobile: step 2 with "Somewhere else in Canada": the note and the early-access action');
  await page.locator('.convo-sheet .composer-dock .composer__go').click();
  await settle(page, 700);
  const info = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: (document.activeElement?.textContent ?? '').trim().slice(0, 40), expanded: document.querySelector('.convo-sheet .wl-toggle')?.getAttribute('aria-expanded') }));
  check('Intake: the "elsewhere" route opens the list and lands focus on its heading', info.tag === 'H3' && /early-access/i.test(info.text) && info.expanded === 'true', `${info.tag} "${info.text}", expanded=${info.expanded}`);
  await save(page, 'mobile-intake-elsewhere-waitlist.png', 'mobile: after the "elsewhere" route: the list opened by itself, focus on its heading');
  await ctx.close();
});

// ───────── 11. Legal pages ─────────
for (const path of ['/privacy', '/terms', '/accessibility']) {
  for (const size of [MOBILE, DESKTOP, NARROW]) {
    await step(`page ${path} ${size.name}`, async () => {
      const { ctx, page, tag } = await openPage(browser, size, { path });
      const name = path.slice(1);
      if (size !== NARROW) await save(page, `${size.name}-page-${name}.png`, `${size.name}: ${path} page, full`, { fullPage: true });
      await overflowCheck(page, `${tag}`, size);
      await ctx.close();
    });
  }
}

// ───────── 12. Mobile nav menu; sticky calls to action ─────────
for (const size of [MOBILE, NARROW]) {
  await step(`nav menu ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    await page.locator('.nav__menu-btn').click();
    await settle(page, 350);
    await save(page, `${size.name}-nav-menu-open.png`, `${size.name}: the disclosure menu open`);
    await overflowCheck(page, `${tag} menu open`, size);
    await ctx.close();
  });
}
for (const size of [MOBILE, NARROW]) {
  await step(`sticky bar ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    const vis = () => page.evaluate(() => document.querySelector('.sticky-reply')?.getAttribute('data-visible'));
    const barInView = await page.evaluate(() => { const r = document.getElementById('hero-reply-bar').getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; });
    check(`Sticky bar follows the hero's reply bar: hidden while it is on screen, shown once it is not (${size.width})`, (await vis()) === (barInView ? 'false' : 'true'), `reply bar in view: ${barInView}`);
    await intoView(page, '#how');
    await settle(page, 500);
    check(`Sticky bar visible mid-page (${size.width})`, (await vis()) === 'true');
    const box = await page.evaluate(() => {
      const r = document.querySelector('.sticky-reply__link').getBoundingClientRect();
      return { h: Math.round(r.height), bottom: Math.round(window.innerHeight - r.bottom), w: Math.round(r.width) };
    });
    check(`Sticky bar is about 56px tall (${size.width})`, box.h >= 48 && box.h <= 64, `${box.w}x${box.h}px, ${box.bottom}px from the bottom`);
    await save(page, `${size.name}-sticky-bar.png`, `${size.name}: sticky bar at the bottom while reading mid-page`);
    // A focused control is never hidden under it.
    await page.locator('.faq__btn').last().focus();
    await page.keyboard.press('Shift+Tab');
    await page.locator('.faq__btn').last().focus();
    await settle(page, 400);
    const cover = await page.evaluate(() => {
      const f = document.activeElement.getBoundingClientRect();
      const b = document.querySelector('.sticky-reply__link').getBoundingClientRect();
      return { fBottom: Math.round(f.bottom), barTop: Math.round(b.top), barVisible: document.querySelector('.sticky-reply').getAttribute('data-visible') };
    });
    check(`A focused FAQ question is not under the sticky bar (${size.width})`, cover.barVisible !== 'true' || cover.fBottom <= cover.barTop + 1, JSON.stringify(cover));
    await intoView(page, '#start');
    await settle(page, 500);
    check(`Sticky bar hidden while the intake is on screen (${size.width})`, (await vis()) === 'false');
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await settle(page, 500);
    check(`Sticky bar hidden at the footer (${size.width})`, (await vis()) === 'false');
    if (size === MOBILE) await save(page, 'mobile-footer.png', 'mobile: footer in view, sticky bar gone');
    await overflowCheck(page, `${tag} sticky bar`, size);
    await ctx.close();
  });
}
for (const size of [TABLET, DESKTOP, MOBILE]) {
  await step(`safe cta ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    const shown = () => page.evaluate(() => {
      const a = document.querySelector('.safe__cta');
      return { vis: a?.getAttribute('data-visible'), display: a ? getComputedStyle(a).display : 'none', opacity: a ? getComputedStyle(a).opacity : '0' };
    });
    const top = await shown();
    check(`SafeCta not shown over the hero (${size.width})`, top.vis !== 'true' || top.display === 'none');
    const heroBar = await page.evaluate(() => Math.round(document.getElementById('hero-reply-bar').getBoundingClientRect().bottom + window.scrollY));
    await jump(page, heroBar + 40);
    await settle(page, 600);
    const after = await shown();
    if (size === MOBILE) check('SafeCta is not used on phones (the bottom bar is)', after.display === 'none', JSON.stringify(after));
    else check(`SafeCta shows in the top strip after the hero (${size.width})`, after.vis === 'true' && after.display !== 'none' && Number(after.opacity) > 0.9, JSON.stringify(after));
    await save(page, `${size.name}-safe-cta.png`, `${size.name}: scrolled past the hero: the top strip carries the "Get my case in order" call to action beside Quick exit`, { clip: { x: 0, y: 0, width: size.width, height: size === MOBILE ? 140 : 110 } });
    await save(page, `${size.name}-safe-cta-viewport.png`, `${size.name}: the same moment, whole viewport`);
    await intoView(page, '#start');
    await settle(page, 500);
    const atIntake = await shown();
    check(`SafeCta hidden while the intake is on screen (${size.width})`, size === MOBILE || atIntake.vis !== 'true', JSON.stringify(atIntake));
    await ctx.close();
  });
}

// ───────── 13. Quick-exit and layer behaviour ─────────
await step('quick exit', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  await page.route('https://www.google.ca/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>exit</title>exited' }));
  const exited = () => page.url().startsWith('https://www.google.ca');

  await page.locator('#ask .cite__btn').first().scrollIntoViewIfNeeded();
  await page.locator('#ask .cite__btn').first().click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('Quick exit does not fire: Esc x2 with a Cite popover open', !exited() && (await page.locator('.cite__pop').count()) === 0, page.url());

  await page.locator('.see-page').first().scrollIntoViewIfNeeded();
  await page.locator('.see-page').first().click();
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('Quick exit does not fire: Esc x2 with the SourceViewer open', !exited(), page.url());

  await page.locator('.get-attach').first().scrollIntoViewIfNeeded();
  await page.locator('.get-attach', { hasText: 'Summary for my lawyer' }).click();
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('Quick exit does not fire: Esc x2 with the Summary dialog open', !exited(), page.url());

  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  check('Quick exit fires: Esc x2 with nothing open', exited(), page.url());
  await ctx.close();
});
await step('quick exit mobile menu', async () => {
  const { ctx, page } = await openPage(browser, MOBILE);
  await page.route('https://www.google.ca/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>exit</title>exited' }));
  await page.locator('.nav__menu-btn').click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('Quick exit does not fire: Esc x2 with the mobile menu open', !page.url().startsWith('https://www.google.ca'), page.url());
  await ctx.close();
});

await step('tab order', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.className);
  await page.keyboard.press('Tab');
  const second = await page.evaluate(() => document.activeElement?.className);
  check('Tab order: skip link, then Quick exit', /skip-link/.test(first) && /qx/.test(second), `${first} > ${second}`);
  await ctx.close();
});

// ───────── 14. Reduced motion: full page ─────────
for (const size of [DESKTOP, MOBILE]) {
  await step(`reduced ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size, { reduced: true });
    await heroChip(page, 'Money owed').click();
    await settle(page, 400);
    await save(page, `${size.name}-reduced-motion-full.png`, `${size.name}: reduced motion, "Money owed" chosen: final states shown at once, full page`, { fullPage: true });
    const mode = (await pileGeo(page)).mode;
    check(`Reduced motion: S4 is the static finished timeline (${size.width})`, mode === 'static', `data-mode=${mode}`);
    await ctx.close();
  });
}

// ───────── r3b: the last small pass ─────────
/** Can the visitor start from here? The hero's button is fully on screen, or a sticky call to action is showing.
 *  Measured from the page's geometry, not from the logic the hook uses. */
async function ctaState(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const r = document.getElementById('hero-reply-bar').getBoundingClientRect();
    const heroWhole = r.top >= 0 && r.bottom <= vh;
    const shown = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.9 && b.width > 0 && b.bottom > 0 && b.top < vh;
    };
    const stickyBar = shown('.sticky-reply[data-visible="true"] .sticky-reply__link');
    const safeCta = shown('.safe__cta[data-visible="true"]');
    return { heroWhole, stickyBar, safeCta, heroTop: Math.round(r.top), heroBottom: Math.round(r.bottom), vh, ok: heroWhole || stickyBar || safeCta };
  });
}

await step('r3b first viewports', async () => {
  for (const size of [{ name: 'narrow', width: 320, height: 700 }, { name: 'small', width: 360, height: 640 }, MOBILE, DESKTOP]) {
    const { ctx, page, tag } = await openPage(browser, size);
    const st = await ctaState(page);
    check(`A way to start is on the first screen at ${size.width}x${size.height}: the hero button is fully in view OR a sticky bar is showing`, st.ok, JSON.stringify(st));
    await save(page, `${size.name}-first-viewport.png`, `first viewport at ${size.width}x${size.height}`);
    await overflowCheck(page, `${tag} first viewport`, size);
    await ctx.close();
  }
});

await step('r3b hero family', async () => {
  for (const size of [DESKTOP, MOBILE]) {
    const { ctx, page } = await openPage(browser, size);
    await heroChip(page, 'Family & separation').click();
    await settle(page, 3300);
    const lift = await page.evaluate(() => {
      const l = document.querySelector('.lift');
      const t = l.querySelector('.page-tag');
      const next = document.querySelector('.thread .bubble--gap');
      const tb = t.getBoundingClientRect();
      return { text: l.innerText.replace(/\s+/g, ' ').trim(), tagH: Math.round(tb.height), tagW: Math.round(tb.width), tagBottom: Math.round(tb.bottom), liftTop: Math.round(l.getBoundingClientRect().top), gapTop: Math.round(next.getBoundingClientRect().top), liftBottom: Math.round(l.getBoundingClientRect().bottom) };
    });
    check(`Family lift reads "August mortgage, my half" with the E-transfer tag (${size.width})`, /August mortgage, my half/.test(lift.text) && /E-transfer note · Aug 2025 · page 1/.test(lift.text), lift.text);
    check(`Family lift tag does not crowd the next bubble (${size.width}): at most two lines, and the lift ends above the gap bubble`, lift.tagH <= 48 && lift.liftBottom <= lift.gapTop, `tag ${lift.tagW}x${lift.tagH}px; lift bottom ${lift.liftBottom}px, next bubble top ${lift.gapTop}px`);
    if (size === DESKTOP) {
      await save(page, 'desktop-hero-family.png', 'hero with the Family chip, 1440x900');
    } else {
      await intoView(page, '.hero-chips');
      await settle(page, 250);
      await saveEl(page.locator('.thread'), 'mobile-hero-family-thread.png', 'mobile: the example thread with the Family chip: lift, gap');
    }
    await ctx.close();
  }
});

await step('r3b mobile slices', async () => {
  const { ctx, page, tag } = await openPage(browser, MOBILE);
  const css = await page.evaluate(() => ({
    mainPad: parseFloat(getComputedStyle(document.querySelector('main')).paddingBottom),
    scrollPadBottom: parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom),
    scrollPadTop: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
    bar: Math.round(document.querySelector('.sticky-reply').getBoundingClientRect().height),
  }));
  check('Phones: main ends clear of the sticky bottom bar, and anchors scroll clear of both bars', css.mainPad >= css.bar && css.scrollPadBottom >= css.bar && css.scrollPadTop >= 48, JSON.stringify(css));
  for (const [id, sel, label] of [['founding', '#founding', 'Hands-on help'], ['faq', '#faq', 'the FAQ']]) {
    const top = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);
    for (let i = 0; i < 3; i++) {
      // Each slice advances by less than a screen: the status strip (40px) and sticky bar (72px) never hide a line between slices.
      await jump(page, top - 60 + i * (MOBILE.height - 150));
      await settle(page, 350);
      await save(page, `mobile-slice-${id}-${i + 1}.png`, `mobile: ${label}, slice ${i + 1} of 3 (each step is 150px shorter than the screen, so the strip and the bar hide nothing)`);
    }
  }
  // A jump to an anchor lands clear of the strip.
  await page.evaluate(() => { window.location.hash = '#founding'; });
  await settle(page, 600);
  const land = await page.evaluate(() => Math.round(document.querySelector('#founding h2').getBoundingClientRect().top));
  check('Jumping to #founding lands the heading below the sticky strip', land >= 44, `heading top ${land}px`);
  await overflowCheck(page, `${tag} slices`, MOBILE);
  await ctx.close();
});

for (const size of [MOBILE, NARROW]) {
  await step(`r3b sticky ${size.name}`, async () => {
    const { ctx, page, tag } = await openPage(browser, size);
    await intoView(page, '#how');
    await settle(page, 500);
    const st = await ctaState(page);
    check(`Sticky bar is showing mid-page (${size.width})`, st.stickyBar, JSON.stringify(st));
    await save(page, `${size.name}-sticky-bar.png`, `${size.name}: sticky bar at the bottom, mid-page`);
    const arrows = await page.evaluate(() => ({
      sticky: document.querySelector('.sticky-reply__link .send__arrow path')?.getAttribute('d'),
      hero: document.querySelector('#hero-reply-bar .send__arrow path')?.getAttribute('d'),
    }));
    check(`Start arrows point right on the hero bar and the sticky bar (${size.width})`, /^M4 11.25C3.58/.test(arrows.sticky ?? '') && /^M4 11.25C3.58/.test(arrows.hero ?? ''), JSON.stringify(arrows));
    await overflowCheck(page, `${tag} sticky bar`, size);
    await ctx.close();
  });
}

await step('r3b safe cta and send arrows', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  await jump(page, 1500);
  await settle(page, 600);
  const d = await page.evaluate(() => document.querySelector('.safe__cta svg path')?.getAttribute('d'));
  check('SafeCta uses the right (start) arrow', /^M4 11.25C3.58/.test(d ?? ''), String(d));
  await save(page, 'desktop-safe-cta.png', 'desktop: the SafeCta with its right arrow, after the hero', { clip: { x: 0, y: 0, width: 1440, height: 80 } });
  await ctx.close();
  const m = await openPage(browser, MOBILE);
  await stubApi(m.page);
  await toStep6(m.page);
  const up = await m.page.evaluate(() => document.querySelector('.convo-sheet .composer-dock .composer__go .send__arrow path')?.getAttribute('d'));
  check("The intake's final submit keeps the up (send) arrow", /^M12.75 20C12.75/.test(up ?? ''), String(up));
  await m.ctx.close();
});

for (const size of [DESKTOP, MOBILE, NARROW]) {
  await step(`r3b captions ${size.name}`, async () => {
    // Reduced motion shows every final state, so every caption is at full strength.
    const { ctx, page } = await openPage(browser, size, { reduced: true });
    const res = await page.evaluate(() => {
      const lum = (c) => {
        const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const parse = (s) => { const m = s.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]; return { c: m.slice(0, 3), a: m[3] ?? 1 }; };
      const bgOf = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const { c, a } = parse(getComputedStyle(e).backgroundColor);
          if (a > 0.5) return c;
        }
        return [242, 242, 245];
      };
      const small = [];
      const weak = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement;
        if (!el || seen.has(el)) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height <= 1 || el.closest('.sr-only, [hidden], [inert], .hp, script, style, [aria-hidden="true"] .send__arrow')) continue;
        const size = parseFloat(cs.fontSize);
        const fg = parse(cs.color).c;
        const bg = bgOf(el);
        const L1 = lum(fg), L2 = lum(bg);
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const name = el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0];
        if (size < 13) small.push(name + ' ' + size + 'px');
        if (size < 14 && ratio < 4.5) weak.push(name + ' ' + ratio.toFixed(2));
      }
      return { small: [...new Set(small)], weak: [...new Set(weak)] };
    });
    check(`No visible text under 13px (${size.width})`, res.small.length === 0, res.small.slice(0, 8).join('; ') || 'none');
    check(`Small text has at least 4.5:1 contrast (${size.width})`, res.weak.length === 0, res.weak.slice(0, 8).join('; ') || 'none');
    if (size === DESKTOP) {
      await jump(page, 0);
      const g = await pileGeo(page);
      await jump(page, g.top - 44);
      await settle(page, 300);
      await save(page, 'desktop-captions-s4.png', 'desktop: the S4 timeline date labels and the roll caption at 13px', { fullPage: false });
    }
    await ctx.close();
  });
}

await step('r3b s4 rows 390', async () => {
  const { ctx, page } = await openPage(browser, MOBILE);
  for (const row of [0, 3]) {
    for (const [id, frac] of [['lift', 0.84], ['landed', 0.45]]) {
      await page.evaluate(([r, f]) => {
        const el = document.querySelector(`.pile-row[data-row="${r}"]`);
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * f, behavior: 'instant' });
      }, [row, frac]);
      await settle(page, 350);
      await save(page, `mobile-s4-row${row}-${id}.png`, `mobile: S4 row ${row}, ${id === 'lift' ? 'tile in flight' : 'tile landed'}`);
    }
  }
  await ctx.close();
});

// ───────── convo: the conversation sheet (TARGETED=convo runs only these) ─────────
const sheetState = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('.convo-sheet');
    const r = d.getBoundingClientRect();
    const a = document.activeElement;
    return {
      open: d.open,
      left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), width: Math.round(r.width),
      vw: window.innerWidth, vh: window.innerHeight,
      focusTag: a?.tagName, focusText: (a?.textContent ?? '').trim().slice(0, 40), focusClass: String(a?.className ?? ''),
      url: location.pathname + location.search + location.hash,
      histLen: history.length,
    };
  });
const sheetOverflow = (page) =>
  page.evaluate(() => {
    const s = document.querySelector('.convo-sheet .sheet-scroll');
    const h = document.querySelector('.convo-sheet .sheet-head');
    return { scroll: s.scrollWidth - s.clientWidth, head: h.scrollWidth - h.clientWidth, doc: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
const closedFinal = async (page, file, what) => {
  await page.evaluate(() => document.querySelector('#start').scrollIntoView({ block: 'start' }));
  await settle(page, 500);
  await save(page, file, what);
};

await step('convo desktop sheet', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  await openSheet(page);
  await save(page, 'desktop-convo-step1.png', 'desktop 1440x900: the sheet opened from the hero send pill at step 1, the page dimmed behind, header with Close, avatar, name, status and Quick exit');
  const st = await sheetState(page);
  check('Sheet opens from the hero send pill and focus lands on the first question (legend)', st.open && st.focusTag === 'LEGEND' && /case about/.test(st.focusText), `${st.focusTag} "${st.focusText}"`);
  check('Desktop sheet is a 460px panel docked right, 12px from the top, right and bottom', st.width === 460 && st.top === 12 && st.vw - st.right === 12 && st.vh - st.bottom === 12, JSON.stringify(st));
  const head = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const c = q('.convo-sheet .icon-btn').getBoundingClientRect();
    const x = q('.convo-sheet .qx').getBoundingClientRect();
    const st = q('.sheet-head__status');
    return { closeW: Math.round(c.width), closeH: Math.round(c.height), closeLeft: Math.round(c.left), qxLeft: Math.round(x.left), name: q('.sheet-head__name').textContent, statusSize: parseFloat(getComputedStyle(st).fontSize), closeLabel: q('.convo-sheet .icon-btn').getAttribute('aria-label') };
  });
  check('Header: Close is a 44px circle left of Quick exit, name "Case IQ", status line 13px, Close labelled', head.closeW === 44 && head.closeH === 44 && head.closeLeft < head.qxLeft && head.name === 'Case IQ' && head.statusSize === 13 && head.closeLabel === 'Close', JSON.stringify(head));
  await ctx.close();
});

await step('convo launcher chip desktop', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  await closedFinal(page, 'desktop-final-closed.png', 'desktop 1440x900: the closing section closed: words on the left, early-access link under them, question 1 as a launcher card on the right');
  const split = await page.evaluate(() => {
    const t = document.querySelector('.final__text').getBoundingClientRect();
    const c = document.querySelector('.final__card').getBoundingClientRect();
    return { text: Math.round(t.width), card: Math.round(c.width), gap: Math.round(c.left - t.right) };
  });
  check('Closing section: two columns 5fr / 7fr with a 64px gap from 1000px', Math.abs(split.card / split.text - 7 / 5) < 0.03 && split.gap === 64, JSON.stringify(split));
  const hint = await page.evaluate(() => {
    const chips = [...document.querySelectorAll('.launch__chip')];
    return { n: chips.length, described: chips.every((c) => document.getElementById(c.getAttribute('aria-describedby'))?.textContent === 'Opens the questions with this answer chosen'), tag: chips[0]?.tagName };
  });
  check('Launcher: six chips, real buttons, each described by the sr-only hint', hint.n === 6 && hint.described && hint.tag === 'BUTTON', JSON.stringify(hint));
  await page.getByRole('button', { name: 'Housing (landlord and tenant)' }).click();
  await settle(page, 900);
  await save(page, 'desktop-convo-launcher-chip-step2.png', 'desktop: after tapping the "Housing" chip in the launcher: the sheet is open on step 2, the answer echoed as a sent bubble');
  const st = await sheetState(page);
  const text = await page.locator('.convo-sheet .chat').innerText();
  check('One tap starts: the sheet is open on "Step 2 of 6" with the answer echoed, focus on question 2', st.open && /Step 2 of 6/.test(text) && /Housing \(landlord and tenant\)/.test(text) && st.focusTag === 'LEGEND' && /Where is your case/.test(st.focusText), `${st.focusTag} "${st.focusText}"`);
  await page.keyboard.press('Escape');
  await settle(page, 450);
  const back = await sheetState(page);
  check('Esc closes the sheet and focus returns to the launcher (the chip is gone, so its "Continue" button)', !back.open && /Continue/.test(back.focusText), `${back.focusTag} "${back.focusText}"`);
  await closedFinal(page, 'desktop-launcher-partway.png', 'desktop: the closing section after closing mid-way: question 1 replaced by the "partway through" message, "Step 2 of 6", the send pill reads Continue');
  const partway = await page.locator('.launch').innerText();
  check('In-progress launcher: shows the resume message, Step 2 of 6 and "Continue"', /partway through the questions/.test(partway) && /Step 2 of 6/.test(partway) && /Continue/.test(partway) && !/Housing/.test(partway), partway.replace(/\s+/g, ' ').slice(0, 120));
  await page.getByRole('button', { name: 'Continue' }).click();
  await settle(page, 700);
  const again = await page.locator('.convo-sheet .chat').innerText();
  check('Reopening keeps the answers: the sheet is still on step 2 with "Housing" echoed', /Step 2 of 6/.test(again) && /Housing \(landlord and tenant\)/.test(again));
  await page.keyboard.press('Escape');
  await settle(page, 450);
  await ctx.close();
});

await step('convo mobile', async () => {
  const { ctx, page, tag } = await openPage(browser, MOBILE);
  await closedFinal(page, 'mobile-final-closed.png', 'mobile 390x844: the closing section closed, one column: words, then the launcher card');
  await page.evaluate(() => window.scrollBy(0, 560));
  await settle(page, 300);
  await save(page, 'mobile-final-closed-2.png', 'mobile 390x844: the same section, scrolled to the launcher send pill and the early-access link');
  await openSheet(page);
  await save(page, 'mobile-convo-step1.png', 'mobile 390x844: the sheet at step 1: full screen, header Close / avatar and name / Quick exit, composer at the bottom');
  const st = await sheetState(page);
  check('Phone sheet is full screen (100dvh)', st.open && st.width === st.vw && st.top === 0 && st.bottom === st.vh, JSON.stringify(st));
  const targets = await page.evaluate(() => [...document.querySelectorAll('.convo-sheet .sheet-head button')].map((b) => Math.round(b.getBoundingClientRect().height)));
  check('Header controls are at least 32px tall and Close is 44px', targets.every((h) => h >= 32) && targets.includes(44), targets.join(','));
  await closeSheet(page);
  await toStep6(page);
  await settle(page, 400);
  await save(page, 'mobile-convo-step6.png', 'mobile 390x844: the sheet at step 6 (contact form), composer visible at the bottom');
  const dock = await page.evaluate(() => {
    const c = document.querySelector('.convo-sheet .composer').getBoundingClientRect();
    return { bottom: Math.round(c.bottom), vh: window.innerHeight };
  });
  check('Step 6 on a phone: the composer is visible at the bottom of the screen', dock.bottom <= dock.vh && dock.bottom >= dock.vh - 40, JSON.stringify(dock));
  const o = await sheetOverflow(page);
  check('No horizontal overflow in the sheet at 390 (step 6)', o.scroll <= 0 && o.head <= 0 && o.doc <= 0, JSON.stringify(o));
  await overflowCheck(page, `${tag} sheet step 6`, MOBILE);
  await ctx.close();
});

await step('convo narrow', async () => {
  const { ctx, page, tag } = await openPage(browser, NARROW);
  await closedFinal(page, 'narrow-final-closed.png', 'narrow 320x700: the closing section closed');
  await openSheet(page);
  await save(page, 'narrow-convo-step1.png', 'narrow 320x700: the sheet at step 1');
  let o = await sheetOverflow(page);
  check('No horizontal overflow in the sheet at 320 (step 1)', o.scroll <= 0 && o.head <= 0 && o.doc <= 0, JSON.stringify(o));
  await closeSheet(page);
  await toStep6(page);
  await pickChip(page, 'Phone call');
  await settle(page, 300);
  await sheetToEnd(page);
  await save(page, 'narrow-convo-step6.png', 'narrow 320x700: the sheet at step 6 with "Phone call", scrolled to the end');
  o = await sheetOverflow(page);
  check('No horizontal overflow in the sheet at 320 (step 6)', o.scroll <= 0 && o.head <= 0 && o.doc <= 0, JSON.stringify(o));
  await overflowCheck(page, `${tag} sheet step 6`, NARROW);
  await ctx.close();
});

for (const size of [DESKTOP, MOBILE]) {
  await step(`convo sent ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await stubApi(page);
    await toStep6(page);
    await page.getByLabel('First name').fill('Sam');
    await page.locator('.convo-sheet .chat input[type="email"]').fill('sam@example.com');
    await page.locator('.convo-sheet .chat input[name="consentPrivacy"]').check();
    await page.locator('.convo-sheet .composer-dock .composer__go').click();
    await settle(page, 900);
    await save(page, `${size.name}-convo-sent.png`, `${size.name}: the sheet after sending (API intercepted with a 200): the thank-you message, no composer`);
    const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    check(`Sent: focus is on the success message (${size.name})`, role === 'status');
    await closeSheet(page);
    await closedFinal(page, `${size.name}-launcher-sent.png`, `${size.name}: the closing section after the request is sent: "Thank you, Sam." with the tip and a "See your answers" button`);
    const t = await page.locator('.launch').innerText();
    check(`Sent launcher: greets by first name, shows the tip and "See your answers", no chips (${size.name})`, /Thank you, Sam\./.test(t) && /put your papers in one place/.test(t) && /See your answers/.test(t) && (await page.locator('.launch__chip').count()) === 0, t.replace(/\s+/g, ' ').slice(0, 110));
    await page.getByRole('button', { name: 'See your answers' }).click();
    await settle(page, 700);
    const st = await sheetState(page);
    check(`"See your answers" reopens the sheet with focus on the confirmation (${size.name})`, st.open && (await page.evaluate(() => document.activeElement?.getAttribute('role'))) === 'status');
    await ctx.close();
  });
}

for (const size of [DESKTOP, MOBILE]) {
  await step(`convo waitlist ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await page.evaluate(() => document.querySelector('#start').scrollIntoView());
    await settle(page, 300);
    await page.locator('.final__link .wl-toggle').click();
    await settle(page, 800);
    await save(page, `${size.name}-convo-waitlist.png`, `${size.name}: the early-access link in the closing section opens the sheet with the list expanded and its heading focused`);
    const info = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: (document.activeElement?.textContent ?? '').trim().slice(0, 40), expanded: document.querySelector('.convo-sheet .wl-toggle')?.getAttribute('aria-expanded') }));
    check(`Early-access link opens the sheet with the list expanded, focus on its heading (${size.name})`, info.tag === 'H3' && /early-access/i.test(info.text) && info.expanded === 'true', JSON.stringify(info));
    await ctx.close();
  });
}

for (const size of [DESKTOP, MOBILE]) {
  await step(`convo reduced ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size, { reduced: true });
    await page.locator('#hero-reply-bar').click();
    await page.waitForTimeout(40);
    const early = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.convo-sheet')); return { transform: cs.transform, opacity: cs.opacity }; });
    check(`Reduced motion: the sheet has no transform from the first frame (${size.name})`, early.transform === 'none' || early.transform === 'matrix(1, 0, 0, 1, 0, 0)', JSON.stringify(early));
    await settle(page, 400);
    await save(page, `${size.name}-convo-reduced.png`, `${size.name}: reduced motion: the sheet is simply there, no movement`);
    await ctx.close();
  });
}

// ───────── convo round 2: step in view above the dock, dock pinned, phone composer, launcher by card width ─────────
const W768 = { name: 'tablet768', width: 768, height: 1024 };
const W1024 = { name: 'w1024', width: 1024, height: 768 };
const W1280 = { name: 'w1280', width: 1280, height: 800 };
const W360 = { name: 'w360', width: 360, height: 640 };
const dockMetrics = (page) =>
  page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const dlg = q('.convo-sheet').getBoundingClientRect();
    const dock = q('.convo-sheet .composer-dock').getBoundingClientRect();
    const sc = q('.convo-sheet .sheet-scroll').getBoundingClientRect();
    const legend = q('.convo-sheet .step__legend');
    const fset = legend.closest('fieldset').getBoundingClientRect();
    const chips = [...legend.closest('fieldset').querySelectorAll('.opt .chip')].map((c) => c.getBoundingClientRect());
    const label = q('.convo-sheet .composer__label');
    const lineH = parseFloat(getComputedStyle(label).lineHeight) || parseFloat(getComputedStyle(label).fontSize) * 1.2;
    return {
      gap: Math.round(dlg.bottom - dock.bottom),
      dockTop: Math.round(dock.top),
      stepBottom: Math.round(fset.bottom),
      lastChipBottom: chips.length ? Math.round(Math.max(...chips.map((c) => c.bottom))) : null,
      legendTop: Math.round(legend.getBoundingClientRect().top - sc.top),
      legendBottom: Math.round(legend.getBoundingClientRect().bottom),
      scTop: Math.round(sc.top),
      labelLines: Math.round(label.getBoundingClientRect().height / lineH),
      labelFont: parseFloat(getComputedStyle(q('.convo-sheet .composer-dock .composer__go')).fontSize),
      goW: Math.round(q('.convo-sheet .composer-dock .composer__go').getBoundingClientRect().width),
      goRight: Math.round(q('.convo-sheet .composer-dock .composer__go').getBoundingClientRect().right),
      dlgRight: Math.round(dlg.right),
      headH: Math.round(q('.convo-sheet .sheet-head').getBoundingClientRect().height),
      statusLines: Math.round(q('.sheet-head__status').getBoundingClientRect().height / (parseFloat(getComputedStyle(q('.sheet-head__status')).lineHeight) || 16)),
    };
  });
const launchMetrics = (page) =>
  page.evaluate(() => {
    const h = document.querySelector('.launch__bar .reply-bar__helper');
    const send = document.querySelector('.launch__bar .send');
    const lh = parseFloat(getComputedStyle(h).lineHeight);
    return {
      card: Math.round(document.querySelector('.final__card').getBoundingClientRect().width),
      helperLines: Math.round(h.getBoundingClientRect().height / lh),
      stacked: h.getBoundingClientRect().bottom <= send.getBoundingClientRect().top + 2,
      sendW: Math.round(send.getBoundingClientRect().width),
    };
  });

await step('convo r2 tablet and 1024', async () => {
  const t = await openPage(browser, W768);
  await openSheet(t.page);
  await save(t.page, 'tablet768-convo-step1.png', '768x1024: the sheet at step 1 (still a docked 460px panel from 768px)');
  const tm = await dockMetrics(t.page);
  check('768: the dock is pinned to the bottom of the panel and the whole question sits above it', tm.gap <= 1 && tm.lastChipBottom <= tm.dockTop + 2, JSON.stringify(tm));
  await t.ctx.close();

  const { ctx, page } = await openPage(browser, W1024);
  await closedFinal(page, 'w1024-final-closed.png', '1024x768: the closing section: the launcher card is narrow, so the reply bar stacks (helper above a full-width pill)');
  const lm = await launchMetrics(page);
  check('1024: launcher reply bar stacks, helper on at most two lines', lm.stacked && lm.helperLines <= 2, JSON.stringify(lm));
  await page.locator('#hero-reply-bar').scrollIntoViewIfNeeded().catch(() => {});
  await openSheet(page);
  const m1 = await dockMetrics(page);
  check('Step 1: dock pinned to the panel bottom (no early-access link under it)', m1.gap <= 1, JSON.stringify(m1));
  await answer(page, 'Job or workplace');
  const m2 = await dockMetrics(page);
  check('Step 2: dock pinned to the panel bottom', m2.gap <= 1, JSON.stringify(m2));
  await answer(page, 'Ontario');
  await settle(page, 700);
  const m3 = await dockMetrics(page);
  await save(page, 'w1024-convo-step3.png', '1024x768: the sheet at step 3 after advancing: the question and every option sit above the dock');
  check('1024x768 step 3: every option is above the dock, the question is in view', m3.lastChipBottom <= m3.dockTop + 2 && m3.legendBottom > m3.scTop, JSON.stringify(m3));
  await pickChip(page, 'In the next 2 weeks');
  await settle(page, 900);
  const m3b = await dockMetrics(page);
  check('Step 3 with its note: the whole step (note included) is above the dock', m3b.stepBottom <= m3b.dockTop + 1, JSON.stringify(m3b));
  await save(page, 'w1024-convo-step3-note.png', '1024x768: step 3 after "In the next 2 weeks": the note is brought above the dock');
  await ctx.close();
});

for (const size of [W1280, DESKTOP]) {
  await step(`convo r2 launcher ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await closedFinal(page, `${size.name}-launcher.png`, `${size.width}px: the closing section's launcher reply bar`);
    const lm = await launchMetrics(page);
    check(`${size.width}: launcher reply bar is one row (card ${lm.card}px) with the helper on at most two lines`, !lm.stacked && lm.helperLines <= 2, JSON.stringify(lm));
    await ctx.close();
  });
}

await step('convo r2 360x640', async () => {
  const { ctx, page } = await openPage(browser, W360);
  await openSheet(page);
  await save(page, 'w360-convo-step1.png', '360x640: the sheet at step 1: question and all six chips above the dock');
  const m = await dockMetrics(page);
  check('360x640 step 1: all six chips are above the dock and the question is in view', m.lastChipBottom <= m.dockTop + 2 && m.legendBottom > m.scTop, JSON.stringify(m));
  check('360: Back is hidden on step 1, header is at most 76px (status on two lines)', m.headH <= 76 && m.statusLines <= 2, JSON.stringify({ headH: m.headH, statusLines: m.statusLines }));
  await ctx.close();
});

for (const size of [{ name: 'w390', width: 390, height: 844 }, { name: 'w360', width: 360, height: 640 }, NARROW, DESKTOP]) {
  await step(`convo r2 step6 ${size.name === 'w390' ? 'mobile' : size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await toStep6(page);
    await settle(page, 600);
    await save(page, `${size.name === 'w390' ? 'mobile' : size.name === 'narrow' ? 'narrow' : size.name}-convo-step6-arrival.png`, `${size.width}x${size.height}: step 6 on arrival (not scrolled further): Back and the send button visible, Email above the dock`);
    const m = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const dock = q('.convo-sheet .composer-dock').getBoundingClientRect();
      const email = q('.convo-sheet input[type="email"]').getBoundingClientRect();
      const back = q('.convo-sheet .composer__back').getBoundingClientRect();
      const go = q('.convo-sheet .composer-dock .composer__go').getBoundingClientRect();
      const label = q('.convo-sheet .composer__label');
      return { emailBottom: Math.round(email.bottom), dockTop: Math.round(dock.top), back: [Math.round(back.width), Math.round(back.height)], goH: Math.round(go.height), labelH: Math.round(label.getBoundingClientRect().height), labelFont: parseFloat(getComputedStyle(label).fontSize), backLabel: q('.convo-sheet .composer__back').getAttribute('aria-label'), composerH: Math.round(q('.convo-sheet .composer').getBoundingClientRect().height) };
    });
    check(`Step 6 at ${size.width}: Email is fully above the dock`, m.emailBottom <= m.dockTop, JSON.stringify(m));
    check(`Step 6 at ${size.width}: Back is a 44px icon button named "Back" on the same row as the send pill`, m.back[0] === 44 && m.back[1] === 44 && m.backLabel === 'Back' && m.composerH < 80, JSON.stringify(m));
    if (size.width >= 360) check(`Step 6 at ${size.width}: "Request my free conversation" is on one line (${m.labelFont}px)`, m.labelH < m.labelFont * 1.6, JSON.stringify(m));
    await ctx.close();
  });
}

await step('convo r2 enter frames', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  await page.evaluate(() => document.querySelector('#hero-reply-bar').click());
  await page.evaluate(() => { for (const a of document.getAnimations()) a.pause(); });
  for (const t of [60, 140, 220]) {
    await page.evaluate((ms) => { for (const a of document.getAnimations()) a.currentTime = ms; }, t);
    const st = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.convo-sheet')); return { o: Number(cs.opacity).toFixed(2), tx: cs.transform }; });
    await save(page, `desktop-convo-enter-${t}ms.png`, `desktop 1440: the sheet's entrance frozen at ${t}ms (opacity ${st.o}, transform ${st.tx})`);
    if (t === 140) check('Entrance at 140ms: the panel is fully opaque (the page cannot show through)', Number(st.o) === 1, JSON.stringify(st));
  }
  await ctx.close();
});

await step('convo r2 behaviour', async () => {
  // Closing with X from the phone menu: focus must land on the menu button, not on <body>.
  const { ctx, page } = await openPage(browser, MOBILE);
  await page.locator('.nav__menu-btn').click();
  await page.locator('.nav__panel a[href="/#start"]').click();
  await page.waitForSelector('.convo-sheet[open]');
  await settle(page, 500);
  await page.locator('.convo-sheet .sheet-head__close').click();
  await settle(page, 500);
  const after = await page.evaluate(() => ({ tag: document.activeElement?.tagName, cls: String(document.activeElement?.className ?? '').slice(0, 30), text: (document.activeElement?.textContent ?? '').trim().slice(0, 20) }));
  check('Opened from the phone menu, closed with X: focus lands on the menu button', after.tag === 'BUTTON' && /nav__menu-btn/.test(after.cls), JSON.stringify(after));
  note('(menu close)', `document.activeElement after closing via X from the phone menu: ${JSON.stringify(after)}`);
  await ctx.close();

  // Arrival by hash: closing returns focus to the launcher button, not <body>.
  const h = await openPage(browser, DESKTOP, { path: '/#start', label: 'hash-focus' });
  await h.page.waitForSelector('.convo-sheet[open]', { timeout: 3000 }).catch(() => {});
  await settle(h.page, 500);
  await h.page.keyboard.press('Escape');
  await settle(h.page, 500);
  const ha = await h.page.evaluate(() => ({ tag: document.activeElement?.tagName, text: (document.activeElement?.textContent ?? '').trim().slice(0, 30) }));
  check('Arrived at /#start, closed with Esc: focus lands on the launcher button', ha.tag === 'BUTTON' && /Get my case in order/.test(ha.text), JSON.stringify(ha));
  await h.ctx.close();

  // Dialog name and description; intro; Next quiet until an answer; failed send keeps the answers.
  const d = await openPage(browser, DESKTOP);
  await d.page.route('**/api/intake', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await openSheet(d.page);
  const named = await d.page.getByRole('dialog', { name: 'Your request to Case IQ' }).count();
  const desc = await d.page.evaluate(() => { const dlg = document.querySelector('.convo-sheet'); return document.getElementById(dlg.getAttribute('aria-describedby'))?.textContent; });
  check('Dialog is named "Your request to Case IQ" and described by the status line; the header still reads "Case IQ"', named === 1 && desc === 'A person replies within one business day' && (await d.page.locator('.convo-sheet .sheet-head__name').innerText()) === 'Case IQ', `named=${named}, description="${desc}"`);
  const intro = await d.page.locator('.convo-sheet .chat .bubble').first().innerText();
  check('Intro says nothing is sent until the final button is pressed', intro === 'These are set questions, not a live chat. Nothing is sent until you press “Request my free conversation” at the end.', intro);
  const quiet = await d.page.evaluate(() => { const b = document.querySelector('.convo-sheet .composer-dock .composer__go'); return { disabled: b.getAttribute('aria-disabled'), quiet: b.dataset.quiet, bg: getComputedStyle(b).backgroundColor, arrowBg: getComputedStyle(b.querySelector('.send__arrow')).backgroundColor, tabbable: b.tabIndex }; });
  check('Next is an outline (white, indigo edge, inverted arrow) and aria-disabled until an answer exists, and stays focusable', quiet.disabled === 'true' && quiet.quiet === 'true' && quiet.bg === 'rgb(255, 255, 255)' && quiet.arrowBg === 'rgb(36, 56, 168)' && quiet.tabbable === 0, JSON.stringify(quiet));
  await save(d.page, 'desktop-convo-next-quiet.png', 'desktop: step 1 before any answer: Next in the outline style (aria-disabled), still focusable');
  // Playwright treats aria-disabled as not clickable, so the press is forced: a person's click lands the same way.
  await d.page.locator('.convo-sheet .composer-dock .composer__go').click({ force: true });
  await settle(d.page, 400);
  check('Pressing the quiet Next still says "Please choose one."', /Please choose one\./.test(await d.page.locator('.convo-sheet .chat').innerText()));
  await pickChip(d.page, 'Job or workplace');
  await settle(d.page, 900);
  const after1 = await d.page.evaluate(() => document.querySelector('.convo-sheet .composer-dock .composer__go').dataset.quiet);
  check('Next is quiet again on the next unanswered question (step 2)', after1 === 'true');
  await answer(d.page, 'Ontario');
  await answer(d.page, 'Later, or no date yet');
  await answer(d.page, 'No');
  await answer(d.page, 'A few documents');
  await d.page.getByLabel('First name').fill('Sam');
  await d.page.locator('.convo-sheet .chat input[type="email"]').fill('sam@example.com');
  await d.page.locator('.convo-sheet .chat input[name="consentPrivacy"]').check();
  await d.page.locator('.convo-sheet .composer-dock .composer__go').click();
  await settle(d.page, 900);
  const summary = await d.page.locator('.convo-sheet .err-sum').innerText();
  const keptName = await d.page.getByLabel('First name').inputValue();
  check('A failed send says the answers are still here, and they are', /Your answers are still here/.test(summary) && keptName === 'Sam', `${summary.replace(/\s+/g, ' ').slice(0, 120)} | first name: ${keptName}`);
  await save(d.page, 'desktop-convo-send-failed.png', 'desktop: a failed send (API returned 500): the error summary says the answers are still here; the form keeps them');
  await d.ctx.close();
});


for (const size of [DESKTOP, MOBILE]) {
  await step(`convo waitlist dock ${size.name}`, async () => {
    const dockState = (page) =>
      page.evaluate(() => {
        const dock = document.querySelector('.convo-sheet .composer-dock');
        return { hidden: dock.hidden, display: getComputedStyle(dock).display, focusable: dock.querySelectorAll('button').length > 0 && dock.checkVisibility() , dockVar: document.querySelector('.convo-sheet .sheet-scroll').style.getPropertyValue('--dock-h'), expanded: document.querySelector('.convo-sheet .wl-toggle').getAttribute('aria-expanded'), active: document.activeElement?.tagName + ':' + (document.activeElement?.textContent ?? '').trim().slice(0, 30) };
      });
    // Opened from the toggle at step 1.
    let { ctx, page } = await openPage(browser, size);
    await openSheet(page);
    await page.locator('.convo-sheet .wl-toggle').click();
    await settle(page, 700);
    let st = await dockState(page);
    check(`Waitlist opened from the toggle: the intake dock is hidden (display none, out of the tree), dock height 0 (${size.name})`, st.hidden && st.display === 'none' && !st.focusable && st.dockVar === '0px', JSON.stringify(st));
    await page.locator('.convo-sheet .wl-toggle').scrollIntoViewIfNeeded();
    await page.locator('.convo-sheet #waitlist h3').scrollIntoViewIfNeeded();
    await settle(page, 400);
    await save(page, `${size.name}-convo-waitlist-toggle.png`, `${size.name}: the list opened from the toggle at step 1: the intake dock is gone, the list has the whole panel`);
    await page.locator('.convo-sheet .wl-toggle').click();
    await settle(page, 500);
    st = await dockState(page);
    check(`Collapsing the list brings the dock back (${size.name})`, !st.hidden && st.display !== 'none' && st.dockVar !== '0px', JSON.stringify(st));
    await ctx.close();
    // The step 2 "elsewhere" path.
    ({ ctx, page } = await openPage(browser, size));
    await openSheet(page);
    await answer(page, 'Housing (landlord and tenant)');
    await pickChip(page, 'Somewhere else in Canada');
    await settle(page, 900);
    await page.locator('.convo-sheet .composer-dock .composer__go').click();
    await settle(page, 900);
    st = await dockState(page);
    check(`"Somewhere else in Canada" then "Join the early-access list": list open, dock hidden, focus on the list heading (${size.name})`, st.expanded === 'true' && st.hidden && /^H3:Join the early/.test(st.active), JSON.stringify(st));
    await save(page, `${size.name}-convo-waitlist-elsewhere.png`, `${size.name}: after the step 2 "elsewhere" path: the list is open, the dock hidden, focus on the heading`);
    await ctx.close();
  });
}


for (const size of [DESKTOP, MOBILE]) {
  await step(`convo next states ${size.name}`, async () => {
    const { ctx, page } = await openPage(browser, size);
    await openSheet(page);
    await save(page, `${size.name}-convo-next-outline.png`, `${size.name}: step 1, no answer yet: Next is white with an indigo edge and an inverted arrow`);
    // The pointer auto-advance waits 320ms, so the answered state of step 1 is visible just before it.
    await pickChip(page, 'Housing (landlord and tenant)');
    await page.waitForTimeout(200); // after the 160ms colour transition, before the auto-advance at 320ms
    const b = await page.evaluate(() => { const g = document.querySelector('.convo-sheet .composer-dock .composer__go'); return { bg: getComputedStyle(g).backgroundColor, quiet: g.dataset.quiet ?? null }; });
    await save(page, `${size.name}-convo-next-filled.png`, `${size.name}: once the question has an answer, Next fills indigo`);
    check(`Next fills indigo once there is an answer (${size.name})`, b.bg === 'rgb(36, 56, 168)' && b.quiet === null, JSON.stringify(b));
    await ctx.close();
  });
}

await step('convo behaviour', async () => {
  const { ctx, page } = await openPage(browser, DESKTOP);
  const exited = () => page.url().startsWith('https://www.google.ca');
  await page.route('https://www.google.ca/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>exit</title>exited' }));

  // Keyboard only: Tab to the hero call to action, Enter opens, focus on the question, Esc closes, focus returns.
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => document.activeElement?.id === 'hero-reply-bar');
  }
  check('Keyboard: Tab reaches the hero call to action', reached);
  const histBefore = await page.evaluate(() => history.length);
  await page.keyboard.press('Enter');
  await settle(page, 600);
  let st = await sheetState(page);
  check('Keyboard: Enter opens the sheet and focus is on the current question', st.open && st.focusTag === 'LEGEND', `${st.focusTag} "${st.focusText}"`);
  check('Opening adds no history entry and leaves the URL alone', st.histLen === histBefore && st.url === '/', `history ${histBefore} -> ${st.histLen}, url ${st.url}`);
  await page.evaluate(() => document.querySelector('.convo-sheet .qx').focus());
  await page.keyboard.press('Tab');
  const second = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  await page.keyboard.press('Tab');
  const third = await page.evaluate(() => document.activeElement?.closest('.chat') !== null);
  check('Tab order in the sheet: Quick exit, Close, then the thread', second === 'Close' && third, `after Quick exit: ${second}; then in the thread: ${third}`);
  await page.keyboard.press('Escape');
  await settle(page, 450);
  st = await sheetState(page);
  check('Esc closes the sheet and focus returns to the control that opened it', !st.open && (await page.evaluate(() => document.activeElement?.id)) === 'hero-reply-bar', `${st.focusTag}`);

  // Esc, Esc with nothing open still leaves the site; with the sheet open it does not.
  await page.locator('#hero-reply-bar').click();
  await settle(page, 600);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('Quick exit does not fire: Esc x2 with the sheet open (the first Esc closes it)', !exited(), page.url());
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  check('Quick exit fires: Esc x2 with nothing open', exited(), page.url());
  await ctx.close();

  // Quick exit inside the sheet leaves the site and cannot be undone with Back.
  const q = await openPage(browser, DESKTOP);
  await q.page.route('https://www.google.ca/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>exit</title>exited' }));
  await openSheet(q.page);
  await q.page.locator('.convo-sheet .qx').click();
  await q.page.waitForTimeout(700);
  check('Quick exit inside the sheet leaves the site', q.page.url().startsWith('https://www.google.ca'), q.page.url());
  await q.page.goBack().catch(() => {});
  await q.page.waitForTimeout(400);
  check('Back after Quick exit does not return to the site', !/localhost/.test(q.page.url()), q.page.url());
  await q.ctx.close();

  // Modified clicks are not intercepted.
  const m = await openPage(browser, DESKTOP);
  const before = m.ctx.pages().length;
  await m.page.locator('#hero-reply-bar').click({ modifiers: ['Control'] });
  await m.page.waitForTimeout(600);
  const open = await m.page.evaluate(() => document.querySelector('.convo-sheet').open);
  check('A ctrl-click on a call to action is not intercepted (the sheet stays shut)', !open, `open=${open}, pages ${before} -> ${m.ctx.pages().length}`);
  await m.ctx.close();

  // Links with a hash: open on load, leave a clean URL, do not reopen on reload.
  for (const [hash, wantList] of [['#start', false], ['#waitlist', true]]) {
    const h = await openPage(browser, DESKTOP, { path: `/${hash}`, label: hash });
    await h.page.waitForSelector('.convo-sheet[open]', { timeout: 3000 }).catch(() => {});
    await settle(h.page, 600);
    const s = await sheetState(h.page);
    const expanded = await h.page.evaluate(() => document.querySelector('.convo-sheet .wl-toggle')?.getAttribute('aria-expanded'));
    check(`Loading /${hash} opens the sheet${wantList ? ' with the list expanded' : ''} and leaves a clean URL`, s.open && s.url === '/' && (expanded === 'true') === wantList, JSON.stringify({ open: s.open, url: s.url, expanded }));
    if (hash === '#waitlist') await save(h.page, 'desktop-convo-hash-waitlist.png', 'desktop: arriving at /#waitlist: the sheet opens with the early-access list expanded, URL already clean');
    await h.page.reload({ waitUntil: 'networkidle' });
    await settle(h.page, 600);
    check(`Reloading after /${hash} does not reopen the sheet`, !(await h.page.evaluate(() => document.querySelector('.convo-sheet').open)));
    await h.ctx.close();
  }

  // From a legal page the nav call to action (a client-side navigation) ends on the home page with the sheet open.
  const l = await openPage(browser, DESKTOP, { path: '/privacy' });
  await l.page.locator('.nav__cta').click();
  await l.page.waitForSelector('.convo-sheet[open]', { timeout: 4000 }).catch(() => {});
  await settle(l.page, 500);
  const ls = await sheetState(l.page);
  check('Nav call to action on a legal page: lands on / with the sheet open and a clean URL', ls.open && ls.url === '/', JSON.stringify({ open: ls.open, url: ls.url }));
  await l.ctx.close();
  const f = await openPage(browser, DESKTOP, { path: '/terms' });
  await f.page.locator('.footer a[href="/#waitlist"]').click();
  await f.page.waitForSelector('.convo-sheet[open]', { timeout: 4000 }).catch(() => {});
  await settle(f.page, 600);
  const fs2 = await sheetState(f.page);
  const fexp = await f.page.evaluate(() => document.querySelector('.convo-sheet .wl-toggle')?.getAttribute('aria-expanded'));
  check('Footer early-access link on a legal page: lands on / with the sheet open, list expanded, clean URL', fs2.open && fs2.url === '/' && fexp === 'true', JSON.stringify({ open: fs2.open, url: fs2.url, fexp }));
  await f.ctx.close();

  // The "free legal help" link inside the sheet closes it and goes to the section.
  const g = await openPage(browser, DESKTOP);
  await openSheet(g.page);
  await answer(g.page, 'Job or workplace');
  await answer(g.page, 'Ontario');
  await pickChip(g.page, 'In the next 2 weeks');
  await settle(g.page, 600);
  await g.page.locator('.convo-sheet .notes a.link').click();
  await settle(g.page, 900);
  const gs = await g.page.evaluate(() => ({ open: document.querySelector('.convo-sheet').open, top: Math.round(document.getElementById('limits').getBoundingClientRect().top), hash: location.hash }));
  check('The "free legal help" link in the sheet closes it and scrolls to the section (no hash added)', !gs.open && gs.top < 400 && gs.hash === '', JSON.stringify(gs));
  await g.ctx.close();

  // The backdrop closes it.
  const b = await openPage(browser, DESKTOP);
  await openSheet(b.page);
  await b.page.mouse.click(300, 450);
  await b.page.waitForTimeout(500);
  check('Clicking the backdrop closes the sheet', !(await b.page.evaluate(() => document.querySelector('.convo-sheet').open)));
  await b.ctx.close();

  // No layout shift behind the sheet, with real scrollbars (headless hides them by default).
  const wide = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const sc = await wide.newContext({ viewport: { width: 1440, height: 900 } });
  await sc.addInitScript(() => { window.__qa = true; });
  const sp = await sc.newPage();
  await sp.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sp.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await sp.evaluate(() => window.scrollTo(0, 1200));
  await sp.waitForTimeout(400);
  const geo = () => sp.evaluate(() => { const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return [Math.round(b.left * 10) / 10, Math.round(b.top * 10) / 10, Math.round(b.width * 10) / 10]; }; return { sbw: window.innerWidth - document.documentElement.clientWidth, h2: r('#how h2'), safe: r('.safe') }; });
  const g1 = await geo();
  await sp.evaluate(() => document.querySelector('.safe__cta').click());
  await sp.waitForTimeout(700);
  const g2 = await geo();
  const shotFile = 'desktop-convo-scrollbar-open.png';
  await sp.screenshot({ path: join(outDir, shotFile) });
  note(shotFile, 'desktop with real (non-overlay) scrollbars: the sheet open over the page mid-scroll; nothing behind it moved');
  captured++;
  check('No layout shift behind the sheet (scrollbar compensated)', g1.h2.join() === g2.h2.join() && g1.safe.join() === g2.safe.join(), `scrollbar ${g1.sbw}px -> ${g2.sbw}px; heading ${g1.h2.join(',')} -> ${g2.h2.join(',')}; strip ${g1.safe.join(',')} -> ${g2.safe.join(',')}`);
  const hiddenWhileOpen = await sp.evaluate(() => ({ cta: getComputedStyle(document.querySelector('.safe__cta')).visibility }));
  check('The strip call to action is hidden while the sheet is open', hiddenWhileOpen.cta === 'hidden', JSON.stringify(hiddenWhileOpen));
  await sp.keyboard.press('Escape');
  await sp.waitForTimeout(500);
  const g3 = await geo();
  check('No layout shift when the sheet closes', g1.h2.join() === g3.h2.join(), `${g1.h2.join(',')} -> ${g3.h2.join(',')}`);
  await sc.close();
  await wide.close();
});

// ───────── Pass 1 part B: the hero film message, the film player and the hero intro (steps named "film ...") ─────────
// Run just these with TARGETED=film (default RUN_ID film-r1). They need the real film files in public/film/.
const FIRST_VIEWPORTS = [
  { name: 'w320', width: 320, height: 568 },
  { name: 'w360', width: 360, height: 740 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'w1024', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];
const PHONE_AND_DESKTOP = [MOBILE, DESKTOP];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A fresh page for the film steps: marked as opened by a check (window.__qa), with the hero given time to finish its intro and snap. */
async function filmPage(size, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: opts.scale ?? 1,
    hasTouch: size.width <= 430,
    isMobile: size.width <= 430,
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
    javaScriptEnabled: opts.noJs ? false : true,
  });
  if (!opts.noJs) await ctx.addInitScript(() => { window.__qa = true; });
  const page = await ctx.newPage();
  const tag = `film@${size.name}${opts.reduced ? '+reduced' : ''}${opts.noJs ? '+nojs' : ''}`;
  // (A page whose script chunks are blocked on purpose reports the blocked requests; they are not findings.)
  if (!opts.quiet) {
    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) consoleLog.push(`[${tag}] ${msg.type()}: ${msg.text().slice(0, 300)}`);
    });
    page.on('pageerror', (err) => consoleLog.push(`[${tag}] pageerror: ${String(err).slice(0, 300)}`));
  }
  return { ctx, page, tag };
}

/** The hero as a visitor sees it once everything has settled: intro done and, with motion, the snap at rest on its last frame. */
async function settledHero(size, opts = {}) {
  const h = await filmPage(size, opts);
  await h.page.goto(BASE_URL, { waitUntil: 'networkidle' });
  if (!opts.noJs) await h.page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' }); // (addStyleTag runs script, which a page with JavaScript off will not let it)
  if (!opts.reduced && !opts.noJs) await h.page.waitForFunction(() => document.querySelector('.film-tile')?.dataset.snap === 'ended', null, { timeout: 20000 });
  await h.page.waitForTimeout(opts.noJs ? 400 : 3200); // the thread's arrival ends about 3.3s after the intro starts
  return h;
}

const heroFacts = (page) =>
  page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) }; };
    return { h1: r('.hero-h1'), tile: r('.film-tile'), box: r('.hero-film'), sub: r('.hero-sub'), who: r('.hero-who'), bar: r('.hero-bar'), fine: r('.hero-fine'), chips: r('.hero-chips'), sticky: document.querySelector('.sticky-reply')?.dataset.visible, stickyBox: r('.sticky-reply__link'), vw: innerWidth, vh: innerHeight, over: document.documentElement.scrollWidth - document.documentElement.clientWidth, picture: document.querySelector('.film-tile img')?.currentSrc.split('/').pop() };
  });

// Final first viewport at six sizes, with the facts that matter written into the index.
await step('film first viewports', async () => {
  for (const size of FIRST_VIEWPORTS) {
    const { ctx, page } = await settledHero(size);
    const f = await heroFacts(page);
    const file = `${size.name}-film-first-viewport.png`;
    await save(page, file, `${size.width}x${size.height}, final first screen (intro and snap finished, picture ${f.picture}). H1 ${f.h1.t}-${f.h1.b}px; film tile ${f.tile.w}x${f.tile.h} at x ${f.tile.l}-${f.tile.r}, y ${f.tile.t}-${f.tile.b}; film details end ${f.box.b}px; ` + (size.width >= 640 ? `fine print ends ${f.fine.b}px (viewport ${size.height}); ` : `sticky bar data-visible=${f.sticky}${f.stickyBox ? ` at ${f.stickyBox.t}-${f.stickyBox.b}px` : ''}; `) + `horizontal overflow ${f.over}px`);
    await overflowCheck(page, `${size.name} film first viewport`, size);
    if (size.name === 'desktop') check('Film: 1440x900 first screen still fits (fine print ends inside 900px)', f.fine.b <= 900, `fine print ends at ${f.fine.b}px; chips ${f.chips.t}-${f.chips.b}; reply bar ${f.bar.t}-${f.bar.b}`);
    if (size.name === 'mobile') {
      check('Film: 390x844 shows the H1 and the entire film tile, and the sticky bar shows a way to start', f.h1.t >= 0 && f.tile.b <= 844 && f.sticky === 'true' && f.stickyBox.b <= 844, `H1 ${f.h1.t}-${f.h1.b}, tile ${f.tile.t}-${f.tile.b} (${f.tile.w}px), sticky ${f.sticky} at ${f.stickyBox?.t}-${f.stickyBox?.b}`);
    }
    if (size.name === 'w320') check('Film: 320x568 shows the H1 and has no horizontal overflow', f.h1.b <= 568 && f.over <= 0, `H1 ${f.h1.t}-${f.h1.b}; tile ${f.tile.w}px; overflow ${f.over}px`);
    await ctx.close();
  }
});

// Hero intro frames at 390 and 1440. Frame 0 is the server page before any script has run; the others step a fake clock from
// the moment the intro starts, so each frame is exactly that many milliseconds in.
await step('film hero intro frames', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    // before hydration: every script chunk is blocked, so this is what the browser paints from the HTML alone
    const pre = await filmPage(size, { quiet: true });
    await pre.page.route('**/_next/static/**/*.js', (r) => r.abort());
    await pre.page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await pre.page.waitForTimeout(250);
    const gate = await pre.page.evaluate(() => ({ gate: document.documentElement.classList.contains('js-motion'), h1: getComputedStyle(document.querySelector('.hero-h1')).opacity, bar: getComputedStyle(document.querySelector('.hero-bar')).opacity, film: getComputedStyle(document.querySelector('.hero-film')).opacity, sub: getComputedStyle(document.querySelector('.hero-sub')).opacity }));
    await save(pre.page, `${size.name}-film-intro-0000ms-before-hydration.png`, `${size.name}: the intro at 0 ms, before hydration (script chunks blocked, so this is the HTML alone). html.js-motion ${gate.gate ? 'on' : 'off'}; opacities: headline ${gate.h1}, reply bar ${gate.bar}, film ${gate.film}, sub ${gate.sub}. The headline and reply bar are visible; the pin badge, "Pinned" label, ${size.width >= 640 ? 'film, ' : 'the film (held down 16px but painted), '}sub, "who checks" bubble and the thread's pieces wait.`);
    check(`Film: before hydration the headline and reply bar are visible and the intro pieces are held (${size.name})`, gate.gate && gate.h1 === '1' && gate.bar === '1' && gate.sub === '0', JSON.stringify(gate));
    await pre.ctx.close();

    const { ctx, page } = await filmPage(size);
    await page.clock.install();
    await page.goto(BASE_URL, { waitUntil: 'load' });
    // let the lazy GSAP chunk arrive (real time) with the page's own clock barely moving
    for (let i = 0; i < 160; i++) {
      if (!(await page.evaluate(() => document.documentElement.classList.contains('js-motion')))) break;
      await page.clock.runFor(10);
      await sleep(60);
    }
    let at = 0;
    for (const ms of [150, 300, 600, 1000, 1600]) {
      await page.clock.runFor(ms - at);
      at = ms;
      const o = await page.evaluate(() => Object.fromEntries(Object.entries({ pin: '.hero-h1 .pin', label: '.hero-pinned', film: '.hero-film', sub: '.hero-sub', who: '.hero-who', thread: '[data-at=send]' }).map(([k, s]) => [k, +(+getComputedStyle(document.querySelector(s)).opacity).toFixed(2)])));
      await save(page, `${size.name}-film-intro-${String(ms).padStart(4, '0')}ms.png`, `${size.name}: the intro ${ms} ms after it starts. Opacities: pin ${o.pin}, label ${o.label}, film ${o.film}, sub ${o.sub}, who ${o.who}, thread's first bubble ${o.thread}. (Targets: pin 120 ms, label 200, film 260, sub 380, who 500, thread 640; each rises 16 px over 280 ms.)`);
    }
    await ctx.close();
  }
});

// The film message during the snap (a real playback, frames seeked to exact times) and a close crop.
await step('film snap frames', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    const { ctx, page } = await settledHero(size, { scale: 1 });
    const length = await page.evaluate(() => document.querySelector('.film-tile__snap').duration);
    check(`Film: the hero clip is under 5 s and has played to its end (${size.name})`, length < 5, `${length.toFixed(3)} s; data-snap=${await page.evaluate(() => document.querySelector('.film-tile').dataset.snap)}`);
    for (const t of [0, 0.6, 1.2, 1.8, 2.4, 3.7]) {
      await page.evaluate((time) => new Promise((res) => { const v = document.querySelector('.film-tile__snap'); v.pause(); v.addEventListener('seeked', () => res(), { once: true }); v.currentTime = time; }), t);
      await page.waitForTimeout(120);
      await saveEl(page.locator('.hero-film'), `${size.name}-film-snap-${t.toFixed(1)}s.png`, `${size.name}: the film message ${t.toFixed(1)} s into the clip (the clip is ${length.toFixed(3)} s long, silent, once; this frame is a seek, so it is exact). Shown: tile, "Film · 0:30 · with sound", the AI note and "Read it instead".`);
    }
    await ctx.close();
  }
  // close crop of the tile at twice the pixels
  const { ctx, page } = await settledHero(DESKTOP, { scale: 2 });
  await page.evaluate(() => new Promise((res) => { const v = document.querySelector('.film-tile__snap'); v.pause(); v.addEventListener('seeked', () => res(), { once: true }); v.currentTime = 1.2; }));
  await page.waitForTimeout(150);
  const box = await page.locator('.film-tile').boundingBox();
  const file = 'desktop-film-tile-crop.png';
  await page.screenshot({ path: join(outDir, file), clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
  captured++;
  note(file, 'desktop: close crop of the film tile at 2x pixels, 1.2 s into the clip: 18px radius, the ink chips "With sound" and "Made with AI" at the top-left, 52px white play circle with indigo triangle, "0:30" badge bottom-left (JetBrains Mono 13px, white on solid ink).');
  await ctx.close();
});

// The tile's states.
await step('film tile states', async () => {
  const { ctx, page } = await settledHero(DESKTOP, { scale: 2 });
  await page.keyboard.press('Tab'); await page.focus('.film-tile'); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  const box = await page.locator('.hero-film').boundingBox();
  const clip = { x: box.x - 16, y: box.y - 16, width: box.width + 32, height: box.height + 32 };
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(outDir, 'desktop-film-tile-focus.png'), clip }); captured++;
  note('desktop-film-tile-focus.png', 'desktop, 2x: keyboard focus on the film tile: the 3px indigo ring with 3px offset, following the 18px radius.');
  await page.mouse.move(5, 5); await page.focus('body').catch(() => {});
  await page.hover('.film-tile'); await page.waitForTimeout(350);
  await page.screenshot({ path: join(outDir, 'desktop-film-tile-hover.png'), clip }); captured++;
  note('desktop-film-tile-hover.png', 'desktop, 2x: hover on the film tile: lifted 2px with a deeper card shadow, and the play circle\'s "go" shadow deepened.');
  await page.mouse.down(); await page.waitForTimeout(250);
  await page.screenshot({ path: join(outDir, 'desktop-film-tile-press.png'), clip }); captured++;
  note('desktop-film-tile-press.png', 'desktop, 2x: the film tile while pressed: scaled to 0.98.');
  await page.mouse.move(5, 5); await page.mouse.up();
  await ctx.close();
});

// Reduced motion and no JavaScript.
await step('film reduced motion and no javascript', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    const rm = await settledHero(size, { reduced: true });
    const f = await heroFacts(rm.page);
    const st = await rm.page.evaluate(() => ({ gate: document.documentElement.classList.contains('js-motion'), snapSrc: document.querySelector('.film-tile__snap').getAttribute('src'), ops: ['.hero-pinned', '.hero-film', '.hero-sub', '.hero-who', '.hero-h1 .pin', '[data-at=send]', '[data-at=gap]'].map((s) => getComputedStyle(document.querySelector(s)).opacity).join(',') }));
    await save(rm.page, `${size.name}-film-reduced-motion.png`, `${size.name}, reduced motion: the final state at once. The film picture is ${f.picture} (the column, not the pile); no js-motion class; no clip fetched (video src ${st.snapSrc}); opacities of pin, label, film, sub, who, thread, gap: ${st.ops}.`);
    check(`Film: reduced motion shows the column picture and every piece at once (${size.name})`, /hero-column/.test(f.picture) && !st.gate && st.snapSrc === null && st.ops.split(',').every((o) => o === '1'), `${f.picture}; ${st.ops}`);
    await rm.ctx.close();

    const nj = await settledHero(size, { noJs: true });
    const g = await nj.page.evaluate(() => ({ ops: ['.hero-pinned', '.hero-film', '.hero-sub', '.hero-who', '.hero-h1 .pin', '[data-at=send]', '[data-at=gap]', '[data-at=receipt]'].map((s) => getComputedStyle(document.querySelector(s)).opacity).join(','), href: document.querySelector('.film-tile').getAttribute('href'), role: document.querySelector('.film-tile').getAttribute('role'), pic: document.querySelector('.film-tile img').currentSrc.split('/').pop() }));
    await save(nj.page, `${size.name}-film-no-javascript.png`, `${size.name}, JavaScript off: nothing hidden (opacities ${g.ops}). The film tile is a plain link to the text page (${g.href}, role ${g.role}), so a tap before the page hydrates never opens the bare video file with the pile picture ${g.pic}; the play circle and "0:30" badge show.`);
    check(`Film: with no JavaScript nothing is hidden and the tile links to the text page (${size.name})`, g.ops.split(',').every((o) => o === '1') && /^\/film-text\/?$/.test(g.href) && g.role === null && /hero-pile/.test(g.pic), JSON.stringify(g));
    await nj.ctx.close();
  }
});

// The player at 390x844 and 1440x900.
await step('film player', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    const { ctx, page } = await settledHero(size);
    const len0 = await page.evaluate(() => history.length);
    await page.locator('.film-tile').click();
    await page.waitForSelector('dialog.film-player[open]');
    await page.waitForFunction(() => document.querySelector('.film-video').currentTime >= 2, null, { timeout: 15000 });
    const geom = await page.evaluate(() => { const d = document.querySelector('dialog.film-player').getBoundingClientRect(); const v = document.querySelector('.film-video').getBoundingClientRect(); return { d: [Math.round(d.left), Math.round(d.top), Math.round(d.width), Math.round(d.height)], v: [Math.round(v.width), Math.round(v.height)], t: document.querySelector('.film-video').currentTime.toFixed(2), len: history.length, active: document.activeElement.className, sbw: getComputedStyle(document.documentElement).getPropertyValue('--sbw') }; });
    await save(page, `${size.name}-film-player-playing.png`, `${size.name}: the player open and playing, ${geom.t} s in (sound on). Dialog ${geom.d.join('x').replace(/x/, ',')} ; video ${geom.v[0]}x${geom.v[1]}; history length ${len0} -> ${geom.len}; focus on "${geom.active || 'the video'}". ${size.width < 768 ? 'Full screen at 100dvh.' : 'The 460px panel, docked right, 12px inset, 22px radius.'}`);
    check(`Film: opening the player adds no history entry (${size.name})`, geom.len === len0, `${len0} -> ${geom.len}`);

    await page.evaluate(() => document.querySelector('.film-video').pause());
    await page.waitForTimeout(300);
    await save(page, `${size.name}-film-player-paused.png`, `${size.name}: the player paused, native controls showing, English captions track available (not on by default). Footer: the AI note, then on one row the "Audio description" switch (OFF, aria-pressed="false") and "Read the film as text".`);
    await page.locator('.film-switch').click();
    await page.waitForTimeout(900);
    const ad = await page.evaluate(() => ({ pressed: document.querySelector('.film-switch').getAttribute('aria-pressed'), src: document.querySelector('.film-video').getAttribute('src'), len: history.length, ct: document.querySelector('.film-video').currentTime.toFixed(2), paused: document.querySelector('.film-video').paused }));
    await save(page, `${size.name}-film-player-described-on.png`, `${size.name}: the "Audio description" switch ON in the footer (aria-pressed="${ad.pressed}", filled with the action colour): the player now holds ${ad.src.split('/').pop()}, paused at ${ad.ct} s (the film position mapped past the first hold). History length ${ad.len}.`);
    check(`Film: the audio description switch swaps the file, keeps the pause, adds no history entry (${size.name})`, ad.pressed === 'true' && /described\.mp4/.test(ad.src) && ad.paused && ad.len === len0, JSON.stringify(ad));
    await page.locator('.film-switch').click();
    // Back on the film file, which is not loaded yet (paused, preload none): load it, so the end of the film can be reached below.
    await page.evaluate(() => document.querySelector('.film-video').play().catch(() => {}));
    await page.waitForFunction(() => Number.isFinite(document.querySelector('.film-video').duration), null, { timeout: 15000 });
    await page.evaluate(() => document.querySelector('.film-video').pause());
    await page.waitForTimeout(300);

    await page.locator('.film-foot__toggle').click();
    await page.waitForTimeout(250);
    await save(page, `${size.name}-film-player-text-top.png`, `${size.name}: the text view at the top: heading "What the film says and shows" (focused), scene 0:00 with its On screen and Voice blocks. The video is paused behind it; the footer toggle now reads "Watch the film".`);
    await page.evaluate(() => { const t = document.querySelector('.film-text'); t.scrollTop = t.scrollHeight; });
    await page.waitForTimeout(200);
    await save(page, `${size.name}-film-player-text-bottom.png`, `${size.name}: the text view scrolled to the bottom: scene 0:24 (the timeline, the Case IQ name and the price line, with the not-a-law-firm and made-with-AI lines) and its two voice lines, then the send pill "Get my case in order" with "Free first conversation" under it.`);
    await page.evaluate(() => { const t = document.querySelector('.film-text'); const s = [...document.querySelectorAll('.film-scene')][2]; t.scrollTop = s.offsetTop - 24; });
    await page.waitForTimeout(200);
    await save(page, `${size.name}-film-player-text-timeline-scene.png`, `${size.name}: the text view at scene 0:10, which lists the three timeline rows (12 Jan, 28 Jan, 3 Feb 2025) rendered from the timeline examples: mono dates and page tags, the quoted words in the serif on slate.`);

    await page.locator('.film-foot__toggle').click();
    await page.keyboard.press('Shift'); // keyboard modality, so the focus ring on the send pill shows
    await page.evaluate(() => { const v = document.querySelector('.film-video'); v.currentTime = v.duration - 0.5; v.play(); });
    await page.waitForSelector('.film-end', { timeout: 20000 });
    await page.waitForTimeout(300);
    const end = await page.evaluate(() => ({ active: document.activeElement.textContent.trim(), bg: getComputedStyle(document.querySelector('.film-stage')).backgroundColor, video: getComputedStyle(document.querySelector('.film-video')).opacity }));
    await save(page, `${size.name}-film-player-ended.png`, `${size.name}: the end state, in the flow of the player step: the film's last frame stays up on ${end.bg} (video opacity ${end.video}); the send pill "${end.active}" is focused, with "Free first conversation" and "Watch again" under it. The six-size set with measured gaps is the end-*-film-player-ended.png images.`);
    check(`Film: at the end of the film focus is on the send pill (${size.name})`, /Get my case in order/.test(end.active), end.active);

    // Quick exit visible: the header, cropped
    const headBox = await page.locator('dialog.film-player .sheet-head').boundingBox();
    const qxFile = `${size.name}-film-player-quick-exit.png`;
    await page.screenshot({ path: join(outDir, qxFile), clip: { x: headBox.x, y: headBox.y, width: headBox.width, height: headBox.height } }); captured++;
    note(qxFile, `${size.name}: the player's header close up: Close (44px outline circle), the avatar, "Case IQ" with "Film · 0:30" under it, and the Quick exit pill. In the markup Quick exit comes first.`);

    await page.locator('.film-end .send').click();
    await page.waitForSelector('dialog.convo-sheet[open]');
    await page.waitForTimeout(700);
    const hand = await page.evaluate(() => ({ film: !!document.querySelector('dialog.film-player[open]'), len: history.length, hash: location.hash }));
    await save(page, `${size.name}-film-handoff-sheet.png`, `${size.name}: the conversation sheet opened from the player's send pill; the player has closed (open: ${hand.film}); history length ${hand.len} (was ${len0}); hash "${hand.hash}".`);
    check(`Film: the send pill hands off to the conversation sheet with no history entry (${size.name})`, !hand.film && hand.len === len0 && hand.hash === '', JSON.stringify(hand));
    await ctx.close();
  }
});


// What a visitor must know before the tap is on the tile, at nine sizes: whenever any part of the play control is above the sticky bar, both cues are too.
await step('film cues at nine sizes', async () => {
  for (const [w, h] of [[320, 568], [360, 640], [375, 548], [375, 667], [390, 664], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
    const { ctx, page } = await filmPage({ name: `c${w}x${h}`, width: w, height: h });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2800);
    const m = await page.evaluate(() => {
      const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
      const bar = document.querySelector('.sticky-reply');
      const on = bar && getComputedStyle(bar).display !== 'none' && bar.dataset.visible === 'true';
      return { bar: on ? Math.round(bar.getBoundingClientRect().top) : null, play: r(document.querySelector('.film-tile__play')), chips: [...document.querySelectorAll('.film-chip')].map(r), ex: document.querySelector('.film-example').getBoundingClientRect().height };
    });
    const above = m.bar === null || m.play[0] < m.bar;
    const ok = m.bar === null || !above || m.chips.every((c) => c[1] <= m.bar);
    await save(page, `film-cues-${w}x${h}.png`, `${w}x${h} at scroll 0: ${m.bar === null ? 'no sticky bar at this size' : `the sticky bar's top is at ${m.bar}px`}; the play circle spans ${m.play.join('-')}px (${above ? 'part of it is above the bar' : 'it is under the bar'}); the cues "With sound" and "Made with AI" span ${m.chips.map((c) => c.join('-')).join(' and ')}px, ${ok ? 'fully above the bar' : 'COVERED'}; "The case in it is an example." is ${m.ex < 20 ? 'one line' : 'more than one line'}.`);
    check(`Film: the cues travel with the play control at ${w}x${h}`, ok && m.ex < 20, JSON.stringify(m));
    await ctx.close();
  }
});

// The end of the film at six sizes: the last frame stays up (it is an end card already), and the stack sits in its empty slot. The gap
// between the stack and the frame's AI line is measured, and recorded below; it must be at least 8px.
await step('film end state at six sizes', async () => {
  for (const [w, h] of [[390, 844], [390, 664], [375, 548], [320, 568], [1440, 900], [320, 256]]) {
    const { ctx, page } = await filmPage({ name: `e${w}x${h}`, width: w, height: h });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    // No scrolling first: the tile is on the first screen at 1440 (an earlier version scrolled it into view, which is why the page showed
    // scrolled behind the player in upgrade-b3), and click() brings it into view by itself where it is not.
    await page.locator('.film-tile').click();
    await page.waitForSelector('dialog.film-player[open]');
    await page.waitForTimeout(1200);
    await page.keyboard.press('Shift'); // keyboard modality, so the focus ring on the send pill shows
    await page.evaluate(() => { const v = document.querySelector('.film-video'); v.currentTime = Math.max(0, v.duration - 0.4); v.play(); });
    await page.waitForSelector('.film-end__stack', { timeout: 20000 });
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => {
      const st = document.querySelector('.film-stage');
      const sc = getComputedStyle(st);
      const sh = st.clientHeight, sw = st.clientWidth;
      const fh = Math.min(sh, sw * 1280 / 720);
      const top = (sh - fh) / 2;
      const scale = parseFloat(sc.getPropertyValue('--frame-scale')) || 1;
      const lift = parseFloat(sc.getPropertyValue('--frame-lift')) || 0;
      const fine = st.getBoundingClientRect().top + top + fh * 0.729 * scale + lift;
      const stack = document.querySelector('.film-end__stack');
      const r = stack.getBoundingClientRect();
      return { gap: Math.round((r.top - fine) * 10) / 10, scale: Math.round(scale * 100) / 100, lift: Math.round(lift), helper: stack.dataset.helper, controls: document.querySelector('.film-video').controls, active: document.activeElement.textContent.trim(), headBottom: Math.round(document.querySelector('dialog.film-player .sheet-head').getBoundingClientRect().bottom), stackTop: Math.round(r.top), stageBottom: Math.round(st.getBoundingClientRect().bottom), stackBottom: Math.round(r.bottom),
        compact: st.dataset.compact === 'on',
        videoShown: getComputedStyle(document.querySelector('.film-video')).display !== 'none',
        stackTopInStage: Math.round(r.top - st.getBoundingClientRect().top),
        fine: (() => { const f = stack.querySelector('.film-end__fine'); const fr = f.getBoundingClientRect(); const cs = getComputedStyle(f); return { shown: cs.display !== 'none', text: f.textContent, size: cs.fontSize, whole: fr.left >= 0 && fr.right <= innerWidth, bottom: Math.round(fr.bottom) }; })(),
        pill: Math.round(stack.querySelector('.send').getBoundingClientRect().height),
        again: Math.round(stack.querySelector('.btn-outline').getBoundingClientRect().height),
        note: (() => { const n = document.querySelector('.film-foot__note'); const d = document.querySelector('dialog.film-player'); const nr = n.getBoundingClientRect(); return { onScreen: nr.top >= 0 && nr.bottom <= innerHeight, reachable: d.scrollHeight > d.clientHeight || (nr.top >= 0 && nr.bottom <= innerHeight) }; })(),
        vh: innerHeight,
      };
    });
    await save(
      page,
      `end-${w}x${h}-film-player-ended.png`,
      m.compact
        ? `${w}x${h}: a small screen, so the film's footage is left out at the end (it would have to shrink under 85% to leave room, and its own text could not be read) and the end is set at full size from the top of the player body: the send pill "${m.active}" (focused, ${m.pill}px high), "Free first conversation", the not-a-law-firm line whole at 13px (it ends ${m.fine.bottom}px down a ${m.vh}px screen), "Watch again" (${m.again}px high), no card, shadow or dim. The reply bar's helper line is dropped. The AI note and the "Audio description" and "Read the film as text" buttons are in the footer${m.note.onScreen ? ', on screen' : ', reached by scrolling the player'}. The stack starts ${m.stackTopInStage}px below the top of the body.`
        : `${w}x${h}: the film's last frame stays up (the example timeline, the name, the price line and the not-a-law-firm and made-with-AI lines) with the native controls off (controls=${m.controls}); the send pill "${m.active}" (focused), "Free first conversation" and "Watch again" sit in the empty slot at its foot, with no card, shadow or dim. ${m.scale < 1 ? `The frame gives way: scaled to ${m.scale} about its top${m.lift ? ` and lifted ${-m.lift}px` : ''}. ` : 'The frame is at full size. '}The reply bar's helper line is ${m.helper === 'on' ? 'shown' : 'dropped at this size (it does not fit)'}. Measured gap between the frame's AI line and the stack: ${m.gap}px.`,
    );
    // A small screen drops the footage (data-compact) and stands the stack alone at full size; a big one keeps the footage and clears its fine print.
    const small = w < 400 && h < 700;
    if (small) {
      check(
        `Film: at ${w}x${h} the footage is left out and the end is set at full size: the pill, "Free first conversation", the not-a-law-firm line whole at 13px, Watch again; 8px clear, 44px targets, the AI note reachable`,
        m.compact && !m.videoShown && m.helper === 'off' && m.fine.shown && m.fine.whole && m.fine.size === '13px' && /isn’t a law firm/.test(m.fine.text) && m.stackTopInStage >= 8 && m.stackTop >= m.headBottom && m.stackBottom <= m.stageBottom + 1 && m.pill >= 44 && m.again >= 44 && m.note.reachable && /Get my case in order/.test(m.active) && (h > 300 || m.fine.bottom <= m.vh),
        JSON.stringify(m),
      );
    } else {
      check(`Film: at ${w}x${h} the end stack clears the frame's fine print by at least 8px (${m.gap}px), sits inside the player body, focus on the pill; the frame is whole (not compact), no second fine print`, !m.compact && m.videoShown && !m.fine.shown && m.gap >= 8 && m.stackTop >= m.headBottom && m.stackBottom <= m.stageBottom + 1 && /Get my case in order/.test(m.active), JSON.stringify(m));
    }
    await ctx.close();
  }
});

// The film fails to load: the player says so and offers the text.
await step('film error', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    const { ctx, page } = await filmPage(size);
    await page.route('**/film/case-iq-film-30s*.mp4', (r) => r.abort());
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.locator('.film-tile').click();
    await page.waitForSelector('dialog.film-player[open]');
    await page.waitForSelector('.film-fail', { timeout: 10000 });
    await page.waitForTimeout(500);
    const f = await page.evaluate(() => ({ msg: document.querySelector('.film-fail__message').textContent, btn: document.querySelector('.film-fail button').textContent.trim(), active: document.activeElement.textContent.trim(), count: [...document.querySelectorAll('dialog.film-player button')].filter((b) => b.offsetParent !== null && /Read the film as text/.test(b.textContent)).length }));
    await save(page, `${size.name}-film-player-error.png`, `${size.name}: the film's file was blocked, so it cannot load. The player says "${f.msg}" as plain text on the ground (no card) with the one "${f.btn}" beside it (focused: "${f.active}"); the footer's copy of that button is hidden. The broken video is hidden; Close and Quick exit are still in the header.`);
    check(`Film: a film that will not load says so and offers the text (${size.name})`, f.msg === 'The film didn’t load. You can read it instead.' && f.active === f.btn && f.count === 1, JSON.stringify(f));
    await ctx.close();
  }
});

// The text version as a page of its own, with no JavaScript.
await step('film text page without javascript', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    const { ctx, page } = await filmPage(size, { noJs: true });
    await page.goto(`${BASE_URL}/film-text`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const t = await page.evaluate(() => ({ h1: document.querySelector('h1').textContent, scenes: document.querySelectorAll('.film-scene').length, start: document.querySelector('a.send').textContent.trim(), qx: !!document.querySelector('.qx') }));
    await save(page, `${size.name}-film-text-page-no-javascript.png`, `${size.name}, JavaScript off: /film-text, "${t.h1}" with the safety strip and Quick exit above it, the AI note, then the scenes.`);
    await page.locator('a.send').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await save(page, `${size.name}-film-text-page-no-javascript-end.png`, `${size.name}, JavaScript off: the end of /film-text: scene 0:24, then the real send pill "${t.start}" (a link to the start) with "Free first conversation", "Watch the film" and "Back to the home page".`);
    check(`Film: /film-text works with no JavaScript (${size.name})`, t.h1 === 'What the film says and shows' && t.scenes === 5 && t.start === 'Get my case in order' && t.qx, JSON.stringify(t));
    await ctx.close();
  }
});

// "Watch the film, with sound" on /film-text opens the same player in place; and the tile while it waits for the player's code.
await step('film text page with the player', async () => {
  for (const size of PHONE_AND_DESKTOP) {
    const { ctx, page } = await filmPage(size);
    await page.goto(`${BASE_URL}/film-text`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const len0 = await page.evaluate(() => history.length);
    await page.locator('.film-page__links a', { hasText: 'Watch the film' }).click();
    await page.waitForSelector('dialog.film-player[open]');
    await page.waitForFunction(() => document.querySelector('.film-video').currentTime >= 1.5, null, { timeout: 15000 });
    const o = await page.evaluate(() => ({ len: history.length, path: location.pathname, first: [...document.querySelectorAll('dialog.film-player a, dialog.film-player button')].find((e) => e.offsetParent !== null).textContent.trim() }));
    await save(page, `${size.name}-film-text-page-player-open.png`, `${size.name}: /film-text with "Watch the film, with sound" tapped: the same player opens in place over the text page, playing; Quick exit is first in its header ("${o.first}"); history length ${len0} -> ${o.len}; still on ${o.path}.`);
    check(`Film: "Watch the film, with sound" opens the player in place on /film-text (${size.name})`, o.len === len0 && /film-text/.test(o.path) && o.first === 'Quick exit', JSON.stringify(o));
    await ctx.close();
  }
});

await step('film loading tile', async () => {
  const probe = await filmPage(DESKTOP);
  let chunk = null;
  probe.page.on('response', async (r) => { if (/\/_next\/static\/chunks\/.*\.js/.test(r.url())) { try { if (/film_described/.test(await r.text())) chunk = r.url().split('/').pop(); } catch { /* not text */ } } });
  await probe.page.goto(BASE_URL, { waitUntil: 'load' });
  await probe.page.waitForTimeout(4000);
  await probe.ctx.close();
  for (const size of PHONE_AND_DESKTOP) {
    const { ctx, page } = await filmPage(size);
    await page.route((u) => u.pathname.endsWith('/' + chunk), async (r) => { await new Promise((res) => setTimeout(res, 3000)); r.continue().catch(() => {}); });
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.locator('.film-tile').click();
    await page.waitForTimeout(250);
    const b = await page.evaluate(() => ({ aria: document.querySelector('.film-tile').getAttribute('aria-busy'), name: document.querySelector('.film-tile').getAttribute('aria-label').slice(0, 40) }));
    await saveEl(page.locator('.hero-film'), `${size.name}-film-tile-loading.png`, `${size.name}: the tile 250 ms after a tap, with the player's code held back 3 s: aria-busy="${b.aria}", a ring turning around the play circle; the tile's name is unchanged ("${b.name}..."). When the code arrives after more than 1 s the player opens paused on its poster, with no sound.`);
    check(`Film: a tap that waits for the player's code is shown at once (${size.name})`, b.aria === 'true', JSON.stringify(b));
    await ctx.close();
  }
});

// ───────── Pass 2: section reveals, the camera-roll photos and the Solar icons ─────────
const REVEAL_SIZES = [MOBILE, DESKTOP];
const REVEALS = [
  ['problem-h', 'S3, "Your story is in there somewhere" (a date separator: a bare span inside the heading, so it splits)'],
  ['pile-h', 'S4, the filing scene\'s heading (only the heading reveals, well before the pin starts)'],
  ['how-h', 'S5, "How it works"'],
  ['founding-h', 'S6, the founding card\'s heading'],
  ['get-h', 'S7, "What you walk away with"'],
  ['ask-h', 'S8, the Ask section\'s heading'],
  ['limits-h', 'S9, the limits heading'],
  ['privacy-h', 'S10, the privacy question: a sent bubble inside the heading, so it is not split and fades and rises whole'],
  ['faq-h', 'S11, "Questions"'],
  ['start-h', 'S12, the closing heading'],
];

// Each section's heading about 150 ms into its reveal and settled (900 ms), scrolled into view the way a visitor gets there.
await step('p2 section reveals', async () => {
  for (const size of REVEAL_SIZES) {
    const { ctx, page } = await openPage(browser, size);
    for (const [id, what] of REVEALS) {
      // Scrolled to it as a visitor does (a jump past the reveal line would show it at once): from just under the line, in small steps, up to
      // 40% of the way down, which takes about 150 ms from the moment it crosses.
      await page.evaluate(async (id) => {
        const h = document.getElementById(id);
        window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.97, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 250));
        while (h.getBoundingClientRect().top > window.innerHeight * 0.4) {
          window.scrollBy({ top: 40, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 16));
        }
      }, id);
      const mid = await page.evaluate((id) => { const h = document.getElementById(id); return { words: h.querySelectorAll('.rv-word').length, label: h.getAttribute('aria-label') }; }, id);
      await save(page, `p2-reveal-${size.name}-${id}-150ms.png`, `${size.name}: ${what}, about 150 ms into its reveal (${mid.words ? `${mid.words} words rising, accessible name "${mid.label}" on the heading` : 'the whole heading rising and fading in'}); the section's messages arrive after it.`);
      await page.waitForTimeout(750);
      const end = await page.evaluate((id) => ({ words: document.getElementById(id).querySelectorAll('.rv-word').length, hidden: document.querySelectorAll('[data-rv]').length }), id);
      await save(page, `p2-reveal-${size.name}-${id}-900ms.png`, `${size.name}: the same, settled at about 900 ms. The split is reverted (${end.words} split words left).`);
      check(`Reveal: the heading #${id} is plain text again once it has arrived (${size.name})`, end.words === 0);
    }
    await ctx.close();
  }
});

// The whole page in slices, once everything has been scrolled through (so every reveal has played).
await step('p2 full page slices', async () => {
  for (const size of REVEAL_SIZES) {
    const { ctx, page } = await openPage(browser, size);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(size.height * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
    await page.waitForTimeout(1200);
    const hidden = await page.evaluate(() => document.querySelectorAll('[data-rv], .rv-word').length);
    check(`Reveal: after scrolling through the whole page nothing is left hidden (${size.name})`, hidden === 0, `${hidden} left`);
    let n = 0;
    for (let y = 0; y < total; y += size.height) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(350);
      await save(page, `p2-slice-${size.name}-${String(n).padStart(2, '0')}.png`, `${size.name}: the page from y ${y}px (slice ${n}), every reveal settled.`);
      n++;
    }
    await ctx.close();
  }
});

// The camera roll in S4: the pinned scene, the phone's strip and rows, and a close crop of the tiles at 3x.
await step('p2 camera roll', async () => {
  {
    const { ctx, page } = await openPage(browser, DESKTOP);
    await page.evaluate(() => document.getElementById('pile').scrollIntoView());
    await page.waitForTimeout(900);
    await save(page, 'p2-roll-desktop-pinned-start.png', 'desktop 1440x900: S4 just pinned, the eight roll tiles are photos of example documents (the chat, notes, letter, email, letter page 2, the job posting, and the two duplicates).');
    for (const [f, label] of [[0.35, 'three tiles flying to their rail nodes'], [0.8, 'the duplicates set aside']]) {
      await page.evaluate((f) => { const el = document.getElementById('pile'); const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top - 44 + f * window.innerHeight * 1.1); }, f);
      await page.waitForTimeout(500);
      await save(page, `p2-roll-desktop-pinned-${Math.round(f * 100)}.png`, `desktop 1440x900: S4 ${Math.round(f * 100)}% through its pin: ${label}.`);
    }
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage(browser, { name: 'desktop800', width: 1440, height: 800 });
    await page.evaluate(() => document.getElementById('pile').scrollIntoView());
    await page.waitForTimeout(900);
    await page.evaluate(() => { const el = document.getElementById('pile'); const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top - 44 + 0.4 * window.innerHeight * 1.1); });
    await page.waitForTimeout(500);
    await save(page, 'p2-roll-desktop800-pinned.png', 'desktop 1440x800: S4 pinned and 40% through, the tiles in flight.');
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage(browser, MOBILE);
    await page.evaluate(() => document.querySelector('.pile-strip').scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(700);
    await save(page, 'p2-roll-mobile-strip.png', 'mobile 390x844: the compact roll strip above the first row, eight small photo tiles; each row\'s tile lifts onto its node as the row scrolls in.');
    await page.evaluate(() => document.querySelectorAll('.pile-row')[1].scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(700);
    await save(page, 'p2-roll-mobile-rows.png', 'mobile 390x844: two rows in, the strip emptying to dashed slots as the rows land.');
    await ctx.close();
  }
  {
    // Close crop of the roll at 3x device scale. The tiles are only drawn while the scene runs, so the crop is taken mid-scene.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await page.evaluate(() => document.getElementById('pile').scrollIntoView());
    await page.waitForTimeout(1200);
    const box = await page.locator('.pile__roll').boundingBox();
    const file = 'p2-roll-tiles-3x.png';
    await page.screenshot({ path: join(outDir, file), clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
    captured++;
    note(file, 'desktop, 3x device pixels: close crop of the eight roll tiles at the start of the pinned scene: photos of an example chat, notes, letter, email, letter page 2 and job posting, with the duplicates (a crooked second photo of the letter and the lower part of the chat). 8px corners and hairline borders kept.');
    await ctx.close();
  }
});

// The words in the roll, at the pixel densities a visitor has: tiles 1, 6 and 8 as drawn on the desktop roll (1440, device scale 2), the roll
// on a phone (390, device scale 3), and a tile lifted onto its rail node mid-scene at each. No garbled word should be readable in any of them.
// (TARGETED=roll runs only this step.)
await step('p2 roll words', async () => {
  // Each tile as built, at its own size and at 3x (a lanczos upscale, which adds nothing): what a phone at device scale 3 can show of it.
  const { createRequire } = await import('node:module');
  const sharp = createRequire(import.meta.url)('sharp');
  for (let n = 1; n <= 8; n++) {
    const file = join(here, '..', 'public', 'roll', `tile-${n}.webp`);
    const meta = await sharp(file).metadata();
    await sharp(file).png().toFile(join(outDir, `p2-roll-words-tile${n}-native.png`));
    await sharp(file).resize(meta.width * 3, meta.height * 3, { kernel: 'lanczos3' }).png().toFile(join(outDir, `p2-roll-words-tile${n}-x3.png`));
    captured += 2;
    note(`p2-roll-words-tile${n}-native.png`, `tile ${n} as built, ${meta.width}x${meta.height}.`);
    note(`p2-roll-words-tile${n}-x3.png`, `tile ${n} at 3x (lanczos upscale of the built tile).`);
  }
  for (const [name, size, dpr] of [['desktop-dpr2', { width: 1440, height: 900 }, 2], ['desktop-dpr3', { width: 1440, height: 900 }, 3], ['mobile-dpr3', { width: 390, height: 844 }, 3]]) {
    const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: dpr, hasTouch: size.width < 600, isMobile: size.width < 600 });
    const page = await ctx.newPage();
    await ctx.addInitScript(() => { window.__qa = true; });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await page.waitForTimeout(3200);
    if (size.width >= 768) {
      await page.evaluate(() => document.getElementById('pile').scrollIntoView());
      await page.waitForTimeout(1000);
      for (const n of [1, 6, 8]) {
        await page.locator(`.pile-slot .pile-tile[data-tile="${n}"]`).first().screenshot({ path: join(outDir, `p2-roll-words-${name}-tile${n}.png`) });
        captured++;
        note(`p2-roll-words-${name}-tile${n}.png`, `${name}: tile ${n} as drawn in the roll at device scale ${dpr}.`);
      }
      const box = await page.locator('.pile__roll').boundingBox();
      await page.screenshot({ path: join(outDir, `p2-roll-words-${name}-roll.png`), clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
      captured++;
      note(`p2-roll-words-${name}-roll.png`, `${name}: the whole roll at device scale ${dpr}.`);
      await page.evaluate(() => { const el = document.getElementById('pile'); const top = el.getBoundingClientRect().top + window.scrollY; window.scrollTo(0, top - 44 + 0.18 * window.innerHeight * 1.1); });
      await page.waitForTimeout(600);
      await page.screenshot({ path: join(outDir, `p2-roll-words-${name}-lifted.png`), clip: { x: 150, y: 40, width: 1140, height: 800 } });
      captured++;
      note(`p2-roll-words-${name}-lifted.png`, `${name}: tiles lifted off the roll and flying to their rail nodes (18% through the pinned scene), device scale ${dpr}.`);
    } else {
      await page.evaluate(() => document.querySelector('.pile-strip').scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(700);
      const strip = await page.locator('.pile-strip').boundingBox();
      await page.screenshot({ path: join(outDir, `p2-roll-words-${name}-strip.png`), clip: { x: Math.max(0, strip.x - 4), y: strip.y - 4, width: Math.min(390, strip.width + 8), height: strip.height + 8 } });
      captured++;
      note(`p2-roll-words-${name}-strip.png`, `${name}: the compact roll strip at device scale ${dpr}.`);
      await page.evaluate(() => document.querySelectorAll('.pile-row')[1].scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(700);
      await page.screenshot({ path: join(outDir, `p2-roll-words-${name}-lifted.png`) });
      captured++;
      note(`p2-roll-words-${name}-lifted.png`, `${name}: a tile lifted onto its node as its row scrolls in, device scale ${dpr}.`);
    }
    await ctx.close();
  }
});

// S7's attachments at device scale 2: the file glyph is ink on the static ones and indigo only on the one that opens the summary.
// (Runs with TARGETED=roll.)
await step('p2 roll words: attachments', async () => {
  for (const size of [MOBILE, DESKTOP]) {
    const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, hasTouch: size.width < 600, isMobile: size.width < 600 });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await page.evaluate(() => document.getElementById('get').scrollIntoView());
    await page.waitForTimeout(1500);
    const glyphs = await page.evaluate(() => [...document.querySelectorAll('#get .attach')].map((a) => ({ pressable: a.matches('button.attach, a.attach'), name: a.querySelector('.attach__name')?.textContent, colour: getComputedStyle(a.querySelector('.attach__icon svg')).color })));
    await page.locator('#get').screenshot({ path: join(outDir, `p2-attachments-${size.name}.png` ) });
    captured++;
    note(`p2-attachments-${size.name}.png`, `${size.name} at device scale 2: S7's attachments. File glyph colours: ${glyphs.map((g) => `"${g.name}" ${g.pressable ? 'pressable' : 'static'} ${g.colour}`).join('; ')}.`);
    check(`S7 attachments (${size.name}): the file glyph is ink on the static ones and indigo on the pressable one`, glyphs.length > 0 && glyphs.every((g) => g.colour === (g.pressable ? 'rgb(36, 56, 168)' : 'rgb(17, 17, 17)')), JSON.stringify(glyphs));
    await ctx.close();
  }
});

// Icon close-ups at 3x device scale: every place the Solar glyphs are drawn.
await step('p2 icon close-ups', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await ctx.addInitScript(() => { window.__qa = true; });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await page.waitForTimeout(3500);
  const shot = async (locator, file, what) => {
    const path = join(outDir, file);
    await locator.first().screenshot({ path });
    captured++;
    note(file, what);
  };
  await shot(page.locator('.nav'), 'p2-icons-nav.png', 'desktop 3x: the nav bar (the chat mark is authored; nothing else here is an icon).');
  await shot(page.locator('.hero-h1 .pin'), 'p2-icons-pin.png', 'desktop 3x: the pin badge on the headline, Solar Pin (Bold), white on ink.');
  await shot(page.locator('.reply-bar'), 'p2-icons-send-pill.png', 'desktop 3x: the hero reply bar\'s send pill, with the Solar Arrow Right (Bold) in its white circle.');
  await shot(page.locator('.hero-film'), 'p2-icons-film-message.png', 'desktop 3x: the film message, Solar Play (Bold) in the white circle, indigo.');
  await shot(page.locator('.see-page'), 'p2-icons-see-page.png', 'desktop 3x: "See the page", Solar Document Text (Linear), 1.5 stroke.');
  await page.evaluate(() => document.querySelector('#ask .cite__btn').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(800);
  await shot(page.locator('#ask .cite__btn'), 'p2-icons-cite-chip.png', 'desktop 3x: the "Source" cite chip, Solar Notes (Linear).');
  await page.evaluate(() => document.getElementById('faq-h').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(1500);
  await shot(page.locator('.faq__btn'), 'p2-icons-faq.png', 'desktop 3x: a FAQ question, Solar Alt Arrow Down (Linear) in its chevron.');
  await page.evaluate(() => document.querySelector('.limits__cards').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(900);
  await shot(page.locator('.limits__cards li').first(), 'p2-icons-external.png', 'desktop 3x: a link preview card, Solar Arrow Right Up (Linear) beside the domain.');
  await page.evaluate(() => document.querySelector('.get-attach').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(900);
  await shot(page.locator('.get-attach'), 'p2-icons-attachment.png', 'desktop 3x: an attachment bubble, Solar File Text (Linear) in the action colour.');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.locator('header a.nav__cta').click();
  await page.waitForSelector('dialog.convo-sheet[open]');
  await page.waitForTimeout(700);
  await shot(page.locator('dialog.convo-sheet .sheet-head'), 'p2-icons-sheet-header.png', 'desktop 3x: the conversation sheet\'s header: Close is the Solar plus turned 45 degrees (a bare X), nothing doubled inside its circle.');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.locator('.film-tile').click();
  await page.waitForSelector('dialog.film-player[open]');
  await page.waitForTimeout(900);
  await shot(page.locator('dialog.film-player .sheet-head'), 'p2-icons-player-header.png', 'desktop 3x: the film player\'s header, the same Close X.');
  await page.keyboard.press('Escape');
  await ctx.close();
  const m = await openPage(browser, MOBILE);
  await m.page.locator('.nav__menu-btn').click();
  await m.page.waitForTimeout(500);
  const mp = join(outDir, 'p2-icons-menu-panel.png');
  await m.page.screenshot({ path: mp, clip: { x: 0, y: 0, width: 390, height: 420 } });
  captured++;
  note('p2-icons-menu-panel.png', 'mobile 390: the open phone menu: Solar Hamburger Menu (Linear) turned to the Close X on the button, and the panel.');
  await m.page.keyboard.press('Escape');
  await m.page.evaluate(() => document.querySelector('.see-page').scrollIntoView({ block: 'center' }));
  await m.page.locator('.see-page').click();
  await m.page.waitForSelector('dialog.viewer[open], .viewer[open]').catch(() => {});
  await m.page.waitForTimeout(700);
  await save(m.page, 'p2-icons-source-viewer.png', 'mobile 390: the source viewer with its Close X.');
  await m.ctx.close();
});

// Reduced motion and no JavaScript: the whole page, at 390 and 1440.
await step('p2 reduced motion and no javascript full page', async () => {
  for (const size of REVEAL_SIZES) {
    for (const [label, opts] of [['reduced-motion', { reduced: true }], ['no-javascript', { noJs: true }]]) {
      const { ctx, page } = await filmPage(size, opts);
      await page.goto(BASE_URL, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      const r = await page.evaluate(() => ({ hidden: document.querySelectorAll('[data-rv], .rv-word').length, lowOpacity: [...document.querySelectorAll('main *')].filter((e) => e.style && e.style.opacity === '0').length, height: document.documentElement.scrollHeight }));
      await save(page, `p2-${label}-${size.name}-fullpage.png`, `${size.name}, ${label === 'reduced-motion' ? 'reduced motion' : 'JavaScript off'}: the whole page (${r.height}px tall). Nothing is hidden or split (${r.hidden} elements marked, ${r.lowOpacity} at opacity 0); every section is in its final state.`, { fullPage: true });
      check(`Pass 2: ${label} shows the whole page with nothing hidden or split (${size.name})`, r.hidden === 0 && r.lowOpacity === 0, JSON.stringify(r));
      await ctx.close();
    }
  }
});

// Leaving the page leaves no scroll trigger behind (the count exists only for pages a check opened).
await step('film scroll triggers', async () => {
  const { ctx, page } = await settledHero(DESKTOP);
  const first = await page.evaluate(() => window.__scrollTriggers());
  // Clicked in the page: a scroll to the footer link first would show the page's messages, and they are not hidden again on return.
  await page.locator('a[href^="/privacy"]').first().evaluate((el) => el.click());
  await page.waitForURL(/privacy/);
  await page.waitForTimeout(700);
  const away = await page.evaluate(() => window.__scrollTriggers());
  // A link back, not the Back button: the browser restores its old scroll position under the page on Back, and the messages scrolled past by then have already arrived.
  await page.locator('a[href="/"]').first().click();
  await page.waitForURL((u) => u.pathname === '/');
  await page.waitForTimeout(1800);
  const back = await page.evaluate(() => window.__scrollTriggers());
  check('Film: no ScrollTrigger is left after a client navigation to /privacy, and the same set returns', away === 0 && back === first && first > 0, `on /: ${first}; on /privacy: ${away}; back on /: ${back}`);
  await ctx.close();
});

await browser.close();

const hydration = consoleLog.filter((l) => /hydrat|did not match|#418|#423|#425|Minified React/i.test(l));
writeFileSync(
  join(outDir, 'index.md'),
  [
    `# Shots ${runId}`,
    '',
    `Base URL: ${BASE_URL}. Images captured: ${captured}.`,
    '',
    '## Behaviour checks',
    ...checks,
    '',
    '## Horizontal overflow',
    ...overflowLog,
    '',
    `## Console (errors and warnings): ${consoleLog.length} line(s); hydration-related: ${hydration.length}`,
    ...(consoleLog.length ? consoleLog.map((l) => `- ${l}`) : ['- none']),
    '',
    '## Script failures',
    ...(failures.length ? failures.map((f) => `- ${f}`) : ['- none']),
    '',
    '## Files',
    ...index,
    '',
  ].join('\n'),
);
console.log(`shots: ${captured} images, ${checks.filter((c) => c.includes('FAIL')).length} failed checks, ${consoleLog.length} console lines, ${failures.length} script failures -> ${outDir}`);
