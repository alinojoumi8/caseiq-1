import type { Metadata } from 'next';
import Link from 'next/link';
import { en } from '@/content/en';
import { legal } from '@/content/legal';
import { ArrowRightIcon } from '@/components/world/icons';
import { FilmScenes } from '@/components/sections/FilmScenes';
import { FilmTextLinks } from '@/components/sections/FilmTextLinks';
import '@/app/film.css';

export const metadata: Metadata = {
  title: en.film.textTitle,
  description: en.film.note,
  alternates: { canonical: '/film-text' },
};

/**
 * What the 30-second film says and shows, as a page of its own: the same scenes as the player's text version, for visitors without
 * JavaScript (the hero's "Read it instead" link leads here) and for anyone whose player did not load. A server component with no
 * script in it. The safety strip with Quick exit is the layout's. It ends with the way to start.
 */
export default function FilmTextPage() {
  return (
    <main id="main" tabIndex={-1} className="film-page">
      <div className="film-page__inner">
        <h1 className="film-text__title">{en.film.textTitle}</h1>
        <p className="film-page__note">{en.film.note}</p>
        <FilmScenes />
        <div className="film-start">
          <Link className="send" href="/#start" data-cta="film-text">
            {en.cta.primary}
            <span className="send__arrow">
              <ArrowRightIcon />
            </span>
          </Link>
          <p className="film-start__free">{en.hero.reassure[0]}</p>
        </div>
        <FilmTextLinks>
          <Link className="link" href="/">
            {legal.back}
          </Link>
        </FilmTextLinks>
      </div>
    </main>
  );
}
