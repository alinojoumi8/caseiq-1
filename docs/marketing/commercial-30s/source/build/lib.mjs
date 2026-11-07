// Shared helpers for the Case IQ 30 s spot pipeline.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const BUILD = path.dirname(fileURLToPath(import.meta.url));
export const W = path.resolve(BUILD, "..");            // the source folder (footage/, audio/, build/ live here)
// --out-dir / --tmp-dir (or CASEIQ_OUT / CASEIQ_TMP) redirect the outputs and the scratch space; defaults: source/out and source/build/tmp
function opt(flag, env, dflt) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return path.resolve(process.argv[i + 1]);
  if (process.env[env]) return path.resolve(process.env[env]);
  return dflt;
}
export const REPO = process.env.CASEIQ_REPO ? path.resolve(process.env.CASEIQ_REPO) : path.resolve(W, "..", "..", "..", "..");   // repo root (docs/marketing/commercial-30s/source -> 4 up)
export const OUT = opt("--out-dir", "CASEIQ_OUT", path.join(W, "out"));
// --cut site (or CASEIQ_CUT=site) renders the cut made for the website: the same film, but the end card has no drawn "Get my case in order"
// button (nobody can press it; the site puts a real one under the film) and its fine print gains the AI line. The default cut is the ad.
export const CUT = (() => {
  const i = process.argv.indexOf("--cut");
  const v = i >= 0 ? process.argv[i + 1] : process.env.CASEIQ_CUT || "default";
  if (v !== "default" && v !== "site") throw new Error(`--cut is "default" or "site", not "${v}"`);
  return v;
})();
const _cfg0 = JSON.parse(fs.readFileSync(path.join(BUILD, "config.json"), "utf8"));
export const QA = path.join(OUT, _cfg0.qaDir || "qa");
export const TMP = opt("--tmp-dir", "CASEIQ_TMP", path.join(BUILD, "tmp"));
export const FRAMES = path.join(TMP, "frames");          // overlay RGBA PNGs, 720x1280
export const FPS = _cfg0.fps || 24;
export const NFRAMES = _cfg0.nFrames || 720;
export const DURATION = NFRAMES / FPS;
export const SIZE = _cfg0.size;
export const DESIGN = { w: 1080, h: 1920 };
export const SCALE = SIZE.w / DESIGN.w;                 // 2/3
for (const d of [OUT, QA, FRAMES, TMP]) fs.mkdirSync(d, { recursive: true });

/** cubic-bezier(x1,y1,x2,y2) easing by bisection. */
export function bezier(x1, y1, x2, y2) {
  const bx = (u) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
  const by = (u) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; (bx(m) < x) ? (lo = m) : (hi = m); }
    return by((lo + hi) / 2);
  };
}
export const ease = bezier(0.22, 1, 0.36, 1);          // the site's ease-out
export const easeInOut = bezier(0.45, 0, 0.55, 1);

export function loadConfig() {
  const cfg = JSON.parse(fs.readFileSync(path.join(BUILD, "config.json"), "utf8"));
  if (CUT !== "default") cfg.outName = cfg.cuts[CUT].outName;
  // picture segments with cumulative P start
  let acc = 0;
  cfg.pic = cfg.picture.map((s) => { const o = { ...s, p0: acc, p1: acc + s.outDuration }; acc += s.outDuration; return o; });
  cfg.pictureTotal = acc;
  if (Math.abs(acc - DURATION) > 1e-3) throw new Error(`picture map totals ${acc} s, expected ${DURATION}`);
  const o = cfg.overlay;
  cfg.t = {
    bubble: o.bubbles, shiftLead: o.shiftLead, shiftDur: o.shiftDur, exitExtra: o.exitExtra,
    scrimOn: o.scrimOn, panelIn: o.panelIn, panelOut: o.panelOut, rows: o.rows, rowGrow: o.rowGrow,
    endCard: o.endCard, wordmark: o.wordmark, price: o.price, pill: o.pill, endExit: o.endExit, endPanelLag: o.endPanelLag,
  };
  cfg.overlayCfg = { cut: CUT, t: cfg.t, T0: o.T0, scrimAlpha: o.scrimAlpha, scrimFade: o.scrimFade, gradAlpha: o.gradAlpha,
    panelScale0: o.panelScale0, liftFrom: o.liftFrom, panelGap: o.panelGap, endPanelTop: CUT === "site" ? cfg.cuts.site.endPanelTop : o.endPanelTop };
  cfg.clipPaths = Object.fromEntries(Object.entries(cfg.clips).map(([k, v]) => [k, path.resolve(W, v)]));
  return cfg;
}

