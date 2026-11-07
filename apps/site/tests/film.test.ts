import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { filmMedia } from '../src/content/media';
import { timelineExamples } from '../src/content/examples';
import { toDescribed, toFilm } from '../src/lib/describedTime';

const siteRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const repoRoot = join(siteRoot, '..', '..');
const publicDir = join(siteRoot, 'public');
const file = (src: string) => join(publicDir, src);

/** The cue texts of a WebVTT file, in order, with a cue's line breaks read as spaces. */
function cues(vtt: string): { start: number; text: string }[] {
  return vtt
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map((block) => block.split('\n'))
    .filter((lines) => lines.some((l) => l.includes('-->')))
    .map((lines) => {
      const i = lines.findIndex((l) => l.includes('-->'));
      const [h, m, s] = lines[i].split('-->')[0].trim().split(':');
      return { start: Number(h) * 3600 + Number(m) * 60 + Number(s), text: lines.slice(i + 1).join(' ').trim() };
    });
}

describe('the film captions', () => {
  const vtt = readFileSync(file(filmMedia.captions.src), 'utf8');

  it('say exactly what en.film.says says, in order', () => {
    expect(cues(vtt).map((c) => c.text)).toEqual([...en.film.says]);
  });

  it('start where the manifest says each voice line starts', () => {
    const list = cues(vtt);
    expect(list).toHaveLength(filmMedia.captions.lines.length);
    list.forEach((c, i) => expect(c.start).toBeCloseTo(filmMedia.captions.lines[i].start, 2));
  });
});

describe('the film text version', () => {
  it('shows every spoken line once, in order, across its scenes', () => {
    const order = en.film.scenes.flatMap((s) => [...s.says]);
    expect(order).toEqual(en.film.says.map((_, i) => i));
  });

  it('places each scene where its lines are spoken', () => {
    const seconds = (at: string) => Number(at.split(':')[0]) * 60 + Number(at.split(':')[1]);
    en.film.scenes.forEach((scene, i) => {
      const next = en.film.scenes[i + 1];
      for (const n of scene.says) {
        const start = filmMedia.captions.lines[n].start;
        expect(start).toBeGreaterThanOrEqual(seconds(scene.at));
        if (next) expect(start).toBeLessThan(seconds(next.at));
      }
    });
  });

  it('draws its three timeline rows from the timeline examples (items 1, 3 and 4)', () => {
    expect(timelineExamples.filter((t) => [1, 3, 4].includes(t.n)).map((t) => t.n)).toEqual([1, 3, 4]);
  });
});

describe('the film files', () => {
  const { film, described, hero, posters, captions } = filmMedia;

  it('are all on disk at the sizes the manifest records', () => {
    const assets = [film, described, described.captions, hero.clip, ...hero.pile, ...hero.column, ...posters, captions];
    for (const a of assets) {
      expect(existsSync(file(a.src)), a.src).toBe(true);
      expect(statSync(file(a.src)).size, a.src).toBe(a.bytes);
    }
  });

  it('keep the 30 s film byte-identical to the site cut beside the ad (same MD5)', () => {
    const md5 = (path: string) => createHash('md5').update(readFileSync(path)).digest('hex');
    expect(md5(file(film.src))).toBe(film.md5);
    expect(md5(join(repoRoot, 'docs', 'marketing', 'commercial-30s', 'site-cut', 'caseiq-30s-vertical-site.mp4'))).toBe(film.md5);
  });

  it('keep the described version byte-identical to what the manifest recorded', () => {
    expect(createHash('md5').update(readFileSync(file(described.src))).digest('hex')).toBe(described.md5);
  });

  it('hold the hero clip under 5 s (WCAG 2.2.2) and silent', () => {
    expect(hero.clip.durationSeconds).toBeLessThan(5);
    expect(hero.clip.hasAudio).toBe(false);
  });

  it('give the picture a size for each width it can be shown at', () => {
    expect(hero.pile.map((i) => i.width)).toEqual([320, 480, 640]);
    expect(hero.column.map((i) => i.width)).toEqual([320, 480, 640]);
  });

  it('label everything as AI-generated', () => {
    for (const a of [film, described, hero.clip, ...hero.pile, ...hero.column, ...posters]) expect(a.aiGenerated).toBe(true);
  });
});

