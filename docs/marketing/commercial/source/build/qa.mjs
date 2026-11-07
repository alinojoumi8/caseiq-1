// QA outputs for out/caseiq-10s-v1.mp4 -> out/qa/
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { BUILD, OUT, QA, FRAMES, FPS, NFRAMES, ffmpeg, run, measureLoudness, loadConfig, pngColorType } from "./lib.mjs";

const cfg = loadConfig();
const mp4 = path.join(OUT, cfg.outName || "caseiq-10s-v2.mp4");
if (!fs.existsSync(mp4)) throw new Error("build the video first");
fs.copyFileSync("C:/Windows/Fonts/consola.ttf", path.join(BUILD, "consola.ttf"));
const idxOf = (t) => Math.min(NFRAMES - 1, Math.round(t * FPS));

// ---------------- regression guards (the 7.5 s bare-footage flash: mixed rgba/rgb24 overlay PNGs made ffmpeg reinit its graph)
const fails = [];
const log = [];
for (let i = 0; i < NFRAMES; i++) {
  const p = path.join(FRAMES, `f_${String(i).padStart(4, "0")}.png`);
  if (!fs.existsSync(p) || fs.statSync(p).size < 500) { fails.push("overlay PNG missing/empty: " + p); continue; }
  if (pngColorType(p) !== 6) fails.push("overlay PNG not RGBA: " + p);
}
const rawOut = (vf, pix) => spawnSync("ffmpeg", ["-v", "error", "-i", mp4, "-vf", vf, "-f", "rawvideo", "-pix_fmt", pix, "-"], { maxBuffer: 1 << 27 }).stdout;
const luma = rawOut("scale=1:1:flags=area", "gray");
const bot = rawOut("crop=1080:460:0:1460,scale=1:1:flags=area", "rgb24");
if (luma.length !== NFRAMES || bot.length !== NFRAMES * 3) fails.push(`decoded frame count ${luma.length}, expected ${NFRAMES}`);
const first = Math.ceil((cfg.t.endCard + 0.3) * FPS - 1e-6);
const G = [242, 242, 245];
let maxJump = 0, maxDev = 0;
for (let i = 1; i < luma.length; i++) {
  const jump = Math.abs(luma[i] - luma[i - 1]);
  if (i >= first) {
    maxJump = Math.max(maxJump, jump);
    if (jump >= 40) fails.push(`luminance jump ${jump} at frame ${i} (${(i / FPS).toFixed(3)} s)`);
    const dev = Math.max(...[0, 1, 2].map((c) => Math.abs(bot[i * 3 + c] - G[c])));
    maxDev = Math.max(maxDev, dev);
    if (dev > 6) fails.push(`bottom area not ground colour at frame ${i}: rgb ${[...bot.subarray(i * 3, i * 3 + 3)]}`);
  }
  if (jump >= 15) log.push(`  jump ${jump} luma at frame ${i} (${(i / FPS).toFixed(3)} s)  mean luma ${luma[i - 1]} -> ${luma[i]}`);
}
log.unshift(`guards: frames from ${first} (${(first / FPS).toFixed(3)} s) to ${NFRAMES - 1}; max luma jump after endCard+0.30 = ${maxJump}; max bottom-area deviation from ground (242,242,245) = ${maxDev}`,
  "per-frame mean-luminance jumps >= 15 over the whole film (cuts and the ground rise are expected before the guard window):");
log.push(fails.length ? "FAIL:\n  " + fails.join("\n  ") : "PASS: 240 overlay PNGs present, non-empty, all RGBA; bottom area is ground colour and no luminance jump >= 40 after endCard+0.30 s");
fs.writeFileSync(path.join(QA, "guards.txt"), log.join("\n") + "\n");
console.log(log.join("\n"));
if (fails.length) { console.error("QA GUARD FAILED"); process.exitCode = 1; }

// full-size frames
const times = [0.0, 4.17, 5.8, 6.4, 7.15, 7.6, 8.4, 9.95];
for (const t of times) {
  const name = `frame_${t.toFixed(2).replace(".", "_")}s.png`;
  ffmpeg(["-i", mp4, "-vf", `select=eq(n\\,${idxOf(t)})`, "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, name)]);
}
ffmpeg(["-i", mp4, "-vf", `select=eq(n\\,${NFRAMES - 1})`, "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, "poster.png")]);

// 24 fps strips of the artifact zone and the card lift
const strip = (t0, t1, cols, name, w = 216, h = 384) => {
  const a = Math.round(t0 * FPS), b = Math.round(t1 * FPS), n = b - a + 1, rows = Math.ceil(n / cols);
  ffmpeg(["-i", mp4, "-vf",
    `select=between(n\\,${a}\\,${b}),scale=${w}:${h}:flags=lanczos,drawtext=fontfile=consola.ttf:text='%{pts\\:hms}':x=4:y=h-20:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.65,tile=${cols}x${rows}:padding=2:color=black`,
    "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, name)], { cwd: BUILD });
};
strip(3.9, 4.5, 5, "strip_3_9-4_5s_artifact.png", 270, 480);
strip(5.3, 6.3, 5, "strip_5_3-6_3s_card_lift.png");
strip(6.9, 7.8, 6, "strip_6_9-7_8s_endcard_build.png", 180, 320);

// contact sheet: every 0.5 s, 20 tiles, 5 columns, 216x384, timestamp burned in
const step = Math.round(FPS * 0.5);
ffmpeg(["-i", mp4, "-vf",
  `scale=216:384:flags=lanczos,drawtext=fontfile=consola.ttf:text='%{pts\\:hms}':x=6:y=h-24:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=3,` +
  `select=not(mod(n\\,${step})),tile=5x4:padding=0`,
  "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, "contact_sheet.png")], { cwd: BUILD });

// loudness
const L = measureLoudness(mp4);
fs.writeFileSync(path.join(QA, "ebur128.txt"), L.summary + "\n");
// spectrogram of the final mix
ffmpeg(["-i", mp4, "-vn", "-lavfi", "showspectrumpic=s=1400x600:legend=1:scale=log:fscale=log:stop=16000", path.join(QA, "final_mix_spectrogram.png")]);
// ffprobe
const probe = (args) => spawnSync("ffprobe", ["-v", "error", ...args, mp4], { encoding: "utf8" }).stdout;
fs.writeFileSync(path.join(QA, "ffprobe.txt"),
  "== format\n" + probe(["-show_entries", "format=duration,size,bit_rate,format_name", "-of", "default=nw=1"]) +
  "\n== video (counted frames)\n" + probe(["-count_frames", "-select_streams", "v:0", "-show_entries", "stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,duration,color_space,color_primaries,color_transfer,color_range", "-of", "default=nw=1"]) +
  "\n== audio\n" + probe(["-select_streams", "a:0", "-show_entries", "stream=codec_name,sample_rate,channels,channel_layout,bit_rate,duration", "-of", "default=nw=1"]) +
  "\n== moov position (faststart)\n" + (() => { const b = fs.readFileSync(mp4); return `moov at byte ${b.indexOf("moov")}, mdat at byte ${b.indexOf("mdat")}\n`; })());
console.log(fs.readFileSync(path.join(QA, "ffprobe.txt"), "utf8"));
console.log("loudness:", { I: L.I, LRA: L.LRA, TP: L.TP });
