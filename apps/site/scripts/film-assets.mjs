// Film assets: builds everything the hero film message and the film player load, from the approved 30 s film and its source footage.
// Run from apps/site: node scripts/film-assets.mjs [--qa-dir <dir>]   (npm script: "film:assets": "node scripts/film-assets.mjs")
// Needs ffmpeg and ffprobe on PATH. Reads docs/marketing/commercial-30s/ and writes public/film/ and src/content/media.ts.
//
// What it makes:
//   case-iq-film-30s.mp4          a byte copy of the site cut of the film (docs/marketing/commercial-30s/site-cut/): the approved ad
//                                 without its drawn "Get my case in order" button and with the AI line on the end card. Never
//                                 re-encoded; its MD5, streams, length and loudness are checked first.
//   case-iq-film-30s-described.mp4 / .en.vtt   the extended audio-described version (WCAG 1.2.5), built from the site cut and the
//                                 voice take docs/marketing/commercial-30s/source/audio/described/ad_take1.mp3 by film-described.mjs.
//   case-iq-film-30s.en.vtt       captions for the eight voice lines. Line times are measured on the voice stems, not guessed.
//   case-iq-film-30s-poster-*.webp  player posters from the film's frame 0 (720 and 360 wide).
//   hero-snap-640.mp4             the silent hero clip (about 4 s, 640x640): the pile lifts and snaps into one column. It is cut
//                                 from clip2_take1.mp4 with the film's own night grade, a 768x768 crop and a speed map, so it
//                                 matches the film's look. No audio stream.
//   hero-pile-*.webp              the clip's first frame (320, 480, 640). The static image for visitors without JavaScript.
//   hero-column-*.webp            the clip's last frame (320, 480, 640). The final state, for reduced motion.
//   src/content/media.ts          a data-only manifest: paths, sizes, caption lines, provenance. No imports, so scripts can load it.
// Re-runs overwrite the outputs, so the script is safe to run again. It fails loudly (exit 1) if a guard fails, and it writes
// media.ts only after every guard has passed.
//
// How the voice lines are timed: the voice stems (vo.mp3, vo_take2.mp3) are cut into the film by source/build/config.json. For each
// line the audible span is the first and last 5 ms window above -40 dBFS inside its cut, the same rule source/build/audio.py uses
// to place it. The span is then shifted so its first sound lands on the line's onsetAt in the film. This gives start and end in
// film time without the music getting in the way.
//
// --qa-dir <dir> writes review sheets outside the repo: a contact sheet of the hero clip (every 0.25 s), a grade match against
// the film's frame at 4.6 s, and a captions sheet (the cues against the measured voice regions on the film's waveform).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readFileSync, readSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDescribed } from './film-described.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const repoRoot = resolve(siteRoot, '..', '..');
const SRC = join(repoRoot, 'docs', 'marketing', 'commercial-30s');
const OUT = join(siteRoot, 'public', 'film');
const MEDIA_TS = join(siteRoot, 'src', 'content', 'media.ts');

const AD = join(SRC, 'caseiq-30s-vertical.mp4'); // the ad, as it is posted; its frame 0 is what the posters and the hero clip were made from
const MASTER = join(SRC, 'site-cut', 'caseiq-30s-vertical-site.mp4'); // the cut the site plays
/** The site cut, as rendered from source/ with `node build/run.mjs --cut site` (see site-cut/README.md). Update it when the cut is re-rendered. */
const SITE_CUT = { md5: 'eed0bbe98d5486a7a66966d2412a9bcc', loudness: { target: -14.1, tolerance: 0.5, truePeakMax: -1.0 } };
const CLIP2 = join(SRC, 'source', 'footage', 'clip2_take1.mp4');
const CONFIG = join(SRC, 'source', 'build', 'config.json');

// ---------------------------------------------------------------- settings
const FILM_DURATION = 30;
const HERO = {
  crop: { w: 768, h: 768, x: 0, y: 290 }, // keeps the mug top right, the phone bottom right, the column centred
  size: 640,
  fps: 24,
  // Source seconds of clip2_take1.mp4, concatenated in order.
  speedMap: [
    { from: 0.45, to: 1.85, speed: 1.0, note: 'the pile stirs and lifts' },
    { from: 1.85, to: 2.55, speed: 1.5, note: 'the snap' },
    // `to` is the settle point, measured from the source at run time (see the settle point in section 4).
    { from: 2.55, to: 5.4, speed: 1.6, note: 'the column lands and settles' },
  ],
  settle: { after: 5.4, below: 0.6, frames: 6 }, // the source must move less than 0.6/255 per frame for 6 frames in a row
  endStill: { seconds: 0.25, maxDiff: 1.5 }, // the last 0.25 s of the clip may move by at most 1.5/255
  minSeconds: 3.4,
  maxSeconds: 4.6,
  crf: 23,
  maxBytes: 450 * 1024,
  stillWidths: [320, 480, 640],
};
const POSTER_WIDTHS = [720, 360];
const WEBP_QUALITY = 82;
const CAPTION = { maxLines: 2, maxChars: 42, hold: 0.25, gap: 0.05 };
const QA_FILM_SECONDS = 4.6; // the film frame compared with the hero clip's first frame

