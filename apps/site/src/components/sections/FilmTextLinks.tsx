'use client';

import type { MouseEvent, ReactNode } from 'react';
import { en } from '@/content/en';
import { filmMedia } from '@/content/media';
import { FilmProvider, useFilm } from '@/components/FilmContext';
import { FilmPlayerSlot } from './FilmPlayerSlot';

/**
 * "Watch the film, with sound": a link to the film file with no JavaScript, and with it the same player as the home page's film message,
 * opened in place (Quick exit first in its header, no history entry, sound only after this tap, focus back on the link on close).
 */
function WatchLink() {
  const { open, unavailable } = useFilm();
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open({ view: 'film', from: 'film-text', opener: e.currentTarget });
  }
  return (
    <>
      <a className="link" href={filmMedia.film.src} onClick={onClick}>
        {en.film.watchWithSound}
      </a>
      {/* If the player cannot open, nothing navigates (the film file would play with sound and no Quick exit): this says so, politely. */}
      <span role="status" className="film-page__status">
        {unavailable ? en.film.error : ''}
      </span>
    </>
  );
}

/** The links at the foot of the film's text page, and the player they open. `children` are the page's other links. */
export function FilmTextLinks({ children }: { children: ReactNode }) {
  return (
    <FilmProvider>
      <p className="film-page__links">
        <WatchLink />
        {children}
      </p>
      <FilmPlayerSlot />
    </FilmProvider>
  );
}
