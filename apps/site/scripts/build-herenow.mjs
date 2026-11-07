// Builds the here.now preview: a static export in out/, ready to publish.
//
//   npm run build:herenow
//   NEXT_PUBLIC_SITE_URL=https://your-slug.here.now npm run build:herenow     (set it in PowerShell with $env:NEXT_PUBLIC_SITE_URL)
//
// What it does, in order:
//   1. Copies the app into a staging folder (.herenow-build/) and leaves the server-only parts out: the API route handlers.
//      Nothing in src/ is moved or changed. The copy also gets `export const dynamic = "force-static"` on the three
//      metadata routes (robots, sitemap, Open Graph image), which a static export needs and Cache Components forbids.
//   2. Runs `next build` there with NEXT_PUBLIC_HERENOW=1 (see next.config.ts). In export mode Next always writes its scratch
//      files to ./.next, so building in the copy keeps the app's own .next/ (and a running `next start`) untouched.
//   3. Replaces out/ with the export, keeping anything under out/.herenow/ (the publish script's state file lives there),
//      and copies herenow/data.json to out/.herenow/data.json (the Site Data manifest).
//   4. Checks the result (noindex, robots.txt, private reads, no /api/ calls) and removes the staging folder.
//
// Plain Node, no shell syntax, so it runs the same in PowerShell, cmd and bash.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stage = path.join(app, '.herenow-build');
const out = path.join(app, 'out');
const manifestSource = path.join(app, 'herenow', 'data.json');

function fail(message) {
  console.error(`\nbuild:herenow: ${message}`);
  process.exitCode = 1;
}

/** Removes the staging folder. The node_modules link goes first, so nothing ever recurses into the real node_modules. */
function removeStage() {
  if (!fs.existsSync(stage)) return;
  const link = path.join(stage, 'node_modules');
  if (fs.existsSync(link) || isLink(link)) {
    try {
      fs.unlinkSync(link);
    } catch {
      fs.rmdirSync(link); // a Windows junction is removed with rmdir; this removes the link, not what it points to
    }
    if (fs.existsSync(link)) throw new Error('Could not remove the node_modules link in .herenow-build/. Remove it by hand, then run again.');
  }
  fs.rmSync(stage, { recursive: true, force: true });
}

function isLink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestSource, 'utf8'));
  } catch (err) {
    throw new Error(`herenow/data.json is missing or is not valid JSON: ${err.message}`);
  }
  const collections = manifest.collections ?? {};
  for (const [name, c] of Object.entries(collections)) {
    // The records hold people's names and emails. Reading must stay with the owner.
    if (c?.access?.read !== 'owner') throw new Error(`herenow/data.json: collection "${name}" must have access.read set to "owner".`);
  }
  return fs.readFileSync(manifestSource, 'utf8');
}

