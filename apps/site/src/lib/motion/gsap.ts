// GSAP, registered once. Client code only, and always loaded lazily (a dynamic import, or a component loaded with
// next/dynamic and ssr: false), so the animation runtime stays out of the first paint.
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { POP_SPRING, SEND_SPRING, springPath } from './springs';

// ScrollTrigger, as it registers, starts two things that run for ever: a requestAnimationFrame loop (an empty callback queued every frame, a
// repaint workaround for old Firefox: about 60 calls a second even when nothing moves) and a 250ms interval that checks the scroll position
// in case a scroll event was missed (which asks for a frame, and runs a full update, four times a second at rest). On a phone, where Lenis is
// off, those were the only frame work left at rest. Nothing here needs them (scrolling reaches ScrollTrigger by the scroll event, and GSAP's
// own ticker sleeps when nothing runs), so the one call that starts each, made as the plugin registers, is swallowed.
// This leans on gsap 3.15.1 internals: ScrollTrigger's _rafBugFix loop and its _sync interval, both started by register() / enable(), and
// register() running here (it also runs at module evaluation if window.gsap already exists, which would bring both back: nothing sets
// window.gsap). Re-check all three on any gsap upgrade; the rest-frames check in checks.mjs fails if they come back.
const requestFrame = window.requestAnimationFrame;
const setTimer = window.setInterval;
window.requestAnimationFrame = () => 0;
window.setInterval = (() => 0) as unknown as typeof window.setInterval;
gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, SplitText);
window.requestAnimationFrame = requestFrame;
window.setInterval = setTimer;
// If anything woke the ticker inside that window (a delayedCall made while registering does), it kept the no-op as its frame request and
// every tween would stop. Put it to sleep and wake it, and it reads the real one again.
gsap.ticker.sleep();
gsap.ticker.wake();

/** The site's one ease: ease-out, cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = 'caseiqOut';
CustomEase.create(EASE, 'M0,0 C0.22,1 0.36,1 1,1');
/** The same ease as a function of progress (0 to 1), for scenes that shape their own curves. */
export const easeOut = gsap.parseEase(EASE) as (progress: number) => number;

/** Each spring as a named ease and the seconds it takes to settle, so a tween can be given both. */
function springEase(name: string, spring: typeof SEND_SPRING) {
  const { path, duration } = springPath(spring);
  CustomEase.create(name, path);
  return { ease: name, duration };
}
/** A chosen chip appears as a sent bubble (stiffness 480, damping 24). */
export const SEND = springEase('caseiqSend', SEND_SPRING);
/** A rail node pops in (stiffness 500, damping 18). */
export const POP = springEase('caseiqPop', POP_SPRING);

if (typeof document !== 'undefined') {
  // Fonts swap in after the first paint and move the headings; measure the scroll triggers again once they have.
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // A read-only count of live scroll triggers, for the behaviour checks (scripts/shoot.mjs, scripts/a11y.mjs) that look for any left
  // behind after a page is left. Only a page a check opened has it: the check sets window.__qa before the page runs. Visitors never do.
  if ((window as { __qa?: unknown }).__qa === true) {
    Object.defineProperty(window, '__scrollTriggers', { value: () => ScrollTrigger.getAll().length, configurable: true });
    // What keeps the GSAP ticker awake: its listeners and the running animations in the global timeline (for the rest-state checks).
    Object.defineProperty(window, '__tickerBusy', {
      value: () => ({
        listeners: (gsap.ticker as unknown as { _listeners: unknown[] })._listeners.length,
        running: gsap.globalTimeline.getChildren(false, true, true).filter((a) => !a.paused() && a.timeScale() !== 0).map((a) => `${a.constructor.name} ${a.duration().toFixed(2)}s p${a.progress().toFixed(2)} ${a.scrollTrigger ? "scroll" : "-"} ${a.data ?? ""}`),
      }),
      configurable: true,
    });
  }
}

export { gsap, useGSAP, ScrollTrigger, CustomEase, SplitText };
