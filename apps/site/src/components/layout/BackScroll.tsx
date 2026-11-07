'use client';

import { useEffect } from 'react';

/** How long the page's own smooth scrolling is held off after Back or Forward, for the router to put the page back where it was. */
const HOLD_MS = 800;

/**
 * Back and Forward put the page back where it was in one step. The stylesheet makes scrolling smooth (so a link to part of the page glides),
 * and the router's restore of the old position is a scroll like any other, so it would show the top of the page and then fly the whole length
 * of it. Next 16's own switch for this (data-scroll-behavior on <html>) did not change that, so for a moment after a popstate the page's
 * scrolling is instant. Mounted once for the whole site.
 */
export function BackScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;
    const release = () => root.style.removeProperty('scroll-behavior');
    const onPop = () => {
      root.style.scrollBehavior = 'auto';
      window.clearTimeout(timer);
      timer = window.setTimeout(release, HOLD_MS);
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.clearTimeout(timer);
      release();
    };
  }, []);
  return null;
}
