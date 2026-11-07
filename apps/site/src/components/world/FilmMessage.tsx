'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import type { KeyboardEvent, MouseEvent } from 'react';
import { en } from '@/content/en';
import { filmMedia, type ImageAsset } from '@/content/media';
import { useFilm } from '@/components/FilmContext';
import { introSeen } from '@/lib/motion/arrival';
import { Q_MOTION } from '@/lib/motion/queries';
import { PlayIcon } from './icons';

const { hero, film } = filmMedia;

const srcSet = (list: readonly ImageAsset[]) => list.map((i) => `${i.src} ${i.width}w`).join(', ');
/** 62% of the screen on a phone (240px at most), about 232px from 640px up. */
const SIZES = '(min-width: 640px) 232px, min(62vw, 240px)';

/** The film's length as the badge shows it: 30 seconds is 0:30. */
const LENGTH = `${Math.floor(film.durationSeconds / 60)}:${String(Math.round(film.durationSeconds % 60)).padStart(2, '0')}`;

// False on the server and while hydrating, true after: the same markup first, then the links become buttons.
const noop = () => () => {};

/** How long the snap waits for the intro to bring the message in before it plays anyway (a hero intro that never ran). */
const ARRIVAL_WAIT = 3200;

/**
 * The hero's film message: a square video message in the thread, with a play control that opens the 30-second film.
 * It is a picture first: the clip's first frame (the pile) for everyone, the last (the column) under reduced motion, and a
 * plain link to the film when JavaScript is off. With motion allowed, a silent clip plays on top of it once, when the hero
 * intro has brought the message in and 60% of it is on screen. It rests on its last frame (the column) and never replays.
 * The clip is not fetched before that, and not at all under reduced motion.
 *
 * What a visitor must know before the tap is on the tile itself, as words, so it moves with the play control wherever the sticky
 * bar covers the page: "With sound" and "Made with AI" sit in a stack at the tile's top-left, above the control, so whenever any
 * part of the control shows, both are fully showing above it. The tile's accessible name holds both (WCAG 2.5.3).
 *
 * Shape: the 18px card radius with no tail. The system's bubbles (26px, with a tail) are words someone said; a picture someone
 * sent is a card on the thread, as a photo is in a messaging app, and a tail would have to cut into the picture's corner.
 */