try {
  const manifestText = readManifest();

  // 1. Staging copy.
  removeStage();
  fs.mkdirSync(stage);
  fs.cpSync(path.join(app, 'src'), path.join(stage, 'src'), {
    recursive: true,
    filter: (source) => path.relative(path.join(app, 'src', 'app'), source).split(path.sep)[0] !== 'api',
  });
  fs.cpSync(path.join(app, 'public'), path.join(stage, 'public'), { recursive: true });
  for (const file of ['package.json', 'tsconfig.json', 'next.config.ts']) fs.copyFileSync(path.join(app, file), path.join(stage, file));
  // The env files Next reads for a production build, so NEXT_PUBLIC_* values set there flow into the export too.
  for (const file of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    if (fs.existsSync(path.join(app, file))) fs.copyFileSync(path.join(app, file), path.join(stage, file));
  }
  for (const file of ['src/app/robots.ts', 'src/app/sitemap.ts', 'src/app/opengraph-image.tsx']) {
    const target = path.join(stage, file);
    if (!fs.existsSync(target)) throw new Error(`Expected ${file} in the app.`);
    const text = fs.readFileSync(target, 'utf8');
    if (/export\s+const\s+dynamic\b/.test(text)) throw new Error(`${file} already exports "dynamic"; update scripts/build-herenow.mjs.`);
    fs.writeFileSync(target, `${text.replace(/\s*$/, '')}\n\nexport const dynamic = 'force-static';\n`);
  }
  fs.symlinkSync(path.join(app, 'node_modules'), path.join(stage, 'node_modules'), 'junction');

  // 2. Build.
  const nextBin = path.join(app, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn('build:herenow: NEXT_PUBLIC_SITE_URL is not set. The sitemap is empty and the Open Graph image has no absolute URL.');
    console.warn('              After the first publish, build again with the real here.now URL (see README.md).\n');
  }
  const run = spawnSync(process.execPath, [nextBin, 'build'], {
    cwd: stage,
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_HERENOW: '1', CASEIQ_APP_ROOT: app },
  });
  if (run.status !== 0) throw new Error(`next build failed (exit ${run.status ?? run.signal}).`);
  const built = path.join(stage, 'out');
  if (!fs.existsSync(path.join(built, 'index.html'))) throw new Error('next build finished but wrote no out/index.html.');

  // 3. Replace out/, keeping the publish script's state under out/.herenow/.
  const kept = new Map();
  const keptDir = path.join(out, '.herenow');
  if (fs.existsSync(keptDir)) {
    walk(keptDir, (file) => {
      if (path.relative(keptDir, file) !== 'data.json') kept.set(path.relative(keptDir, file), fs.readFileSync(file));
    });
  }
  fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(built, out, { recursive: true });
  fs.mkdirSync(keptDir, { recursive: true });
  for (const [rel, bytes] of kept) {
    fs.mkdirSync(path.dirname(path.join(keptDir, rel)), { recursive: true });
    fs.writeFileSync(path.join(keptDir, rel), bytes);
  }
  fs.writeFileSync(path.join(keptDir, 'data.json'), manifestText);

  // The export writes the Open Graph image as a file with no extension, which a static host can't label as an image.
  // Give it the .png name and point the tags at it.
  const ogFile = path.join(out, 'opengraph-image');
  if (fs.existsSync(ogFile) && fs.statSync(ogFile).isFile()) {
    const head = fs.readFileSync(ogFile).subarray(0, 8);
    if (!head.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) throw new Error('out/opengraph-image is not a PNG.');
    fs.renameSync(ogFile, `${ogFile}.png`);
    walk(out, (file) => {
      if (path.relative(keptDir, file).startsWith('..') && /\.(html|txt)$/.test(file)) {
        const text = fs.readFileSync(file, 'utf8');
        const fixed = text.replace(/(\/opengraph-image)(\?[0-9a-f]+)/g, '$1.png$2');
        if (fixed !== text) fs.writeFileSync(file, fixed);
      }
    });
  }

  // 4. Checks.
  const problems = [];
  const robots = fs.existsSync(path.join(out, 'robots.txt')) ? fs.readFileSync(path.join(out, 'robots.txt'), 'utf8') : '';
  if (!/^disallow:\s*\/\s*$/im.test(robots) || /^allow:/im.test(robots)) problems.push('robots.txt does not disallow everything.');
  let pages = 0;
  walk(out, (file) => {
    const rel = path.relative(out, file).split(path.sep).join('/');
    if (rel.startsWith('.herenow/')) return;
    if (/\.(html|js|txt|xml)$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      if (/\/api\/(intake|waitlist)/.test(text)) problems.push(`${rel} still refers to /api/intake or /api/waitlist.`);
      if (/\/opengraph-image\?/.test(text)) problems.push(`${rel} still points at the extensionless Open Graph image.`);
      if (file.endsWith('.html')) {
        pages++;
        if (!/<meta name="robots" content="noindex, nofollow"/.test(text)) problems.push(`${rel} has no noindex meta tag.`);
      }
    }
  });
  if (fs.existsSync(path.join(out, 'api'))) problems.push('out/api exists.');
  if (problems.length > 0) throw new Error(`The export failed its checks:\n  - ${problems.join('\n  - ')}`);

  console.log(`\nbuild:herenow: ready. ${pages} HTML pages in ${path.relative(process.cwd(), out) || 'out'}/, with the Site Data manifest at out/.herenow/data.json.`);
  console.log('               Publish the contents of out/ (not the folder around it). Records are private: only the owner account can read them.');
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
} finally {
  try {
    removeStage();
  } catch (err) {
    console.error(`build:herenow: could not remove .herenow-build/: ${err instanceof Error ? err.message : err}`);
  }
}
