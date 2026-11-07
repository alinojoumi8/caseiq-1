'use client';

import { EASE, ScrollTrigger, SplitText, gsap, useGSAP } from '@/lib/motion/gsap';

/**
 * Each section below the hero, and what arrives in it. The heading reveals word by word (a heading that holds anything but plain text
 * fades and rises whole), then the section's messages rise 16px, in order. Selectors, not components: the sections stay plain server
 * markup. S4's filing scene (its pin and its rows) and the FAQ's accordion are left alone; S4 only brings in its heading, which is
 * well above the pin's start. The thread in the Ask section keeps its own arrival (AskMotion). A heading always plays before its messages.
 */
const SECTIONS: { id: string; heading: string; items: string[] }[] = [
  { id: 'problem', heading: '#problem-h', items: ['.problem-msg', '.problem-bridge'] },
  { id: 'pile', heading: '#pile-h', items: [] },
  { id: 'how', heading: '#how-h', items: ['.how-step', '.note'] },
  { id: 'founding', heading: '#founding-h', items: ['.founding__body', '.founding__points li', '.founding__cta', '.founding__alt'] },
  { id: 'get', heading: '#get-h', items: ['.get-thing', '.get-formats', '.get-also'] },
  { id: 'ask', heading: '#ask-h', items: ['.facts li', '.ask__body', '.convo'] },
  { id: 'limits', heading: '#limits-h', items: ['.limits__bubble', '.limits__help-title', '.limits__cards li'] },
  { id: 'privacy', heading: '#privacy-h', items: ['.priv__thread > .msg'] },
  { id: 'faq', heading: '#faq-h', items: ['.faq__item'] },
  { id: 'start', heading: '#start-h', items: ['.final__body', '.final__email', '.final__card', '.final__link'] },
];

/**
 * The one line a heading or a message must cross to come in: 8px above the sticky reply bar on a phone (where the bar covers the foot of the
 * screen, so nothing arrives under it), and 88% of the way down the screen where there is no bar. The bar's height is read from the page.
 */
const line = () => {
  const bar = document.querySelector<HTMLElement>('.sticky-reply')?.offsetHeight ?? 0; // 0 where the bar is not drawn (wider screens)
  return Math.round(bar ? window.innerHeight - bar - 8 : window.innerHeight * 0.88);
};
const START = () => `top ${line()}px`;
/** A message is hidden 16px low, and a trigger measures where the element is, so it starts that far further down: it then crosses the line at its resting place. */
const ITEM_START = () => `top ${line() + ITEM.rise}px`;
/** Past the line by more than this fraction of the screen when its trigger fires, an element has been jumped to (a link, a find), not scrolled to. */
const JUMPED = 0.25;
const WORD = { rise: '0.35em', duration: 0.3, stagger: 0.05 };
const ITEM = { rise: 16, duration: 0.26, stagger: 0.09 };
/** Messages that come in within this many ms of each other arrive as one run, in order. */
const RUN_MS = 120;

/**
 * What has already arrived, by name, for the life of the page. A route the visitor leaves stays mounted but hidden and this component
 * is cleaned up (everything below is reverted) and set up again on return; what they have already seen is not hidden a second time.
 */
const arrived = new Set<string>();

/** Is this element still below the screen? Only what is below the fold when this runs may be hidden; the rest shows at once. */
const belowFold = (el: Element) => el.getBoundingClientRect().top >= window.innerHeight;

/** True for a heading that is only text (and bare spans around it): splitting it into words cannot break any markup. */
const plainText = (el: HTMLElement) => Array.from(el.querySelectorAll('*')).every((n) => n.tagName === 'SPAN' && n.attributes.length === 0);

/**
 * The reveals, in one place. It renders nothing. Under reduced motion, with no JavaScript, or if this code does not load, nothing is
 * ever hidden: the start states below are set here, by GSAP, and only on what is below the fold when it runs. Printing shows everything
 * (a print rule in chrome.css, and a reveal-all before the page is printed). Everything made here is reverted when the route is hidden.
 */
