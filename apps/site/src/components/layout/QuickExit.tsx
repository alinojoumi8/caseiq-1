'use client';

import { useEffect, useId } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';
import { en } from '@/content/en';
import { track } from '@/lib/analytics';

const QUICK_EXIT_URL = process.env.NEXT_PUBLIC_QUICK_EXIT_URL ?? 'https://www.google.ca';

function exit() {
  track('quick_exit');
  // replace(), never pushState: the back button must not return here.
  window.location.replace(QUICK_EXIT_URL);
}

/** Is this element drawn? A route the visitor has left can stay mounted but hidden, and its layers are not on screen. */
function rendered(el: Element) {
  return typeof el.checkVisibility === 'function' ? el.checkVisibility() : el.getClientRects().length > 0;
}

/** True while a dialog, popover or menu is open and on screen. Esc belongs to that layer first. */
function layerIsOpen() {
  return Array.from(document.querySelectorAll('[data-layer-open], dialog[open]')).some(rendered);
}

/**
 * Mounted once: pressing Esc twice within one second leaves the site,
 * but only when no dialog or popover is open (Esc closes those first).
 */
export function QuickExitKey() {
  useEffect(() => {
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat) return;
      if (layerIsOpen()) {
        last = 0;
        return;
      }
      const now = e.timeStamp;
      if (last && now - last <= 1000) {
        exit();
      } else {
        last = now;
      }
    };
    // Capture phase: this runs before the popover and menu handlers close themselves, so an Esc that closes a layer is never counted.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);
  return null;
}

/**
 * The visible Quick exit. It is a link to the exit page, so it still leaves the site with no JavaScript (a visitor whose scripts
 * have not arrived, or who has none, can use it). With JavaScript a plain click is taken over: it tracks the exit and uses
 * replace(), so the back button never returns here. A modified click (a new tab) is left to the browser.
 * Name comes from its visible text; the longer copy is its description.
 */
export function QuickExitButton({ className = 'qx', asLink = false }: { className?: string; asLink?: boolean }) {
  const descId = useId();
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    exit();
  }
  // A link answers Enter by itself; the old button answered Space too, and a panic key should answer both.
  function onKeyDown(e: ReactKeyboardEvent<HTMLAnchorElement>) {
    if (e.key !== ' ' || e.defaultPrevented) return;
    e.preventDefault();
    exit();
  }
  return (
    <>
      <a href={QUICK_EXIT_URL} rel="noreferrer" className={className} onClick={onClick} onKeyDown={onKeyDown} aria-describedby={descId} data-quick-exit={asLink ? 'link' : 'bar'}>
        {en.quickExit.label}
      </a>
      <span id={descId} className="sr-only">
        {en.quickExit.aria}. {en.quickExit.hint}
      </span>
    </>
  );
}
