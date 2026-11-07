// One-command re-run:  node build/run.mjs [--skip-capture]
// Reads build/config.json (footage path, speed map, event times, tag position, audio settings).
import path from "node:path";
import { spawnSync } from "node:child_process";
import { BUILD } from "./lib.mjs";

const skipCapture = process.argv.includes("--skip-capture");
const steps = [...(skipCapture ? [] : ["capture.mjs"]), "assemble.mjs", "qa.mjs"];
for (const s of steps) {
  console.log(`\n=== ${s} ===`);
  const r = spawnSync(process.execPath, [path.join(BUILD, s)], { stdio: "inherit" });
  if (r.status !== 0) { console.error(`${s} failed`); process.exit(r.status || 1); }
}
console.log("\nDone: see out/ (outName in config) and out/qa/*");
