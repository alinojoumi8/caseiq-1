// Copy lint: scans every string exported from src/content/*.ts for banned words and phrases.
// Loads the content modules directly (Node strips the types), so each hit is reported with its string ID path.
// Exit code 1 on any violation.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content');

const BANNED = [
  // accusation and characterization
  'lied', 'lying', 'dishonest', 'untruthful', 'deceptive',
  'guilty', 'innocent', 'culpable', 'proved',
  'fraud', 'fraudulent', 'forged', 'forgery', 'theft', 'stole', 'embezzled', 'suspicious',
  // advice and ranking
  'you should', 'you must', 'we recommend', 'best argument', 'strongest point',
  // false certainty
  'obviously', 'clearly', 'of course',
  // forbidden claims
  'AI lawyer', 'replaces a lawyer', 'will win', 'chances of',
  // filler
  'simply', 'just', 'easy',
  // hype
  'unlock', 'empower', 'seamless', 'revolutionize', 'game-changer', 'effortless', 'peace of mind',
];

// String IDs allowed to contain a banned term, only for a quoted bad example or a mandated product string.
// Format: "<file>:<id.path>". Copy deck v3 allows none.
const ALLOW = new Set([]);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = BANNED.map((term) => ({
  term,
  re: new RegExp(`(?<![\\w-])${escape(term).replace(/\s+/g, '\\s+')}(?![\\w-])`, 'i'),
}));

function* walk(value, path) {
  if (typeof value === 'string') {
    yield [path, value];
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) yield* walk(value[i], `${path}[${i}]`);
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) yield* walk(v, path ? `${path}.${k}` : k);
  }
}

const files = readdirSync(root).filter((f) => f.endsWith('.ts'));
let violations = 0;
let scanned = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(join(root, file)).href);
  for (const [name, exported] of Object.entries(mod)) {
    for (const [path, text] of walk(exported, name)) {
      scanned++;
      const id = `${file}:${path}`;
      if (ALLOW.has(id)) continue;
      for (const { term, re } of patterns) {
        if (re.test(text)) {
          violations++;
          console.error(`BANNED  ${id}  "${term}"  →  ${text.slice(0, 90)}`);
        }
      }
    }
  }
}

if (violations > 0) {
  console.error(`\ncopy-lint: ${violations} violation(s) in ${scanned} strings.`);
  process.exit(1);
}
console.log(`copy-lint: ${scanned} strings in ${files.length} files, no banned words.`);
