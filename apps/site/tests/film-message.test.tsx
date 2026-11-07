import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { FilmProvider } from '../src/components/FilmContext';
import { FilmMessage } from '../src/components/world/FilmMessage';

// The cue rule: whenever any part of the play control shows above the sticky bar, "with sound" and the AI label are fully showing above
// it too. The cues are words on the tile itself, above the control, so they travel with it; the browser checks measure the pixels
// (SCRATCH tools, nine sizes). These tests hold the markup that makes that true.
const html = renderToStaticMarkup(
  <FilmProvider>
    <FilmMessage />
  </FilmProvider>,
);
const tile = html.match(/<a [^>]*class="film-tile"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
const outside = html.replace(tile, '');
const name = tile.match(/aria-label="([^"]*)"/)?.[1] ?? '';
const chunk = (cls: string) => tile.slice(tile.indexOf(`class="${cls}"`));

describe('the hero film message', () => {
  it('has the two cues on the tile itself, in words', () => {
    expect(tile).toContain(`>${en.film.withSound}<`);
    expect(tile).toContain(`>${en.film.madeWithAi}<`);
  });

  it('does not say either cue again under the tile', () => {
    expect(outside).not.toContain(en.film.withSound);
    expect(outside).not.toContain(en.film.madeWithAi);
    expect(outside).toContain(en.film.example);
    expect(outside).toContain(en.film.readInstead);
  });

  it('puts the cues before the play control in the tile, so nothing covers them while the control shows', () => {
    expect(tile.indexOf('film-tile__cues')).toBeGreaterThan(-1);
    expect(tile.indexOf('film-tile__cues')).toBeLessThan(tile.indexOf('film-tile__play'));
  });

  it('keeps the tile\'s accessible name holding its visible words (WCAG 2.5.3)', () => {
    expect(name).toBe(en.film.play);
    expect(name.toLowerCase()).toContain(en.film.withSound.toLowerCase());
    expect(name.toLowerCase()).toContain(en.film.madeWithAi.toLowerCase());
  });

  it('reads, as text, as words that its accessible name contains the way axe compares them (punctuation out, spaces between)', () => {
    const plain = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    const visible = plain(tile.replace(/<[^>]*>/g, ''));
    expect(visible).toBe('with sound made with ai');
    expect(plain(name)).toContain(visible);
  });

  it('says that the player has a text version and an audio description', () => {
    expect(name.toLowerCase()).toContain('text version');
    expect(name.toLowerCase()).toContain('audio description');
  });

  it('keeps the decorative pieces out of the accessibility tree', () => {
    expect(chunk('film-tile__play')).toMatch(/^class="film-tile__play" aria-hidden="true"/);
    expect(chunk('film-tile__time')).toMatch(/^class="film-tile__time" aria-hidden="true"/);
  });

  it('leads, with no JavaScript and before the page has hydrated, to the text page (never to the bare video file, which has no Quick exit)', () => {
    expect(tile).toContain('href="/film-text"');
    expect(tile).not.toContain('.mp4"');
    expect(outside).toContain('href="/film-text"');
    expect(html).not.toContain('href="/film/case-iq-film-30s.mp4"');
  });
});