// The spoken lines, in film order. Times come from measurement, never from this table.
const LINES = [
  { id: 'A1', text: 'You know what happened.' },
  { id: 'A2', text: 'It’s in here somewhere.' },
  { id: 'B', text: 'Let’s find the page that shows it.' },
  { id: 'C1', text: 'One timeline.' },
  { id: 'C2', text: 'The page behind every fact.' },
  { id: 'D', text: 'Bring the pile. Leave with a timeline.' },
  { id: 'E1', text: 'Case IQ.' },
  { id: 'E2', text: 'A flat price agreed before we start, never hourly.' },
];

// ---------------------------------------------------------------- small helpers
const args = process.argv.slice(2);
const qaFlag = args.indexOf('--qa-dir');
if (qaFlag !== -1 && !args[qaFlag + 1]) throw new Error('--qa-dir needs a directory');
const QA_DIR = qaFlag !== -1 ? resolve(args[qaFlag + 1]) : null;

const guards = [];
const guard = (name, ok, detail = '') => {
  guards.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const warnings = [];
const warn = (message) => {
  warnings.push(message);
  console.warn(`WARN  ${message}`);
};

function run(cmd, cmdArgs, { binary = false } = {}) {
  const r = spawnSync(cmd, cmdArgs, { maxBuffer: 1 << 29, encoding: binary ? 'buffer' : 'utf8' });
  if (r.error) throw new Error(`${cmd} could not start: ${r.error.message} (is it on PATH?)`);
  if (r.status !== 0) {
    const err = binary ? r.stderr.toString() : r.stderr;
    throw new Error(`${cmd} ${cmdArgs.join(' ')}\n${err}`);
  }
  return r.stdout;
}
const ffmpeg = (a) => run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a]);
const ffprobeJson = (file, extra = []) => JSON.parse(run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', ...extra, file]));

const md5 = (file) => createHash('md5').update(readFileSync(file)).digest('hex');
const bytes = (file) => statSync(file).size;
const round = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
const publicPath = (file) => '/' + relative(join(siteRoot, 'public'), file).split('\\').join('/');
const repoPath = (file) => relative(repoRoot, file).split('\\').join('/');

// Top-level MP4 boxes in file order, read from the headers only.
function mp4Boxes(file) {
  const fd = openSync(file, 'r');
  const size = statSync(file).size;
  const boxes = [];
  const head = Buffer.alloc(16);
  try {
    let pos = 0;
    while (pos + 8 <= size) {
      readSync(fd, head, 0, 16, pos);
      let len = head.readUInt32BE(0);
      const type = head.toString('latin1', 4, 8);
      if (len === 1) len = Number(head.readBigUInt64BE(8));
      else if (len === 0) len = size - pos;
      if (len < 8) throw new Error(`${file}: bad box size at byte ${pos}`);
      boxes.push(type);
      pos += len;
    }
  } finally {
    closeSync(fd);
  }
  return boxes;
}
const moovFirst = (file) => {
  const boxes = mp4Boxes(file);
  return boxes.includes('moov') && boxes.includes('mdat') && boxes.indexOf('moov') < boxes.indexOf('mdat');
};

const probeVideo = (file) => {
  const p = ffprobeJson(file);
  const v = p.streams.find((s) => s.codec_type === 'video');
  return {
    width: v.width,
    height: v.height,
    codec: v.codec_name,
    profile: v.profile,
    pixFmt: v.pix_fmt,
    fps: v.avg_frame_rate.split('/').reduce((a, b) => a / b),
    duration: Number(p.format.duration),
    audioStreams: p.streams.filter((s) => s.codec_type === 'audio').length,
  };
};
const countFrames = (file) => Number(JSON.parse(run('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-print_format', 'json', file])).streams[0].nb_read_frames);
const probeImage = (file) => {
  const s = ffprobeJson(file).streams[0];
  return { width: s.width, height: s.height };
};

// bt709 limited-range YUV to full-range RGB, the same decode source/build/assemble.mjs uses.
const TO_RGB = 'scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int';
const TO_YUV = 'scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int';

// drawtext needs a font file. Windows and Linux paths are tried; the sheets still render (without labels) if none is found.
function fontFile() {
  const candidates = ['C:/Windows/Fonts/consola.ttf', 'C:/Windows/Fonts/arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', '/System/Library/Fonts/Menlo.ttc'];
  const found = candidates.find((f) => existsSync(f));
  return found ? found.replace(/^([A-Za-z]):/, '$1\\:') : null;
}
const FONT = fontFile();
const label = (text, { x = 6, y = 6, size = 16 } = {}) =>
  FONT ? `drawtext=fontfile='${FONT}':text='${text}':x=${x}:y=${y}:fontsize=${size}:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=3` : null;
const chain = (...f) => f.filter(Boolean).join(',');

// Integrated loudness (LUFS) and true peak (dBFS) of a file, optionally after a filter.
function loudness(file, pre = '') {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', `${pre}${pre ? ',' : ''}ebur128=peak=true`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const s = r.stderr.split('Summary:').pop();
  const num = (re) => Number((s.match(re) ?? [])[1]);
  return { I: num(/I:\s+(-?[\d.]+)\s+LUFS/), TP: num(/Peak:\s+(-?[\d.]+)\s+dBFS/) };
}
// The MD5 of what a file's frame `n` decodes to.
const frameMd5 = (file, n) => run('ffmpeg', ['-v', 'error', '-i', file, '-vf', `select=eq(n\\,${n})`, '-frames:v', '1', '-f', 'md5', '-']).trim();

