// The described version of the film (WCAG 1.2.5), built by scripts/film-assets.mjs. Imported there, with the helpers it shares.
//
// What it makes:
//   case-iq-film-30s-described.mp4     the site cut with its picture held still in three places while a second voice describes
//                                      what is on screen. While the picture is held the film's own sound (music and voice) is
//                                      paused too, then everything resumes. Never re-voiced, sped up or pitch-shifted.
//   case-iq-film-30s-described.en.vtt  the film's captions with their times moved by the holds.
//
// The voice is one take that is already made (docs/marketing/commercial-30s/source/audio/described/ad_take1.mp3, see PROVENANCE.md
// beside it): four lines. This script never generates audio and calls no service. It cuts the take on its own pauses, shortens the
// pauses inside a line to about 0.25 s, and places each line in a gap in the film's voice (the gaps between the captions' cues).
// A line that is longer than its gap holds the picture for the overflow, at a point where what the line describes is on screen:
//   line 1 (table and papers)   starts in the gap after "It's in here somewhere." and holds just before the papers lift
//   line 2 (the column)         fits the gap while the papers land
//   line 3 (the timeline, the example label and its rows)
//                               starts in the gap after "The page behind every fact." and holds on the finished timeline, on its
//                               last frame before the cut to morning, so the rows are on screen while they are described
//   line 4 (the end card)       starts in the gap after the last voice line and holds the film's last frame
// The mix: the film's sound is ducked under a description that overlaps it, the description is gain-matched to the film's voice, and the
// whole is set to -14 LUFS with a true peak at or under -1 dBTP, like the film. It fails loudly if any line touches a voice cue.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toDescribed } from '../src/lib/describedTime.ts';

const SR = 48000;
const FPS = 24;
const SAMPLES_PER_FRAME = SR / FPS;
const FILM_FRAMES = 720;

/** Where the voice take came from (PROVENANCE.md beside it). Recorded in media.ts. */
const VOICE = {
  tool: 'Krea: elevenlabs/tts, model eleven_v4',
  voice: 'ElevenLabs TTS, eleven_v4, voice "Eric" (cjVigY5qzO86Huf0OWal)',
  kreaJob: '2b7820e7-ea0e-413b-ba77-5487ca11ac46',
  madeOn: '2026-11-06',
};

// What the take says, line by line, and where it falls. Pauses are found in the take at run time and checked against this.
const TAKE_LINES = [
  { id: 'D1', text: 'A table piled with papers, at night.' },
  { id: 'D2', text: 'The papers rise, and land in one straight column.' },
  { id: 'D3', text: 'A timeline rises, marked: example, not a real case. Each dated row shows its page: an email saying your role is not affected, a letter saying your position has been eliminated, and texts.' },
  { id: 'D4', text: 'On screen: Case IQ isn’t a law firm and doesn’t give legal advice. Pictures, voice and music made with AI.' },
];
/** The pauses (seconds in the take) the take is cut on: the ones between lines. The rest are inside a line. */
const EXPECT_PAUSES = [
  { at: 2.6, to: 3.25, boundary: true },
  { at: 6.2, to: 6.91, boundary: true },
  { at: 8.66, to: 9.07 },
  { at: 10.88, to: 11.445 },
  { at: 13.4, to: 13.805 },
  { at: 16.15, to: 16.595 },
  { at: 18.96, to: 19.44 },
  { at: 20.175, to: 20.775, boundary: true },
  { at: 21.4, to: 21.96 },
  { at: 25.505, to: 26.065 },
];

