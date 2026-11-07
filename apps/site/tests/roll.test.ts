import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { rollMedia } from '../src/content/roll';
import { solar } from '../src/components/world/solar-icons';
import { sizeOf, stripFit } from '../src/components/sections/a/pileScene';

const siteRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');

describe('the camera-roll tiles', () => {
  const tiles = Object.entries(rollMedia.tiles);

  it('are all eight, on disk, at the sizes the manifest records and no bigger than 25 KB', () => {
    expect(tiles.map(([n]) => Number(n))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const [, t] of tiles) {
      const file = join(siteRoot, 'public', t.src);
      expect(existsSync(file), t.src).toBe(true);
      expect(statSync(file).size, t.src).toBe(t.bytes);
      expect(t.bytes, t.src).toBeLessThanOrEqual(25 * 1024);
    }
  });

  it('are 3x their largest display size (the 2x2 chat 324, the 2x1 posting 324x162, the rest 216)', () => {
    const size = (n: number) => [rollMedia.tiles[n].width, rollMedia.tiles[n].height];
    expect(size(1)).toEqual([324, 324]);
    expect(size(6)).toEqual([324, 162]);
    for (const n of [2, 3, 4, 5, 7, 8]) expect(size(n)).toEqual([216, 216]);
  });

  it('record where each came from: a source image in the repo, a seed and a Krea job, and the two duplicates are derived', () => {
    for (const [n, t] of tiles) {
      expect(existsSync(join(siteRoot, '..', '..', t.from)), t.from).toBe(true);
      expect(t.seed).toBeGreaterThan(4100);
      expect(t.kreaJob).toMatch(/^[0-9a-f-]{36}$/);
      expect(t.derived).toBe(Number(n) >= 7);
    }
    expect(rollMedia.aiGenerated).toBe(true);
    expect(rollMedia.note).toBe('Illustrations of example documents; the text in them is not real.');
  });

  it('hold no words but the example case’s own: what is painted in comes from examples.ts, and the paper photos are softened', () => {
    const examples = readFileSync(join(siteRoot, 'src', 'content', 'examples.ts'), 'utf8').toLowerCase();
    for (const [, t] of tiles) for (const line of t.painted) expect(examples, line).toContain(line.toLowerCase());
    expect(rollMedia.tiles[8].painted).toEqual([]);
    expect(rollMedia.tiles[8].from).toContain('t4-email');
    expect(rollMedia.tiles[7].from).toContain('t3-letter');
    expect(rollMedia.tiles[1].painted).toContain('They posted your old job online today');
    expect(rollMedia.tiles[6].painted).toEqual(['Operations Coordinator', 'Full-time']);
    expect(tiles.filter(([, t]) => t.softened).map(([n]) => Number(n))).toEqual([2, 3, 4, 5, 7, 8]);
    expect(rollMedia.textNote).toContain('painted over');
  });

  it('are the pictures the stylesheets ask for', () => {
    const css = readFileSync(join(siteRoot, 'src', 'app', 'sections-a.css'), 'utf8') + readFileSync(join(siteRoot, 'src', 'app', 'world.css'), 'utf8');
    for (const [, t] of tiles) expect(css).toContain(t.src);
  });
});

describe('the Solar icons', () => {
  it('are bundled bodies of the Linear and Bold sets, drawn in the text colour, with no request to make', () => {
    for (const icon of Object.values(solar)) {
      expect(icon.id).toMatch(/^[a-z0-9-]+-(linear|bold)$/);
      expect(icon.body).toContain('currentColor');
      expect(icon.body).not.toContain('http');
      expect([icon.width, icon.height]).toEqual([24, 24]);
    }
  });
});

describe('the phone strip slots', () => {
  const shift = (n: number) => parseFloat(stripFit(n, ...sizeOf(n)).slice("translate(".length));
  it('keep the posting title in view: its slot is centred on the title, and the tile still covers the slot', () => {
    const [tw] = sizeOf(6);
    const scale = 30 / sizeOf(6)[1];
    expect(shift(6)).toBeCloseTo(15 - 0.307 * tw * scale, 1);
    expect(shift(6)).toBeLessThanOrEqual(0);
    expect(shift(6)).toBeGreaterThanOrEqual(30 - tw * scale);
  });
  it('centre every other tile', () => {
    for (const n of [1, 2, 3, 4, 5, 7, 8]) expect(shift(n)).toBeCloseTo(0, 5);
  });
});
