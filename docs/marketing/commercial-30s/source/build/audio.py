"""Audio stems for the Case IQ 30 s spot. Usage: python audio.py   (run from anywhere; reads build/config.json)

Writes build/tmp/audio/*.wav (48 kHz float stems, 30.000 s) and build/tmp/audio/placements.json.
Stems: vo, music (ducked, level-matched), native (clip audio retimed with the picture), sfx, room, premaster (sum).
The final loudnorm / AAC encode / mux is done by assemble.mjs.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
BUILD = os.path.dirname(os.path.abspath(__file__))
W = os.path.dirname(BUILD)
A = os.path.join(os.environ.get("CASEIQ_TMP") or os.path.join(BUILD, "tmp"), "audio")
os.makedirs(A, exist_ok=True)
cfg = json.load(open(os.path.join(BUILD, "config.json"), encoding="utf-8"))
FPS = cfg["fps"]
DUR = cfg["nFrames"] / FPS
N = int(round(DUR * SR))
rep = {"voice": [], "music": [], "native": [], "sfx": [], "levels": {}}


def db(x):
    return 20 * np.log10(np.maximum(x, 1e-12))


def lin(d):
    return 10 ** (d / 20.0)


def decode(path, ss=None, t=None, stereo=False, af=None):
    """ffmpeg -> float32 array at 48 kHz, shape (n,) or (n,2)."""
    with tempfile.TemporaryDirectory() as td:
        out = os.path.join(td, "o.wav")
        cmd = ["ffmpeg", "-hide_banner", "-v", "error", "-y"]
        if ss is not None: cmd += ["-ss", str(ss)]
        if t is not None: cmd += ["-t", str(t)]
        cmd += ["-i", path, "-vn"]
        if af: cmd += ["-af", af]
        cmd += ["-ac", "2" if stereo else "1", "-ar", str(SR), "-c:a", "pcm_f32le", out]
        subprocess.run(cmd, check=True)
        sr, x = wavfile.read(out)
        return x.astype(np.float64)


def write(name, x):
    wavfile.write(os.path.join(A, name), SR, x.astype(np.float32))


def st(x):
    """mono -> stereo (n,2)"""
    return np.stack([x, x], axis=1) if x.ndim == 1 else x


def lufs(x):
    """integrated loudness of a stereo/mono float array via ffmpeg ebur128 (I)."""
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, "m.wav")
        wavfile.write(p, SR, st(x).astype(np.float32))
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
        s = r.stderr.split("Summary:")[-1]
        import re
        m = re.search(r"I:\s+(-?[\d.]+)\s+LUFS", s)
        return float(m.group(1)) if m else float("nan")


def env_db(x, win=0.05, hop=0.01):
    m = x if x.ndim == 1 else x.mean(1)
    w = int(win * SR); h = int(hop * SR)
    n = max(0, (len(m) - w) // h)
    return np.array([db(np.sqrt(np.mean(m[i * h:i * h + w] ** 2))) for i in range(n)])


def place(buf, x, t0, gain=1.0):
    """add stereo x into buf at time t0 (s); clipped to the buffer."""
    i0 = int(round(t0 * SR))
    a = max(0, -i0); b = min(len(x), len(buf) - i0)
    if b > a:
        buf[i0 + a:i0 + b] += x[a:b] * gain


def fade(x, fin=0.0, fout=0.0, shape="cos"):
    y = x.copy()
    ni = int(fin * SR); no = int(fout * SR)
    if ni > 0:
        r = np.linspace(0, 1, ni, endpoint=False)
        r = np.sin(r * np.pi / 2) ** 2 if shape == "cos" else (np.sin(r * np.pi / 2) if shape == "eq" else r)
        y[:ni] *= r[:, None] if y.ndim == 2 else r
    if no > 0:
        r = np.linspace(1, 0, no, endpoint=True)
        r = np.sin(r * np.pi / 2) ** 2 if shape == "cos" else (np.sin(r * np.pi / 2) if shape == "eq" else r)
        y[-no:] *= r[:, None] if y.ndim == 2 else r
    return y


def highpass(x, f, order=2):
    sos = butter(order, f, "hp", fs=SR, output="sos")
    return sosfilt(sos, x, axis=0)


def bandpass(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], "bp", fs=SR, output="sos")
    return sosfilt(sos, x, axis=0)


def lowpass(x, f, order=2):
    sos = butter(order, f, "lp", fs=SR, output="sos")
    return sosfilt(sos, x, axis=0)


def refine_onset(x, nominal, half=0.035, hp=None):
    """Sample-accurate attack time: max rise of the 1 ms log-RMS envelope within nominal +/- half."""
    m = x if x.ndim == 1 else x.mean(1)
    if hp: m = highpass(m, hp)
    h = int(0.001 * SR)
    a = int((nominal - half) * SR); b = int((nominal + half) * SR)
    seg = m[a:b]
    n = len(seg) // h
    e = np.array([db(np.sqrt(np.mean(seg[i * h:(i + 1) * h] ** 2))) for i in range(n)])
    d = np.diff(e)
    k = int(np.argmax(d))
    return (a + (k + 1) * h) / SR


# ------------------------------------------------------------------ picture map (for native audio)
pic = []
acc = 0.0
for s in cfg["picture"]:
    pic.append({**s, "p0": acc, "p1": acc + s["outDuration"]}); acc += s["outDuration"]

# ------------------------------------------------------------------ VOICE
V = cfg["voice"]
vo_srcs = {k: decode(os.path.join(W, p)) for k, p in V["srcs"].items()}
thr = V["onsetThresholdDb"]
vo = np.zeros((N, 2))
vo_spans = []
active = []


def audible_span(vo_src, ln):
    a, b = int(ln["from"] * SR), int(ln["to"] * SR)
    seg = vo_src[a:b]
    h = int(0.005 * SR)
    e = np.array([db(np.sqrt(np.mean(seg[i * h:(i + 1) * h] ** 2))) for i in range(len(seg) // h)])
    idx = np.where(e > thr)[0]
    return ln["from"] + idx[0] * 0.005, ln["from"] + (idx[-1] + 1) * 0.005


def active_rms_db(x):
    """critic B's metric: RMS over 20 ms frames within 20 dB of the line's loudest frame (pauses excluded)"""
    n = int(0.02 * SR)
    f = x[:len(x) // n * n].reshape(-1, n)
    d = 10 * np.log10(np.mean(f ** 2, axis=1) + 1e-12)
    k = d > d.max() - 20
    return 10 * np.log10(np.mean(np.mean(f[k] ** 2, axis=1)) + 1e-12)


# level-match every line to the median of the take-1 lines, on the unducked voice stem, before placement.
# Two measures per line (ITU integrated loudness of the audible span, and critic B's 20 ms active RMS); each line gets the gain
# that centres both on their take-1 medians, so neither measure can be more than half their disagreement off.
meas = {}
for ln in V["lines"]:
    on_, off_ = audible_span(vo_srcs[ln["take"]], ln)
    x_ = vo_srcs[ln["take"]][int(on_ * SR):int(off_ * SR)]
    meas[ln["id"]] = {"take": ln["take"], "lufs": lufs(x_), "act": float(active_rms_db(x_)), "peak": float(db(np.abs(x_).max()))}
ref_l = float(np.median([m["lufs"] for m in meas.values() if m["take"] == "t1"]))
ref_a = float(np.median([m["act"] for m in meas.values() if m["take"] == "t1"]))
vgain = {}
for k_, m in meas.items():
    dl, da = m["lufs"] - ref_l, m["act"] - ref_a
    vgain[k_] = -(dl + da) / 2 if V.get("match", True) else 0.0
    m.update({"dLufs": round(dl, 2), "dAct": round(da, 2), "gainDb": round(vgain[k_], 2), "lufsAfter": round(m["lufs"] + vgain[k_], 2), "actAfter": round(m["act"] + vgain[k_], 2), "peakAfter": round(m["peak"] + vgain[k_], 2)})
rep["voiceMatch"] = {"refLufs": round(ref_l, 2), "refActDb": round(ref_a, 2), "lines": meas}
for ln in V["lines"]:
    vo_src = vo_srcs[ln["take"]] * lin(vgain[ln["id"]])
    a, b = int(ln["from"] * SR), int(ln["to"] * SR)
    seg = vo_src[a:b].copy()
    # audible span: first/last 5 ms window above the threshold
    h = int(0.005 * SR)
    raw_seg = vo_srcs[ln["take"]][a:b]              # audible span / silence margins are judged on the unscaled source (-40 dBFS), not the gain-matched copy
    e = np.array([db(np.sqrt(np.mean(raw_seg[i * h:(i + 1) * h] ** 2))) for i in range(len(raw_seg) // h)])
    idx = np.where(e > thr)[0]
    on = ln["from"] + idx[0] * 0.005
    off = ln["from"] + (idx[-1] + 1) * 0.005
    seg = fade(seg, V["cutFade"], V["cutFade"], "lin")
    t0 = ln["onsetAt"] - (on - ln["from"])        # P time of the cut start
    place(vo, st(seg), t0)
    active.append(vo_src[int(on * SR):int(off * SR)])
    span = (ln["onsetAt"], ln["onsetAt"] + (off - on))
    vo_spans.append(span)
    # silence margin check: how far each cut edge sits inside the neighbouring silence (-40 dBFS)
    rep["voice"].append({"id": ln["id"], "take": ln["take"], "text": ln["text"], "srcFrom": ln["from"], "srcTo": ln["to"], "srcOnset": round(on, 3), "srcOffset": round(off, 3),
                         "edgeIntoSilenceMs": [round((on - ln["from"]) * 1000), round((ln["to"] - off) * 1000)],
                         "pOnset": round(span[0], 3), "pOffset": round(span[1], 3), "pCutStart": round(t0, 3), "pCutEnd": round(t0 + (ln["to"] - ln["from"]), 3)})
vo_act = np.concatenate(active)
vo_rms_db = db(np.sqrt(np.mean(vo_act ** 2)))
vo_peak_db = db(np.abs(vo).max())
vo_I = lufs(vo)
rep["levels"]["vo"] = {"activeRmsDb": round(float(vo_rms_db), 2), "peakDb": round(float(vo_peak_db), 2), "I": vo_I}
write("vo.wav", vo)

# duck envelope (0..1) from VO spans
tt = np.arange(N) / SR
duck_env = np.zeros(N)
for (s, e) in vo_spans:
    a_, r_ = V["duckAttack"], V["duckRelease"]
    env = np.clip((tt - (s - a_)) / a_, 0, 1) * np.clip(((e + r_) - tt) / r_, 0, 1)
    duck_env = np.maximum(duck_env, env)
duck_gain = lin(V["duckDb"] * duck_env)

# ------------------------------------------------------------------ MUSIC
M = cfg["music"]
mu = decode(os.path.join(W, M["src"]), stereo=True)
mono = mu.mean(1)
anc = dict(M["anchors"])
def rise_db(x, t, band):
    """level jump across an attack: mean 1.5 ms env in [t, t+12 ms] minus [t-20 ms, t-4 ms], in the anchor's band"""
    m = x.mean(1)
    m = highpass(m, 1500, 4) if band == "hp" else (bandpass(m, 50, 200, 4) if band == "lo" else m)
    f = lambda a, b: db(np.sqrt(np.mean(m[int(a * SR):int(b * SR)] ** 2)))
    return f(t, t + 0.012) - f(t - 0.020, t - 0.004)
