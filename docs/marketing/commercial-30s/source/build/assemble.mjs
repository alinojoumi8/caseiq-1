// Builds out/caseiq-30s-v1.mp4: footage (one resample per frame) + RGBA overlay frames + mixed audio.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { BUILD, OUT, QA, FRAMES, TMP, NFRAMES, FPS, SIZE, DURATION, loadConfig, ffmpeg, run, python, measureLoudness, pngColorType, pngSize, frameSource, cameraBox } from "./lib.mjs";

const cfg = loadConfig();
const A = path.join(TMP, "audio");
fs.mkdirSync(A, { recursive: true });
const report = {};

let videoOnly;
{
// ---------------------------------------------------------------- VIDEO
// 1) decode each clip to RGB PNGs at native size (bt709 limited-range -> full-range RGB; no scaling)
const SRC = path.join(TMP, "src");
const nFramesOf = {};
for (const [id, p] of Object.entries(cfg.clipPaths)) {
  if (!fs.existsSync(p)) throw new Error("clip missing: " + p);
  const d = path.join(SRC, id); fs.mkdirSync(d, { recursive: true });
  const have = fs.readdirSync(d).filter((f) => f.endsWith(".png")).length;
  const probe = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames,width,height", "-of", "csv=p=0", p]).stdout.trim().split(",");
  const [w, h, n] = probe.map(Number);
  if (w !== 768 || h !== 1376) throw new Error(`${id} is ${w}x${h}, expected 768x1376`);
  nFramesOf[id] = n;
  const stamp = path.join(d, ".done"); const mtime = fs.statSync(p).mtimeMs;
  if (have === n && fs.existsSync(stamp) && +fs.readFileSync(stamp, "utf8") === mtime) continue;
  console.log(`decoding ${id} (${n} frames) ...`);
  for (const f of fs.readdirSync(d)) if (f.endsWith(".png")) fs.unlinkSync(path.join(d, f));
  ffmpeg(["-i", p, "-map", "0:v:0", "-fps_mode", "passthrough", "-vf", "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24",
    "-compression_level", "1", path.join(d, "s_%04d.png")]);
  fs.writeFileSync(stamp, String(mtime));
}
// 2) frame list: which source frame + which camera window for every output frame
const frames = [], frameMap = [];
for (let k = 0; k < NFRAMES; k++) {
  const s = frameSource(cfg, k);
  if (s.frame >= nFramesOf[s.clip]) s.frame = nFramesOf[s.clip] - 1;
  const b = cameraBox(cfg, k);
  frames.push({ k, clip: s.clip, frame: s.frame, box: [b.x0, b.y0, b.x1, b.y1] });
  frameMap.push({ k, t: +(k / FPS).toFixed(4), seg: s.seg, clip: s.clip, srcFrame: s.frame, zoom: +b.z.toFixed(4) });
}
fs.writeFileSync(path.join(OUT, "frame_map.json"), JSON.stringify({ outFps: FPS, frameMap }));
const BG = path.join(TMP, "bg");
fs.mkdirSync(BG, { recursive: true });
fs.writeFileSync(path.join(TMP, "frames.json"), JSON.stringify({ size: [SIZE.w, SIZE.h], src: Object.fromEntries(Object.keys(cfg.clips).map((id) => [id, path.join(SRC, id)])), frames }));
console.log("rendering background frames (single lanczos resample each) ...");
python([path.join(BUILD, "footage.py"), path.join(TMP, "frames.json"), BG], { stdio: "inherit" });

// colour grade on the night footage only (clips 1 and 2 and the held frame), under the overlays
const BGG = path.join(TMP, "bg_graded");
fs.mkdirSync(BGG, { recursive: true });
const nNight = Math.ceil(cfg.grade.nightUntil * FPS - 1e-6);
console.log(`grading ${nNight} night frames: ${cfg.grade.filter}`);
ffmpeg(["-framerate", String(FPS), "-i", path.join(BG, "r_%04d.png"), "-frames:v", String(nNight),
  "-vf", `format=gbrp,${cfg.grade.filter},format=rgb24`, "-compression_level", "1", path.join(BGG, "r_%04d.png")]);
for (let k = nNight; k < NFRAMES; k++) fs.copyFileSync(path.join(BG, `r_${String(k + 1).padStart(4, "0")}.png`), path.join(BGG, `r_${String(k + 1).padStart(4, "0")}.png`));
report.grade = { filter: cfg.grade.filter, nightFrames: nNight };

{ // guard: all overlay frames present, non-empty, RGBA, final size
  for (let i = 0; i < NFRAMES; i++) {
    const p = path.join(FRAMES, `f_${String(i).padStart(4, "0")}.png`);
    if (!fs.existsSync(p) || fs.statSync(p).size < 500) throw new Error("missing/empty overlay frame " + p);
    if (pngColorType(p) !== 6) throw new Error("overlay frame not RGBA (would reinit ffmpeg graph): " + p);
    const s = pngSize(p);
    if (s.w !== SIZE.w || s.h !== SIZE.h) throw new Error(`overlay frame ${p} is ${s.w}x${s.h}`);
  }
}
videoOnly = path.join(TMP, "video_only.mp4");
console.log("encoding video ...");
ffmpeg([
  "-framerate", String(FPS), "-i", path.join(BGG, "r_%04d.png"),
  "-framerate", String(FPS), "-i", path.join(FRAMES, "f_%04d.png"),
  "-filter_complex",
  "[0:v]format=gbrp[bg];[bg][1:v]overlay=format=gbrp:eof_action=pass[ov];" +
  "[ov]scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p[vout]",
  "-map", "[vout]", "-frames:v", String(NFRAMES), "-r", String(FPS),
  "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-an", videoOnly,
]);

}