// ---------------------------------------------------------------- 1. the film copy
mkdirSync(OUT, { recursive: true });
for (const f of [AD, MASTER, CLIP2, CONFIG]) if (!existsSync(f)) throw new Error(`Missing input: ${repoPath(f)}`);
if (md5(MASTER) !== SITE_CUT.md5) throw new Error(`${repoPath(MASTER)} is not the site cut this script was written for (MD5 ${md5(MASTER)}, expected ${SITE_CUT.md5}). Re-render it, or update SITE_CUT in this script.`);
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const GRADE = config.grade.filter;

const FILM = join(OUT, 'case-iq-film-30s.mp4');
copyFileSync(MASTER, FILM);
console.log(`copied the film (${bytes(FILM)} bytes)`);

// ---------------------------------------------------------------- 2. measured voice regions and captions
const SR = 48000;
function decodeMono(file) {
  const buf = run('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { binary: true });
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
}
const db = (x) => 20 * Math.log10(Math.max(x, 1e-12));
const win = Math.round(0.005 * SR);
function windowDb(x, a, b) {
  const out = [];
  for (let i = a; i + win <= b; i += win) {
    let s = 0;
    for (let j = i; j < i + win; j++) s += x[j] * x[j];
    out.push(db(Math.sqrt(s / win)));
  }
  return out;
}

const voice = config.voice;
const stems = Object.fromEntries(Object.entries(voice.srcs).map(([k, p]) => [k, decodeMono(join(SRC, 'source', p))]));
if (voice.lines.length !== LINES.length) throw new Error('config.json voice lines and the caption lines disagree');
const measured = voice.lines.map((ln, i) => {
  if (ln.text !== LINES[i].text) throw new Error(`Line ${ln.id}: config text "${ln.text}" is not the caption text "${LINES[i].text}"`);
  const e = windowDb(stems[ln.take], Math.round(ln.from * SR), Math.round(ln.to * SR));
  const loud = e.map((v, k) => (v > voice.onsetThresholdDb ? k : -1)).filter((k) => k >= 0);
  if (!loud.length) throw new Error(`Line ${ln.id}: no audible span above ${voice.onsetThresholdDb} dBFS`);
  const on = ln.from + loud[0] * 0.005;
  const off = ln.from + (loud[loud.length - 1] + 1) * 0.005;
  return { id: ln.id, text: ln.text, start: round(ln.onsetAt, 3), end: round(ln.onsetAt + (off - on), 3) };
});
console.log('measured voice regions:');
for (const l of measured) console.log(`  ${l.id.padEnd(3)} ${l.start.toFixed(3)} -> ${l.end.toFixed(3)}  ${l.text}`);

// Cue = the voice region plus a short hold, never running into the next cue or past the end of the film.
const cues = measured.map((l, i) => {
  const next = measured[i + 1];
  const end = Math.min(l.end + CAPTION.hold, next ? next.start - CAPTION.gap : FILM_DURATION, FILM_DURATION);
  return { ...l, cueStart: l.start, cueEnd: round(end, 3), lines: wrapCue(l.text) };
});

function wrapCue(text) {
  if (text.length <= CAPTION.maxChars) return [text];
  // Split at the space nearest the middle, preferring a break after a comma.
  const spaces = [...text.matchAll(/ /g)].map((m) => m.index);
  const mid = text.length / 2;
  const score = (i) => Math.abs(i - mid) - (text[i - 1] === ',' ? 6 : 0);
  const at = spaces.sort((a, b) => score(a) - score(b))[0];
  return [text.slice(0, at), text.slice(at + 1)];
}
const stamp = (t) => {
  const ms = Math.round(t * 1000);
  const p = (n, w) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000), 2)}:${p(Math.floor(ms / 60000) % 60, 2)}:${p(Math.floor(ms / 1000) % 60, 2)}.${p(ms % 1000, 3)}`;
};

const VTT = join(OUT, 'case-iq-film-30s.en.vtt');
writeFileSync(
  VTT,
  'WEBVTT\n\nNOTE Made by scripts/film-assets.mjs. Cue starts and the voice ends are measured on the voice stems; each cue holds 0.25 s past the voice.\n\n' +
    cues.map((c, i) => `${i + 1}\n${stamp(c.cueStart)} --> ${stamp(c.cueEnd)}\n${c.lines.join('\n')}\n`).join('\n'),
);

// ---------------------------------------------------------------- 3. posters from the film's frame 0
const webpFrom = (input, inputArgs, filter, outFile) =>
  ffmpeg([...inputArgs, '-i', input, '-vf', filter, '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(WEBP_QUALITY), '-compression_level', '6', outFile]);

const posters = POSTER_WIDTHS.map((w) => {
  const file = join(OUT, `case-iq-film-30s-poster-${w}.webp`);
  const h = (w * 16) / 9;
  webpFrom(FILM, [], chain(`select=eq(n\\,0)`, TO_RGB, 'format=rgb24', `scale=${w}:${h}:flags=lanczos`, 'format=bgra'), file);
  return { file, width: w, height: h };
});

// ---------------------------------------------------------------- 3b. the described version
if (QA_DIR) mkdirSync(QA_DIR, { recursive: true });
const described = buildDescribed({
  run, ffmpeg, loudness, guard, md5, bytes, round, stamp, publicPath, repoPath, probeVideo, countFrames, moovFirst,
  FILM, OUT, SRC, qaDir: QA_DIR, FONT, chain,
  voiceCues: cues, // the film's own captions' cues: the gaps between them are where the description goes
});

// ---------------------------------------------------------------- 4. the hero clip
// The settle point: the first source frame, after HERO.settle.after, that starts a run of HERO.settle.frames frames each moving
// less than HERO.settle.below (mean absolute difference of the cropped, grey, 96x96 frame, out of 255). The last segment runs up
// to it, so the clip ends on a settled column. If the source never settles, the last segment runs to the source's final frame.
// If that would push the clip past the maximum length, the last segment speeds up just enough to fit.
const SETTLE_SIZE = 96;
const FPS_SRC = 24;
const settleScan = (() => {
  const raw = run('ffmpeg', ['-v', 'error', '-i', CLIP2, '-vf', `crop=${HERO.crop.w}:${HERO.crop.h}:${HERO.crop.x}:${HERO.crop.y},scale=${SETTLE_SIZE}:${SETTLE_SIZE}:flags=area,format=gray`, '-f', 'rawvideo', '-'], { binary: true });
  const px = SETTLE_SIZE * SETTLE_SIZE;
  const n = Math.floor(raw.length / px);
  const diffs = []; // diffs[i] = movement from frame i to frame i + 1
  for (let i = 0; i + 1 < n; i++) {
    let s = 0;
    for (let k = 0; k < px; k++) s += Math.abs(raw[(i + 1) * px + k] - raw[i * px + k]);
    diffs.push(s / px);
  }
  return { n, diffs };
})();
let settleFrame = -1; // index of the first frame of the quiet run
for (let f = Math.ceil(HERO.settle.after * FPS_SRC); f + HERO.settle.frames <= settleScan.n; f++) {
  const quiet = settleScan.diffs.slice(f - 1, f - 1 + HERO.settle.frames); // movement into frames f .. f + 5
  if (quiet.every((d) => d < HERO.settle.below)) {
    settleFrame = f;
    break;
  }
}
const settled = settleFrame !== -1;
const lastSeg = HERO.speedMap[HERO.speedMap.length - 1];
// Include the settle frame itself: end half a frame after its timestamp.
lastSeg.to = round(((settled ? settleFrame : settleScan.n - 1) + 0.5) / FPS_SRC, 4);
lastSeg.note = settled ? 'the column lands and settles; ends on the settle point' : 'the column lands and settles; the source never settles, so it runs to its last frame';
const lastSegFrom = lastSeg.from;
const baseSpeed = lastSeg.speed;
const finalTo = round((settleScan.n - 0.5) / FPS_SRC, 4); // the source's last frame
// Speed up the last segment only as far as it takes to stay inside the maximum length.
function fitLastSpeed() {
  const beforeLast = HERO.speedMap.slice(0, -1).reduce((a, s) => a + (s.to - s.from) / s.speed, 0);
  const needSpeed = (lastSeg.to - lastSegFrom) / (HERO.maxSeconds - beforeLast);
  lastSeg.speed = Math.max(baseSpeed, Math.ceil(needSpeed * 100) / 100);
}
fitLastSpeed();
const settlePoint = round((settled ? settleFrame : settleScan.n - 1) / FPS_SRC, 3);
console.log(`settle point: source ${settlePoint} s (${settled ? `frame ${settleFrame}` : 'the source never settles, using its last frame'}); last segment ${lastSeg.from}-${lastSeg.to} s at ${lastSeg.speed}x`);

const HERO_CLIP = join(OUT, 'hero-snap-640.mp4');
const { crop, size } = HERO;
const seg = (name, s, i) => `[${name}]trim=start=${s.from}:end=${s.to},setpts=(PTS-STARTPTS)/${s.speed}[v${i}]`;
const speedGraph = () => [
  `[0:v]${TO_RGB},format=gbrp,${GRADE},format=rgb24,crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${size}:${size}:flags=lanczos+accurate_rnd,split=${HERO.speedMap.length}${HERO.speedMap.map((_, i) => `[s${i}]`).join('')}`,
  ...HERO.speedMap.map((s, i) => seg(`s${i}`, s, i)),
  `${HERO.speedMap.map((_, i) => `[v${i}]`).join('')}concat=n=${HERO.speedMap.length}:v=1:a=0,fps=${HERO.fps},${TO_YUV},format=yuv420p[v]`,
].join(';');

function encodeHero(crf) {
  ffmpeg([
    '-i', CLIP2, '-filter_complex', speedGraph(), '-map', '[v]', '-an',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-r', String(HERO.fps), '-fps_mode', 'cfr', '-movflags', '+faststart', HERO_CLIP,
  ]);
  return bytes(HERO_CLIP);
}
// CRF 23 first. If the clip is over budget, step the CRF up (at most to 27) and record the value that was used.
let heroCrf = HERO.crf;
let heroBytes = 0;
function encodeWithinBudget() {
  heroCrf = HERO.crf;
  heroBytes = encodeHero(heroCrf);
  while (heroBytes > HERO.maxBytes && heroCrf < 27) heroBytes = encodeHero(++heroCrf);
}

// How far the clip still moves at its end: the last frame against the one HERO.endStill.seconds earlier, grey 96x96, out of 255.
function grayFrame(index) {
  return run('ffmpeg', ['-v', 'error', '-i', HERO_CLIP, '-vf', `select=eq(n\\,${index}),scale=96:96:flags=area,format=gray`, '-frames:v', '1', '-f', 'rawvideo', '-'], { binary: true });
}
const meanAbsDiff = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
const endMotion = (frames) => meanAbsDiff(grayFrame(frames - 1), grayFrame(frames - 1 - Math.round(HERO.fps * HERO.endStill.seconds)));

// Encode to the settle point. If the clip still moves at its end by more than the limit (slow drift after the quiet run),
// run the last segment 0.25 source seconds further, up to the source's last frame, and try again.
encodeWithinBudget();
let heroFrames = countFrames(HERO_CLIP);
let settleDiff = endMotion(heroFrames);
while (settleDiff > HERO.endStill.maxDiff && lastSeg.to < finalTo) {
  lastSeg.to = Math.min(finalTo, round(lastSeg.to + 0.25, 4));
  fitLastSpeed();
  console.log(`still moving at the end (${settleDiff.toFixed(2)}); last segment now ${lastSeg.from}-${lastSeg.to} s at ${lastSeg.speed}x`);
  encodeWithinBudget();
  heroFrames = countFrames(HERO_CLIP);
  settleDiff = endMotion(heroFrames);
}
if (heroBytes > HERO.maxBytes) warn(`hero clip is ${heroBytes} bytes at CRF ${heroCrf}, over the ${HERO.maxBytes} byte target`);
console.log(`hero clip: ${heroBytes} bytes at CRF ${heroCrf}`);

// ---------------------------------------------------------------- 5. hero stills (first and last frame of the clip as encoded)
const stillFilter = (index, width) =>
  chain(`select=eq(n\\,${index})`, TO_RGB, 'format=rgb24', width === size ? null : `scale=${width}:${width}:flags=lanczos`, 'format=bgra');
const stills = { pile: [], column: [] };
for (const [kind, index] of [['pile', 0], ['column', heroFrames - 1]]) {
  for (const w of HERO.stillWidths) {
    const file = join(OUT, `hero-${kind}-${w}.webp`);
    webpFrom(HERO_CLIP, [], stillFilter(index, w), file);
    stills[kind].push({ file, width: w, height: w });
  }
}

// ---------------------------------------------------------------- 6. guards
const filmProbe = probeVideo(FILM);
const heroProbe = probeVideo(HERO_CLIP);
const expectedSeconds = HERO.speedMap.reduce((a, s) => a + (s.to - s.from) / s.speed, 0);

guard('film copy matches the site cut by MD5', md5(FILM) === md5(MASTER) && md5(FILM) === SITE_CUT.md5, md5(FILM));
guard('film is 720x1280, 30 s, with one video and one audio stream', filmProbe.width === 720 && filmProbe.height === 1280 && Math.abs(filmProbe.duration - FILM_DURATION) < 0.05 && filmProbe.audioStreams === 1, `${filmProbe.width}x${filmProbe.height}, ${filmProbe.duration.toFixed(3)} s`);
const filmLoud = loudness(FILM);
guard(`film loudness is ${SITE_CUT.loudness.target} LUFS (+/-${SITE_CUT.loudness.tolerance}) with a true peak at or under ${SITE_CUT.loudness.truePeakMax} dBTP`, Math.abs(filmLoud.I - SITE_CUT.loudness.target) <= SITE_CUT.loudness.tolerance && filmLoud.TP <= SITE_CUT.loudness.truePeakMax, `I ${filmLoud.I} LUFS, TP ${filmLoud.TP} dBTP`);
guard('film frame 0 is the ad frame 0 (the posters and the hero clip still match the film)', frameMd5(FILM, 0) === frameMd5(AD, 0), frameMd5(FILM, 0));
guard(`hero clip is ${HERO.minSeconds}-${HERO.maxSeconds} s`, heroProbe.duration >= HERO.minSeconds && heroProbe.duration <= HERO.maxSeconds, `${heroProbe.duration.toFixed(3)} s, ${heroFrames} frames, speed map says ${expectedSeconds.toFixed(3)} s`);
guard('hero clip is 640x640 H.264 High yuv420p at 24 fps', heroProbe.width === size && heroProbe.height === size && heroProbe.codec === 'h264' && heroProbe.profile === 'High' && heroProbe.pixFmt === 'yuv420p' && Math.abs(heroProbe.fps - HERO.fps) < 1e-6, `${heroProbe.width}x${heroProbe.height} ${heroProbe.profile} ${heroProbe.pixFmt} ${heroProbe.fps}fps`);
guard('hero clip has no audio stream', heroProbe.audioStreams === 0);
guard('film has moov before mdat', moovFirst(FILM), mp4Boxes(FILM).join(','));
guard('hero clip has moov before mdat', moovFirst(HERO_CLIP), mp4Boxes(HERO_CLIP).join(','));

const imageChecks = [
  ...posters.map((p) => ({ ...p, name: `poster ${p.width}` })),
  ...Object.entries(stills).flatMap(([kind, list]) => list.map((s) => ({ ...s, name: `${kind} still ${s.width}` }))),
];
const badImages = imageChecks.filter((i) => {
  if (!existsSync(i.file) || bytes(i.file) === 0) return true;
  const dim = probeImage(i.file);
  i.bytes = bytes(i.file);
  return dim.width !== i.width || dim.height !== i.height;
});
guard(`all ${imageChecks.length} posters and stills exist at the right size`, badImages.length === 0, badImages.map((i) => i.name).join(', ') || `${imageChecks.length} files`);

// Captions: read the file back and check every cue.
const vttText = readFileSync(VTT, 'utf8');
const vttCues = [...vttText.matchAll(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})\n([^\n]+(?:\n[^\n]+)*)/gm)].map((m) => ({
  start: +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000,
  end: +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000,
  lines: m[9].split('\n'),
}));
const vttProblems = [];
if (vttCues.length !== LINES.length) vttProblems.push(`${vttCues.length} cues, expected ${LINES.length}`);
vttCues.forEach((c, i) => {
  if (!(c.start >= 0 && c.end <= FILM_DURATION && c.end > c.start)) vttProblems.push(`cue ${i + 1} outside 0-${FILM_DURATION} s or empty`);
  if (i > 0 && c.start < vttCues[i - 1].end) vttProblems.push(`cue ${i + 1} overlaps cue ${i}`);
  if (c.lines.length > CAPTION.maxLines) vttProblems.push(`cue ${i + 1} has ${c.lines.length} lines`);
  for (const l of c.lines) if (l.length > CAPTION.maxChars) vttProblems.push(`cue ${i + 1} line over ${CAPTION.maxChars} characters: "${l}"`);
  if (cues[i] && c.lines.join(' ') !== cues[i].text) vttProblems.push(`cue ${i + 1} text differs from the voice line`);
});
guard('every VTT cue sits inside 0-30 s, no overlaps, at most 2 lines of 42 characters', vttProblems.length === 0, vttProblems.join('; ') || `${vttCues.length} cues`);

// Last frame: the column must have settled, so the last 0.25 s may barely move (settleDiff, measured above).
const startDiff = meanAbsDiff(grayFrame(0), grayFrame(heroFrames - 1));
console.log(`last frame vs 0.25 s earlier: mean abs diff ${settleDiff.toFixed(2)} (of 255); first vs last frame: ${startDiff.toFixed(2)}`);
guard(`hero clip's last ${HERO.endStill.seconds} s moves by at most ${HERO.endStill.maxDiff}/255`, settleDiff <= HERO.endStill.maxDiff, `mean abs diff ${settleDiff.toFixed(2)}`);
if (startDiff < 4) warn(`the hero clip's first and last frames look alike (diff ${startDiff.toFixed(2)}); the snap may not show`);

