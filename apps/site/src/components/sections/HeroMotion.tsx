'use client';

import { useRef, type RefObject } from 'react';
import { introDue, shouldPlay, type Seen } from '@/lib/motion/arrival';
import { EASE, POP, SEND, gsap, useGSAP } from '@/lib/motion/gsap';
import { Q_MOTION } from '@/lib/motion/queries';

type Scene = ReturnType<typeof gsap.timeline>;

const WIDE = '(min-width: 640px)';
/** From here the sub (left) and the film (right) sit side by side with the sub first in reading order, so the sub lands first. */
const SPLIT = '(min-width: 1024px)';

/**
 * The hero's motion, in one place. It renders nothing: Hero and HeroInteractive draw the finished page, and this plays it in.
 *
 * On load (run 0, motion allowed) the hero arrives like a conversation starting: the pin badge drops in on the spring, then
 * the "Pinned" label, the film message, the sub and the "who checks" bubble (from 1024px, where they sit side by side, the sub lands before the film), each rising 16px over 280ms; the example thread
 * follows at 640ms and plays its arrival as a chip's does. The film message marks itself data-arrived when it lands, which is
 * what lets its clip play. The intro takes html.js-motion off in the same moment it sets the pieces' start state, so nothing
 * flashes (hero.css holds them down until then).
 *
 * Each time a chip is chosen (run 1, 2, ...) only the thread plays, from the sent bubble on: the sent bubble springs in, then
 * the thread answers (each piece rises over 260ms), the second source lifts and settles on the rail, its leader line draws, and
 * the gap arrives last. Rail nodes pop in on a spring.
 *
 * With reduced motion nothing here runs and the page stays finished.
 */
export default function HeroMotion({ scope, run }: { scope: RefObject<HTMLDivElement | null>; run: number }) {
  const seen = useRef<Seen>({ run: 0, at: 0 });
  useGSAP(
    () => {
      const intro = run === 0;
      if (intro ? !introDue() : !shouldPlay(seen, run)) return; // an intro or an arrival already seen: the page stays finished
      const q = gsap.utils.selector(scope);
      const at = (key: string) => q(`[data-at="${key}"]`);
      const hero = scope.current?.closest<HTMLElement>('.hero') ?? null;
      // What the arrival leaves behind is the page's own styling, so the finished page is exactly the server markup.
      const done = { clearProps: 'opacity,transform' };

      const mm = gsap.matchMedia();
      mm.add(Q_MOTION, () => {
        // Off first: the pieces below are about to be set to their start state by the tweens, and they must read their own styling.
        document.documentElement.classList.remove('js-motion');
        const tl = gsap.timeline({ defaults: { ease: EASE } });
        if (intro && hero) arrive(tl, hero);
        thread(tl, at, q('.trow--rail'), intro ? 0.64 : 0, intro, done);
      });
      return () => mm.revert();
    },
    { scope, dependencies: [run], revertOnUpdate: true },
  );
  return null;
}

/** The hero's pieces, one after another: each rises 16px and fades in over 280ms, on the site's ease. */
function arrive(tl: Scene, hero: HTMLElement, rise = { opacity: 0, y: 16, duration: 0.28, clearProps: 'opacity,transform' }) {
  const piece = (sel: string) => hero.querySelector(sel);
  // The pin badge drops in and settles from 0.6 scale, on the spring.
  tl.from(piece('.hero-h1 .pin'), { opacity: 0, y: -12, scale: 0.6, duration: POP.duration, ease: POP.ease, clearProps: 'opacity,transform' }, 0.12);
  tl.from(piece('.hero-pinned'), rise, 0.2);
  // From 640px the film waits invisible like the rest; on a phone it is already painted and only rises (hero.css says why).
  const film = piece('.hero-film');
  // Side by side (1024px and up) the sub lands first, then the film; on a phone the film comes first, as it is first on the page.
  const [filmAt, subAt] = window.matchMedia(SPLIT).matches ? [0.38, 0.26] : [0.26, 0.38];
  tl.from(film, window.matchMedia(WIDE).matches ? rise : { y: rise.y, duration: rise.duration, clearProps: rise.clearProps }, filmAt);
  tl.add(() => film?.setAttribute('data-arrived', ''), filmAt + rise.duration);
  tl.from(piece('.hero-sub'), rise, subAt);
  tl.from(piece('.hero-who'), rise, 0.5);
}

/** The example thread's arrival, starting `base` seconds in. On load (`intro`) the rail's line is drawn in with it and the receipt arrives last. */
function thread(tl: Scene, at: (key: string) => Element[], rails: Element[], base: number, intro: boolean, done: { clearProps: string }) {
  const rise = (key: string, delay: number) => tl.from(at(key), { opacity: 0, y: 12, duration: 0.26, ...done }, base + delay);
  const pop = (key: string, delay: number) => tl.from(at(key), { scale: 0, duration: POP.duration, ease: POP.ease, ...done }, base + delay);

  // Delays are laid out top to bottom so the thread answers in reading order:
  // sent bubble, your words, the papers card, the lift, then the gap.
  let t = 0.22;
  const dDelivered = t;
  t += 0.2;
  const dPill = t;
  t += 0.1;
  const dMine = t;
  t += 0.22;
  const dShot = t;
  t += 0.3;
  const dNode1 = t;
  t += 0.15;
  const dLift = t;
  const dLeader = t + 0.32;
  const dNode2 = t + 0.5;
  t = dNode2 + 0.1;
  t += 0.15;
  const dGap = t;
  const dGapNode = t + 0.15;

  tl.from(at('send'), { opacity: 0, scale: 0.78, y: 10, duration: SEND.duration, ease: SEND.ease, ...done }, base);
  rise('delivered', dDelivered);
  rise('pill', dPill);
  rise('mine', dMine);

  // The papers card fades up while it overshoots a little: 8px below, 5px above, then home.
  const shot = at('shot');
  tl.fromTo(shot, { opacity: 0 }, { opacity: 1, duration: 0.45, clearProps: 'opacity' }, base + dShot);
  tl.fromTo(shot, { y: 8 }, { y: -5, duration: 0.27 }, base + dShot);
  tl.to(shot, { y: 0, duration: 0.18, clearProps: 'transform' }, base + dShot + 0.27);
  pop('node1', dNode1);
  rise('node1-label', dNode1 + 0.05);

  // The lifted bubble rises from 16px below, unrotated at 0.97 scale, to its resting -1.4deg tilt (the page's CSS).
  tl.from(at('lift'), { opacity: 0, y: 16, rotation: 0, scale: 0.97, duration: 0.3, ...done }, base + dLift);
  tl.from(at('leader'), { scaleX: 0, duration: 0.2, ...done }, base + dLeader);
  pop('node2', dNode2);
  rise('node2-label', dNode2 + 0.05);

  rise('gap', dGap);
  pop('node3', dGapNode);
  rise('node3-label', dGapNode + 0.05);
  // On load the rail's line is held back with the thread (hero.css) so it never stands alone in an empty column. Each stretch of it
  // draws down from its row's top as the row's piece arrives, and the receipt, held down with the thread, arrives last.
  if (intro) {
    [dMine, dShot, dLift, dGap].forEach((delay, i) => tl.fromTo(rails[i], { '--rail-s': 0 }, { '--rail-s': 1, duration: 0.3, clearProps: '--rail-s' }, base + delay));
    rise('receipt', dGapNode + 0.3);
  }
}
