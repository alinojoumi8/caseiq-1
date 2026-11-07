"""QA plots + audio checks. Usage: python qa_plots.py <final.mp4> <qa_dir>
Writes: final_mix_waveform_spectrogram.png, stems_and_cuts.png, music_cut_zooms.png, audio_checks.json, audio_placements.md
"""
import json, os, subprocess, sys, tempfile
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, spectrogram

BUILD = os.path.dirname(os.path.abspath(__file__))
mp4, qa = sys.argv[1], sys.argv[2]
os.makedirs(qa, exist_ok=True)
cfg = json.load(open(os.path.join(BUILD, "config.json"), encoding="utf-8"))
A = os.path.join(os.environ.get("CASEIQ_TMP") or os.path.join(BUILD, "tmp"), "audio")
pl = json.load(open(os.path.join(A, "placements.json"), encoding="utf-8"))
SR = 48000


def load_wav(p):
    sr, x = wavfile.read(p)
    return x.astype(np.float64)


with tempfile.TemporaryDirectory() as td:
    fw = os.path.join(td, "final.wav")
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", mp4, "-vn", "-ac", "2", "-ar", str(SR), "-c:a", "pcm_f32le", fw], check=True)
    fin = load_wav(fw)
mono = fin.mean(1)
t = np.arange(len(mono)) / SR
stems = {k: load_wav(os.path.join(A, f"{k}.wav")) for k in ("vo", "music", "native", "sfx", "room")}
checks = {}


def db(x): return 20 * np.log10(np.maximum(x, 1e-12))


# ---------------------------------------------------------------- 1) final mix waveform + spectrogram on a 1 s grid
fig, ax = plt.subplots(3, 1, figsize=(24, 12), sharex=True, gridspec_kw={"height_ratios": [1.2, 2.4, 0.5]})
step = SR // 100
env = np.array([np.abs(mono[i:i + step]).max() for i in range(0, len(mono) - step, step)])
te = np.arange(len(env)) * 0.01
ax[0].fill_between(te, -env, env, color="#2438a8", lw=0)
ax[0].set_ylim(-1, 1); ax[0].set_ylabel("final mix (peak env)")
for v in pl["voice"]:
    ax[0].axvspan(v["pOnset"], v["pOffset"], color="#f0a030", alpha=0.25); ax[0].text(v["pOnset"], 0.85, v["id"], fontsize=9)
f, tt, S = spectrogram(mono, SR, nperseg=2048, noverlap=1536, window="hann")
ax[1].pcolormesh(tt, f, 10 * np.log10(S + 1e-14), cmap="magma", vmin=-110, vmax=-30, shading="auto")
ax[1].set_yscale("symlog", linthresh=200); ax[1].set_ylim(40, 16000); ax[1].set_ylabel("Hz (log)")
ev = [(cfg["overlay"]["panelIn"], "panel lift"), (cfg["overlay"]["panelOut"], "cut to clip3"), (cfg["overlay"]["endCard"], "end card"), (5.15, "lift"), (6.717, "land")]
for x_, lab in ev:
    for a in ax[:2]: a.axvline(x_, color="cyan", lw=0.8, ls="--")
    ax[0].text(x_ + 0.03, -0.95, lab, color="#006", fontsize=9)
# 1 s grid
for a in ax[:2]:
    a.set_xticks(np.arange(0, 31, 1)); a.grid(True, axis="x", color="w" if a is ax[1] else "#bbb", alpha=0.35, lw=0.6)
st_ = 0.1
sh = np.array([db(np.sqrt(np.mean(mono[int(i * SR):int((i + 0.4) * SR)] ** 2))) for i in np.arange(0, 29.6, 0.1)])
ax[2].plot(np.arange(0, 29.6, 0.1), sh, color="k", lw=1); ax[2].set_ylim(-70, 0); ax[2].set_ylabel("400 ms RMS dBFS"); ax[2].grid(True, alpha=0.3)
ax[2].set_xlabel("picture time P (s)"); ax[2].set_xlim(0, 30)
plt.tight_layout(); plt.savefig(os.path.join(qa, "final_mix_waveform_spectrogram.png"), dpi=70); plt.close()