export function FilmMessage({ className = '' }: { className?: string }) {
  const { open } = useFilm();
  const rootRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const snap = useRef<'idle' | 'playing' | 'done'>('idle');
  // What the tile shows of the clip: nothing yet, playing, or resting on its last frame (the column), which the picture under it then matches.
  const [shown, setShown] = useState<'idle' | 'playing' | 'ended'>('idle');
  // Until the page has hydrated these are plain links to the film files; after that they open the player.
  const armed = useSyncExternalStore(noop, () => true, () => false);

  // The snap: plays once, after the intro has brought the message in, when 60% of it is on screen and the page is visible.
  useEffect(() => {
    const root = rootRef.current;
    const tile = tileRef.current;
    const video = videoRef.current;
    if (!root || !tile || !video) return;
    if (!window.matchMedia(Q_MOTION).matches || snap.current === 'done') return;

    let inView = false;
    let arrived = introSeen(root);

    const play = () => {
      if (!arrived || !inView || document.visibilityState !== 'visible' || snap.current === 'done') return;
      if (!video.getAttribute('src')) video.src = hero.clip.src; // fetched now, not with the page
      snap.current = 'playing';
      video.play().catch((err: unknown) => {
        // The browser held it back until the visitor does something: the picture stays and the next chance tries again.
        // Anything else is a clip that will not play, and it is not tried again (each try would fetch it again).
        snap.current = err instanceof DOMException && err.name === 'NotAllowedError' ? 'idle' : 'done';
      });
    };
    const onPlaying = () => setShown('playing');
    const onEnded = () => {
      snap.current = 'done';
      setShown('ended');
    };
    // A clip that fails to load is finished with: the picture stays, and nothing asks for it again.
    const onError = () => {
      snap.current = 'done';
    };
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    const seen = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        play();
      },
      { threshold: 0.6 },
    );
    seen.observe(tile);
    document.addEventListener('visibilitychange', play);

    // The intro marks the message data-arrived when it lands; without an intro to wait for, the message is already here.
    const arrival = new MutationObserver(() => {
      if (!root.hasAttribute('data-arrived')) return;
      arrived = true;
      play();
    });
    arrival.observe(root, { attributes: true, attributeFilter: ['data-arrived'] });
    const fallback = arrived ? 0 : window.setTimeout(() => {
      arrived = true;
      play();
    }, ARRIVAL_WAIT);

    return () => {
      seen.disconnect();
      arrival.disconnect();
      window.clearTimeout(fallback);
      document.removeEventListener('visibilitychange', play);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.pause();
      if (snap.current === 'playing') snap.current = 'idle'; // hidden mid-clip (the page left and came back): it can start again
    };
  }, []);

  // The clip rests on the column; the picture under it becomes the column too, so the 1px around the clip matches it.
  const still = shown === 'ended' ? hero.column : hero.pile;

  function openPlayer(e: MouseEvent<HTMLAnchorElement>, view: 'film' | 'text', from: string) {
    // A click with a modifier is someone asking for the link itself (a new tab); leave it to the browser.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open({ view, from, opener: e.currentTarget });
  }
  // A link that acts as a button answers Space as well as Enter.
  const space = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  };
  const asButton = armed ? { role: 'button', 'aria-haspopup': 'dialog' as const, onKeyDown: space } : {};

  return (
    <div ref={rootRef} className={`hero-film ${className}`.trim()}>
      {/* Until the page has hydrated (2 to 3 s on a slow connection) a tap follows this link, so it leads to the text page, which has Quick exit
          and the AI note; a bare video file would have neither. Once hydrated, a plain click opens the player in place. */}
      <Link
        ref={tileRef}
        className="film-tile"
        data-snap={shown}
        href="/film-text"
        prefetch={false}
        aria-label={en.film.play}
        onClick={(e) => openPlayer(e, 'film', 'tile')}
        {...asButton}
      >
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet={srcSet(hero.column)} sizes={SIZES} type="image/webp" />
          <img
            src={still[1].src}
            srcSet={srcSet(still)}
            sizes={SIZES}
            width={still[1].width}
            height={still[1].height}
            alt=""
            decoding="async"
          />
        </picture>
        <video ref={videoRef} className="film-tile__snap" muted playsInline preload="none" disablePictureInPicture aria-hidden="true" tabIndex={-1} />
        {/* The cues: ink chips at the top-left, above the play control, so they are never covered while any part of it shows. */}
        <span className="film-tile__cues">
          <span className="film-chip">{en.film.withSound}</span>{' '}
          {/* the space is for the text the tile reads as (the chips are grid items, so it is not drawn): "With sound Made with AI", both words inside the name (WCAG 2.5.3) */}
          <span className="film-chip">{en.film.madeWithAi}</span>
        </span>
        <span className="film-tile__play" aria-hidden="true">
          <PlayIcon />
        </span>
        {/* The length is drawn from data-length by CSS, so it is a picture of the film's length and not text inside the control: the control's name is en.film.play, and a visible "0:30" that its name did not contain would fail WCAG 2.5.3. The length is also in the player's header. */}
        <span className="film-tile__time" aria-hidden="true" data-length={LENGTH} />
      </Link>
      <p className="film-example">{en.film.example}</p>
      {/* With no JavaScript this leads to the text version as a page of its own; with it, the player opens on that view in place. */}
      <Link className="link film-read" href="/film-text" prefetch={false} onClick={(e) => openPlayer(e, 'text', 'read')} {...asButton}>
        {en.film.readInstead}
      </Link>
    </div>
  );
}