/** Which picture segment and source frame does output frame k show? */
export function frameSource(cfg, k) {
  const t = k / FPS + 1e-9;
  const s = cfg.pic.find((x) => t >= x.p0 && t < x.p1) || cfg.pic[cfg.pic.length - 1];
  if (s.holdFrame != null) return { clip: s.clip, frame: s.holdFrame, seg: s.name, hold: true };
  const st = s.srcStart + (t - s.p0) * ((s.srcEnd - s.srcStart) / s.outDuration);
  return { clip: s.clip, frame: Math.max(0, Math.round(st * FPS)), seg: s.name, srcT: st };
}

/** Camera window in source pixels (768x1376) for output frame k: {x0,y0,x1,y1}. */
export function cameraBox(cfg, k, srcW = 768, srcH = 1376) {
  const t = k / FPS;
  const ar = SIZE.w / SIZE.h;
  const baseW = srcW, baseH = srcW / ar;                // fit to width, centre-crop height
  let z = 1, cx = srcW / 2, cy = srcH / 2;
  const h = cfg.camera.hook;
  if (t < h.dur) {
    const p = ease(t / h.dur);
    z = h.zoom + (1 - h.zoom) * p; cx = h.cx + (srcW / 2 - h.cx) * p; cy = h.cy + (srcH / 2 - h.cy) * p;
  }
  const th = cfg.camera.thud;
  if (th) { const x = (t - th.at) / (th.frames / FPS); if (x >= 0 && x < 1) z *= 1 + th.amp * Math.sin(Math.PI * x); }
  const pu = cfg.camera.push;
  if (t >= pu.from) { const q = Math.min(1, (t - pu.from) / (pu.to - pu.from)); z = 1 + (pu.zoom - 1) * easeInOut(q); }
  const w = baseW / z, hh = baseH / z;
  const x0 = Math.min(srcW - w, Math.max(0, cx - w / 2));
  const y0 = Math.min(srcH - hh, Math.max(0, cy - hh / 2));
  return { x0, y0, x1: x0 + w, y1: y0 + hh, z };
}

/** PNG colour type from the IHDR: 6 = RGBA, 2 = RGB (no alpha). */
export function pngColorType(file) {
  const fd = fs.openSync(file, "r"); const b = Buffer.alloc(26); fs.readSync(fd, b, 0, 26, 0); fs.closeSync(fd);
  return b[25];
}
export function pngSize(file) {
  const fd = fs.openSync(file, "r"); const b = Buffer.alloc(24); fs.readSync(fd, b, 0, 24, 0); fs.closeSync(fd);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
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

/** Run a program; throws with stderr on failure. */
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.slice(0, 12).join(" ")} ...\n${(r.stderr || "").slice(-3000)}`);
  }
  return r;
}
export const ffmpeg = (args, opts) => run("ffmpeg", ["-hide_banner", "-y", "-v", "error", ...args], opts);
export const python = (args, opts = {}) => run("python", ["-I", ...args], { ...opts, env: { ...process.env, CASEIQ_TMP: TMP, CASEIQ_OUT: OUT } });

/** Integrated loudness + true peak of an audio/video file via ebur128. */
export function measureLoudness(file, pre = "") {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", `${pre}${pre ? "," : ""}ebur128=peak=true`, "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 1 << 28 },
  );
  const s = r.stderr.split("Summary:").pop();
  const num = (re) => { const m = s.match(re); return m ? parseFloat(m[1]) : NaN; };
  return {
    I: num(/I:\s+(-?[\d.]+|-inf)\s+LUFS/),
    LRA: num(/LRA:\s+(-?[\d.]+)\s+LU/),
    TP: num(/Peak:\s+(-?[\d.]+|-inf)\s+dBFS/),
    summary: s.trim(),
  };
}