export default function SectionMotion() {
  useGSAP((_, contextSafe) => {
    const safe = contextSafe as <F extends (...a: never[]) => unknown>(fn: F) => F;
    // What is waiting to arrive, so it can be let in at once (a print, a jump to a section).
    const waiting = new Map<string, () => void>();
    const busyUntil = new Map<string, number>();
    // Where each waiting message is, for a jump: only those already passed are let in, the rest keep their place in the line.
    const where = new Map<string, Element>();
    const run = new Map<string, { at: number; n: number }>();
    // Each section's heading, still to be played. A message that crosses the line first plays it at once, so a heading always leads.
    const heads = new Map<string, () => void>();

    const arriveNow = safe((keep: (key: string) => boolean) => {
      for (const [key, fn] of [...waiting]) {
        if (!keep(key)) continue;
        waiting.delete(key);
        fn();
      }
    });

    for (const section of SECTIONS) {
      const root = document.getElementById(section.id);
      const heading = root?.querySelector<HTMLElement>(section.heading);
      if (!root || !heading) continue;

      // A trigger that fires with its element far above the line means the page was jumped, not scrolled: the whole section comes in at once.
      const jumped = (el: Element) => el.getBoundingClientRect().top < line() - window.innerHeight * JUMPED;
      const arriveThis = () =>
        arriveNow((key) => key.startsWith(`${section.id}:`) && (key.endsWith(':h') || (where.get(key)?.getBoundingClientRect().top ?? 0) < line() + ITEM.rise));

      // The heading.
      const hKey = `${section.id}:h`;
      if (arrived.has(hKey) || !belowFold(heading)) {
        arrived.add(hKey);
      } else if (plainText(heading)) {
        const split = SplitText.create(heading, { type: 'words', wordsClass: 'rv-word', aria: 'auto' });
        gsap.set(split.words, { opacity: 0, y: WORD.rise });
        const done = safe(() => {
          split.revert();
          arrived.add(hKey);
        });
        waiting.set(hKey, () => {
          heads.delete(section.id);
          gsap.killTweensOf(split.words);
          done();
        });
        const play = safe(() => {
          if (jumped(heading)) return arriveThis();
          if (!waiting.delete(hKey)) return;
          heads.delete(section.id);
          busyUntil.set(section.id, performance.now() + (WORD.duration + WORD.stagger * (split.words.length - 1)) * 1000);
          gsap.to(split.words, { opacity: 1, y: 0, duration: WORD.duration, ease: EASE, stagger: WORD.stagger, onComplete: done });
        });
        heads.set(section.id, play);
        ScrollTrigger.create({ trigger: heading, start: START, once: true, refreshPriority: -1, onEnter: play });
      } else {
        heading.setAttribute('data-rv', '');
        gsap.set(heading, { opacity: 0, y: ITEM.rise });
        const done = safe(() => {
          heading.removeAttribute('data-rv');
          gsap.set(heading, { clearProps: 'opacity,transform' });
          arrived.add(hKey);
        });
        waiting.set(hKey, () => {
          heads.delete(section.id);
          gsap.killTweensOf(heading);
          done();
        });
        const play = safe(() => {
          if (jumped(heading)) return arriveThis();
          if (!waiting.delete(hKey)) return;
          heads.delete(section.id);
          busyUntil.set(section.id, performance.now() + WORD.duration * 1000);
          gsap.to(heading, { opacity: 1, y: 0, duration: WORD.duration, ease: EASE, onComplete: done });
        });
        heads.set(section.id, play);
        ScrollTrigger.create({ trigger: heading, start: START, once: true, refreshPriority: -1, onEnter: play });
      }

      // The messages, each as it comes in, after the heading has finished.
      const items = section.items.flatMap((sel) => Array.from(root.querySelectorAll<HTMLElement>(sel)));
      items.forEach((el, i) => {
        const key = `${section.id}:${i}`;
        if (arrived.has(key) || !belowFold(el)) {
          arrived.add(key);
          return;
        }
        el.setAttribute('data-rv', '');
        where.set(key, el);
        gsap.set(el, { opacity: 0, y: ITEM.rise });
        const done = safe(() => {
          el.removeAttribute('data-rv');
          gsap.set(el, { clearProps: 'opacity,transform' });
          arrived.add(key);
        });
        waiting.set(key, () => {
          gsap.killTweensOf(el);
          done();
        });
        ScrollTrigger.create({
          trigger: el,
          start: ITEM_START,
          once: true,
          refreshPriority: -1,
          onEnter: safe(() => {
            if (jumped(el)) return arriveThis();
            if (!waiting.delete(key)) return;
            heads.get(section.id)?.();
            const now = performance.now();
            const last = run.get(section.id);
            const n = last && now - last.at < RUN_MS ? last.n + 1 : 0;
            run.set(section.id, { at: now, n });
            // One that comes in while the heading is still arriving waits for it; those that come in together arrive in order.
            const wait = Math.max(0, (busyUntil.get(section.id) ?? 0) - now) / 1000;
            gsap.to(el, { opacity: 1, y: 0, duration: ITEM.duration, ease: EASE, delay: wait + n * ITEM.stagger, onComplete: done });
          }),
        });
      });
    }

    // A jump to a section (a link, find-in-page, a hash in the address) lands on content that is there; so does a print, and so does a Tab
    // into a section: focus never rests on something not yet shown. A click on an in-page link (the menu, the sticky bar, the footer) moves
    // the page by pushState, which fires no hashchange, so its target's section is let in as the link is clicked, before the scroll starts.
    // A jump (not a Tab) also lets in the section above, the foot of which is on screen at the top as the target lands.
    const arriveSection = (el: Element | null, above = false) => {
      const section = el?.closest('section[id]');
      if (!section) return;
      const before = above ? section.previousElementSibling?.id : undefined;
      arriveNow((key) => key.startsWith(`${section.id}:`) || (!!before && key.startsWith(`${before}:`)));
    };
    const target = (hash: string) => (hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null);
    const toHash = () => arriveSection(target(window.location.hash), true);
    const onFocus = (e: FocusEvent) => arriveSection(e.target instanceof Element ? e.target : null);
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href*="#"]') : null;
      if (link && link.origin === window.location.origin && link.pathname === window.location.pathname) arriveSection(target(link.hash), true);
    };
    const beforePrint = () => arriveNow(() => true);
    toHash();
    window.addEventListener('hashchange', toHash);
    window.addEventListener('beforeprint', beforePrint);
    document.addEventListener('focusin', onFocus, true);
    document.addEventListener('click', onClick, true);
    // A resize or a zoom at rest brings new content on screen with no scroll. ScrollTrigger measures again after one (its 250ms check for a
    // missed scroll is off, see lib/motion/gsap.ts) and does not look at where the page is then, so it is asked to, once, as it finishes.
    const look = () => ScrollTrigger.update();
    ScrollTrigger.addEventListener('refresh', look);
    return () => {
      ScrollTrigger.removeEventListener('refresh', look);
      window.removeEventListener('hashchange', toHash);
      window.removeEventListener('beforeprint', beforePrint);
      document.removeEventListener('focusin', onFocus, true);
      document.removeEventListener('click', onClick, true);
    };
  });
  return null;
}
