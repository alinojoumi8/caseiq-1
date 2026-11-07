import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POP_SPRING, SEND_SPRING, springAt, springDuration, springPath } from '../src/lib/motion/springs';
import { RECENT_MS, introDue, introSeen, shouldPlay } from '../src/lib/motion/arrival';
import { registerSmoothScroll, scrollToElement } from '../src/lib/motion/smooth';
import { Nothing, ReleaseGate, motionStore, releaseMotionGate } from '../src/lib/motion/lazy';
import { Q_INLINE, Q_MOTION, Q_PINNED, Q_SMOOTH } from '../src/lib/motion/queries';

/** The overshoot of an underdamped spring: how far past 1 its first peak goes. */
function overshoot({ stiffness, damping }: { stiffness: number; damping: number }) {
  const zeta = damping / (2 * Math.sqrt(stiffness));
  return Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta));
}

describe('springs', () => {
  it('start at 0 and settle at 1', () => {
    for (const s of [SEND_SPRING, POP_SPRING]) {
      expect(springAt(s, 0)).toBeCloseTo(0, 6);
      expect(springAt(s, 2)).toBeCloseTo(1, 4);
    }
  });

  it('peak where the damping ratio says they should', () => {
    for (const s of [SEND_SPRING, POP_SPRING]) {
      let peak = 0;
      for (let t = 0; t < 1; t += 0.001) peak = Math.max(peak, springAt(s, t));
      expect(peak - 1).toBeCloseTo(overshoot(s), 3);
    }
    // The chip's sent bubble overshoots a little; a rail node pops harder.
    expect(overshoot(POP_SPRING)).toBeGreaterThan(overshoot(SEND_SPRING));
  });

  it('settle in about half a second (what Motion took)', () => {
    expect(springDuration(SEND_SPRING)).toBeGreaterThan(0.35);
    expect(springDuration(SEND_SPRING)).toBeLessThan(0.55);
    expect(springDuration(POP_SPRING)).toBeGreaterThan(0.5);
    expect(springDuration(POP_SPRING)).toBeLessThan(0.7);
  });

  it('sample into a path that runs from 0,0 to 1,1 and stays in order', () => {
    for (const s of [SEND_SPRING, POP_SPRING]) {
      const { path } = springPath(s);
      expect(path.startsWith('M0,0 L')).toBe(true);
      expect(path.endsWith(' L1,1')).toBe(true);
      const xs = [...path.matchAll(/L([\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[1]));
      expect(xs.length).toBeGreaterThan(50);
      expect(xs).toEqual([...xs].sort((a, b) => a - b));
    }
  });

  it('refuse an overdamped spring rather than return nonsense', () => {
    expect(() => springAt({ stiffness: 100, damping: 40 }, 0.1)).toThrow();
  });
});

describe('arrivals', () => {
  it('play for a new run, and again when React re-runs the effect at once', () => {
    const seen = { current: { run: 0, at: 0 } };
    expect(shouldPlay(seen, 1)).toBe(true);
    expect(shouldPlay(seen, 1)).toBe(true); // the development double-run
    expect(shouldPlay(seen, 2)).toBe(true);
  });

  it('do not replay an arrival seen long ago (the page came back from another route)', () => {
    const seen = { current: { run: 3, at: performance.now() - 60_000 } };
    expect(shouldPlay(seen, 3)).toBe(false);
    expect(shouldPlay(seen, 4)).toBe(true);
  });
});

describe('motion queries', () => {
  it('all sit inside "motion allowed"', () => {
    for (const q of [Q_SMOOTH, Q_PINNED, Q_INLINE]) expect(q.startsWith(Q_MOTION)).toBe(true);
  });

  it('smooth scrolling needs a fine pointer that hovers', () => {
    expect(Q_SMOOTH).toContain('(pointer: fine)');
    expect(Q_SMOOTH).toContain('(hover: hover)');
  });

  it('S4 pins from 900x800 and goes inline below 900 wide', () => {
    expect(Q_PINNED).toContain('(min-width: 900px)');
    expect(Q_PINNED).toContain('(min-height: 800px)');
    expect(Q_INLINE).toContain('(max-width: 899px)');
  });
});

/** A document with just enough of the root element for the arrival checks: the head script's html.js-motion class. */
function fakeDocument(gated: boolean) {
  vi.stubGlobal('document', { documentElement: { classList: { contains: (c: string) => gated && c === 'js-motion' } } });
}

describe('the hero intro and the film message', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('has an intro to play while the head script gate is on, and for a moment after it comes off', () => {
    const now = vi.spyOn(performance, 'now');
    now.mockReturnValue(10_000);
    fakeDocument(true);
    expect(introDue()).toBe(true);
    fakeDocument(false); // the intro took the class off as it started
    now.mockReturnValue(10_000 + RECENT_MS - 1);
    expect(introDue()).toBe(true); // React's development double-run of the effect
    now.mockReturnValue(10_000 + RECENT_MS + 1);
    expect(introDue()).toBe(false); // the page came back from another route
    now.mockRestore();
  });

  it('counts the film message as here when no intro is waiting, or the intro has marked it arrived', () => {
    const message = (arrived: boolean) => ({ hasAttribute: (a: string) => arrived && a === 'data-arrived' }) as unknown as Element;
    fakeDocument(false);
    expect(introSeen(message(false))).toBe(true);
    fakeDocument(true);
    expect(introSeen(message(false))).toBe(false);
    expect(introSeen(message(true))).toBe(true);
  });

  it('uses one window for "recent" everywhere', () => {
    expect(RECENT_MS).toBe(1500);
  });
});

describe('going to a part of the page', () => {
  afterEach(() => registerSmoothScroll(null));

  it('uses the smooth scroll while it is running', () => {
    const smooth = vi.fn();
    const target = { scrollIntoView: vi.fn() } as unknown as HTMLElement;
    registerSmoothScroll(smooth);
    scrollToElement(target);
    expect(smooth).toHaveBeenCalledWith(target);
    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });

  it('falls back to the native jump when it is not, and after it is destroyed', () => {
    const target = { scrollIntoView: vi.fn() } as unknown as HTMLElement;
    scrollToElement(target);
    registerSmoothScroll(vi.fn());
    registerSmoothScroll(null);
    scrollToElement(target);
    expect(target.scrollIntoView).toHaveBeenCalledTimes(2);
  });
});

describe('letting go of the hero intro when its code does not load', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('takes the head script\'s gate off the page', () => {
    const remove = vi.fn();
    vi.stubGlobal('document', { documentElement: { classList: { remove } } });
    releaseMotionGate();
    expect(remove).toHaveBeenCalledWith('js-motion');
  });

  it('is a component that draws nothing (its work is the release, run by an effect)', () => {
    expect(renderToStaticMarkup(createElement(ReleaseGate))).toBe('');
    expect(renderToStaticMarkup(createElement(Nothing))).toBe('');
  });
});

