// Whether smooth scrolling is running, and one way to go to a part of the page either way.
// This file does not import Lenis: SmoothScroll registers itself here once it has started, so callers stay light.

type ScrollTo = (target: HTMLElement) => void;

let smoothScrollTo: ScrollTo | null = null;

/** SmoothScroll calls this when Lenis starts (with its scroll function) and when it is destroyed (with null). */
export function registerSmoothScroll(fn: ScrollTo | null) {
  smoothScrollTo = fn;
}

/** Scrolls an element into place under the sticky strip. With smooth scrolling off this is the browser's own scrollIntoView. */
export function scrollToElement(target: HTMLElement) {
  if (smoothScrollTo) smoothScrollTo(target);
  else target.scrollIntoView();
}
