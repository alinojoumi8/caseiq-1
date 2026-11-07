// Builds out/caseiq-10s-v1.mp4 from footage + overlay frames + voiceover + music (+ native paper sounds).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { COMM, BUILD, OUT, QA, FRAMES, TMP, NFRAMES, FPS, loadConfig, ffmpeg, run, measureLoudness, atempoChain, pngColorType, cameraAt } from "./lib.mjs";

const cfg = loadConfig();
const A = path.join(TMP, "audio");
fs.mkdirSync(A, { recursive: true });
const f2 = (x) => (+x).toFixed(4);
const ms = (s) => Math.round(s * 1000);
const report = { derived: { t: cfg.t, musicOnsetAt: cfg.music.onsetAt, footageTotalOut: cfg.footageTotalOut } };

// ---------------------------------------------------------------- VIDEO
const segs = cfg.footage.speedMap;
if (!cfg.footagePathAbs || !fs.existsSync(cfg.footagePathAbs)) throw new Error("footage.path missing: " + cfg.footagePathAbs);
const SRC = path.join(TMP, "src"), RET = path.join(TMP, "ret");
for (const d of [SRC, RET]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
const srcFps = (() => {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", cfg.footagePathAbs]).stdout.trim().split("/");
  return +r[0] / (+r[1] || 1);
})();
console.log(`extracting footage frames (source ${srcFps} fps) ...`);
// footage is tagged bt709; scale to width 1080 (lanczos), centre-crop to 1080x1920, to RGB
ffmpeg(["-i", cfg.footagePathAbs, "-map", "0:v:0", "-fps_mode", "passthrough",
  "-vf", "scale=1080:-2:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=tv,crop=1080:1920,format=rgb24",
  path.join(SRC, "s_%04d.png")]);
const nSrc = fs.readdirSync(SRC).length;
const srcPath = (idx1) => path.join(SRC, `s_${String(idx1).padStart(4, "0")}.png`);
const RAW = path.join(TMP, "raw"), ZOOM = path.join(TMP, "zoom");
for (const d of [RAW, ZOOM]) { fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
// which segment is output time t in?
const segAt = (t) => {
  let acc = 0;
  for (const s of segs) {
    if (t < acc + s.outDuration - 1e-9) return { s, acc };
    acc += s.outDuration;
  }
  return null;
};
const link = (a, b) => { try { fs.linkSync(a, b); } catch { fs.copyFileSync(a, b); } };
const frameMap = [];
for (let k = 0; k < NFRAMES; k++) {
  const t = k / FPS, si = segAt(t);
  let file, desc;
  if (!si) { file = srcPath(nSrc); desc = `hold:${nSrc - 1}`; }
  else if (si.s.srcFrames) {
    // explicit frame list (the artifact snap): frame n is source time n/24, file index n+1
    const nF = si.s.srcFrames.length;
    const fr = si.s.srcFrames[Math.min(nF - 1, Math.floor(((t - si.acc) / si.s.outDuration) * nF))];
    if (si.s.blend === "tmix3") {
      file = path.join(RAW, `m_${k}.png`);
      ffmpeg(["-i", srcPath(fr), "-i", srcPath(fr + 1), "-i", srcPath(fr + 2), "-filter_complex", "[0][1][2]mix=inputs=3,format=rgb24", "-frames:v", "1", file]);
      desc = `mix:${fr - 1},${fr},${fr + 1}`;
    } else { file = srcPath(fr + 1); desc = `skip:${fr}`; }
  } else {
    const st = si.s.srcStart + ((t - si.acc) / si.s.outDuration) * (si.s.srcEnd - si.s.srcStart);
    const idx = Math.min(nSrc, Math.max(1, Math.round(st * srcFps) + 1));
    file = srcPath(idx); desc = String(idx - 1);
  }
  frameMap.push(desc);
  link(file, path.join(RET, `r_${String(k + 1).padStart(4, "0")}.png`));
}
fs.writeFileSync(path.join(OUT, "frame_map.json"), JSON.stringify({ srcFps, nSrc, outFps: FPS, snapBlend: segs.find((s) => s.srcFrames)?.blend, frameMap }));
// camera: hook crop easing out + push-in, one frame at a time (scale up, integer crop)
console.log("camera zoom ...");
for (let k = 0; k < NFRAMES; k++) {
  const rin = path.join(RET, `r_${String(k + 1).padStart(4, "0")}.png`), zout = path.join(ZOOM, `r_${String(k + 1).padStart(4, "0")}.png`);
  const c = cameraAt(cfg, k / FPS);
  if (Math.abs(c.z - 1) < 1e-4) { link(rin, zout); continue; }
  const W = Math.round(1080 * c.z), H = Math.round(1920 * c.z);
  const x = Math.min(W - 1080, Math.max(0, Math.round(c.cx * c.z - 540)));
  const y = Math.min(H - 1920, Math.max(0, Math.round(c.cy * c.z - 960)));
  ffmpeg(["-i", rin, "-vf", `scale=${W}:${H}:flags=lanczos,crop=1080:1920:${x}:${y},format=rgb24`, "-frames:v", "1", zout]);
}
{ // guard: all overlay frames present, non-empty, and the same pixel format (rgba)
  for (let i = 0; i < NFRAMES; i++) {
    const p = path.join(FRAMES, `f_${String(i).padStart(4, "0")}.png`);
    if (!fs.existsSync(p) || fs.statSync(p).size < 500) throw new Error("missing/empty overlay frame " + p);
    if (pngColorType(p) !== 6) throw new Error("overlay frame not RGBA (would reinit ffmpeg graph): " + p);
  }
}
const videoOnly = path.join(TMP, "video_only.mp4");
console.log("encoding video ...");
ffmpeg([
  "-framerate", String(FPS), "-i", path.join(ZOOM, "r_%04d.png"),
  "-framerate", String(FPS), "-i", path.join(FRAMES, "f_%04d.png"),
  "-filter_complex",
  "[0:v]format=gbrp[bg];[bg][1:v]overlay=format=gbrp:eof_action=pass[ov];" +
  "[ov]scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p[vout]",
  "-map", "[vout]", "-frames:v", String(NFRAMES), "-r", String(FPS),
  "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-an", videoOnly,
]);

// ---------------------------------------------------------------- AUDIO
const MONO_TO_STEREO = "pan=stereo|c0=c0|c1=c0";
const STEREO = "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo";
const wav = (n) => path.join(A, n);
const FIN = (d) => `afade=t=in:st=0:d=${d}`;

// 1) voiceover stem
const L = cfg.voice.lines, cf = cfg.voice.cutFade;
const vo = L.map((l, i) => {
  const dur = l.to - l.from;
  return `[0:a]atrim=start=${l.from}:end=${l.to},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${cf},afade=t=out:st=${f2(dur - cf)}:d=${cf},` +
    `aresample=48000,${MONO_TO_STEREO},${STEREO},adelay=${ms(l.placeAt)}:all=1[l${i}]`;
});
ffmpeg([
  "-i", path.join(COMM, "audio/vo2.mp3"),
  "-filter_complex", `${vo.join(";")};${L.map((_, i) => `[l${i}]`).join("")}amix=inputs=${L.length}:normalize=0:duration=longest,apad=whole_dur=10,atrim=0:10[o]`,
  "-map", "[o]", "-ar", "48000", wav("vo.wav"),
]);
const voLines = L.map((l) => ({ s: l.placeAt, e: l.placeAt + (l.to - l.from) }));
report.voLines = voLines;

// 2) music stem: part A + part B (onset aligned), ducked under VO
const M = cfg.music;
const preroll = 0.005;
const duck = (() => {
  const a = cfg.voice.duckAttack, r = cfg.voice.duckRelease;
  const env = voLines.map(({ s, e }) => `clip((t-${f2(s - a)})/${a},0,1)*clip((${f2(e + r)}-t)/${r},0,1)`);
  const m = env.reduce((acc, x) => (acc ? `max(${acc},${x})` : x), "");
  return `volume=volume='pow(10,${cfg.voice.duckDb}*${m}/20)':eval=frame`;
})();
ffmpeg([
  "-i", path.join(COMM, "audio/music1.mp3"),
  "-filter_complex",
  `[0:a]atrim=0:${M.partAEnd},asetpts=PTS-STARTPTS,afade=t=out:st=${f2(M.partAEnd - M.partAFade)}:d=${M.partAFade},aresample=48000,${STEREO}[pa];` +
  `[0:a]atrim=start=${f2(M.onsetInSource - preroll)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.003,aresample=48000,${STEREO},adelay=${ms(M.onsetAt - preroll)}:all=1[pb];` +
  `[pa][pb]amix=inputs=2:normalize=0:duration=longest,afade=t=out:st=${f2(M.fadeToSilenceBy - 0.8)}:d=0.8,apad=whole_dur=10,atrim=0:10,asetnsamples=n=64:p=0,${duck}[o]`,
  "-map", "[o]", "-ar", "48000", wav("music_raw.wav"),
]);

// 3) native footage audio (same speed map), only if enabled
let haveNative = false;
const hasAudio = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", cfg.footagePathAbs], { encoding: "utf8" }).stdout.trim();
if (hasAudio) {
  // spectrogram of the native audio alone (for the tonal/speech check)
  ffmpeg(["-i", cfg.footagePathAbs, "-vn", "-ac", "1", "-ar", "22050",
    "-lavfi", "showspectrumpic=s=1400x600:legend=1:scale=log:fscale=log", path.join(QA, "native_audio_spectrogram.png")]);
}
if (hasAudio && cfg.footage.useNativeAudio) {
  haveNative = true;
  const X = cfg.footage.nativeCrossfade;
  // 1x segments keep their audio; compressed segments keep their END-aligned part (no pitch shift);
  // every non-last window is extended by X so the acrossfade overlaps keep the timeline exact.
  const n = segs.map((s, i) => {
    const last = i === segs.length - 1;
    const start = Math.max(0, s.srcEnd - s.outDuration);
    const len = s.outDuration + (last ? 0 : X);
    return `[0:a]atrim=start=${f2(start)}:duration=${f2(len)},asetpts=PTS-STARTPTS,aresample=48000,${STEREO}[n${i}]`;
  });
  let chain = "", prev = "n0";
  for (let i = 1; i < segs.length; i++) { chain += `[${prev}][n${i}]acrossfade=d=${X}:c1=tri:c2=tri[x${i}];`; prev = `x${i}`; }
  const fo = cfg.t.endCard;
  ffmpeg([
    "-i", cfg.footagePathAbs,
    "-filter_complex",
    `${n.join(";")};${chain}[${prev}]highpass=f=${cfg.footage.nativeHighpassHz},afade=t=out:st=${fo}:d=0.5,apad=whole_dur=10,atrim=0:10,${STEREO}[o]`,
    "-map", "[o]", "-ar", "48000", wav("native_raw.wav"),
  ]);
}

// 4) loudness balance: music ~9 LU under VO, native ~6 LU under music
const lVO = measureLoudness(wav("vo.wav"));
const lMu = measureLoudness(wav("music_raw.wav"));
const musicTarget = lVO.I - cfg.voice.musicBelowVoiceLU;
const musicGain = musicTarget - lMu.I;
ffmpeg(["-i", wav("music_raw.wav"), "-af", `volume=${musicGain.toFixed(3)}dB`, wav("music.wav")]);
report.stems = { vo: { I: lVO.I, TP: lVO.TP }, musicRaw: { I: lMu.I }, musicGainDb: +musicGain.toFixed(2), musicTargetI: +musicTarget.toFixed(2) };
const mixInputs = [wav("vo.wav"), wav("music.wav")];
if (haveNative) {
  const lNa = measureLoudness(wav("native_raw.wav"));
  const nTarget = musicTarget - cfg.voice.nativeBelowMusicLU;
  const nGain = nTarget - lNa.I;
  ffmpeg(["-i", wav("native_raw.wav"), "-af", `volume=${nGain.toFixed(3)}dB`, wav("native.wav")]);
  mixInputs.push(wav("native.wav"));
  // soft paper whoosh on the snap: cut from the native audio's own lift whoosh, peak N dB under the native bed peak
  const W = cfg.footage.snapWhoosh;
  if (W) {
    ffmpeg(["-ss", String(W.srcStart), "-t", String(W.dur), "-i", cfg.footagePathAbs, "-vn", "-af",
      `highpass=f=${cfg.footage.nativeHighpassHz},lowpass=f=6000,aresample=48000,${STEREO},afade=t=in:st=0:d=${W.fadeIn},afade=t=out:st=${f2(W.dur - W.fadeOut)}:d=${W.fadeOut}`,
      "-ar", "48000", wav("whoosh_raw.wav")]);
    const wp = measureLoudness(wav("whoosh_raw.wav")).TP, np = measureLoudness(wav("native.wav")).TP;
    const wg = np - W.belowNativePeakDb - wp;
    ffmpeg(["-i", wav("whoosh_raw.wav"), "-af", `volume=${wg.toFixed(3)}dB,adelay=${ms(W.at)}:all=1,apad=whole_dur=10,atrim=0:10`, "-ar", "48000", wav("whoosh.wav")]);
    mixInputs.push(wav("whoosh.wav"));
    report.stems.snapWhoosh = { at: W.at, srcStart: W.srcStart, dur: W.dur, rawPeakDb: wp, nativeStemPeakDb: np, gainDb: +wg.toFixed(2), peakDb: +(wp + wg).toFixed(2) };
  }
  report.stems.native = { rawI: lNa.I, gainDb: +nGain.toFixed(2), targetI: +nTarget.toFixed(2) };
}
report.stems.musicFinalI = measureLoudness(wav("music.wav")).I;
report.stems.nativeIncluded = haveNative;
const inArgs = mixInputs.flatMap((f) => ["-i", f]);
const mixFilter = `${mixInputs.map((_, i) => `[${i}:a]`).join("")}amix=inputs=${mixInputs.length}:normalize=0:duration=longest,apad=whole_dur=10,atrim=0:10[o]`;
ffmpeg([...inArgs, "-filter_complex", mixFilter, "-map", "[o]", "-ar", "48000", wav("premaster.wav")]);

// 5) two-pass loudnorm to I=-14, TP<=-1 (retry with lower TP target if AAC overshoots)
const jsonOf = (stderr) => JSON.parse(stderr.slice(stderr.lastIndexOf("{"), stderr.lastIndexOf("}") + 1));
const { I, LRA } = cfg.master;
let tpTarget = cfg.master.TP, finalAudio, passInfo;
for (let attempt = 0; attempt < 4; attempt++) {
  const p1 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", wav("premaster.wav"), "-af",
    `loudnorm=I=${I}:TP=${tpTarget}:LRA=${LRA}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const m = jsonOf(p1.stderr);
  const p2af = `loudnorm=I=${I}:TP=${tpTarget}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:` +
    `measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
  const p2 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-y", "-i", wav("premaster.wav"), "-af", `${p2af},aresample=48000,apad=whole_dur=10,atrim=0:10`,
    "-ar", "48000", "-c:a", "pcm_s24le", wav("master.wav")], { encoding: "utf8" });
  const o = jsonOf(p2.stderr);
  finalAudio = path.join(TMP, "audio_final.m4a");
  ffmpeg(["-i", wav("master.wav"), "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", finalAudio]);
  const lm = measureLoudness(finalAudio);
  passInfo = { attempt, tpTarget, pass1: m, pass2: o, encoded: { I: lm.I, LRA: lm.LRA, TP: lm.TP } };
  if (lm.TP <= -1.0 && Math.abs(lm.I - I) <= 0.7) break;
  tpTarget = +(tpTarget - 0.4).toFixed(1);
}
report.master = passInfo;

// 6) mux
const outMp4 = path.join(OUT, cfg.outName || "caseiq-10s-v2.mp4");
ffmpeg(["-i", videoOnly, "-i", finalAudio, "-map", "0:v", "-map", "1:a", "-c", "copy", "-t", "10", "-movflags", "+faststart", outMp4]);
fs.writeFileSync(path.join(OUT, "audio_report.json"), JSON.stringify(report, null, 2));
console.log("built", outMp4);
console.log(JSON.stringify({ stems: report.stems, master: report.master.encoded, tpTarget: report.master.tpTarget }, null, 1));
