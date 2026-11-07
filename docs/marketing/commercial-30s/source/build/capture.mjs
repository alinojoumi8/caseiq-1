// Captures the overlay layer as a 720x1280 RGBA PNG sequence (design space 1080x1920 rendered at deviceScaleFactor 2/3,
// so there is no resampling step), plus per-frame geometry for the layout guards.
// Usage: node build/capture.mjs                   -> build/frames/f_0000..f_0719.png
//        node build/capture.mjs --frames 12,45,300 -> build/tmp/prev_<idx>.png (quick previews)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BUILD, REPO, FRAMES, TMP, QA, FPS, NFRAMES, SIZE, SCALE, loadConfig, normaliseFramesToRgba, pngSize, pngColorType } from "./lib.mjs";

const { chromium } = await import(pathToFileURL(path.join(REPO, "apps", "site", "node_modules", "playwright", "index.mjs")).href);

const cfg = loadConfig();
const argv = process.argv.slice(2);
const fi = argv.indexOf("--frames");
const only = fi >= 0 ? argv[fi + 1].split(",").map(Number) : null;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: SCALE });
const page = await ctx.newPage();
await page.addInitScript((c) => { window.__CFG = c; }, cfg.overlayCfg);
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(pathToFileURL(path.join(BUILD, "overlay.html")).href);
await page.evaluate(() => window.ready);

// --- verify the wdth axis really applies (condensed letters) ---
const fontCheck = await page.evaluate(() => {
  const mk = (wdth) => {
    const s = document.createElement("span");
    s.textContent = "You know what happened.";
    s.style.cssText = `position:absolute;left:0;top:0;white-space:nowrap;font:800 72px 'Bricolage Grotesque';letter-spacing:-0.02em;font-variation-settings:'wdth' ${wdth}`;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return w;
  };
  const w78 = mk(78), w100 = mk(100);
  return {
    w78, w100, ratio: w78 / w100,
    bricolageLoaded: document.fonts.check("800 72px 'Bricolage Grotesque'"),
    jetbrainsLoaded: document.fonts.check("600 36px 'JetBrains Mono'"),
    serifLoaded: document.fonts.check("400 44px 'Source Serif 4'"),
  };
});
fontCheck.wdthApplies = fontCheck.ratio < 0.92;
fs.writeFileSync(path.join(TMP, "font-check.json"), JSON.stringify(fontCheck, null, 2));
console.log("font check:", fontCheck);
if (!fontCheck.wdthApplies || !fontCheck.bricolageLoaded || !fontCheck.jetbrainsLoaded || !fontCheck.serifLoaded) throw new Error("wdth axis not applied / fonts missing");

const info = await page.evaluate(() => window.layoutInfo());
fs.writeFileSync(path.join(TMP, "layout-info.json"), JSON.stringify(info, null, 2));
console.log("layout:", JSON.stringify(info.stack));

// --- text-size audit: every visible text node's computed font size, in design px and in final 720-space px (floor: 36 / 24) ---
const sizes = await page.evaluate(() => {
  const out = [], w = document.createTreeWalker(document.getElementById("stage"), NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement, cs = getComputedStyle(el);
    out.push({ block: el.closest("[id]")?.id || "", text: t, px: parseFloat(cs.fontSize), family: cs.fontFamily.split(",")[0].replace(/"/g, ""), weight: cs.fontWeight });
  }
  return out;
});
const minPx = Math.min(...sizes.map((s) => s.px));
fs.mkdirSync(QA, { recursive: true });
fs.writeFileSync(path.join(QA, "text_sizes.txt"),
  `Every visible text element: computed font size in the 1080 design space and as rendered in the final ${SIZE.w}x${SIZE.h} file (x ${SCALE.toFixed(4)}).\nFloor: 36 px design = 24 px final.\n\n` +
  sizes.map((s) => `${(s.px * SCALE).toFixed(1).padStart(5)} px final  (${String(s.px).padStart(4)} px design)  ${s.family} ${s.weight}  [${s.block}]  ${s.text}`).join("\n") +
  `\n\nminimum: ${(minPx * SCALE).toFixed(1)} px final (${minPx} px design)  -> ${minPx * SCALE >= 24 - 1e-6 ? "PASS" : "FAIL"}\n`);
console.log("min text size (final px):", (minPx * SCALE).toFixed(1));
if (minPx * SCALE < 24 - 1e-6) throw new Error("text below the 24 px (final) floor");

const stage = page.locator("#stage");
if (!only) for (const f of fs.readdirSync(FRAMES)) fs.unlinkSync(path.join(FRAMES, f));
const idxs = only ?? Array.from({ length: NFRAMES }, (_, i) => i);
const geom = [];
const t0 = Date.now();
for (const i of idxs) {
  const t = i / FPS;
  const fr = await page.evaluate((tt) => { window.renderAt(tt); return window.frameInfo(); }, t);
  geom.push({ i, t: +t.toFixed(4), ...fr });
  const file = only
    ? path.join(TMP, `prev_${String(i).padStart(4, "0")}.png`)
    : path.join(FRAMES, `f_${String(i).padStart(4, "0")}.png`);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  if (!only && i % 100 === 0) console.log(`frame ${i}/${NFRAMES}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
if (!only) {
  console.log(`normalised ${normaliseFramesToRgba(FRAMES)} opaque frames to RGBA (avoids ffmpeg graph reinit)`);
  fs.writeFileSync(path.join(TMP, "frame-geometry.json"), JSON.stringify(geom));
  const s = pngSize(path.join(FRAMES, "f_0000.png"));
  console.log(`overlay PNG size ${s.w}x${s.h}`);
  if (s.w !== SIZE.w || s.h !== SIZE.h) throw new Error(`overlay PNG is ${s.w}x${s.h}, expected ${SIZE.w}x${SIZE.h}`);
}
console.log(`captured ${idxs.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
