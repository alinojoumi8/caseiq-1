"""Per-line voice levels. Usage: python line_levels.py <final.mp4> <qa_dir> [<reference.mp4> <reference_tmp_dir>]
Mix columns use critic B's method (active RMS: 20 ms frames within 20 dB of the line's loudest frame, 24 kHz mono, picture window of the line).
Stem columns are measured on the voice stem before ducking (vo.wav): ITU integrated loudness (LUFS) and the same active RMS.
The optional reference render (an earlier version of the spot) adds the "before" columns."""
import json, os, re, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile

BUILD = os.path.dirname(os.path.abspath(__file__))
TMP = os.environ.get("CASEIQ_TMP") or os.path.join(BUILD, "tmp")
mp3, qa = sys.argv[1:3]
ref_mp4, ref_tmp = (sys.argv[3], sys.argv[4]) if len(sys.argv) >= 5 else (None, None)


def load_mix(p, sr=24000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


def act(x, sr):
    n = int(0.02 * sr); f = x[:len(x) // n * n].reshape(-1, n); d = 10 * np.log10(np.mean(f ** 2, axis=1) + 1e-12); k = d > d.max() - 20
    return float(10 * np.log10(np.mean(np.mean(f[k] ** 2, axis=1)) + 1e-12))


def lufs(x, sr=48000):
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, "m.wav"); wavfile.write(p, sr, np.stack([x, x], 1).astype(np.float32))
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
        return float(re.search(r"I:\s+(-?[\d.]+)\s+LUFS", r.stderr.split("Summary:")[-1]).group(1))


P3 = json.load(open(os.path.join(TMP, "audio", "placements.json"), encoding="utf-8"))
variants = [("v3", mp3, os.path.join(TMP, "audio", "vo.wav"))]
if ref_mp4:
    variants.append(("v2", ref_mp4, os.path.join(ref_tmp, "audio", "vo.wav")))
data = {tag: (load_mix(m), wavfile.read(stem)[1].astype(float).mean(1)) for tag, m, stem in variants}
rows = []
for v in P3["voice"]:
    s, e = v["pOnset"], v["pOffset"]
    m = P3["voiceMatch"]["lines"][v["id"]]
    r = {"id": v["id"], "take": m["take"], "text": v["text"], "pOnset": s, "pOffset": e, "gainDb": m["gainDb"]}
    for tag, (mix, st) in data.items():
        r[f"mixAct_{tag}"] = act(mix[int(s * 24000):int(e * 24000)], 24000)
        seg = st[int(s * 48000):int(e * 48000)]
        r[f"stemLufs_{tag}"] = lufs(seg); r[f"stemAct_{tag}"] = act(seg, 48000)
    rows.append(r)


def spread(key):
    if not rows or key not in rows[0]: return None
    v = [r[key] for r in rows]; return max(v) - min(v)


ref = {k: float(np.median([r[k] for r in rows if r["take"] == "t1"])) for k in ("stemLufs_v3", "stemAct_v3", "mixAct_v3")}
summary = {k: {"spread_v2": spread(k.replace("v3", "v2")), "spread_v3": spread(k), "maxDevFromTake1Median_v3": max(abs(r[k] - ref[k]) for r in rows)} for k in ref}
json.dump({"rows": rows, "summary": summary, "refTake1Median_v3": ref}, open(os.path.join(qa, "line_levels.json"), "w"), indent=1)
has2 = bool(ref_mp4)
f = lambda r, k: f"{r[k]:.1f}" if k in r else "n/a"
L = ["# Voice line levels", "",
     "Mix columns: critic B's active-RMS method on the final mix, in each line's picture window (dBFS). Stem columns: the voice stem before ducking, ITU LUFS of the audible span and active RMS (dBFS). 'ref' = the reference (earlier) render, when given.", "",
     "| Line | Take | Gain applied | Stem LUFS ref | Stem LUFS | Stem active ref | Stem active | Mix active ref | Mix active |", "|---|---|---|---|---|---|---|---|---|"]
for r in rows:
    L.append(f"| {r['id']} | {r['take']} | {r['gainDb']:+.2f} dB | {f(r, 'stemLufs_v2')} | {r['stemLufs_v3']:.1f} | {f(r, 'stemAct_v2')} | {r['stemAct_v3']:.1f} | {f(r, 'mixAct_v2')} | {r['mixAct_v3']:.1f} |")
L += ["", "| Measure | spread ref (max-min) | spread | max deviation from take-1 median |", "|---|---|---|---|"]
for k, nm in (("stemLufs_v3", "stem LUFS"), ("stemAct_v3", "stem active RMS"), ("mixAct_v3", "mix active RMS (critic B)")):
    sm = summary[k]; s2 = "n/a" if sm["spread_v2"] is None else f"{sm['spread_v2']:.1f} dB"
    L.append(f"| {nm} | {s2} | {sm['spread_v3']:.1f} dB | {sm['maxDevFromTake1Median_v3']:.2f} dB |")
open(os.path.join(qa, "line_levels.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