const SETTINGS = {
  pauseKeep: 0.25, // a pause inside a line is cut to about this long
  pad: 0.06, // seconds of take kept either side of a line's first and last sound
  fade: 0.008, // a cut's fade, so none clicks
  startAfterVoice: 0.015, // a line starts this long after the voice cue before it ends (the cue already holds 0.25 s past the voice)
  endBeforeVoice: 0.12, // a line ends at least this long before the next voice starts
  holdFade: 0.1, // the film's sound fades out to a hold and back in over this long
  duck: { db: -9, attack: 0.05, release: 0.3 }, // the film's sound under a description that overlaps it
  tail: { timeline: 0.3, end: 0.5 }, // the picture stays this long after a line's last word
  master: { I: -14, tolerance: 0.5, TP: -1 },
  videoCrf: 17,
  // Where the picture holds. Frame numbers: the hold shows the last frame before the number, then the film goes on from it.
  holdFrames: { papers: 115, timeline: 473, end: FILM_FRAMES },
  // Where each line starts: the end of the voice cue before it, in film seconds (from the captions' cues), and the voice that follows it.
  startCue: { D1: 1, D2: 2, D3: 4, D4: 7 }, // index into the film's cues
};

const dbToGain = (db) => 10 ** (db / 20);
const framesCeil = (seconds) => Math.ceil(seconds * FPS - 1e-9);

function writeWav(path, channels) {
  const n = channels[0].length;
  const header = Buffer.alloc(44);
  const data = Buffer.alloc(n * channels.length * 4);
  for (let i = 0; i < n; i++) for (let c = 0; c < channels.length; c++) data.writeFloatLE(channels[c][i], (i * channels.length + c) * 4);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(3, 20); // 32-bit float
  header.writeUInt16LE(channels.length, 22);
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * channels.length * 4, 28);
  header.writeUInt16LE(channels.length * 4, 32);
  header.writeUInt16LE(32, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([header, data]));
}

/**
 * @param {object} c everything film-assets.mjs shares: its helpers and the paths and cues this builds on.
 */
