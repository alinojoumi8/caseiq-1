/**
 * Keeps the current question in view above the composer, the way a messaging app keeps the newest message above its input bar.
 * The whole step (its legend down to its last option, note or error) is brought just above the dock. If the step is taller than
 * the room above the dock, its legend sits a little below the top of the thread instead, so the question is always in view.
 * Nothing moves when the step already fits where it is.
 */
export function revealStep(legend: HTMLElement | null, behavior: 'smooth' | 'auto' = 'auto') {
  if (!legend) return;
  const scroller = legend.closest<HTMLElement>('.sheet-scroll');
  if (!scroller) return;
  const step = legend.closest<HTMLElement>('fieldset.step') ?? legend;
  const dock = scroller.querySelector<HTMLElement>('.composer-dock');
  const dockHeight = dock && dock.offsetHeight > 0 ? dock.offsetHeight : 0;

  // The dock already carries about 26px of fade above its bar, so the step needs no extra room below it; above, the question keeps 12px.
  const roomTop = 12;
  const box = scroller.getBoundingClientRect();
  const top = legend.getBoundingClientRect().top - box.top + scroller.scrollTop;
  let bottom = step.getBoundingClientRect().bottom - box.top + scroller.scrollTop;
  // The early-access link follows the last step in the thread. When it fits with the step it comes along, so a link is never left half under the dock.
  const tail = scroller.querySelector<HTMLElement>('.wl-toggle');
  if (tail) {
    const withTail = tail.getBoundingClientRect().bottom - box.top + scroller.scrollTop;
    if (withTail > bottom && withTail - top + roomTop <= scroller.clientHeight - dockHeight) bottom = withTail;
  }
  const view = scroller.clientHeight - dockHeight; // the part of the thread above the dock
  const max = scroller.scrollHeight - scroller.clientHeight;

  let target = scroller.scrollTop;
  if (bottom - top + roomTop > view) {
    target = top - roomTop; // too tall to fit: the question first
  } else if (bottom > scroller.scrollTop + view) {
    target = bottom - view; // sits low: lift it above the dock
  } else if (top - roomTop < scroller.scrollTop) {
    target = top - roomTop; // sits high: bring the question back in
  }
  target = Math.max(0, Math.min(target, max));
  if (Math.abs(target - scroller.scrollTop) < 1) return;
  scroller.scrollTo({ top: target, behavior });
}

/** Smooth only when the visitor has not asked for less motion. */
export function motionBehavior(): 'smooth' | 'auto' {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