bands = {"pulse13": "hp", "pulse21": "hp", "swell": "bb", "warm": "bb", "resolve": "lo"}
rep["music_anchors"] = {k: {"t": anc[k], "riseDb": round(float(rise_db(mu, anc[k], bands[k])), 1)} for k in anc}
for k, v in rep["music_anchors"].items():
    if v["riseDb"] < (3 if k == "swell" else 6): raise SystemExit(f"anchor {k} at {v['t']} does not look like an attack (rise {v['riseDb']} dB)")
music = np.zeros((N, 2))


def src_seg(a, b):
    return mu[int(round(a * SR)):int(round(b * SR))].copy()


# M1: trimmed head (0.3 s) with a 15 ms fade-in, P = src - srcStart; stops 3 ms before the pulse13 attack (the lift) with a 40 ms fade
m1 = M["m1"]
m1_end = anc[m1["srcEnd"]] - 0.003
seg = fade(src_seg(m1["srcStart"], m1_end), m1["fadeIn"], m1["fadeOut"])
place(music, seg, 0.0)
rep["music"].append({"id": "M1", "srcStart": m1["srcStart"], "srcEnd": round(m1_end, 3), "pStart": 0.0, "pEnd": round(m1_end - m1["srcStart"], 3),
                     "note": f"P = src - {m1['srcStart']} (head trimmed, 15 ms fade-in); stops {1000*(anc[m1['srcEnd']]-m1_end):.0f} ms before the pulse hit at src {anc[m1['srcEnd']]:.3f} (P {anc[m1['srcEnd']]-m1['srcStart']:.3f} = the lift); 40 ms fade"})
