// Camera-roll tiles: derives the eight WebP tiles the hero's old roll and the S4 filing scene draw, from the six source images in
// docs/marketing/site-media/roll/ (generated once with Krea, see PROVENANCE.md there). Run from apps/site: node scripts/roll-assets.mjs
// (npm script: "roll:assets"). Uses sharp, which Next installs; needs no network and calls no service. Writes public/roll/ and
// src/content/roll.ts (the provenance manifest). Re-runs overwrite the outputs, so it is safe to run again. It fails loudly (exit 1) if a
// guard fails, and writes the manifest only after every guard has passed.
//
// What it makes (sizes are 3x the largest size each tile is drawn at, so they stay sharp on a phone):
//   tile-1.webp   the chat screenshot, 2x2 cells in the roll: 324x324
//   tile-2..5     notes, letter, email, letter page 2: 216x216 (a phone row's tile starts at 72px)
//   tile-6.webp   the job-posting screenshot, 2x1 cells: cropped to 2:1, keeping the title and the button: 324x162
//   tile-7.webp   a second, slightly crooked phone photo of the letter (tile 3): turned about 4 degrees, warmer, with a soft shadow and a
//                 vignette, cropped square: 216x216. It is the duplicate the S4 scene sets aside.
//   tile-8.webp   a second, slightly crooked phone photo of the email (tile 4), turned the other way to tile 7, a little cooler and brighter, with
//                 its shadow on the other side, cropped square: 216x216. The other duplicate.
// The photographs (notes, letter, email, letter page 2 and the crooked copy) are graded a little toward the film's warm, low-light look, so
// the roll reads as photos from the same desk: a touch warmer, a touch darker, a touch less saturated. The two screenshots are not graded.
// Each tile is at most 25 KB.
//
// The words. The generator draws text that is not words ("Bed eot"), which can be read at the sizes the tiles are shown at, so the sources
// are worked on here, before any tile is cut from them (tile 7 inherits from tile 3, tile 8 from tile 4); the files in docs/ are never changed:
//   t1-chat     every bubble is painted out but one, and that one is given the example case's own line, "They posted your old job online today",
//               with a small date header, "3 Feb 2025" (both from src/content/examples.ts).
//   t6-posting  the title reads "Operations Coordinator" and its one tag "Full-time" (examples.ts); the other tags and the button carry no
//               text, and the body lines are blurred until they are lines of type and nothing more.
//   t2..t5, 7, 8  the paper photos are softened at tile size, after the cut (so the blur is not lost in the 4.7x reduction): the typed pages by
//               sigma 1.9 all over (the email, tiles 4 and 8, 2.5), the note's ink alone by sigma 4.6 (separated as a layer over the page, so its ruling stays sharp and unbroken). No letter can be made out at 216px or at 3x.
// Painted text is set in Geist (SIL Open Font License, the file Next ships in node_modules/next/dist/compiled/@vercel/og), through sharp.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const repoRoot = resolve(siteRoot, '..', '..');
const SRC = join(repoRoot, 'docs', 'marketing', 'site-media', 'roll');
const OUT = join(siteRoot, 'public', 'roll');
const MANIFEST = join(siteRoot, 'src', 'content', 'roll.ts');

const BUDGET = 25 * 1024;
const FONT = join(siteRoot, 'node_modules', 'next', 'dist', 'compiled', '@vercel', 'og', 'Geist-Regular.ttf');
/** The only words painted into the roll, and where they come from: the example case's own strings. */
const PAINTED = { chat: ['They posted your old job online today', '3 Feb 2025'], posting: ['Operations Coordinator', 'Full-time'] };
/** The paper photos are softened at tile size, after the cut, so that no letter can be made out at 216px or at 3x of it. Sigma is in tile pixels.
 *  The typed pages take one blur all over (type is thin lines at that size); the note's handwriting is blurred only where the ink is (see inkBlur). */
const SOFTEN = { 2: 'ink', 3: 1.9, 4: 2.5, 5: 1.9, 7: 1.9, 8: 2.5 };
const INK_SIGMA = 4.6;
/** How much of the blurred ink goes back (a blur spreads the dark thin; this keeps the writing as dark as it was). */
const INK_GAIN = 1.9;
/** The grade for the photographs: red up, blue down (warm), a little darker and less saturated. Subtle on purpose: the text stays legible. */
const GRADE = { multiply: [1.04, 1.0, 0.92], brightness: 0.96, saturation: 0.9 };