// ---------------------------------------------------------------- AUDIO
console.log("building audio stems ...");
python([path.join(BUILD, "audio.py")], { stdio: "inherit" });
const placements = JSON.parse(fs.readFileSync(path.join(A, "placements.json"), "utf8"));
const wav = (n) => path.join(A, n);

// two-pass loudnorm to I=-14, TP<=-1 (retry with a lower TP target if the AAC encode overshoots)
const jsonOf = (stderr) => JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1));
const { I, LRA } = cfg.master;
let tpTarget = cfg.master.TP, finalAudio, passInfo;
for (let attempt = 0; attempt < 5; attempt++) {
  const p1 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", wav("premaster.wav"), "-af",
    `loudnorm=I=${I}:TP=${tpTarget}:LRA=${LRA}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const m = jsonOf(p1.stderr);
  const p2af = `loudnorm=I=${I}:TP=${tpTarget}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:` +
    `measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
  const p2 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-y", "-i", wav("premaster.wav"), "-af", `${p2af},aresample=48000,apad=whole_dur=${DURATION},atrim=0:${DURATION}`,
    "-ar", "48000", "-c:a", "pcm_s24le", wav("master.wav")], { encoding: "utf8" });
  const o = jsonOf(p2.stderr);
  finalAudio = path.join(TMP, "audio_final.m4a");
  ffmpeg(["-i", wav("master.wav"), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", finalAudio]);
  const lm = measureLoudness(finalAudio);
  passInfo = { attempt, tpTarget, pass1: m, pass2: o, encoded: { I: lm.I, LRA: lm.LRA, TP: lm.TP } };
  if (lm.TP <= -1.0 && Math.abs(lm.I - I) <= 0.5) break;
  tpTarget = +(tpTarget - 0.4).toFixed(1);
}
report.master = passInfo;
report.stems = placements.levels;

// ---------------------------------------------------------------- MUX
const outMp4 = path.join(OUT, cfg.outName);
ffmpeg(["-i", videoOnly, "-i", finalAudio, "-map", "0:v", "-map", "1:a", "-c", "copy", "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0", "-t", String(DURATION), "-movflags", "+faststart", outMp4]);
fs.writeFileSync(path.join(OUT, "audio_report.json"), JSON.stringify({ ...report, placements }, null, 2));
console.log("built", outMp4);
console.log(JSON.stringify({ stems: report.stems, master: report.master.encoded, tpTarget: report.master.tpTarget }, null, 1));
