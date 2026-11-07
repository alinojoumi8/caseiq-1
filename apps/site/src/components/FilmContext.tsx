'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { track } from '@/lib/analytics';
import { FILM_TEXT_HREF } from '@/lib/filmText';

/** How long a tap waits for the player's code to arrive before it goes to the text page instead. */
const LOAD_WAIT = 4000;
/** A tap whose player arrives later than this opens it paused on the poster: sound only ever follows a tap the visitor can still feel. */
const LATE = 1000;

/** What the player opens on: the film (and plays it), or its text version (no playback). */
export type FilmView = 'film' | 'text';

export interface FilmOpenOptions {
  view?: FilmView;
  /** Which control asked, for analytics: tile or read. */
  from?: string;
  /** The control that opened the player; focus goes back to it on close. Defaults to whatever has focus. */
  opener?: HTMLElement | null;
  /** Open on the film paused, on its poster, with focus on the video, and do not play. */
  paused?: boolean;
}

/** A control that is waiting for the player's code says so: aria-busy for assistive technology, data-busy for the tile's progress ring. */
function busy(el: HTMLElement | null | undefined, on: boolean) {
  if (!el) return;
  if (on) {
    el.setAttribute('aria-busy', 'true');
    el.setAttribute('data-busy', '');
  } else {
    el.removeAttribute('aria-busy');
    el.removeAttribute('data-busy');
  }
}

interface FilmValue {
  open: (opts?: FilmOpenOptions) => void;
  close: () => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** The control that opened the player. Read and cleared by the player when it closes. */
  takeOpener: () => HTMLElement | null;
  /** The player hands back what to do once it is open, so the work runs inside the click that opened it (play() needs that gesture). */
  attach: (show: ((opts: FilmOpenOptions) => void) | null) => void;
  /** The player's code did not load, or threw: a tap on the film message goes to the text page (a page of its own, working without scripts) instead. */
  fail: () => void;
  /** The player could not be opened (its code failed or is far too late). On the text page there is nowhere better to go, so it says so beside the link. Cleared by the next open that works. */
  unavailable: boolean;
}

const Ctx = createContext<FilmValue | null>(null);

/**
 * Holds the one film player's controls for the home page. The hero's film message and its "Read it instead" link call open();
 * the player (a native modal dialog, mounted once, loaded after hydration) shows the view they asked for. Like the conversation
 * sheet it adds no history entry and never touches the URL. If the player's code has not arrived when a tap comes, the tap waits
 * for it; if it never arrives (a chunk that failed, or a wait over four seconds) the tap goes to the text page, so it is never dead.
 */
export function FilmProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const show = useRef<((opts: FilmOpenOptions) => void) | null>(null);
  const failed = useRef(false);
  const waiting = useRef<{ opts: FilmOpenOptions; timer: number; at: number } | null>(null);
  const alive = useRef(false);
  const [unavailable, setUnavailable] = useState(false);

  const toTextPage = useCallback(() => {
    // The player is not coming. On the text page there is nowhere better to go (the film file would play with sound and no Quick exit), so
    // it stays where it is, with the tap's busy state cleared by the caller. Elsewhere it is a full navigation, not the router's (this runs
    // when scripts are what failed), and it replaces the entry: a failure is not a place the visitor chose to go, so Back must not land on it.
    if (window.location.pathname.replace(/\/$/, '') === '/film-text') {
      setUnavailable(true);
      return;
    }
    window.location.replace(FILM_TEXT_HREF);
  }, []);

  const open = useCallback((opts: FilmOpenOptions = {}) => {
    const dlg = dialogRef.current;
    if (failed.current) return toTextPage();
    if (!dlg || !show.current) {
      // The player's code has not arrived. Keep the tap and carry it out when it does.
      if (waiting.current) {
        window.clearTimeout(waiting.current.timer);
        busy(waiting.current.opts.opener, false);
      }
      busy(opts.opener, true); // at once, so the tap is seen to have landed
      waiting.current = {
        opts,
        at: performance.now(),
        timer: window.setTimeout(() => {
          busy(opts.opener, false);
          waiting.current = null;
          toTextPage();
        }, LOAD_WAIT),
      };
      return;
    }
    setUnavailable(false);
    const active = document.activeElement;
    opener.current = opts.opener ?? (active instanceof HTMLElement && active !== document.body && !dlg.contains(active) ? active : null);

    if (!dlg.open) {
      // The page's scrollbar goes away while the player is open. Padding the same width keeps everything behind it where it is.
      const root = document.documentElement;
      root.style.setProperty('--sbw', `${Math.max(0, window.innerWidth - root.clientWidth)}px`);
      dlg.showModal();
      // The same marker the other dialogs carry while open, so Esc closes this layer before Quick exit's double-Esc counts.
      dlg.setAttribute('data-layer-open', '');
    }
    show.current?.(opts);
    track('film_open', { view: opts.view ?? 'film', from: opts.from ?? 'other' });
  }, [toTextPage]);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // A route the visitor leaves can stay mounted but hidden (cacheComponents), and then its effects are cleaned up: a tap still waiting for the
  // player must not carry on and navigate from a page nobody is looking at, and nothing queued for later may run into it. Both come back on show.
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (!waiting.current) return;
      window.clearTimeout(waiting.current.timer);
      busy(waiting.current.opts.opener, false);
      waiting.current = null;
    };
  }, []);

  const takeOpener = useCallback(() => {
    const el = opener.current;
    opener.current = null;
    return el;
  }, []);

  const attach = useCallback(
    (fn: ((opts: FilmOpenOptions) => void) | null) => {
      show.current = fn;
      // A tap that came before the player was ready: carry it out now.
      if (fn && waiting.current) {
        const { opts, timer, at } = waiting.current;
        window.clearTimeout(timer);
        waiting.current = null;
        busy(opts.opener, false);
        // Not inside the player's own effect: it calls flushSync, which React will not run while it is committing.
        queueMicrotask(() => {
          if (alive.current) open({ ...opts, paused: opts.paused || performance.now() - at > LATE });
        });
      }
    },
    [open],
  );

  const fail = useCallback(() => {
    failed.current = true;
    setUnavailable(true);
    if (waiting.current) {
      window.clearTimeout(waiting.current.timer);
      busy(waiting.current.opts.opener, false);
      waiting.current = null;
      toTextPage();
    }
  }, [toTextPage]);

  const value = useMemo<FilmValue>(() => ({ open, close, dialogRef, takeOpener, attach, fail, unavailable }), [open, close, takeOpener, attach, fail, unavailable]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilm(): FilmValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useFilm must be used inside FilmProvider');
  return v;
}