export function buildDescribed(c) {
  const { run, ffmpeg, loudness, guard, md5, bytes, round, stamp, publicPath, repoPath, probeVideo, countFrames, moovFirst, FILM, OUT, SRC, voiceCues, qaDir, FONT, chain } = c;
  const TAKE = join(SRC, 'source', 'audio', 'described', 'ad_take1.mp3');
  const OUT_MP4 = join(OUT, 'case-iq-film-30s-described.mp4');
  const OUT_VTT = join(OUT, 'case-iq-film-30s-described.en.vtt');
  const work = mkdtempSync(join(tmpdir(), 'caseiq-described-'));

  try {
    const decode = (file, ch) => {
      const buf = run('ffmpeg', ['-v', 'error', '-i', file, '-vn', '-ac', String(ch), '-ar', String(SR), '-f', 'f32le', '-'], { binary: true });
      const all = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
      if (ch === 1) return [all];
      const left = new Float32Array(all.length / 2);
      const right = new Float32Array(all.length / 2);
      for (let i = 0; i < left.length; i++) {
        left[i] = all[2 * i];
        right[i] = all[2 * i + 1];
      }
      return [left, right];
    };
    // How much a frame moves between two frames of a file: the mean absolute difference of their 96x96 grey pictures, out of 255.
    const grey = (file, n) => run('ffmpeg', ['-v', 'error', '-i', file, '-vf', `select=eq(n\\,${n}),scale=96:96:flags=area,format=gray`, '-frames:v', '1', '-f', 'rawvideo', '-'], { binary: true });
    const frameDiff = (file, a, b) => {
      const x = grey(file, a);
      const y = grey(file, b);
      return x.reduce((sum, v, i) => sum + Math.abs(v - y[i]), 0) / x.length;
    };

    // ------------------------------------------------------------ 1. the take, cut into its four lines
    const [take] = decode(TAKE, 1);
    const win = 240; // 5 ms
    const rms = [];
    for (let i = 0; i + win <= take.length; i += win) {
      let s = 0;
      for (let j = i; j < i + win; j++) s += take[j] * take[j];
      rms.push(20 * Math.log10(Math.max(Math.sqrt(s / win), 1e-9)));
    }
    const inside = []; // quiet runs of at least 0.35 s below -45 dBFS between sounds, in take seconds
    for (let k = 0, from = -1; k < rms.length; k++) {
      const quiet = rms[k] < -45;
      if (quiet && from < 0) from = k;
      if (!quiet && from >= 0) {
        if ((k - from) * 0.005 >= 0.35) inside.push({ at: from * 0.005, to: k * 0.005 });
        from = -1;
      }
    }
    const lastSound = (rms.findLastIndex((v) => v >= -45) + 1) * 0.005; // where the take's last sound ends; the take has a short quiet tail
    const pauseProblems = [];
    if (inside.length !== EXPECT_PAUSES.length) pauseProblems.push(`${inside.length} pauses found, expected ${EXPECT_PAUSES.length}`);
    EXPECT_PAUSES.forEach((e, i) => {
      const p = inside[i];
      if (!p || Math.abs(p.at - e.at) > 0.08 || Math.abs(p.to - e.to) > 0.08) pauseProblems.push(`pause ${i + 1} is ${p ? `${p.at.toFixed(2)}-${p.to.toFixed(2)}` : 'missing'}, expected ${e.at}-${e.to}`);
    });
    guard('the described voice take has the pauses PROVENANCE.md lists (3 between lines, 7 inside them)', pauseProblems.length === 0, pauseProblems.join('; ') || `${inside.length} pauses, take ${(take.length / SR).toFixed(2)} s`);
    if (pauseProblems.length) throw new Error('The described voice take is not the one PROVENANCE.md describes.');

    // Each line: the speech between the boundary pauses, with the pauses inside it shortened.
    const bounds = inside.filter((_, i) => EXPECT_PAUSES[i].boundary);
    const lineSpeech = [
      { from: 0, to: bounds[0].at },
      { from: bounds[0].to, to: bounds[1].at },
      { from: bounds[1].to, to: bounds[2].at },
      { from: bounds[2].to, to: lastSound },
    ];
    const lines = TAKE_LINES.map((line, i) => {
      const { from, to } = lineSpeech[i];
      const innerPauses = inside.filter((p, k) => !EXPECT_PAUSES[k].boundary && p.at > from && p.to < to);
      // Pieces of the take to keep, in order: from a little before the first sound to a little after the last, minus the cut middle of each long pause.
      const pieces = [];
      let start = Math.max(0, from - SETTINGS.pad);
      for (const p of innerPauses) {
        const keep = Math.min(SETTINGS.pauseKeep, p.to - p.at) / 2;
        pieces.push([start, p.at + keep]);
        start = p.to - keep;
      }
      pieces.push([start, Math.min(take.length / SR, to + SETTINGS.pad)]);
      const fade = Math.round(SETTINGS.fade * SR);
      const parts = pieces.map(([a, b]) => {
        const seg = take.slice(Math.round(a * SR), Math.round(b * SR));
        for (let k = 0; k < fade && k < seg.length; k++) {
          const g = k / fade;
          seg[k] *= g;
          seg[seg.length - 1 - k] *= g;
        }
        return seg;
      });
      const audio = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of parts) {
        audio.set(p, at);
        at += p.length;
      }
      return { ...line, audio, seconds: audio.length / SR, takePieces: pieces.map(([a, b]) => [round(a, 3), round(b, 3)]), pausesShortened: innerPauses.length };
    });

    // ------------------------------------------------------------ 2. where the lines go, and the holds
    const film = decode(FILM, 2);
    const cueEnd = (i) => voiceCues[i].cueEnd; // film seconds: the voice's end plus the caption's quarter-second hold
    const cueStart = (i) => voiceCues[i].cueStart;
    const start = {
      D1: cueEnd(SETTINGS.startCue.D1) + SETTINGS.startAfterVoice,
      D2: cueEnd(SETTINGS.startCue.D2) + SETTINGS.startAfterVoice,
      D3: cueEnd(SETTINGS.startCue.D3) + SETTINGS.startAfterVoice,
      D4: cueEnd(SETTINGS.startCue.D4) + SETTINGS.startAfterVoice,
    };
    const next = { D1: cueStart(2), D2: cueStart(3), D3: cueStart(5), D4: Infinity }; // the voice that follows each line, film seconds
    const at = (frame) => frame / FPS;

    // Holds, front to back; each hold's length is what its line needs past the gap (or past the held point), rounded up to a frame.
    const holds = [];
    const d1 = lines[0].seconds;
    const h1 = framesCeil(Math.max(0, start.D1 + d1 + SETTINGS.endBeforeVoice - next.D1));
    holds.push({ id: 'papers', frame: SETTINGS.holdFrames.papers, frames: h1, why: 'The papers are still on the table, right before they lift, while line 1 describes them.' });

    const d2 = lines[1].seconds;
    if (start.D2 + d2 + SETTINGS.endBeforeVoice > next.D2) throw new Error(`Line 2 (${d2.toFixed(2)} s) does not fit its gap (${start.D2.toFixed(2)}-${next.D2.toFixed(2)} s).`);

    const d3 = lines[2].seconds;
    const heldAt3 = at(SETTINGS.holdFrames.timeline);
    const h3 = framesCeil(Math.max(0, start.D3 + d3 - heldAt3 + SETTINGS.tail.timeline));
    holds.push({ id: 'timeline', frame: SETTINGS.holdFrames.timeline, frames: h3, why: 'The finished timeline, its three rows showing, on its last frame before the cut to morning, while line 3 describes them.' });

    const d4 = lines[3].seconds;
    const heldAt4 = at(SETTINGS.holdFrames.end);
    const h4 = framesCeil(Math.max(0, start.D4 + d4 - heldAt4 + SETTINGS.tail.end));
    holds.push({ id: 'end', frame: SETTINGS.holdFrames.end, frames: h4, why: 'The last frame, the end card, while line 4 describes it.' });

    const holdList = holds.map((h) => ({ at: round(at(h.frame), 4), seconds: round(h.frames / FPS, 4), frame: h.frame, frames: h.frames, id: h.id, why: h.why }));
    const totalFrames = FILM_FRAMES + holds.reduce((n, h) => n + h.frames, 0);
    const described = (filmT) => toDescribed(filmT, holdList);
    const placed = lines.map((l) => {
      const id = l.id;
      const s = described(start[id]);
      return { id, text: l.text, filmAt: round(start[id], 3), start: round(s, 3), end: round(s + l.seconds, 3), seconds: round(l.seconds, 3), pausesShortened: l.pausesShortened, takePieces: l.takePieces, audio: l.audio, next: next[id] };
    });
    console.log(`described version: ${holds.map((h) => `${h.id} hold ${(h.frames / FPS).toFixed(3)} s at ${at(h.frame).toFixed(3)}`).join('; ')}; ${totalFrames} frames, ${(totalFrames / FPS).toFixed(3)} s`);

    // ------------------------------------------------------------ 3. the sound
    const totalSamples = totalFrames * SAMPLES_PER_FRAME;
    const out = [new Float32Array(totalSamples), new Float32Array(totalSamples)];
    // The film's sound, in pieces between the holds, each moved by the holds before it. Each side of a hold fades.
    const edges = [0, ...holds.map((h) => h.frame), FILM_FRAMES];
    let moved = 0;
    const fadeLen = Math.round(SETTINGS.holdFade * SR);
    for (let k = 0; k + 1 < edges.length; k++) {
      const a = edges[k] * SAMPLES_PER_FRAME;
      const b = edges[k + 1] * SAMPLES_PER_FRAME;
      for (let ch = 0; ch < 2; ch++) {
        for (let i = a; i < b; i++) {
          let g = 1;
          if (k > 0 && i - a < fadeLen) g = (i - a) / fadeLen; // coming back from a hold
          if (k < holds.length && b - i <= fadeLen) g = Math.min(g, (b - i) / fadeLen); // going into a hold
          out[ch][i + moved] = film[ch][i] * g;
        }
      }
      if (k < holds.length) moved += holds[k].frames * SAMPLES_PER_FRAME;
    }
    // The film's voice cues (and measured spans) as they fall in the described version, for the checks and the sheet.
    const voiceSpans = voiceCues.map((v) => ({ id: v.id, start: described(v.cueStart), end: described(v.cueEnd), voiceStart: described(v.start), voiceEnd: described(v.end) }));

    // The description, matched to the film's voice. The voice's loudness is measured on the film's own voice spans (music under it included).
    const spansExpr = voiceCues.map((v) => `between(t,${v.start},${v.end})`).join('+');
    const filmVoiceLufs = loudness(FILM, `aselect='${spansExpr}'`).I;
    const joined = new Float32Array(lines.reduce((n, l) => n + l.audio.length, 0));
    let jat = 0;
    for (const l of lines) {
      joined.set(l.audio, jat);
      jat += l.audio.length;
    }
    const joinedWav = join(work, 'description.wav');
    writeWav(joinedWav, [joined, joined]); // the description is mixed into both channels, so it is measured as both (a mono file reads 3 LU lower)
    const descLufs = loudness(joinedWav).I;
    const descGainDb = filmVoiceLufs - descLufs;
    const descGain = dbToGain(descGainDb);

    // Duck the film's sound under each line, then add the line. Attack ahead of the line, release after it.
    const duckG = dbToGain(SETTINGS.duck.db);
    const gain = new Float32Array(totalSamples).fill(1);
    for (const l of placed) {
      const s0 = Math.round(l.start * SR);
      const s1 = Math.round(l.end * SR);
      const a0 = s0 - Math.round(SETTINGS.duck.attack * SR);
      const r1 = s1 + Math.round(SETTINGS.duck.release * SR);
      for (let i = Math.max(0, a0); i < Math.min(totalSamples, r1); i++) {
        const into = i < s0 ? (i - a0) / (s0 - a0) : 1;
        const outof = i > s1 ? 1 - (i - s1) / (r1 - s1) : 1;
        gain[i] = Math.min(gain[i], 1 - (1 - duckG) * Math.min(into, outof));
      }
    }
    for (let ch = 0; ch < 2; ch++) for (let i = 0; i < totalSamples; i++) out[ch][i] *= gain[i];
    // Where each line sits in the track, and the description track on its own (for the proof that it never touches a voice cue).
    const descriptionTrack = new Float32Array(totalSamples);
    for (const l of placed) {
      const s0 = Math.round(l.start * SR);
      for (let i = 0; i < l.audio.length && s0 + i < totalSamples; i++) {
        descriptionTrack[s0 + i] = l.audio[i] * descGain;
        out[0][s0 + i] += l.audio[i] * descGain;
        out[1][s0 + i] += l.audio[i] * descGain;
      }
    }

    // The master: one gain to -14 LUFS (the film's own target) and a look-ahead limiter that keeps the description's peaks under the true-peak
    // ceiling (the voice take's peaks are high for its loudness; the film's own voice was levelled to sit under -1.3 dBTP). The file is then
    // encoded and measured, and the gain is nudged until it lands within the tolerance with the peak under the ceiling.
    const preWav = join(work, 'premaster.wav');
    writeWav(preWav, out);
    const pre = loudness(preWav);
    let masterGainDb = SETTINGS.master.I - pre.I;
    const segs = [[0, holds[0].frame], [holds[0].frame, holds[1].frame], [holds[1].frame, holds[2].frame]];
    const graph = [
      ...segs.map(([a, b], i) => `[0:v]trim=start_frame=${a}:end_frame=${b},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop=${holds[i].frames}[s${i}]`),
      `${segs.map((_, i) => `[s${i}]`).join('')}concat=n=${segs.length}:v=1:a=0[v]`,
    ].join(';');

    // ------------------------------------------------------------ 4. the picture and the file
    const videoOnly = join(work, 'video.mp4');
    ffmpeg([
      '-i', FILM, '-filter_complex', graph, '-map', '[v]', '-an',
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(SETTINGS.videoCrf), '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-r', String(FPS), '-fps_mode', 'cfr', videoOnly,
    ]);
    const masterWav = join(work, 'master.wav');
    let final = { I: NaN, TP: NaN };
    for (let attempt = 0; attempt < 6; attempt++) {
      const g = dbToGain(masterGainDb);
      writeWav(masterWav, out.map((ch) => ch.map((v) => v * g)));
      ffmpeg(['-i', videoOnly, '-i', masterWav, '-map', '0:v', '-map', '1:a', '-af', `alimiter=limit=${dbToGain(SETTINGS.master.TP - 0.7).toFixed(4)}:attack=5:release=80:level=false`, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', String(SR), '-ac', '2', '-shortest', '-movflags', '+faststart', OUT_MP4]);
      final = loudness(OUT_MP4);
      console.log(`  master attempt ${attempt + 1}: gain ${masterGainDb.toFixed(2)} dB gives ${final.I} LUFS, true peak ${final.TP} dBTP`);
      if (final.TP <= SETTINGS.master.TP && Math.abs(final.I - SETTINGS.master.I) <= 0.15) break;
      masterGainDb += final.TP > SETTINGS.master.TP ? -(final.TP - SETTINGS.master.TP + 0.1) : SETTINGS.master.I - final.I;
    }

    // The captions: the film's cues, each moved by the holds before it. Spoken text only, as in the film's own captions.
    const cueText = (v) => voiceCues.find((x) => x.id === v.id).lines.join('\n');
    writeFileSync(
      OUT_VTT,
      'WEBVTT\n\nNOTE Made by scripts/film-assets.mjs from the film\'s captions, with each cue moved by the holds before it. The description itself is voice only.\n\n' +
        voiceSpans.map((v, i) => `${i + 1}\n${stamp(v.start)} --> ${stamp(v.end)}\n${cueText(v)}\n`).join('\n'),
    );

    // ------------------------------------------------------------ 5. guards
    const probe = probeVideo(OUT_MP4);
    const expectSeconds = totalFrames / FPS;
    guard('described: 720x1280 H.264, one audio stream, as long as the film plus its holds', probe.width === 720 && probe.height === 1280 && probe.codec === 'h264' && probe.audioStreams === 1 && Math.abs(probe.duration - expectSeconds) < 0.06, `${probe.width}x${probe.height} ${probe.duration.toFixed(3)} s, expected ${expectSeconds.toFixed(3)} s`);
    const frames = countFrames(OUT_MP4);
    guard('described: every frame is there (film frames plus hold frames)', frames === totalFrames, `${frames} frames, expected ${totalFrames}`);
    guard('described: moov before mdat (starts playing before it has all downloaded)', moovFirst(OUT_MP4));
    // A hold shows the film's frame just before its number, then that frame again, once per hold frame. In the file the held frame sits
    // at (frame - 1) plus the holds before it, and its copies follow it.
    const still = holds.map((h, i) => {
      const held = h.frame - 1 + holds.slice(0, i).reduce((n, x) => n + x.frames, 0);
      return { id: h.id, diff: frameDiff(OUT_MP4, held, held + h.frames) };
    });
    guard('described: each hold shows one still picture (first and last frame of the hold differ by under 0.6/255)', still.every((s) => s.diff < 0.6), still.map((s) => `${s.id} ${s.diff.toFixed(2)}`).join(', '));

    guard(`described: loudness ${SETTINGS.master.I} LUFS (+/-${SETTINGS.master.tolerance}) and true peak at or under ${SETTINGS.master.TP} dBTP, as the film`, Math.abs(final.I - SETTINGS.master.I) <= SETTINGS.master.tolerance && final.TP <= SETTINGS.master.TP, `I ${final.I} LUFS, TP ${final.TP} dBTP (premaster ${pre.I.toFixed(2)} LUFS, gain ${masterGainDb.toFixed(2)} dB; description matched to the film's voice at ${filmVoiceLufs.toFixed(2)} LUFS with ${descGainDb.toFixed(2)} dB)`);

    // No description line touches a voice cue: against the captions' cues (which hold a quarter-second past the voice) and against the measured voice.
    const overlaps = [];
    for (const l of placed) for (const v of voiceSpans) if (l.start < v.end && l.end > v.start) overlaps.push(`${l.id} ${l.start.toFixed(2)}-${l.end.toFixed(2)} with "${v.id}" ${v.start.toFixed(2)}-${v.end.toFixed(2)}`);
    guard('described: no description line overlaps a voice cue (the cue holds a quarter-second past each voice)', overlaps.length === 0, overlaps.join('; ') || `${placed.length} lines against ${voiceSpans.length} cues`);
    const gapOk = placed.every((l) => described(l.next) - l.end >= SETTINGS.endBeforeVoice - 0.01);
    guard(`described: each line ends at least ${SETTINGS.endBeforeVoice} s before the voice that follows it`, gapOk, placed.map((l) => `${l.id} ${Number.isFinite(l.next) ? (described(l.next) - l.end).toFixed(2) : 'last'}`).join(', '));
    // The description track is silent inside every voice span, to the sample.
    let loud = 0;
    for (const v of voiceSpans) for (let i = Math.round(v.voiceStart * SR); i < Math.round(v.voiceEnd * SR); i++) if (descriptionTrack[i] !== 0) loud++;
    guard('described: the description track is silent, sample for sample, wherever the film speaks', loud === 0, `${loud} non-silent samples inside ${voiceSpans.length} voice spans`);

    // ------------------------------------------------------------ 6. the review sheet (only with --qa-dir)
    if (qaDir) {
      const W = 2400;
      const total = totalFrames / FPS;
      const x = (t) => Math.round((t / total) * W);
      const holdBoxes = [];
      let before = 0;
      for (const h of holds) {
        const t0 = at(h.frame) + before;
        holdBoxes.push(`drawbox=x=${x(t0)}:y=0:w=${Math.max(2, x(t0 + h.frames / FPS) - x(t0))}:h=300:color=0x4080ff@0.22:t=fill`);
        before += h.frames / FPS;
      }
      const boxes = [
        ...holdBoxes,
        ...voiceSpans.map((v) => `drawbox=x=${x(v.voiceStart)}:y=0:w=${Math.max(1, x(v.voiceEnd) - x(v.voiceStart))}:h=300:color=0x30d060@0.45:t=fill`),
        ...placed.flatMap((l) => [
          `drawbox=x=${x(l.start)}:y=310:w=${Math.max(1, x(l.end) - x(l.start))}:h=40:color=0xff9020@0.95:t=fill`,
          FONT ? `drawtext=fontfile='${FONT}':text='${l.id}':x=${x(l.start) + 4}:y=322:fontsize=18:fontcolor=black` : null,
        ]),
      ];
      ffmpeg([
        '-i', OUT_MP4, '-filter_complex',
        `[0:a]aformat=channel_layouts=mono,showwavespic=s=${W}x300:colors=white[w];[w]pad=${W}:360:0:0:color=0x101018,${chain(...boxes)}`,
        '-frames:v', '1', join(qaDir, 'described-sheet.png'),
      ]);
      const sil = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', OUT_MP4, '-af', 'silencedetect=noise=-50dB:d=0.4', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
        .split('\n').filter((l) => /silence_(start|end)/.test(l)).map((l) => l.replace(/^.*\] /, ''));
      const stats = voiceSpans.map((v) => {
        const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', OUT_MP4, '-af', `atrim=${v.voiceStart}:${v.voiceEnd},astats=metadata=0:reset=0`, '-f', 'null', '-'], { encoding: 'utf8' });
        const m = r.stderr.split('Overall')[1]?.match(/RMS level dB:\s+(-?[\d.]+)/);
        return `${v.id.padEnd(3)} ${v.voiceStart.toFixed(3)}-${v.voiceEnd.toFixed(3)} s   RMS ${m ? m[1] : 'n/a'} dB`;
      });
      writeFileSync(
        join(qaDir, 'described-checks.txt'),
        [
          `Described version: ${(totalFrames / FPS).toFixed(3)} s, ${totalFrames} frames. Loudness ${final.I} LUFS, true peak ${final.TP} dBTP (film: -14.1 LUFS, -1.3 dBTP).`,
          '',
          'Holds (film second where the picture freezes, and for how long; the film\'s sound pauses too):',
          ...holdList.map((h) => `  ${h.id.padEnd(9)} at ${h.at.toFixed(3)} s for ${h.seconds.toFixed(3)} s  ${h.why}`),
          '',
          'Description lines in the described version (start-end, with where each starts in the film):',
          ...placed.map((l) => `  ${l.id}  ${l.start.toFixed(3)}-${l.end.toFixed(3)} s  (${l.seconds.toFixed(2)} s, ${l.pausesShortened} pauses shortened to ${SETTINGS.pauseKeep} s; starts at film ${l.filmAt} s)  ${l.text}`),
          '',
          "The film's voice cues in the described version (the cue holds 0.25 s past the voice; the voice itself is the green on the sheet):",
          ...voiceSpans.map((v) => `  ${v.id.padEnd(3)} cue ${v.start.toFixed(3)}-${v.end.toFixed(3)}  voice ${v.voiceStart.toFixed(3)}-${v.voiceEnd.toFixed(3)}`),
          '',
          'Overlap test: every line against every cue.',
          overlaps.length ? `  OVERLAPS: ${overlaps.join('; ')}` : '  none: no description line touches a voice cue.',
          '',
          'Level of the described mix inside each voice span (the film\'s voice, with nothing of the description in it):',
          ...stats.map((s) => `  ${s}`),
          '',
          'Silence at -50 dB for 0.4 s or more (the holds with no description in them would show here; each hold has a line speaking, so none of the holds appear):',
          ...(sil.length ? sil.map((s) => `  ${s}`) : ['  none']),
        ].join('\n') + '\n',
      );
    }

    return {
      file: OUT_MP4,
      captionsFile: OUT_VTT,
      md5: md5(OUT_MP4),
      manifest: {
        src: publicPath(OUT_MP4),
        width: probe.width,
        height: probe.height,
        durationSeconds: round(probe.duration, 3),
        fps: FPS,
        bytes: bytes(OUT_MP4),
        type: 'video/mp4',
        aiGenerated: true,
        hasAudio: true,
        md5: md5(OUT_MP4),
        captions: { src: publicPath(OUT_VTT), bytes: bytes(OUT_VTT), type: 'text/vtt', language: 'en', label: 'English' },
        holds: holdList.map(({ at, seconds, why, id }) => ({ id, at, seconds, why })),
        lines: placed.map(({ id, text, filmAt, start, end }) => ({ id, text, filmAt, start, end })),
        cues: voiceSpans.map((v) => ({ id: v.id, start: round(v.start, 3), end: round(v.end, 3) })),
        loudness: { integrated: final.I, truePeak: final.TP },
        voice: { ...VOICE, take: repoPath(TAKE), takeMd5: md5(TAKE) },
      },
    };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

