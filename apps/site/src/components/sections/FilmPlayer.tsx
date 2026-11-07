'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';
import { en } from '@/content/en';
import { filmMedia } from '@/content/media';
import { track } from '@/lib/analytics';
import { toDescribed, toFilm } from '@/lib/describedTime';
import { useOptionalConversation } from '@/components/ConversationContext';
import { useFilm, type FilmView } from '@/components/FilmContext';
import { QuickExitButton } from '@/components/layout/QuickExit';
import { ArrowRightIcon, ChatGlyph, CloseIcon } from '@/components/world/icons';
import { FilmScenes } from './FilmScenes';
import '@/app/sheet.css';
import '@/app/film.css';

const { film, captions, posters, described: audioDescribed } = filmMedia;

/**
 * Where the last frame's fine print ends, as a fraction of the frame's height (the lowest ink on frame 719 of the site cut is at 0.729; the
 * described cut holds the same frame). The end stack must clear it. Re-measure if the site cut's end card is re-laid out.
 */
const FRAME_FINE_BOTTOM = 0.735;
/** The gap kept between the frame's fine print and the end stack, and from the stack to the bottom of the frame. */
const FINE_GAP = 12;
const STACK_EDGE = 12;
/**
 * Under this the frame would have to shrink so far, to leave the stack room, that its own text (the fine print is about 6px by then) could
 * not be read. The footage is then left out and the end is set at full size instead: the pill, "Free first conversation", the not-a-law-firm
 * line at 13px, Watch again. The footage's end card only repeats the call to action that is live beside it.
 */
const MIN_SCALE = 0.85;

/** Can this element take focus right now? Connected, and not hidden. */
function usable(el: HTMLElement | null): el is HTMLElement {
  return !!el && el.isConnected && (typeof el.checkVisibility !== 'function' || el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true }));
}

/**
 * The film player: the 30-second film (or its text version) in a native modal dialog, opened from the hero's film message.
 * It is mounted once and reuses the conversation sheet's frame: the panel on wide screens, the whole screen on phones, the
 * same header with its own Close and Quick exit, the scroll lock and the 260ms in, 180ms out. It adds no history entry and never
 * touches the URL. The film is fetched only when it plays. In the footer, beside "Read the film as text", is the "Audio description"
 * switch: the same film with its picture held still, here and there, while a voice describes it (WCAG 1.2.5); the choice lives in this
 * component's state for the life of the page and is never stored. At the end the film's last frame stays up (it is an end card already)
 * and the real send pill, "Free first conversation" and Watch again sit in the empty slot at its foot. If the film will not load it says
 * so, in plain text, and offers the text. The player also serves the film's text page, where there is no conversation sheet.
 */
