// One-command re-render, from the source folder:  node build/run.mjs [--skip-capture] [--out-dir <dir>] [--tmp-dir <dir>]
// capture.mjs  : overlay RGBA PNGs (720x1280) + per-frame geometry + text-size audit
// assemble.mjs : footage frames (footage.py), video encode, audio stems (audio.py), loudnorm, mux
// qa.mjs       : guards, frames, strips, contact sheet, audio plots, timeline (qa_plots.py)
import path from "node:path";
import { spawnSync } from "node:child_process";
import { BUILD, OUT, QA, TMP } from "./lib.mjs";

const skipCapture = process.argv.includes("--skip-capture");
const steps = [...(skipCapture ? [] : ["capture.mjs"]), "assemble.mjs", "qa.mjs"];
for (const s of steps) {
  console.log(`\n=== ${s} ===`);
  const r = spawnSync(process.execPath, [path.join(BUILD, s), ...process.argv.slice(2)], { stdio: "inherit" });
  if (r.status !== 0) { console.error(`${s} failed`); process.exit(r.status || 1); }
}
console.log(`\nDone: video in ${OUT}, QA package in ${QA}, scratch in ${TMP}`);