# M2: pulse resumes from the pulse21 hit, swell accent anchored on the panel lift; its natural decay runs under M3's entrance
m2 = M["m2"]
off2 = m2["at"] - anc[m2["anchor"]]                       # P = src + off2
s2 = anc[m2["srcStart"]] - M["preroll"]
seg = fade(src_seg(s2, m2["srcEnd"]), m2["fadeIn"], m2["fadeOut"], "eq")
place(music, seg, s2 + off2)
rep["music"].append({"id": "M2", "srcStart": round(s2, 3), "srcEnd": m2["srcEnd"], "pStart": round(s2 + off2, 3), "pEnd": round(m2["srcEnd"] + off2, 3),
                     "note": f"first hit src {anc[m2['srcStart']]:.3f} -> P {anc[m2['srcStart']] + off2:.3f}; swell accent src {anc[m2['anchor']]:.3f} -> P {m2['at']:.3f}; last {m2['fadeOut']} s crossfades into M3"})
# M3: natural run of the source to its end (warm section, resolve chord, natural ring-out), entering under M2's decay;
# the ring-out is extended only by a diffuse (random-noise IR) reverb tail, no loops
m3 = M["m3"]
off3 = m3["at"] - anc[m3["anchor"]]
ro = m3["ringOut"]
s3 = m3["srcStart"]
nat = src_seg(s3, len(mu) / SR)
nat = fade(nat, m3["fadeIn"], 0.0, "eq")
place(music, nat, s3 + off3)
rv = ro["reverb"]
rng_r = np.random.default_rng(11)
n_ir = int(rv["rt60"] * SR)
tir = np.arange(n_ir) / SR
ir = rng_r.standard_normal((n_ir, 2)) * np.exp(-6.908 * tir / rv["rt60"])[:, None]
ir = lowpass(ir, rv["lowpassHz"], 2)
ir[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]       # soft onset, no click
ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
from scipy.signal import fftconvolve
rin = src_seg(rv["fromSrc"], len(mu) / SR)
rin = fade(rin, 0.004, 0.0)
wet = fftconvolve(rin, ir, axes=0) * lin(rv["wetDb"])
place(music, wet, rv["fromSrc"] + off3)
# fade to silence by silentBy
fs_ = ro["fadeStart"]
u = np.clip((tt - fs_) / (ro["silentBy"] - fs_), 0, 1)
music *= (np.cos(u * np.pi / 2) ** 2)[:, None]
music[tt >= ro["silentBy"]] = 0
rep["music"].append({"id": "M3", "srcStart": s3, "srcEnd": round(len(mu) / SR, 3), "pStart": round(s3 + off3, 3), "pEnd": round(len(mu) / SR + off3, 3),
                     "note": f"enters under M2's decay (0.10 s equal-power crossfade at P {s3 + off3:.3f}); warm-section first hit src {anc['warm']:.3f} -> P {anc['warm'] + off3:.3f}; resolve chord src {anc['resolve']:.3f} -> P {anc['resolve'] + off3:.3f} (end card at {cfg['overlay']['endCard']}); natural ring-out"})