export default function FilmPlayer() {
  const { dialogRef, takeOpener, attach } = useFilm();
  // On the home page the send pill opens the conversation sheet. The film's text page has no sheet; there it goes to the start of the conversation.
  const conv = useOptionalConversation();
  const router = useRouter();
  const nameId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLButtonElement>(null);
  const pressedOnBackdrop = useRef(false);
  const handoff = useRef(false);
  const failedRef = useRef(false);
  const [view, setView] = useState<FilmView>('film');
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [described, setDescribed] = useState(false);

  // The film did not load or will not play: say so, and offer the text. Reported once.
  const fail = useCallback(() => {
    if (failedRef.current) return;
    failedRef.current = true;
    setFailed(true);
    track('film_error');
  }, []);

  // Plays with sound. If the browser holds sound-on playback back until the visitor presses play (or the play was interrupted by
  // a pause or a change of version) the native controls are on screen for that; anything else is a film that will not play.
  const play = useCallback(
    (video: HTMLVideoElement) => {
      video.play().catch((err: unknown) => {
        if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'AbortError')) return;
        fail();
      });
    },
    [fail],
  );

  // The poster is fetched when the player first shows the film, not with the page.
  const ensurePoster = (video: HTMLVideoElement) => {
    if (!video.poster) video.poster = posters[0].src;
  };

  // The text version, from the top, with focus on its heading.
  const showText = useCallback(() => {
    if (textRef.current) textRef.current.scrollTop = 0;
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // What happens when the player opens. It runs inside the click that opened it, so play() has the visitor's gesture.
  useEffect(() => {
    attach(({ view: next = 'film', paused = false }) => {
      const video = videoRef.current;
      if (!video) return;
      // A film that failed is tried again from the top, whichever view it opens on.
      if (failedRef.current) {
        failedRef.current = false;
        flushSync(() => setFailed(false));
        video.load();
      }
      flushSync(() => setView(next));
      if (next === 'text') {
        video.pause();
        showText();
        return;
      }
      ensurePoster(video);
      if (video.ended) {
        video.currentTime = 0;
        flushSync(() => setEnded(false));
      }
      video.focus({ preventScroll: true });
      // Opened late (the player's code arrived after the tap went cold): paused on the poster, and the visitor presses play.
      if (!paused) play(video);
    });
    return () => attach(null);
  }, [attach, showText, play]);

  // When the visitor leaves for another route the player's page can stay mounted but hidden (cacheComponents), and a modal dialog and a
  // playing video survive that: sound with no control, and a page nobody can click. A hidden route has its effects cleaned up, so this
  // lets everything go there and then, not through the dialog's own close event (which may never reach a tree that is hidden): the film
  // stops, the dialog closes, its marker goes, and focus is not sent back into the page that has just been hidden.
  useEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    return () => {
      video?.pause();
      takeOpener();
      handoff.current = false;
      dialog?.removeAttribute('data-layer-open');
      if (dialog?.open) dialog.close();
    };
  }, [dialogRef, takeOpener]);

  // The film is over: the end stack is up, and focus goes to the send pill.
  useEffect(() => {
    if (ended) sendRef.current?.focus();
  }, [ended]);

  // The last frame is an end card of its own (the example timeline, the name, the price line and the fine print) with an empty slot at the
  // foot where the ad's button was. The end stack goes in that slot, anchored to the bottom of the frame as it is drawn under object-fit:
  // contain, not to the video's box. Where the slot is shorter than the stack the frame gives way, moving up into any room above it and
  // then shrinking about its top, so the stack never touches the fine print. If that would take it under MIN_SCALE (a small phone) the
  // footage is hidden instead (data-compact) and the stack stands alone at full size, without the reply bar's helper line.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const stack = stackRef.current;
    if (!ended || !stage || !stack) return;
    const place = () => {
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      if (!sw || !sh) return;
      const ratio = film.width / film.height;
      const fh = Math.min(sh, sw / ratio); // the frame's height under object-fit: contain
      const top = (sh - fh) / 2;
      const bottom = top + fh;
      // Measured with the footage in place and the helper line up, as the stack stands on a screen with room.
      stage.dataset.compact = 'off';
      stack.dataset.helper = 'on';
      const stackTop = bottom - STACK_EDGE - stack.offsetHeight;
      let lift = 0;
      let scale = 1;
      const need = top + fh * FRAME_FINE_BOTTOM + FINE_GAP - stackTop;
      if (need > 0) {
        lift = Math.min(need, top);
        scale = Math.min(1, (stackTop - FINE_GAP - (top - lift)) / (fh * FRAME_FINE_BOTTOM));
      }
      const compact = scale < MIN_SCALE;
      stage.dataset.compact = compact ? 'on' : 'off';
      stack.dataset.helper = compact ? 'off' : 'on';
      stack.dataset.fine = compact ? 'on' : 'off';
      if (compact) {
        lift = 0;
        scale = 1;
      }
      stage.style.setProperty('--end-bottom', `${sh - bottom + STACK_EDGE}px`);
      stage.style.setProperty('--frame-lift', `${-lift}px`);
      stage.style.setProperty('--frame-scale', String(scale));
      stage.style.setProperty('--frame-top', `${top}px`);
    };
    place();
    const watch = new ResizeObserver(place);
    watch.observe(stage);
    return () => {
      watch.disconnect();
      for (const v of ['--end-bottom', '--frame-lift', '--frame-scale', '--frame-top']) stage.style.removeProperty(v);
      delete stage.dataset.compact;
    };
  }, [ended]);

  // The film failed: focus goes to the way out, the text.
  useEffect(() => {
    if (failed) readRef.current?.focus();
  }, [failed]);

  function toggle() {
    const video = videoRef.current;
    if (view === 'film') {
      video?.pause();
      flushSync(() => setView('text'));
      showText();
      track('film_text', { from: 'toggle' });
    } else {
      flushSync(() => setView('film'));
      if (video) {
        ensurePoster(video);
        if (failedRef.current) {
          // Back from the text after a film that would not load: it gets another try when the visitor presses play.
          failedRef.current = false;
          flushSync(() => setFailed(false));
          video.load();
        }
        video.focus({ preventScroll: true });
      }
    }
  }

  // Switches between the film and its described version where the visitor is, playing or paused, without a history entry.
  function toggleDescribed() {
    const video = videoRef.current;
    if (!video) return;
    const next = !described;
    const playing = !video.paused && !video.ended;
    const position = video.ended ? 0 : next ? toDescribed(video.currentTime, audioDescribed.holds) : toFilm(video.currentTime, audioDescribed.holds);
    failedRef.current = false;
    // The new source is in the page at once (flushSync), and the position is kept for it before anything is fetched.
    flushSync(() => {
      setDescribed(next);
      setEnded(false);
      setFailed(false);
    });
    video.currentTime = position;
    if (playing) play(video);
    track('film_described', { on: next });
  }

  function replay() {
    const video = videoRef.current;
    if (!video) return;
    // The video comes back first, so there is something to take focus; then it plays from the top.
    flushSync(() => setEnded(false));
    video.currentTime = 0;
    video.focus({ preventScroll: true });
    play(video);
  }

  // The send pill closes the player, then opens the conversation sheet like every other call to action does.
  function start() {
    track('film_cta');
    if (!conv) {
      // No sheet on this page (the film's text page): the start of the conversation is the page's own start link.
      // The player closes first: left open, it would stay a modal over the page that is hidden behind the one it navigates to.
      handoff.current = true;
      dialogRef.current?.close();
      router.push('/#start');
      return;
    }
    handoff.current = true;
    dialogRef.current?.close();
    conv.open({ from: 'film' });
  }

  function onClose() {
    videoRef.current?.pause();
    dialogRef.current?.removeAttribute('data-layer-open');
    const opener = takeOpener();
    if (handoff.current) {
      handoff.current = false;
      return;
    }
    if (usable(opener)) opener.focus({ preventScroll: true });
  }

  function onClick(e: ReactMouseEvent<HTMLDialogElement>) {
    const dlg = dialogRef.current;
    // A click on the backdrop lands on the dialog element itself. A drag that started inside and ended on the backdrop does not count.
    if (dlg && e.target === dlg && pressedOnBackdrop.current) dlg.close();
  }

  const state = failed ? 'failed' : ended ? 'ended' : 'playing';

  return (
    <dialog
      ref={dialogRef}
      className="film-player"
      aria-labelledby={nameId}
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === dialogRef.current;
      }}
      onClick={onClick}
      onClose={onClose}
    >
      <span id={nameId} className="sr-only">
        {en.film.dialogName}
      </span>
      <div className="sheet-head">
        {/* Quick exit comes first in the tab order, as everywhere on the site. The page's own Quick exit is inert behind the player. */}
        <QuickExitButton className="qx sheet-head__qx" />
        <button type="button" className="icon-btn sheet-head__close" onClick={() => dialogRef.current?.close()} aria-label={en.ui.close}>
          <CloseIcon />
        </button>
        <div className="sheet-head__who">
          <span className="sheet-head__avatar" aria-hidden="true">
            <ChatGlyph size={22} />
          </span>
          <div className="sheet-head__text">
            <h2 className="sheet-head__name">{en.brand.name}</h2>
            <p className="sheet-head__status">{en.film.status}</p>
          </div>
        </div>
      </div>

      <div className="film-body" data-view={view}>
        <div ref={stageRef} className="film-stage" hidden={view !== 'film'} data-state={state}>
          <video
            ref={videoRef}
            className="film-video"
            controls={!ended}
            playsInline
            preload="none"
            width={film.width}
            height={film.height}
            src={described ? audioDescribed.src : film.src}
            onPlay={() => {
              setEnded(false);
              track('film_play');
            }}
            onEnded={() => {
              setEnded(true);
              track('film_complete');
            }}
            onError={fail}
          >
            <track key={described ? 'described' : 'film'} kind="captions" srcLang={captions.language} label={captions.label} src={described ? audioDescribed.captions.src : captions.src} />
          </video>
          {/* The end: the film's last frame stays up (it is an end card already, with an empty slot at its foot) and this stack sits in the slot. */}
          {ended && !failed ? (
            <div className="film-end">
              <div ref={stackRef} className="film-end__stack" data-helper="on" data-fine="off">
                <p className="film-end__helper">{en.world.replyPlaceholder}</p>
                <button ref={sendRef} type="button" className="send" onClick={start}>
                  {en.cta.primary}
                  <span className="send__arrow">
                    <ArrowRightIcon />
                  </span>
                </button>
                <p className="film-end__free">{en.hero.reassure[0]}</p>
                <p className="film-end__fine">{en.disclaimer.short}</p>
                <button type="button" className="btn-outline" onClick={replay}>
                  {en.film.replay}
                </button>
              </div>
            </div>
          ) : null}
          {failed ? (
            <div className="film-fail" role="alert">
              <p className="film-fail__message">{en.film.error}</p>
              <button ref={readRef} type="button" className="btn-outline" onClick={toggle}>
                {en.film.readText}
              </button>
            </div>
          ) : null}
        </div>

        <div ref={textRef} className="film-text" hidden={view !== 'text'} data-lenis-prevent>
          <h2 ref={headingRef} tabIndex={-1} className="film-text__title">
            {en.film.textTitle}
          </h2>
          <FilmScenes />
          {/* The text leads somewhere: the same send pill as the end of the film. */}
          <div className="film-start">
            <button type="button" className="send" onClick={start}>
              {en.cta.primary}
              <span className="send__arrow">
                <ArrowRightIcon />
              </span>
            </button>
            <p className="film-start__free">{en.hero.reassure[0]}</p>
          </div>
        </div>
      </div>

      <div className="film-foot">
        <p className="film-foot__note">{en.film.note}</p>
        <div className="film-foot__actions">
          {/* The two other ways to take in the film, side by side. A switch, so it says its state; it applies to the film, so the text view hides it. */}
          <button type="button" className="film-switch" aria-pressed={described} onClick={toggleDescribed} hidden={view !== 'film' || failed}>
            <span className="film-switch__track" aria-hidden="true" />
            {en.film.described}
          </button>
          {/* A film that failed already offers the text in the body; one button is enough. */}
          <button type="button" className="btn-outline film-foot__toggle" onClick={toggle} hidden={failed && view === 'film'}>
            {view === 'film' ? en.film.readText : en.film.watch}
          </button>
        </div>
      </div>
    </dialog>
  );
}
