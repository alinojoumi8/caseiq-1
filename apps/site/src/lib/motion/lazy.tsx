'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { Q_MOTION } from './queries';

/** What a lazy piece becomes when its code could not be fetched: nothing at all. */
export function Nothing() {
  return null;
}

/**
 * A client piece loaded after hydration (the motion pieces, the film player). next/dynamic throws when a chunk fails to load,
 * and Next answers an uncaught throw by replacing the whole page with its error screen. These pieces only add to a page that is
 * already complete, so a chunk that fails is not worth that: the loader catches it and the piece becomes `Fallback`, which
 * renders nothing (or does one small cleanup, such as letting go of the hero's intro gate).
 */
export function lazyPiece<P extends object>(load: () => Promise<{ default: ComponentType<P> }>, Fallback: ComponentType<P> = Nothing) {
  return dynamic<P>(() => load().catch(() => ({ default: Fallback })), { ssr: false });
}

/** The hero holds its pieces down under html.js-motion until the intro plays. This lets go of them (what the head script's 2.5 s failsafe does). */
export function releaseMotionGate() {
  document.documentElement.classList.remove('js-motion');
}

/** The fallback for the hero's motion: its code did not load, so the page shows as it is, at once. */
export function ReleaseGate() {
  useEffect(releaseMotionGate, []);
  return null;
}

/** The store behind useMotionAllowed, apart from the hook so a test can drive it: the setting now, and a way to hear it change. */
export const motionStore = {
  subscribe(onChange: () => void) {
    const mql = window.matchMedia(Q_MOTION);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  },
  getSnapshot: () => window.matchMedia(Q_MOTION).matches,
  getServerSnapshot: () => false,
};

/**
 * Is motion allowed right now? False on the server, while hydrating and under prefers-reduced-motion; it follows the setting live.
 * The motion pieces are mounted only while it is true, so a visitor who asked for less motion never downloads GSAP, and turning the
 * setting on unmounts them (which reverts what they did) while turning it off loads them.
 */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(motionStore.subscribe, motionStore.getSnapshot, motionStore.getServerSnapshot);
}
