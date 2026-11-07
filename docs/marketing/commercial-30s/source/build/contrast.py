"""Label contrast measured on the final frames. Usage: python contrast.py spec.json qa_dir"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw
spec = json.load(open(sys.argv[1])); qa = sys.argv[2]
S = 2 / 3
def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
out = []; tiles = []
for sp in spec:
    im = Image.open(sp["file"]).convert("RGB")
    r = sp["label"]
    x0, y0 = int(r["x"] * S) - 6, int(r["y"] * S) - 4
    x1, y1 = int((r["x"] + r["w"]) * S) + 6, int((r["y"] + r["h"]) * S) + 4
    crop = im.crop((x0, y0, x1, y1)); a = np.asarray(crop).astype(float)
    mx = a.max(axis=2); mn = a.min(axis=2)
    text = mn >= 200                     # label-white (incl. anti-aliased core)
    near = text.copy()
    # dilate the text mask by 1 px so anti-aliased edge pixels are not counted as background
    from scipy.ndimage import binary_dilation
    near = binary_dilation(text, iterations=1)
    bg = ~near
    L = lum(a)
    L_bg95 = float(np.percentile(L[bg], 95)); L_bgmean = float(L[bg].mean())
    ratio = (1.0 + 0.05) / (L_bg95 + 0.05)
    out.append({"t": sp["t"], "ratio": ratio, "bgL95": L_bg95, "bgLmean": L_bgmean, "ratioMeanBg": 1.05 / (L_bgmean + 0.05), "textPixels": int(text.sum()), "box": [x0, y0, x1, y1]})
    tiles.append(crop.resize((crop.width * 4, crop.height * 4), Image.NEAREST))
json.dump(out, open(os.path.join(qa, "contrast.json"), "w"), indent=1)
W = max(t.width for t in tiles) + 260; H = sum(t.height + 8 for t in tiles)
sheet = Image.new("RGB", (W, H), (30, 30, 30)); d = ImageDraw.Draw(sheet); y = 0
for t, o in zip(tiles, out):
    sheet.paste(t, (0, y)); d.text((t.width + 10, y + 10), f"{o['t']} s  {o['ratio']:.1f}:1 (worst bg), {o['ratioMeanBg']:.1f}:1 (mean bg)", fill=(255, 255, 0)); y += t.height + 8
sheet.save(os.path.join(qa, "label_crops.png"))
with open(os.path.join(qa, "contrast.txt"), "w") as f:
    f.write("Sender label (white #fff) contrast against the footage behind it, measured on the final 720x1280 frames.\nBackground = pixels in the label box that are not label-white (text mask dilated 1 px); worst case = 95th-percentile luminance; WCAG ratio = (1.05)/(L+0.05). Target >= 4.5:1.\n\n")
    for o in out:
        f.write(f"{o['t']:>5} s  worst-case {o['ratio']:.2f}:1 (bg L95 {o['bgL95']:.3f})   mean-bg {o['ratioMeanBg']:.2f}:1   {'PASS' if o['ratio'] >= 4.5 else 'FAIL'}\n")
print(open(os.path.join(qa, "contrast.txt")).read())