# ---------------------------------------------------------------- 2) stems with cut markers
fig, ax = plt.subplots(5, 1, figsize=(24, 13), sharex=True)
for a, (k, nm) in zip(ax, [("vo", "voice"), ("music", "music (ducked, levelled)"), ("native", "native clip audio"), ("sfx", "effects"), ("room", "room tone")]):
    x = stems[k].mean(1)
    e = np.array([np.abs(x[i:i + step]).max() for i in range(0, len(x) - step, step)])
    a.fill_between(np.arange(len(e)) * 0.01, -e, e, color="#2438a8", lw=0); a.set_ylabel(nm); a.grid(True, axis="x", alpha=0.3)
    a.set_xticks(np.arange(0, 31, 1))
for v in pl["voice"]:
    ax[0].axvspan(v["pOnset"], v["pOffset"], color="#f0a030", alpha=0.25); ax[0].text(v["pOnset"], 0.6 * np.abs(stems["vo"]).max(), v["id"], fontsize=9)
    ax[0].axvline(v["pCutStart"], color="r", lw=0.5); ax[0].axvline(v["pCutEnd"], color="r", lw=0.5)
for m in pl["music"]:
    for a_ in (ax[1],):
        a_.axvline(m["pStart"], color="g", lw=1); a_.axvline(m["pEnd"], color="r", lw=1)
        a_.text(m["pStart"] + 0.05, 0.7 * np.abs(stems["music"]).max(), m["id"], fontsize=9)
# detected onsets in the music stem (1.5 kHz hp env derivative)
mus = stems["music"].mean(1)
hp = sosfilt(butter(4, 1500, "hp", fs=SR, output="sos"), mus)
h = int(0.004 * SR)
en = np.array([np.sqrt(np.mean(hp[i:i + 2 * h] ** 2)) for i in range(0, len(hp) - 2 * h, h)])
d = np.maximum(0, np.diff(np.log(en + 1e-7)))
from scipy.signal import find_peaks
pk, _ = find_peaks(d, height=0.8, distance=int(0.06 / 0.004))
ons = pk * 0.004 + 0.004
ax[1].plot(ons, np.full(len(ons), -0.9 * np.abs(mus).max()), "v", color="m", ms=4)
ioi = np.diff(ons)
checks["musicOnsetsDetected"] = len(ons)
checks["musicMinIOI"] = float(ioi.min()) if len(ioi) else None
checks["musicDoubledHits(IOI<0.12s)"] = [round(float(ons[i]), 3) for i in np.where(ioi < 0.12)[0]]
ax[4].set_xlabel("picture time P (s)"); ax[0].set_xlim(0, 30)
plt.tight_layout(); plt.savefig(os.path.join(qa, "stems_and_cuts.png"), dpi=60); plt.close()

# ---------------------------------------------------------------- 3) zooms on every music cut (waveform + onset env)
cuts = []
for m in pl["music"]:
    cuts.append((m["id"] + " start", m["pStart"])); cuts.append((m["id"] + " end", m["pEnd"]))