const failed = guards.filter((g) => !g.ok);
if (failed.length) {
  console.error(`\n${failed.length} guard(s) failed:\n${failed.map((g) => `  - ${g.name}${g.detail ? ` (${g.detail})` : ''}`).join('\n')}`);
  process.exit(1);
}

// ---------------------------------------------------------------- 7. the manifest
const image = (file, width, height) => ({ src: publicPath(file), width, height, bytes: bytes(file), type: 'image/webp', aiGenerated: true });
const manifest = {
  film: {
    src: publicPath(FILM), width: filmProbe.width, height: filmProbe.height, durationSeconds: round(filmProbe.duration, 3), fps: 24,
    bytes: bytes(FILM), type: 'video/mp4', aiGenerated: true, hasAudio: true, md5: md5(FILM),
  },
  described: described.manifest,
  captions: {
    src: publicPath(VTT), bytes: bytes(VTT), type: 'text/vtt', language: 'en', label: 'English',
    // Measured voice regions in film seconds. A text version of the film can render these as they are.
    lines: measured.map(({ id, text, start, end }) => ({ id, text, start, end })),
  },
  posters: posters.map((p) => image(p.file, p.width, p.height)),
  hero: {
    clip: {
      src: publicPath(HERO_CLIP), width: size, height: size, durationSeconds: round(heroProbe.duration, 3), fps: HERO.fps,
      bytes: bytes(HERO_CLIP), type: 'video/mp4', aiGenerated: true, hasAudio: false, frames: heroFrames, crf: heroCrf,
    },
    // First frame of the clip: the image shown with no JavaScript.
    pile: stills.pile.map((s) => image(s.file, s.width, s.height)),
    // Last frame of the clip: the final state, shown under reduced motion.
    column: stills.column.map((s) => image(s.file, s.width, s.height)),
    cut: {
      from: repoPath(CLIP2),
      crop: { ...crop },
      scaledTo: size,
      grade: GRADE,
      speedMap: HERO.speedMap.map(({ from, to, speed, note }) => ({ from, to, speed, note })),
    },
  },
  provenance: {
    madeOn: '2026-11-01',
    madeFor: 'Case IQ',
    footage: 'Krea: MiniMax H3 Max Turbo at 768p, from Flux 2 Klein 1K keyframes',
    voice: 'ElevenLabs TTS, eleven_v4, voice "Sarah"',
    music: 'ElevenLabs Music v2.5',
    thirdPartyFootage: false,
    realPeople: false,
    aiGenerated: true,
    source: 'docs/marketing/commercial-30s/',
    siteCut: 'This is the site cut of the film (docs/marketing/commercial-30s/site-cut/): the approved ad without its drawn "Get my case in order" button, which nobody could press, and with the line "Pictures, voice and music made with AI." added to the fine print on the end card. The ad itself is unchanged.',
    rebuild: 'Re-render the site cut from docs/marketing/commercial-30s/source/ with `node build/run.mjs --cut site` (see site-cut/README.md); rebuild these files with `npm run film:assets` in apps/site.',
  },
};

