// Captures the overlay layer as a 1080x1920 PNG sequence (transparent where footage shows through).
// Usage: node build/capture.mjs            -> build/frames/f_0000..f_0299.png
//        node build/capture.mjs --frames 12,45,300   -> build/tmp/prev_<idx>.png (quick previews)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BUILD, FRAMES, TMP, QA, FPS, NFRAMES, loadConfig, normaliseFramesToRgba } from "./lib.mjs";

const { chromium } = await import(
  "file:///C:/Users/matri/Documents/myprojects/caseiq-1/apps/site/node_modules/playwright/index.mjs"
);

const cfg = loadConfig();
const argv = process.argv.slice(2);
const fi = argv.indexOf("--frames");
const only = fi >= 0 ? argv[fi + 1].split(",").map(Number) : null;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript((c) => { window.__CFG = c; }, { t: cfg.t, payoff: cfg.payoff });
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
    jetbrainsLoaded: document.fonts.check("600 34px 'JetBrains Mono'"),
  };
});
fontCheck.wdthApplies = fontCheck.ratio < 0.92;
fs.writeFileSync(path.join(BUILD, "font-check.json"), JSON.stringify(fontCheck, null, 2));
console.log("font check:", fontCheck);
if (!fontCheck.wdthApplies || !fontCheck.bricolageLoaded) throw new Error("wdth axis not applied / fonts missing");

const info = await page.evaluate(() => window.layoutInfo());
fs.writeFileSync(path.join(BUILD, "layout-info.json"), JSON.stringify(info, null, 2));

// --- text-size audit: every visible text node's computed font size (floor: 36 px at 1080 width) ---
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
  "Every visible text element (computed font size at 1080 px width). Floor: 36 px.\n" +
  sizes.map((s) => `${String(s.px).padStart(5)} px  ${s.family} ${s.weight}  [${s.block}]  ${s.text}`).join("\n") +
  `\n\nminimum: ${minPx} px  -> ${minPx >= 36 ? "PASS" : "FAIL"}\n`);
console.log("min text size:", minPx);
if (minPx < 36) throw new Error("text below the 36 px floor");

const stage = page.locator("#stage");
if (!only) for (const f of fs.readdirSync(FRAMES)) fs.unlinkSync(path.join(FRAMES, f));
const idxs = only ?? Array.from({ length: NFRAMES }, (_, i) => i);
const t0 = Date.now();
for (const i of idxs) {
  const t = i / FPS;
  await page.evaluate((tt) => window.renderAt(tt), t);
  const file = only
    ? path.join(TMP, `prev_${String(i).padStart(4, "0")}.png`)
    : path.join(FRAMES, `f_${String(i).padStart(4, "0")}.png`);
  await page.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  if (!only && i % 50 === 0) console.log(`frame ${i}/${NFRAMES}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
if (!only) console.log(`normalised ${normaliseFramesToRgba(FRAMES)} opaque frames to RGBA (avoids ffmpeg graph reinit)`);
console.log(`captured ${idxs.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
