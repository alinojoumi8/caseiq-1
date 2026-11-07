// QA package for the rendered mp4 (outName in config) -> <out-dir>/<qaDir>/
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { BUILD, CUT, OUT, QA, FRAMES, TMP, FPS, NFRAMES, SIZE, DURATION, W, loadConfig, ffmpeg, run, python, measureLoudness, pngColorType, pngSize } from "./lib.mjs";

const cfg = loadConfig();
const mp4 = path.join(OUT, cfg.outName);
if (!fs.existsSync(mp4)) throw new Error("build the video first");
fs.copyFileSync("C:/Windows/Fonts/consola.ttf", path.join(TMP, "consola.ttf"));   // drawtext font, copied at run time
const idxOf = (t) => Math.min(NFRAMES - 1, Math.round(t * FPS));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const layout = J(path.join(TMP, "layout-info.json"));
const geom = J(path.join(TMP, "frame-geometry.json"));
const audioReport = J(path.join(OUT, "audio_report.json"));
const pl = audioReport.placements;

// audio plots + checks (needed by the audio guards)
python([path.join(BUILD, "qa_plots.py"), mp4, QA], { stdio: "inherit" });

// ---------------------------------------------------------------- full-size frames (poster = the last frame)
const times = [0.0, 0.25, 0.40, 1.20, 2.20, 4.00, 5.10, 6.10, 7.20, 8.70, 10.50, 11.30, 12.10, 14.70, 16.60, 19.30, 19.90, 21.50, 23.50, 23.80, 24.30, 25.70, 29.95];
for (const t of times) {
  const name = `frame_${t.toFixed(2).replace(".", "_")}s.png`;
  ffmpeg(["-i", mp4, "-vf", `select=eq(n\\,${idxOf(t)})`, "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, name)]);
}
ffmpeg(["-i", mp4, "-vf", `select=eq(n\\,${NFRAMES - 1})`, "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, "poster.png")]);

// ---------------------------------------------------------------- guards
const G = [];   // {name, ok, detail}
const guard = (name, ok, detail = "") => G.push({ name, ok: !!ok, detail });
const o = cfg.overlay, T = cfg.t, T0_ = cfg.overlay.T0;

// -- file / format
const probe = (args) => spawnSync("ffprobe", ["-v", "error", ...args, mp4], { encoding: "utf8" }).stdout;
const pv = Object.fromEntries(probe(["-count_frames", "-select_streams", "v:0", "-show_entries", "stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,duration,color_space,color_primaries,color_transfer,color_range", "-of", "default=nw=1"]).trim().split("\n").map((l) => l.split("=")));
const pa = Object.fromEntries(probe(["-select_streams", "a:0", "-show_entries", "stream=codec_name,sample_rate,channels,channel_layout,bit_rate,duration", "-of", "default=nw=1"]).trim().split("\n").map((l) => l.split("=")));
const pf = Object.fromEntries(probe(["-show_entries", "format=duration,size,bit_rate,format_name", "-of", "default=nw=1"]).trim().split("\n").map((l) => l.split("=")));
for (const o_ of [pv, pa, pf]) for (const k_ of Object.keys(o_)) { const v_ = String(o_[k_]).trim(); delete o_[k_]; o_[k_.trim()] = v_; }   // Windows ffprobe prints CRLF
const bytes = fs.readFileSync(mp4);
const moov = bytes.indexOf("moov"), mdat = bytes.indexOf("mdat");
guard("video is 720x1280", +pv.width === SIZE.w && +pv.height === SIZE.h, `${pv.width}x${pv.height}`);
guard("video is 24 fps", pv.r_frame_rate === "24/1" && pv.avg_frame_rate === "24/1", `${pv.r_frame_rate} / ${pv.avg_frame_rate}`);
guard("exactly 720 frames (30.000 s)", +pv.nb_read_frames === NFRAMES && Math.abs(+pv.duration - DURATION) < 1e-3, `${pv.nb_read_frames} frames, video duration ${pv.duration} s, container ${(+pf.duration).toFixed(3)} s`);
guard("H.264, yuv420p, bt709 tagged (matrix, primaries, transfer)", pv.codec_name === "h264" && pv.pix_fmt === "yuv420p" && pv.color_space === "bt709" && pv.color_primaries === "bt709" && pv.color_transfer === "bt709", `${pv.codec_name} ${pv.profile} ${pv.pix_fmt} ${pv.color_space}/${pv.color_primaries}/${pv.color_transfer}/${pv.color_range}`);
guard("AAC, 48 kHz, stereo", pa.codec_name === "aac" && +pa.sample_rate === 48000 && +pa.channels === 2, `${pa.codec_name} ${pa.sample_rate} Hz ${pa.channels} ch ${pa.bit_rate} bps`);
guard("audio duration matches the picture (within 25 ms)", Math.abs(+pa.duration - DURATION) < 0.025, `audio ${pa.duration} s`);
guard("+faststart (moov before mdat)", moov > 0 && moov < mdat, `moov at ${moov}, mdat at ${mdat}`);

// -- overlay PNG regression guards (v1 two-frame flash: mixed RGBA/RGB overlay PNGs made ffmpeg reinit its graph)
{
  const bad = [];
  for (let i = 0; i < NFRAMES; i++) {
    const p = path.join(FRAMES, `f_${String(i).padStart(4, "0")}.png`);
    if (!fs.existsSync(p) || fs.statSync(p).size < 500) { bad.push("missing/empty " + i); continue; }
    if (pngColorType(p) !== 6) bad.push("not RGBA " + i);
    const s = pngSize(p); if (s.w !== SIZE.w || s.h !== SIZE.h) bad.push(`size ${s.w}x${s.h} ${i}`);
  }
  guard("720 overlay PNGs present, non-empty, all RGBA, 720x1280", bad.length === 0, bad.slice(0, 5).join("; ") || "ok");
}

// -- decoded-frame luma / ground checks
const rawOut = (vf, pix) => spawnSync("ffmpeg", ["-v", "error", "-i", mp4, "-vf", vf, "-f", "rawvideo", "-pix_fmt", pix, "-"], { maxBuffer: 1 << 28 }).stdout;
const luma = rawOut("scale=1:1:flags=area", "gray");
const botY = Math.round(1460 * SIZE.w / 1080);
const bot = rawOut(`crop=${SIZE.w}:${SIZE.h - botY}:0:${botY},scale=1:1:flags=area`, "rgb24");
guard("decoded frame count = 720", luma.length === NFRAMES && bot.length === NFRAMES * 3, `luma ${luma.length}, bottom ${bot.length / 3}`);
const first = Math.ceil((o.endCard + 0.3) * FPS - 1e-6);
const GR = [242, 242, 245];
let maxJump = 0, maxDev = 0; const jumpLog = [], flashes = [];
for (let i = 1; i < luma.length; i++) {
  const jump = Math.abs(luma[i] - luma[i - 1]);
  if (i >= first) {
    maxJump = Math.max(maxJump, jump);
    const dev = Math.max(...[0, 1, 2].map((c) => Math.abs(bot[i * 3 + c] - GR[c])));
    maxDev = Math.max(maxDev, dev);
  }
  if (jump >= 15) jumpLog.push(`  jump ${jump} luma at frame ${i} (${(i / FPS).toFixed(3)} s)  mean luma ${luma[i - 1]} -> ${luma[i]}`);
  if (i < luma.length - 1) {
    const d1 = luma[i] - luma[i - 1], d2 = luma[i + 1] - luma[i];
    if (Math.abs(d1) >= 10 && Math.abs(d2) >= 10 && Math.sign(d1) !== Math.sign(d2)) flashes.push(`frame ${i} (${(i / FPS).toFixed(3)} s): ${luma[i - 1]} -> ${luma[i]} -> ${luma[i + 1]}`);
  }
}
guard(`ground colour: bottom area (y >= ${botY}) is (242,242,245) +/-6 for every frame from ${(first / FPS).toFixed(2)} s`, maxDev <= 6, `max deviation ${maxDev}`);
guard("luma jump < 40 on every frame from end card + 0.30 s", maxJump < 40, `max jump ${maxJump}`);
guard("no one-frame flash anywhere (spike of >= 10 luma up-then-down or down-then-up)", flashes.length === 0, flashes.join("; ") || "none");
// the only big jumps expected: the panel lift, the hard cut to clip 3, the ground rise
const expectedWin = [[o.panelIn - 0.05, o.panelIn + 0.55], [o.panelOut - 0.05, o.panelOut + 0.1], [o.endCard - 0.05, o.endCard + 0.45]];
const unexpected = jumpLog.filter((l) => { const t = +l.match(/\(([\d.]+) s\)/)[1]; return !expectedWin.some(([a_, b_]) => t >= a_ && t <= b_); });
guard(`luma jumps >= 15 occur only at the panel lift (${o.panelIn}), the clip-3 cut (${o.panelOut}) and the ground rise (${o.endCard})`, unexpected.length === 0, unexpected.join("; ") || "none");

// -- loudness
const L = measureLoudness(mp4);
guard("integrated loudness -14 LUFS (+/-0.5)", Math.abs(L.I + 14) <= 0.5, `I ${L.I} LUFS, LRA ${L.LRA} LU, true peak ${L.TP} dBTP`);
guard("true peak <= -1 dBTP", L.TP <= -1.0, `${L.TP} dBTP`);

// -- layout / geometry guards (from the per-frame DOM geometry captured with the overlay)
const sizesTxt = fs.readFileSync(path.join(QA, "text_sizes.txt"), "utf8");
guard("text floor: every text element >= 24 px final (36 px design)", /-> PASS/.test(sizesTxt), sizesTxt.split("\n").filter((l) => l.startsWith("minimum")).join(""));
{
  const over = geom.filter((g) => g.bubbles.length > 2).map((g) => g.t);
  guard("no more than two bubbles on screen at once (opacity > 0.02)", over.length === 0, over.slice(0, 5).join(", ") || `max ${Math.max(...geom.map((g) => g.bubbles.length))}`);
  const rect = (r, m = 0) => ({ x0: r.x - m, y0: r.y - m, x1: r.x + r.w + m, y1: r.y + r.h + m });
  const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const ov = [];
  for (const g of geom) for (const pn of [g.panel, g.panel2]) if (pn) for (const b of g.bubbles) if (hit(rect(pn, 0), rect(b))) ov.push(`${g.t}s b${b.i}`);
  guard("timeline panels (rotated bounding box, every frame incl. the lift and the end-card rise) never overlap a bubble", ov.length === 0, ov.slice(0, 5).join(", ") || "none");
  let minClear = 1e9; for (const g of geom) if (g.panel) for (const b of g.bubbles) minClear = Math.min(minClear, g.panel.y - (b.y + b.h));
  guard("clearance panel top to lowest bubble bottom >= 12 px (design)", minClear >= 12, `min ${minClear.toFixed(1)} px`);
  // the outgoing bubble must never overlap the sender label: look at the rendered overlay pixels in the label's box during every shift
  const lo = [];
  const greyPx = (f) => {
    const raw = spawnSync("ffmpeg", ["-v", "error", "-i", path.join(FRAMES, `f_${String(f).padStart(4, "0")}.png`), "-vf", "crop=110:32:164:146", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { maxBuffer: 1 << 24 }).stdout;
    let bad = 0;
    for (let i = 0; i < raw.length; i += 4) if (raw[i + 3] > 24 && raw[i] >= 120 && raw[i] < 240) bad++;
    return bad;
  };
  const base = greyPx(20);        // the label's own anti-aliased edge pixels
  for (let j = 3; j <= 5; j++) {
    const f0 = Math.floor((T.bubble[j - 1] - T.shiftLead - 0.05) * FPS), f1 = Math.ceil((T.bubble[j - 1] - T.shiftLead + T.shiftDur + 0.1) * FPS);
    for (let f = f0; f <= f1; f++) { const bad = greyPx(f); if (bad > base + 25) lo.push(`${(f / FPS).toFixed(3)}s: ${bad - base} extra bubble-grey px in the label box`); }
  }
  guard("outgoing bubbles never overlap the sender label (overlay pixels in the label's box are label-white only, every frame of every stack shift)", lo.length === 0, lo.slice(0, 4).join("; ") || "none");
  // safe zone for bubbles that are not on their way out
  const sz = [];
  for (const g of geom) for (const b of g.bubbles) {
    const leaving = b.i + 2 <= 5 && g.t >= T.bubble[b.i + 1] - T.shiftLead;
    if (leaving || b.op < 0.9 || g.t >= o.endExit.start) continue;
    if (b.x < 72 || b.x + b.w > 990 || b.y < 230 || b.y + b.h > 1450) sz.push(`${g.t}s b${b.i} x${b.x.toFixed(0)}-${(b.x + b.w).toFixed(0)} y${b.y.toFixed(0)}-${(b.y + b.h).toFixed(0)}`);
  }
  guard("bubbles inside the safe zone x 72-990, y 230-1450 (while not leaving)", sz.length === 0, sz.slice(0, 4).join("; ") || "ok");
  // sender label: ink top measured from the rendered overlay frame (alpha > 50%) must be inside y >= 153 (final) = 230 (design)
  const crop = spawnSync("ffmpeg", ["-v", "error", "-i", path.join(FRAMES, "f_0020.png"), "-vf", "crop=140:60:160:120", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"], { maxBuffer: 1 << 24 }).stdout;
  let inkTop = -1, inkBot = -1, inkL = 1e9, inkR = -1;
  for (let y = 0; y < 60; y++) for (let x = 0; x < 140; x++) if (crop[(y * 140 + x) * 4 + 3] > 128 && crop[(y * 140 + x) * 4] > 200) { if (inkTop < 0) inkTop = y; inkBot = y; inkL = Math.min(inkL, x); inkR = Math.max(inkR, x); }
  const inkTopFinal = 120 + inkTop, inkBotFinal = 120 + inkBot;
  guard("sender label ink inside the safe zone (top >= 153 px final = 230 design)", inkTop >= 0 && inkTopFinal >= 153, `label ink y ${inkTopFinal}-${inkBotFinal} px final (design ${(inkTopFinal * 1.5).toFixed(0)}-${(inkBotFinal * 1.5).toFixed(0)}), x ${160 + inkL}-${160 + inkR}`);
  const pz = [];
  for (const g of geom) for (const [nm, pn] of [["panel", g.panel], ["end panel", g.panel2]]) if (pn && (nm === "end panel" ? g.t >= o.endCard + o.endPanelLag + 0.3 : g.t >= T.panelIn + 0.3)) {
    const c = pn.content;
    if (c.x < 72 || c.x + c.w > 990 || c.y < 230 || c.y + c.h > 1450) pz.push(`${g.t}s ${nm} content x${c.x.toFixed(0)}-${(c.x + c.w).toFixed(0)} y${c.y.toFixed(0)}-${(c.y + c.h).toFixed(0)}`);
    if (pn.x < 72 || pn.x + pn.w > 990 || pn.y < 230 || pn.y + pn.h > 1450) pz.push(`${g.t}s ${nm} rotated box x${pn.x.toFixed(0)}-${(pn.x + pn.w).toFixed(0)} y${pn.y.toFixed(0)}-${(pn.y + pn.h).toFixed(0)}`);
  }
  guard("timeline panels: text content AND rotated bounding box inside the safe zone x 72-990, y 230-1450 (from the end of the lift / the end-card rise)", pz.length === 0, pz.slice(0, 3).join("; ") || "ok");
  const lastG = geom.at(-1);
  const ends = Object.entries(lastG.end).map(([k, r]) => [k, r]);
  ends.push(["panel (rotated box)", lastG.panel2]);
  const ez = ends.filter(([k, r]) => r.x < 72 || r.x + r.w > 990 || r.y < 230 || r.y + r.h > 1450).map(([k, r]) => `${k} x${r.x.toFixed(0)}-${(r.x + r.w).toFixed(0)} y${r.y.toFixed(0)}-${(r.y + r.h).toFixed(0)}`);
  guard("every end-card element (panel, wordmark, price, pill, fine print) inside the safe zone", ez.length === 0, ez.join("; ") || ends.map(([k, r]) => `${k} y${r.y.toFixed(0)}-${(r.y + r.h).toFixed(0)}`).join(", "));
  // end-card stack order, no overlaps
  const order = ["panel (rotated box)", "wordmark", "price", ...(CUT === "site" ? [] : ["pill"]), "fine"].map((k) => Object.fromEntries(ends)[k]);
  const stackOk = order.every((r, i) => i === 0 || r.y >= order[i - 1].y + order[i - 1].h - 0.5);
  guard("end card order and spacing: panel above wordmark above price above pill (not in the site cut) above fine print, no overlap", stackOk, order.map((r) => `${r.y.toFixed(0)}-${(r.y + r.h).toFixed(0)}`).join(" | "));
  guard("end card price line is two lines (K3 register)", layout.priceLines === 2, `${layout.priceLines} lines, ${layout.price.w.toFixed(0)} px wide`);
  const leftover = geom.filter((g) => g.t >= o.endExit.start + o.endExit.dur + 0.05).flatMap((g) => g.bubbles.map((b) => `${g.t}s b${b.i}`));
  guard("B4, B5, label and avatar are gone once the end card is up", leftover.length === 0 && geom.filter((g) => g.t >= o.endExit.start + o.endExit.dur + 0.05).every((g) => g.label.op < 0.02 && g.avatar.op < 0.02), leftover.slice(0, 3).join(", ") || "all gone");
  const tails = geom.filter((g) => g.bubbles.length === 2).filter((g) => { const [older, newer] = g.bubbles; return g.t > o.bubbles[2] + 0.2 && older.tail > 0.02; }).map((g) => g.t);
  guard("only the newest bubble has a tail (older bubble's tail faded before the stack settles)", tails.length === 0, tails.slice(0, 4).join(", ") || "ok");
  guard("bubble left edge at x 222 (v4 style)", Math.abs(layout.bodies[0].x - 222) < 0.6, `x ${layout.bodies[0].x}`);
  const g0 = geom[0];
  guard("B1 + sender label + avatar visible on frame 1", g0.bubbles.some((b) => b.i === 1 && b.op > 0.9) && g0.label.op > 0.9 && g0.avatar.op > 0.9, `b1 opacity ${g0.bubbles[0]?.op}, label ${g0.label.op}, avatar ${g0.avatar.op}`);
  // the panel grows with each row: never an empty white box
  const empty = geom.filter((g) => g.panel && g.panel.op > 0.5 && g.t >= T.panelIn + 0.3).filter((g) => g.panel.h < 280).map((g) => g.t);
  guard("panel is never an empty white box: row 1 is inside it from the lift; its height grows with rows 2 and 3", empty.length === 0, `heights ${layout.stack.panelHs.map((h) => h.toFixed(0)).join(" -> ")} px design`);
}
// -- sync: each bubble appears 0..0.1 s before its voice line
{
  const pairs = [["A2", 1], ["B", 2], ["C1", 3], ["D", 4]];
  const bad = [];
  const info = [];
  for (const [id, bi] of pairs) { const v = pl.voice.find((x) => x.id === id); const d = v.pOnset - T.bubble[bi]; info.push(`${id}: bubble ${(T.bubble[bi]).toFixed(2)} voice ${v.pOnset.toFixed(2)} (${d.toFixed(2)} s ahead)`); if (d < 0 || d > 0.1) bad.push(id); }
  guard("bubbles B2..B5 appear 0-0.1 s before their voice line", bad.length === 0, info.join("; "));
}
// -- audio edit checks
{
  const ck = J(path.join(QA, "audio_checks.json"));
  guard("voice cuts sit inside silences (head/tail margin >= 25 ms at the -40 dBFS threshold)", ck.voiceMinEdgeMarginMs >= 25, `min margin ${ck.voiceMinEdgeMarginMs} ms: ${JSON.stringify(ck.voiceEdgeMarginMs)}`);
  guard("no doubled or flammed music hits (no inter-onset interval < 0.12 s in the music stem)", ck["musicDoubledHits(IOI<0.12s)"].length === 0, `${ck.musicOnsetsDetected} onsets, min IOI ${ck.musicMinIOI?.toFixed(3)} s, flagged: ${JSON.stringify(ck["musicDoubledHits(IOI<0.12s)"])}`);
  guard("no click at any music cut (max sample jump within +/-6 ms < 1.5x local RMS)", ck.musicCutJumpRatioMax < 1.5, `max ratio ${ck.musicCutJumpRatioMax.toFixed(2)}`);
  guard("final mix sample peak < 0 dBFS (no clipping)", ck.finalPeakSampleDb < 0, `${ck.finalPeakSampleDb.toFixed(2)} dBFS`);
  guard("final mix: nothing left after 29.9 s (RMS after 29.9 s < -60 dBFS)", ck["rmsDbAfter29.9s"] < -60, `RMS after 29.9 s ${ck["rmsDbAfter29.9s"].toFixed(1)} dBFS (29.0-29.5 s: ${ck["rmsDb29.0-29.5s"].toFixed(1)} dBFS)`);
  guard("music silent by 29.95 s (RMS after 29.95 s < -80 dBFS, last 0.25 s before it steadily fading)", ck["rmsDbAfter29.95s"] < -80, `RMS after 29.95 s ${ck["rmsDbAfter29.95s"].toFixed(1)} dBFS`);
  guard("ring-out has no periodic repeat (no loops: detrended envelope autocorrelation < 0.5 at lags 0.25-1.6 s, 26-29.5 s)", ck.ringOutEnvAutocorrMax < 0.5, `max autocorr ${ck.ringOutEnvAutocorrMax.toFixed(2)}`);
  guard("M2->M3 seam has no hole (every 20 ms window of the music stem 13.6-14.6 s > -85 dBFS)", ck.musicSeamMinRmsDb > -85, `min 20 ms RMS ${ck.musicSeamMinRmsDb.toFixed(1)} dBFS`);
  const lastV = pl.voice.at(-1);
  guard("last voice word ends by 29.2 s", lastV.pOffset <= 29.2, `${lastV.id} ends ${lastV.pOffset}`);
  const sortedV = [...pl.voice].sort((a, b) => a.pOnset - b.pOnset);
  const vOverlap = sortedV.filter((v, i) => i > 0 && v.pOnset < sortedV[i - 1].pOffset + 0.1).map((v) => v.id);
  guard("voice lines do not overlap (>= 0.1 s between lines)", vOverlap.length === 0, vOverlap.join(",") || "ok");
  const resolveP = audioReport.placements.music_resolveP;
  guard("resolve chord lands on the end card (P within 25 ms of the ground rise)", Math.abs(resolveP - o.endCard) < 0.025, `chord at P ${resolveP}`);
}
// -- optional: video identical to an earlier render, frame for frame (cfg.compareTo = { "mp4": ..., "tmp": ... }, paths relative to the source folder)
const cmp = cfg.compareTo ? { mp4: path.resolve(W, cfg.compareTo.mp4), tmp: path.resolve(W, cfg.compareTo.tmp) } : null;
if (cmp) {
  const hashes = (f) => spawnSync("ffmpeg", ["-v", "error", "-i", f, "-map", "0:v:0", "-f", "framemd5", "-"], { encoding: "utf8", maxBuffer: 1 << 26 }).stdout.split(/\r?\n/).filter((l) => l && !l.startsWith("#")).map((l) => l.split(",").map((x) => x.trim()).pop());
  const a = hashes(cmp.mp4), b = hashes(mp4);
  const diff = a.map((h, i) => (h === b[i] ? -1 : i)).filter((i) => i >= 0);
  fs.writeFileSync(path.join(QA, "video_identity.txt"), `Decoded-frame MD5 (ffmpeg framemd5, video stream 0) of ${path.basename(cmp.mp4)} vs ${cfg.outName}\nframes: ${a.length} vs ${b.length}; mismatching frames: ${diff.length}\n`);
  guard("video stream matches the reference render frame for frame (MD5 of every decoded frame)", a.length === NFRAMES && b.length === NFRAMES && diff.length === 0, `${a.length} frames, ${diff.length} mismatches`);
}
// -- voice line levels (gain-match to the take-1 median)
{
  python([path.join(BUILD, "line_levels.py"), mp4, QA, ...(cmp ? [cmp.mp4, cmp.tmp] : [])], { stdio: "inherit" });
  const ll = J(path.join(QA, "line_levels.json"));
  const sm = ll.summary;
  const f1 = (x) => (x == null ? "n/a" : x.toFixed(1));
  guard("every voice line within +/-1 LU of the take-1 median on the voice stem (integrated loudness, before ducking)", sm.stemLufs_v3.maxDevFromTake1Median_v3 <= 1.0 + 1e-6, `max deviation ${sm.stemLufs_v3.maxDevFromTake1Median_v3.toFixed(2)} LU (spread ${sm.stemLufs_v3.spread_v3.toFixed(1)}; reference spread ${f1(sm.stemLufs_v3.spread_v2)})`);
  guard("every voice line within +/-1 dB of the take-1 median on the voice stem (critic B's active RMS)", sm.stemAct_v3.maxDevFromTake1Median_v3 <= 1.0 + 1e-6, `max deviation ${sm.stemAct_v3.maxDevFromTake1Median_v3.toFixed(2)} dB (spread ${sm.stemAct_v3.spread_v3.toFixed(1)}; reference spread ${f1(sm.stemAct_v3.spread_v2)})`);
  guard("final-mix line levels (critic B's method) spread <= 3.5 dB (loudnorm runs dynamic here: the master needs +3.5 dB against a -1 dBTP ceiling)", sm.mixAct_v3.spread_v3 <= 3.5, `spread ${sm.mixAct_v3.spread_v3.toFixed(1)} dB (reference ${f1(sm.mixAct_v3.spread_v2)})`);
}
// -- poster
{
  const same = fs.readFileSync(path.join(QA, "poster.png")).equals(fs.readFileSync(path.join(QA, "frame_29_95s.png")));
  guard("poster.png is the last frame (frame 719 = the 29.95 s frame)", same && fs.statSync(path.join(QA, "poster.png")).size > 20000, "poster.png identical to frame_29_95s.png");
}

const logLines = [
  `GUARDS for ${cfg.outName}`,
  ...G.map((g) => `${g.ok ? "PASS" : "FAIL"}  ${g.name}${g.detail ? "  [" + g.detail + "]" : ""}`),
  "",
  `guard window: frames from ${first} (${(first / FPS).toFixed(3)} s) to ${NFRAMES - 1}; max luma jump there = ${maxJump}; max bottom-area deviation from ground (242,242,245) = ${maxDev}`,
  "per-frame mean-luminance jumps >= 15 over the whole film (the hard cuts and the ground rise are expected):",
  ...jumpLog,
  "",
  G.every((g) => g.ok) ? "ALL GUARDS PASS" : "SOME GUARDS FAILED",
];
fs.writeFileSync(path.join(QA, "guards.txt"), logLines.join("\n") + "\n");
console.log(logLines.join("\n"));
if (!G.every((g) => g.ok)) { console.error("QA GUARD FAILED"); process.exitCode = 1; }

// 24 fps strips (every frame) with timestamps
const strip = (t0, t1, cols, name, w, h) => {
  const a = Math.round(t0 * FPS), b = Math.round(t1 * FPS), n = b - a + 1, rows = Math.ceil(n / cols);
  ffmpeg(["-i", mp4, "-vf",
    `select=between(n\\,${a}\\,${b}),scale=${w}:${h}:flags=lanczos,drawtext=fontfile=consola.ttf:text='%{pts\\:hms}':x=4:y=h-20:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.65,tile=${cols}x${rows}:padding=2:color=black`,
    "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, name)], { cwd: TMP });
};
strip(0.00, 0.60, 8, "strip_0_00-0_60s.png", 216, 384);
strip(4.40, 6.80, 10, "strip_4_40-6_80s.png", 180, 320);
strip(10.60, 11.40, 10, "strip_10_60-11_40s.png", 180, 320);
strip(14.00, 14.50, 7, "strip_14_00-14_50s.png", 252, 448);
strip(16.00, 16.50, 7, "strip_16_00-16_50s.png", 252, 448);
strip(19.60, 20.40, 10, "strip_19_60-20_40s.png", 180, 320);
strip(23.60, 24.40, 10, "strip_23_60-24_40s.png", 180, 320);

// contact sheet: every 0.5 s (60 tiles), timestamp burned in
const step = Math.round(FPS * 0.5);
ffmpeg(["-i", mp4, "-vf",
  `select=not(mod(n\\,${step})),scale=180:320:flags=lanczos,drawtext=fontfile=consola.ttf:text='%{pts\\:hms}':x=5:y=h-22:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=3,tile=10x6:padding=0`,
  "-fps_mode", "passthrough", "-frames:v", "1", path.join(QA, "contact_sheet.png")], { cwd: TMP });

// loudness + ffprobe
fs.writeFileSync(path.join(QA, "ebur128.txt"), `Loudness of ${cfg.outName} (EBU R128, ffmpeg ebur128 with true peak)\n` +
  `Integrated: ${L.I} LUFS   LRA: ${L.LRA} LU   True peak: ${L.TP} dBTP   (targets: -14 LUFS, <= -1 dBTP)\n\n` + L.summary + "\n");
fs.writeFileSync(path.join(QA, "ffprobe.txt"),
  "== format\n" + probe(["-show_entries", "format=duration,size,bit_rate,format_name", "-of", "default=nw=1"]) +
  "\n== video (counted frames)\n" + Object.entries(pv).map(([k, v]) => `${k}=${v}`).join("\n") +
  "\n\n== audio\n" + Object.entries(pa).map(([k, v]) => `${k}=${v}`).join("\n") +
  `\n\n== moov position (faststart)\nmoov at byte ${moov}, mdat at byte ${mdat}\n`);

// ---------------------------------------------------------------- label contrast (measured on the final video) + grade check
{
  const ct = [0.3, 7.5, 20.5, 22.5];
  const dir = path.join(QA, "contrast"); fs.mkdirSync(dir, { recursive: true });
  const spec = [];
  for (const t of ct) {
    const k = idxOf(t); const f = path.join(dir, `frame_${t.toFixed(1).replace(".", "_")}s.png`);
    ffmpeg(["-i", mp4, "-vf", `select=eq(n\\,${k})`, "-fps_mode", "passthrough", "-frames:v", "1", f]);
    spec.push({ t, file: f, label: geom[k].label });
  }
  fs.writeFileSync(path.join(TMP, "contrast_spec.json"), JSON.stringify(spec));
  python([path.join(BUILD, "contrast.py"), path.join(TMP, "contrast_spec.json"), QA], { stdio: "inherit" });
  const cj = J(path.join(QA, "contrast.json"));
  guard("sender label contrast over footage >= 4.5:1 at 0.3, 7.5, 20.5 and 22.5 s (white text vs the brightest background pixel in its box)", cj.every((c) => c.ratio >= 4.5), cj.map((c) => `${c.t}s ${c.ratio.toFixed(1)}:1`).join(", "));
  python([path.join(BUILD, "grade_check.py"), path.join(TMP, "bg"), path.join(TMP, "bg_graded"), QA], { stdio: "inherit" });
  const gj = J(path.join(QA, "grade_check.json"));
  guard("grade: warm pixels (wood, lamp glow) untouched, blue/cyan pixels desaturated", gj.warmMeanAbsDelta < 1.5 && gj.coolSatAfter < gj.coolSatBefore * 0.7, `warm mean |dRGB| ${gj.warmMeanAbsDelta.toFixed(2)}; cool-pixel saturation ${gj.coolSatBefore.toFixed(3)} -> ${gj.coolSatAfter.toFixed(3)}`);
}
// rewrite guards.txt with the late guards included
{
  const lines = fs.readFileSync(path.join(QA, "guards.txt"), "utf8").split("\n");
  const body = G.map((g) => `${g.ok ? "PASS" : "FAIL"}  ${g.name}${g.detail ? "  [" + g.detail + "]" : ""}`);
  const tailStart = lines.findIndex((l) => l.startsWith("guard window"));
  const out = [`GUARDS for ${cfg.outName}`, ...body, "", ...lines.slice(tailStart).filter((l) => !/ALL GUARDS PASS|SOME GUARDS FAILED/.test(l)), G.every((g) => g.ok) ? "ALL GUARDS PASS" : "SOME GUARDS FAILED"];
  fs.writeFileSync(path.join(QA, "guards.txt"), out.join("\n") + "\n");
  console.log(out.filter((l) => /^FAIL|ALL GUARDS|SOME GUARDS/.test(l)).join("\n"));
  if (!G.every((g) => g.ok)) process.exitCode = 1;
}

// ---------------------------------------------------------------- timeline.md
const f2 = (x) => (+x).toFixed(3);
const tl = [];
tl.push("# Case IQ 30 s: event timeline (picture time P, seconds; 24 fps, 720 frames)\n");
tl.push("## Picture\n", "| P start | P end | Source | Notes |", "|---|---|---|---|");
for (const s of cfg.pic) {
  const src = s.holdFrame != null ? `${s.clip} frame ${s.holdFrame} held` : `${s.clip} src ${s.srcStart}-${s.srcEnd} at ${((s.srcEnd - s.srcStart) / s.outDuration).toFixed(2)}x`;
  tl.push(`| ${f2(s.p0)} | ${f2(s.p1)} | ${src} | ${s.name} |`);
}
tl.push(`| ${cfg.camera.thud.at} | ${(cfg.camera.thud.at + cfg.camera.thud.frames / FPS).toFixed(3)} | camera | thud scale bump 1.00 -> ${1 + cfg.camera.thud.amp} -> 1.00 over ${cfg.camera.thud.frames} frames (clip 1 src 0.55) |`);
tl.push(`| 0.000 | ${cfg.camera.hook.dur} | camera | hook punch-in ${cfg.camera.hook.zoom}x on the pile, eases out (site ease) |`);
tl.push(`| 0.000 | ${cfg.grade.nightUntil} | grade | ${cfg.grade.filter} on the night footage, under the overlays |`);
tl.push(`| ${cfg.camera.push.from} | ${cfg.camera.push.to} | camera | push-in 1.00 -> ${cfg.camera.push.zoom}, ease in-out, on the held frame |`);
tl.push("\n## Overlay\n", "| P | Event |", "|---|---|");
const ev = [];
const BT = ["You know what happened.", "It’s in here somewhere.", "Let’s find the page that shows it.", "One timeline. The page behind every fact.", "Bring the pile. Leave with a timeline."];
o.bubbles.forEach((t, i) => ev.push([t, `B${i + 1} appears: "${BT[i]}"` + (i === 0 ? " (spring pre-rolled; on screen from frame 1 with the sender label and avatar)" : "")]));
for (let j = 3; j <= 5; j++) ev.push([o.bubbles[j - 1] - o.shiftLead, `stack starts moving up; B${j - 2} slides out under the label bottom edge and fades`]);
ev.push([o.scrimOn, `scrim #111 ${o.scrimAlpha * 100}% fades in over ${o.scrimFade} s`]);
ev.push([o.panelIn, "timeline panel lifts with row 1 inside (0.28 s, -1.4 deg, lift shadow)"]);
ev.push([o.panelIn + 0.28, "panel at rest"]);
o.rows.forEach((t, k) => { if (k > 0) ev.push([t, `row ${k + 1} lands (0.25 s eased rise); the card grows with it`]); });
ev.push([o.panelOut, "hard cut to clip 3: panel and scrim leave with the footage"]);
ev.push([o.endExit.start, `B4, B5, the label and the avatar scroll up and fade (${o.endExit.dur} s)`]);
ev.push([o.endCard, "ground #f2f2f5 rises (0.26 s); fine print rides on it"]);
ev.push([o.endCard + o.endPanelLag, "three-row timeline panel rises in with the ground, already at rest (-1.4 deg, lift shadow)"]);
ev.push([o.wordmark, "wordmark glyph + Case IQ"], [o.price, "A flat price agreed before we start, never hourly. (two lines)"]);
if (CUT !== "site") ev.push([o.pill, "pill: Get my case in order"]);
ev.push([DURATION - 1 / FPS, "last frame = poster"]);
ev.sort((a, b) => a[0] - b[0]).forEach(([t, e]) => tl.push(`| ${f2(t)} | ${e} |`));
tl.push("\n## Audio (see audio_placements.md for the source cut points)\n", "| P | Event |", "|---|---|");
const au = [];
pl.voice.forEach((v) => au.push([v.pOnset, `voice ${v.id} "${v.text}" (to ${f2(v.pOffset)})`]));
pl.music.forEach((m) => au.push([m.pStart, `music ${m.id} in (src ${m.srcStart}); ends ${m.pEnd}`]));
pl.sfx.forEach((s) => au.push([s.pStart, `${s.id}`]));
au.sort((a, b) => a[0] - b[0]).forEach(([t, e]) => tl.push(`| ${f2(t)} | ${e} |`));
fs.writeFileSync(path.join(QA, "timeline.md"), tl.join("\n") + "\n");
console.log("QA written to", QA);