const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));
function emit(v, indent = 0) {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (typeof v === 'string') return quote(v);
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    const oneLine = `[${v.map((x) => emit(x, 0)).join(', ')}]`;
    if (v.every((x) => typeof x !== 'object') && oneLine.length < 90) return oneLine;
    return `[\n${v.map((x) => `${inner}${emit(x, indent + 1)},`).join('\n')}\n${pad}]`;
  }
  const entries = Object.entries(v);
  const oneLine = `{ ${entries.map(([k, x]) => `${key(k)}: ${emit(x, 0)}`).join(', ')} }`;
  if (entries.every(([, x]) => typeof x !== 'object') && oneLine.length < 110) return oneLine;
  return `{\n${entries.map(([k, x]) => `${inner}${key(k)}: ${emit(x, indent + 1)},`).join('\n')}\n${pad}}`;
}

const tsFile = `// Film media: paths, sizes, caption lines and provenance for the 30 s film and the hero film message.
// Written by scripts/film-assets.mjs (npm run film:assets), which measures every value from the files in public/film/.
// Re-running the script overwrites this file, so change the script, not the numbers. Keep this file free of imports so the scripts can load it directly.
// Everything here is AI-generated: label it on the page as made with AI.

export interface ImageAsset {
  /** Public path, served from /public. */
  src: string;
  width: number;
  height: number;
  bytes: number;
  /** MIME type. */
  type: string;
  aiGenerated: true;
}

export interface VideoAsset extends Omit<ImageAsset, 'type'> {
  type: 'video/mp4';
  durationSeconds: number;
  fps: number;
  hasAudio: boolean;
}

export interface CaptionLine {
  id: string;
  /** The words, exactly as spoken. */
  text: string;
  /** Seconds into the film where the voice starts and stops, measured on the voice stems. */
  start: number;
  end: number;
}

export interface SpeedStep {
  /** Source seconds in clip2_take1.mp4. */
  from: number;
  to: number;
  /** Playback speed, 1 = real time. */
  speed: number;
  note: string;
}

export interface DescribedHold {
  id: string;
  /** The film second where the picture freezes. The film's own sound pauses too, and the description plays alone. */
  at: number;
  /** For how long. */
  seconds: number;
  why: string;
}

export interface DescribedLine {
  id: string;
  /** What the describer says. */
  text: string;
  /** The film second where the line starts. */
  filmAt: number;
  /** Where the line falls in the described version (which is longer than the film by its holds), in seconds. */
  start: number;
  end: number;
}

/** The extended audio-described version of the film (WCAG 1.2.5): the film with its picture held, here and there, while a voice describes it. */
export interface DescribedFilm extends VideoAsset {
  md5: string;
  /** Its own captions: the film's, with each cue moved by the holds before it. */
  captions: { src: string; bytes: number; type: 'text/vtt'; language: string; label: string };
  holds: DescribedHold[];
  lines: DescribedLine[];
  /** The film's voice cues as they fall in the described version, each with its quarter-second hold: no line may overlap one. */
  cues: { id: string; start: number; end: number }[];
  loudness: { integrated: number; truePeak: number };
  voice: { tool: string; voice: string; kreaJob: string; madeOn: string; take: string; takeMd5: string };
}

export interface FilmMedia {
  film: VideoAsset & { md5: string };
  described: DescribedFilm;
  captions: { src: string; bytes: number; type: 'text/vtt'; language: string; label: string; lines: CaptionLine[] };
  /** Player posters, widest first. Frame 0 of the film. */
  posters: ImageAsset[];
  hero: {
    /** The silent square clip: the pile lifts and snaps into one column, then stops. */
    clip: VideoAsset & { frames: number; crf: number };
    /** The clip's first frame, smallest first. Shown with no JavaScript. */
    pile: ImageAsset[];
    /** The clip's last frame, smallest first. Shown under reduced motion. */
    column: ImageAsset[];
    cut: {
      from: string;
      crop: { w: number; h: number; x: number; y: number };
      scaledTo: number;
      grade: string;
      speedMap: SpeedStep[];
    };
  };
  provenance: {
    madeOn: string;
    madeFor: string;
    footage: string;
    voice: string;
    music: string;
    thirdPartyFootage: boolean;
    realPeople: boolean;
    aiGenerated: true;
    source: string;
    siteCut: string;
    rebuild: string;
  };
}

export const filmMedia: FilmMedia = ${emit(manifest)};
`;
mkdirSync(dirname(MEDIA_TS), { recursive: true });
writeFileSync(MEDIA_TS, tsFile);
console.log(`wrote ${repoPath(MEDIA_TS)}`);