describe('the described version', () => {
  const { described, film } = filmMedia;
  const vtt = readFileSync(file(described.captions.src), 'utf8');
  const holdsBefore = (t: number) => described.holds.filter((h) => h.at <= t).reduce((n, h) => n + h.seconds, 0);

  it('has captions that say exactly what en.film.says says, in order', () => {
    expect(cues(vtt).map((c) => c.text)).toEqual([...en.film.says]);
  });

  it('moves each caption by the holds before it', () => {
    const film = cues(readFileSync(file(filmMedia.captions.src), 'utf8'));
    cues(vtt).forEach((c, i) => expect(c.start).toBeCloseTo(film[i].start + holdsBefore(film[i].start), 2));
  });

  it('is as long as the film plus its holds', () => {
    expect(described.durationSeconds).toBeCloseTo(film.durationSeconds + described.holds.reduce((n, h) => n + h.seconds, 0), 1);
  });

  it('holds only on whole frames, in order, inside the film', () => {
    described.holds.forEach((h, i) => {
      expect(h.at * 24).toBeCloseTo(Math.round(h.at * 24), 1);
      expect(h.seconds * 24).toBeCloseTo(Math.round(h.seconds * 24), 1);
      expect(h.at).toBeLessThanOrEqual(film.durationSeconds);
      if (i) expect(h.at).toBeGreaterThan(described.holds[i - 1].at);
    });
  });

  it('puts every description line in a gap in the voice of the film or a hold, never on a voice cue', () => {
    const cueSpans = cues(vtt).map((c, i) => ({ start: c.start, end: described.cues[i].end }));
    expect(described.cues).toHaveLength(en.film.says.length);
    for (const line of described.lines) {
      expect(line.end).toBeGreaterThan(line.start);
      for (const c of described.cues) expect(line.start < c.end && line.end > c.start, `${line.id} overlaps cue ${c.id}`).toBe(false);
      // sampled through the line too, so a cue lying inside it would be caught
      for (let t = line.start; t < line.end; t += 0.05) expect(cueSpans.some((c) => t >= c.start && t < c.end), `${line.id} at ${t.toFixed(2)} s`).toBe(false);
    }
    // the lines come in order and none starts before the one before it has ended
    described.lines.forEach((l, i) => i && expect(l.start).toBeGreaterThan(described.lines[i - 1].end));
  });

  it('places each line where the film second it starts at says, moved by the holds before it', () => {
    for (const line of described.lines) expect(line.start).toBeCloseTo(line.filmAt + holdsBefore(line.filmAt), 2);
  });

  it('records its voice, its Krea job and its take', () => {
    expect(described.voice.kreaJob).toBe('2b7820e7-ea0e-413b-ba77-5487ca11ac46');
    expect(described.voice.voice).toContain('Eric');
    expect(existsSync(join(repoRoot, described.voice.take))).toBe(true);
    expect(described.lines.map((l) => l.id)).toEqual(['D1', 'D2', 'D3', 'D4']);
  });

  it('is at the film loudness with the peak under the ceiling', () => {
    expect(Math.abs(described.loudness.integrated + 14)).toBeLessThanOrEqual(0.5);
    expect(described.loudness.truePeak).toBeLessThanOrEqual(-1);
  });
});

describe('moving between the film and its described version', () => {
  const holds = [
    { at: 5, seconds: 1.5 },
    { at: 20, seconds: 7 },
  ];

  it('keeps the same time before the first hold', () => {
    expect(toDescribed(3, holds)).toBe(3);
    expect(toFilm(3, holds)).toBe(3);
  });

  it('moves a time after a hold by that hold, and back again', () => {
    expect(toDescribed(10, holds)).toBe(11.5);
    expect(toFilm(11.5, holds)).toBe(10);
    expect(toDescribed(25, holds)).toBe(33.5);
    expect(toFilm(33.5, holds)).toBe(25);
  });

  it('maps a time inside a hold to the frozen second', () => {
    expect(toFilm(5.75, holds)).toBe(5);
    expect(toFilm(6.5 + 14.9, holds)).toBeCloseTo(19.9, 6);
    expect(toFilm(21.5 + 3, holds)).toBe(20);
  });

  it('round-trips every film time', () => {
    for (let t = 0; t <= 30; t += 0.25) expect(toFilm(toDescribed(t, holds), holds)).toBeCloseTo(t, 6);
  });

  it('keeps the end of the film at the end of the described version', () => {
    expect(toDescribed(30, [...holds, { at: 30, seconds: 7.4 }])).toBe(30 + 1.5 + 7 + 7.4);
  });
});
