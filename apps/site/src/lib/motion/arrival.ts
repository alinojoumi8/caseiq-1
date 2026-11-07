// A one-shot arrival (a chip's thread, a fresh answer) plays when its run number changes. When the visitor comes back to
// the page from another route, React re-runs the effects with the same run number; that arrival was seen long ago, so it
// is not replayed. React's development double-run of an effect happens within a moment, so it still plays.
// The hero's intro and the film message's snap follow the same rule, and both ask it from here.
import type { RefObject } from 'react';

/** React's development double-run of an effect happens within this many ms; a second run after that is a page coming back from another route. */
export const RECENT_MS = 1500;

export interface Seen {
  run: number;
  at: number;
}

/** Should this run of the arrival play now? Call it once per effect run. */
export function shouldPlay(seen: RefObject<Seen>, run: number): boolean {
  const now = performance.now();
  if (seen.current.run === run && now - seen.current.at > RECENT_MS) return false;
  if (seen.current.run !== run) seen.current = { run, at: now };
  return true;
}

let introAt = -Infinity;

/** Is there an intro to play? Yes while the head script's html.js-motion is on (it has not been played), or in the moment after it started. */
export function introDue(): boolean {
  const now = performance.now();
  if (document.documentElement.classList.contains('js-motion')) {
    introAt = now;
    return true;
  }
  return now - introAt < RECENT_MS;
}

/** Is the hero's film message already here: no intro is waiting to bring it in, or the intro has marked it data-arrived? */
export function introSeen(message: Element): boolean {
  return !document.documentElement.classList.contains('js-motion') || message.hasAttribute('data-arrived');
}