// ---------------------------------------------------------------- 8. QA sheets (only with --qa-dir)
if (QA_DIR) {
  mkdirSync(QA_DIR, { recursive: true });
  const last = heroFrames - 1;

  // Contact sheet: every 0.25 s of the hero clip (6 frames), plus the last frame, with timestamps.
  const stampText = FONT ? `drawtext=fontfile='${FONT}':text='%{pts\\:hms}':x=5:y=h-24:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=3` : null;
  const step = HERO.fps / 4;
  const cells = Math.floor(last / step) + 2;
  const cols = 4;
  ffmpeg([
    '-i', HERO_CLIP, '-fps_mode', 'passthrough',
    '-vf', chain(`select='not(mod(n\\,${step}))+eq(n\\,${last})'`, 'scale=300:300:flags=lanczos', stampText, `tile=${cols}x${Math.ceil(cells / cols)}:padding=2:color=black`),
    '-frames:v', '1', join(QA_DIR, 'hero-contact-sheet.png'),
  ]);

  // Grade match: hero clip frame 0 beside the film at 4.6 s, cropped to the same area (the source crop, in film pixels).
  // The film is the source scaled to 720 wide and centre-cropped to 1280 tall, so the source crop y maps to y*0.9375 - 5.
  const scale = 720 / 768;
  const filmCrop = { y: Math.round(crop.y * scale - (768 * (1376 / 768) * scale - 1280) / 2), h: Math.round(crop.h * scale) };
  ffmpeg([
    '-i', HERO_CLIP, '-ss', String(QA_FILM_SECONDS), '-i', FILM,
    '-filter_complex',
    `[0:v]select=eq(n\\,0),scale=${size}:${size}${label('hero clip, first frame') ? ',' + label('hero clip, first frame') : ''}[l];` +
      `[1:v]crop=720:${filmCrop.h}:0:${filmCrop.y},scale=${size}:${size}:flags=lanczos${label(`film at ${QA_FILM_SECONDS} s`) ? ',' + label(`film at ${QA_FILM_SECONDS} s`) : ''}[r];` +
      '[l][r]hstack',
    '-frames:v', '1', join(QA_DIR, 'grade-match.png'),
  ]);
  // Mean colour of the lower 60% of each (the film's top carries the speech bubbles).
  const meanRgb = (inputArgs, vf) => [...run('ffmpeg', ['-v', 'error', ...inputArgs, '-vf', vf, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { binary: true })];
  const heroMean = meanRgb(['-i', HERO_CLIP], `select=eq(n\\,0),${TO_RGB},crop=${size}:${size * 0.6}:0:${size * 0.4},scale=1:1:flags=area`);
  const filmMean = meanRgb(['-ss', String(QA_FILM_SECONDS), '-i', FILM], `${TO_RGB},crop=720:${Math.round(filmCrop.h * 0.6)}:0:${filmCrop.y + Math.round(filmCrop.h * 0.4)},scale=1:1:flags=area`);
  writeFileSync(join(QA_DIR, 'grade-match.txt'), `Mean RGB, lower 60% of the crop.\nhero clip frame 0 : ${heroMean.join(', ')}\nfilm at ${QA_FILM_SECONDS} s     : ${filmMean.join(', ')}\nFilm crop used: x=0 y=${filmCrop.y} 720x${filmCrop.h}\n`);

  // Captions sheet: a table of cues against measured regions, and the film's waveform with both drawn on a 30 s axis.
  const rows = cues.map((c, i) => {
    const v = vttCues[i];
    return `| ${c.id} | ${c.start.toFixed(3)} | ${c.end.toFixed(3)} | ${stamp(v.start)} | ${stamp(v.end)} | ${v.lines.join(' / ')} |`;
  });
  writeFileSync(
    join(QA_DIR, 'captions-sheet.md'),
    `# Captions against the measured voice\n\n| Line | Voice start | Voice end | Cue start | Cue end | Cue text |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`,
  );
  const W = 1800;
  const x = (t) => Math.round((t / FILM_DURATION) * W);
  const boxes = cues.flatMap((c) => [
    `drawbox=x=${x(c.start)}:y=0:w=${Math.max(1, x(c.end) - x(c.start))}:h=240:color=0x30d060@0.35:t=fill`,
    `drawbox=x=${x(c.cueStart)}:y=250:w=${Math.max(1, x(c.cueEnd) - x(c.cueStart))}:h=36:color=0xffd040@0.9:t=fill`,
    FONT ? `drawtext=fontfile='${FONT}':text='${c.id}':x=${x(c.start)}:y=262:fontsize=16:fontcolor=black` : null,
  ]);
  ffmpeg([
    '-i', FILM, '-filter_complex',
    `[0:a]aformat=channel_layouts=mono,showwavespic=s=${W}x240:colors=white[w];[w]pad=${W}:300:0:0:color=0x101018,${chain(...boxes)}`,
    '-frames:v', '1', join(QA_DIR, 'captions-sheet.png'),
  ]);
  console.log(`QA sheets in ${QA_DIR}`);
}

console.log(`\nAll ${guards.length} guards passed${warnings.length ? `, ${warnings.length} warning(s)` : ''}.`);
