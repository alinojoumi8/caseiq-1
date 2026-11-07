"""Renders the background layer: one lanczos resample per output frame, straight from the 768x1376 source frame
(camera crop box in source pixels, fractional) to 720x1280. No intermediate upscale.
Usage: python footage.py <frames.json> <outdir>
frames.json = {"size":[720,1280], "src": {"c1": "<dir of s_%04d.png, 1-based>", ...}, "frames": [{"k":0,"clip":"c1","frame":0,"box":[x0,y0,x1,y1]}, ...]}
"""
import json, os, sys
from functools import lru_cache
from multiprocessing import Pool
from PIL import Image

spec = json.load(open(sys.argv[1]))
outdir = sys.argv[2]
os.makedirs(outdir, exist_ok=True)
SIZE = tuple(spec["size"])


@lru_cache(maxsize=6)
def load(clip, frame):
    im = Image.open(os.path.join(spec["src"][clip], f"s_{frame + 1:04d}.png"))
    im.load()
    return im.convert("RGB")


def work(f):
    im = load(f["clip"], f["frame"])
    out = im.resize(SIZE, Image.LANCZOS, box=tuple(f["box"]))
    out.save(os.path.join(outdir, f"r_{f['k'] + 1:04d}.png"), compress_level=1)
    return f["k"]


if __name__ == "__main__":
    with Pool(min(16, os.cpu_count() or 4)) as p:
        done = p.map(work, spec["frames"], chunksize=8)
    print(f"rendered {len(done)} background frames at {SIZE[0]}x{SIZE[1]}")