rep["music"].append({"id": "M3-reverb", "srcStart": rv["fromSrc"], "srcEnd": round(len(mu) / SR, 3), "pStart": round(rv["fromSrc"] + off3, 3), "pEnd": ro["silentBy"],
                     "note": f"diffuse noise-IR reverb tail (RT60 {rv['rt60']} s, wet {rv['wetDb']} dB, low-passed {rv['lowpassHz']} Hz), cosine fade from {ro['fadeStart']} to silence at {ro['silentBy']}; no loops"})
rep["music_resolveP"] = round(anc["resolve"] + off3, 3)
# duck under the voice, then match to VO loudness
music_d = music * duck_gain[:, None]
mI = lufs(music_d)
mg = (vo_I - M["musicBelowVoiceLU"]) - mI
music_d *= lin(mg)
rep["levels"]["music"] = {"rawI": round(mI, 2), "gainDb": round(float(mg), 2), "I": round(lufs(music_d), 2)}
write("music.wav", music_d)
music_active_db = float(np.percentile(env_db(music_d[(tt > 0) & (tt < 24)]), 75))

# ------------------------------------------------------------------ NATIVE (clip audio, retimed with the picture)
Nv = cfg["native"]
X = Nv["crossfade"]
clipA = {}
for cid, p in cfg["clips"].items():
    x = decode(os.path.join(W, p))
    x = highpass(x, Nv["highpassHz"])
    clipA[cid] = x * lin(Nv["clipGainDb"][cid])