cuts = [c for c in cuts if 0.05 < c[1] < 29.95]
fig, axs = plt.subplots(2, (len(cuts) + 1) // 2, figsize=(5 * ((len(cuts) + 1) // 2), 7))
click = {}
for a, (nm, tc) in zip(axs.flat, cuts):
    i0, i1 = int((tc - 0.12) * SR), int((tc + 0.12) * SR)
    seg = mus[max(0, i0):i1]
    a.plot(np.arange(len(seg)) / SR + max(0, i0) / SR, seg, lw=0.5); a.axvline(tc, color="r", lw=0.8); a.set_title(f"{nm} P={tc:.3f}", fontsize=9)
    jump = np.abs(np.diff(mus[int((tc - 0.006) * SR):int((tc + 0.006) * SR)])).max() if tc > 0.01 else 0
    ref = np.sqrt(np.mean(mus[int(max(0, tc - 0.06) * SR):int((tc + 0.06) * SR)] ** 2)) + 1e-9
    click[nm] = float(jump / ref)
for a in list(axs.flat)[len(cuts):]: a.axis("off")
plt.tight_layout(); plt.savefig(os.path.join(qa, "music_cut_zooms.png"), dpi=60); plt.close()
checks["musicCutJumpRatio(max sample jump / local RMS)"] = {k: round(v, 3) for k, v in click.items()}
checks["musicCutJumpRatioMax"] = max(click.values())

# ---------------------------------------------------------------- 4) numeric checks
checks["finalPeakSampleDb"] = float(db(np.abs(fin).max()))
checks["voiceEdgeMarginMs"] = {v["id"]: v["edgeIntoSilenceMs"] for v in pl["voice"]}
checks["voiceMinEdgeMarginMs"] = min(min(v["edgeIntoSilenceMs"]) for v in pl["voice"])
# silence tail
tail = mono[int(29.9 * SR):]
checks["rmsDbAfter29.9s"] = float(db(np.sqrt(np.mean(tail ** 2))))
checks["peakDbAfter29.9s"] = float(db(np.abs(tail).max()))
seg = mono[int(29.0 * SR):int(29.5 * SR)]
checks["rmsDb29.0-29.5s"] = float(db(np.sqrt(np.mean(seg ** 2))))
# music tail level per second after the chord (stem, post duck/level)
checks["musicTailRmsDbPerSecond"] = {f"{s}-{s+1}": round(float(db(np.sqrt(np.mean(mus[int(s * SR):int((s + 1) * SR)] ** 2)))), 1) for s in range(24, 30)}
tail2 = mono[int(29.95 * SR):]
checks["rmsDbAfter29.95s"] = float(db(np.sqrt(np.mean(tail2 ** 2))))
# M2->M3 seam: no hole in the music stem 13.6-14.6 s (20 ms windows)
w20 = int(0.02 * SR)
seam = [db(np.sqrt(np.mean(mus[i:i + w20] ** 2))) for i in range(int(13.6 * SR), int(14.6 * SR), w20)]
checks["musicSeamMinRmsDb"] = float(min(seam))
# ring-out: periodicity of the detrended envelope (a loop would repeat); 26-29.5 s of the final mix, 20 ms RMS
hop = int(0.02 * SR)
lo_, hi_ = int(26.0 * SR), int(29.5 * SR)
envr = np.array([db(np.sqrt(np.mean(mono[i:i + hop] ** 2))) for i in range(lo_, hi_, hop)])
k_ = 25
sm = np.convolve(envr, np.ones(k_) / k_, mode="same")
dtr = (envr - sm)[k_:-k_]
dtr = dtr - dtr.mean()
ac = np.correlate(dtr, dtr, "full")[len(dtr) - 1:]
ac = ac / ac[0]
lags = np.arange(len(ac)) * 0.02
sel = (lags >= 0.25) & (lags <= 1.6)
checks["ringOutEnvAutocorrMax"] = float(ac[sel].max())
checks["ringOutEnvAutocorrAtLag"] = float(lags[sel][np.argmax(ac[sel])])
# zoom figures on the final mix: 13.6-14.6 (music seam) and 23.5-30.0 (end card, resolve, ring-out)
for (z0, z1, nm) in [(13.6, 14.6, "zoom_13_6-14_6s.png"), (23.5, 30.0, "zoom_23_5-30_0s.png")]:
    fig, axz = plt.subplots(3, 1, figsize=(18, 9), sharex=True, gridspec_kw={"height_ratios": [1, 1, 2]})
    i0, i1 = int(z0 * SR), int(z1 * SR)
    tz = np.arange(i0, i1) / SR
    axz[0].plot(tz, mono[i0:i1], lw=0.4, color="#2438a8"); axz[0].set_ylabel("final mix")
    axz[1].plot(tz, mus[i0:i1], lw=0.4, color="#a03030"); axz[1].set_ylabel("music stem")
    ff, tt2, SS = spectrogram(mono[i0:i1], SR, nperseg=4096 if z1 - z0 > 2 else 2048, noverlap=3072 if z1 - z0 > 2 else 1792)
    axz[2].pcolormesh(tt2 + z0, ff, 10 * np.log10(SS + 1e-14), cmap="magma", vmin=-120, vmax=-30, shading="auto")
    axz[2].set_yscale("symlog", linthresh=200); axz[2].set_ylim(40, 12000); axz[2].set_ylabel("Hz")
    step_ = 0.1 if z1 - z0 <= 1.5 else 0.5
    for a in axz:
        a.set_xticks(np.arange(z0, z1 + 1e-6, step_)); a.grid(True, axis="x", alpha=0.3); a.tick_params(axis="x", labelsize=7)
    axz[2].set_xlabel("picture time P (s)")
    plt.tight_layout(); plt.savefig(os.path.join(qa, nm), dpi=70); plt.close()
# voice vs music windows: are the bubbles' voice windows ducked?
json.dump(checks, open(os.path.join(qa, "audio_checks.json"), "w"), indent=1)

# ---------------------------------------------------------------- 5) placement table
L = []
L.append("# Audio placement table (picture time P)\n")
L.append("## Voice (vo.mp3 / vo_take2.mp3 cut in silences, 10 ms fades; P = first audible sample, > -40 dBFS)\n")
L.append("| Line | Text | vo.mp3 cut (s) | audible in source (s) | cut edge inside silence (ms, head/tail) | P onset | P end of speech |")
L.append("|---|---|---|---|---|---|---|")
for v in pl["voice"]:
    L.append(f"| {v['id']} ({'take 2' if v.get('take') == 't2' else 'take 1'}) | {v['text']} | {v['srcFrom']:.3f}-{v['srcTo']:.3f} | {v['srcOnset']:.3f}-{v['srcOffset']:.3f} | {v['edgeIntoSilenceMs'][0]} / {v['edgeIntoSilenceMs'][1]} | {v['pOnset']:.3f} | {v['pOffset']:.3f} |")
L.append("\n## Music (music.mp3; anchors are attack-start times in the source)\n")
L.append("| Segment | source (s) | P (s) | note |")
L.append("|---|---|---|---|")
for m in pl["music"]:
    L.append(f"| {m['id']} | {m['srcStart']}-{m['srcEnd']} | {m['pStart']}-{m['pEnd']} | {m['note']} |")
L.append("\nAnchors (source attack time, measured level rise): " + ", ".join(f"{k} {v['t']} s (+{v['riseDb']} dB)" for k, v in pl["music_anchors"].items()))
L.append("\n## Native audio (clip audio, high-passed at 90 Hz, retimed with the picture)\n")
L.append("| Picture segment | P | source audio | mode |")
L.append("|---|---|---|---|")
for n in pl["native"]:
    L.append(f"| {n['seg']} | {n['p'][0]}-{n['p'][1]} | {n.get('clip','-')} {n.get('srcAudioStart','')} | {n.get('mode', n.get('audio'))} |")
L.append("\n## Effects\n")
L.append("| Effect | P start | P end |")
L.append("|---|---|---|")
for s in pl["sfx"]:
    L.append(f"| {s['id']} | {s['pStart']} | {s['pEnd']} |")
L.append("\n## Levels\n")
L.append("```\n" + json.dumps(pl["levels"], indent=1) + "\n```")
open(os.path.join(qa, "audio_placements.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(json.dumps(checks, indent=1))
