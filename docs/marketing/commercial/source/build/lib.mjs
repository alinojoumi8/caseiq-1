// Shared helpers for the Case IQ commercial pipeline.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const BUILD = path.dirname(fileURLToPath(import.meta.url));
export const COMM = path.resolve(BUILD, "..");
export const OUT = path.join(COMM, "out");
export const FRAMES = path.join(BUILD, "frames");
export const TMP = path.join(BUILD, "tmp");
const _cfg0 = JSON.parse(fs.readFileSync(path.join(BUILD, "config.json"), "utf8"));
export const QA = path.join(OUT, _cfg0.qaDir || "qa");
export const FPS = _cfg0.fps || 24;
export const DURATION = 10;
export const NFRAMES = Math.round(FPS * DURATION);
for (const d of [OUT, QA, FRAMES, TMP]) fs.mkdirSync(d, { recursive: true });

/** cubic-bezier(0.22,1,0.36,1) ease-out, same curve as the overlay. */
export function ease(x) {
  const [x1, y1, x2, y2] = [0.22, 1, 0.36, 1];
  const bx = (u) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
  const by = (u) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  if (x <= 0) return 0; if (x >= 1) return 1;
  let lo = 0, hi = 1;
  for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; (bx(m) < x) ? (lo = m) : (hi = m); }
  return by((lo + hi) / 2);
}

/** Camera at output time t: zoom and centre in 1080x1920 frame space (hook crop easing out, then push-in to the end card). */
export function cameraAt(cfg, t) {
  const h = cfg.camera.hook;
  let z = 1, cx = 540, cy = 960;
  if (t < h.dur) {
    const p = ease(t / h.dur);
    z = h.zoom + (1 - h.zoom) * p; cx = h.cx + (540 - h.cx) * p; cy = h.cy + (960 - h.cy) * p;
  }
  if (t > cfg.t.landing) {
    const q = Math.min(1, (t - cfg.t.landing) / (cfg.t.endCard - cfg.t.landing));
    z = 1 + (cfg.camera.pushZoom - 1) * q;
  }
  return { z, cx, cy };
}

/** PNG colour type from the IHDR: 6 = RGBA, 2 = RGB (no alpha). */
export function pngColorType(file) {
  const fd = fs.openSync(file, "r"); const b = Buffer.alloc(26); fs.readSync(fd, b, 0, 26, 0); fs.closeSync(fd);
  return b[25];
}
/** Chromium writes opaque screenshots without an alpha channel; a mid-sequence format change makes ffmpeg
 *  reinitialise its filter graph and drop frames. Force every overlay frame to RGBA. Returns how many were converted. */
export function normaliseFramesToRgba(dir) {
  let n = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".png"))) {
    const p = path.join(dir, f);
    if (pngColorType(p) === 6) continue;
    const tmp = p + ".rgba.png";
    const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", p, "-frames:v", "1", "-pix_fmt", "rgba", tmp], { encoding: "utf8" });
    if (r.status !== 0) throw new Error("rgba convert failed: " + p + r.stderr);
    fs.renameSync(tmp, p); n++;
  }
  return n;
}

/** Output-timeline time (s) of a source time, through the speed map. */
export function mapSrcToOut(speedMap, s) {
  let acc = 0;
  for (const seg of speedMap) {
    if (s <= seg.srcStart) return acc;
    if (s < seg.srcEnd) return acc + ((s - seg.srcStart) / (seg.srcEnd - seg.srcStart)) * seg.outDuration;
    acc += seg.outDuration;
  }
  return acc;
}

export function loadConfig() {
  const cfg = JSON.parse(fs.readFileSync(path.join(BUILD, "config.json"), "utf8"));
  const e = cfg.events;
  const landing = mapSrcToOut(cfg.footage.speedMap, cfg.footage.landingSrc);
  cfg.t = {
    bubble1: e.bubble1,
    bubble2: e.bubble2,
    landing: +landing.toFixed(3),
    card: +(landing + e.cardAfterLanding).toFixed(3),
    endCard: e.endCard,
    price: e.price,
    wordmark: e.wordmark,
    pill: e.pill,
  };
  cfg.footageTotalOut = cfg.footage.speedMap.reduce((a, s) => a + s.outDuration, 0);
  if (cfg.music.onsetAt == null)
    cfg.music.onsetAt = +mapSrcToOut(cfg.footage.speedMap, cfg.footage.flightSrc).toFixed(3);
  const L = cfg.voice.lines;
  L.forEach((l, i) => {
    if (l.placeAt == null) l.placeAt = i === 2 ? cfg.t.line : 0;
  });
  cfg.footagePathAbs = cfg.footage.path
    ? path.resolve(COMM, cfg.footage.path)
    : null;
  return cfg;
}

/** Run a program; throws with stderr on failure. */
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.slice(0, 12).join(" ")} ...\n${(r.stderr || "").slice(-3000)}`);
  }
  return r;
}
export const ffmpeg = (args, opts) => run("ffmpeg", ["-hide_banner", "-y", "-v", "error", ...args], opts);

/** Integrated loudness + true peak of an audio/video file via ebur128. */
export function measureLoudness(file, pre = "") {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", `${pre}${pre ? "," : ""}ebur128=peak=true`, "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 1 << 28 },
  );
  const s = r.stderr.split("Summary:").pop();
  const num = (re) => {
    const m = s.match(re);
    return m ? parseFloat(m[1]) : NaN;
  };
  return {
    I: num(/I:\s+(-?[\d.]+|-inf)\s+LUFS/),
    LRA: num(/LRA:\s+(-?[\d.]+)\s+LU/),
    TP: num(/Peak:\s+(-?[\d.]+|-inf)\s+dBFS/),
    summary: s.trim(),
  };
}

/** atempo chain for any factor (atempo accepts 0.5..2.0 only). */
export function atempoChain(f) {
  const parts = [];
  while (f > 2.0) { parts.push("atempo=2.0"); f /= 2.0; }
  while (f < 0.5) { parts.push("atempo=0.5"); f /= 0.5; }
  parts.push(`atempo=${f.toFixed(6)}`);
  return parts.join(",");
}