native = np.zeros(N)


def a0_of(s):
    if "holdFrame" in s: return None
    if abs((s["srcEnd"] - s["srcStart"]) - s["outDuration"]) < 1e-3: return s["srcStart"]
    return s["srcEnd"] - s["outDuration"]       # compressed segment: keep its end-aligned part at 1x (no pitch shift)


for i, s in enumerate(pic):
    a0 = a0_of(s)
    if a0 is None:
        rep["native"].append({"seg": s["name"], "p": [round(s["p0"], 3), round(s["p1"], 3)], "audio": "silent (hold)"}); continue
    first, last = (i == 0), (i == len(pic) - 1) or ("holdFrame" in pic[i + 1] if i + 1 < len(pic) else True)
    t_a = s["p0"] - (0 if first else X / 2)
    t_b = s["p1"] + (0 if "holdFrame" in pic[i + 1] else X / 2) if i + 1 < len(pic) else s["p1"]
    ia, ib = int(round(t_a * SR)), int(round(t_b * SR))
    ts = (np.arange(ia, ib) / SR - s["p0"]) + a0
    x = clipA[s["clip"]]
    j = np.clip((ts * SR).astype(int), 0, len(x) - 1)
    chunk = np.where((ts >= 0) & (ts < len(x) / SR), x[j], 0.0)
    pt = np.arange(ia, ib) / SR
    w = np.ones(len(chunk))
    # continuity with the previous / next segment decides linear vs equal-power crossfade
    def cont(sa, sb):
        if sa["clip"] != sb["clip"] or "holdFrame" in sa or "holdFrame" in sb: return False
        ea = a0_of(sa) + sa["outDuration"]
        return abs(ea - a0_of(sb)) < 1e-3
    if not first:
        u = np.clip((pt - (s["p0"] - X / 2)) / X, 0, 1)
        w *= u if cont(pic[i - 1], s) else np.sin(u * np.pi / 2)
    if i + 1 < len(pic) and "holdFrame" not in pic[i + 1]:
        u = np.clip((pt - (s["p1"] - X / 2)) / X, 0, 1)
        w *= (1 - u) if cont(s, pic[i + 1]) else np.cos(u * np.pi / 2)
    elif i + 1 < len(pic):
        # next is a hold of the same clip: fade the tail out over X
        u = np.clip((pt - (s["p1"] - X)) / X, 0, 1)
        w *= (1 - u)
    native[ia:ib] += chunk * w
    rep["native"].append({"seg": s["name"], "clip": s["clip"], "p": [round(s["p0"], 3), round(s["p1"], 3)], "srcAudioStart": round(a0, 3), "mode": "1x" if abs((s["srcEnd"] - s["srcStart"]) - s["outDuration"]) < 1e-3 else "end-aligned (compressed)"})
# tame the thuds, then level by the 75th-percentile 50 ms window (the gated integrated loudness would be set by the single thud)
import subprocess as sp
with tempfile.TemporaryDirectory() as td:
    p_in, p_out = os.path.join(td, "a.wav"), os.path.join(td, "b.wav")
    wavfile.write(p_in, SR, native.astype(np.float32))
    sp.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", p_in, "-af", Nv["thudCompressor"], "-c:a", "pcm_f32le", p_out], check=True)
    _, native = wavfile.read(p_out); native = native.astype(np.float64)
native = native[:N]
e_ = env_db(native)
nat_p75 = float(np.percentile(e_[e_ > -75], 75))
n_target = music_active_db - Nv["belowMusicLU"]
n_gain = n_target - nat_p75
native *= lin(n_gain)
ceil = lin(vo_peak_db - 10)
native = ceil * np.tanh(native / ceil)                     # soft ceiling: the thud stays felt, 10 dB under the voice peak
rep["levels"]["native"] = {"p75WindowDb": round(nat_p75, 2), "targetDb": round(n_target, 2), "gainDb": round(n_gain, 2), "peakDb": round(float(db(np.abs(native).max())), 2), "ceilingDb": round(float(vo_peak_db - 10), 2)}
native = st(native)
# duck the native bed a little under the voice (3 dB), so the thud/rustle never masks a word
native *= lin(-3 * duck_env)[:, None]
write("native.wav", native)