describe('whether motion is allowed, live', () => {
  afterEach(() => vi.unstubAllGlobals());

  /** A matchMedia that can be flipped, like the setting in the operating system. */
  function fakeMedia(initial: boolean) {
    const listeners = new Set<() => void>();
    const mql = {
      matches: initial,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    };
    vi.stubGlobal('window', { matchMedia: (q: string) => ({ ...mql, matches: q === Q_MOTION ? mql.matches : false, addEventListener: mql.addEventListener, removeEventListener: mql.removeEventListener }) });
    return { flip: (to: boolean) => { mql.matches = to; listeners.forEach((fn) => fn()); }, listeners };
  }

  it('is false on the server and while hydrating', () => {
    expect(motionStore.getServerSnapshot()).toBe(false);
  });

  it('follows the setting both ways and stops listening when unsubscribed', () => {
    const media = fakeMedia(false);
    const heard = vi.fn();
    const stop = motionStore.subscribe(heard);
    expect(motionStore.getSnapshot()).toBe(false); // reduced motion: nothing mounts
    media.flip(true);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(motionStore.getSnapshot()).toBe(true); // turned off: the pieces load
    media.flip(false);
    expect(motionStore.getSnapshot()).toBe(false); // turned on again: they unmount
    stop();
    expect(media.listeners.size).toBe(0);
    media.flip(true);
    expect(heard).toHaveBeenCalledTimes(2); // nothing heard after unsubscribing
  });
});
