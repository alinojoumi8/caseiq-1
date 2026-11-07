"""Verify the night grade: warm pixels (wood, lamp glow) untouched, blue/cyan pixels desaturated. Usage: python grade_check.py bg_dir graded_dir qa_dir"""
import sys, os, json
import numpy as np
from PIL import Image
bg, gr, qa = sys.argv[1:4]
frames = [10, 40, 156, 216, 300]       # k (0-based): 0.4 s hook, 1.7, 6.5 snap, 9.0 landing, 12.5 hold
def hsv(a):
    a = a / 255.0; mx = a.max(2); mn = a.min(2); d = mx - mn
    h = np.zeros_like(mx); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = d > 1e-6
    h = np.where(m & (mx == r), ((g - b) / np.where(m, d, 1)) % 6, h)
    h = np.where(m & (mx == g), (b - r) / np.where(m, d, 1) + 2, h)
    h = np.where(m & (mx == b), (r - g) / np.where(m, d, 1) + 4, h)
    return h * 60, np.where(mx > 0, d / np.where(mx > 0, mx, 1), 0), mx
warm_d = []; cs_b = []; cs_a = []; rows = []
for k in frames:
    p = f"r_{k + 1:04d}.png"
    A = np.asarray(Image.open(os.path.join(bg, p)).convert("RGB")).astype(float)
    B = np.asarray(Image.open(os.path.join(gr, p)).convert("RGB")).astype(float)
    h, s, v = hsv(A)
    warm = ((h < 70) | (h > 340)) & (s > 0.25) & (v > 0.15)
    cool = (h > 170) & (h < 260) & (s > 0.15) & (v > 0.15)
    hb, sb, _ = hsv(B)
    if warm.sum(): warm_d.append(np.abs(A - B)[warm].mean())
    if cool.sum(): cs_b.append(s[cool].mean()); cs_a.append(sb[cool].mean())
    rows.append({"k": k, "t": round(k / 24, 3), "warmPx": int(warm.sum()), "coolPx": int(cool.sum()), "warmMeanAbsDelta": float(np.abs(A - B)[warm].mean()) if warm.sum() else None,
                 "coolSatBefore": float(s[cool].mean()) if cool.sum() else None, "coolSatAfter": float(sb[cool].mean()) if cool.sum() else None})
res = {"warmMeanAbsDelta": float(np.mean(warm_d)), "coolSatBefore": float(np.mean(cs_b)), "coolSatAfter": float(np.mean(cs_a)), "frames": rows}
json.dump(res, open(os.path.join(qa, "grade_check.json"), "w"), indent=1)
# before / after side by side
ims = []
for k in [10, 156, 216, 300]:
    p = f"r_{k + 1:04d}.png"
    a = Image.open(os.path.join(bg, p)).convert("RGB").resize((270, 480)); b = Image.open(os.path.join(gr, p)).convert("RGB").resize((270, 480))
    t = Image.new("RGB", (544, 480), (0, 0, 0)); t.paste(a, (0, 0)); t.paste(b, (274, 0)); ims.append(t)
sheet = Image.new("RGB", (544 * 2 + 6, 480 * 2 + 6), (0, 0, 0))
for i, t in enumerate(ims): sheet.paste(t, ((i % 2) * 550, (i // 2) * 486))
sheet.save(os.path.join(qa, "grade_before_after.png"))
with open(os.path.join(qa, "grade_check.txt"), "w") as f:
    f.write("Grade: huesaturation=colors=c+b:saturation=-1:strength=60 on the night footage (before | after side by side in grade_before_after.png)\n")
    f.write(f"warm pixels (hue <70 or >340, sat>0.25: wood, lamp glow, skin): mean |dRGB| = {res['warmMeanAbsDelta']:.2f} (0 = untouched)\n")
    f.write(f"cyan/blue pixels (hue 170-260, sat>0.15): mean saturation {res['coolSatBefore']:.3f} -> {res['coolSatAfter']:.3f}\n\n")
    for r in rows: f.write(json.dumps(r) + "\n")
print(open(os.path.join(qa, "grade_check.txt")).read())