# ------------------------------------------------------------------ SFX
sfx = np.zeros((N, 2))
S = cfg["sfx"]
wh = S["whoosh"]
w = decode(os.path.normpath(os.path.join(W, wh["src"])), ss=wh["srcStart"], t=wh["dur"])
w = highpass(w, 90); w = lowpass(w, 7000)
w = fade(st(w), wh["fadeIn"], wh["fadeOut"])
w_rms = np.sqrt(np.mean(w ** 2))
w *= lin(vo_rms_db - wh["belowVoiceDb"]) / w_rms
place(sfx, w, wh["at"])
rep["sfx"].append({"id": "lift whoosh", "src": f"finalA.mp4 {wh['srcStart']}-{wh['srcStart']+wh['dur']}", "pStart": wh["at"], "pEnd": round(wh["at"] + wh["dur"], 3)})
rng = np.random.default_rng(7)
# paper swish at the panel lift: band-passed noise, 20 ms attack, ~0.34 s decay, centre rising 1.6 -> 4.5 kHz
sw = S["swish"]
n = int(sw["dur"] * SR)
nz = rng.standard_normal(n)
lo_band = bandpass(nz, 1200, 3200); hi_band = bandpass(nz, 3200, 7500)
mixr = np.linspace(0, 1, n)
sw_sig = lo_band * (1 - mixr) + hi_band * mixr
tt_s = np.arange(n) / SR
sw_env = np.minimum(1, tt_s / 0.02) * np.exp(-tt_s / 0.085)
sw_sig = st(sw_sig * sw_env)
sw_sig = fade(sw_sig, 0.0, 0.05)
sw_sig *= lin(vo_rms_db - sw["belowVoiceDb"]) / np.sqrt(np.mean(sw_sig ** 2) + 1e-12)
place(sfx, sw_sig, sw["at"])
rep["sfx"].append({"id": "paper swish (synth)", "pStart": sw["at"], "pEnd": round(sw["at"] + sw["dur"], 3)})
# row ticks: 2.4 kHz click + 170 Hz thump, very quiet
tk = S["ticks"]
n = int(0.09 * SR)
tt_k = np.arange(n) / SR
tick = (np.sin(2 * np.pi * 2400 * tt_k) * np.exp(-tt_k / 0.006) * 0.8 + np.sin(2 * np.pi * 170 * tt_k) * np.exp(-tt_k / 0.025) * 0.6)
tick = fade(tick[:, None].repeat(2, 1), 0.0005, 0.01)
tick *= lin(vo_rms_db - tk["belowVoiceDb"]) / np.sqrt(np.mean(tick ** 2) * (len(tick) / (0.02 * SR)))
for t_ in tk["at"]:
    place(sfx, tick, t_)
    rep["sfx"].append({"id": "row tick (synth)", "pStart": t_, "pEnd": round(t_ + 0.09, 3)})
write("sfx.wav", sfx)

# ------------------------------------------------------------------ ROOM TONE under clip 3
R = Nv["roomTone"]
room = np.zeros((N, 2))
for c in range(2):
    z = rng.standard_normal(N)
    z = lowpass(highpass(z, 60), 900, 2)
    z = z + 0.5 * lowpass(rng.standard_normal(N), 180, 2)
    room[:, c] = z
env_r = np.clip((tt - R["from"]) / R["fadeIn"], 0, 1) * np.clip((R["to"] + R["fadeOut"] - tt) / R["fadeOut"], 0, 1)
room *= env_r[:, None]
room *= lin(vo_rms_db - R["belowVoiceDb"]) / np.sqrt(np.mean(room[(tt > R["from"]) & (tt < R["to"])] ** 2))
write("room.wav", room)
rep["sfx"].append({"id": "room tone (synth)", "pStart": R["from"], "pEnd": round(R["to"] + R["fadeOut"], 3)})

# ------------------------------------------------------------------ premaster
pre = vo + music_d + native + sfx + room
rep["levels"]["premasterPeakDb"] = round(float(db(np.abs(pre).max())), 2)
write("premaster.wav", pre)
json.dump(rep, open(os.path.join(A, "placements.json"), "w"), indent=1)
print(json.dumps(rep["levels"], indent=1))
print("music anchors:", json.dumps(rep["music_anchors"]))
print("resolve chord lands at P", rep["music_resolveP"])
for v in rep["voice"]:
    print(f"  {v['id']:3s} src {v['srcFrom']:6.3f}-{v['srcTo']:6.3f} (audible {v['srcOnset']:6.3f}-{v['srcOffset']:6.3f}, edges in silence {v['edgeIntoSilenceMs']} ms) -> P {v['pOnset']:6.3f}-{v['pOffset']:6.3f}")