const SOURCES = {
  1: 't1-chat.png',
  2: 't2-note.png',
  3: 't3-letter.png',
  4: 't4-email.png',
  5: 't5-letter2.png',
  6: 't6-posting.png',
};
// Output size per tile: [width, height].
const SIZES = { 1: [324, 324], 2: [216, 216], 3: [216, 216], 4: [216, 216], 5: [216, 216], 6: [324, 162], 7: [216, 216], 8: [216, 216] };
const PHOTOS = [2, 3, 4, 5, 7];
/** The second email photo is lit differently from the first: a little cooler and brighter, not warm and dim. */
const GRADE_COOL = { multiply: [0.97, 1.0, 1.05], brightness: 1.03, saturation: 0.92 };

const guards = [];
const guard = (name, ok, detail = '') => {
  guards.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const grade = (img, g = GRADE) => img.linear(g.multiply, [0, 0, 0]).modulate({ brightness: g.brightness, saturation: g.saturation });

/** WebP at the highest quality that fits the budget (never below 40). */
async function webp(img, file) {
  let quality = 82;
  let buf;
  do {
    buf = await img.clone().webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    quality -= 6;
  } while (buf.length > BUDGET && quality >= 40);
  writeFileSync(file, buf);
  return buf.length;
}

// ---------------------------------------------------------------- the words
/** The strings must be the example case's own, checked against examples.ts (the tag is the quote's "full-time", capitalised as a tag is). */
const examples = readFileSync(join(siteRoot, 'src', 'content', 'examples.ts'), 'utf8');
for (const str of Object.values(PAINTED).flat()) if (!examples.toLowerCase().includes(str.toLowerCase())) throw new Error(`"${str}" is not in src/content/examples.ts`);
if (!existsSync(FONT)) {
  console.error(`roll-assets: the font file is missing: ${FONT}
  The words painted into the camera roll are set in Geist (SIL Open Font License), which Next ships for next/og in node_modules/next/dist/compiled/@vercel/og/.
  Its place can change when Next is upgraded. Look for Geist-Regular.ttf inside node_modules/next and point FONT, at the top of this script, at it
  (run npm install in apps/site first if node_modules is empty). Do not copy the font into the repo: its licence text would have to go with it.`);
  process.exit(1);
}

const BG = { r: 254, g: 255, b: 254 }; // the screenshots' white
const rect = (w, h, c) => sharp({ create: { width: w, height: h, channels: 3, background: c } }).png().toBuffer();

/** The mean colour of a patch of an image (to match what is painted to what it is painted on). */
async function mean(buf, left, top, width, height) {
  const patch = await sharp(buf).extract({ left, top, width, height }).png().toBuffer(); // (stats() reads its input, not the pipeline)
  const { channels } = await sharp(patch).stats();
  return { r: channels[0].mean, g: channels[1].mean, b: channels[2].mean };
}

/** A line or block of text as a transparent PNG, size in px, wrapped at `width`. Geist has one weight here, so bold is the same text laid down
 *  several times a hair apart, at four times the size and then brought back down. */
async function words(str, { size, color, width, bold = false }) {
  const k = bold ? 4 : 1;
  const one = await sharp({ text: { text: `<span foreground="${color}">${str}</span>`, font: `Geist ${size * k}`, fontfile: FONT, rgba: true, dpi: 72, ...(width ? { width: width * k } : {}) } })
    .png()
    .toBuffer();
  if (!bold) return one;
  const { width: w, height: h } = await sharp(one).metadata();
  const r = Math.round(size * k * 0.028);
  const pad = r * 2;
  const offsets = [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]];
  const thick = await sharp({ create: { width: w + pad * 2, height: h + pad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(offsets.map(([dx, dy]) => ({ input: one, left: Math.round(pad + dx), top: Math.round(pad + dy) })))
    .png()
    .toBuffer();
  return sharp(thick).resize(Math.round((w + pad * 2) / k), null, { kernel: 'lanczos3' }).png().toBuffer();
}

/** The chat: all the generated text goes. One grey bubble stays (the second, lower one) and
 *  carries the example case's line; a date header sits above it. */
async function paintedChat(buf) {
  const grey = await mean(buf, 62, 362, 30, 76);
  const header = await mean(buf, 900, 26, 40, 44);
  const [line, date] = PAINTED.chat;
  const text = await words(line, { size: 33, color: '#0b0b0c', width: 392 });
  const { height: th } = await sharp(text).metadata();
  const stamp = await words(date, { size: 27, color: '#8e8e93' });
  const { width: sw, height: sh } = await sharp(stamp).metadata();
  return sharp(buf)
    .composite([
      { input: await rect(76, 62, header), left: 826, top: 18 }, // the garbled camera glyph in the header
      { input: await rect(524, 160, BG), left: 36, top: 162 }, // the first bubble, with its tail
      { input: await rect(448, 216, BG), left: 556, top: 448 }, // the blue one
      { input: await rect(416, 106, grey), left: 90, top: 346 }, // the words inside the second, kept as a bubble
      { input: stamp, left: Math.round(512 - sw / 2), top: Math.round(262 - sh / 2) },
      { input: text, left: 103, top: Math.round(399 - th / 2) },
    ])
    .png()
    .toBuffer();
}

/** The posting: its title and one tag are given the example case's words; the other tags and the button are left without any; the body lines
 *  are blurred past reading (a blurred patch on white has no edge to see). */
async function paintedPosting(buf) {
  const [title, tag] = PAINTED.posting;
  // The patch reaches well past the lines (a blur spreads about three times its sigma), so it ends where the page is white again.
  const body = await sharp(buf).extract({ left: 90, top: 268, width: 790, height: 370 }).blur({ sigma: 11, precision: 'float', minAmplitude: 0.01 }).png().toBuffer(); // (float: the default's rounding darkens a white patch)
  const heading = await words(title, { size: 54, color: '#1f2435', bold: true });
  const label = await words(tag, { size: 21, color: '#5f636e' });
  const { width: lw, height: lh } = await sharp(label).metadata();
  const pillW = lw + 40;
  const pill = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pillW}" height="43"><rect width="${pillW}" height="43" rx="21.5" fill="#dfe0e1"/></svg>`);
  // The button keeps its colour, row by row, from just inside its left edge; the words in it are painted over.
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rows = [];
  for (let y = 346; y < 408; y++) {
    const i = (y * info.width + 1030) * 3;
    rows.push({ y, c: { r: data[i], g: data[i + 1], b: data[i + 2] } });
  }
  const bar = await sharp({ create: { width: 168, height: rows.length, channels: 3, background: BG } })
    .composite(await Promise.all(rows.map(async ({ y, c }) => ({ input: await rect(168, 1, c), left: 0, top: y - 346 }))))
    .png()
    .toBuffer();
  const hm = await sharp(heading).metadata();
  return sharp(buf)
    .composite([
      { input: body, left: 90, top: 268 },
      { input: await rect(250, 74, BG), left: 126, top: 144 }, // the generated title
      { input: await rect(140, 58, BG), left: 130, top: 218 }, // the generated tags
      { input: heading, left: 139, top: 201 - Math.round(hm.height * 0.8) }, // its baseline sits where the old title's did
      { input: pill, left: 137, top: 225 },
      { input: label, left: 137 + 20, top: Math.round(225 + (43 - lh) / 2) },
      { input: bar, left: 1032, top: 346 },
    ])
    .png()
    .toBuffer();
}

// Each source, as it is cut from: the painted screenshots, the softened photographs, the posting with its body blurred.
const prepared = {};
for (const n of Object.keys(SOURCES)) {
  let buf = readFileSync(join(SRC, SOURCES[n]));
  if (Number(n) === 1) buf = await paintedChat(buf);
  else if (Number(n) === 6) buf = await paintedPosting(buf);
  prepared[n] = buf;
}
const source = (n) => sharp(prepared[n]);

/** A second, crooked photo of a page (the duplicates the scene sets aside): the source turned by `angle` degrees on a desk colour, a soft shadow along
 *  one side (`shadow` is the gradient's direction) and a vignette, cropped square. */
async function secondPhoto(n, { angle, desk, shadow, vignette, zoom = 1, shift = [0, 0] }) {
  const size = 1024;
  const turned = await source(n).rotate(angle, { background: desk }).toBuffer();
  const { width, height } = await sharp(turned).metadata();
  // The largest square inside the turned page, so no corner of the desk shows.
  const rad = (Math.abs(angle) * Math.PI) / 180;
  const inner = Math.floor(size / (Math.cos(rad) + Math.sin(rad)));
  // A tighter window (zoom under 1), moved by `shift` (fractions of the room left), so the second photo is framed differently from the first.
  const win = Math.round(inner * zoom);
  const room = inner - win;
  const cut = await sharp(turned)
    .extract({ left: Math.round((width - inner) / 2 + room / 2 + (room / 2) * shift[0]), top: Math.round((height - inner) / 2 + room / 2 + (room / 2) * shift[1]), width: win, height: win })
    .resize(size, size)
    .toBuffer();
  const shade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs>
      <radialGradient id="v" cx="50%" cy="46%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="${vignette}"/></radialGradient>
      <linearGradient id="s" x1="${shadow[0]}" y1="${shadow[1]}" x2="${shadow[2]}" y2="${shadow[3]}"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.22"/></linearGradient>
    </defs><rect width="100%" height="100%" fill="url(#s)"/><rect width="100%" height="100%" fill="url(#v)"/></svg>`,
  );
  // Rendered to a buffer here: a composite is applied after a resize, and the shade is the size of the whole picture.
  return sharp(await sharp(cut).composite([{ input: shade }]).png().toBuffer());
}

mkdirSync(OUT, { recursive: true });
const made = {};
/** The ruled note with only its ink blurred. The page without the writing (its paper, its shading and its ruling) is estimated row by row as the
 *  median along the row over a window wider than any word: the writing covers less than half of any window, so the median is what the page is
 *  where there is no ink, and the ruling, which runs all the way across, stays in it. The ink is then what is darker than that page, taken as a
 *  layer of its own, blurred, and laid back on the page. The ruling therefore runs sharp and unbroken through the writing, and the faintest
 *  strokes are in the layer too, so they are softened with the rest. */
async function inkBlur(tile, w, h) {
  const { data } = await sharp(tile).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const half = 70;
  const page = Buffer.alloc(w * h * 3);
  const win = [];
  for (let c = 0; c < 3; c++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        win.length = 0;
        for (let k = Math.max(0, x - half); k <= Math.min(w - 1, x + half); k++) win.push(data[(y * w + k) * 3 + c]);
        win.sort((m, n) => m - n);
        page[(y * w + x) * 3 + c] = win[win.length >> 1];
      }
    }
  }
  // The ink: how much darker than the page each pixel is (a few levels of paper grain are not ink).
  const ink = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h * 3; i++) ink[i] = Math.max(0, page[i] - data[i] - 6);
  const soft = await sharp(ink, { raw: { width: w, height: h, channels: 3 } }).blur({ sigma: INK_SIGMA, precision: 'float' }).raw().toBuffer();
  const out = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h * 3; i++) out[i] = Math.max(0, Math.min(255, page[i] - Math.round(soft[i] * INK_GAIN)));
  return sharp(out, { raw: { width: w, height: h, channels: 3 } });
}

const write = async (n, img) => {
  const [w, h] = SIZES[n];
  const file = join(OUT, `tile-${n}.webp`);
  let tile = img.resize(w, h, { fit: 'cover', position: 'centre' });
  if (SOFTEN[n]) {
    const cut = await tile.png().toBuffer();
    tile = SOFTEN[n] === 'ink' ? await inkBlur(cut, w, h) : sharp(cut).blur({ sigma: SOFTEN[n], precision: 'float' });
  }
  made[n] = { file, bytes: await webp(tile, file) };
};

// 1-5: the sources as they are (the photographs graded), resized.
for (const n of [1, 2, 3, 4, 5]) await write(n, PHOTOS.includes(n) ? grade(source(n)) : source(n));
// 6: the posting, cropped to 2:1 from the top of its title down to the foot of its text.
{
  const meta = await source(6).metadata();
  const cropH = Math.round(meta.width / 2);
  await write(6, source(6).extract({ left: 0, top: Math.min(meta.height - cropH, 60), width: meta.width, height: cropH }));
}
// 7: the crooked copy of the letter, graded.
await write(7, grade(await secondPhoto(3, { angle: 4, desk: '#d9d2c6', shadow: [0, 0, 1, 1], vignette: 0.38 })));
// 8: a second photo of the email: turned the other way, cooler and brighter, its shadow on the other side.
await write(8, grade(await secondPhoto(4, { angle: -3, desk: '#cfd2d4', shadow: [1, 0, 0, 1], vignette: 0.2, zoom: 0.84, shift: [-0.8, 0.7] }), GRADE_COOL));

// ---------------------------------------------------------------- guards
const problems = [];
for (let n = 1; n <= 8; n++) {
  const info = await sharp(made[n].file).metadata();
  const [w, h] = SIZES[n];
  if (info.width !== w || info.height !== h || info.format !== 'webp') problems.push(`tile ${n} is ${info.width}x${info.height} ${info.format}, expected ${w}x${h} webp`);
  if (made[n].bytes > BUDGET) problems.push(`tile ${n} is ${made[n].bytes} bytes, over ${BUDGET}`);
}
guard('all eight tiles exist at the right size, as WebP, each at most 25 KB', problems.length === 0, problems.join('; ') || Object.entries(made).map(([n, t]) => `${n}: ${(t.bytes / 1024).toFixed(1)} KB`).join(', '));
const failed = guards.filter((g) => !g.ok);
if (failed.length) {
  console.error(`\n${failed.length} guard(s) failed.`);
  process.exit(1);
}

// ---------------------------------------------------------------- the manifest
// Each source's seed and job come from the PROVENANCE.md beside the images (the record of what was generated and how).
const rows = readFileSync(join(SRC, 'PROVENANCE.md'), 'utf8')
  .split('\n')
  .filter((l) => /^\| t\d-/.test(l))
  .map((l) => l.split('|').map((c) => c.trim()));
const byFile = Object.fromEntries(rows.map(([, file, , , seed, job]) => [file, { seed: Number(seed), job }]));
const tiles = Object.fromEntries(
  Object.keys(SIZES).map((k) => {
    const n = Number(k);
    const from = n === 7 ? 3 : n === 8 ? 4 : n;
    const p = byFile[SOURCES[from]];
    if (!p) throw new Error(`PROVENANCE.md has no row for ${SOURCES[from]}`);
    return [n, { src: `/roll/tile-${n}.webp`, width: SIZES[n][0], height: SIZES[n][1], bytes: made[n].bytes, from: repoRel(join(SRC, SOURCES[from])), derived: n >= 7, graded: PHOTOS.includes(n) || n === 8, softened: n in SOFTEN, painted: n === 1 ? PAINTED.chat : n === 6 ? PAINTED.posting : [], seed: p.seed, kreaJob: p.job }];
  }),
);
function repoRel(file) {
  return relative(repoRoot, file).split('\\').join('/');
}
const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const body = Object.entries(tiles)
  .map(
    ([n, t]) =>
      `    ${n}: {\n      src: ${quote(t.src)},\n      width: ${t.width},\n      height: ${t.height},\n      bytes: ${t.bytes},\n      from: ${quote(t.from)},\n      derived: ${t.derived},\n      graded: ${t.graded},\n      softened: ${t.softened},\n      painted: ${JSON.stringify(t.painted).replace(/"/g, "'")},\n      seed: ${t.seed},\n      kreaJob: ${quote(t.kreaJob)},\n    },`,
  )
  .join('\n');
writeFileSync(
  MANIFEST,
  `// Camera-roll tiles: paths, sizes and provenance for the hero's old roll and the S4 filing scene.
// Written by scripts/roll-assets.mjs (npm run roll:assets), which derives public/roll/ from docs/marketing/site-media/roll/. Re-running the
// script overwrites this file, so change the script, not the numbers. Keep this file free of imports so the scripts can load it directly.
// (It sits beside media.ts and not in it: media.ts is rewritten whole by scripts/film-assets.mjs.)
// Everything here is AI-generated: ${'illustrations of example documents; the text in them is not real.'}

export interface RollTile {
  /** Public path, served from /public. */
  src: string;
  width: number;
  height: number;
  bytes: number;
  /** The source image the tile was cut from, relative to the repo. */
  from: string;
  /** A duplicate derived from another tile's source (7 from 3, 8 from 4), with no new generation. */
  derived: boolean;
  /** Graded a little toward the film's warm, low-light look. */
  graded: boolean;
  /** Softened at tile size (sigma 1.9 on the typed pages, 2.5 on the email, 4.6 on the note's ink layer alone) so no letter can be made out, at 216px or at 3x. */
  softened: boolean;
  /** The words painted into the picture after it was generated (the generated text is not words): lines of the example case, from examples.ts. */
  painted: string[];
  /** The prompt for each source is in PROVENANCE.md beside the images (prompts are not copy, and are kept out of this file). */
  seed: number;
  kreaJob: string;
}

export const rollMedia = {
  model: 'Krea: bfl/flux-2-klein, 1K, 4 steps, cfg 1',
  madeOn: '2026-11-06',
  aiGenerated: true as const,
  note: 'Illustrations of example documents; the text in them is not real.',
  /** What was done to the generated text after generation (the sources in docs/ are as generated). */
  textNote:
    'In the chat and the job posting the generated text was painted over, after generation, with lines of the example case (src/content/examples.ts), set in Geist; the other text in them was removed or blurred past reading. The paper photos were softened at tile size (in the handwritten note, its ink only).',
  source: 'docs/marketing/site-media/roll/',
  rebuild: 'Rebuild the tiles with \`npm run roll:assets\` in apps/site.',
  tiles: {
${body}
  } as Record<number, RollTile>,
};
`,
);
console.log(`wrote ${repoRel(MANIFEST)}`);
console.log(`\nAll ${guards.length} guards passed.`);
