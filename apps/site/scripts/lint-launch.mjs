// Launch lint: fails while anything the founder still owes would reach a visitor.
//  1. Any field in src/content/site.ts is null.
//  2. Any string in src/content/*.ts holds "[" or "___" (a bracketed placeholder that would render).
//  3. A claim marker in en.ts (a comment such as "// ⚠K1") names an ID that is not in siteConfig.confirmedClaims.
// Not part of the normal test run. Run it before launch: npm run lint:launch
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');
const problems = [];

const { siteConfig } = await import(pathToFileURL(join(root, 'site.ts')).href);

// 1. Unset site values.
for (const [key, value] of Object.entries(siteConfig)) {
  if (value === null || value === undefined || value === '') problems.push(`site.ts: ${key} is not set`);
}

// 2. Brackets and blanks in any string.
function* walk(value, path) {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* walk(value[i], `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* walk(v, path ? `${path}.${k}` : k);
}
for (const file of readdirSync(root).filter((f) => f.endsWith('.ts') && f !== 'site.ts')) {
  const mod = await import(pathToFileURL(join(root, file)).href);
  for (const [name, exported] of Object.entries(mod)) {
    for (const [path, text] of walk(exported, name)) {
      if (/\[|___/.test(text)) problems.push(`${file}:${path} renders a placeholder: ${text.slice(0, 80)}`);
    }
  }
}

// 3. Conditional claims the founder has not confirmed.
const confirmed = new Set(siteConfig.confirmedClaims);
const source = readFileSync(join(root, 'en.ts'), 'utf8');
const unconfirmed = new Map();
source.split(/\r?\n/).forEach((line, i) => {
  const comment = line.includes('//') ? line.slice(line.indexOf('//')) : '';
  for (const m of comment.matchAll(/⚠\s*([A-Z]\d+[a-z]?)/g)) {
    if (!confirmed.has(m[1])) {
      if (!unconfirmed.has(m[1])) unconfirmed.set(m[1], []);
      unconfirmed.get(m[1]).push(i + 1);
    }
  }
});
for (const [id, lines] of [...unconfirmed].sort()) problems.push(`en.ts: claim ${id} is not confirmed (line ${lines.join(', ')})`);

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\nlint:launch: ${problems.length} problem(s). Not ready to launch.`);
  process.exit(1);
}
console.log('lint:launch: all site values set, no placeholders, every claim confirmed.');
