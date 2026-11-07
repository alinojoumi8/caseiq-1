'use client';

import { useEffect } from 'react';
import 'lenis/dist/lenis.css';
import { Q_SMOOTH } from '@/lib/motion/queries';
import { registerSmoothScroll } from '@/lib/motion/smooth';
import { sheetTargetForHash } from '@/lib/sheetTrigger';

/** A modal dialog or a menu is open. A non-modal popover does not count: the page still scrolls behind it, as it always has. */
const LAYER = 'dialog[open], [data-layer-open]:not([aria-modal="false"])';

/**
 * Smooth wheel scrolling with Lenis, mounted once for the whole site.
 * It runs only for a mouse or trackpad on a screen that hovers, with motion allowed; phones, tablets and reduced motion
 * keep the browser's own scrolling, and nothing is downloaded for them. Lenis smooths the wheel and nothing else: it never
 * captures, snaps or hijacks the scroll. It is driven by the GSAP ticker so ScrollTrigger always reads the same position,
 * and it stops while a dialog or menu is open (their scrollers carry data-lenis-prevent so they still scroll).
 * Links to another part of this page glide there and leave focus where it was, as the browser's own jump does.
 */
export function SmoothScroll() {
  useEffect(() => {
    const mql = window.matchMedia(Q_SMOOTH);
    let alive = true;
    let booted = false;
    let teardown: (() => void) | undefined;

    function boot() {
      if (booted) return;
      booted = true;
      void Promise.all([import('@/lib/motion/gsap'), import('lenis')]).then(([{ gsap, ScrollTrigger, easeOut }, { default: Lenis }]) => {
        if (!alive) return;
        // matchMedia creates Lenis when the conditions hold and destroys it when they stop holding (a trackpad unplugged, motion switched off).
        const mm = gsap.matchMedia();
        mm.add(Q_SMOOTH, () => {
          const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false, anchors: false });
          const tick = (time: number) => lenis.raf(time * 1000);
          const sync = () => ScrollTrigger.update();
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
          lenis.on('scroll', sync);

          // A link to a part of this page waits here while Lenis is stopped behind a menu that is closing.
          let waiting: (() => void) | null = null;
          const follow = () => {
            if (document.querySelector(LAYER)) {
              lenis.stop();
              return;
            }
            if (lenis.isStopped) lenis.start();
            if (waiting) {
              const go = waiting;
              waiting = null;
              go();
            }
          };
          const layers = new MutationObserver(follow);
          // Only the two attributes a layer opens and closes with (a dialog's open, a menu's data-layer-open), not every node the page adds.
          layers.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open', 'data-layer-open'] });
          follow();

          const scrollTo = (target: HTMLElement) => {
            // Lenis lands where the browser's own jump does: under the sticky strip (scroll-padding), past the target's scroll-margin.
            const go = () => {
              const distance = Math.abs(target.getBoundingClientRect().top);
              lenis.scrollTo(target, { duration: Math.min(1.4, Math.max(0.6, distance / 3000)), easing: easeOut, force: true });
            };
            if (!lenis.isStopped) {
              go();
              return;
            }
            waiting = go;
            window.setTimeout(() => {
              if (waiting === go) waiting = null;
            }, 600);
          };
          registerSmoothScroll(scrollTo);

          const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const link = e.target instanceof Element ? e.target.closest('a[href]') : null;
            if (!(link instanceof HTMLAnchorElement)) return;
            // The skip link keeps the browser's jump, which also moves focus to #main. Links inside a dialog (the form's error summary) are not ours.
            if (link.classList.contains('skip-link') || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
            if (link.closest('dialog, [data-lenis-prevent]')) return;
            const url = new URL(link.href);
            if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
            if (url.hash.length < 2 || sheetTargetForHash(url.hash)) return;
            const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
            if (!target) return;
            // Only the scroll is ours: the link's own handlers still run (the phone menu closes itself), and focus stays on the link,
            // as it does when Next scrolls to a hash. The address gets the hash the way a followed link would leave it.
            e.preventDefault();
            if (location.hash !== url.hash) history.pushState(null, '', url.pathname + url.search + url.hash);
            scrollTo(target);
          };
          window.addEventListener('click', onClick, true);

          return () => {
            window.removeEventListener('click', onClick, true);
            registerSmoothScroll(null);
            layers.disconnect();
            lenis.off('scroll', sync);
            gsap.ticker.remove(tick);
            gsap.ticker.lagSmoothing(500, 33); // GSAP's own default
            lenis.destroy();
          };
        });
        teardown = () => mm.revert();
      }).catch(() => {
        // Lenis or GSAP did not load: the page keeps the browser's own scrolling, which is all it had without them.
      });
    }

    const onChange = () => {
      if (!mql.matches) return;
      mql.removeEventListener('change', onChange);
      boot();
    };
    if (mql.matches) boot();
    else mql.addEventListener('change', onChange);

    return () => {
      alive = false;
      mql.removeEventListener('change', onChange);
      teardown?.();
    };
  }, []);

  return null;
}
