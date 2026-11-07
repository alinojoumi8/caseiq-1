'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { en } from '@/content/en';
import { useConversation } from '@/components/ConversationContext';
import { NoBreak } from '@/components/world/NoBreak';
import { ChevronIcon } from '@/components/world/icons';
import { IntakeChat } from './IntakeChat';
import { WaitlistForm } from './WaitlistForm';

/**
 * The body of the conversation sheet. Holds what the two forms share: the case type that travels from the intake to the
 * early-access list when the visitor says their case is outside Ontario (React state only, never the URL), and whether
 * the list is open.
 * The list sits behind a disclosure link under the thread. It opens by itself when the intake sends the visitor there, and
 * when the sheet is opened for it (a link to #waitlist, or the early-access link in the closing section).
 */
export function IntakeAndWaitlist() {
  const panelId = useId();
  const { attach } = useConversation();
  const [carried, setCarried] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The composer lives in a dock at the very bottom of the thread, after the early-access disclosure on screen.
  const [dockEl, setDockEl] = useState<HTMLDivElement | null>(null);

  // The dock's live height, for the scroller's scroll padding: a focused field is never even partly under the dock.
  useEffect(() => {
    if (!dockEl) return;
    const scroller = dockEl.closest<HTMLElement>('.sheet-scroll');
    if (!scroller) return;
    const measure = () => scroller.style.setProperty('--dock-h', `${dockEl.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(dockEl);
    return () => ro.disconnect();
  }, [dockEl]);

  // After the list is opened on the visitor's behalf, focus moves to its heading once it is on screen.
  useEffect(() => {
    if (focusTick > 0) headingRef.current?.focus();
  }, [focusTick]);

  function showWaitlist() {
    setOpen(true);
    setFocusTick((t) => t + 1);
  }

  useEffect(() => {
    attach({ showWaitlist });
  });

  function joinWaitlist(caseType: string | null) {
    setCarried(caseType);
    showWaitlist();
  }

  return (
    <div className="convo-body">
      <IntakeChat onJoinWaitlist={joinWaitlist} dockEl={dockEl} />
      {/* In the markup the dock follows the thread, so Tab goes from the question to Back and Next; on screen it is drawn last. */}
      {/* While the early-access list is open the intake's composer steps aside (hidden: out of the tab order and the accessibility tree), so the list has the whole panel. */}
      <div className="composer-dock" ref={setDockEl} hidden={open} />
      <div className="wl-wrap" id="waitlist">
        <button
          type="button"
          className="wl-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span>
            <NoBreak>{en.waitlist.toggle}</NoBreak>
          </span>
          <ChevronIcon dir="down" />
        </button>
        <div id={panelId} hidden={!open}>
          <WaitlistForm carriedCaseType={carried} headingRef={headingRef} />
        </div>
      </div>
    </div>
  );
}
