'use client';

import { useEffect, useId, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { en } from '@/content/en';
import { track } from '@/lib/analytics';
import { sheetTargetForClick, sheetTargetForHash } from '@/lib/sheetTrigger';
import { useConversation } from '@/components/ConversationContext';
import { QuickExitButton } from '@/components/layout/QuickExit';
import { scrollToElement } from '@/lib/motion/smooth';
import { ChatGlyph, CloseIcon } from '@/components/world/icons';
import { IntakeAndWaitlist } from './b/IntakeAndWaitlist';
import '@/app/sheet.css';

/** Can this element take focus right now? Connected, and not hidden (display:none, visibility:hidden, a closed menu panel). */
function usable(el: Element | null | undefined): el is HTMLElement {
  if (!el || !el.isConnected) return false;
  const check = (el as HTMLElement).checkVisibility;
  return typeof check === 'function' ? check.call(el, { checkVisibilityCSS: true, visibilityProperty: true } as CheckVisibilityOptions) : true;
}

/** Moves to a section of the page after the sheet has closed: scroll to it and start keyboard focus at its heading. */
function goToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const heading = section.querySelector<HTMLElement>('h1, h2, h3') ?? section;
  if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  scrollToElement(section);
}

/**
 * The conversation sheet: the intake and the early-access list, opened over the page from every call to action.
 * A native <dialog> (showModal gives the focus trap and the inert page; Esc closes it). It is mounted once and stays
 * mounted when closed, so a visitor's answers are still there when they open it again.
 *
 * Opening never touches the URL or the history: Quick exit uses location.replace(), and the back button must not
 * be able to bring a visitor back to this site, so the sheet adds no history entry and leaves the hash alone.
 */
export function ConversationSheet() {
  const conv = useConversation();
  const { dialogRef, open, takeOpener, currentStep } = conv;
  const dialogNameId = useId();
  const statusId = useId();
  const pressedOnBackdrop = useRef(false);
  const skipFocusReturn = useRef(false);
  const closedByCleanup = useRef(false);

  // Plain clicks on this page's own calls to action open the sheet. Capture phase, so this runs before the link's own
  // handlers (next/link would otherwise start a navigation to the hash).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest('a') : null;
      if (!link) return;
      const target = sheetTargetForClick({
        href: link.getAttribute('href'),
        button: e.button,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        defaultPrevented: e.defaultPrevented,
        target: link.getAttribute('target'),
        download: link.hasAttribute('download'),
      });
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      const from = link.closest<HTMLElement>('[data-cta]')?.dataset.cta ?? 'other';
      open({ from, waitlist: target === 'waitlist' });
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [open]);

  // Arriving at /#start or /#waitlist (the legal pages link there): open the sheet, then drop the hash so a reload doesn't reopen it.
  // Checked a moment after mount as well, because a client-side navigation sets the hash just after the page mounts.
  useEffect(() => {
    const check = () => {
      const target = sheetTargetForHash(window.location.hash);
      if (!target) return;
      open({ from: 'hash', waitlist: target === 'waitlist' });
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    };
    const timers = [window.setTimeout(check, 0), window.setTimeout(check, 160)];
    window.addEventListener('hashchange', check);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('hashchange', check);
    };
  }, [open]);

  // The same as the film player: a page the router hides stays mounted, and an open modal sheet would keep it inert and keep Esc from counting.
  // Its effects are cleaned up there, so the sheet is closed in the cleanup itself, without sending focus back into the hidden page.
  useEffect(() => {
    const dialog = dialogRef.current;
    closedByCleanup.current = false;
    // A close the cleanup caused is told apart from the visitor's by this flag; if its close event never came, the flag must not outlive
    // the next time the sheet opens, or it would swallow that close.
    const opened = (e: Event) => {
      if ((e as ToggleEvent).newState === 'open') closedByCleanup.current = false;
    };
    dialog?.addEventListener('toggle', opened);
    return () => {
      dialog?.removeEventListener('toggle', opened);
      takeOpener();
      dialog?.removeAttribute('data-layer-open');
      if (dialog?.open) {
        closedByCleanup.current = true; // the page closed it, not the visitor: that is not a "convo_close"
        dialog.close();
      }
    };
  }, [dialogRef, takeOpener]);

  function onClose() {
    dialogRef.current?.removeAttribute('data-layer-open');
    if (closedByCleanup.current) closedByCleanup.current = false;
    else track('convo_close', { step: currentStep() + 1 });
    const opener = takeOpener();
    if (skipFocusReturn.current) {
      skipFocusReturn.current = false;
      return;
    }
    // Focus goes back to the control that opened the sheet. That control can be gone (the launcher's chips become a message once the
    // visitor has answered) or hidden (the phone menu closes itself when the sheet's Close is pressed): a link in the menu falls back
    // to the menu button, anything else, and a sheet opened by a link with a hash, to the launcher's button.
    let target: HTMLElement | null = null;
    if (usable(opener?.el)) target = opener.el;
    else if (opener?.inMenu) target = document.querySelector<HTMLElement>('.nav__menu-btn');
    if (!usable(target)) target = document.querySelector<HTMLElement>('[data-convo-return]');
    if (usable(target)) target.focus({ preventScroll: true });
  }

  function onClick(e: ReactMouseEvent<HTMLDialogElement>) {
    const dlg = dialogRef.current;
    if (!dlg) return;
    // A click on the backdrop lands on the dialog element itself. A drag that started inside (selecting text) and ended on the backdrop does not count.
    if (e.target === dlg) {
      if (pressedOnBackdrop.current) dlg.close();
      return;
    }
    // A link to a section of this page, from inside the sheet (for example "free legal help"): close the sheet, then go there.
    const link = e.target instanceof Element ? e.target.closest('a') : null;
    const href = link?.getAttribute('href');
    if (link && href && href.length > 1 && href.startsWith('#') && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      skipFocusReturn.current = true;
      dlg.close();
      goToSection(href.slice(1));
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="convo-sheet"
      aria-labelledby={dialogNameId}
      aria-describedby={statusId}
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === dialogRef.current;
      }}
      onClick={onClick}
      onClose={onClose}
    >
      <span id={dialogNameId} className="sr-only">
        {en.convo.dialogName}
      </span>
      <div className="sheet-head">
        {/* Quick exit comes first in the tab order, as everywhere on the site. The page's own Quick exit is inert behind the sheet. */}
        <QuickExitButton className="qx sheet-head__qx" />
        <button type="button" className="icon-btn sheet-head__close" onClick={() => conv.close()} aria-label={en.ui.close}>
          <CloseIcon />
        </button>
        <div className="sheet-head__who">
          <span className="sheet-head__avatar" aria-hidden="true">
            <ChatGlyph size={22} />
          </span>
          <div className="sheet-head__text">
            <h2 className="sheet-head__name">
              {en.brand.name}
            </h2>
            <p id={statusId} className="sheet-head__status">
              {en.convo.status}
            </p>
          </div>
        </div>
      </div>
      <div className="sheet-scroll" data-lenis-prevent>
        <IntakeAndWaitlist />
      </div>
    </dialog>
  );
}
